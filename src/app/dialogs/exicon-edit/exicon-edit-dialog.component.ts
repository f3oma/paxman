import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Exercise } from "src/app/models/exercise.model";

export interface ExerciseDialogData {
    exercise: Exercise;
}

@Component({
    selector: 'exicon-edit-dialog',
    templateUrl: 'exicon-edit-dialog.component.html',
    styleUrls: ['./exicon-edit-dialog.component.scss']
})
export class ExiconEditDialog {

    exercise: Exercise | null = null;

    form: FormGroup = new FormGroup({
        name: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
    });
    
    constructor(
        public dialogRef: MatDialogRef<ExiconEditDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Exercise) {
            this.exercise = data;
            console.log(this.data);
            this.form.controls['description'].setValue(this.exercise.description);
            this.form.controls['name'].setValue(this.exercise.name);
    }

    public save() {
        if (this.form.valid) {
            const result = {
                name: this.form.controls['name'].value,
                description: this.form.controls['description'].value
            };
            this.dialogRef.close(result)
        }
    }

    public cancel() {
        this.dialogRef.close();
    }
}