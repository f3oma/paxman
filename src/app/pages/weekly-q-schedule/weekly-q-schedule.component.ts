import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID } from '@angular/core';
import { Beatdown } from 'src/app/models/beatdown.model';
import { BeatdownService } from 'src/app/services/beatdown.service';

@Component({
  selector: 'app-weekly-q-schedule',
  templateUrl: './weekly-q-schedule.component.html',
  styleUrls: ['./weekly-q-schedule.component.scss']
})
export class WeeklyQScheduleComponent {

  weekRange: string = '';
  currentBeatdownList: Record<string, Beatdown[]> = {};
  dayMap: Map<number, string> = new Map();
  weekList: { dayName: string | undefined; date: Date; dateString: string }[] = [];
  loadingBeatdownData: boolean = true;

  constructor(
    private beatdownService: BeatdownService,
    @Inject(LOCALE_ID) private locale: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDay = today.getDate() - today.getDay();
    const weekStartDate = new Date(today.setDate(firstDay));
    const weekEndDate = new Date(today.setDate(weekStartDate.getDate()+7));

    this.createDayMap();
    this.initializeWeekList(weekStartDate);
    this.initializeBeatdowns(weekStartDate, weekEndDate);
    this.setWeekRangeString(weekStartDate, weekEndDate);
  }

  initializeWeekList(weekStartDate: Date) {
    const weekList = [];
    let date = new Date(weekStartDate);
    for(let i = 0; i < 7; i++) {
      const currentDate = new Date(date);
      weekList.push({
        dayName: this.dayToNameConverter(date.getDay()),
        date: currentDate,
        dateString: currentDate.toDateString()
      });
      date = this.addDays(date, 1);
    }
    this.weekList = weekList;
  }

  addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
  }

  dayToNameConverter(dayIdx: number) {
    return this.dayMap.get(dayIdx);
  }

  trackByFn(index: number, item: Beatdown): any {
    return item.id;
  }

  async initializeBeatdowns(weekStartDate: Date, weekEndDate: Date) {
    const beatdowns = await this.beatdownService.getBeatdownsBetweenDates(weekStartDate, weekEndDate, []);
    const sorted = beatdowns.sort((a, b) => {
      const eventAName = a.aoLocation ? a.aoLocation.name : a.eventName;
      const eventBName = b.aoLocation ? b.aoLocation.name : b.eventName;
      if (!eventAName) {
        return -1;
      }
      if (!eventBName) {
        return -1;
      }
      return eventAName > eventBName ? 1 : -1;
    });
    this.generateDailyBeatdowns(sorted);
    this.loadingBeatdownData = false;
  }

  private setWeekRangeString(weekStartDate: Date, weekEndDate: Date) {
    const weekStartDateString = formatDate(weekStartDate, 'MM/dd', this.locale);
    const weekEndDateString = formatDate(weekEndDate, 'MM/dd', this.locale);
    this.weekRange = `${weekStartDateString} - ${weekEndDateString}`;
  }

  private generateDailyBeatdowns(beatdowns: Beatdown[]) {
    const currentBeatdowns: Record<string, Beatdown[]> = {};
    for(let beatdown of beatdowns) {
      const dateString = beatdown.date.toDateString();
      if (!currentBeatdowns[dateString]) {
        currentBeatdowns[dateString] = [beatdown]
      } else {
        currentBeatdowns[dateString].push(beatdown);
      }
    }
    this.currentBeatdownList = currentBeatdowns;
  }

  private createDayMap() {
    const dayMap = new Map();
    dayMap.set(0, 'Sunday');
    dayMap.set(1, 'Monday');
    dayMap.set(2, 'Tuesday');
    dayMap.set(3, 'Wednesday');
    dayMap.set(4,'Thursday');
    dayMap.set(5, 'Friday');
    dayMap.set(6, 'Saturday');
    this.dayMap = dayMap; 
  }
}
