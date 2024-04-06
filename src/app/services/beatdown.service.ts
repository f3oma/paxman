import { Injectable } from "@angular/core";
import { DocumentReference, Firestore, QueryCompositeFilterConstraint, QueryFieldFilterConstraint, addDoc, and, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where } from "@angular/fire/firestore";
import { BeatdownConverter } from "../utils/beatdown.converter";
import { Beatdown, IBeatdown, SpecialEventType } from "../models/beatdown.model";
import { AOData } from "../models/ao.model";

@Injectable({
    providedIn: 'root'
})
export class BeatdownService {

    beatdownCollection = 
        collection(this.firestore, 'beatdowns')
        .withConverter(this.beatdownConverter.getConverter())

    public EMPTY_BEATDOWN: IBeatdown = {
        id: '',
        date: new Date(),
        eventAddress: null,
        eventName: null,
        aoLocation: null,
        qUser: undefined,
        coQUser: undefined,
        additionalQs: [],
        specialEvent: SpecialEventType.None,
        canceled: false,
    }

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

    async getBeatdownsByAO(aoLocationRef: DocumentReference<AOData>, filters: QueryFieldFilterConstraint[]): Promise<Beatdown[]> {
        const beatdowns: Promise<Beatdown>[] = [];
        const aoRef = doc(this.firestore, `ao_data/${aoLocationRef.id}`);
        const q = query(this.beatdownCollection, and(where("aoLocationRef", "==", aoRef), ...filters), orderBy("date", "asc"));
        (await getDocs(q)).docs.forEach(async (d) => {
            beatdowns.push(d.data());
        });
        return Promise.all(beatdowns);
    }

    async createBeatdown(beatdown: Partial<IBeatdown>) {
        return await addDoc(this.beatdownCollection, beatdown)
    }

    async updateBeatdown(beatdown: IBeatdown) {
        const ref = doc(this.beatdownCollection, `${beatdown.id}`);
        return await setDoc(ref, beatdown, { merge: true });
    }

    async deleteBeatdown(beatdown: Beatdown) {
        const ref = doc(this.beatdownCollection, `${beatdown.id}`);
        return await deleteDoc(ref);
    }
}