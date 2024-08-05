import { Component, OnInit } from '@angular/core';
import { DocumentReference, QueryFieldFilterConstraint,where } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { debounce } from 'lodash';
import { AOData } from 'src/app/models/ao.model';
import { UserRole } from 'src/app/models/authenticated-user.model';
import { Beatdown } from 'src/app/models/beatdown.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { BeatdownService } from 'src/app/services/beatdown.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { EditBeatdownComponent, EditBeatdownProps } from './edit-beatdown-modal/edit-beatdown.component';
import { CreateBeatdownComponent, CreateBeatdownProps } from './create-beatdown-modal/create-beatdown.component';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IconSize } from 'src/app/components/beatdown-category-chips/beatdown-category-chips.component';

@Component({
  selector: 'app-q-scheduler',
  templateUrl: './q-scheduler.component.html',
  styleUrls: ['./q-scheduler.component.scss']
})
export class QSchedulerComponent implements OnInit {

  paxDataId: string | undefined = undefined;

  startDate: Date = new Date();
  weekStartDate: Date = new Date();
  weekEndDate: Date = new Date();

  months: string[] = [];

  activeSiteQAO: AOData | null = null;
  dayMap: Map<number, string> = new Map();
  weekList: { dayName: string | undefined; date: Date; dateString: string }[] = [];

  mySiteBeatdowns: Beatdown[] = [];
  openBeatdownQCount: number = 0;

  beatdowns: Beatdown[] = [];
  currentBeatdownList: Record<string, Beatdown[]> = {};
  beatdownCache: Record<string, Beatdown[]> = {};

  loadingBeatdownData: boolean = true;
  activeFilters: QueryFieldFilterConstraint[] = [];

  selectedSiteSubject: Subject<AOData | null> = new BehaviorSubject<AOData | null>(null);
  selectedSite$: Observable<AOData | null> = this.selectedSiteSubject.asObservable();
  allAOs: AOData[] = [];
  userIsAdmin: boolean = false;

  chipIconSize: IconSize = IconSize.Large;

  constructor(
    private beatdownService: BeatdownService,
    private userAuthService: UserAuthenticationService,
    private aoManagerService: AOManagerService,
    private paxManagerService: PaxManagerService,
    private matDialog: MatDialog) {
      this.months = this.createMonthsList();
      this.createDayMap();
      this.initializeWeekDates(this.startDate);
      this.getBeatdowns(this.activeFilters);

      // Look for the linked active site-q connection
      this.userAuthService.authUserData$.subscribe((res) => {
        if (res) {
          if (res.roles.includes(UserRole.Admin)) {
            this.userIsAdmin = true;
          }
          if (res.roles.includes(UserRole.SiteQ) && res.siteQLocationRef) {
            this.getLinkedActiveSiteQAO(res.siteQLocationRef);
          }
          if (res.paxDataId) {
            this.paxDataId = res.paxDataId;
          }
        }
      })
  }

  async ngOnInit(): Promise<void> {
    this.allAOs = await this.getAllAOs();
    let ref = null;
    if (this.activeSiteQAO) {
      this.selectedSiteSubject.next(this.activeSiteQAO);
      ref = this.aoManagerService.getAoLocationReference(this.activeSiteQAO.id);
    } else {
      this.selectedSiteSubject.next(this.allAOs[0]);
      ref = this.aoManagerService.getAoLocationReference(this.allAOs[0].id);
    }
    await this.getMySiteBeatdowns(ref, this.activeFilters);
  }

