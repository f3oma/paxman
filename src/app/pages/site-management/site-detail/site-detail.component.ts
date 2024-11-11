import { transition, trigger, useAnimation } from '@angular/animations';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { IAOData } from 'src/app/models/ao.model';
import { UserRole } from 'src/app/models/authenticated-user.model';
import { Beatdown } from 'src/app/models/beatdown.model';
import { PaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { BeatdownService } from 'src/app/services/beatdown.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
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

  recentQsDataSource: any;
  public displayedColumns: string[] = ['f3Names', 'date'];

  public loading = true;
  public editMode = false;
  public isAdmin = false;
  public showSiteNotFoundError: boolean = false;

  constructor(
    private aoManagerService: AOManagerService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private beatdownService: BeatdownService,
    private userAuthService: UserAuthenticationService) {
      this.userAuthService.authUserData$.subscribe((res) => {
        if (res) {
          if (res.roles.includes(UserRole.Admin)) {
            this.isAdmin = true;
          }
        }
      })
    }

  async ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== null) {
      await this.getSiteData(id);
      await this.getQsBySiteId(id);
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

  private async getQsBySiteId(siteId: string) {
    const today = new Date();
    const aoRef = this.aoManagerService.getAoLocationReference(siteId);
    const beatdowns = await this.beatdownService.getAllPreviousSiteBeatdowns(aoRef, today);

    this.recentQsDataSource = new MatTableDataSource(beatdowns);
  }

  openGoogleMapsForAddress(address: string) {
    const googleMapsBaseUrl = "https://www.google.com/maps/search/?api=1";
    const addressUrl = googleMapsBaseUrl + '&query=' + encodeURIComponent(address);
    window.open(addressUrl, "_blank");
  }

  public async deleteSite(siteId: string) {
    await this.beatdownService.deleteAllBeatdownsForAO(siteId);
    await this.aoManagerService.deleteAOById(siteId);
    await this.router.navigate(['sites']);
  }

  public getQsForBeatdown(beatdown: Beatdown) {
    const qs = [];
    if (beatdown.qUser)
      qs.push(beatdown.qUser);
    if (beatdown.coQUser)
      qs.push(beatdown.coQUser);
    if (beatdown.additionalQs && beatdown.additionalQs.length > 0)
      qs.push(...(beatdown.additionalQs as []));

    if (qs.length === 0)
      qs.push({
        f3Name: 'Unknown',
        id: 'unknown',
        profilePhotoUrl: '',
      });

    return qs;
  }

  public goBack() {
    this.location.back();
  }

  public toggleEditMode() {
    this.editMode = !this.editMode
  }

}
