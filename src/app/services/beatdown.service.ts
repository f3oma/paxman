import { Injectable } from "@angular/core";
import { Firestore, QueryCompositeFilterConstraint, QueryFieldFilterConstraint, addDoc, and, collection, doc, getDoc, getDocs, query, setDoc, where } from "@angular/fire/firestore";
import { BeatdownConverter } from "../utils/beatdown.converter";
import { Beatdown, IBeatdown } from "../models/beatdown.model";

@Injectable({
    providedIn: 'root'
})
export class BeatdownService {

    beatdownCollection = 
        collection(this.firestore, 'beatdowns')
        .withConverter(this.beatdownConverter.getConverter())

    constructor(
        private firestore: Firestore,
        private beatdownConverter: BeatdownConverter) {}

    async getBeatdownDetail(id: string): Promise<Beatdown | undefined> {
        const ref = doc(this.firestore, `beatdowns/${id}`);
        return (await getDoc(ref)).data() as Beatdown;
    }

    async getBeatdownsBetweenDates(startDate: Date, endDate: Date, filter: QueryFieldFilterConstraint[]): Promise<Beatdown[]> {
        const beatdowns: Promise<Beatdown>[] = [];
        const q = query(this.beatdownCollection, and(where("date", ">=", startDate), where("date", "<", endDate), ...filter));
        (await getDocs(q)).docs.forEach(async (d) => {
            beatdowns.push(d.data());
        });
        return Promise.all(beatdowns);
    }

    async getBeatdownsBetweenDatesByAO(startDate: Date, endDate: Date, aoLocationId: string) {
        const aoRef = doc(this.firestore, `ao_data/${aoLocationId}`);
        const q = query(this.beatdownCollection, and(
            where("date", ">=", startDate), 
            where("date", "<", endDate),
            where("aoLocationRef", "==", aoRef)));

        return (await getDocs(q)).docs.map((d) => d.data() as Beatdown);
    }

    async createBeatdown(beatdown: Partial<IBeatdown>) {
        return await addDoc(this.beatdownCollection, beatdown)
    }

    async updateBeatdown(beatdown: IBeatdown) {
        const ref = doc(this.firestore, `beatdowns/${beatdown.id}`);
        return await setDoc(ref, beatdown, { merge: true });
    }
}