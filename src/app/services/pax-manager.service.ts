import { Injectable } from "@angular/core";
import { addDoc, doc, Firestore, getDoc } from "@angular/fire/firestore";
import { collection, DocumentReference, DocumentSnapshot } from "@firebase/firestore";
import { PaxUser } from "../models/users.model";
import { paxUserConverter } from "../utils/pax-model-converter";


@Injectable({
  providedIn: 'root'
})
export class PaxManagerService {

  constructor(private firestore: Firestore) { }

  async addNewUser(user: PaxUser): Promise<DocumentReference<PaxUser>> {
    const userCollection = collection(this.firestore, 'users').withConverter(paxUserConverter)
    return await addDoc(userCollection, user);
  }

  deleteUserById(userId: string) {

  }

  updateUser(user: Partial<PaxUser>) {

  }

  async getUserById(userId: string): Promise<DocumentSnapshot<PaxUser>> {
    const documentReference = doc(this.firestore, 'users', userId).withConverter(paxUserConverter);
    return await getDoc(documentReference);
  }
}
