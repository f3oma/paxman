import { Injectable } from "@angular/core";
import { DocumentReference, Firestore, QueryFieldFilterConstraint, Timestamp, addDoc, and, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where, writeBatch } from "@angular/fire/firestore";
import { BeatdownConverter } from "../utils/beatdown.converter";
import { Beatdown, IBeatdown, IBeatdownEntity, SpecialEventType } from "../models/beatdown.model";
import { AOData, IAOData } from "../models/ao.model";
import { AOManagerService } from "./ao-manager.service";

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
        startTime: '',
    }

    constructor(
        private firestore: Firestore,
        private aoManagerService: AOManagerService,
        private beatdownConverter: BeatdownConverter) {}

    async getBeatdownDetail(id: string): Promise<Beatdown | undefined> {
        const ref = doc(this.firestore, `beatdowns/${id}`);
        return (await getDoc(ref)).data() as Beatdown;
    }

    async getBeatdownsBetweenDates(startDate: Date, endDate: Date, filter: QueryFieldFilterConstraint[]): Promise<Beatdown[]> {
        const beatdowns: Promise<Beatdown>[] = [];
        const q = query(this.beatdownCollection, and(where("date", ">=", startDate), where("date", "<", endDate), ...filter), orderBy("date", "asc"));
        (await getDocs(q)).docs.forEach(async (d) => {
            beatdowns.push(d.data());
        });
        return Promise.all(beatdowns);
    }

    async getBeatdownsByAO(aoLocationRef: DocumentReference<AOData>, filters: QueryFieldFilterConstraint[]): Promise<Beatdown[]> {
        const beatdowns: Promise<Beatdown>[] = [];
        const aoRef = doc(this.firestore, `ao_data/${aoLocationRef.id}`);
        const q = query(this.beatdownCollection, and(where("aoLocationRef", "==", aoRef), where("date", ">=", new Date()), ...filters), orderBy("date", "asc"));
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
        return await this.deleteBeatdownById(beatdown.id);
    }

    async deleteBeatdownById(id: string) {
        const ref = doc(this.beatdownCollection, id);
        return await deleteDoc(ref);
    }

    public async generateBeatdownsBetweenDates(aoData: IAOData | null, startWeek: Date, endWeek: Date) {
        // Generate weekly beatdowns for a location from start week to end week
        // If the endWeek date provided is less than the specified AO's week time, no beatdown will be created...
        if (!aoData || !aoData.weekDay) {
            throw new Error("AO Week Day is required to create scheduled beatdowns");
        }

        if (startWeek > endWeek)
            return;

        const weekDayMap = this.createDayMap();

        const startDayIdx = weekDayMap.get(aoData.weekDay);
        const batch = writeBatch(this.firestore);

        const aoRef = this.aoManagerService.getAoLocationReference('ao_data/' + aoData.id);
        const existingBeatdownDates = (await this.getBeatdownsByAO(aoRef, [])).map((v) => v.date.toDateString());

        const existingBeatdownDatesSet = new Set(existingBeatdownDates);

        startWeek.setHours(0, 0, 0);
        let currentAOBeatdownDate = new Date(startWeek.setDate(startWeek.getDate() - startWeek.getDay() + startDayIdx!));

        const nextWeek = 7;
        const beatdowns = collection(this.firestore, 'beatdowns');
        while (currentAOBeatdownDate <= endWeek) {

            // If we already have a beatdown this week, go to next week
            if (existingBeatdownDatesSet.has(currentAOBeatdownDate.toDateString())) {
                currentAOBeatdownDate = new Date(currentAOBeatdownDate.setDate(currentAOBeatdownDate.getDate() + nextWeek));
                continue;
            }

            const docRef = doc(beatdowns);
            const beatdownEntity: IBeatdownEntity = {
                date: Timestamp.fromDate(currentAOBeatdownDate),
                specialEvent: SpecialEventType.None,
                qUserRef: null,
                aoLocationRef: aoRef,
                coQUserRef: null,
                eventName: null,
                eventAddress: aoData.address,
                canceled: false,
                startTime: aoData.startTimeCST
            };
            batch.set(docRef, beatdownEntity);

            currentAOBeatdownDate = new Date(currentAOBeatdownDate.setDate(currentAOBeatdownDate.getDate() + nextWeek));
        }
        await batch.commit();
    }

    private createDayMap(): Map<string, number> {
        const weekDayMap = new Map();
        weekDayMap.set('Sun', 0);
        weekDayMap.set('Mon', 1);
        weekDayMap.set('Tues', 2);
        weekDayMap.set('Wed', 3);
        weekDayMap.set('Thurs', 4);
        weekDayMap.set('Fri', 5);
        weekDayMap.set('Sat', 6);
        return weekDayMap;
    }
}