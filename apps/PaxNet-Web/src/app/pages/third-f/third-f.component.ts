import { Component } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser, UserRole } from 'src/app/models/authenticated-user.model';
import { PaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'third-f',
  templateUrl: './third-f.component.html',
  styleUrl: './third-f.component.scss'
})
export class ThirdFComponent {

  public authUserData$: Observable<AuthenticatedUser | undefined>;
  public isAdmin: boolean = false;
  public loading = true;
  private paxUser: PaxUser | undefined = undefined;

  constructor(
    private userAuthService: UserAuthenticationService,
    private paxManagerService: PaxManagerService) {
      this.authUserData$ = this.userAuthService.authUserData$.pipe(
        tap(async (data) => {
            const paxDataId = data?.paxDataId;
            if (paxDataId && paxDataId !== undefined) {
                await this.getPaxUserData(paxDataId);
                if (data.roles.includes(UserRole.Admin)) {
                  this.isAdmin = true;
                }
            }
        })
      );
    }

    async getPaxUserData(id: string) {
      this.paxUser = await (await this.paxManagerService.getDataByAuthId(id)).data();
      this.loading = false;
    }
}
