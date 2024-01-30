import { transition, trigger, useAnimation } from '@angular/animations';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { LinkSiteQAODialog } from 'src/app/dialogs/link-site-q-ao/link-site-q-ao-dialog.component';
import { AOData } from 'src/app/models/ao.model';
import { AuthenticatedUser, UserRole } from 'src/app/models/authenticated-user.model';
import { UserProfileData } from 'src/app/models/user-profile-data.model';
import { IPaxUser, PaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { fadeIn, fadeOut } from 'src/app/utils/animations';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  animations: [
    trigger("profileAnimation", [
      transition("void => *", [useAnimation(fadeIn)]),
      transition("* => void", [useAnimation(fadeOut)]),
    ])
  ],
})
export class UserDetailComponent {
  userDataSubject = new Subject<IPaxUser | undefined>();
  userData$: Observable<IPaxUser | undefined> = this.userDataSubject.asObservable();
  existingRoles: UserRole[] = [];

  public loading = true;
  public isAdmin = false; // Only admins can promote to admin
  public isAuthorizedUser = false; // Can view content and promote to SiteQ
  public editMode: boolean = false;
  adminErrorMessage: string = "";

  public totalPaxCount: number = 2100 // non-zero in case it fails to load
  public ehUser: PaxUser | undefined = undefined;
  public userSiteQLocation: AOData | undefined = undefined;
  public userEhLocation: AOData | undefined = undefined;
  public userProfileData: UserProfileData | null = null;
  public isPersonalProfile: boolean = false;

  constructor(
    private readonly paxManagerService: PaxManagerService,
    private activatedRoute: ActivatedRoute,
    private userAuthService: UserAuthenticationService,
    private dialog: MatDialog,
    private readonly aoManagerService: AOManagerService,
    private router: Router,
    private userProfileService: UserProfileService,
    private location: Location
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false; // Always reload if url param changes
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
    });
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      this.initializeComponent(id);
    }
  }

  async initializeComponent(id: string) {
      await this.getUserData(id);
      await this.getCurrentUserRoles(id);
      await this.getUserProfileData(id);
      this.determineIfIsUsersProfile(id);
      this.totalPaxCount = await this.paxManagerService.getCurrentNumberOfPax();
  }

  public toggleEditMode() {
    this.editMode = !this.editMode
  }

  public async viewInAdminCenter(user: IPaxUser) {
    await this.router.navigate(['/admin/user-data-edit/', user.id]);
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
        await this.userAuthService.promoteRole(userRole, user.id);
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
        await this.linkActiveSiteQAndAO(data.aoRef, user);
        return true;
      } else {
        return false;
      }
    });
  }

  public async linkActiveSiteQAndAO(locationDbPath: string, user: IPaxUser) {
    const aoRef = this.aoManagerService.getAoLocationReference(locationDbPath);
    const userRef = this.paxManagerService.getUserReference(`users/${user.id}`);
    const authRef = await this.userAuthService.getLinkedAuthDataRef(user.id);
    if (aoRef && userRef && authRef) {
      return await Promise.all([
        this.aoManagerService.updateActiveSiteQUsers(aoRef, userRef),
        this.paxManagerService.updateSiteQUserLocation(aoRef, userRef),
        this.userAuthService.updateSiteQUserLocation(aoRef, authRef),
      ]);
    } else {
      throw new Error("Unable to link accounts, missing references")
    }
  }

  public goBack() {
    this.location.back();
  }

  public async getCurrentUserRoles(userId: string) {
    const authUser: AuthenticatedUser | null = await this.userAuthService.getLinkedAuthData(userId);
    if (authUser) {
      this.existingRoles = authUser.roles;
    }
  }

  public hasExistingRole(role: string) {
    const userRole: UserRole = UserRole[role as keyof typeof UserRole];
    return this.existingRoles.includes(userRole);
  }

  public async deleteUser(user: IPaxUser): Promise<void> {
    if (confirm("Are you sure you want to *permanently* remove this Pax data?")) {
      await this.paxManagerService.deleteUser(user);
      alert("User deleted");
      await this.router.navigate(['search']);
    }
  }

  private determineIfIsUsersProfile(userId: string) {
    this.isPersonalProfile = this.userAuthService.cachedCurrentAuthData?.paxDataId === userId;
  }

  private async getUserData(id: string) {
    const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
    this.ehUser = paxData?.ehByUserRef ? await this.paxManagerService.getPaxInfoByRef(paxData.ehByUserRef) : undefined;
    this.userSiteQLocation = paxData?.siteQLocationRef ? await this.aoManagerService.getDataByRef(paxData.siteQLocationRef) : undefined;
    this.userEhLocation = paxData?.ehLocationRef ? await this.aoManagerService.getDataByRef(paxData.ehLocationRef) : undefined;
    this.userDataSubject.next(paxData?.toProperties());
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  private async getUserProfileData(userId: string) {
    this.userProfileData = await this.userProfileService.getOrCreateUserProfileById(userId);
  }
}
