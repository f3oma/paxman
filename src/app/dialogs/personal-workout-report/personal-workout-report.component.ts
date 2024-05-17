import { Component, Inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subject, debounceTime, map } from 'rxjs';
import { UserReportedWorkout } from 'src/app/models/beatdown-attendance';
import { PaxUser } from 'src/app/models/users.model';
import { BeatdownSearchService } from 'src/app/services/beatdown-search.service';
import { BeatdownService } from 'src/app/services/beatdown.service';
import { WorkoutManagerService } from 'src/app/services/workout-manager.service';

export interface UserReportedWorkoutProps {
  user: PaxUser
}

@Component({
  selector: 'app-personal-workout-report',
  templateUrl: './personal-workout-report.component.html',
  styleUrls: ['./personal-workout-report.component.scss']
})
export class PersonalWorkoutReportComponent {

  form: FormGroup = new FormGroup({
    'preActivity': new FormControl(''),
    'beatdown': new FormControl('')
  });

  user: PaxUser;
  userSaveLoading: boolean = false;

  filteredBeatdownOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredBeatdownOptions$: Observable<any[]> = this.filteredBeatdownOptionsSubject.asObservable();
  selectedBeatdownOption: any = '';

  constructor(
    private workoutService: WorkoutManagerService,
    private beatdownSearchService: BeatdownSearchService,
    private beatdownService: BeatdownService,
    public dialogRef: MatDialogRef<PersonalWorkoutReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserReportedWorkoutProps
    ) {
    this.user = data.user;

    this.form.controls['preActivity'].setValue('None');
    this.form.controls['beatdown'].valueChanges.pipe(
      debounceTime(1000),
      map(async (value: string) => {
          if (value) {
              await this.updateBeatdownAutocompleteResults(value);
          }
          return [];
      })).subscribe();

  }

  async submit() {
    this.userSaveLoading = true;
    if (this.form.valid) {
      const beatdown = this.form.controls['beatdown'].value;
      const beatdownRef = this.beatdownService.getBeatdownReference(beatdown.ref);
      let workoutData: UserReportedWorkout = {
        preActivity: this.form.controls['preActivity'].value,
        date: beatdown.date,
        beatdown: beatdownRef
      }
      await this.workoutService.createPersonalReportedWorkout(workoutData, this.user);
      this.dialogRef.close();
    } else {
      this.userSaveLoading = false;
      alert("Check inputs and try again");
    }
  }

  public displayBeatdownOptions(option: any) {
    const date = option.date;
    return `${date.toDateString('MM/dd')} - ${option.name}`;
  }

  userCancel() {
    this.dialogRef.close();
  }

  private async updateBeatdownAutocompleteResults(partialBeatdownQuery: string): Promise<void> {
    // Assuming user will filter by either Event Name or AO name...
    // Filter down to dates yesterday and today for possible late reports
    const result = await this.findBeatdownByName(partialBeatdownQuery);
    const beatdowns = result.map((res) => {
        const date = new Date(res.date);
        date.setHours(date.getHours() + 5);
        return { 
            ref: res.path,
            date: date,
            name: res.eventName ?? res.aoName
        };
    });
    this.filteredBeatdownOptionsSubject.next(beatdowns);
  }

  private async findBeatdownByName(partialBeatdownName: string): Promise<any[]> {
    return await this.beatdownSearchService.findByName(partialBeatdownName);
  }
}
