import { Injectable, inject } from "@angular/core";
import { BaseChallenge, ChallengeState } from "../models/user-challenge.model";
import { UserProfileService } from "./user-profile.service";
import { Badges, badgeFromChallengeName } from "../utils/badges";
import { DocumentData, Firestore, addDoc, and, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "@angular/fire/firestore";
import { UserChallengeConverter } from "../utils/user-challenge.converter";
import { PaxManagerService } from "./pax-manager.service";
import { Challenges } from "../utils/challenges";

@Injectable({
    providedIn: 'root'
})
export class ChallengeManager {
    firestore: Firestore = inject(Firestore);
    private challengeConverter = this.userChallengeConverter.getConverter();
    private UserChallengeCollection = collection(this.firestore, 'user_challenges').withConverter(this.challengeConverter);
    
    constructor(
        private paxManagerService: PaxManagerService,
        private userProfileService: UserProfileService,
        private userChallengeConverter: UserChallengeConverter) {}

    // Iterative challenges
    async startChallenge(challenge: BaseChallenge) {
        await addDoc(this.UserChallengeCollection, challenge);
    }

    async updateChallenge(challenge: BaseChallenge) {
        // Update db
        const ref = doc(this.UserChallengeCollection, challenge.id);
        await setDoc(ref, challenge);
    }

    async completeChallenge(challenge: BaseChallenge) {
        if (challenge.isComplete()) {
            challenge.updateState(ChallengeState.Completed);
            // Give user badge...
            const badgeFromChallenge = badgeFromChallengeName(challenge.name);
            await this.userProfileService.addBadgeToProfileInternal(badgeFromChallenge, challenge.paxUser.id);
        }
        await this.updateChallenge(challenge);
    }

    async withdrawUserFromChallenge(challenge: BaseChallenge) {
        const ref = doc(this.UserChallengeCollection, challenge.id);
        return await deleteDoc(ref);
    }

    async getActiveChallengesForUser(userId: string) {
        const userRef = this.paxManagerService.getUserReference('users/' + userId);
        const q = query(this.UserChallengeCollection, and(where("paxUserRef", "==", userRef), where("state", "not-in", ["completed", "failed"])));
        const docs = Promise.all((await getDocs<Promise<BaseChallenge>, DocumentData>(q)).docs.map((d) => d.data()));
        return docs;
    }

    async getAllChallengeParticipants(challengeName: Challenges) {
        const q = query(this.UserChallengeCollection, and(where("name", "==", challengeName.toString())));
        const docs = Promise.all((await getDocs<Promise<BaseChallenge>, DocumentData>(q)).docs.map((d) => d.data()));
        return docs;
    }

    async getUserChallengeData(name: Challenges, userId: string): Promise<BaseChallenge | undefined> {
        const userRef = this.paxManagerService.getUserReference('users/' + userId);
        const q = query(this.UserChallengeCollection, and(where("name", "==", name.toString()), where("paxUserRef", "==", userRef)));
        const docs = await (await getDocs<Promise<BaseChallenge>, DocumentData>(q)).docs.map((d) => d.data())
        if (docs && docs.length === 1) {
            return docs[0];
        }
        return undefined;
    }
}