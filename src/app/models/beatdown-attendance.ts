import { DocumentReference, Timestamp } from "@angular/fire/firestore";
import { Beatdown } from "./beatdown.model";
import { PaxUser, UserRef } from "./users.model";

// Beatdown based attendance, larger scope
// Acts both as entity and domain obj
// Stored by BeatdownId
export interface IBeatdownAttendance {
    beatdown: DocumentReference<Beatdown>;
    fngCount: number;
    totalPaxCount: number;
    usersAttended: UserRef[];
    qReported: boolean;
}

// Personal attendance records
// PaxUser
   // Personal_Attendance Collection
       // 2024 - Record - Data: MyTotalAttendance
       // beatdownId - Record - Data: UserReportedWorkoutEntity
export interface UserReportedWorkout {
    beatdown: DocumentReference<Beatdown>;
    preActivity: PreActivity;
    date: Date;
    notes?: string;
}

export interface UserReportedWorkoutUI extends UserReportedWorkout {
    beatdownDomain: Beatdown;
}

export interface UserReportedWorkoutEntity {
    preActivity: PreActivity;
    date: Timestamp;
    notes?: string;
}

// Single record for all attendance counts by year
export interface MyTotalAttendance {
    beatdownsAttended: number;
    preactivitiesCompleted: number;
    favoriteActivity: string;
}


export enum PreActivity {
    None = "None",
    Run = "Run",
    Murph = "Murph",
    Smurph = "Smurph",
    Ruck = "Ruck",
    Bookclub = "Bookclub",
    Sandbags = "Sandbags",
    Other = "Other"
}
