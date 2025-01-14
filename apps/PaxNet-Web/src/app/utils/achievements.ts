import { Achievement } from "../models/user-profile-data.model";
import { Challenges } from "./challenges";
import images from '@shared/src/constants/images';

export function getCompletedAchievementForChallenge(challengeName: string): Achievement | undefined {
    var completedDate = formatDate(new Date());
    switch(challengeName) {
        case Challenges.ThreeHundredChallenge:
            return {
                name: challengeName,
                dateCompleted: completedDate,
                text: challengeName,               
            };
        case Challenges.WinterWarrior2024:
            return {
                name: challengeName,
                dateCompleted: completedDate,
                text: challengeName
            }
        default:
            return undefined;
    }
}

export function getAchievementImageFromChallengeName(challengeName: string): string | undefined {
    switch(challengeName) {
        case Challenges.SummerMurph2024:
            return images.threeHundredChallenge2024;
        case Challenges.ThreeHundredChallenge:
            return "assets/challenges/three-hundred-challenge-2024.png";
        case Challenges.WinterWarrior2024:
            return "assets/challenges/winter-warrior-challenge-2024.png";
        default:
            console.error("No challenge found");
            return undefined;
    }
}

function formatDate(date: Date): string {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
        .getDate()
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`;
}