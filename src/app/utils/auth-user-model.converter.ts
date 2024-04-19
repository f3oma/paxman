import { doc, QueryDocumentSnapshot, collection, DocumentData, Firestore } from "@angular/fire/firestore";
import { AuthenticatedUser, IAuthenticatedUser, IAuthenticatedUserEntity } from "../models/authenticated-user.model";
import { Injectable, inject } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationConverter {
  firestore: Firestore = inject(Firestore);
  private authUserCollection = collection(this.firestore, 'authenticated_users');
  private paxUserCollection = collection(this.firestore, 'users');

  constructor() {}

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
          roles: data.roles,
          siteQLocationRef: data.siteQLocationRef ?? null
        }
      },
      fromFirestore: (snap: QueryDocumentSnapshot): any => {
        const data: IAuthenticatedUserEntity = snap.data() as IAuthenticatedUserEntity;
        return new AuthenticatedUser(data.id, data.email, data.paxDataId, undefined, data.roles, data.siteQLocationRef);
      }
    }
  }
}
