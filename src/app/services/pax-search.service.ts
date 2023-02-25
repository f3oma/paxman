import { Injectable } from "@angular/core";
import { Firestore, getDocs, QueryDocumentSnapshot } from "@angular/fire/firestore";
import { collection, query, where } from "@firebase/firestore";
import { PaxUser } from "../models/users.model";
import { paxUserConverter } from "../utils/pax-model-converter";

@Injectable({
  providedIn: 'root'
})
export class PaxSearchService {

  constructor(private firestore: Firestore) {

  }

  /**
   * @param f3Name Name provided to PAX at join time
   * @returns All PAX with the specified F3 Name, beware there could be multiple PAX with
   * the same name...
   */
  public async getPaxByF3Name(f3Name: string): Promise<PaxUser[]> {
    const lowercaseName = f3Name.toLowerCase();
    console.log(lowercaseName);
    const collectionRef = collection(this.firestore, 'users').withConverter(paxUserConverter);
    const q = query(collectionRef, where("f3Name", "==", lowercaseName));
    const querySnapshot = await getDocs(q);
    return [ ...querySnapshot.docs.map((doc) => doc.data())];
  }

}
