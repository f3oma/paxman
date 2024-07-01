import { Component, Inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BehaviorSubject, Observable, Subject, debounceTime, map } from 'rxjs';
import { AOCategory } from 'src/app/models/ao.model';
import { PreActivity, UserReportedWorkout } from 'src/app/models/beatdown-attendance';
import { BaseChallenge, ChallengeState, ChallengeType, IterativeCompletionChallenge } from 'src/app/models/user-challenge.model';
import { PaxUser } from 'src/app/models/users.model';
import { BeatdownSearchService } from 'src/app/services/beatdown-search.service';
import { BeatdownService } from 'src/app/services/beatdown.service';
import { ChallengeManager } from 'src/app/services/challenge-manager.service';
import { WorkoutManagerService } from 'src/app/services/workout-manager.service';
import { Challenges } from 'src/app/utils/challenges';

export interface UserReportedWorkoutProps {
  user: PaxUser,
  activeChallenges: BaseChallenge[];
}

export const enum AvailableTabs {
  F3Omaha = "F3Omaha",
  Downrange = "Downrange",
  ShieldLock = "ShieldLock",
};

@Component({
  selector: 'app-personal-workout-report',
  templateUrl: './personal-workout-report.component.html',
  styleUrls: ['./personal-workout-report.component.scss']
})
export class PersonalWorkoutReportComponent {
  f3OmahaForm: FormGroup = new FormGroup({
    'beatdown': new FormControl(''),
    'preActivity': new FormControl('None'),
    'notes': new FormControl(''),
    'murphChallengeActivity': new FormControl(false)
  });

  downrangeForm: FormGroup = new FormGroup({
    'downrangeAOName': new FormControl(''),
    'preActivity': new FormControl('None'),
    'notes': new FormControl(''),
    'date': new FormControl(new Date()),
    'murphChallengeActivity': new FormControl(false)
  });

  shieldLockForm: FormGroup = new FormGroup({
    'preActivity': new FormControl('None'),
    'notes': new FormControl(''),
    'date': new FormControl(new Date()),
    'murphChallengeActivity': new FormControl(false)
  });

  user: PaxUser;
  activeChallenges: BaseChallenge[] = [];
  murphChallenge: boolean = false;
  userSaveLoading: boolean = false;

  filteredBeatdownOptionsSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);
  filteredBeatdownOptions$: Observable<any[]> = this.filteredBeatdownOptionsSubject.asObservable();
  selectedBeatdownOption: any = '';

  activeTab: AvailableTabs = AvailableTabs.F3Omaha;

  constructor(
    private workoutService: WorkoutManagerService,
    private beatdownSearchService: BeatdownSearchService,
    private beatdownService: BeatdownService,
    private challengeManager: ChallengeManager,
    public dialogRef: MatDialogRef<PersonalWorkoutReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserReportedWorkoutProps
    ) {
    this.user = data.user;
    this.activeChallenges = data.activeChallenges;

    this.murphChallenge = this.activeChallenges.filter((challenge) => {
      if (challenge.type === ChallengeType.IterativeCompletions && 
        challenge.name === Challenges.SummerMurph2024 &&
        new Date(challenge.startDateString) < new Date()) {
          return true;
        }
        return false;
    }).length > 0;

    this.f3OmahaForm.controls['preActivity'].setValue('None');
    this.f3OmahaForm.controls['beatdown'].valueChanges.pipe(
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
    let workoutData = null;

    if (this.activeTab === AvailableTabs.F3Omaha) {
      workoutData = await this.validateF3OmahaForm();
    } else if (this.activeTab === AvailableTabs.Downrange) {
      workoutData = await this.validateDownrangeForm();
    } else if (this.activeTab === AvailableTabs.ShieldLock) {
      workoutData = await this.validateShieldLockForm();
    }

    if (!workoutData) {
      return;
    }

    await this.workoutService.createPersonalReportedWorkout(workoutData, this.user);

    // Challenges, this will need to be centralized...
    if (this.activeChallenges.length > 0) {
      for (let challenge of this.activeChallenges) {

        // Do we have an active challenge
        if (challenge.type === ChallengeType.IterativeCompletions && 
          challenge.name === Challenges.SummerMurph2024 &&
          new Date(challenge.startDateString) < new Date()) {

            const iterativeChallenge = challenge as IterativeCompletionChallenge;
            iterativeChallenge.updateState(ChallengeState.InProgress);

            if (workoutData.preActivity === PreActivity.Murph || workoutData.preActivity === PreActivity.Smurph) {
              iterativeChallenge.addNewIteration();
            }

            if (this.challengeIterationCompleted()) {
              iterativeChallenge.addNewIteration();
            }

            if (iterativeChallenge.isComplete()) {
              await this.challengeManager.completeChallenge(iterativeChallenge);
            }

            await this.challengeManager.updateChallenge(iterativeChallenge);
        }
      }
    }

    this.dialogRef.close();
  }

  private challengeIterationCompleted(): boolean {
    let iterationCompleted = false;
    if (this.activeTab === AvailableTabs.F3Omaha) {
      iterationCompleted = this.f3OmahaForm.controls['murphChallengeActivity'].value;
    } else if (this.activeTab === AvailableTabs.Downrange) {
      iterationCompleted = this.downrangeForm.controls['murphChallengeActivity'].value;
    } else if (this.activeTab === AvailableTabs.ShieldLock) {
      iterationCompleted = this.shieldLockForm.controls['murphChallengeActivity'].value;
    }
    return iterationCompleted;
  }

  async validateF3OmahaForm() {
    if (this.f3OmahaForm.valid) {
      const beatdown = this.f3OmahaForm.controls['beatdown'].value;
      const beatdownRef = this.beatdownService.getBeatdownReference(beatdown.ref);
      let workoutData: UserReportedWorkout = {
        preActivity: this.f3OmahaForm.controls['preActivity'].value,
        date: beatdown.date,
        beatdown: beatdownRef,
        notes: this.f3OmahaForm.controls['notes'].value,
      }
      return workoutData;
    } else {
      this.userSaveLoading = false;
      alert("Check inputs and try again");
      return null;
    }
  }

  async validateDownrangeForm(): Promise<UserReportedWorkout | null> {
    if (this.downrangeForm.valid) {
      const downrangeAOName = this.downrangeForm.controls['downrangeAOName'].value;
      const date = this.downrangeForm.controls['date'].value;
      const beatdownRef = await this.beatdownService.generateDownrangeBeatdown(downrangeAOName, date);
      let workoutData: UserReportedWorkout = {
        preActivity: this.downrangeForm.controls['preActivity'].value,
        notes: this.downrangeForm.controls['notes'].value,
        date: date,
        beatdown: beatdownRef
      }
      return workoutData;
    } else {
      this.userSaveLoading = false;
      alert("Check inputs and try again");
      return null;
    }
  }

  async validateShieldLockForm(): Promise<UserReportedWorkout | null> {
    if (this.shieldLockForm.valid) {
      const date = this.shieldLockForm.controls['date'].value;
      const beatdownRef = await this.beatdownService.generateShieldLockBeatdown(date);
      let workoutData: UserReportedWorkout = {
        preActivity: this.shieldLockForm.controls['preActivity'].value,
        notes: this.shieldLockForm.controls['notes'].value,
        date: date,
        beatdown: beatdownRef
      }
      return workoutData;
    } else {
      this.userSaveLoading = false;
      alert("Check inputs and try again");
      return null;
    }
  }

  public displayBeatdownOptions(option: any) {
    if (!option)
      return '';

    const date = option.date;
    return `${date.toDateString('MM/dd')} - ${option.name}`;
  }

  userCancel() {
    this.dialogRef.close();
  }

  changedTab(event: any) {
    const idx =  event.index;
    if (idx === 0) {
      this.activeTab = AvailableTabs.F3Omaha;
    } else if (idx === 1) {
      this.activeTab = AvailableTabs.Downrange;
    } else if (idx === 2) {
      this.activeTab = AvailableTabs.ShieldLock;
    }
  }

  private async updateBeatdownAutocompleteResults(partialBeatdownQuery: string): Promise<void> {
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
