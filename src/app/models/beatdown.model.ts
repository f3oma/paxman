
// Beatdown 

import { Timestamp } from "@angular/fire/firestore";
import { AoLocationRef, PaxUser, UserRef } from "./users.model";
import { AOData } from "./ao.model";

export enum SpecialEventType {
    Anniversary = 'Anniversary',
    VQ = 'VQ',
    SiteLaunch = 'SiteLaunch',
    FlagPass = 'FlagPass',
    Popup = 'Popup',
    CommunityEvent = 'CommunityEvent',
    KidFriendly = 'KidFriendly',
    BirthdayQ = 'BirthdayQ',
    None = 'None',
}

// Beatdown is defined as a single workout / custom event. Beatdown
// takes place on a date and at a location. If location is not an AO,
// an address must be defined. If event is a popup event, a name must be
// defined.
export interface IBeatdown {
    id: string;
    date: Date;
    qUser?: PaxUser;
    specialEvent: SpecialEventType;
    aoLocation: AOData | null; // null in case of popup, in which we'd use an event name & address
    coQUser: PaxUser | undefined;
    eventName: string | null;
    eventAddress: string | null; // Required by user, nullable by system
    additionalQs?: Array<PaxUser | undefined>, // community events might have many q's
    canceled: boolean;
    startTime: string;
}

export interface IBeatdownEntity {
    date: Timestamp;
    qUserRef: UserRef;
    specialEvent: SpecialEventType;
    aoLocationRef: AoLocationRef; // null in case of popup
    coQUserRef: UserRef;
    eventName: string | null;
    eventAddress: string | null;
    additionalQsRefs?: Array<UserRef>; // community events might have many q's
    canceled: boolean;
    startTime: string;
}

export class Beatdown {
    private _id: string;
    private _date: Date;
    private _qUser: PaxUser | undefined;
    private _specialEvent: SpecialEventType;
    private _aoLocation: AOData | null; // null in case of popup
    private _coQUser: PaxUser | undefined;
    private _eventName: string | null;
    private _eventAddress: string | null;
    private _additionalQs?: Array<PaxUser | undefined>;
    private _canceled: boolean;
    private _startTime: string;

    constructor(beatdown: IBeatdown) {
        this._id = beatdown.id;
        this._aoLocation = beatdown.aoLocation;
        this._date = beatdown.date;
        this._qUser = beatdown.qUser;
        this._specialEvent = beatdown.specialEvent;
        this._coQUser = beatdown.coQUser;
        this._eventName = beatdown.eventName;
        this._eventAddress = beatdown.eventAddress;
        this._additionalQs = beatdown.additionalQs;
        this._canceled = beatdown.canceled;
        this._startTime = beatdown.startTime;
    }

    public get id(): string {
        return this._id;
    }

    public get date(): Date {
        return this._date;
    }

    public get qUser(): PaxUser | undefined {
        return this._qUser;
    }

    public get aoLocation(): AOData | null {
        return this._aoLocation;
    }

    public get specialEvent(): SpecialEventType {
        return this._specialEvent;
    }

    public get coQUser(): PaxUser | undefined {
        return this._coQUser;
    }

    public get eventName(): string | null {
        return this._eventName;
    }

    public get eventAddress(): string | null {
        return this._eventAddress;
    }

    public get isVQ(): boolean {
        return this.specialEvent == SpecialEventType.VQ;
    }

    public get isFlagPass(): boolean {
        return this.specialEvent == SpecialEventType.FlagPass;
    }

    public get isAnniversary(): boolean {
        return this.specialEvent == SpecialEventType.Anniversary;
    }

    public get isPopup(): boolean {
        return this.specialEvent == SpecialEventType.Popup;
    }

    public get isSiteLaunch(): boolean {
        return this.specialEvent == SpecialEventType.SiteLaunch;
    }

    public get isCommunityEvent(): boolean {
        return this.specialEvent == SpecialEventType.CommunityEvent;
    }

    public get isKidFriendly(): boolean {
        return this.specialEvent == SpecialEventType.KidFriendly;
    }

    public get isBirthdayQ(): boolean {
        return this.specialEvent == SpecialEventType.BirthdayQ;
    }

    public get isCanceled(): boolean {
        return this._canceled;
    }

    public get additionalQs(): Array<PaxUser | undefined> | undefined {
        return this._additionalQs;
    }

    public get startTime(): string {
        return this._startTime;
    }

    toProperties(): IBeatdown {
        return {
            id: this.id,
            date: this.date,
            specialEvent: this.specialEvent,
            eventAddress: this.eventAddress,
            eventName: this.eventName,
            coQUser: this.coQUser,
            aoLocation: this.aoLocation,
            qUser: this.qUser,
            additionalQs: this.additionalQs,
            canceled: this.isCanceled,
            startTime: this.startTime,
        };
    }
}

