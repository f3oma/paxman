import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { BehaviorSubject, Observable, Subject, debounceTime, map } from 'rxjs';
import { PhoneNumber } from 'src/app/models/phonenumber.model';
import { UserProfileData } from 'src/app/models/user-profile-data.model';
import { IPaxUser, PaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { LocationSearchService } from 'src/app/services/location-search.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { PaxSearchService } from 'src/app/services/pax-search.service';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'user-data-edit',
  templateUrl: './user-data-edit.component.html',
  styleUrls: ['./user-data-edit.component.scss']
})
export class UserDataEditComponent {

  @Input('user') user!: IPaxUser;
  @Input('isEditorAdmin') isEditorAdmin: boolean = false;
  @Output('userSaved') userSavedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('userCanceled') userCanceledEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  public form: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    tel: new FormControl(new PhoneNumber('', '', '')),
    email: new FormControl('', [Validators.required, Validators.email]),
    hideContactInformation: new FormControl(''),
    activeUser: new FormControl(''),
    // sector: new FormControl(''),
    ehByF3Name: new FormControl(''),
    // zipcode: new FormControl(''),
    notifications: new FormControl(''),
    ehLocation: new FormControl(''),
    f3Name: new FormControl(''),
    joinDate: new FormControl(''),
    stravaHandle: new FormControl(''),
    xHandle: new FormControl('')
  });

  public userProfileData: UserProfileData | null = null;

  filteredEhF3OptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredEhF3Options$: Observable<any[]> = this.filteredEhF3OptionsSubject.asObservable();
  selectedEhName: { userRef: string, f3Name: string } | undefined = undefined;

  filteredLocationOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredLocationOptions$: Observable<any[]> = this.filteredLocationOptionsSubject.asObservable();
  selectedEhLocation: { aoRef: string, name: string }  | undefined = undefined;

  constructor(
    private paxManagerService: PaxManagerService,
    private paxSearchService: PaxSearchService,
    private locationSearchService: LocationSearchService,
    private aoManagerService: AOManagerService,
    private userProfileService: UserProfileService) {
    this.form.controls['ehByF3Name'].valueChanges.pipe(
      debounceTime(200),
      map(async (value: string) => {
        if (value) {
          await this.updateAutocompleteResults(value);
        }
        return [];
      })).subscribe();

    this.form.controls['ehLocation'].valueChanges.pipe(
      debounceTime(200),
      map(async (value: string) => {
        if (value) {
          await this.updateLocationAutocompleteResults(value);
        }
        return [];
      })).subscribe();
  }

  async ngOnInit() {
    if (this.user.ehByUserRef) {
      const refData = await this.paxManagerService.getPaxInfoByRef(this.user.ehByUserRef);
      if (refData !== undefined) {
        this.selectedEhName = {
          userRef: `users/${refData.id}`, 
          f3Name: refData!.f3Name
        };
      }
    }

    if (this.user.ehLocationRef) {
      const refData = await this.aoManagerService.getDataByRef(this.user.ehLocationRef);
      if (refData !== undefined) {
        this.selectedEhLocation = {
          aoRef: `ao_data/${this.user.ehLocationRef.id}`, 
          name: refData.name
        };
      }
    }

    const userProfileData = await this.userProfileService.getOrCreateUserProfileById(this.user.id);

    // Add new links here when added...
    if (userProfileData.links['x'] === undefined) {
      userProfileData.links['x'] = { url: '' };
    }
    if (userProfileData.links['strava'] === undefined) {
      userProfileData.links['strava'] = { url: '' };
    }
    this.userProfileData = userProfileData;
  }

  public getEmailErrorMessage(): string {
    if (this.form.controls['email'].hasError('required')) {
        return 'You must enter a value';
    }
    return this.form.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  public displayF3NameOptions(option: any) {
    if (!option) {
      return '';
    }
    return option.f3Name;
  }

  public displayLocationNameOptions(option: any) {
    if (!option) {
      return '';
    }
    return option.name;
  }

  public async saveData(user: IPaxUser) {
    if (this.selectedEhName !== undefined) {
      this.user.ehByUserRef = this.paxManagerService.getUserReference(this.selectedEhName?.userRef);
    }
    if (this.selectedEhLocation !== undefined) {
      this.user.ehLocationRef = this.aoManagerService.getAoLocationReference(this.selectedEhLocation?.aoRef);
    }
    await this.saveUserProfileData(user.id);
    await this.paxManagerService.updateUser(user);
  }

  private async saveUserProfileData(userId: string) {
    if (!this.userProfileData) {
      return;
    }

    // Correct any empty links
    for (let record in this.userProfileData.links) {
      if (this.userProfileData.links[record] === undefined) {
        this.userProfileData.links[record].url = "";
      }
    }

    await this.userProfileService.updateUserProfile(userId, this.userProfileData!);
    this.userSavedEmitter.emit(true);
  }

  public cancel() {
    this.userCanceledEmitter.emit(true);
  }

  public updateHideContactInfoValue($event: MatCheckboxChange, user: IPaxUser) {
      user.hideContactInformation = $event.checked;
  }

  public updateActiveStatusValue($event: MatCheckboxChange, user: IPaxUser) {
      user.activeUser = $event.checked;
  }

  private async updateAutocompleteResults(partialF3Name: string): Promise<void> {
    const result = await this.paxSearchService.findF3Name(partialF3Name);
    const pax = result.map((res) => {
      return { 
        userRef: res.path, 
        f3Name: res.f3Name 
      };
    })
    this.filteredEhF3OptionsSubject.next(pax);
  }

  private async updateLocationAutocompleteResults(partialLocationName: string): Promise<void> {
    const result = await this.locationSearchService.findByName(partialLocationName);
    const locations = result.map((res) => {
      return { 
        aoRef: res.path, 
        name: res.name 
      };
    })
    this.filteredLocationOptionsSubject.next(locations);
  }
}
