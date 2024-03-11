import { DocumentData, DocumentReference, Timestamp } from "firebase-admin/firestore";

// To be kept in sync with beatdown model in PaxNet
export type UserRef = DocumentReference<DocumentData> | null;
export type AoLocationRef = DocumentReference<DocumentData> | null;

export enum SpecialEventType {
    Anniversary = 'Anniversary',
    VQ = 'VQ',
    SiteLaunch = 'SiteLaunch',
    FlagPass = 'FlagPass',
    Popup = 'Popup',
    CommunityEvent = 'CommunityEvent',
    None = 'None',
}

// Beatdown is defined as a single workout / custom event. Beatdown
// takes place on a date and at a location. If location is not an AO,
// an address must be defined. If event is a popup event, a name must be
// defined.
export interface IBeatdownEntity {
    date: Timestamp;
    qUserRef: UserRef;
    specialEvent: SpecialEventType;
    aoLocationRef: AoLocationRef; // null in case of popup
    coQUserRef: UserRef;
    eventName: string | null;
    eventAddress: string | null;
    additionalQsRefs?: Array<UserRef>, // community events might have many q's
}
