import { Component } from '@angular/core';
import { AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentData, DocumentReference } from 'firebase/firestore';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, first, map, switchMap } from 'rxjs';
import { AOData } from 'src/app/models/ao.model';
import { PhoneNumber } from 'src/app/models/phonenumber.model';
import { IPaxUser, NotificationFrequency, PaxUser, UserRef } from 'src/app/models/users.model';
import { AOManagerService } from 'src/app/services/ao-manager.service';
import { LocationSearchService } from 'src/app/services/location-search.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { PaxSearchService } from 'src/app/services/pax-search.service';

@Component({
  selector: 'app-add-pax',
  templateUrl: './add-pax.component.html',
  styleUrls: ['./add-pax.component.scss']
})
export class AddPaxComponent {

  f3NameFormControl = new FormControl('', [Validators.required]);

  filteredEhF3OptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredEhF3Options$: Observable<any[]> = this.filteredEhF3OptionsSubject.asObservable();
  selectedEhByF3Name: any = '';

  filteredLocationOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredLocationOptions$: Observable<any[]> = this.filteredLocationOptionsSubject.asObservable();
  selectedLocation: any = '';

  form: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    f3Name: this.f3NameFormControl,
    tel: new FormControl(new PhoneNumber('', '', '')),
    email: new FormControl('', [Validators.required, Validators.email]),
    ehByF3Name: new FormControl(''),
    sector: new FormControl(''),
    zipcode: new FormControl(''),
    ehLocation: new FormControl('')
  });

  constructor(
    private readonly paxSearchService: PaxSearchService,
    private readonly paxManagerService: PaxManagerService,
    private readonly locationSearchService: LocationSearchService,
    private readonly aoManagerService: AOManagerService,
    private readonly router: Router) {
      this.f3NameFormControl.setAsyncValidators(this.paxF3NameValidator());
      this.form.controls['ehByF3Name'].valueChanges.pipe(
        debounceTime(1000),
        map(async (value: string) => {
          if (value) {
            await this.updateEHAutocompleteResults(value);
          }
          return [];
        })).subscribe();

      this.form.controls['ehLocation'].valueChanges.pipe(
        debounceTime(1000),
        map(async (value: string) => {
          if (value) {
            await this.updateLocationAutocompleteResults(value);
          }
          return [];
        })).subscribe();
  }

  public isValidForm(): boolean {
    const formControls = this.form.controls;
    return formControls['firstName'].valid &&
        formControls['lastName'].valid &&
        formControls['f3Name'].value !== '' &&
        formControls['email'].valid;
  }

  public async addPax(): Promise<void> {
    if(this.isValidForm()) {
      const phoneValid = () => {
        const value = this.form.controls['tel'].value;
        if (value?.area !== '') {
          return true;
        }
        return false;
      }
      const ehedBy = this.form.controls['ehByF3Name'].value;
      let ehRef: UserRef = null;
      if (ehedBy) {
        ehRef = this.paxManagerService.getUserReference(ehedBy.userRef);
      }

      const location = this.form.controls['ehLocation'].value;
      let locationRef: DocumentReference<AOData> | null = null;
      if (location) {
        locationRef = this.aoManagerService.getAoLocationReference(location.aoRef);
      }

      let paxNumber = await this.paxManagerService.getCurrentNumberOfPax();

      const pax: Partial<IPaxUser> = {
        id: undefined,
        f3Name: this.form.controls['f3Name'].value,
        firstName: this.form.controls['firstName'].value,
        lastName: this.form.controls['lastName'].value,
        email: this.form.controls['email'].value,
        phoneNumber: phoneValid() ? this.form.controls['tel'].value : null,
        joinDate: new Date(),
        ehByUserRef: ehRef,
        activeUser: true,
        hideContactInformation: false,
        paxNumber: paxNumber + 1,
        ehLocationRef: locationRef,
        notificationFrequency: NotificationFrequency.All
      };

      // Removed:
      // sector: this.form.controls['sector'].value,
      // zipcode: this.form.controls['zipcode'].value,
    
      const newUserAdded = await this.paxManagerService.addNewUser(pax);
      if (newUserAdded && newUserAdded.id) {
        window.alert(`Welcome to F3 Omaha, ${this.form.controls['f3Name'].value}!`);
        this.router.navigate(['home']);
      } else {
        console.error("Error in adding user", newUserAdded);
      }

    } else {
      console.error("Error, form is not valid");
    }
  }

  public displayF3NameOptions(option: any) {
    return option.f3Name;
  }

  public displayLocationNameOptions(option: any) {
    return option.name;
  }

  public getEmailErrorMessage(): string {
    if (this.form.controls['email'].hasError('required')) {
      return 'You must enter a value';
    }
    return this.form.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  public getF3NameError(): string {
    if (this.form.controls['f3Name'].getError('nameExists')) {
      return "FYI: This F3 name exists in F3Omaha";
    }
    return '';
  }

  private async doesF3NameExist(f3Name: string): Promise<boolean> {
    return await this.paxSearchService.doesF3NameExist(f3Name);
  }

  private async findEhF3Name(partialF3Name: string): Promise<any[]> {
    return await this.paxSearchService.findF3Name(partialF3Name);
  }

  private async findLocationByName(partialLocationName: string): Promise<any[]> {
    return await this.locationSearchService.findByName(partialLocationName);
  }

  private paxF3NameValidator(): AsyncValidatorFn {
    return control => control.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(async (value: any) => await this.doesF3NameExist(value)),
      map((value) => {
        if (value) {
          return { nameExists: true };
        }
        return null;
      }),
      first());
  }

  private async updateEHAutocompleteResults(partialF3Name: string): Promise<void> {
    const result = await this.findEhF3Name(partialF3Name);
    const pax = result.map((res) => {
      return { 
        userRef: res.path, 
        f3Name: res.f3Name 
      };
    })
    this.filteredEhF3OptionsSubject.next(pax);
  }

  private async updateLocationAutocompleteResults(partialLocationName: string): Promise<void> {
    const result = await this.findLocationByName(partialLocationName);
    const locations = result.map((res) => {
      return { 
        aoRef: res.path, 
        name: res.name 
      };
    })
    this.filteredLocationOptionsSubject.next(locations);
  }
}
