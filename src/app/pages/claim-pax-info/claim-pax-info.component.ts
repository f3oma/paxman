import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PhoneNumber } from 'src/app/models/phonenumber.model';

@Component({
  selector: 'app-claim-pax-info',
  templateUrl: './claim-pax-info.component.html',
  styleUrls: ['./claim-pax-info.component.scss']
})
export class ClaimPaxInfoComponent {

  f3NameFormControl = new FormControl('', [Validators.required]);

  form: FormGroup = new FormGroup({
    f3Name: this.f3NameFormControl,
    tel: new FormControl(new PhoneNumber('', '', '')),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor() {}

  public getEmailErrorMessage(): string {
    if (this.form.controls['email'].hasError('required')) {
      return 'You must enter a value';
    }
    return this.form.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  // If the user says an F3 name exists, we need to figure out a solution to satisfy
  // Possibly list close names??
  public getF3NameError(): string {
    // If the name entered does not exist, get related names that might match from Algolia
    if (this.form.controls['f3Name'].getError('nameDoesNotExist')) {
      return "This F3 name exists in F3Omaha";
    }
    return '';
  }
}
