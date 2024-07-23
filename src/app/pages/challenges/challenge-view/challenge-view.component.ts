import { transition, trigger, useAnimation } from '@angular/animations';
import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser } from 'src/app/models/authenticated-user.model';
import { BaseChallenge, ChallengeState, ChallengeType, IterativeCompletionChallenge } from 'src/app/models/user-challenge.model';
import { PaxUser } from 'src/app/models/users.model';
import { ChallengeManager } from 'src/app/services/challenge-manager.service';
import { PaxManagerService } from 'src/app/services/pax-manager.service';
import { UserAuthenticationService } from 'src/app/services/user-authentication.service';
import { fadeIn, fadeOut } from 'src/app/utils/animations';
import { ChallengeInformation, ChallengeStatus, Challenges, IterativeCompletionRequirements, getChallengeIdByName, getChallengesEnumKeyByValue } from 'src/app/utils/challenges';

@Component({
  selector: 'app-challenge-view',
  templateUrl: './challenge-view.component.html',
  styleUrls: ['./challenge-view.component.scss'],
  animations: [
    trigger("fadeInOut", [
      transition("void => *", [useAnimation(fadeIn)]),
      transition("* => void", [useAnimation(fadeOut)]),
    ])
  ]
})
export class ChallengeViewComponent implements OnInit {  
  public authUserData$: Observable<AuthenticatedUser | undefined>;
  public displayedColumns: string[] = ['f3Name', 'status', 'totalCompleted'];
  public tableData: BaseChallenge[] = [];
  public dataSource: any;
  public showChallengeNotFoundError = false;
  public loading = true;
  public challengeInformation: ChallengeInformation | null = null;
  public paxChallengeData: BaseChallenge | undefined;
  private paxUser: PaxUser | undefined = undefined;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private challengeManager: ChallengeManager,
    private userAuthService: UserAuthenticationService,
    private paxManagerService: PaxManagerService,
    private location: Location, 
    private route: ActivatedRoute) {
      this.authUserData$ = this.userAuthService.authUserData$.pipe(
        tap(async (data) => {
            const paxDataId = data?.paxDataId;
            if (paxDataId && paxDataId !== undefined) {
                await this.getPaxUserData(paxDataId);
            }
        })
      );
  }

  async ngOnInit() {
    const name = this.route.snapshot.paramMap.get('name');
    if (name !== null) {
      const challenge = getChallengesEnumKeyByValue(name);
      if (challenge !== undefined) {
        await this.getChallengeData(challenge);
        return;
      }
    }
    this.showChallengeNotFoundError = true;
  }

  async getPaxUserData(id: string) {
    this.paxUser = await (await this.paxManagerService.getDataByAuthId(id)).data();
    if (this.challengeInformation && this.paxUser) {
      this.paxChallengeData = await this.challengeManager.getUserChallengeData(this.challengeInformation.name, this.paxUser!.id);
      this.refreshData(this.tableData);
    }
  }

  async withdraw() {
    if (confirm("Are you sure? All challenge progress will be lost.") && this.paxChallengeData) {
      await this.challengeManager.withdrawUserFromChallenge(this.paxChallengeData);
      this.paxChallengeData = undefined;
      this.tableData = this.tableData.filter((a) => !(a.paxUser.id === this.paxUser!.id));
      this.refreshData(this.tableData);
    }
  }

  async joinChallenge() {
    if (this.challengeInformation?.type === ChallengeType.IterativeCompletions) {
        const completionRequirements = this.challengeInformation.completionRequirements as IterativeCompletionRequirements;
        const challengeState = this.challengeInformation.status === ChallengeStatus.PreRegistration ? ChallengeState.PreRegistered : ChallengeState.NotStarted;
        const iterativeChallenge: IterativeCompletionChallenge = new IterativeCompletionChallenge({
            id: '',
            paxUser: this.paxUser!,
            type: this.challengeInformation.type,
            state: challengeState,
            startDateString: this.challengeInformation.startDateString,
            endDateString: this.challengeInformation.endDateString,
            endDateTime: new Date(this.challengeInformation.endDateString),
            name: this.challengeInformation.name,
            totalToComplete: completionRequirements.totalCompletionsRequired,
            activeCompletions: 0
        });
        await this.challengeManager.startChallenge(iterativeChallenge);
        this.paxChallengeData = iterativeChallenge;
        this.tableData.push(iterativeChallenge);
        this.refreshData(this.tableData);
    }
  }

  getStateForDisplay(state: ChallengeState) {
    switch(state) {
      case ChallengeState.PreRegistered:
        return "Pre-Registered";
      case ChallengeState.NotStarted:
        return "Not Started";
      case ChallengeState.Completed:
        return "🌟 Completed";
      case ChallengeState.Failed:
        return "DNF";
      case ChallengeState.InProgress:
        return "In Progress";
      default:
        return "Unknown";
    }
  }

  canJoinChallenge() {
    if (this.challengeInformation) {
      if (new Date() < new Date(this.challengeInformation.endDateString)) {
        return true;
      }
    }
    return false;
  }

  async getChallengeData(challenge: Challenges) {
    const id = getChallengeIdByName(challenge);
    if (!id) {
      console.error("Unknown challenge");
      return;
    }

    const tableData = await this.challengeManager.getAllChallengeParticipants(challenge);
    if (!tableData) {
      this.showChallengeNotFoundError = true;
    }

    const challengeInformation: ChallengeInformation = await this.challengeManager.getChallengeInformation(id);

    // As soon as a challenge is active, set the state of all entries to in-progress
    // and update challenge information to started
    if (new Date(challengeInformation.startDateString) < new Date() && 
      challengeInformation.status === ChallengeStatus.PreRegistration) {
      challengeInformation.status = ChallengeStatus.Started;
      await this.challengeManager.updateChallengeInformation(challengeInformation);
      const promises: Promise<any>[] = [];
      for (let challengeEntry of tableData) {
        if (challengeEntry.state === ChallengeState.PreRegistered) {
          challengeEntry.updateState(ChallengeState.InProgress);
          promises.push(this.challengeManager.updateChallenge(challengeEntry));
        }
      }
      await Promise.all(promises);
    }

    this.challengeInformation = challengeInformation;
    if (this.challengeInformation?.status === ChallengeStatus.PreRegistration) {
      this.displayedColumns = ['f3Name', 'status'];
    }
    this.refreshData(tableData);
    this.loading = false;
  }

  refreshData(challenges: BaseChallenge[]) {
    let sorted = challenges;
    // If user is in the challenge put them first, followed by sotred completed status
    if (this.paxChallengeData) {
      sorted = sorted.sort((a, b) => {
        if (a.id === this.paxChallengeData!.id) {
          return -1;
        } else if (b.id === this.paxChallengeData!.id) {
          return 1;
        } else if (b.state === ChallengeState.Completed) {
          return 0;
        }
        return 0;
      })
    } else {
      // Sort by completion status only
      sorted = sorted.sort((a, b) => {
        if (a.state === ChallengeState.Completed) {
          return -1;
        } else if (b.state !== ChallengeState.Completed) {
          return 1;
        }
        return 0;
      })
    }
    this.tableData = sorted;
    this.dataSource = new MatTableDataSource(this.tableData);
    this.dataSource.sort = this.sort;
  }
  
  getRowCount() {
    return this.tableData.length;
  }

  goBack() {
    this.location.back();
  }

}
