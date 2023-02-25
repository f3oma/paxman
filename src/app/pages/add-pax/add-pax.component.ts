import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, first, map, switchMap } from 'rxjs';
import { PhoneNumber } from 'src/app/models/phonenumber.model';
import { PaxUser } from 'src/app/models/users.model';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { PaxSearchService } from 'src/app/services/pax-search.service';

@Component({
  selector: 'app-add-pax',
  templateUrl: './add-pax.component.html',
  styleUrls: ['./add-pax.component.scss']
})
export class AddPaxComponent {

  f3NameFormControl = new FormControl('', [Validators.required]);

  form: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    f3Name: this.f3NameFormControl,
    tel: new FormControl(new PhoneNumber('', '', '')),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(
    private readonly paxSearchService: PaxSearchService,
    private readonly paxManagerService: PaxManagerService,
    private readonly router: Router) {
    this.f3NameFormControl.setAsyncValidators(this.paxF3NameValidator());
  }

  public async addPax(): Promise<void> {
    if(this.form.valid) {
      const phoneValid = () => {
        const value = this.form.controls['tel'].value;
        if (value?.area !== '') {
          return true;
        }
        return false;
      }
      const pax: PaxUser = {
        firstName: this.form.controls['firstName'].value,
        lastName: this.form.controls['lastName'].value,
        f3Name: this.form.controls['f3Name'].value,
        email: this.form.controls['email'].value,
        phoneNumber: phoneValid() ? this.form.controls['tel'].value : null,
      };
      const newUserAdded = await this.paxManagerService.addNewUser(pax);
      if (newUserAdded && newUserAdded.id) {
        this.router.navigate(['home']);
      } else {
        console.error("ERR", newUserAdded);
      }
    } else {
      console.log("ERROR");
    }
  }

  public getEmailErrorMessage(): string {
    if (this.form.controls['email'].hasError('required')) {
      return 'You must enter a value';
    }
    return this.form.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  public getF3NameError(): string {
    if (this.form.controls['f3Name'].getError('nameExists')) {
      return "This F3 name exists in F3Omaha";
    }
    return '';
  }

  private async doesF3NameExist(f3Name: string): Promise<PaxUser[]> {
    return await this.paxSearchService.getPaxByF3Name(f3Name);
  }

  private paxF3NameValidator(): AsyncValidatorFn {
    return control => control.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap((value: any) => this.doesF3NameExist(value)),
      map((value) => {
        if (value && value.length > 0) {
          return { nameExists: true };
        }
        return null;
      }),
      first());
  }

}
