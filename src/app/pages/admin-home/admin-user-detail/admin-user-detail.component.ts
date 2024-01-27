import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import algoliasearch from 'algoliasearch';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LinkSiteQAODialog } from 'src/app/dialogs/link-site-q-ao/link-site-q-ao-dialog.component';
import { AuthenticatedUser, UserRole } from 'src/app/models/authenticated-user.model';
import { Badge, UserProfileData } from 'src/app/models/user-profile-data.model';
import { IPaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { availableBadges } from 'src/app/utils/badges';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.scss']
})
export class AdminUserDetailComponent {

  public currentSearchValue: string = '';
  public searchValueBehaviorSubject = new Subject<string>();
  public isSearching = true;
  public showPaxNotFoundError = false;
  public availableBadges: Badge[] = [];
  public userCurrentBadges: Badge[] = [];

  private resultPaxList = new BehaviorSubject<Array<any>>([]);
  public resultPaxList$ = this.resultPaxList.asObservable();

  private algoliaSearch = algoliasearch(environment.algoliasearch.APP_ID, environment.algoliasearch.API_KEY);
  private idx = this.algoliaSearch.initIndex('dev_f3OmahaPax');
  
  userDataSubject = new Subject<IPaxUser | undefined>();
  userData$: Observable<IPaxUser | undefined> = this.userDataSubject.asObservable();
  existingRoles: UserRole[] = [];

  public isAdmin = false; // Only admins can promote to admin
  public isAuthorizedUser = false; // Can view content and promote to SiteQ
  public editMode: boolean = false;
  adminErrorMessage: string = "";

  userProfileData: UserProfileData | null = null;

  constructor(
    private readonly paxManagerService: PaxManagerService,
    private activatedRoute: ActivatedRoute,
    private userAuthService: UserAuthenticationService,
    private dialog: MatDialog,
    private readonly aoManagerService: AOManagerService,
    private router: Router,
    private userProfileService: UserProfileService
  ) {
    this.isAdmin = true;
    this.isAuthorizedUser = true;
    this.searchValueBehaviorSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((val) => {
      this.searchPax(val);
    });
  }

  async ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isSearching = false;
      await this.getUserData(id);
      await this.getCurrentUserRoles(id);
      await this.getUserProfileData(id);
    } else {
      this.isSearching = true;
    }
  }

  backToSearch() {
    this.isSearching = true;
    this.userDataSubject.next(undefined);
  }

  async getUserProfileData(userId: string) {
    this.userProfileService.getOrCreateUserProfileById(userId).then((userProfile) => {
      if (userProfile) {
        this.availableBadges = availableBadges.filter((b) => !userProfile.badges.map((t => t.text)).includes(b.text));
        this.userCurrentBadges = userProfile.badges;
      }
      this.userProfileData = userProfile;
    })
  }

  async searchPax(searchValue: string) {
    // determine what we are searching, if debounce is hit, begin search
    if (searchValue === '') {
      this.resultPaxList.next([]);
      return;
    }

    this.idx.search(searchValue).then(({ hits }) => {
      this.resultPaxList.next(hits);
    });
  }

  public toggleEditMode() {
    this.editMode = !this.editMode
  }

  async selectPaxFromResults(paxUserId: string) {
    this.isSearching = false;
    await this.getUserData(paxUserId);
    await this.getCurrentUserRoles(paxUserId);
    await this.getUserProfileData(paxUserId);
  }

  public async getUserData(id: string) {
    const paxData = await (await this.paxManagerService.getDataByAuthId(id)).data();
    if (paxData === undefined) {
      this.isSearching = true;
      this.showPaxNotFoundError = true;
      setTimeout(() => {
        this.showPaxNotFoundError = false;
      }, 5000);
    } else {
      this.userDataSubject.next(paxData?.toProperties());
    }
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
        if (userRole === UserRole.SiteQ) {
          const siteqBadge = this.availableBadges.filter((b) => b.text === 'Site-Q')[0];
          await this.userProfileService.addBadgeToProfile(siteqBadge, user.id);
          await this.getUserProfileData(user.id)
        }
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

  public async tryAddBadge(badge: Badge, user: IPaxUser) {
    if (confirm("Are you sure you want to give this badge?")) {
      await this.userProfileService.addBadgeToProfile(badge, user.id);
      await this.getUserProfileData(user.id)
    }
  }

  public async tryRemoveBadge(badge: Badge, user: IPaxUser) {
    if (confirm("Are you sure you want to remove this badge?")) {
      await this.userProfileService.removeBadgeFromProfile(badge, user.id);
      await this.getUserProfileData(user.id)
    }
  }
}
