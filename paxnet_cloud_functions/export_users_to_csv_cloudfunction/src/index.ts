import { http, Request, Response } from "@google-cloud/functions-framework";
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';

initializeApp();

const bucketName = "f3_omaha_daily_user_file";
const fileName = "user-export.csv";

http('backup', (_request: Request, response: Response) => {
  const db = getFirestore();
  const elements: any[] = [];
  const headers = {
      paxNumber: "Pax Number",
      firstName: "First Name",
      lastName: "Last Name",
      f3Name: "F3 Name",
      email: "Email",
      phoneNumber: "Phone Number",
      joinDate: "Join Date",
      notificationFrequency: "Notification Frequency"
  }
  const storage = new Storage();
  async function uploadFile() {
    // Uploads a local file to the bucket
    await storage.bucket(bucketName).upload(fileName, {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      // By setting the option `destination`, you can change the name of the
      // object you are uploading to a bucket.
      metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        cacheControl: 'no-cache',
      },
    });
    console.log(`${fileName} uploaded to ${bucketName}.`);
  }

  db.collection('users').orderBy("paxNumber").get().then((snapshot: any) => {
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      elements.push({
        paxNumber: data.paxNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        f3Name: data.f3Name,
        email: data.hideContactInformation ? '' : data.email,
        phoneNumber: data.hideContactInformation ? '' : data.phoneNumber,
        joinDate: data.joinDate.toDate(),
        notificationFrequency: data.notificationFrequency ? data.notificationFrequency : ''
      });
    });

    console.log(elements.length);

    const csv = exportCSVFile(headers, elements);
    fs.writeFile(fileName, csv, function (err) {
      if (err) {
        console.error(err);
        throw err;
      }
      console.log("File saved");
      uploadFile().then(() => {
        response.status(200).send(csv);
      });
    })
  });
});

function exportCSVFile(headers: any, items: any[]) {
  const seperator = ",";
  const headers_csv = createHeaders(headers);
  const body = items.map(convertObjectsToCsv);

  const csv: string[] = [];
  return csv.concat([headers_csv]).concat(body).join("\n");

  function createHeaders(headers: any) {
    const header = Object.values(headers);
    return header.join(seperator);
  }
  
  function convertObjectsToCsv(obj: any) {
    const values = getValuesFromObject(obj);
    return values.join(seperator);
  }
  
  function getValuesFromObject(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return [];
    }
  
    const keys = Object.keys(obj);
    const values = [];
    for (let i = 0; i < keys.length; ++i) {
      values.push(obj[keys[i]]);
    }
    return values;
  }
}