import { Injectable } from "@angular/core";
import { Firestore, addDoc, collection } from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root'
})
export class PaxWelcomeEmailService {

    constructor(private firestore: Firestore) {}

    async sendWelcomeEmailToPax(paxId: string, f3Name: string) {
        const mail = collection(this.firestore, "mail_outbox");
        await addDoc(mail, {
            toUids: [paxId],
            template: {
              name: "welcome_email",
              data: {
                userId: paxId,
                f3Name: f3Name
              },
            },
        })
    }
}