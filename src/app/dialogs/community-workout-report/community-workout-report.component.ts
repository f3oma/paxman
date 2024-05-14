import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IBeatdownAttendance } from 'src/app/models/beatdown-attendance';
import { Beatdown } from 'src/app/models/beatdown.model';
import { PaxUser } from 'src/app/models/users.model';
import { BeatdownService } from 'src/app/services/beatdown.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { WorkoutManagerService } from 'src/app/services/workout-manager.service';

export interface CommunityWorkoutReportProps {
  user: PaxUser;
  beatdown: Beatdown;
}

@Component({
  selector: 'app-community-workout-report',
  templateUrl: './community-workout-report.component.html',
  styleUrls: ['./community-workout-report.component.scss']
})
export class CommunityWorkoutReportComponent {

  form: FormGroup = new FormGroup({
    'totalPaxCount': new FormControl(''),
  });

  user: PaxUser;
  beatdown: Beatdown;

  constructor(
    private workoutService: WorkoutManagerService,
    private beatdownService: BeatdownService,
    private userService: PaxManagerService,
    public dialogRef: MatDialogRef<CommunityWorkoutReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CommunityWorkoutReportProps) {
      this.user = data.user;
      this.beatdown = data.beatdown;
    }

  async submit() {
    if (this.form.valid) {
      const beatdown = this.beatdown;

      // Add Q's to workout attendance
      const qRefs = [];
      if (beatdown.qUser) {
        qRefs.push(this.userService.getUserReference(`users/${beatdown.qUser.id}`));
      }
      if (beatdown.coQUser) {
        qRefs.push(this.userService.getUserReference(`users/${beatdown.coQUser.id}`));
      }
      if (beatdown.additionalQs && beatdown.additionalQs.length > 0) {
        for (let q of beatdown.additionalQs) {
          if (!q) {
            continue;
          }
          const ref = this.userService.getUserReference(`users/${q.id}`);
          qRefs.push(ref);
        }
      }

      const beatdownRef = this.beatdownService.getBeatdownReference(beatdown.id);
      let workoutData: Partial<IBeatdownAttendance> = {
        beatdown: beatdownRef,
        totalPaxCount: this.form.controls['totalPaxCount'].value,
        usersAttended: qRefs,
        qReported: true
      };

      await this.workoutService.createCommunityReportWithValidation(workoutData);
      this.dialogRef.close(beatdown);
    } else {
      alert("Check inputs and try again");
    }
  }

  userCancel() {
    this.dialogRef.close();
  }
}