import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BaseChallenge, ChallengeState, ChallengeType, IIterativeCompletionChallenge, IterativeCompletionChallenge } from "src/app/models/user-challenge.model";
import { ChallengeManager } from "src/app/services/challenge-manager.service";

export interface ChallengeDetailProps {
    challenge: ChallengeInformation;
}

export interface IterativeCompletionRequirements {
    totalCompletionsRequired: number;
}

export interface ChallengeInformation {
    description: string;
    imageSrc: string;
    challengeBase: BaseChallenge;
    completionRequirements: IterativeCompletionRequirements;
}

@Component({
    selector: 'challenge-detail',
    templateUrl: './challenge-detail.component.html',
    styleUrls: ['./challenge-detail.component.scss']
  })
  export class ChallengeDetail {

    challenge: ChallengeInformation;
    showCompleteMessage = false;

    constructor(    
        public challengeManager: ChallengeManager,
        public dialogRef: MatDialogRef<ChallengeDetail>,
        @Inject(MAT_DIALOG_DATA) public data: ChallengeDetailProps) {
          this.challenge = data.challenge;
    }

    get isActive(): boolean {
        if (!this.challenge) {
            return false;
        }
        const today = new Date();
        const startTime = new Date(this.challenge.challengeBase.startDateString);
        const endTime = new Date(this.challenge.challengeBase.endDateString);

        if (startTime <= today && endTime > today) {
            return true;
        }
        return false;
    }

    async joinChallenge() {
        if (this.challenge.challengeBase.type === ChallengeType.IterativeCompletions) {
            const completionRequirements = this.challenge.completionRequirements as IterativeCompletionRequirements;
            const iterativeChallenge: IterativeCompletionChallenge = new IterativeCompletionChallenge({
                id: '',
                paxUser: this.challenge.challengeBase.paxUser,
                type: this.challenge.challengeBase.type,
                state: ChallengeState.NotStarted,
                startDateString: this.challenge.challengeBase.startDateString,
                endDateString: this.challenge.challengeBase.endDateString,
                name: this.challenge.challengeBase.name,
                totalToComplete: completionRequirements.totalCompletionsRequired,
                activeCompletions: 0
            });
            await this.challengeManager.startChallenge(iterativeChallenge);
            this.showCompleteMessage = true;
            setTimeout(() => {
                this.dialogRef.close();
            }, 3000);
        }
    }

    async preRegister() {
        if (this.challenge.challengeBase.type === ChallengeType.IterativeCompletions) {
            const completionRequirements = this.challenge.completionRequirements as IterativeCompletionRequirements;
            const iterativeChallenge: IterativeCompletionChallenge = new IterativeCompletionChallenge({
                id: '',
                paxUser: this.challenge.challengeBase.paxUser,
                type: this.challenge.challengeBase.type,
                state: ChallengeState.PreRegistered,
                startDateString: this.challenge.challengeBase.startDateString,
                endDateString: this.challenge.challengeBase.endDateString,
                name: this.challenge.challengeBase.name,
                totalToComplete: completionRequirements.totalCompletionsRequired,
                activeCompletions: 0
            });
            await this.challengeManager.startChallenge(iterativeChallenge);
            this.showCompleteMessage = true;
            setTimeout(() => {
                this.dialogRef.close();
            }, 3000);
        }
    }

    userCancel() {
        this.dialogRef.close();
    }
}
    