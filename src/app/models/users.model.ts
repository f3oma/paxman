import { DocumentReference, Timestamp } from "@angular/fire/firestore";
import { PhoneNumber } from "./phonenumber.model";
import { AOData } from "./ao.model";

export type EhUserRef = DocumentReference<PaxUser> | undefined | null;
export type AoLocationRef = DocumentReference<AOData> | undefined | null;

export enum NotificationFrequency {
  All = 'All',
  Important = 'Important',
  None = 'None'
}

export interface IClaimUserInfo {
  f3Name: string,
  phoneNumber: PhoneNumber | undefined,
  email: string;
}

export interface IPaxUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: PhoneNumber | undefined;
  f3Name: string;
  joinDate: Date;
  hideContactInformation: boolean;
  activeUser: boolean;
  paxNumber: number;
  sector: string;
  zipcode?: number | undefined;
  notificationFrequency: NotificationFrequency;
  authDataId?: string;

  // These references are slightly abnormal as we don't want to recursively get each pax's full data, I'm electing to just use their references here instead...
  ehByUserRef: EhUserRef; 
  ehLocationRef?: AoLocationRef;
}

export interface IPaxUserEntity {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  f3Name: string;
  f3NameLowercase: string;
  joinDate: Timestamp;
  hideContactInformation: boolean;
  activeUser: boolean;
  paxNumber: number;
  sector: string;
  zipcode?: number | undefined;
  notificationFrequency: NotificationFrequency;
  ehByUserRef: EhUserRef;
  ehLocationRef?: AoLocationRef;
  authDataId?: string;
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
  private _hideContactInformation: boolean;
  private _activeUser: boolean;
  private _paxNumber: number;
  private _sector: string;
  private _zipcode: number | undefined;
  private _notificationFrequency: NotificationFrequency;
  private _ehLocationRef: AoLocationRef;
  private _authDataId: string | undefined;

  constructor(
    id: string, 
    firstName: string, 
    lastName: string, 
    email: string, 
    phoneNumber: PhoneNumber | undefined, 
    f3Name: string,
    joinDate: Date,
    ehByUserRef: EhUserRef,
    hideContactInformation: boolean,
    activeUser: boolean,
    paxNumber: number,
    sector: string,
    zipcode: number | undefined,
    notificationFrequency: NotificationFrequency,
    ehLocationRef: AoLocationRef,
    authDataId: string | undefined) {
    this._id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._phoneNumber = phoneNumber;
    this._f3Name = f3Name;
    this._joinDate = joinDate;
    this._ehByUserRef = ehByUserRef;
    this._hideContactInformation = hideContactInformation;
    this._activeUser = activeUser;
    this._paxNumber = paxNumber;
    this._sector = sector;
    this._zipcode = zipcode;
    this._notificationFrequency = notificationFrequency;
    this._ehLocationRef = ehLocationRef;
    this._authDataId = authDataId;
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

  public get hideContactInformation(): boolean {
    return this._hideContactInformation;
  }

  public get activeUser(): boolean {
    return this._activeUser;
  }

  public get sector(): string {
    return this._sector;
  }

  public get paxNumber(): number {
    return this._paxNumber;
  }

  public get zipcode(): number | undefined {
    return this._zipcode;
  }

  public get notificationFrequency(): NotificationFrequency {
    return this._notificationFrequency;
  }

  public get ehLocationRef(): AoLocationRef {
    return this._ehLocationRef;
  }

  public get authDataId(): string | undefined {
    return this._authDataId;
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
      hideContactInformation: this.hideContactInformation,
      activeUser: this.activeUser,
      paxNumber: this.paxNumber,
      sector: this.sector,
      zipcode: this.zipcode,
      notificationFrequency: this.notificationFrequency,
      ehLocationRef: this.ehLocationRef,
    }
  }

}
