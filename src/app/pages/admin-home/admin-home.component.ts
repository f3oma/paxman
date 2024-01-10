import { Component } from '@angular/core';
import { UserRole } from 'src/app/models/authenticated-user.model';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent {

  isAdmin = false;


  constructor(private readonly userAuthService: UserAuthenticationService) {
    // Look at the logged in user for admin / siteq permissions
    this.userAuthService.authUserData$.subscribe((res) => {
      if (res) {
        if (res.roles.includes(UserRole.Admin)) {
          this.isAdmin = true;
        }
      }
    })
  }

  downloadUserRoster() {
    // TODO: Once cloud job runs at 8am daily, download the roster CSV for the day
  }
}
