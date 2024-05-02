import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { BehaviorSubject, Observable, Subject, debounceTime, map } from 'rxjs';
import { PhoneNumber } from 'src/app/models/phonenumber.model';
import { UserProfileData } from 'src/app/models/user-profile-data.model';
import { IPaxUser } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { LocationSearchService } from 'src/app/services/location-search.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { PaxSearchService } from 'src/app/services/pax-search.service';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { Badges, getBadgeDetail } from 'src/app/utils/badges';
import * as convert from 'heic-convert';

@Component({
  selector: 'user-data-edit',
  templateUrl: './user-data-edit.component.html',
  styleUrls: ['./user-data-edit.component.scss']
})
export class UserDataEditComponent {

  @Input('user') user!: IPaxUser;
  @Input('userProfileData') userProfileData!: UserProfileData | null;
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
    xHandle: new FormControl(''),
    birthday: new FormControl(''),
    emergencyContactName: new FormControl(''),
    emergencyContactPhone: new FormControl(new PhoneNumber('', '', '')),
  });

  imageLoading: boolean = false;

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
    // Add new links here when added...
    if (this.userProfileData && this.userProfileData.links['x'] === undefined) {
      this.userProfileData.links['x'] = { url: '' };
    }
    if (this.userProfileData && this.userProfileData.links['strava'] === undefined) {
      this.userProfileData.links['strava'] = { url: '' };
    }

    if (this.user.emergencyContact) {
      this.form.controls['emergencyContactName'].setValue(this.user.emergencyContact.name);
      this.form.controls['emergencyContactPhone'].setValue(this.user.emergencyContact.phoneNumber);
    }

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
          aoRef: this.user.ehLocationRef.id, 
          name: refData.name
        };
      }
    }
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

  async onSelectImage(event: any) {
    this.imageLoading = true;
    const files = event.target.files;
    if(!files || !files.item(0)) {
      this.imageLoading = false;
      // show error;
      return;
    }
    let fileToUpload = files.item(0);

    const { type } = fileToUpload;
    let buffer = null;
    if (type === 'image/heic') {
      buffer = convert({
        buffer: await fileToUpload.arrayBuffer(),
        format: 'JPEG',
        quality: 1
      })
    }

    if (buffer) {
      fileToUpload = buffer;
    }

    var profilePhotoUrl = await this.userProfileService.uploadProfileImage(fileToUpload, this.user.id);
    await this.paxManagerService.updateProfileImage(this.user.id, profilePhotoUrl);
    this.imageLoading = false;
  }

  public async saveData(user: IPaxUser) {
    if (this.imageLoading) {
      alert("Profile image is still uploading. If the problem persists, please refresh");
    }
    if (this.selectedEhName !== undefined) {
      this.user.ehByUserRef = this.paxManagerService.getUserReference(this.selectedEhName?.userRef);
    } else {
      this.user.ehByUserRef = null;
    }

    if (this.selectedEhLocation !== undefined) {
      this.user.ehLocationRef = this.aoManagerService.getAoLocationReference(this.selectedEhLocation?.aoRef);
    } else {
      this.user.ehLocationRef = null;
    }

    user.emergencyContact = {
      name: this.form.controls['emergencyContactName'].value,
      phoneNumber: this.form.controls['emergencyContactPhone'].value
    };

    if (this.user.birthday && this.user.birthday !== undefined) {
      const today = new Date();
      const age: number = Math.floor((today.getTime() - this.user.birthday.getTime()) / (1000 * 60 * 60 * 24 * 365));
      const respectIdx = this.userProfileData?.badges.findIndex(b => b.text === getBadgeDetail(Badges.Respect)!.text);
      const hateIdx = this.userProfileData?.badges.findIndex(b => b.text === getBadgeDetail(Badges.Hate)!.text);

      if (age >= 50 && respectIdx === -1) {
        this.userProfileData?.badges.push(getBadgeDetail(Badges.Respect)!);
      } else if (age < 30 && hateIdx === -1) {
        this.userProfileData?.badges.push(getBadgeDetail(Badges.Hate)!);
      } else {
        // Remove badges if age changes and no longer in category
        // This could be more performant
        if (age < 50 && respectIdx && respectIdx >= 0) {
          this.userProfileData?.badges.splice(respectIdx, 1);
        }
        if (age > 29 && hateIdx && hateIdx >= 0) {
          this.userProfileData?.badges.splice(hateIdx, 1);
        }
      }
    }

    if (this.user.siteQLocationRef === undefined) {
      this.user.siteQLocationRef = null;
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
      const link = this.userProfileData.links[record];

      // Special strava logic for link type: "https://strava.app.link/<id>"
      // if (link && link.url.includes("https://strava.app.link/")) {
      //   this.userProfileData.links[record].url = link.url;
      // }

      if (link && link.url.includes('http')) {
        const lastSlashIndex = link.url.lastIndexOf('/');
        const username = link.url.substring(lastSlashIndex + 1);
        this.userProfileData.links[record].url = username;
        continue;
      }

      if (link === undefined) {
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
        f3Name: res.f3Name,
        fullName: res.firstName + " " + res.lastName,
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
