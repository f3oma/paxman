import { Injectable, inject } from "@angular/core";
import { CollectionReference, Firestore, addDoc, and, collection, doc, getDoc, getDocs, query, where } from "@angular/fire/firestore";
import { StatisticsService } from "../statistics.service";
import { WorkoutManagerService } from "../workout-manager.service";
import { TopLeaderboardResponse } from "src/app/models/statistics.model";
import { PaxManagerService } from "../pax-manager.service";
import { PaxModelConverter } from "src/app/utils/pax-model.converter";
import { PaxUser } from "src/app/models/users.model";

@Injectable({
    providedIn: 'root'
})
export class YearInReviewEmailService {
  firestore: Firestore = inject(Firestore);
  paxConverter = this.paxModelConverter.getConverter();

  constructor(
    private paxManagerService: PaxManagerService,
    private statisticsService: StatisticsService,
    private paxModelConverter: PaxModelConverter,
    private workoutManagerService: WorkoutManagerService) {}

    public async sendToAllUsers() {
        const aoStats = await this.statisticsService.getTop10Leaderboard();

        const userCollection: CollectionReference = collection(this.firestore, 'users').withConverter(this.paxConverter);
        const q = query(userCollection, where("notificationFrequency", "!=", "None"));
        const paxDocs = (await getDocs(q)).docs.map((d) => d.data() as PaxUser);

        const usersToSendTo = [];
        for (let found of paxDocs) {
            const yearlyAttendanceCountCollection = collection(this.firestore, `users/${found.id}/yearly_attendance_counts`);
            const attendenceDoc = doc(yearlyAttendanceCountCollection, "2024");
            const yearlyAttendance = await getDoc(attendenceDoc);
            if (yearlyAttendance.exists()) {
                usersToSendTo.push(found);
            }
        }
        
        const promises = [];
        for (let doc of usersToSendTo) {
            promises.push(this.send2024EndOfYearEmail(doc.id, doc.f3Name, aoStats!));
        }

        await Promise.all(promises);
        console.log ("DONE");
    }

    async send2024EndOfYearEmail(paxId: string, f3Name: string, leaderboard: TopLeaderboardResponse[]) {
        const mail = collection(this.firestore, "mail_outbox");
        const stats = await this.statisticsService.getUserStatistics(paxId);

        if (stats === undefined)
            return;

        const yearlyWorkoutData = await this.workoutManagerService.getTotalAttendanceDataForPax(paxId);

        // Personal data
        const workoutCount = stats.totalPosts.posts;
        const preActivityCount = yearlyWorkoutData.preactivitiesCompleted;
        const topSite1 = stats.topSites[0]?.aoName ?? '';
        const topSite1Count = stats.topSites[0]?.posts ?? 0;
        const topSite2 = stats.topSites[1]?.aoName ?? '';
        const topSite2Count = stats.topSites[1]?.posts ?? 0;
        const topSite3 = stats.topSites[2]?.aoName ?? '';
        const topSite3Count = stats.topSites[2]?.posts ?? 0;
        const favoriteDay = stats.favoriteDay[0].dayOfWeek;
        const workoutBuddy = stats.mostPostedWith[0].f3Name;

        // leaderboard
        const topPerson1 = leaderboard[0].f3Name;
        const topPerson1Count = leaderboard[0].posts;
        const topPerson2 = leaderboard[1].f3Name;
        const topPerson2Count = leaderboard[1].posts;
        const topPerson3 = leaderboard[2].f3Name;
        const topPerson3Count = leaderboard[2].posts;
        const topPerson4 = leaderboard[3].f3Name;
        const topPerson4Count = leaderboard[3].posts;
        const topPerson5 = leaderboard[4].f3Name;
        const topPerson5Count = leaderboard[4].posts;

        const url = "https://f3omaha.web.app/users/" + paxId + '/stats';

        // await addDoc(mail, {
        //     toUids: [paxId],
        //     template: {
        //         name: "2024_stats",
        //         data: {
        //         f3Name: f3Name,
        //         userId: paxId,
        //         workoutCount: workoutCount,
        //         preActivities: preActivityCount,
        //         topSite1: topSite1,
        //         topSite1Count: topSite1Count,
        //         topSite2: topSite2,
        //         topSite2Count: topSite2Count,
        //         topSite3: topSite3,
        //         topSite3Count: topSite3Count,
        //         favoriteDay: favoriteDay,
        //         workoutBuddy: workoutBuddy,
        //         topPerson1: topPerson1,
        //         topPerson1Count: topPerson1Count,
        //         topPerson2: topPerson2,
        //         topPerson2Count: topPerson2Count,
        //         topPerson3: topPerson3,
        //         topPerson3Count: topPerson3Count,
        //         topPerson4: topPerson4,
        //         topPerson4Count: topPerson4Count,
        //         topPerson5: topPerson5,
        //         topPerson5Count: topPerson5Count,
        //         url,
        //         },
        //     },
        // });
  }
}