import { Injectable } from "@angular/core";
import { CollectionReference, DocumentData, DocumentReference, Firestore, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "@angular/fire/firestore";
import { IPaxUserEntity, PaxUser, UserRef } from "../models/users.model";
import { Badge, IUserProfileDataEntity, UserProfileData } from "../models/user-profile-data.model";
import { PaxManagerService } from "./pax-manager.service";
import { PaxModelConverter } from "../utils/pax-model.converter";

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {

    private userProfileCollection: CollectionReference = collection(this.firestore, 'user_profile_data');
    private readonly defaultProfileData: UserProfileData = {
        links: {},
        badges: [],
        countOfEHUsers: 0,
        ehUsers: []
    }

    constructor(
        private readonly firestore: Firestore, 
        private paxManagerService: PaxManagerService,
        private paxConverter: PaxModelConverter) {
    }

    async getOrCreateUserProfileById(id: string): Promise<UserProfileData | null> {
        const userProfile = await this.getProfileByUserId(id);
        if (userProfile !== null) {
            return userProfile;
        } else {
            await this.createProfileData(id, this.defaultProfileData);
            return await this.getProfileByUserId(id);
        }
    }

    private async getProfileByUserId(userId: string) {
        const docRef = doc(this.userProfileCollection, userId);
        let getDocResponse = (await getDoc(docRef));
        if (getDocResponse.exists()) {
            let entity = getDocResponse.data() as IUserProfileDataEntity;
            
            // Quickly update the details before returning
            if (entity.countOfEHUsers > 0 && (!entity.ehUserRefs || entity.ehUserRefs.length === 0)) {
                console.log("Update time");
                await this.updateEHRefInfo(userId, entity, docRef);
                getDocResponse = (await getDoc(docRef))
                entity = getDocResponse.data() as IUserProfileDataEntity;
            }

            const users = await this.getUsersFromRefs(entity.ehUserRefs);
            let profileData: UserProfileData = {
                badges: entity.badges,
                countOfEHUsers: entity.countOfEHUsers,
                links: entity.links,
                ehUsers: users
            };
            return profileData;
        } else {
            return null;
        }
    }

    private async getUsersFromRefs(userRefs: DocumentReference<DocumentData>[]) {
        const users: PaxUser[] = [];
        if (!userRefs || userRefs.length === 0) {
            return users;
        }
        for (let user of userRefs) {
            const data = (await getDoc(user.withConverter(this.paxConverter.getConverter()))).data() as PaxUser;
            users.push(data);
        }
        return users;
    }

    public async createProfileData(userId: string, profileData: UserProfileData) {
        const createReference = doc(this.userProfileCollection, userId);
        let profileDataEntity: Partial<IUserProfileDataEntity> = {
            badges: profileData.badges,
            links: profileData.links,
        };
        const pax = await this.paxManagerService.getAllEHRefsForUserId(userId);
        profileDataEntity.countOfEHUsers = pax.length;
        profileDataEntity.ehUserRefs = pax;
        return await setDoc(createReference, profileDataEntity);
    }

    private async updateEHRefInfo(
        userId: string, 
        profileDataEntity: Partial<IUserProfileDataEntity>,
        documentReference: DocumentReference) {
        const pax = await this.paxManagerService.getAllEHRefsForUserId(userId);
        profileDataEntity.countOfEHUsers = pax.length;
        profileDataEntity.ehUserRefs = pax;
        return await updateDoc(documentReference, profileDataEntity);
    }

    public async updateUserProfile(userId: string, profileData: Partial<UserProfileData> | null): Promise<void> {
        if (!profileData) {
            return;
        }

        let profileDataEntity: Partial<IUserProfileDataEntity> = {
            badges: profileData.badges,
            links: profileData.links,
        };

        // Update this while we're here...
        const pax = await this.paxManagerService.getAllEHRefsForUserId(userId);
        profileDataEntity.countOfEHUsers = pax.length;
        profileDataEntity.ehUserRefs = pax;
        
        const docRef = doc(this.userProfileCollection, userId);
        return await updateDoc(docRef, {
            ...profileDataEntity
        });
    }

    public async deleteUserProfile(userId: string) {
        const docRef = doc(this.userProfileCollection, userId);
        return await deleteDoc(docRef);
    }

    public async addBadgeToProfile(badge: Badge, userId: string) {
        await this.getOrCreateUserProfileById(userId);
        const docRef = doc(this.userProfileCollection, userId);
        return await updateDoc(docRef, {
            badges: arrayUnion(badge)
        });
    }

    public async removeBadgeFromProfile(badge: Badge, userId: string) {
        await this.getOrCreateUserProfileById(userId);
        const docRef = doc(this.userProfileCollection, userId);
        return await updateDoc(docRef, {
            badges: arrayRemove(badge)
        });
    }
}