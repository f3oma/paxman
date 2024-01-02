import { Component } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser } from 'src/app/models/authenticated-user.model';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  public authUserData$: Observable<AuthenticatedUser | undefined>;
  public hasClaimedData: boolean = true;

  constructor(
    private userAuthService: UserAuthenticationService
  ) {
    this.authUserData$ = this.userAuthService.authUserData$.pipe(
        tap(async (data) => {
            const paxDataId = data?.paxDataId;
            if (!paxDataId || paxDataId === undefined) {
                this.hasClaimedData = false;
            }
        })
    );
}

}
