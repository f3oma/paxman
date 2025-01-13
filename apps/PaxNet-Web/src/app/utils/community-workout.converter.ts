import { DocumentData, Firestore, QueryDocumentSnapshot, Timestamp, collection, doc, getDoc } from "@angular/fire/firestore";
import { Injectable } from "@angular/core";
import { AODataConverter } from "./ao-data.converter";
import { AOData } from "../models/ao.model";
import { IBeatdownAttendance } from "../models/beatdown-attendance";

@Injectable({
    providedIn: 'root'
})  
export class CommunityWorkoutConverter {
  
    constructor(private readonly firestore: Firestore) {}
  
    public getConverter() {
      return {
        toFirestore: (data: IBeatdownAttendance): DocumentData => {
            return <IBeatdownAttendance> {
                beatdown: data.beatdown,
                totalPaxCount: data.totalPaxCount,
                fngCount: data.fngCount,
                usersAttended: data.usersAttended,
                qReported: data.qReported,
            }
        },
        fromFirestore: (snap: QueryDocumentSnapshot): IBeatdownAttendance => {
            return snap.data() as IBeatdownAttendance;;
        }
      }
    }
}
