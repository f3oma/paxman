import { Timestamp } from "@angular/fire/firestore";
import { PhoneNumber } from "./phonenumber.model";

export interface IPaxUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: PhoneNumber | undefined;
  f3Name: string;
  // ehLocation
  // ehUser
}

export interface IPaxUserEntity {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  f3Name: string;
  f3NameLowercase: string;
  dateAdded: Timestamp,
  // ehLocationRef
  // ehUserRef
}

export class PaxUser {
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _phoneNumber: PhoneNumber | undefined;
  private _f3Name: string;

  constructor(firstName: string, lastName: string, email: string, phoneNumber: PhoneNumber | undefined, f3Name: string) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._phoneNumber = phoneNumber;
    this._f3Name = f3Name;
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

  public getLowercaseF3Name(): string {
    return this._f3Name.toLowerCase();
  }

  public toProperties(): IPaxUser {
    return {
      f3Name: this.f3Name,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
    }
  }

}
