import { DocumentData, QueryDocumentSnapshot, Timestamp } from "@angular/fire/firestore";
import { PhoneNumber } from "../models/phonenumber.model";
import { IPaxUser, IPaxUserEntity, NotificationFrequency, PaxUser } from "../models/users.model";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class PaxModelConverter {

  constructor() {}

  public getConverter() {

    return {
      toFirestore: (data: PaxUser): DocumentData => {

        let emergencyContact = undefined;
        if (data.emergencyContact) {
          emergencyContact = {
            name: data.emergencyContact.name,
            phoneNumber: data.emergencyContact.phoneNumber ? data.emergencyContact.phoneNumber.toDashedForm() : '',
          }
        }

        return <IPaxUserEntity> {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber ? data.phoneNumber.toDashedForm() : '',
          email: data.email,
          f3Name: data.f3Name,
          f3NameLowercase: data.f3Name.toLowerCase(),
          joinDate: Timestamp.fromDate(data.joinDate),
          ehByUserRef: data.ehByUserRef,
          activeUser: data.activeUser,
          hideContactInformation: data.hideContactInformation,
          paxNumber: data.paxNumber,
          notificationFrequency: data.notificationFrequency,
          ehLocationRef: data.ehLocationRef,
          siteQLocationRef: data.siteQLocationRef,
          birthday: data.birthday ? Timestamp.fromDate(data.birthday) : null,
          emergencyContact: emergencyContact,
          profilePhotoUrl: data.profilePhotoUrl !== undefined ? data.profilePhotoUrl : null,
        }
      },
      fromFirestore: (snap: QueryDocumentSnapshot): PaxUser => {
        const data: IPaxUserEntity = snap.data() as IPaxUserEntity;
        let phoneNumber = undefined;
        if (data.phoneNumber !== null && data.phoneNumber !== '') {
          let textPhoneNumberParts = data.phoneNumber.split("-");
          phoneNumber = new PhoneNumber(textPhoneNumberParts[0], textPhoneNumberParts[1], textPhoneNumberParts[2]);
        }

        // Adding new properties on user load
        if (data.activeUser === undefined) {
          // Assume all members are active unless modified
          data.activeUser = true;
        }
        if (data.hideContactInformation === undefined) {
          // Assume members allow contact unless modified
          data.hideContactInformation = false;
        }
        if (data.notificationFrequency === undefined) {
          // Assume members allow notifications unless modified
          data.notificationFrequency = NotificationFrequency.All;
        }

        let emergencyContact = undefined;
        if (!data.emergencyContact) {
          // Prefill with default values
          data.emergencyContact = {
            name: '',
            phoneNumber: ''
          }
        } else {
          if (data.emergencyContact.phoneNumber !== '') {
            let textPhoneNumberParts = data.emergencyContact.phoneNumber.split("-");
            const emergencyContactPhone = new PhoneNumber(textPhoneNumberParts[0], textPhoneNumberParts[1], textPhoneNumberParts[2]);
            emergencyContact = {
              name: data.emergencyContact.name,
              phoneNumber: emergencyContactPhone
            }
          }
        }

        if (!data.profilePhotoUrl) {
          data.profilePhotoUrl = undefined;
        }
    
        return new PaxUser(
          snap.id,
          <IPaxUser> {
            firstName: data.firstName, 
            lastName: data.lastName, 
            email: data.email, 
            phoneNumber: phoneNumber, 
            f3Name: data.f3Name, 
            joinDate: data.joinDate.toDate(), 
            ehByUserRef: data.ehByUserRef,
            hideContactInformation: data.hideContactInformation,
            activeUser: data.activeUser,
            paxNumber: data.paxNumber,
            notificationFrequency: data.notificationFrequency,
            ehLocationRef: data.ehLocationRef,
            authDataId: data.authDataId,
            siteQLocationRef: data.siteQLocationRef,
            birthday: !data.birthday ? null : data.birthday.toDate(),
            emergencyContact: emergencyContact,
            profilePhotoUrl: data.profilePhotoUrl,
          });
      }
    }
  }
}
