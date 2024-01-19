import { Component, Input } from '@angular/core';
import { IPaxUser } from 'src/app/models/users.model';
import { WorkoutManagerService } from 'src/app/services/workout-manager.service';

export interface DailyWorkoutReported {
  countPerDay: number;
}

@Component({
  selector: 'activity-graph',
  templateUrl: './activity-graph.component.html',
  styleUrls: ['./activity-graph.component.scss']
})
export class ActivityGraphComponent {

  @Input('user') user!: IPaxUser;
  workouts: DailyWorkoutReported[] = [];

  readonly MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",  "Oct",  "Nov",  "Dec"];
  public sortedMonths = this.MONTHS;

  constructor(private workoutService: WorkoutManagerService) {
    this.calculateChartFromCurrentDate([]);
  }

  getWorkoutLogs() {
    // this.workoutService.getYearlyWorkoutLogs()
  }

  calculateChartFromCurrentDate(workouts: DailyWorkoutReported[]) {
    const today = new Date();
    const month = today.getMonth() - 1; // -1 for idx
    const dayOfWeek = today.getDay();
    const date = today.getDate();
    const year = today.getFullYear();
    const daysInYear = this.getDaysInYear(today);

    const monthsInCurrentYear = [];
    // Get whatever months have already happened in current year
    for (let i = month; i >= 0; i--) {
      monthsInCurrentYear.push(i);
    }

    const monthsFromLastYear = []
    // Start from 12th month, go back and get any missing months
    for (let i = 11; i > month; i--) {
      monthsFromLastYear.push(i);
    }

    monthsInCurrentYear.sort((a, b) => a > b ? 1 : -1);
    monthsFromLastYear.sort((a, b) => a > b ? 1 : -1);

    let months = [...monthsFromLastYear, ...monthsInCurrentYear, monthsFromLastYear[0]];

    let sortedMonths: string[] = [];
    // Finally get month names
    for (let monthIdx of months) {
      const monthText = this.MONTHS[monthIdx];
      sortedMonths.push(monthText)
    }

    this.sortedMonths = sortedMonths;

    for (let i = 0; i < daysInYear - 1; i++) {
      this.workouts.push({
        countPerDay: Math.floor(Math.random() * 4)
      })
    }

  }

  getDaysInYear(today: Date) {
    if (this.isLeapYear(today.getFullYear())) {
      return 366;
    } else {
      return 365
    }
  }

  private isLeapYear(year: number) {
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
  }

}
