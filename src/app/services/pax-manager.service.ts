import { Injectable } from "@angular/core";
import { addDoc, doc, Firestore, setDoc, getDoc, collection, CollectionReference, DocumentData, DocumentReference, DocumentSnapshot } from "@angular/fire/firestore";
import { IPaxUser, PaxUser } from "../models/users.model";
import { paxUserConverter } from "../utils/pax-model-converter";


@Injectable({
  providedIn: 'root'
})
export class PaxManagerService {

  constructor(private firestore: Firestore) { }

  async addNewUser(user: Partial<IPaxUser>): Promise<DocumentReference<DocumentData>> {
    const userCollection: CollectionReference = collection(this.firestore, 'users').withConverter(paxUserConverter);
    return await addDoc(userCollection, user);
  }

  deleteUserById(userId: string) {

  }

  async updateUser(user: Partial<PaxUser>) {
    const documentReference = doc(this.firestore, 'users', user.id!)
      .withConverter(paxUserConverter);
    return await setDoc(documentReference, user, { merge: true });
  }

  async getDataByAuthId(userId: string): Promise<DocumentSnapshot<PaxUser>> {
    const documentReference = doc(this.firestore, 'users', userId).withConverter(paxUserConverter);
    return await getDoc(documentReference);
  }
}
