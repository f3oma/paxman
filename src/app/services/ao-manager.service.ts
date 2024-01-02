import { Injectable } from "@angular/core";
import { DocumentData, DocumentReference, Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "@angular/fire/firestore";
import { AOData, IAOData } from "../models/ao.model";
import { AODataConverter } from "../utils/ao-data.converter";
import { PaxUser } from "../models/users.model";

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
        return Promise.all((await getDocs<Promise<AOData>>(this.AOCollection)).docs.map((d) => d.data()));
    }

    public getAoLocationReference(dbPath: string): DocumentReference<AOData> {
        return doc(this.firestore, dbPath).withConverter(this.aoConverter);
    }

    public async updateSiteQUser(aoRef: DocumentReference<any>, userRef: DocumentReference<any>) {
        return await updateDoc(aoRef, {
            siteQUserRef: userRef
        });
    }

    public async getDataByRef(aoRef: DocumentReference<AOData>) {
        return (await getDoc(aoRef)).data() as AOData;
    }

}