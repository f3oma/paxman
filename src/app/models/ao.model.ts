import { DocumentData, DocumentReference, Timestamp } from "firebase/firestore";
import { PaxUser } from "./users.model";

export enum Sector {
    'DC - East',
    'DC - West',
    'DC - South',
    'Sarpy'
}

export enum DayOfWeekAbbv {
    None = '',
    Sunday = 'Sun',
    Monday = 'Mon',
    Tuesday = 'Tues',
    Wednesday = 'Wed',
    Thursday = 'Thurs',
    Friday = 'Fri',
    Saturday = 'Sat'
}

export interface IAOData {
    id: string;
    name: string;
    address: string;
    location: string;
    popup: boolean;
    rotating: boolean;
    activeSiteQUsers: PaxUser[] | [];
    retiredSiteQUsers: PaxUser[] | [];
    foundingSiteQUsers: PaxUser[] | [];
    startTimeCST: string;
    xAccount: string;
    weekDay: DayOfWeekAbbv;
    sector: Sector;
}

export interface IAODataEntity {
    name: string;
    address: string;
    location: string;
    popup: boolean;
    rotating: boolean;
    activeSiteQUserRefs: DocumentReference<DocumentData>[];
    retiredSiteQUserRefs: DocumentReference<DocumentData>[];
    foundingSiteQUserRefs: DocumentReference<DocumentData>[];
    startTimeCST: string; // stored as '05:15'
    xAccount: string; // stored without @ symbol
    weekDay: string;
    sector: Sector;
}

export class AOData {
    private _id: string;
    private _name: string;
    private _address: string;
    private _location: string;
    private _popup: boolean;
    private _rotating: boolean;
    private _activeSiteQUsers: PaxUser[] | [];
    private _retiredSiteQUsers: PaxUser[] | [];
    private _foundingSiteQUsers: PaxUser[] | [];
    private _startTimeCST: string;
    private _xAccount: string;
    private _weekDay: DayOfWeekAbbv;
    private _sector: Sector;

    constructor(
        id: string,
        name: string, 
        address: string,
        location: string,
        popup: boolean,
        rotating: boolean,
        activeSiteQUsers: PaxUser[] | [],
        retiredSiteQUsers: PaxUser[] | [],
        foundingSiteQUsers: PaxUser[] | [],
        startTimeCST: string,
        xAccount: string,
        weekDay: DayOfWeekAbbv,
        sector: Sector) {
            this._id = id;
            this._name = name;
            this._address = address;
            this._location = location;
            this._popup = popup;
            this._rotating = rotating;
            this._activeSiteQUsers = activeSiteQUsers;
            this._retiredSiteQUsers = retiredSiteQUsers;
            this._foundingSiteQUsers = foundingSiteQUsers;
            this._startTimeCST = startTimeCST;
            this._xAccount = xAccount;
            this._weekDay = weekDay;
            this._sector = sector;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get address(): string {
        return this._address;
    }

    public get location(): string {
        return this._location;
    }

    public get popup(): boolean {
        return this._popup;
    }

    public get rotating(): boolean {
        return this._rotating;
    }

    public get activeSiteQUsers(): PaxUser[] | [] {
        return this._activeSiteQUsers;
    }

    public get retiredSiteQUsers(): PaxUser[] | [] {
        return this._retiredSiteQUsers;
    }

    public get foundingSiteQUsers(): PaxUser[] | [] {
        return this._foundingSiteQUsers;
    }

    public get startTimeCST(): string {
        return this._startTimeCST;
    }

    public get xAccount(): string {
        return this._xAccount;
    }

    public get weekDay(): DayOfWeekAbbv {
        return this._weekDay;
    }

    public get sector(): Sector {
        return this._sector;
    }

    toProperties(): IAOData {
        return {
            id: this.id,
            name: this.name,
            address: this.address,
            location: this.location,
            popup: this.popup,
            rotating: this.rotating,
            activeSiteQUsers: this.activeSiteQUsers,
            retiredSiteQUsers: this.retiredSiteQUsers,
            foundingSiteQUsers: this.foundingSiteQUsers,
            startTimeCST: this.startTimeCST,
            xAccount: this.xAccount,
            weekDay: this.weekDay,
            sector: this.sector
        }
    }

}