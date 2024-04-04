import { Component } from '@angular/core';
import { DocumentReference, QueryFieldFilterConstraint, where } from '@angular/fire/firestore';
import { debounce } from 'lodash';
import { AOData } from 'src/app/models/ao.model';
import { UserRole } from 'src/app/models/authenticated-user.model';
import { Beatdown } from 'src/app/models/beatdown.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { BeatdownService } from 'src/app/services/beatdown.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

// Models



// Q Scheduler
// Give me all beatdowns where date is this week
// Give me all future and previous beatdowns for my site
// Number of sites = number of beatdowns unless popup.


@Component({
  selector: 'app-q-scheduler',
  templateUrl: './q-scheduler.component.html',
  styleUrls: ['./q-scheduler.component.scss']
})
export class QSchedulerComponent {

  startDate: Date = new Date();
  weekStartDate: Date = new Date();
  weekEndDate: Date = new Date();

  months: string[] = [];

  activeSiteQAO: AOData | null = null;
  dayMap: Map<number, string> = new Map();
  weekList: { dayName: string | undefined; date: Date; dateString: string }[] = [];

  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage'];
  selected = -1;
  beatdowns: Beatdown[] = [];
  currentBeatdownList: Record<string, Beatdown[]> = {};
  beatdownCache: Record<string, Beatdown[]> = {};
  
  loadingBeatdownData: boolean = false;

  constructor(
    private beatdownService: BeatdownService,
    private userAuthService: UserAuthenticationService,
    private aoManagerService: AOManagerService) {
      this.months = this.createMonthsList();
      this.createDayMap();
      this.initializeWeekDates(this.startDate);
      this.getBeatdowns();

      // Look for the linked active site-q connection
      this.userAuthService.authUserData$.subscribe((res) => {
        if (res) {
          if (res.roles.includes(UserRole.SiteQ) && res.siteQLocationRef) {
            this.getLinkedActiveSiteQAO(res.siteQLocationRef);
          }
        }
      })
  }

  async previousWeek(startDate: Date) {
    const previousWeek = new Date(startDate.setDate(startDate.getDate() - 7));
    this.initializeWeekDates(previousWeek);
    await this.getBeatdowns();
  }

  async nextWeek(startDate: Date) {
    const nextWeek = new Date(startDate.setDate(startDate.getDate() + 7));
    this.initializeWeekDates(nextWeek);
    await this.getBeatdowns();
  }

  async moveToSpecificMonth(month: string, weekStartDate: Date) {
    const monthIdx = this.months.findIndex((m) => m === month);
    weekStartDate.setMonth(monthIdx, 5);
    this.initializeWeekDates(weekStartDate);
    await this.getBeatdowns();
  }

  async moveToToday() {
    const today = new Date();
    this.initializeWeekDates(today);
    await this.getBeatdowns();
  }

  async initializeWeekDates(startDate: Date) {
    startDate.setHours(0, 0, 0, 0);
    const firstDay = startDate.getDate() - startDate.getDay();
    this.startDate = startDate;
    this.weekStartDate = new Date(startDate.setDate(firstDay));
    this.weekEndDate = new Date(startDate.setDate(this.weekStartDate.getDate()+7));

    const weekList = [];
    let date = new Date(this.weekStartDate);
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

  getBeatdowns = debounce(async (filter: QueryFieldFilterConstraint[] = []) => {
      if (this.beatdownCache[this.weekStartDate.toDateString()]) {
        this.beatdowns = this.beatdownCache[this.weekStartDate.toDateString()];
      } else {
        this.loadingBeatdownData = true;
        const beatdowns = await this.beatdownService.getBeatdownsBetweenDates(this.weekStartDate, this.weekEndDate, filter);
        this.beatdownCache[this.weekStartDate.toDateString()] = beatdowns;
        this.beatdowns = beatdowns;
      }
      this.generateDailyBeatdowns(this.beatdowns);
      this.loadingBeatdownData = false;
    }, 1000);

  addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
  }

  dayToNameConverter(dayIdx: number) {
    return this.dayMap.get(dayIdx);
  }

  async getLinkedActiveSiteQAO(siteQLocationRef: DocumentReference<AOData>) {
    this.activeSiteQAO = await this.aoManagerService.getDataByRef(siteQLocationRef);
  }

    /*checkbox change event*/
  async changedFilter(event: any) {
    // Value is an array of selected values such as ['available', 'VQ']
    const { value } = event;
    const activeFilters = [];

    // This should probably be updated to do this locally, and not hit the database...
    if (value.includes('available')) {
      activeFilters.push(
        where("qUserRef", "==", null)
      );
    }

    if (value.includes('VQ')) {
      activeFilters.push(
        where("specialEvent", "==", "VQ")
      );
    }

    if (value.includes('shovelPass')) {
      activeFilters.push(
        where("specialEvent", "==", "FlagPass")
      );
    }
    await this.getBeatdowns(activeFilters);
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

  private createMonthsList() {
    const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
    'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ];
    return shortMonths;
  }
}
