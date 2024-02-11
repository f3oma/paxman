import { Injectable, inject } from "@angular/core";
import { Firestore, collection, query, where, doc, getDocs, setDoc, DocumentReference, updateDoc, arrayUnion, getDoc } from "@angular/fire/firestore";
import { CommunityWorkoutData, ICommunityWorkoutData, ICommunityWorkoutDataEntity, IPersonalWorkoutData, IWorkoutDataBase, PreActivity } from "../models/workout.model";
import { PersonalWorkoutConverter } from "../utils/personal-workout.converter";
import { CommunityWorkoutConverter } from "../utils/community-workout.converter";
import { AOData } from "../models/ao.model";
import { PaxUser } from "../models/users.model";
import { AODataConverter } from "../utils/ao-data.converter";
import { PaxModelConverter } from "../utils/pax-model.converter";

@Injectable({
    providedIn: 'root'
})
export class WorkoutManagerService {

    /**
     * Two processes and two tables for workout data - Community Workout & Personal Workouts
     * 
     * First, self-reporting a workout. This records a user statistic 'Personal Workout' and marks attendance at
     * that location's 'Community Workout' for the date.
     * 
     * Second, Site-Q reported workout, or Community Workout. This records data for the entire 'Community Workout' and creates the
     * user statistic records - 'Personal Workout' for all the attending pax.
     */
    firestore: Firestore = inject(Firestore);
    communityWorkoutCollection = collection(this.firestore, 'workouts').withConverter(this.communityWorkoutConverter.getConverter());
    aoLocationCollection = collection(this.firestore, 'ao_data').withConverter(this.aoLocationConverter.getConverter());
    paxCollection = collection(this.firestore, 'users').withConverter(this.paxUserConverter.getConverter());
    currentYear = new Date().getFullYear();

    constructor(
        private readonly personalWorkoutConverter: PersonalWorkoutConverter,
        private readonly communityWorkoutConverter: CommunityWorkoutConverter,
        private readonly aoLocationConverter: AODataConverter,
        private readonly paxUserConverter: PaxModelConverter) {}

    public async createPersonalReportedWorkout(workoutReport: IPersonalWorkoutData, user: PaxUser) {
        // A self reported personal workout tries to create the community workout as well as an individual statistic records
        const currentUserRef: DocumentReference<PaxUser> = doc(this.paxCollection, user.id);
        const communityWorkoutRef = await this.createOrFindCommunityWorkout({ date: workoutReport.date, aoLocation: workoutReport.aoLocation, attendance: [], hadFNGs: false });
        await this.addUserToCommunityWorkoutAttendanceIfMissing(communityWorkoutRef, currentUserRef);
        await this.tryCreatePersonalWorkoutForUserRef(workoutReport, currentUserRef);
    }

    public async createSiteQReportedWorkout(workoutReport: ICommunityWorkoutData, user: PaxUser) {
        // Tries to create the community record, or update the data within. Creates individual workouts if they don't exist already
        const communityWorkoutRef = await this.createOrFindCommunityWorkout(workoutReport);
        await this.updateCommunityWorkoutData(workoutReport, communityWorkoutRef);
        for (let paxRef of workoutReport.attendance) {
            await this.tryCreatePersonalWorkoutForUserRef({ date: workoutReport.date, aoLocation: workoutReport.aoLocation, preActivity: PreActivity.None }, paxRef);
        }
    }

    public async updateCommunityWorkoutData(workoutData: ICommunityWorkoutData, docRef: DocumentReference<CommunityWorkoutData>) {
        // TODO: Update does not go through the converter...
        return await updateDoc(docRef, { ...workoutData });
    }

    // Checks whether a personal record currently exists or creates one
    private async tryCreatePersonalWorkoutForUserRef(workoutReport: IPersonalWorkoutData, userRef: DocumentReference<PaxUser>) {
        const startOfDate = workoutReport.date.setUTCHours(0,0,0,0);
        const endOfDate = new Date().setDate(workoutReport.date.getDate() + 1);
        const aoLocationRef = doc(this.aoLocationCollection, workoutReport.aoLocation.id);

        const userPersonalWorkoutCollection = collection(this.firestore, `users/${userRef.id}/personal_workout_logs_${this.currentYear}`).withConverter(this.personalWorkoutConverter.getConverter());

        const q = query(userPersonalWorkoutCollection, where("aoLocationRef", "==", aoLocationRef), where("date", '>', startOfDate), where("date", "<=", endOfDate));
        const docs = await getDocs(q);

        if (docs.empty) {
            // Create a new personal workout
            const newDocumentReference = doc(userPersonalWorkoutCollection);
            const workoutData: IPersonalWorkoutData = {
                date: workoutReport.date,
                aoLocation: workoutReport.aoLocation,
                preActivity: workoutReport.preActivity
            };
            return await setDoc(newDocumentReference, workoutData);
        }
    }

    // Tries to update an existing workout or create a new workout record
    private async createOrFindCommunityWorkout(workout: ICommunityWorkoutData): Promise<DocumentReference<CommunityWorkoutData>> {
        const startOfDate = workout.date.setUTCHours(0,0,0,0);
        const endOfDate = new Date().setDate(workout.date.getDate() + 1);

        const aoLocationRef = doc(this.aoLocationCollection, workout.aoLocation.id);
        const q = query(this.communityWorkoutCollection, where("aoLocationRef", "==", aoLocationRef), where("date", '>', startOfDate), where("date", "<=", endOfDate));
        const docs = await getDocs(q);

        if (docs.empty) {
            // Create a new community workout from the info we have...
            const newDocumentReference = doc(this.communityWorkoutCollection);
            const workoutData: ICommunityWorkoutData = {
                date: workout.date,
                aoLocation: workout.aoLocation,
                dailyQUserRef: workout.dailyQUserRef,
                coQUserRef: workout.coQUserRef,
                attendance: workout.attendance,
                hadFNGs: workout.hadFNGs
            };
            await setDoc(newDocumentReference, workoutData);
            return newDocumentReference;
        } else {
            // Found one, should only be one...
            const existingWorkoutReference = docs.docs[0].ref;
            return existingWorkoutReference;
        }
    }

    private async addUserToCommunityWorkoutAttendanceIfMissing(documentReference: DocumentReference<CommunityWorkoutData>, userRef: DocumentReference<PaxUser>): Promise<void> {
        const data = (await getDoc(documentReference)).data() as CommunityWorkoutData;
        if (!data.attendance.includes(userRef)) {
            return await updateDoc(documentReference, {
                attendance: arrayUnion(userRef)
            });
        }
    }

    deleteWorkout() {

    }
}