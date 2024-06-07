import { Injectable, inject } from "@angular/core";
import { DocumentData, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, doc, getDoc } from "@angular/fire/firestore";
import { BaseChallenge, ChallengeType, IChallengeBase, IChallengeEntityBase, IIterativeCompletionChallengeEntity, IterativeCompletionChallenge } from "../models/user-challenge.model";
import { PaxModelConverter } from "./pax-model.converter";
import { PaxUser } from "../models/users.model";
import { ChallengeInformation, IterativeCompletionRequirements } from "./challenges";

@Injectable({
    providedIn: 'root'
})
export class ChallengeInformationConverter {
    
    firestore: Firestore = inject(Firestore);
    constructor() {}

    // In reality we really don't need a converter for this
    // the entity and domain should have basic types
    public getConverter(): FirestoreDataConverter<any> {
        const toDomain = this.toDomain;
        const toEntity = this.toEntity;
        return {
          toFirestore(data: ChallengeInformation): DocumentData {
            return toEntity(data);
          },
          fromFirestore(snap: QueryDocumentSnapshot) {
            return toDomain(snap.data() as ChallengeInformation, snap.id);
          }
        }
    }

    private toEntity(data: ChallengeInformation): DocumentData {
        let entity: ChallengeInformation = {
            description: data.description,
            name: data.name,
            status: data.status,
            type: data.type,
            startDateString: data.startDateString,
            endDateString: data.endDateString,
            imageSrc: data.imageSrc,
            completionRequirements: data.completionRequirements
        };
        return entity;
    }

    private toDomain(data: ChallengeInformation, id: string) {
        return {
            id,
            ...data
        };
    }
}