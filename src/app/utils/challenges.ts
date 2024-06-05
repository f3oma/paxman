import { BaseChallenge, ChallengeState, ChallengeType } from "../models/user-challenge.model";
import { PaxUser } from "../models/users.model";

export enum Challenges {
    SummerMurph2024 = "Summer Murph Challenge - 2024"
}

export interface ICompletionRequirements {}

export interface IterativeCompletionRequirements extends ICompletionRequirements {
    totalCompletionsRequired: number;
}

export interface ChallengeInformation {
    description: string;
    imageSrc: string;
    challengeBase: BaseChallenge;
    completionRequirements: ICompletionRequirements;
}

export function getChallengeInformation(challenge: Challenges, user: PaxUser): ChallengeInformation | null  {
    switch(challenge) {
        case Challenges.SummerMurph2024:
            return createSummerMurph2024ChallengeInformation(user);
        default:
            return null;
    }
}

export const createSummerMurph2024ChallengeInformation = (paxUser: PaxUser): ChallengeInformation => {
    return {
        description: `Take part in this year's Murph Challenge by completing 24 murphs in 8 weeks (07/01 - 08/26). 
        Most AOs will offer a murph pre-activity giving you ample opportunities! To log your completed Murphs, 
        record a murph pre-activity using 'Log Workout'. Complete this challenge and earn a new profile badge and community recognition`,
        imageSrc: 'assets/challenges/murph-challenge-2024.png',
        challengeBase: new BaseChallenge('', paxUser, Challenges.SummerMurph2024, ChallengeType.IterativeCompletions, ChallengeState.PreRegistered, '07/01/2024', '08/26/2024'),
        completionRequirements: {
        totalCompletionsRequired: 24
        } as IterativeCompletionRequirements
    }
}
