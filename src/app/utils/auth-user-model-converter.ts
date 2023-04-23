import { doc, getDoc, QueryDocumentSnapshot, collection, DocumentData, getFirestore, Firestore } from "@angular/fire/firestore";
import { AuthenticatedUser, IAuthenticatedUser, IAuthenticatedUserEntity } from "../models/admin-user.model";
import { paxUserConverter } from "./pax-model-converter";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationConverter {

  private authUserCollection = collection(this.firestore, 'authenticated_users');
  private paxUserCollection = collection(this.firestore, 'users');

  constructor(private firestore: Firestore) {}

  public getAuthenticationConverter() {
    return {
      toFirestore: (data: IAuthenticatedUser): DocumentData => {
        let paxDataRef = null;
        if (data.paxDataId) {
          paxDataRef = doc(this.paxUserCollection, data.paxDataId);
        }
        return {
          id: data.id,
          email: data.email,
          paxDataId: data.paxDataId ?? null,
          paxDataRef: paxDataRef,
          roles: data.roles
        }
      },
      fromFirestore: (snap: QueryDocumentSnapshot): any => {
        const data: IAuthenticatedUserEntity = snap.data() as IAuthenticatedUserEntity;
        if (data) {
          let paxDataRef = null;
          if (data.paxDataRef && data.paxDataRef !== undefined) {
            let paxData = undefined;
            paxDataRef = doc(this.paxUserCollection, data.paxDataId).withConverter(paxUserConverter);
            getDoc(paxDataRef!).then((result) => {
              paxData = result.data();
            });
            return new AuthenticatedUser(data.id, data.email, data.paxDataId, paxData, data.roles);
          }
          return new AuthenticatedUser(data.id, data.email, undefined, undefined, data.roles);
        }
        return undefined;
      }
    }
  }
}
