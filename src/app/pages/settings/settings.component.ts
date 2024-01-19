import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthenticatedUser } from 'src/app/models/authenticated-user.model';
import { IPaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  public authUserData$: Observable<AuthenticatedUser | undefined>;
  public userDataSubject: BehaviorSubject<IPaxUser | undefined> = new BehaviorSubject<IPaxUser | undefined>(undefined);
  public paxUserData$: Observable<IPaxUser | undefined> = this.userDataSubject.asObservable();
  private paxDataIdCached: string = "";

  constructor(
    private userAuthService: UserAuthenticationService,
    private paxManagerService: PaxManagerService,
    private router: Router
  ) {
    this.authUserData$ = this.userAuthService.authUserData$.pipe(
      tap(async (data) => {
          const paxDataId = data?.paxDataId;
          if (paxDataId && paxDataId !== undefined) {
            this.paxDataIdCached = paxDataId;
              await this.getPaxUserData(paxDataId);
          }
      })
    );
  }

  public navigateToProfile() {
    this.router.navigate(['users', this.paxDataIdCached]);
  }

  private async getPaxUserData(id: string) {
    const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
    this.userDataSubject.next(paxData?.toProperties());
  }

}
