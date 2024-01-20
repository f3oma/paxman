import { Injectable } from "@angular/core";
import { DocumentData, DocumentReference, Firestore, collection, deleteField, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from "@angular/fire/firestore";
import { AOData, IAOData, IAODataEntity } from "../models/ao.model";
import { AODataConverter } from "../utils/ao-data.converter";
import { PaxUser } from "../models/users.model";
import { arrayUnion } from "firebase/firestore";

@Injectable({
    providedIn: 'root'
})
export class AOManagerService {
    private aoConverter = this.aoDataConverter.getConverter();
    private AOCollection = collection(this.firestore, 'ao_data').withConverter(this.aoConverter);

    constructor(
        private firestore: Firestore,
        private aoDataConverter: AODataConverter) {}

    public async getAllAOData(): Promise<AOData[]> {
        const data = Promise.all((await getDocs<Promise<AOData>>(this.AOCollection)).docs.map((d) => d.data()));
        return data;
    }

    async getDataById(siteId: string) {
        const ref = this.getAoLocationReference(`ao_data/${siteId}`);
        return await this.getDataByRef(ref);
    }

    public getAoLocationReference(dbPath: string): DocumentReference<AOData> {
        return doc(this.firestore, dbPath).withConverter(this.aoConverter);
    }

    public async updateActiveSiteQUsers(aoRef: DocumentReference<any>, userRef: DocumentReference<any>) {
        return await updateDoc(aoRef, {
            activeSiteQUserRefs: arrayUnion(userRef)
        });
    }

    public async getDataByRef(aoRef: DocumentReference<AOData>) {
        return (await getDoc(aoRef)).data() as AOData;
    }

    public async updateSiteData(site: IAOData) {
        const ref = this.getAoLocationReference(`ao_data/${site.id}`);
        return await setDoc(ref, site, { merge: true });
    }
}