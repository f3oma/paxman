import { BaseChallenge, ChallengeState, ChallengeType } from "../models/user-challenge.model";
import { PaxUser } from "../models/users.model";

export enum Challenges {
    SummerMurph2024 = "Summer Murph Challenge - 2024"
}

export interface ICompletionRequirements {}

export interface IterativeCompletionRequirements extends ICompletionRequirements {
    totalCompletionsRequired: number;
}

// ChallengeStatus defines whether the actual challenge is in progress
export enum ChallengeStatus {
    PreRegistration = "pre-registration",
    Started = "started",
    Completed = "completed"
};

// Challenge Information defines basic details about the challenge
export interface ChallengeInformation {
    description: string;
    imageSrc: string;
    name: Challenges;
    status: ChallengeStatus;
    type: ChallengeType,
    startDateString: string,
    endDateString: string
    completionRequirements: ICompletionRequirements;
}

export function getChallengeInformation(challenge: Challenges): ChallengeInformation | null  {
    switch(challenge) {
        case Challenges.SummerMurph2024:
            return createSummerMurph2024ChallengeInformation();
        default:
            return null;
    }
}

// Challenges - could be moved to db...
export const createSummerMurph2024ChallengeInformation = (): ChallengeInformation => {
    return {
        description: `Take part in this year's Murph Challenge by completing 24 murphs in 8 weeks (07/01 - 08/26). 
        Most AOs will offer a murph pre-activity giving you ample opportunities! To log your completed Murphs, 
        record a murph pre-activity using 'Log Workout'. Complete this challenge and earn a new profile badge and community recognition`,
        imageSrc: 'assets/challenges/murph-challenge-2024.png',
        name: Challenges.SummerMurph2024,
        type: ChallengeType.IterativeCompletions,
        status: ChallengeStatus.PreRegistration,
        startDateString: '07/01/2024',
        endDateString: '08/26/2024',
        completionRequirements: {
            totalCompletionsRequired: 24
        } as IterativeCompletionRequirements
    }
}

// Helpers
export function getChallengesEnumKeyByValue(value: string): Challenges | undefined {
    const enumKey = Object.keys(Challenges).find(key => Challenges[key as keyof typeof Challenges] === value);
    if (enumKey) {
        return Challenges[enumKey as keyof typeof Challenges];
    }
    return undefined;
}