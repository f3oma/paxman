import { QueryDocumentSnapshot, Timestamp } from "@angular/fire/firestore";
import { PaxUser } from "../models/users.model";

export const paxUserConverter = {
  toFirestore: (data: PaxUser) => {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data?.phoneNumber ? data.phoneNumber.toDashedForm() : null,
      email: data.email,
      f3Name: data.f3Name.toLowerCase(),
      dateAdded: Timestamp.now()
    }
  },
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    snap.data() as PaxUser
}
