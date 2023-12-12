import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterEvent, Event, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { UserAuthenticationService } from './services/user-authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'TBD';
  user: any = null;
  isLoggedIn = false;

  screenWidth = 600;

  currentRoute: string = "";

  @ViewChild('navbarMobileButton') mobileNavButton!: ElementRef<HTMLButtonElement>;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
      this.screenWidth = window.innerWidth;
  }

  isCollapsed = false;
  subscriptions: Subscription[] = [];

  constructor(
    private auth: UserAuthenticationService,
    private readonly router: Router
  ) {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.subscriptions.push(
      this.auth.authUserData$.subscribe((res) => {
        this.user = res;
      })
    );

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

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async signOut() {
    await this.auth.signOutUser();
    this.user = null;
    this.router.navigate(['login']);
  }
}
