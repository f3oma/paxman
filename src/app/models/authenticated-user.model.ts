import { DocumentReference } from "@angular/fire/firestore";
import { PaxUser } from "./users.model";
import { AOData, IAODataEntity } from "./ao.model";

export enum UserRole {
  Admin = "admin",
  SiteQ = "site-q"
}

// stored in db
export interface IAuthenticatedUserEntity {
  id: string;
  email: string;
  paxDataId: string | undefined;
  roles: Array<string>;
  siteQLocationRef?: DocumentReference<AOData>;
}

export interface IAuthenticatedUser {
  id: string;
  email: string;
  paxDataId: string | undefined;
  paxData: PaxUser | undefined;
  roles: Array<UserRole>;
  siteQLocationRef?: DocumentReference<AOData>;
}

export class AuthenticatedUser {
  private _id: string;
  private _email: string;
  private _paxDataId: string | undefined;
  private _paxData: PaxUser | undefined;
  private _roles: Array<UserRole>;
  private _siteQLocationRef?: DocumentReference<AOData>;

  constructor(
    id: string, 
    email: string, 
    paxDataId?: string, 
    paxData?: PaxUser, 
    roles?: string[],
    siteQLocationRef?: DocumentReference<AOData>) {
    this._id = id;
    this._email = email;
    this._paxDataId = paxDataId;
    this._paxData = paxData;
    this._roles = roles ? roles.map((e) => e as UserRole) : [];
    this._siteQLocationRef = siteQLocationRef;
  }

  public get id(): string {
    return this._id;
  }

  public get email(): string {
    return this._email;
  }

  public get paxDataId(): string | undefined {
    return this._paxDataId;
  }

  public get paxData(): PaxUser | undefined {
    return this._paxData;
  }

  public set paxData(data: PaxUser | undefined) {
    this._paxData = data;
  }

  public get roles(): Array<UserRole> {
    return this._roles;
  }

  public get siteQLocationRef(): DocumentReference<AOData> | undefined {
    return this._siteQLocationRef;
  }

  public toProperties(): IAuthenticatedUser {
    return {
      id: this.id,
      paxData: this.paxData,
      paxDataId: this.paxDataId,
      email: this.email,
      roles: this.roles,
      siteQLocationRef: this.siteQLocationRef
    }
  }
}
