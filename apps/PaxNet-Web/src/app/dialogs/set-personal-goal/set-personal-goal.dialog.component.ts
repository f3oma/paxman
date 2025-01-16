import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserSelectedGoalOptions } from 'src/app/utils/challenges';

export type SetPersonalGoalDialogProps = {
    personalGoalName: string;
    goalOptions: UserSelectedGoalOptions[];
}

export type SetPersonalGoalDialogResult = {
    goal: number; // Support more types?
}

@Component({
    selector: 'set-personal-goal-dialog',
    templateUrl: './set-personal-goal.dialog.component.html',
    styleUrls: ['./set-personal-goal.dialog.component.scss']
})
export class SetPersonalGoalDialog {
    personalGoalForm: FormGroup = new FormGroup({
      'goal': new FormControl(0),
    }, Validators.required);

    userSaveLoading: boolean = false;
    goalOptions: { name: string; value: number; }[]

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: SetPersonalGoalDialogProps,
        public dialogRef: MatDialogRef<SetPersonalGoalDialog>) {
            this.goalOptions = data.goalOptions;
    }

    submit() {
        if (this.personalGoalForm.valid) {
            this.dialogRef.close({ goal: this.personalGoalForm.controls['goal'].value });
        }
    }

    userCancel() {
        this.dialogRef.close();
    }
}