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
    lastFlagPass?: Date | null;
    launchDate?: Date | null;
    qSourceAvailable: boolean;
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
    lastFlagPass: Timestamp;
    launchDate: Timestamp;
    qSourceAvailable: boolean;
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
    private _lastFlagPass?: Date | null;
    private _launchDate?: Date | null;
    private _qSourceAvailable: boolean;

    constructor(data: IAOData) {
        this._id = data.id;
        this._name = data.name;
        this._address = data.address;
        this._location = data.location;
        this._popup = data.popup;
        this._rotating = data.rotating;
        this._activeSiteQUsers = data.activeSiteQUsers;
        this._retiredSiteQUsers = data.retiredSiteQUsers;
        this._foundingSiteQUsers = data.foundingSiteQUsers;
        this._startTimeCST = data.startTimeCST;
        this._xAccount = data.xAccount;
        this._weekDay = data.weekDay;
        this._sector = data.sector;
        this._lastFlagPass = data.lastFlagPass;
        this._launchDate = data.launchDate;
        this._qSourceAvailable = data.qSourceAvailable;
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

    public get lastFlagPass(): Date | null | undefined {
        return this._lastFlagPass;
    }

    public get launchDate(): Date | null | undefined {
        return this._launchDate;
    }

    public get qSourceAvailable(): boolean {
        return this._qSourceAvailable;
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
            sector: this.sector,
            lastFlagPass: this.lastFlagPass,
            launchDate: this.launchDate,
            qSourceAvailable: this.qSourceAvailable,
        }
    }

}