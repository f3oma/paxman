import { Injectable } from "@angular/core";
import { addDoc, doc, Firestore, setDoc, getDoc, CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, getCountFromServer, query, deleteDoc, updateDoc, where, getDocs, or, Timestamp, and, orderBy, collection } from "@angular/fire/firestore";
import { AoLocationRef, UserRef, IPaxUser, PaxUser, NotificationFrequency } from "../models/users.model";
import { PaxModelConverter } from "../utils/pax-model.converter";
import { AOData } from "../models/ao.model";
import { AODataConverter } from "../utils/ao-data.converter";

export interface AnniversaryResponse {
    startDate: Date,
    endDate: Date,
    paxList: AnniversaryResponsePax[]
}

export interface AnniversaryResponsePax { 
  id: string, 
  f3Name: string, 
  fullName: string, 
  anniversaryYear: number, 
  joinDate: Date 
}

@Injectable({
  providedIn: 'root'
})
export class PaxManagerService {
  paxConverter = this.paxModelConverter.getConverter();
  locationConverter = this.locationModelConverter.getConverter();

  constructor(
    private readonly firestore: Firestore, 
    private paxModelConverter: PaxModelConverter,
    private locationModelConverter: AODataConverter) { 
  }

  public async addNewUser(user: Partial<IPaxUser>): Promise<DocumentReference<DocumentData>> {
    const userCollection: CollectionReference = collection(this.firestore, 'users').withConverter(this.paxConverter);
    return await addDoc(userCollection, user);
  }

  public async getPaxInfoByRef(ref: DocumentReference<PaxUser>) {
    const documentReference = ref.withConverter(this.paxConverter);
    return (await getDoc(documentReference)).data();
  }

  // Stores paxCount in localStorage to reduce number of fetches per client.
  // Updates count daily
  public async getCurrentNumberOfPax(): Promise<number> {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    const exisingPaxCountRefresh = localStorage.getItem('paxCountRefreshDate');
    const exisingPaxCount = localStorage.getItem('paxCount');

    if (exisingPaxCountRefresh && exisingPaxCount && new Date(exisingPaxCountRefresh) > yesterday) {
      return Number(exisingPaxCount);
    } else {
      const userCollection: CollectionReference = collection(this.firestore, 'users');
      const q = query(userCollection);
      const count = (await getCountFromServer(q)).data().count;
      localStorage.setItem('paxCount', count.toString());
      localStorage.setItem('paxCountRefreshDate', today.toDateString());
      return count;
    }
  }

  public async updateUser(user: Partial<PaxUser>) {
    const documentReference = doc(this.firestore, 'users', user.id!).withConverter(this.paxConverter);
    return await setDoc(documentReference, user, { merge: true });
  }

  public async getDataByAuthId(userId: string): Promise<DocumentSnapshot<PaxUser>> {
    const documentReference = doc(this.firestore, 'users', userId).withConverter(this.paxConverter);
    return await getDoc(documentReference);
  }

  public async deleteUser(user: IPaxUser) {
    const ref = doc(this.firestore, 'users', user.id!);
    return await deleteDoc(ref);
  }

  public getUserReference(databaseLocation: string): UserRef {
    if (databaseLocation) {
      return doc(this.firestore, databaseLocation).withConverter(this.paxConverter);
    }
    return null;
  }

  public async updateSiteQUserLocation(aoRef: DocumentReference<AOData>, userRef: DocumentReference<PaxUser>) {
    return await updateDoc(userRef, {
      siteQLocationRef: aoRef
    })
  }

  public async removeSiteQUserLocation(userId: string) {
    const userRef = this.getUserReference('users/' + userId) as DocumentReference<DocumentData>;
    return await updateDoc(userRef, {
      siteQLocationRef: null
    })
  }

  public async unsubscribeEmailsForUser(id: string) {
    const userRef = this.getUserReference('users/' + id) as DocumentReference<DocumentData>;
    return await updateDoc(userRef, {
      notificationFrequency: NotificationFrequency.None
    });
  }

