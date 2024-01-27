import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AOData, IAOData } from 'src/app/models/ao.model';
import { PaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { BehaviorSubject, Observable, Subject, debounceTime, map } from 'rxjs';
import { PaxSearchService } from 'src/app/services/pax-search.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { DocumentReference } from 'firebase/firestore';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { UserRole } from 'src/app/models/authenticated-user.model';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { availableBadges } from 'src/app/utils/badges';

@Component({
  selector: 'site-data-edit',
  templateUrl: './site-data-edit.component.html',
  styleUrls: ['./site-data-edit.component.scss']
})
export class SiteDataEditComponent implements OnInit {

  @Input('site') site!: IAOData;
  @Input('isEditorAdmin') isEditorAdmin: boolean = false;
  @Input('addNewSite') addNewSite: boolean = false;
  @Output('userSaved') userSavedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('userCanceled') userCanceledEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('activeSiteQInput') activeSiteQInput!: ElementRef<HTMLInputElement>;
  @ViewChild('retiredSiteQInput') retiredSiteQInput!: ElementRef<HTMLInputElement>;
  @ViewChild('foundingSiteQInput') foundingSiteQInput!: ElementRef<HTMLInputElement>;

  filteredActiveSiteQOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredActiveSiteQOptions$: Observable<any[]> = this.filteredActiveSiteQOptionsSubject.asObservable();

  filteredRetiredSiteQOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredRetiredSiteQOptions$: Observable<any[]> = this.filteredRetiredSiteQOptionsSubject.asObservable();

  filteredFoundingSiteQOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredFoundingSiteQOptions$: Observable<any[]> = this.filteredFoundingSiteQOptionsSubject.asObservable();

  public form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    startTimeCST: new FormControl('', [Validators.required]),
    weekDay: new FormControl('', [Validators.required]),
    sector: new FormControl('', [Validators.required]),
    xAccount: new FormControl (''),
    popup: new FormControl (''),
    rotating: new FormControl (''),
    activeSiteQUsers: new FormControl(''),
    retiredSiteQUsers: new FormControl(''),
    foundingSiteQUsers: new FormControl(''),
  });

  temporaryActiveSiteQUsers: { id: string, userRef: string, f3Name: string, fullName: string }[] = [];
  temporaryRetiredSiteQUsers: { id: string, userRef: string, f3Name: string, fullName: string }[] = [];
  temporaryFoundingSiteQUsers: { id: string, userRef: string, f3Name: string, fullName: string }[] = [];
  originalActiveSiteQUsers: { id: string, userRef: string, f3Name: string, fullName: string }[] = [];
  originalRetiredSiteQUsers: { id: string, userRef: string, f3Name: string, fullName: string }[] = [];
  originalFoundingSiteQUsers: { id: string, userRef: string, f3Name: string, fullName: string }[] = [];

  addOnBlur = true;
  saveLoading = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private aoManagerService: AOManagerService,
    private paxSearchService: PaxSearchService,
    private paxManagerService: PaxManagerService,
    private authManagerService: UserAuthenticationService,
    private userProfileService: UserProfileService) {
      this.form.controls['activeSiteQUsers'].valueChanges.pipe(
        debounceTime(200),
        map(async (value: string) => {
          if (value) {
            const results = await this.updateAutocompleteResults(value);
            this.filteredActiveSiteQOptionsSubject.next(results);
          }
          return [];
        })).subscribe();
        this.form.controls['retiredSiteQUsers'].valueChanges.pipe(
          debounceTime(200),
          map(async (value: string) => {
            if (value) {
              const results = await this.updateAutocompleteResults(value);
              this.filteredRetiredSiteQOptionsSubject.next(results);
            }
            return [];
          })).subscribe();
        this.form.controls['foundingSiteQUsers'].valueChanges.pipe(
            debounceTime(200),
            map(async (value: string) => {
              if (value) {
                const results = await this.updateAutocompleteResults(value);
                this.filteredFoundingSiteQOptionsSubject.next(results);
              }
              return [];
            })).subscribe();
  }

  public ngOnInit(): void {
    this.temporaryActiveSiteQUsers = this.site.activeSiteQUsers.map((a) => {
      return {
        id: a.id,
        userRef: 'users/' + a.id,
        f3Name: a.f3Name,
        fullName: a.firstName + " " + a.lastName
      }
    });
    this.temporaryRetiredSiteQUsers = this.site.retiredSiteQUsers.map((a) => {
      return {
        id: a.id,
        userRef: 'users/' + a.id,
        f3Name: a.f3Name,
        fullName: a.firstName + " " + a.lastName
      }
    });
    this.temporaryFoundingSiteQUsers = this.site.foundingSiteQUsers.map((a) => {
      return {
        id: a.id,
        userRef: 'users/' + a.id,
        f3Name: a.f3Name,
        fullName: a.firstName + " " + a.lastName
      }
    });
    this.originalActiveSiteQUsers = JSON.parse(JSON.stringify(this.temporaryActiveSiteQUsers));
    this.originalRetiredSiteQUsers = JSON.parse(JSON.stringify(this.temporaryRetiredSiteQUsers));
    this.originalFoundingSiteQUsers = JSON.parse(JSON.stringify(this.temporaryFoundingSiteQUsers));
  }

  public async saveData(site: IAOData) {
    if (this.form.valid && this.validateSiteLeaders()) {
      this.saveLoading = true;
      // These are very topical for now and need additional time to
      // validate that the user is not also a site q elsewhere before removing
      // any access. Time should be spent here...
      await this.handleActiveSiteQSwaps();
      await this.handleRetiredSiteQSwaps();
      await this.handleFoundingSiteQSwaps();
  
      if (this.addNewSite) {
        await this.aoManagerService.addNewSite(site);
      } else {
        await this.aoManagerService.updateSiteData(site);
      }
      this.saveLoading = false;
      this.userSavedEmitter.emit(true);
    }
  }


  public cancel() {
    this.userCanceledEmitter.emit(true);
  }

  public updateRotatingValue($event: MatCheckboxChange, site: IAOData) {
      site.rotating = $event.checked;
  }

  public updatePopupValue($event: MatCheckboxChange, site: IAOData) {
      site.popup = $event.checked;
  }

  public displayF3NameOptions(option: any) {
    if (!option) {
      return '';
    }
    return option.f3Name;
  }

  addActiveSiteQ(event: any): void {
    const option = event.option.value;
    this.temporaryActiveSiteQUsers.push(option);
    this.activeSiteQInput.nativeElement.value = '';
  }

  addRetiredSiteQ(event: any): void {
    const option = event.option.value;
    this.temporaryRetiredSiteQUsers.push(option);
    this.retiredSiteQInput.nativeElement.value = '';
  }

  addFoundingSiteQ(event: any): void {
    const option = event.option.value;
    this.temporaryFoundingSiteQUsers.push(option);
    this.foundingSiteQInput.nativeElement.value = '';
  }

  removeActive(siteQ: any): void {
    this.temporaryActiveSiteQUsers = this.temporaryActiveSiteQUsers.filter((a) => a.id !== siteQ.id);
  }

  removeRetired(siteQ: any): void {
    this.temporaryRetiredSiteQUsers = this.temporaryRetiredSiteQUsers.filter((a) => a.id !== siteQ.id);
  }

  removeFounding(siteQ: any): void {
    this.temporaryFoundingSiteQUsers = this.temporaryFoundingSiteQUsers.filter((a) => a.id !== siteQ.id);
  }

  validateSiteLeaders() {
    for (let activeSiteQ of this.temporaryActiveSiteQUsers) {
      if (this.temporaryRetiredSiteQUsers.filter((r) => r.id === activeSiteQ.id).length > 0) {
        alert("Same user is listed in retired and active Site Q slots");
        return false;
      }
    }
    return true;
  }

  private async updateAutocompleteResults(partialF3Name: string): Promise<{ id: string, userRef: string; f3Name: string; fullName: string; }[]> {
    const result = await this.paxSearchService.findF3Name(partialF3Name);
    return result.map((res) => {
      return { 
        userRef: res.path, 
        f3Name: res.f3Name,
        id: res.objectID,
        fullName: res.firstName + " " + res.lastName,
      };
    })
  }

  private async handleActiveSiteQSwaps() {
    const activeSiteQUsers = [];
    for (let siteq of this.temporaryActiveSiteQUsers) {
      const userRef = this.paxManagerService.getUserReference(siteq.userRef) as DocumentReference<PaxUser>;
      const paxUser = await this.paxManagerService.getPaxInfoByRef(userRef);
      if (paxUser && paxUser !== undefined) {
        activeSiteQUsers.push(paxUser);
        if (this.originalActiveSiteQUsers.filter((o) => o.id === paxUser.id).length === 0) {
          // I'm new!
          await this.authManagerService.promoteRole(UserRole.SiteQ, paxUser.id).catch((err) => console.error(err));
          await this.userProfileService.addBadgeToProfile(availableBadges.filter((b) => b.text === 'Site-Q')[0], paxUser.id);
        }
      }
    }

    // Handle the logic of removing site-q's in the following way...
    // 1. If a site-q is removed from active, ask the user if they want to completely remove all privileges
    // 2. If they say no, ask if we want to move them to retired. If they say no to this, just leave them in the list, we don't know what the user wants...
    // 3. If they just get moved to retired, add badges and move on

    // Are the existing active members still in the list?
    for (let existingSiteQ of this.originalActiveSiteQUsers) {
      if (activeSiteQUsers.filter((a) => a.id === existingSiteQ.id).length === 0) {

        // If they aren't in the list, are they in retired?
        if (this.temporaryRetiredSiteQUsers.filter((t) => t.id === existingSiteQ.id).length === 0) {
          if (confirm("Remove all Site-Q role privileges from " + existingSiteQ.f3Name + "?")) {
            // We need to completely remove all site-q references
            await this.authManagerService.removeRole(UserRole.SiteQ, existingSiteQ.id);
            await this.paxManagerService.removeSiteQUserLocation(existingSiteQ.id);
            await this.userProfileService.removeBadgeFromProfile(availableBadges.filter((b) => b.text === 'Site-Q')[0], existingSiteQ.id);
          } else {
            if (confirm(existingSiteQ.f3Name + " will retain role privileges. Move to retired?")) {
              this.temporaryRetiredSiteQUsers.push(existingSiteQ);
              await this.userProfileService.removeBadgeFromProfile(availableBadges.filter((b) => b.text === 'Site-Q')[0], existingSiteQ.id);
              await this.userProfileService.addBadgeToProfile(availableBadges.filter((b) => b.text === 'Retired Site-Q')[0], existingSiteQ.id);
              await this.paxManagerService.removeSiteQUserLocation(existingSiteQ.id);
            }
          }
        } else {
          await this.userProfileService.removeBadgeFromProfile(availableBadges.filter((b) => b.text === 'Site-Q')[0], existingSiteQ.id);
          await this.userProfileService.addBadgeToProfile(availableBadges.filter((b) => b.text === 'Retired Site-Q')[0], existingSiteQ.id);
          await this.paxManagerService.removeSiteQUserLocation(existingSiteQ.id);
        }
      }
    }
    // Finally, rewrite the active site q users
    this.site.activeSiteQUsers = activeSiteQUsers;
  }

  private async handleRetiredSiteQSwaps() {
    const retiredSiteQUsers = [];
    for (let siteq of this.temporaryRetiredSiteQUsers) {
      const userRef = this.paxManagerService.getUserReference(siteq.userRef) as DocumentReference<PaxUser>;
      const paxUser = await this.paxManagerService.getPaxInfoByRef(userRef);
      if (paxUser && paxUser !== undefined) {
        await this.authManagerService.promoteRole(UserRole.SiteQ, paxUser.id).catch((err) => console.error(err));
        retiredSiteQUsers.push(paxUser);
      }
    }

    // If an original member is no longer in retired, remove their access
    for (let siteq of this.originalRetiredSiteQUsers) {
      if (retiredSiteQUsers.filter((o) => o.id !== siteq.id)) {
        await this.userProfileService.removeBadgeFromProfile(availableBadges.filter((b) => b.text === 'Retired Site-Q')[0], siteq.id);
        await this.authManagerService.removeRole(UserRole.SiteQ, siteq.id);
      }
    }

    this.site.retiredSiteQUsers = retiredSiteQUsers;
  }

  private async handleFoundingSiteQSwaps() {
    const foundingSiteQUsers = [];
    for (let siteq of this.temporaryFoundingSiteQUsers) {
      const userRef = this.paxManagerService.getUserReference(siteq.userRef) as DocumentReference<PaxUser>;
      const paxUser = await this.paxManagerService.getPaxInfoByRef(userRef);
      if (paxUser && paxUser !== undefined) {
        await this.authManagerService.promoteRole(UserRole.SiteQ, paxUser.id).catch((err) => console.error(err));
        await this.userProfileService.addBadgeToProfile(availableBadges.filter((b) => b.text === 'Site Founder')[0], siteq.id);
        foundingSiteQUsers.push(paxUser);
      }
    }

    // If an original member is no longer in retired, remove their access
    for (let siteq of this.originalFoundingSiteQUsers) {
      if (foundingSiteQUsers.filter((o) => o.id !== siteq.id)) {
        await this.userProfileService.removeBadgeFromProfile(availableBadges.filter((b) => b.text === 'Site Founder')[0], siteq.id);
        await this.authManagerService.removeRole(UserRole.SiteQ, siteq.id);
      }
    }

    this.site.foundingSiteQUsers = foundingSiteQUsers;
  }
}
