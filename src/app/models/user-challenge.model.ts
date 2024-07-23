import { Timestamp } from "firebase/firestore";
import { PaxUser, UserRef } from "./users.model";

export enum ChallengeType {
    IterativeCompletions = 'iterativeCompletions'
}

export enum ChallengeState {
    PreRegistered = 'pre-registered',
    NotStarted = 'not-started',
    InProgress = 'in-progress',
    Completed = 'completed',
    Failed = 'failed'
}

// Entities
export interface IChallengeEntityBase {
    paxUserRef: UserRef,
    name: string,
    type: ChallengeType,
    state: ChallengeState
    startDateString: string; // Format '07/01/2024'
    endDateString: string;
    endDateTime: Timestamp;
}
export interface IIterativeCompletionChallengeEntity extends IChallengeEntityBase {
    activeCompletions: number;
    totalToComplete: number;
}

// Domain
export interface IChallengeBase {
    id: string;
    paxUser: PaxUser,
    name: string,
    type: ChallengeType,
    state: ChallengeState
    startDateString: string;
    endDateString: string;
    endDateTime: Date;
}

export interface IIterativeCompletionChallenge extends IChallengeBase {
    activeCompletions: number;
    totalToComplete: number;
}

// Classes
export class BaseChallenge {
    private _id: string;
    private _paxUser: PaxUser;
    private _name: string;
    private _type: ChallengeType;
    private _state: ChallengeState;
    private _startDateString: string;
    private _endDateString: string;
    private _endDateTime: Date;

    constructor(
        id: string,
        paxUser: PaxUser, 
        name: string, 
        type: ChallengeType,
        state: ChallengeState,
        startDateString: string,
        endDateString: string,
        endDateTime: Date) {
        this._id = id;
        this._name = name;
        this._paxUser = paxUser;
        this._type = type;
        this._state = state;
        this._startDateString = startDateString;
        this._endDateString = endDateString;
        this._endDateTime = endDateTime;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get paxUser(): PaxUser {
        return this._paxUser;
    }

    get type(): ChallengeType {
        return this._type;
    }

    get state(): ChallengeState {
        return this._state;
    }

    get startDateString(): string {
        return this._startDateString;
    }

    get endDateString(): string {
        return this._endDateString;
    }

    get endDateTime(): Date {
        return this._endDateTime;
    }

    updateState(newState: ChallengeState): void {
        if (this._state !== ChallengeState.Completed)
            this._state = newState;
    }

    isComplete(): boolean {
        return this._state === ChallengeState.Completed;
    }

    toProperties(): IChallengeBase {
        return {
            id: this.id,
            paxUser: this.paxUser,
            name: this.name,
            type: this.type,
            state: this.state,
            startDateString: this.startDateString,
            endDateString: this.endDateString,
            endDateTime: this.endDateTime,
        }
    }
}

export class IterativeCompletionChallenge extends BaseChallenge {
    private _activeCompletions: number;
    private _totalToComplete: number;

    constructor(data: IIterativeCompletionChallenge) {
        super(data.id, data.paxUser, data.name, data.type, data.state, data.startDateString, data.endDateString, data.endDateTime);
        this._activeCompletions = data.activeCompletions;
        this._totalToComplete = data.totalToComplete;
    }

    get activeCompletions(): number {
        return this._activeCompletions;
    }

    get totalToComplete(): number {
        return this._totalToComplete;
    }

    addNewIteration() {
        this._activeCompletions++;
    }

    override isComplete(): boolean {
        return this._activeCompletions >= this.totalToComplete; 
    }

    override toProperties(): IIterativeCompletionChallenge {
        const baseProperties = super.toProperties();
        return {
            ...baseProperties,
            activeCompletions: this.activeCompletions,
            totalToComplete: this.totalToComplete
        }
    }
}