  // Refreshes weekly pax daily
  public async getWeeklyPax(): Promise<{ id: string, f3Name: string, ehByUserRef: UserRef, ehLocationRef: AoLocationRef}[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    const weeklyPaxRefreshDate = localStorage.getItem('weeklyPaxDailyRefreshDate');
    const weeklyPax = localStorage.getItem('weeklyPax');

    if (weeklyPaxRefreshDate && weeklyPax && new Date(weeklyPaxRefreshDate) > yesterday) {
      const parsed = JSON.parse(weeklyPax);
      const weeklyUsersCached = [];
      for (let pax of parsed) {
        let ehByUserRef = null, ehLocationRef = null;
        if (pax.ehByUserRefPath) {
          ehByUserRef = this.getUserReference(pax.ehByUserRefPath);
        }
        if (pax.ehLocationRefPath)
          ehLocationRef = this.getLocationReference(pax.ehLocationRefPath);

        weeklyUsersCached.push({
          id: pax.id,
          f3Name: pax.f3Name,
          ehByUserRef: ehByUserRef,
          ehLocationRef: ehLocationRef
        });
      }
      return Promise.resolve(weeklyUsersCached);
    } else {
      var oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 3);
      const userCollection: CollectionReference = collection(this.firestore, 'users').withConverter(this.paxConverter);
      const q = query(userCollection, where("joinDate", ">", oneWeekAgo));
      const paxUsers: { id: string, f3Name: string, ehByUserRef: UserRef, ehLocationRef: AoLocationRef }[] = (await getDocs(q)).docs
        .map((doc) => doc.data() as PaxUser)
        .map((p) => {
          return {
            id: p.id,
            f3Name: p.f3Name,
            ehByUserRef: p.ehByUserRef,
            ehLocationRef: p.ehLocationRef
          }
        });
      const cachedPaxUsers = paxUsers.map((p) => {
        return { id: p.id, f3Name: p.f3Name, ehByUserRefPath: p.ehByUserRef?.path, ehLocationRefPath: p.ehLocationRef?.path };
      })
      localStorage.setItem('weeklyPax', JSON.stringify(cachedPaxUsers));
      localStorage.setItem('weeklyPaxDailyRefreshDate', today.toDateString());
      return paxUsers;
    }
  }

  // Weekly Anniversaries for the week
  // First checks if the data is locally cached on the user's system and needs refreshed.
  // If it's not cached, it will check if it's already been generated by someone else in the db and will return that data if yes
  // Lastly if neither of the above, it will calculate the weekly anniversaries for everyone and return the data
  async getWeeklyAnniversaryPax(): Promise<AnniversaryResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDay = today.getDate() - today.getDay();
    const weekStartDate = new Date(today.setDate(firstDay));
    const weekEndDate = new Date(today.setDate(weekStartDate.getDate()+6));

    const anniversaryString = weekStartDate.toISOString() + "-anniversaries";
    const weeklyAnniversaryDocRef = doc(this.firestore, 'anniversaries_cache/' + anniversaryString);
    const weeklyAnniversaryDoc = (await getDoc(weeklyAnniversaryDocRef));
    if (weeklyAnniversaryDoc.exists()) {
      const data = weeklyAnniversaryDoc.data();
      const jsonString = data['jsonString'];
      return JSON.parse(jsonString);
    } else {
      const anniversaries = await this.calculateAnniversaries(weekStartDate, weekEndDate);
      const anniversariesStringed = JSON.stringify(anniversaries);
      await setDoc(weeklyAnniversaryDocRef, { jsonString: anniversariesStringed });
      localStorage.setItem('weeklyAnniversaryPax', anniversariesStringed );
      localStorage.setItem('weeklyAnniversaryRefreshDate', weekEndDate.toDateString());
      return anniversaries;
    }
  }

  private async calculateAnniversaries(weekStartDate: Date, weekEndDate: Date): Promise<AnniversaryResponse> {
    const dates = this.getAnniversaryDates(weekStartDate);
    const userCollection: CollectionReference = collection(this.firestore, 'users').withConverter(this.paxConverter);
    let queryFilter1 = [];
    let queryFilter2 = [];
    for (let date of dates) {
      const statement = and(where("joinDate", ">=", date.startTime), where("joinDate", "<", date.endTime));
      if (queryFilter1.length < 24) {
        queryFilter1.push(statement)
      } else {
        queryFilter2.push(statement);
      }
    }

    // Need to split the queries into two due to number of queryFilters.
    const q1 = query(userCollection, or(...queryFilter1), orderBy("joinDate", "asc"));
    const q2 = query(userCollection, or(...queryFilter2), orderBy("joinDate", "asc"));

    const promise = await Promise.all([await getDocs(q1), await getDocs(q2)]);
    const paxList = [...promise[0].docs, ...promise[1].docs]
      .map((doc) => {
        return doc.data() as PaxUser
      })
      .map((p) => {
        const todayYear = new Date().getFullYear();
        const anniversaryDate = dates.find((d) => d.startTime.getDay() === p.joinDate.getDay() && d.startTime.getFullYear() === p.joinDate.getFullYear());
        const anniversaryYear = todayYear - anniversaryDate!.startTime.getFullYear();
        return {
          id: p.id,
          f3Name: p.f3Name,
          fullName: `${p.firstName} ${p.lastName}`, 
          anniversaryYear,
          joinDate: p.joinDate
        }
      });
    const response = {
      startDate: weekStartDate,
      endDate: weekEndDate,
      paxList
    };
    return response;
  }

  private getAnniversaryDates(weekStartDate: Date): { startTime: Date, endTime: Date }[] {

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date();
      nextDay.setDate(weekStartDate.getDate() + i);
      dates.push(nextDay);
    } 

    const anniversaryDates: { startTime: Date, endTime: Date}[] = [];
    for (let date of dates) {
      for (let i = 1; i < 7; i++) {
        const todayYear = date.getFullYear();
        const anniYearStart = new Date(date);
        const anniYearEnd = new Date(date);
        anniYearStart.setFullYear(todayYear - i);
        anniYearStart.setHours(0, 0, 0, 0);
        anniYearEnd.setFullYear(todayYear - i);
        anniYearEnd.setHours(11, 59, 59, 0);
        const timestampStart = anniYearStart;
        const timestampEnd = anniYearEnd;
        anniversaryDates.push({ startTime: timestampStart, endTime: timestampEnd });
      }
    }
    return anniversaryDates;
  }

  // Only Refs
  public async getAllEHRefsForUserId(userId: string): Promise<DocumentReference<DocumentData>[]> {
    const userCollection: CollectionReference = collection(this.firestore, 'users').withConverter(this.paxConverter);
    const userRef = doc(userCollection, userId);
    const q = (await query(userCollection, where("ehByUserRef", "==", userRef)));
    return (await getDocs(q)).docs.map((d) => d.ref);
  }

  // Actual Data Reads...
  public async getAllEHDataForUserId(userId: string): Promise<PaxUser[]> {
    const userCollection: CollectionReference = collection(this.firestore, 'users').withConverter(this.paxConverter);
    const userRef = doc(userCollection, userId);
    const q = (await query(userCollection, where("ehByUserRef", "==", userRef)));
    return (await getDocs(q)).docs.map((d) => d.data() as PaxUser);
  }

  private getLocationReference(aoDBPath: string) {
    return doc(this.firestore, aoDBPath) as AoLocationRef;
  }
}
