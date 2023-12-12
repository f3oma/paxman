import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { AuthenticatedUser, UserRole } from 'src/app/models/admin-user.model';
import { IPaxUser, PaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent {
  userDataSubject = new Subject<IPaxUser | undefined>();
  userData$: Observable<IPaxUser | undefined> = this.userDataSubject.asObservable();
  existingRoles: UserRole[] = [];

  public isAdmin = false; // Only admins can promote to admin
  public isAuthorizedUser = false; // Can view content and promote to SiteQ

  constructor(
    private readonly paxManagerService: PaxManagerService,
    private activatedRoute: ActivatedRoute,
    private userAuthService: UserAuthenticationService
  ) {
    this.userAuthService.authUserData$.subscribe((res) => {
      if (res) {
        if (res.getRoles().includes(UserRole.Admin)) {
          this.isAdmin = true;
          this.isAuthorizedUser = true;
        }
        if (res.getRoles().includes(UserRole.SiteQ)) {
          this.isAuthorizedUser = true;
        }
      }
    })
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      this.getUserData(id);
      this.getCurrentUserRoles(id);
    }
  }

  private async getUserData(id: string) {
    const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
    this.userDataSubject.next(paxData?.toProperties());
  }

  public async promoteRole(role: string, user: IPaxUser) {
    const userRole: UserRole = UserRole[role as keyof typeof UserRole];
    await this.userAuthService.promoteRole(userRole, user);
    this.existingRoles.push(userRole);
  }

  public async getCurrentUserRoles(userId: string) {
    const authUser: AuthenticatedUser = await this.userAuthService.getLinkedAuthData(userId);
    this.existingRoles = authUser.getRoles();
  }

  public hasExistingRole(role: string) {
    const userRole: UserRole = UserRole[role as keyof typeof UserRole];
    return this.existingRoles.includes(userRole);
  }
}
