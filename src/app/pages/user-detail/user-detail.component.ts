import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { LinkSiteQAODialog } from 'src/app/dialogs/link-site-q-ao/link-site-q-ao-dialog.component';
import { AuthenticatedUser, UserRole } from 'src/app/models/authenticated-user.model';
import { IPaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
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
  public editMode: boolean = false;
  adminErrorMessage: string = "";

  constructor(
    private readonly paxManagerService: PaxManagerService,
    private activatedRoute: ActivatedRoute,
    private userAuthService: UserAuthenticationService,
    private dialog: MatDialog,
    private readonly aoManagerService: AOManagerService,
    private router: Router
  ) {
    // Look at the logged in user for admin / siteq permissions
    this.userAuthService.authUserData$.subscribe((res) => {
      if (res) {
        if (res.roles.includes(UserRole.Admin)) {
          this.isAdmin = true;
          this.isAuthorizedUser = true;
        }
        if (res.roles.includes(UserRole.SiteQ)) {
          this.isAuthorizedUser = true;
        }
      }
    })
  }

  async ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      await this.getUserData(id);
      await this.getCurrentUserRoles(id);
    }
  }

  public toggleEditMode() {
    this.editMode = !this.editMode
  }

  private async getUserData(id: string) {
    const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
    this.userDataSubject.next(paxData?.toProperties());
  }

  public async promoteRole(role: string, user: IPaxUser) {
    const userRole: UserRole = UserRole[role as keyof typeof UserRole];
    try {
      const succeeds = await this.userAuthService.validatePromoteRole(user);
      if (succeeds) {
        if (userRole === UserRole.SiteQ) {
          const success = await this.validateSiteQLocation(user);
          if (!success) {
            return;
          }
        }
        await this.userAuthService.promoteRole(userRole, user);
      } else {
        return;
      }
    } catch(err) {
      if (err instanceof Error) {
        this.adminErrorMessage = err.message;
      }
      return;
    }
    this.existingRoles.push(userRole);
  }

  public async validateSiteQLocation(user: IPaxUser): Promise<boolean> {
    const dialogRef = this.dialog.open(LinkSiteQAODialog);
    return dialogRef.afterClosed().toPromise().then(async (data) => {
      if (data && data.aoRef !== '') {
        await this.linkSiteQAndAO(data.aoRef, user);
        return true;
      } else {
        return false;
      }
    });
  }

  public async linkSiteQAndAO(locationDbPath: string, user: IPaxUser) {
    const aoRef = this.aoManagerService.getAoLocationReference(locationDbPath);
    const userRef = this.paxManagerService.getUserReference(`users/${user.id}`);
    if (aoRef && userRef) {
      await this.aoManagerService.updateSiteQUser(aoRef, userRef);
    }
  }

  public async getCurrentUserRoles(userId: string) {
    const authUser: AuthenticatedUser | null = await this.userAuthService.getLinkedAuthData(userId);
    if (authUser)
      this.existingRoles = authUser.roles;
  }

  public hasExistingRole(role: string) {
    const userRole: UserRole = UserRole[role as keyof typeof UserRole];
    return this.existingRoles.includes(userRole);
  }

  public async deleteUser(user: IPaxUser): Promise<void> {
    if (confirm("Are you sure you want to *permanantly* remove this Pax data?")) {
      await this.paxManagerService.deleteUser(user);
      alert("User deleted");
      await this.router.navigate(['search']);
    }
  }
}
