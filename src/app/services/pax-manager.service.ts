import { Injectable } from "@angular/core";
import { addDoc, doc, Firestore, setDoc, getDoc, collection, CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, getCountFromServer, query, deleteDoc } from "@angular/fire/firestore";
import { IPaxUser, PaxUser } from "../models/users.model";
import { PaxModelConverter } from "../utils/pax-model.converter";

@Injectable({
  providedIn: 'root'
})
export class PaxManagerService {

  paxConverter = this.paxModelConverter.getConverter();

  constructor(private readonly firestore: Firestore, private paxModelConverter: PaxModelConverter) { 
  }

  public async addNewUser(user: Partial<IPaxUser>): Promise<DocumentReference<DocumentData>> {
    const userCollection: CollectionReference = collection(this.firestore, 'users').withConverter(this.paxConverter);
    return await addDoc(userCollection, user);
  }

  public async getPaxInfoByRef(ref: DocumentReference<PaxUser>) {
    const documentReference = ref.withConverter(this.paxConverter);
    return (await getDoc(documentReference)).data();
  }

  public async getCurrentNumberOfPax(): Promise<number> {
    const userCollection: CollectionReference = collection(this.firestore, 'users');
    const q = query(userCollection)
    return (await getCountFromServer(q)).data().count;
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

  public getUserReference(databaseLocation: string): DocumentReference<PaxUser> | null {
    if (databaseLocation) {
      return doc(this.firestore, databaseLocation).withConverter(this.paxConverter);
    }
    return null;
  }
}
