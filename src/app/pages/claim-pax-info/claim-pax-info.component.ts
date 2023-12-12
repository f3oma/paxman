import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticatedUser } from 'src/app/models/admin-user.model';
import { PhoneNumber } from 'src/app/models/phonenumber.model';
import { IClaimUserInfo, IPaxUser, PaxUser } from 'src/app/models/users.model';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-claim-pax-info',
  templateUrl: './claim-pax-info.component.html',
  styleUrls: ['./claim-pax-info.component.scss']
})
export class ClaimPaxInfoComponent {

  form: FormGroup = new FormGroup({
    f3Name: new FormControl('', [Validators.required]),
    tel: new FormControl(new PhoneNumber('', '', ''), [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });
  errorMessage = "";
  searched = false;

  authenticatedUser: AuthenticatedUser | undefined;
  paxForDisplay: Array<IPaxUser> = [];
  originalPaxResult: Array<PaxUser> = [];
  loggedInEmailMatchFound: boolean = false;
  loggedInMatchedUserData: IPaxUser | undefined = undefined;

  constructor(
    private userAuth: UserAuthenticationService,
    private router: Router
  ) {
    this.userAuth.authUserData$.subscribe((res) => {
      this.authenticatedUser = res;
      if (res) {
        this.tryInitialEmailClaim();
      }
    })
  }

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

  public async tryInitialEmailClaim() {
    if (this.authenticatedUser) {
      const info: Partial<IClaimUserInfo> = {
        email: this.authenticatedUser.getEmail()
      };
      const res = await this.userAuth.tryClaimF3Info(this.authenticatedUser, info);
      if (res.length > 0) {
        this.loggedInEmailMatchFound = true;
        const props = res[0].toProperties();
        this.loggedInMatchedUserData = props;
        this.originalPaxResult = res;
      }
    }
  }

  public async tryClaimF3Info() {
    if (this.form.valid && this.authenticatedUser) {
      const info: IClaimUserInfo = {
        f3Name: this.form.controls['f3Name'].value,
        phoneNumber: this.form.controls['tel'].value,
        email: this.form.controls['email'].value,
      };
      const res = await this.userAuth.tryClaimF3Info(this.authenticatedUser, info);
      this.originalPaxResult = res;
      this.paxForDisplay = res.map((v) => v.toProperties());
      this.searched = true;

      if (res.length === 0) {
        // Error, we did not find matching data.
        this.setErrorMessage("We did not find any matching data for this information. Did you sign up under another email or phone number?");
      } else if (res.length === 1) {
        // We found a single match

      } else {
        // We found multiple matches;
        this.paxForDisplay = res;
      }
    } else {
      this.setErrorMessage("Please double check fields, they're all required.");
    }
  }

  public async claimData(paxInfo: IPaxUser) {
    if (this.authenticatedUser) {
      const paxMap = this.originalPaxResult.filter((e) => e.f3Name === paxInfo.f3Name)[0];
      await this.userAuth.completeF3InfoClaim(this.authenticatedUser, paxMap);
      alert("Your F3 Information has been claimed");
      this.router.navigate(['home']);
    } else {
      throw new Error("User not logged in");
    }
  }

  private setErrorMessage(text: string) {
    this.errorMessage = text;
      setTimeout(() => {
        this.errorMessage = "";
      }, 4000);
  }
}
