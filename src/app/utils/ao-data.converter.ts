import { Injectable } from "@angular/core";
import { CollectionReference, DocumentData, DocumentReference, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, arrayUnion, collection, doc, getDoc } from "@angular/fire/firestore";
import { AOData, DayOfWeekAbbv, IAOData, IAODataEntity } from "../models/ao.model";
import { PaxModelConverter } from "./pax-model.converter";
import { PaxUser } from "../models/users.model";

@Injectable({
  providedIn: 'root'
})
export class AODataConverter {

  private paxUserCollection = collection(this.firestore, 'users');

  constructor(private readonly firestore: Firestore, private readonly paxModelConverter: PaxModelConverter) {}

  public getConverter(): FirestoreDataConverter<any> {
    const toDomain = this.toDomain;
    const toEntity = this.toEntity;
    const paxModelConverter = this.paxModelConverter;
    const paxUserCollection = this.paxUserCollection;
    return {
      toFirestore: (data: IAOData): DocumentData => {
        return toEntity(data, paxUserCollection);
      },
      fromFirestore(snap: QueryDocumentSnapshot) {
        return toDomain(snap.data() as IAODataEntity, snap.id, paxModelConverter);
      }
    }
  }

  toEntity(data: IAOData, paxUserCollection: CollectionReference<DocumentData>): IAODataEntity {
    let activeSiteQDataRefs: DocumentReference<DocumentData>[] = [];
    if ((data.activeSiteQUsers && data.activeSiteQUsers.length > 0)) {
      for (let siteQ of data.activeSiteQUsers) {
        activeSiteQDataRefs.push(doc(paxUserCollection, siteQ.id));
      }
    }

    let retiredSiteQDataRefs: DocumentReference<DocumentData>[] = [];
    if ((data.retiredSiteQUsers && data.retiredSiteQUsers.length > 0)) {
      for (let siteQ of data.retiredSiteQUsers) {
        retiredSiteQDataRefs.push(doc(paxUserCollection, siteQ.id));
      }
    }

    let foundingSiteQDataRefs: DocumentReference<DocumentData>[] = [];
    if ((data.foundingSiteQUsers && data.foundingSiteQUsers.length > 0)) {
      for (let siteQ of data.foundingSiteQUsers) {
        foundingSiteQDataRefs.push(doc(paxUserCollection, siteQ.id));
      }
    }
    
    return <IAODataEntity> {
      name: data.name,
      address: data.address,
      location: data.location,
      popup: data.popup,
      rotating: data.rotating,
      activeSiteQUserRefs: activeSiteQDataRefs,
      retiredSiteQUserRefs: retiredSiteQDataRefs,
      foundingSiteQUserRefs: foundingSiteQDataRefs,
      startTimeCST: data.startTimeCST, 
      xAccount: data.xAccount,
      weekDay: data.weekDay.toString(),
      sector: data.sector
    }
  }

  async toDomain(data: IAODataEntity, id: string, paxModelConverter: PaxModelConverter): Promise<AOData> {
    let activeSiteQUsers: PaxUser[] = [];
    if (data.activeSiteQUserRefs && data.activeSiteQUserRefs.length > 0) {
      for (let siteQUserRef of data.activeSiteQUserRefs) {
        if (siteQUserRef !== null)
        activeSiteQUsers.push((await getDoc(siteQUserRef.withConverter(paxModelConverter.getConverter()))).data() as PaxUser);
      }
    }

    let retiredSiteQUsers: PaxUser[] = [];
    if (data.retiredSiteQUserRefs && data.retiredSiteQUserRefs.length > 0) {
      for (let siteQUserRef of data.retiredSiteQUserRefs) {
        if (siteQUserRef !== null)
        retiredSiteQUsers.push((await getDoc(siteQUserRef.withConverter(paxModelConverter.getConverter()))).data() as PaxUser);
      }
    }

    let foundingSiteQUsers: PaxUser[] = [];
    if (data.foundingSiteQUserRefs && data.foundingSiteQUserRefs.length > 0) {
      for (let siteQUserRef of data.foundingSiteQUserRefs) {
        if (siteQUserRef !== null)
        foundingSiteQUsers.push((await getDoc(siteQUserRef.withConverter(paxModelConverter.getConverter()))).data() as PaxUser);
      }
    }

    const weekDay: DayOfWeekAbbv = data.weekDay as DayOfWeekAbbv;
    return new AOData(id, data.name, data.address, data.location, data.popup, data.rotating, activeSiteQUsers, retiredSiteQUsers, foundingSiteQUsers, data.startTimeCST, data.xAccount, weekDay, data.sector);
  }
}