  public editBeatdown(beatdown: Beatdown, beatdownList: Beatdown[], day: string) {
    this.matDialog.open(EditBeatdownComponent, {
      data: <EditBeatdownProps> {
        beatdown,
        userIsAdmin: this.userIsAdmin
      },
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%'
    }).afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      const idx = beatdownList.findIndex((b) => b.id === beatdown.id);
      beatdownList[idx] = new Beatdown(res);
      if (day !== '') {
        this.currentBeatdownList[day] = beatdownList;
      } else {
        this.mySiteBeatdowns = beatdownList;
      }
    });
  }

  trackByFn(index: number, item: Beatdown): any {
    return item.id;
  }

  public async getAllAOs(): Promise<AOData[]> {
    return await this.aoManagerService.getAllBeatdownEligibleAOData();
  }

  public createBeatdown() {
    this.matDialog.open(CreateBeatdownComponent, {
      data: <CreateBeatdownProps> {
        userIsAdmin: this.userIsAdmin,
      },
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%'
    }).afterClosed().subscribe(async (res) => {
      delete this.beatdownCache[this.weekStartDate.toDateString()];
      await this.getBeatdowns(this.activeFilters);
    })
  }


  async previousWeek(startDate: Date) {
    const previousWeek = new Date(startDate.setDate(startDate.getDate() - 7));
    this.initializeWeekDates(previousWeek);
    await this.getBeatdowns(this.activeFilters);
  }

  async nextWeek(startDate: Date) {
    const nextWeek = new Date(startDate.setDate(startDate.getDate() + 7));
    this.initializeWeekDates(nextWeek);
    await this.getBeatdowns(this.activeFilters);
  }

  async moveToSpecificMonth(month: string, weekStartDate: Date) {
    const monthIdx = this.months.findIndex((m) => m === month);
    weekStartDate.setMonth(monthIdx, 5);
    this.initializeWeekDates(weekStartDate);
    await this.getBeatdowns(this.activeFilters);
  }

  async moveToToday() {
    const today = new Date();
    this.initializeWeekDates(today);
    await this.getBeatdowns(this.activeFilters);
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

  getBeatdowns = debounce(async (filter: QueryFieldFilterConstraint[]) => {
      if (this.beatdownCache[this.weekStartDate.toDateString()]) {
        this.beatdowns = this.beatdownCache[this.weekStartDate.toDateString()];
      } else {
        this.loadingBeatdownData = true;
        const beatdowns = await this.beatdownService.getBeatdownsBetweenDates(this.weekStartDate, this.weekEndDate, filter);
        const filtered = beatdowns.filter((b) => !b.eventName || (b.eventName && !b.eventName.includes("Shield Lock") && !b.eventName.includes("DR - ")));
        const sorted = filtered.sort((a, b) => {
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
        this.beatdownCache[this.weekStartDate.toDateString()] = sorted;
        this.beatdowns = sorted;
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
    this.selectedSiteSubject.next(this.activeSiteQAO);
    await this.getMySiteBeatdowns(siteQLocationRef, this.activeFilters);
  }

  async backToMySite() {
    if (this.activeSiteQAO) {
      this.selectedSiteSubject.next(this.activeSiteQAO);
      const aoRef = this.aoManagerService.getAoLocationReference(this.activeSiteQAO.id);
      await this.getMySiteBeatdowns(aoRef, this.activeFilters);
    }
  }

  async getMySiteBeatdowns(aoDataRef: DocumentReference<AOData>, filters: QueryFieldFilterConstraint[]) {
    this.mySiteBeatdowns = await this.beatdownService.getBeatdownsByAO(aoDataRef, filters);
    this.openBeatdownQCount = this.mySiteBeatdowns.filter((b) => !b.qUser).length;
  }

  async changedSiteView(event: any) {
      const { value } = event;
      this.selectedSiteSubject.next(value);
      const aoRef = this.aoManagerService.getAoLocationReference(value.id);
      await this.getMySiteBeatdowns(aoRef, this.activeFilters);
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

    if (value.includes('myQs')) {
      const ref = this.paxManagerService.getUserReference(`users/${this.paxDataId}`);
      activeFilters.push(
        where("qUserRef", "==", ref)
      );
    }

    this.activeFilters = activeFilters;

    // Delete this week's cache to retrigger the call to DB
    delete this.beatdownCache[this.weekStartDate.toDateString()];

    await this.getBeatdowns(activeFilters);
    if (this.activeSiteQAO) {
      const ref = this.aoManagerService.getAoLocationReference(this.activeSiteQAO.id);
      await this.getMySiteBeatdowns(ref, activeFilters);
    }
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

  async deleteObject(beatdown: Beatdown) {
    await this.beatdownService.deleteBeatdown(beatdown);
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
