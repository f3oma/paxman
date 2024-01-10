import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'account-created-successfully-dialog',
  templateUrl: 'account-created-successfully.component.html',
})
export class AccountCreatedSuccessfullyDialog {

  constructor(public dialogRef: MatDialogRef<AccountCreatedSuccessfullyDialog>) {}

}