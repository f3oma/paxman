import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  signInErrorMessage: string = "";

  constructor(
    private readonly userAuthService: UserAuthenticationService,
    private readonly router: Router) {
      this.registerForm.addValidators(this.checkPasswords);
      this.registerForm.updateValueAndValidity();
    }

  public async registerUser() {
    const email = this.registerForm.controls['email'].value;
    const password = this.registerForm.controls['password'].value;
    const confirmPassword = this.registerForm.controls['confirmPassword'].value;
    if (this.registerForm.valid && email && password && confirmPassword === password) {
      try {
        const result = await this.userAuthService.registerEmailPassword(email, password);
        this.router.navigate(['login']);
      } catch (err: any) {
        this.signInErrorMessage = err.message;
      }
    } else {
      this.signInErrorMessage = "Error: Please double check your inputs"
    }
  }

  private checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => { 
    let pass = this.registerForm.controls.password.value;
    let confirmPass = this.registerForm.controls.password.value
    return pass === confirmPass ? null : { notSame: true }
  }
}
