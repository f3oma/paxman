import { DocumentData, Firestore, QueryDocumentSnapshot, Timestamp, collection, doc, getDoc } from "@angular/fire/firestore";
import { IPersonalWorkoutData, IPersonalWorkoutDataEntity, PersonalWorkoutData } from "../models/workout.model";
import { Injectable } from "@angular/core";
import { AODataConverter } from "./ao-data.converter";
import { AOData } from "../models/ao.model";

@Injectable({
    providedIn: 'root'
})  
export class PersonalWorkoutConverter {
  
    private aoLocationCollection = collection(this.firestore, 'ao_data');
    constructor(private readonly firestore: Firestore, private readonly aoLocationConverter: AODataConverter) {}
  
    public getConverter() {
      return {
        toFirestore: (data: IPersonalWorkoutData): DocumentData => {
            let aoLocationRef = null;
            if (data.aoLocation) {
                aoLocationRef = doc(this.aoLocationCollection, data.aoLocation.id);
            }
            return <IPersonalWorkoutDataEntity> {
                date: Timestamp.fromDate(data.date),
                aoLocationRef,
                preActivity: data.preActivity
            }
        },
        fromFirestore: (snap: QueryDocumentSnapshot): any => {
            const data: IPersonalWorkoutDataEntity = snap.data() as IPersonalWorkoutDataEntity;
            let aoLocation = undefined;
            if (data.aoLocationRef) {
                getDoc(data.aoLocationRef.withConverter(this.aoLocationConverter.getConverter())).then((res) => {
                    aoLocation = res.data() as AOData;
                });
            }

            return new PersonalWorkoutData(
                snap.id, 
                data.date.toDate(), 
                aoLocation!, 
                data.preActivity);
        }
      }
    }
}
