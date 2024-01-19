import { DocumentReference, Timestamp } from "firebase/firestore";
import { PaxUser } from "./users.model";

export enum Sector {
    'DC - East',
    'DC - West',
    'DC - South',
    'Sarpy'
}

export interface IAOData {
    id: string;
    name: string;
    address: string;
    popup: boolean;
    siteQUser: PaxUser | undefined;
    startTimeCST: string;
    xAccount: string;
    weekDay: string;
    sector: Sector;
}

export interface IAODataEntity {
    name: string;
    address: string;
    popup: boolean;
    siteQUserRef: DocumentReference<PaxUser>;
    startTimeCST: string; // stored as '05:15'
    xAccount: string; // stored with @ symbol
    weekDay: string;
    sector: Sector;
}

export class AOData {
    private _id: string;
    private _name: string;
    private _address: string;
    private _popup: boolean;
    private _siteQUser: PaxUser | undefined;
    private _startTimeCST: string;
    private _xAccount: string;
    private _weekDay: string;
    private _sector: Sector;

    constructor(
        id: string,
        name: string, 
        address: string,
        popup: boolean,
        siteQUser: PaxUser | undefined,
        startTimeCST: string,
        xAccount: string,
        weekDay: string,
        sector: Sector) {
            this._id = id;
            this._name = name;
            this._address = address;
            this._popup = popup;
            this._siteQUser = siteQUser;
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

    public get popup(): boolean {
        return this._popup;
    }

    public get siteQUser(): PaxUser | undefined {
        return this._siteQUser;
    }

    public get startTimeCST(): string {
        return this._startTimeCST;
    }

    public get xAccount(): string {
        return this._xAccount;
    }

    public get weekDay(): string {
        return this._weekDay;
    }

    public get sector(): Sector {
        return this._sector;
    }

}