import { transition, trigger, useAnimation } from '@angular/animations';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { IAOData } from 'src/app/models/ao.model';
import { PaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { fadeIn, fadeOut } from 'src/app/utils/animations';

@Component({
  selector: 'app-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.scss'],
  animations: [
    trigger("profileAnimation", [
      transition("void => *", [useAnimation(fadeIn)]),
      transition("* => void", [useAnimation(fadeOut)]),
    ])
  ]
})
export class SiteDetailComponent implements OnInit {

  siteDataSubject = new Subject<IAOData | undefined>();
  siteData$: Observable<IAOData | undefined> = this.siteDataSubject.asObservable();
  retiredSiteQs: PaxUser[] = [];

  public loading = true;
  public editMode = false;
  public showSiteNotFoundError: boolean = false;

  constructor(
    private aoManagerService: AOManagerService,
    private location: Location,
    private activatedRoute: ActivatedRoute) {}

  async ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      await this.getSiteData(id);
    }
  }

  private async getSiteData(siteId: string) {
    const data = await this.aoManagerService.getDataById(siteId);
    this.loading = false;
    if (data) {
      this.siteDataSubject.next(data.toProperties());
    } else {
      this.siteDataSubject.next(undefined);
      this.showSiteNotFoundError = true;
    }
  }

  openGoogleMapsForAddress(address: string) {
    const googleMapsBaseUrl = "https://www.google.com/maps/search/?api=1";
    const addressUrl = googleMapsBaseUrl + '&query=' + encodeURIComponent(address);
    window.open(addressUrl, "_blank");
  }

  public goBack() {
    this.location.back();
  }

  public toggleEditMode() {
    this.editMode = !this.editMode
  }

}
