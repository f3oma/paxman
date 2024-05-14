import { transition, trigger, useAnimation } from '@angular/animations';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';
import { CommunityWorkoutReportComponent, CommunityWorkoutReportProps } from 'src/app/dialogs/community-workout-report/community-workout-report.component';
import { PersonalWorkoutReportComponent, UserReportedWorkoutProps } from 'src/app/dialogs/personal-workout-report/personal-workout-report.component';
import { AuthenticatedUser, UserRole } from 'src/app/models/authenticated-user.model';
import { Beatdown } from 'src/app/models/beatdown.model';
import { AoLocationRef, PaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { BeatdownService } from 'src/app/services/beatdown.service';
import { PaxWelcomeEmailService } from 'src/app/services/email-services/pax-welcome-email.service';
import { AnniversaryResponsePax, GetNewPaxResponse, PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { fadeIn, fadeOut } from 'src/app/utils/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger("fadeInOut", [
      transition("void => *", [useAnimation(fadeIn)]),
      transition("* => void", [useAnimation(fadeOut)]),
    ])
  ]
})
export class HomeComponent {

  public authUserData$: Observable<AuthenticatedUser | undefined>;
  public hasClaimedData: boolean = true;
  public isLoggedIn: boolean = false;
  public isAdminOrSiteQ: boolean = false;

  public latestPaxNames: string = '';
  public latestPax: { id: string, f3Name: string, ehUserF3Name: string, ehLocationName: string, profilePhotoUrl: string | undefined }[] = [];
  public anniversaryPax: AnniversaryResponsePax[] = []
  public anniversaryEndDate: Date = new Date();
  public anniversaryStartDate: Date = new Date();
  public user: PaxUser | undefined = undefined;
  beatdownsRequiringAttendanceData: Beatdown[] = [];

  constructor(
    private userAuthService: UserAuthenticationService,
    private paxManagerService: PaxManagerService,
    private aoManagerService: AOManagerService,
    private mailService: PaxWelcomeEmailService,
    private beatdownService: BeatdownService,
    private matDialog: MatDialog
  ) {
    if (this.userAuthService.isLoggedIn) {
      this.isLoggedIn = true;
      this.getPaxFromToday();
      this.getWeeklyPaxWithAnniversaries()
    }
    this.authUserData$ = this.userAuthService.authUserData$.pipe(
        tap(async (data) => {
          if (data && data !== undefined) {
            const paxDataId = data?.paxDataId;
            if (!paxDataId) {
              this.hasClaimedData = false;
            } else {
              this.getPaxUserData(paxDataId, data.siteQLocationRef);
            }
            if (data.roles.includes(UserRole.Admin) || data.roles.includes(UserRole.SiteQ)) {
              this.isAdminOrSiteQ = true;
            }
          }
        })
    );
    this.authUserData$.subscribe();
  }

  public async getPaxUserData(paxDataId: string, siteQLocationRef: AoLocationRef | undefined) {
   this.user = await (await this.paxManagerService.getDataByAuthId(paxDataId)).data();
   this.beatdownsRequiringAttendanceData = await this.beatdownService.getBeatdownAttendanceReportForUser(this.user, siteQLocationRef);
  }

  reportCommunityBeatdownAttendance(beatdown: Beatdown) {
    this.matDialog.open(CommunityWorkoutReportComponent, {
      data: <CommunityWorkoutReportProps> {
        user: this.user,
        beatdown,
      },
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%'
    }).afterClosed().subscribe((res) => {
      if (!res) {
        return;
      } else {
        this.beatdownsRequiringAttendanceData = this.beatdownsRequiringAttendanceData.filter(b => b.id !== beatdown.id);
      }
    });
  }    

  reportAttendance() {
    this.matDialog.open(PersonalWorkoutReportComponent, {
      data: <UserReportedWorkoutProps> {
        user: this.user
      },
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%'
    }).afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
    });
  }

  async getPaxFromToday() {
    const paxList: GetNewPaxResponse[] = await this.paxManagerService.getNewPax();
    const latestPax: { id: string, f3Name: string, ehUserF3Name: string, ehLocationName: string, profilePhotoUrl: string | undefined}[] = [];
    for (let pax of paxList) {
      let paxEhUser = undefined, paxEhLocation = undefined;
      if (pax.ehByUserRef)
        paxEhUser = await this.paxManagerService.getPaxInfoByRef(pax.ehByUserRef);

      if (pax.ehLocationRef)
        paxEhLocation = await this.aoManagerService.getDataByRef(pax.ehLocationRef);

      latestPax.push({
        id: pax.id,
        f3Name: pax.f3Name,
        ehUserF3Name: paxEhUser !== undefined ? paxEhUser.f3Name : 'None',
        ehLocationName: paxEhLocation !== undefined ? paxEhLocation.name : 'Unknown',
        profilePhotoUrl: pax.profilePhotoUrl
      });
    }
    this.latestPax = latestPax;
  }

  async getWeeklyPaxWithAnniversaries() {
    const anniversaryResponse = await this.paxManagerService.getWeeklyAnniversaryPax();
    this.anniversaryStartDate = anniversaryResponse.startDate;
    this.anniversaryEndDate = anniversaryResponse.endDate;
    this.anniversaryPax = anniversaryResponse.paxList.sort((a, b) => a.anniversaryYear < b.anniversaryYear ? 1 : -1);
  }
}
