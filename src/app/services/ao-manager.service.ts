import { Injectable, inject } from "@angular/core";
import { DocumentData, DocumentReference, Firestore, addDoc, collection, deleteField, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from "@angular/fire/firestore";
import { AOData, DayOfWeekAbbv, IAOData, IAODataEntity, Sector } from "../models/ao.model";
import { AODataConverter } from "../utils/ao-data.converter";
import { PaxUser } from "../models/users.model";
import { arrayUnion } from "firebase/firestore";

@Injectable({
    providedIn: 'root'
})
export class AOManagerService {
    firestore: Firestore = inject(Firestore);
    private aoConverter = this.aoDataConverter.getConverter();
    private AOCollection = collection(this.firestore, 'ao_data').withConverter(this.aoConverter);

    constructor(private aoDataConverter: AODataConverter) {}

    public async getAllAOData(): Promise<AOData[]> {
        const data = Promise.all((await getDocs<Promise<AOData>, DocumentData>(this.AOCollection)).docs.map((d) => d.data()));
        return data;
    }

    public getNewReference() {
        const collect = collection(this.firestore, 'ao_data').withConverter(this.aoConverter)
        return doc(collect);
    }

    public async addNewSite(site: IAOData) {
        let ref = null;
        if (site.id === '') {
            ref = this.getNewReference();
        } else {
            ref = this.getAoLocationReference(site.id);
        }
        return await setDoc(ref, site, { merge: true});
    }

    public get defaultNewAO(): AOData {
        // Create default site
        const ref = this.getNewReference();
        const aoData: IAOData = {
            id: ref.id,
            name: '',
            address: '',
            location: '',
            popup: false,
            rotating: false,
            activeSiteQUsers: new Array<PaxUser>(),
            retiredSiteQUsers: new Array<PaxUser>(),
            foundingSiteQUsers: new Array<PaxUser>(),
            startTimeCST: '00:00',
            xAccount: '',
            weekDay: DayOfWeekAbbv.None,
            sector: Sector['DC - East'],
            lastFlagPass: new Date(),
            launchDate: new Date(),
            qSourceAvailable: false,
        }
        return new AOData(aoData);
    }

    async getDataById(siteId: string) {
        const ref = this.getAoLocationReference(siteId);
        return await this.getDataByRef(ref);
    }

    public getAoLocationReference(dbPath: string): DocumentReference<AOData> {
        dbPath = dbPath.replace('ao_data/', '');
        return doc(this.AOCollection, dbPath);
    }

    public async updateActiveSiteQUsers(aoRef: DocumentReference<any>, userRef: DocumentReference<any>) {
        return await updateDoc(aoRef, {
            activeSiteQUserRefs: arrayUnion(userRef)
        });
    }

    public async getDataByRef(aoRef: DocumentReference<AOData, DocumentData>) {
        const ref = aoRef.withConverter(this.aoConverter);
        return (await getDoc(ref)).data() as AOData;
    }

    public async updateSiteData(site: IAOData) {
        const ref = this.getAoLocationReference(site.id);
        return await setDoc(ref, site, { merge: true });
    }
}