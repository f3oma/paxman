import { formatDate } from '@angular/common';
import { AfterViewInit, Component, Input } from '@angular/core';
import { PreActivity, UserReportedWorkout, UserReportedWorkoutUI } from 'src/app/models/beatdown-attendance';
import { Beatdown } from 'src/app/models/beatdown.model';
import { IPaxUser } from 'src/app/models/users.model';
import { BeatdownService } from 'src/app/services/beatdown.service';
import { WorkoutManagerService } from 'src/app/services/workout-manager.service';

export interface DailyWorkoutReported {
  countPerDay: number;
}


@Component({
  selector: 'activity-graph',
  templateUrl: './activity-graph.component.html',
  styleUrls: ['./activity-graph.component.scss']
})
export class ActivityGraphComponent implements AfterViewInit {

  @Input('user') user!: IPaxUser;
  workouts: DailyWorkoutReported[] = [];

  public sortedMonths: string[] = [];
  beatdownAttendance: UserReportedWorkout[] = [];
  monthsOut: number = 3;
  repeatedColumnsCount: number = this.monthsOut + 1;
  recentActivity: UserReportedWorkoutUI[] = [];
  loadingRecents = true;
  beatdownAttendanceCache: Map<number, UserReportedWorkout[]> = new Map();

  constructor(
    private workoutService: WorkoutManagerService,
    private beatdownService: BeatdownService) {
  }

  async ngAfterViewInit(): Promise<void> {
    await this.getBeatdownAttendanceLogs();
  }

  async adjustMonthsOut(monthsOut: number) {
    this.monthsOut = monthsOut;
    this.repeatedColumnsCount = monthsOut + 1;
    this.workouts = [];
    await this.getBeatdownAttendanceLogs();
  }

  async getBeatdownAttendanceLogs() {
    let beatdownAttendance: UserReportedWorkout[] = [];
    if (this.beatdownAttendanceCache.has(this.monthsOut)) {
      beatdownAttendance = this.beatdownAttendanceCache.get(this.monthsOut)!;
    } else {
      beatdownAttendance = await this.workoutService.getAllBeatdownAttendanceForUser(this.user.id);
      this.beatdownAttendanceCache.set(this.monthsOut, beatdownAttendance);
    }

    this.calculateChartFromCurrentDate(beatdownAttendance);
    await this.updateRecents(beatdownAttendance);
    this.loadingRecents = false;
  }

  async updateRecents(beatdownAttendance: UserReportedWorkout[]) {
    const recentActivity = beatdownAttendance.slice(0, 4);
    const recentActivityList = [];
    for (let activity of recentActivity) {
      const beatdownData = await this.beatdownService.getBeatdownDetail(activity.beatdown.id);
      if (!beatdownData)
        continue;

      recentActivityList.push({
        beatdown: activity.beatdown,
        date: activity.date,
        beatdownDomain: beatdownData,
        preActivity: activity.preActivity
      });
    }
    this.recentActivity = recentActivityList;
  }

  generateMonthHeaders(): string[] {
    const today = new Date();
    const monthsAgo = new Date();
    monthsAgo.setMonth(today.getMonth() - this.monthsOut);

    const months: string[] = [];
    while (monthsAgo <= today) {
      months.push(formatDate(monthsAgo, 'MMM', 'en'));
      monthsAgo.setMonth(monthsAgo.getMonth() + 1);
    }

    return months;
  }

  calculateChartFromCurrentDate(beatdownAttendance: UserReportedWorkout[]) {
    const today = new Date();
    today.setHours(23, 59, 59, 0);    
    var months = this.generateMonthHeaders();
    this.sortedMonths = months;
    
    const dayMap = this.mapToRelativeDay(beatdownAttendance, today);
    const values = [];
    for (let entry of dayMap.values())
      values.push({ countPerDay: entry})

    this.workouts = values;
  }

  daysSince(date: Date, currentDate: Date): number {
    const targetDate = new Date(date);
    const differenceInTime = currentDate.getTime() - targetDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  }

  mapToRelativeDay(dateItems: UserReportedWorkout[], currentDate: Date): Map<number, number> {
    const monthsOut = new Date();
    monthsOut.setMonth(currentDate.getMonth() - this.monthsOut);
    monthsOut.setDate(monthsOut.getDate() - monthsOut.getDay());
    monthsOut.setHours(0, 0, 0, 0);
    
    let daysSinceCount = this.daysSince(monthsOut, currentDate);

    // Relative Day to Workout Value
    const relativeDays: Map<number, number> = new Map<number, number>();
    // Pre-load
    // +1 to include the current date as well
    for (let i = 0; i < daysSinceCount; i++) {
      relativeDays.set(i, 0);
    }

    dateItems = dateItems.filter(a => a.date > monthsOut);

    dateItems.forEach(item => {
      item.date.setUTCHours(0, 0, 0, 0);
      const daysSinceDate = this.daysSince(item.date, currentDate);
      const relativeDay = daysSinceCount - daysSinceDate;
      const itemValue = item.preActivity != PreActivity.None ? 2 : 1;
      relativeDays.set(relativeDay, itemValue);
    });

    return relativeDays;
  }
}
