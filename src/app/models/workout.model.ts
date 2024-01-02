import { DocumentReference, Timestamp } from "@angular/fire/firestore";
import { AOData } from "./ao.model";
import { PaxUser } from "./users.model";

export enum PreActivity {
    None = "None",
    Murph = "Murph",
    Ruck = "Ruck",
    Other = "Other"
}
export interface IWorkoutDataBase {
    date: Date;
    aoLocation: AOData; 
}

export interface IPersonalWorkoutData extends IWorkoutDataBase {
    preActivity: PreActivity;
}

export interface ICommunityWorkoutData extends IWorkoutDataBase {
    dailyQUserRef?: DocumentReference<PaxUser>;
    coQUserRef?: DocumentReference<PaxUser>;
    attendance: Array<DocumentReference<PaxUser>>;
    hadFNGs: boolean;
}

// DB Entities
export interface ICommunityWorkoutDataEntity {
    date: Timestamp;
    aoLocationRef: DocumentReference<AOData>;
    dailyQUserRef?: DocumentReference<PaxUser>; // Initially can be saved as empty and filled in later...
    coQUserRef?: DocumentReference<PaxUser>;
    attendance: Array<DocumentReference<PaxUser>>;
    hadFNGs: boolean;
}

export interface IPersonalWorkoutDataEntity {
    date: Timestamp;
    aoLocationRef: DocumentReference<AOData>;
    preActivity: PreActivity;
}

export class CommunityWorkoutData {
    private _id: string;
    private _date: Date;
    private _aoLocation: AOData;
    private _dailyQUserRef?: DocumentReference<PaxUser>;
    private _coQUserRef?: DocumentReference<PaxUser>;
    private _attendance: Array<DocumentReference<PaxUser>>;
    private _hadFNGs: boolean;

    constructor(
        id: string,
        date: Date, 
        aoLocation: AOData, 
        dailyQUserRef: DocumentReference<PaxUser> | undefined,
        coQUserRef: DocumentReference<PaxUser> | undefined,
        attendance: Array<DocumentReference<PaxUser>>,
        hadFNGs: boolean) {
            this._id = id;
            this._date = date;
            this._aoLocation = aoLocation;
            this._dailyQUserRef = dailyQUserRef;
            this._coQUserRef = coQUserRef;
            this._attendance = attendance;
            this._hadFNGs = hadFNGs;
    }

    public get id(): string {
        return this._id;
    }

    public get date(): Date {
        return this._date;
    }

    public get aoLocation(): AOData {
        return this._aoLocation;
    }

    public get dailyQUserRef(): DocumentReference<PaxUser> | undefined {
        return this._dailyQUserRef;
    }

    public get coQUserRef(): DocumentReference<PaxUser> | undefined {
        return this._coQUserRef;
    }

    public get attendance(): Array<DocumentReference<PaxUser>> {
        return this._attendance;
    }

    public get hadFNGs(): boolean {
        return this._hadFNGs;
    }
}

export class PersonalWorkoutData {
    private _id: string;
    private _date: Date;
    private _aoLocation: AOData;
    private _preActivity: PreActivity;

    constructor(
        id: string,
        date: Date, 
        aoLocation: AOData, 
        preActivity: PreActivity) {
            this._id = id;
            this._date = date;
            this._aoLocation = aoLocation;
            this._preActivity = preActivity;
    }

    public get id(): string {
        return this._id;
    }

    public get date(): Date {
        return this._date;
    }

    public get aoLocation(): AOData {
        return this._aoLocation;
    }

    public get preActivity(): PreActivity {
        return this._preActivity;
    }
}
