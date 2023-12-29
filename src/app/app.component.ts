import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterEvent, Event, NavigationStart, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, filter, tap } from 'rxjs';
import { UserAuthenticationService } from './services/user-authentication.service';
import { AuthenticatedUser, UserRole } from './models/authenticated-user.model';
import { IPaxUser } from './models/users.model';
import { PaxManagerService } from './services/pax-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'TBD';
  authenticatedUser: AuthenticatedUser | undefined = undefined;
  isLoggedIn = false;
  isAdmin = false;

  screenWidth = 600;

  currentRoute: string = "";

  @ViewChild('navbarMobileButton') mobileNavButton!: ElementRef<HTMLButtonElement>;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
      this.screenWidth = window.innerWidth;
  }

  isCollapsed = false;
  subscriptions: Subscription[] = [];

  public authUserData$: Subscription;
  public userDataSubject: BehaviorSubject<IPaxUser | undefined> = new BehaviorSubject<IPaxUser | undefined>(undefined);
  public paxUserData$: Observable<IPaxUser | undefined> = this.userDataSubject.asObservable();

  constructor(
    private auth: UserAuthenticationService,
    private paxManagerService: PaxManagerService,
    private readonly router: Router
  ) {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.authUserData$ = this.auth.authUserData$
      .pipe(
        tap(async (data) => {
          if (!data) {
            return;
          }
          if (data.roles?.includes(UserRole.Admin) || data.roles?.includes(UserRole.SiteQ)) {
            this.isAdmin = true;
          }
          const paxDataId = data?.paxDataId;
          if (paxDataId && paxDataId !== undefined) {
              await this.getPaxUserData(paxDataId);
          }
        })
      )
      .subscribe((res) => {
        this.authenticatedUser = res;
      });

    this.subscriptions.push(this.authUserData$);

    this.router.events.pipe(
      filter((e: Event): e is NavigationStart => e instanceof NavigationStart && this.screenWidth < 768)
    ).subscribe((e: RouterEvent) => {
      if (this.mobileNavButton && this.mobileNavButton.nativeElement.getAttribute('aria-expanded') === "true") {
        this.mobileNavButton?.nativeElement.click();
      }
    });

    this.router.events.pipe(
      filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((res) => {
      this.currentRoute = res.url;
    })
  }

  async ngOnInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async signOut() {
    await this.auth.signOutUser();
    this.authenticatedUser = undefined;
    this.router.navigate(['login']);
  }

  private async getPaxUserData(id: string) {
    const paxData = (await this.paxManagerService.getDataByAuthId(id)).data();
    this.userDataSubject.next(paxData?.toProperties());
  }
}
