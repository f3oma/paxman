import { Injectable } from "@angular/core";
import { DocumentData, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, collection, doc, getDoc } from "@angular/fire/firestore";
import { AOData, IAOData, IAODataEntity } from "../models/ao.model";
import { PaxModelConverter } from "./pax-model.converter";
import { PaxUser } from "../models/users.model";

@Injectable({
  providedIn: 'root'
})
export class AODataConverter {

  private paxUserCollection = collection(this.firestore, 'users');

  constructor(private readonly firestore: Firestore, private readonly paxModelConverter: PaxModelConverter) {}

  public getConverter(): FirestoreDataConverter<any> {
    const toDomain = this.toDomain;
    const toEntity = this.toEntity;
    const paxModelConverter = this.paxModelConverter;
    return {
      toFirestore: (data: IAOData): DocumentData => {
        return toEntity(data);
      },
      fromFirestore(snap: QueryDocumentSnapshot) {
        return toDomain(snap.data() as IAODataEntity, snap.id, paxModelConverter);
      }
    }
  }

  toEntity(data: IAOData): IAODataEntity {
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
  }

  async toDomain(data: IAODataEntity, id: string, paxModelConverter: PaxModelConverter): Promise<AOData> {
    let siteQUser = undefined;
    if (data.siteQUserRef) {
      siteQUser = (await getDoc(data.siteQUserRef.withConverter(paxModelConverter.getConverter()))).data() as PaxUser;
    }
    return new AOData(id, data.name, data.address, data.popup, siteQUser, data.startTimeCST, data.twitterAccount, data.weekDay, data.sector);
  }
}