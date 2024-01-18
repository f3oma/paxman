import { DocumentData, Firestore, QueryDocumentSnapshot, Timestamp, collection, doc, getDoc } from "@angular/fire/firestore";
import { CommunityWorkoutData, ICommunityWorkoutData, ICommunityWorkoutDataEntity } from "../models/workout.model";
import { Injectable } from "@angular/core";
import { AODataConverter } from "./ao-data.converter";
import { AOData } from "../models/ao.model";

@Injectable({
    providedIn: 'root'
})  
export class CommunityWorkoutConverter {
  
    private aoLocationCollection = collection(this.firestore, 'ao_data');
    constructor(private readonly firestore: Firestore, private readonly aoLocationConverter: AODataConverter) {}
  
    public getConverter() {
      return {
        toFirestore: (data: ICommunityWorkoutData): DocumentData => {
            let aoLocationRef = null;
            if (data.aoLocation) {
                aoLocationRef = doc(this.aoLocationCollection, data.aoLocation.id);
            }
            return <ICommunityWorkoutDataEntity> {
                date: Timestamp.fromDate(data.date),
                aoLocationRef,
                dailyQUserRef: data.dailyQUserRef,
                coQUserRef: data.coQUserRef,
                attendance: data.attendance,
                hadFNGs: data.hadFNGs
            }
        },
        fromFirestore: (snap: QueryDocumentSnapshot): any => {
            const data: ICommunityWorkoutDataEntity = snap.data() as ICommunityWorkoutDataEntity;
            let aoLocation: AOData | undefined = undefined;
            if (data.aoLocationRef) {
                getDoc(data.aoLocationRef.withConverter(this.aoLocationConverter.getConverter())).then((res) => {
                    aoLocation = res.data() as AOData;
                });
            }

            return new CommunityWorkoutData(
                snap.id, 
                data.date.toDate(), 
                aoLocation!, 
                data.dailyQUserRef,
                data.coQUserRef,
                data.attendance,
                data.hadFNGs);
        }
      }
    }
}
