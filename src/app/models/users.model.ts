import { DocumentReference, Timestamp } from "@angular/fire/firestore";
import { PhoneNumber } from "./phonenumber.model";

export type EhUserRef = DocumentReference<PaxUser> | undefined | null;

export interface IPaxUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: PhoneNumber | undefined;
  f3Name: string;
  joinDate: Date;
  ehByUserRef: EhUserRef;
}

export interface IClaimUserInfo {
  f3Name: string,
  phoneNumber: PhoneNumber | undefined,
  email: string;
}

export interface IPaxUserEntity {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  f3Name: string;
  f3NameLowercase: string;
  joinDate: Timestamp;
  ehByUserRef: EhUserRef;
  // ehLocationRef
}

export class PaxUser {
  private _id: string;
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _phoneNumber: PhoneNumber | undefined;
  private _f3Name: string;
  private _joinDate: Date;
  private _ehByUserRef: EhUserRef;

  constructor(
    id: string, 
    firstName: string, 
    lastName: string, 
    email: string, 
    phoneNumber: PhoneNumber | undefined, 
    f3Name: string,
    joinDate: Date,
    ehByUserRef: EhUserRef) {
    this._id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._phoneNumber = phoneNumber;
    this._f3Name = f3Name;
    this._joinDate = joinDate;
    this._ehByUserRef = ehByUserRef;
  }

  public get id(): string {
    return this._id;
  }

  public get firstName(): string {
    return this._firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public get email(): string {
    return this._email;
  }

  public get phoneNumber(): PhoneNumber | undefined {
    return this._phoneNumber;
  }

  public get f3Name(): string {
    return this._f3Name;
  }

  public get joinDate(): Date {
    return this._joinDate;
  }

  public get ehByUserRef(): EhUserRef {
    return this._ehByUserRef;
  }

  public getLowercaseF3Name(): string {
    return this._f3Name.toLowerCase();
  }

  public toProperties(): IPaxUser {
    return {
      id: this.id,
      f3Name: this.f3Name,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      joinDate: this.joinDate,
      ehByUserRef: this.ehByUserRef,
    }
  }

}
