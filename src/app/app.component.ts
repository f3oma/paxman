import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterEvent, Event, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'TBD';
  user: any = null;

  screenWidth = 600;

  currentRoute: string = "";

  @ViewChild('navbarMobileButton') mobileNavButton!: ElementRef<HTMLButtonElement>;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
      this.screenWidth = window.innerWidth;
  }

  isCollapsed = false;

  constructor(
    private auth: Auth,
    private readonly router: Router
  ) {
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


}
