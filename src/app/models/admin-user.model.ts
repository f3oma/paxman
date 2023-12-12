import { DocumentReference } from "@angular/fire/firestore";
import { PaxUser } from "./users.model";

export enum UserRole {
  Admin = "admin",
  SiteQ = "site-q"
}

// stored in db
export interface IAuthenticatedUserEntity {
  id: string;
  email: string;
  paxDataId: string | undefined;
  paxDataRef: DocumentReference<PaxUser> | undefined;
  roles: Array<string>;
}

export interface IAuthenticatedUser {
  id: string;
  email: string;
  paxDataId: string | undefined;
  paxData: PaxUser | undefined;
  roles: Array<UserRole>;
}

export class AuthenticatedUser {
  private id: string;
  private email: string;
  private paxDataId: string | undefined;
  private paxData: PaxUser | undefined;
  private roles: Array<UserRole>;

  constructor(id: string, email: string, paxDataId?: string, paxData?: PaxUser, roles?: string[]) {
    this.id = id;
    this.email = email;
    this.paxDataId = paxDataId;
    this.paxData = paxData;
    this.roles = roles ? roles.map((e) => e as UserRole) : [];
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPaxDataId(): string | undefined {
    return this.paxDataId;
  }

  public getPaxData(): PaxUser | undefined {
    return this.paxData;
  }

  public getRoles(): Array<UserRole> {
    return this.roles;
  }

  public toProperties(): IAuthenticatedUser {
    return {
      id: this.id,
      paxData: this.paxData,
      paxDataId: this.paxDataId,
      email: this.email,
      roles: this.roles
    }
  }
}
