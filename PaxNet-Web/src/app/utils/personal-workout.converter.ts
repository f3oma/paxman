import { DocumentData, Firestore, QueryDocumentSnapshot, Timestamp, doc } from "@angular/fire/firestore";
import { Injectable, inject } from "@angular/core";
import { UserReportedWorkout, UserReportedWorkoutEntity } from "../models/beatdown-attendance";

@Injectable({
    providedIn: 'root'
})  
export class PersonalWorkoutConverter {
    
    firestore: Firestore = inject(Firestore);
    constructor() {}
  
    public getConverter() {
      return {
        toFirestore: (data: UserReportedWorkout): DocumentData => {
            if (!data.notes) {
                data.notes = '';
            }
            return <UserReportedWorkoutEntity> {
                date: Timestamp.fromDate(data.date),
                preActivity: data.preActivity,
                notes: data.notes,
            };
        },
        fromFirestore: (snap: QueryDocumentSnapshot): any => {
            const data: UserReportedWorkoutEntity = snap.data() as UserReportedWorkoutEntity;
            const beatdownRef = doc(this.firestore, `beatdowns/${snap.id}`);
            return <UserReportedWorkout> {
                beatdown: beatdownRef,
                date: data.date.toDate(),
                preActivity: data.preActivity,
                notes: data.notes
            };
        }
      }
    }
}
