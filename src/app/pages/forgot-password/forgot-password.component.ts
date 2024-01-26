import { Component } from '@angular/core';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  email: string = "";
  errorMessage: string = "";
  secureCode: string = "";
  newPassword: string = "";
  sendCodeStage = true;
  enterCodeStage = false;
  submitted = false;

  constructor(private userService: UserAuthenticationService) { }

  ngOnInit(): void {
  }

  async sendEmail() {
    if(!this.email) {
      return;
    }
    try {
      await this.userService.forgotPasswordEmail(this.email);
    } catch(err) {
      const error = err as Error;
      if (error.message.includes("user-not-found")) {
        this.errorMessage = "We have no account for this user";
      } else if (error.message.includes("invalid-email")) {
        this.errorMessage = "Email is not valid, double check the value.";
      } else {
        this.errorMessage = error.message;
      }
      return;
    }
    this.submitted = true;
    // this.flipStages();
  }

  async submitPasswordChange() {
    if(!this.secureCode || !this.newPassword) {
      return;
    }
    await this.userService.confirmPasswordChange(this.secureCode, this.newPassword);
  }

  flipStages() {
    this.sendCodeStage = false;
    this.enterCodeStage = true;
  }
}
