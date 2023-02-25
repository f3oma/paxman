import { Injectable } from "@angular/core";
import { addDoc, Firestore } from "@angular/fire/firestore";
import { collection, DocumentReference } from "@firebase/firestore";
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

  getUserById(userId: string) {

  }

}
