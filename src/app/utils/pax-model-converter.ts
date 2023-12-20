import { DocumentData, QueryDocumentSnapshot, Timestamp } from "@angular/fire/firestore";
import { PhoneNumber } from "../models/phonenumber.model";
import { IPaxUserEntity, PaxUser } from "../models/users.model";

export const paxUserConverter = {
  toFirestore: (data: PaxUser): DocumentData => {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber ? data.phoneNumber.toDashedForm() : '',
      email: data.email,
      f3Name: data.f3Name,
      f3NameLowercase: data.f3Name.toLowerCase(),
      joinDate: Timestamp.fromDate(data.joinDate),
    }
  },
  fromFirestore: (snap: QueryDocumentSnapshot): PaxUser => {
    const data: IPaxUserEntity = snap.data() as IPaxUserEntity;
    let phoneNumber = undefined;
    if (data.phoneNumber !== null && data.phoneNumber !== '') {
      let textPhoneNumberParts = data.phoneNumber.split("-");
      phoneNumber = new PhoneNumber(textPhoneNumberParts[0], textPhoneNumberParts[1], textPhoneNumberParts[2]);
    }
    return new PaxUser(snap.id, data.firstName, data.lastName, data.email, phoneNumber, data.f3Name, data.joinDate.toDate());
  }
}
