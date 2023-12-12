import { doc, QueryDocumentSnapshot, collection, DocumentData, Firestore } from "@angular/fire/firestore";
import { AuthenticatedUser, IAuthenticatedUser, IAuthenticatedUserEntity } from "../models/admin-user.model";
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
        return new AuthenticatedUser(data.id, data.email, data.paxDataId, undefined, data.roles);
      }
    }
  }
}
