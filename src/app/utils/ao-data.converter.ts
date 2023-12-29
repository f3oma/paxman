import { Injectable } from "@angular/core";
import { DocumentData, Firestore, QueryDocumentSnapshot, collection, doc, getDoc } from "@angular/fire/firestore";
import { AOData, IAOData, IAODataEntity } from "../models/ao.model";
import { PaxModelConverter, paxUserConverter } from "./pax-model.converter";
import { PaxUser } from "../models/users.model";

@Injectable({
  providedIn: 'root'
})
export class AODataConverter {

  private paxUserCollection = collection(this.firestore, 'users');

  constructor(private readonly firestore: Firestore, private readonly paxModelConverter: PaxModelConverter) {}

  public getConverter() {
    return {
      toFirestore: (data: IAOData): DocumentData => {
        let siteQDataRef = null;
        if (data.siteQUser) {
          siteQDataRef = doc(this.paxUserCollection, data.siteQUser.id);
        }
        return <IAODataEntity> {
          name: data.name,
          address: data.address,
          popup: data.popup,
          siteQUserRef: siteQDataRef,
          startTimeCST: data.startTimeCST, 
          twitterAccount: data.twitterAccount,
          weekDay: data.weekDay
        }
      },
      fromFirestore: (snap: QueryDocumentSnapshot): AOData => {
          const data: IAODataEntity = snap.data() as IAODataEntity;
          let siteQUser = undefined;
          if (data.siteQUserRef) {
              getDoc(data.siteQUserRef.withConverter(this.paxModelConverter.getConverter())).then((res) => {
                  siteQUser = res.data() as PaxUser;
              });
          }
          return new AOData(snap.id, data.name, data.address, data.popup, siteQUser, data.startTimeCST, data.twitterAccount, data.weekDay, data.sector);
      }
    }
  }
}