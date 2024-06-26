import { DocumentReference, Timestamp } from "@angular/fire/firestore";
import { PhoneNumber } from "./phonenumber.model";
import { AOData } from "./ao.model";

export type UserRef = DocumentReference<PaxUser> | null;
export type AoLocationRef = DocumentReference<AOData> | null;

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

export interface IEmergencyContact {
  name: string;
  phoneNumber: PhoneNumber | undefined;
}

export interface IEmergencyContactEntity {
  name: string;
  phoneNumber: string;
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
  notificationFrequency: NotificationFrequency;
  authDataId: string | null;

  // These references are slightly abnormal as we don't want to recursively get each pax's full data, I'm electing to just use their references here instead...
  ehByUserRef: UserRef; 
  ehLocationRef: AoLocationRef;
  siteQLocationRef: AoLocationRef;
  birthday: Date | null;
  emergencyContact: IEmergencyContact | undefined;
  profilePhotoUrl: string | undefined;
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
  notificationFrequency: NotificationFrequency;
  ehByUserRef: UserRef;
  ehLocationRef?: AoLocationRef;
  authDataId?: string;
  siteQLocationRef?: DocumentReference<AOData>;
  birthday: Timestamp | null;
  emergencyContact: IEmergencyContactEntity;
  profilePhotoUrl: string | undefined | null;
}

export class PaxUser {
  private _id: string;
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _phoneNumber: PhoneNumber | undefined;
  private _f3Name: string;
  private _joinDate: Date;
  private _ehByUserRef: UserRef;
  private _hideContactInformation: boolean;
  private _activeUser: boolean;
  private _paxNumber: number;
  private _notificationFrequency: NotificationFrequency;
  private _ehLocationRef: AoLocationRef;
  private _authDataId: string | null;
  private _siteQLocationRef: AoLocationRef;
  private _birthday: Date | null;
  private _emergencyContact: IEmergencyContact | undefined;
  private _profilePhotoUrl: string | undefined;

  constructor(
    id: string, 
    paxData: IPaxUser) {
    this._id = id;
    this._firstName = paxData.firstName;
    this._lastName = paxData.lastName;
    this._email = paxData.email;
    this._phoneNumber = paxData.phoneNumber;
    this._f3Name = paxData.f3Name;
    this._joinDate = paxData.joinDate;
    this._ehByUserRef = paxData.ehByUserRef;
    this._hideContactInformation = paxData.hideContactInformation;
    this._activeUser = paxData.activeUser;
    this._paxNumber = paxData.paxNumber;
    this._notificationFrequency = paxData.notificationFrequency;
    this._ehLocationRef = paxData.ehLocationRef;
    this._authDataId = paxData.authDataId;
    this._siteQLocationRef = paxData.siteQLocationRef;
    this._birthday = paxData.birthday;
    this._emergencyContact = paxData.emergencyContact;
    this._profilePhotoUrl = paxData.profilePhotoUrl;
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

  public get ehByUserRef(): UserRef {
    return this._ehByUserRef;
  }

  public get hideContactInformation(): boolean {
    return this._hideContactInformation;
  }

  public get activeUser(): boolean {
    return this._activeUser;
  }

  public get paxNumber(): number {
    return this._paxNumber;
  }

  public get notificationFrequency(): NotificationFrequency {
    return this._notificationFrequency;
  }

  public get ehLocationRef(): AoLocationRef {
    return this._ehLocationRef;
  }

  public get authDataId(): string | null {
    return this._authDataId;
  }

  public get siteQLocationRef(): AoLocationRef {
    return this._siteQLocationRef;
  }

  public get birthday(): Date | null {
    return this._birthday;
  }

  public get emergencyContact(): IEmergencyContact | undefined {
    return this._emergencyContact;
  }

  public get profilePhotoUrl(): string | undefined {
    return this._profilePhotoUrl;
  }

  public getLowercaseF3Name(): string {
    return this._f3Name.toLowerCase();
  }

  public isClaimed(): boolean {
    return this._authDataId !== undefined;
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
      notificationFrequency: this.notificationFrequency,
      ehLocationRef: this.ehLocationRef,
      siteQLocationRef: this.siteQLocationRef,
      authDataId: this.authDataId,
      birthday: this.birthday,
      emergencyContact: this.emergencyContact,
      profilePhotoUrl: this.profilePhotoUrl,
    }
  }
}
