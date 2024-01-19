import { Component } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser } from 'src/app/models/authenticated-user.model';
import { AoLocationRef, UserRef, PaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  public authUserData$: Observable<AuthenticatedUser | undefined>;
  public hasClaimedData: boolean = true;
  public isLoggedIn: boolean = false;

  public latestPaxNames: string = '';
  public latestPax: { f3Name: string, ehUserF3Name: string, ehLocationName: string}[] = [];
  public anniversaryPax: { id: string; f3Name: string; anniversaryYear: number; joinDate: Date; }[] = []

  constructor(
    private userAuthService: UserAuthenticationService,
    private paxManagerService: PaxManagerService,
    private aoManagerService: AOManagerService
  ) {
    if (this.userAuthService.isLoggedIn) {
      this.isLoggedIn = true;
      this.getPaxFromToday();
      // this.getPaxWithAnniversaries()
    }
    this.authUserData$ = this.userAuthService.authUserData$.pipe(
        tap(async (data) => {
          if (data && data !== undefined) {
            const paxDataId = data?.paxDataId;
            if (!paxDataId) {
                this.hasClaimedData = false;
            }
          }
        })
    );
    this.authUserData$.subscribe();
  }

  async getPaxFromToday() {
    const paxList: { f3Name: string, ehByUserRef: UserRef, ehLocationRef: AoLocationRef}[] = await this.paxManagerService.getWeeklyPax();
    const latestPax: { f3Name: string, ehUserF3Name: string, ehLocationName: string}[] = [];
    for (let pax of paxList) {
      let paxEhUser = undefined, paxEhLocation = undefined;
      if (pax.ehByUserRef)
        paxEhUser = await this.paxManagerService.getPaxInfoByRef(pax.ehByUserRef);

      if (pax.ehLocationRef)
        paxEhLocation = await this.aoManagerService.getDataByRef(pax.ehLocationRef);

      latestPax.push({
        f3Name: pax.f3Name,
        ehUserF3Name: paxEhUser !== undefined ? paxEhUser.f3Name : 'None',
        ehLocationName: paxEhLocation !== undefined ? paxEhLocation.name : 'Unknown'
      });
    }

    this.latestPax = latestPax;
  }

  async getPaxWithAnniversaries() {
    this.anniversaryPax = await this.paxManagerService.getAnniversaryPax();;
  }
}
