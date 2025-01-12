import { trigger, transition, useAnimation } from '@angular/animations';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { MyTotalAttendance, UserReportedWorkout } from 'src/app/models/beatdown-attendance';
import { FavoriteDayResponse, TopLeaderboardResponse, TopSiteAttendanceResponse, UserStatisticsResponse } from 'src/app/models/statistics.model';
import { IPaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { StatisticsService } from 'src/app/services/statistics.service';
import { WorkoutManagerService } from 'src/app/services/workout-manager.service';
import { fadeIn, fadeOut } from 'src/app/utils/animations';

@Component({
  selector: 'app-user-stats-view',
  templateUrl: './user-stats-view.component.html',
  styleUrls: ['./user-stats-view.component.scss'],
  animations: [
    trigger("profileAnimation", [
      transition("void => *", [useAnimation(fadeIn)]),
      transition("* => void", [useAnimation(fadeOut)]),
    ])
  ],
})
export class UserStatsViewComponent {
  loading = false;
  userDataSubject = new Subject<IPaxUser | undefined>();
  userData$: Observable<IPaxUser | undefined> = this.userDataSubject.asObservable();
  topTenLeaderboard: TopLeaderboardResponse[] | undefined;
  topSiteAttendance: TopSiteAttendanceResponse[] | undefined;
  userStatistics: UserStatisticsResponse | undefined;
  favoriteDayOfWeekLink: string = "";
  yearlyData: MyTotalAttendance | undefined;
  favoriteActivity: string | undefined;
  
  constructor(
    private paxManagerService: PaxManagerService, 
    private statisticsService: StatisticsService,
    private activatedRoute: ActivatedRoute,
  private workoutManagerService: WorkoutManagerService) {

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      this.initializeComponent(id);
      ;
    }
  }

  async initializeComponent(id: string) {
    this.loading = true;
    await Promise.all([
      this.getUserData(id),
      this.getUserStatistics(id),
      this.getViewData(),
    ]);
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  private async getUserStatistics(id: string) {
    this.userStatistics = await this.statisticsService.getUserStatistics(id);
    this.favoriteDayOfWeekLink = this.generateWeekLink(this.userStatistics?.favoriteDay!);
    this.yearlyData = await this.workoutManagerService.getTotalAttendanceDataForPax(id);
    if (this.yearlyData.favoriteActivity) {
      this.favoriteActivity = this.yearlyData.favoriteActivity;
    } else {
      await this.getFavoriteActivity(id);
    }
  }

  private async getFavoriteActivity(userId: string) {
    const beatdownData = await this.workoutManagerService.getAllBeatdownAttendanceForUser(userId);
    const preactivityMap = new Map<string, number>();
    for (let attendance of beatdownData) {
      if (preactivityMap.has(attendance.preActivity)) {
        preactivityMap.set(attendance.preActivity, preactivityMap.get(attendance.preActivity)! + 1);
      } else {
        preactivityMap.set(attendance.preActivity, 1);
      }
    }
    const [maxKey, maxValue] = [...preactivityMap.entries()].filter(key => key[0] !== 'None').reduce((max, entry) =>
        entry[1] > max[1] ? entry : max
    );
    this.favoriteActivity = maxKey;
    await this.workoutManagerService.updateFavoriteActivityForYear(userId, maxKey);
  }

  private async getViewData() {
    this.topTenLeaderboard = await this.statisticsService.getTop10Leaderboard();
    this.topSiteAttendance = await this.statisticsService.getTopSiteAttendance();
  }

  private async getUserData(id: string) {
    const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
    this.userDataSubject.next(paxData?.toProperties());
  }

  private generateWeekLink(weekData: FavoriteDayResponse[]) {
    const data = [];
    const labels = [];
    for (let day of weekData) {
      data.push(day.posts);
      labels.push(`"${day.dayOfWeek}"`);
    }
    return "https://quickchart.io/chart?c={type:'bar',data:{labels:[" + labels.map(l => `${l}`).toString() + "],datasets:[{label:'Posts',data:[" + data.toString() + "]}]}}";;
  }
}
