import { http, Request, Response } from "@google-cloud/functions-framework";
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp } from 'firebase-admin/firestore';
import { IBeatdownEntity, SpecialEventType } from "./models";

initializeApp();

const weekDayMap = new Map();
weekDayMap.set('Sun', 0);
weekDayMap.set('Mon', 1);
weekDayMap.set('Tues', 2);
weekDayMap.set('Wed', 3);
weekDayMap.set('Thurs', 4);
weekDayMap.set('Fri', 5);
weekDayMap.set('Sat', 6);

// Always runs on Sundays, this is required for date manipulation.
http('beatdown_autofill', (_request: Request, response: Response) => {
  const db: Firestore = getFirestore();
        
  const date = new Date();
  date.setMonth(date.getMonth() + 3);

  const beatdownCollection = db.collection("beatdowns");
  const batch = db.batch();
  db.collection('ao_data').where("popup", "==", false).get().then(async (snapshot: any) => {
    snapshot.forEach((doc: any) => {

      const threeMonthsOut = new Date(date);
      const firstDay = threeMonthsOut.getDate() - threeMonthsOut.getDay();

      const aoData = doc.data();
      let startTime = aoData.startTimeCST;
      const docRef = beatdownCollection.doc();

      if (startTime && startTime !== '' && startTime.includes(":") && !startTime.includes('Half')) {
        if (startTime.includes("&")) {
          startTime = startTime.split(" & ")[0];
        }
        const splitTime = startTime.split(":");
        const hours = Number(splitTime[0]);
        const minutes = Number(splitTime[1]);
        threeMonthsOut.setHours(hours, minutes, 0, 0);
      }

      if (aoData.weekDay) {
        const val = weekDayMap.get(aoData.weekDay);
        threeMonthsOut.setDate(firstDay + val);
      }

      console.log(threeMonthsOut, aoData.name);
      const beatdownEntity: IBeatdownEntity = {
        date: Timestamp.fromDate(threeMonthsOut),
        specialEvent: SpecialEventType.None,
        qUserRef: null,
        aoLocationRef: doc.ref,
        coQUserRef: null,
        eventName: null,
        eventAddress: aoData.address
      };
      batch.create(docRef, beatdownEntity);
    });
    await batch.commit();
    response.send("Complete").status(200);
  });
});