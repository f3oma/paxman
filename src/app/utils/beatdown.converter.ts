import { Injectable } from "@angular/core";
import { DocumentData, Firestore, QueryDocumentSnapshot, Timestamp, collection, doc, getDoc } from "@angular/fire/firestore";
import { AODataConverter } from "./ao-data.converter";
import { PaxModelConverter } from "./pax-model.converter";
import { Beatdown, IBeatdown, IBeatdownEntity } from "../models/beatdown.model";
import { AOData } from "../models/ao.model";
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
  
    public getConverter() {
      return {
        toFirestore: (data: IBeatdown): DocumentData => {
            let aoLocationRef = null;
            let qUserRef = null;
            let coQUserRef = null;

            if (data.aoLocation) {
                aoLocationRef = doc(this.aoLocationCollection, data.aoLocation.id);
            }

            if (data.qUser) {
                qUserRef = doc(this.userCollection, data.qUser.id);
            }

            if (data.coQUser) {
                coQUserRef = doc(this.userCollection, data.coQUser.id);
            }

            return <IBeatdownEntity> {
                date: Timestamp.fromDate(data.date),
                aoLocationRef,
                qUserRef,
                coQUserRef,
                specialEvent: data.specialEvent,
                eventAddress: data.eventAddress,
                eventName: data.eventName,
            }
        },
        fromFirestore: (snap: QueryDocumentSnapshot): any => {
            const data: IBeatdownEntity = snap.data() as IBeatdownEntity;
            let aoLocation: AOData | null = null;
            let qUser: PaxUser | undefined = undefined;
            let coQUser: PaxUser | null = null;

            if (data.aoLocationRef) {
                getDoc(data.aoLocationRef.withConverter(this.aoLocationConverter.getConverter())).then((res) => {
                    aoLocation = res.data() as AOData;
                });
            }

            if (data.qUserRef) {
                getDoc(data.qUserRef.withConverter(this.userConverter.getConverter())).then((res) => {
                    qUser = res.data() as PaxUser;
                });
            }

            if (data.coQUserRef) {
                getDoc(data.coQUserRef.withConverter(this.userConverter.getConverter())).then((res) => {
                    coQUser = res.data() as PaxUser;
                });
            }

            return new Beatdown({
                id: snap.id,
                aoLocation,
                qUser,
                date: data.date.toDate(),
                specialEvent: data.specialEvent,
                eventAddress: data.eventAddress,
                eventName: data.eventName,
                coQUser
            });
        }
      }
    }
}