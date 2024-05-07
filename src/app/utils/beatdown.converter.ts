import { Injectable } from "@angular/core";
import { CollectionReference, DocumentData, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, Timestamp, collection, doc, getDoc } from "@angular/fire/firestore";
import { AODataConverter } from "./ao-data.converter";
import { PaxModelConverter } from "./pax-model.converter";
import { Beatdown, IBeatdown, IBeatdownEntity } from "../models/beatdown.model";
import { AOData, IAODataEntity } from "../models/ao.model";
import { PaxUser } from "../models/users.model";

@Injectable({
    providedIn: 'root'
})  
export class BeatdownConverter {
  
    private aoLocationCollection = collection(this.firestore, 'ao_data');
    private userCollection = collection(this.firestore, 'users');
    
    constructor(
        private readonly firestore: Firestore, 
        private readonly aoLocationConverter: AODataConverter,
        private readonly userConverter: PaxModelConverter) {}

    public getConverter(): FirestoreDataConverter<any> {
        const toDomain = this.toDomain;
        const toEntity = this.toEntity;
        const userConverter = this.userConverter;
        const aoConverter = this.aoLocationConverter;
        const aoCollection = this.aoLocationCollection;
        const userCollection = this.userCollection;
        return {
            toFirestore: (data: IBeatdown): DocumentData => {
            return toEntity(data, aoCollection, userCollection);
            },
            fromFirestore(snap: QueryDocumentSnapshot) {
            return toDomain(snap.data() as IBeatdownEntity, snap.id, userConverter, aoConverter);
            }
        }
    }

    public async toDomain(data: IBeatdownEntity, id: string, userConverter: PaxModelConverter, aoLocationConverter: AODataConverter) {
        let aoLocation: AOData | null = null;
        let qUser: PaxUser | undefined = undefined;
        let coQUser: PaxUser | undefined = undefined;
        let additionalQs: Array<PaxUser | undefined> = [];

        if (data.aoLocationRef) {
            aoLocation = await (await getDoc(data.aoLocationRef.withConverter(aoLocationConverter.getConverter()))).data();
        }

        if (data.qUserRef) {
             qUser = await (await getDoc(data.qUserRef.withConverter(userConverter.getConverter()))).data();
        }

        if (data.coQUserRef) {
            coQUser = await (await getDoc(data.coQUserRef.withConverter(userConverter.getConverter()))).data();
        }

        if (data.additionalQsRefs && data.additionalQsRefs.length) {
            for(let additionalQRef of data.additionalQsRefs) {
                if (!additionalQRef) {
                    continue;
                }
                additionalQs.push(await (await getDoc(additionalQRef.withConverter(userConverter.getConverter()))).data());
            }
        }

        if (!data.startTime) {
            if (aoLocation?.startTimeCST) {
                data.startTime = aoLocation.startTimeCST;
            } else {
                // Needs to be filled in...
                data.startTime = '';
            }
        }

        const dateTz = new Date(data.date.toMillis());
        dateTz.setHours(dateTz.getHours() + 5); // cst conversion, hacky

        return new Beatdown({
            id,
            aoLocation,
            qUser,
            date: dateTz,
            specialEvent: data.specialEvent,
            eventAddress: data.eventAddress,
            eventName: data.eventName,
            coQUser,
            additionalQs,
            canceled: data.canceled,
            startTime: data.startTime,
            aoName: data.aoName,
        });
    }

    public toEntity(data: IBeatdown, aoLocationCollection: CollectionReference, userCollection: CollectionReference) {
        let aoLocationRef = null;
        let qUserRef = null;
        let coQUserRef = null;
        let additionalQsRefs = [];

        if (data.aoLocation) {
            aoLocationRef = doc(aoLocationCollection, data.aoLocation.id);
        }

        if (data.qUser) {
            qUserRef = doc(userCollection, data.qUser.id);
        }

        if (data.coQUser) {
            coQUserRef = doc(userCollection, data.coQUser.id);
        }

        if (data.additionalQs && data.additionalQs.length > 0) {
            for (let additionalQ of data.additionalQs) {
                if (additionalQ) {
                    additionalQsRefs.push(doc(userCollection, additionalQ.id));
                }
            }
        }

        if (!data.startTime) {
            if (data.aoLocation) {
                data.startTime = data.aoLocation.startTimeCST;
            } else {
                data.startTime = '';
            }
        }

        // For undefined canceled in current records
        if (!data.canceled) {
            data.canceled = false;
        }

        return <IBeatdownEntity> {
            date: Timestamp.fromDate(data.date),
            aoLocationRef,
            qUserRef,
            coQUserRef,
            specialEvent: data.specialEvent,
            eventAddress: data.eventAddress,
            eventName: data.eventName,
            additionalQsRefs: additionalQsRefs,
            canceled: data.canceled,
            aoName: data.aoName === undefined ? null : data.aoName
        }
    }
}