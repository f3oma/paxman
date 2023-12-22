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
      ehByUserRef: data.ehByUserRef ?? null,
      activeUser: data.activeUser,
      hideContactInformation: data.hideContactInformation
    }
  },
  fromFirestore: (snap: QueryDocumentSnapshot): PaxUser => {
    const data: IPaxUserEntity = snap.data() as IPaxUserEntity;
    let phoneNumber = undefined;
    if (data.phoneNumber !== null && data.phoneNumber !== '') {
      let textPhoneNumberParts = data.phoneNumber.split("-");
      phoneNumber = new PhoneNumber(textPhoneNumberParts[0], textPhoneNumberParts[1], textPhoneNumberParts[2]);
    }

    console.log(data);

    // Adding new properties on user load
    if (data.activeUser === undefined) {
      // Assume all members are active unless modified
      data.activeUser = true;
    }

    if (data.hideContactInformation === undefined) {
      // Assume members allow contact unless modified
      data.hideContactInformation = false;
    }

    return new PaxUser(
      snap.id, 
      data.firstName, 
      data.lastName, 
      data.email, 
      phoneNumber, 
      data.f3Name, 
      data.joinDate.toDate(), 
      data.ehByUserRef,
      data.hideContactInformation,
      data.activeUser);
  }
}
