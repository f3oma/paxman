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
    id?: string; // undefined when not set yet
    description: string;
    imageSrc: string;
    name: Challenges;
    status: ChallengeStatus;
    type: ChallengeType,
    startDateString: string,
    endDateString: string
    completionRequirements: ICompletionRequirements;
}

export function getChallengeIdByName(challenge: Challenges): string | null  {
    switch(challenge) {
        case Challenges.SummerMurph2024:
            return "aI66pjf8m5wq5FBjGh4j";
        default:
            return null;
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