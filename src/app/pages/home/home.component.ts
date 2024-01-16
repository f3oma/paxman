import { Component } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser } from 'src/app/models/authenticated-user.model';
import { PaxUser } from 'src/app/models/users.model';
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

  public latestPaxNames: string = 'None today';

  constructor(
    private userAuthService: UserAuthenticationService,
    private paxManagerService: PaxManagerService
  ) {
    if (this.userAuthService.isLoggedIn) {
      this.isLoggedIn = true;
      this.getPaxFromToday();
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
    const pax: PaxUser[] = await this.paxManagerService.getWeeklyPax();
    if (pax && pax.length > 0) {
      this.latestPaxNames = pax.map((p) => p.f3Name).join(", ");
    }
  }
}
