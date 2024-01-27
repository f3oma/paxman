import { DocumentData, DocumentReference } from "firebase/firestore";
import { PaxUser } from "./users.model";

export interface IUserProfileDataEntity {
    links: Record<string, ExternalLink>;
    badges: Badge[];
    countOfEHUsers: number;
    ehUserRefs: DocumentReference<DocumentData>[];
}

export interface UserProfileData {
    links: Record<string, ExternalLink>;
    badges: Badge[];
    countOfEHUsers: number;
    ehUsers: PaxUser[];
}

interface ExternalLink {
    url: string;
}

export interface Badge {
    backgroundColor: string;
    text: string;
    textColor: string;
    backgroundImage?: string;
}
