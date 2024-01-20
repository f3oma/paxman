import { Injectable } from "@angular/core";
import { CollectionReference, Firestore, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "@angular/fire/firestore";
import { PaxUser } from "../models/users.model";
import { Badge, UserProfileData } from "../models/user-profile-data.model";
import { PaxManagerService } from "./pax-manager.service";

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {

    private userCollection: CollectionReference = collection(this.firestore, 'user_profile_data');
    private readonly defaultProfileData: UserProfileData = {
        links: {},
        badges: [],
        countOfEHUsers: 0
    }

    constructor(private readonly firestore: Firestore, private paxManagerService: PaxManagerService) {}

    async getOrCreateUserProfileById(id: string): Promise<UserProfileData> {
        const userProfile = await this.getProfileByUserId(id);
        if (userProfile !== null) {
            return userProfile;
        } else {
            await this.createProfileData(id, this.defaultProfileData);
            return this.defaultProfileData;
        }
    }

    public async getProfileByPaxUser(paxUser: PaxUser) {
        return this.getProfileByUserId(paxUser.id);
    }

    public async getProfileByUserId(userId: string) {
        const docRef = doc(this.userCollection, userId);
        const getDocResponse = (await getDoc(docRef));
        if (getDocResponse.exists()) {
            return getDocResponse.data() as UserProfileData;
        } else {
            return null;
        }
    }

    public async createProfileData(userId: string, profileData: UserProfileData) {
        const createReference = doc(this.userCollection, userId);
        const paxCount = await this.paxManagerService.getNumberOfEHsByUserId(userId);
        profileData.countOfEHUsers = paxCount;
        return await setDoc(createReference, profileData);
    }

    public async updateUserProfile(userId: string, profileData: Partial<UserProfileData> | null): Promise<void> {
        if (!profileData) {
            return;
        }

        // Update this while we're here...
        const paxCount = await this.paxManagerService.getNumberOfEHsByUserId(userId);
        profileData.countOfEHUsers = paxCount;
        
        const docRef = doc(this.userCollection, userId);
        return await updateDoc(docRef, {
            ...profileData
        });
    }

    public async deleteUserProfile(userId: string) {
        const docRef = doc(this.userCollection, userId);
        return await deleteDoc(docRef);
    }

    public async addBadgeToProfile(badge: Badge, userId: string) {
        const profile = await this.getOrCreateUserProfileById(userId);
        const docRef = doc(this.userCollection, userId);
        return await updateDoc(docRef, {
            badges: arrayUnion(badge)
        });
    }

    public async removeBadgeFromProfile(badge: Badge, userId: string) {
        await this.getOrCreateUserProfileById(userId);
        const docRef = doc(this.userCollection, userId);
        return await updateDoc(docRef, {
            badges: arrayRemove(badge)
        });
    }
}