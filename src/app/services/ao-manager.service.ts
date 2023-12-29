import { Injectable } from "@angular/core";
import { DocumentData, DocumentReference, Firestore, collection, doc, getDocs } from "@angular/fire/firestore";
import { AOData, IAOData } from "../models/ao.model";
import { AODataConverter } from "../utils/ao-data.converter";

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
        return (await getDocs<AOData>(this.AOCollection)).docs.map((d) => d.data());
    }

    public getAoLocationReference(dbPath: string): DocumentReference<AOData> {
        return doc(this.firestore, dbPath).withConverter(this.aoConverter);
    }

}