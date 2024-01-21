import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticatedUser } from 'src/app/models/authenticated-user.model';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  /**
   * The architecture of this login flow is as such:
   * First the user will need an account, if they have an account, they can log in. Done.
   * If no account, they'll sign up via email + traditional password OR use Google through 0Auth to make an account.
   * 
   * After we have a user auth account created through Firebase, we need to associate that Auth account to the user's F3 Data.
   *
   * F3 Data is currently stored with Email, F3 Name, Phone Number, name, etc. We need the user to associate their account to that data
   * through a verification process. F3 Name + email, F3 Name + phone number used on account. If a user has an issue claiming their data, we can create a
   * "Having trouble?" link that would somehow get us in contact with them for manual verification. Slack?
   */

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  signInErrorMessage: string = "";

  constructor(private userAuthenticationService: UserAuthenticationService, private router: Router) {

  }

  public async loginUser() {
    const email = this.loginForm.controls['email'].value;
    const password = this.loginForm.controls['password'].value;
    if(this.loginForm.valid && email && password) {
      try {
        const user: AuthenticatedUser = await this.userAuthenticationService.loginUserEmailPassword(email, password);
        if (user) {
          await this.navigate(user);
        }
      } catch (err: any) {
        console.error(err);
        this.signInErrorMessage = "Invalid credentials";
        setTimeout(() => {
          this.signInErrorMessage = "";
        }, 4000);
      }
    }
  }

  public async loginWithGoogle() {
    try {
      const user: AuthenticatedUser = await this.userAuthenticationService.loginWithGoogle();
      await this.navigate(user);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('account-exists-with-different-credential')) {
        this.signInErrorMessage = "An account already exists using this associated email";
      }
    }
  }

  public async loginWithX() {
    try {
      const user: AuthenticatedUser = await this.userAuthenticationService.loginWithX();
      await this.navigate(user);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('account-exists-with-different-credential')) {
        this.signInErrorMessage = "An account already exists using this associated email";
      }
    }
  }

  private async navigate(user: AuthenticatedUser) {
    // If the user does not have PAX data, push them to claim it on profile page...
    if (!user.paxDataId || user.paxDataId === undefined) {
      await this.router.navigate(['settings']);
    } else {
      await this.router.navigate(['home']);
    }
  }
}
