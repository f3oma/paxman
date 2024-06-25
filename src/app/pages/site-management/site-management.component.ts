import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DocumentReference } from 'firebase/firestore';
import { AOData } from 'src/app/models/ao.model';
import { AuthenticatedUser, UserRole } from 'src/app/models/authenticated-user.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { Badges } from 'src/app/utils/badges';

@Component({
  selector: 'app-site-management',
  templateUrl: './site-management.component.html',
  styleUrls: ['./site-management.component.scss']
})
export class SiteManagementComponent {

  isAdmin = false;
  siteQAO: AOData | undefined;

  public displayedColumns: string[] = ['name', 'weekDay', 'startTimeCST', 'siteQ'];
  public tableData: AOData[] = [];
  public dataSource: any;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private aoManagerService: AOManagerService, 
    private userAuthService: UserAuthenticationService,
    private paxManagementService: PaxManagerService,
    private userProfileService: UserProfileService,
    private router: Router) {

    this.dataSource = null;

    // Look at the logged in user for admin / siteq permissions
    this.userAuthService.authUserData$.subscribe((res) => {
      if (res) {
        if (res.roles.includes(UserRole.Admin)) {
          this.isAdmin = true;
          this.getAOData();
        } else if (res.roles.includes(UserRole.SiteQ) && res.siteQLocationRef) {
          this.getSiteQAO(res.siteQLocationRef);
        }
      }
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public async viewSiteDetail(row: AOData) {
    await this.router.navigate(['sites', row.id]);
  }

  async getSiteQAO(siteQLocationRef: DocumentReference<AOData>) {
    this.siteQAO = await this.aoManagerService.getDataByRef(siteQLocationRef);
  }

  async getAOData() {
    const tableData = await this.aoManagerService.getAllBeatdownEligibleAOData();

    // Uncomment to give rights to all site-qs
    // for (let data of tableData) {
    //   if (data.activeSiteQUsers) {
    //     for (let user of data.activeSiteQUsers) {
    //       const aoRef = this.aoManagerService.getAoLocationReference(`ao_data/${data.id}`);
    //       const authRef = await this.userAuthService.getLinkedAuthDataRef(user.id);
    //       if (authRef) {
    //         await this.userAuthService.updateSiteQUserLocation(aoRef, authRef);
    //         await this.userAuthService.promoteRole(UserRole.SiteQ, user.id);
    //       }
    //     }
    //   }
    //   if (data.retiredSiteQUsers) {
    //     for (let user of data.retiredSiteQUsers) {
    //       await this.userProfileService.addBadgeToProfile(Badges.RetiredSiteQ, user.id);
    //       await this.userAuthService.promoteRole(UserRole.SiteQ, user.id);
    //     }
    //   }
    //   if (data.foundingSiteQUsers) {
    //     for (let user of data.foundingSiteQUsers) {
    //       await this.userProfileService.addBadgeToProfile(Badges.SiteFounder, user.id);
    //       await this.userAuthService.promoteRole(UserRole.SiteQ, user.id);
    //     }
    //   }
    // }
  
    const dayMap = this.getDayMap();
    const sorted = tableData
      .filter((a) => a.weekDay !== null)
      // .sort((a, b) => dayMap.get(a.weekDay) > dayMap.get(b.weekDay) ? 1 : -1);
      .sort((a, b) => a.name > b.name ? 1 : -1);

    this.tableData = sorted;
    this.dataSource = new MatTableDataSource(this.tableData);
    this.dataSource.sort = this.sort;
  }

  private getDayMap() {
    const dayMap = new Map();
    dayMap.set('Mon', 0);
    dayMap.set('Tues', 1);
    dayMap.set('Wed', 2);
    dayMap.set('Thurs', 3);
    dayMap.set('Fri', 4);
    dayMap.set('Sat', 5);
    dayMap.set('Sun', 6);
    return dayMap;
  }
}
