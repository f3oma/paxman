import { Badge } from "../models/user-profile-data.model";
import { Challenges } from "./challenges";

export enum Badges {
    // Leadership
    TheWeasel = 'the weasel',
    Redwood = 'redwood',
    SectorLeader = 'sector leader',
    SiteQ = 'site-q',
    SiteFounder = 'site founder',
    RetiredSiteQ = 'retired site-q',
    FirstF = 'first f',
    SecondF = 'second f',
    ThirdF = 'third f',
    Nantan = 'nantan',
    NantanEmeritus = 'nantan emeritus',
    CommzQ = 'commz q',

    // Age
    Respect = 'respect',
    Hate = 'hate',

    // Activity
    FarvaAward = 'farva award',
    MurphChallenge2024 = 'murph challenge 2024',
}

export const availableBadges: Array<Badge | undefined> = [
    getBadgeDetail(Badges.TheWeasel),
    getBadgeDetail(Badges.Redwood),
    getBadgeDetail(Badges.SectorLeader),
    getBadgeDetail(Badges.SiteQ),
    getBadgeDetail(Badges.SiteFounder),
    getBadgeDetail(Badges.RetiredSiteQ),
    getBadgeDetail(Badges.FirstF),
    getBadgeDetail(Badges.SecondF),
    getBadgeDetail(Badges.ThirdF),
    getBadgeDetail(Badges.Nantan),
    getBadgeDetail(Badges.NantanEmeritus),
    getBadgeDetail(Badges.CommzQ),
    getBadgeDetail(Badges.Respect),
    getBadgeDetail(Badges.Hate),
];

export function badgeFromChallengeName(challengeName: string): Badge | undefined {
    switch(challengeName) {
        case Challenges.SummerMurph2024:
            return getBadgeDetail(Badges.MurphChallenge2024)
        default:
            return undefined;
    }
}

export function getBadgeDetail(badge: string): Badge | undefined {
    const badgeNoCase = badge.toLowerCase();
    switch(badgeNoCase) {
        case Badges.TheWeasel:
            return  {
                text: 'The Weasel',
                textColor: '#fff',
                backgroundColor: '#333'
            };
        case Badges.Redwood:
            return {
                text: 'Redwood',
                textColor: '#fff',
                backgroundColor: '#791f1f'
            };
        case Badges.SectorLeader:
            return {
                text: 'Sector Leader',
                textColor: '#fff',
                backgroundColor: '#222'
            };
        case Badges.SiteQ:
            return {
                text: 'Site-Q',
                textColor: '#fff',
                backgroundColor: '#ce7900'
            };
        case Badges.SiteFounder:
            return {
                text: 'Site Founder',
                textColor: '#fff',
                backgroundColor: 'linear-gradient(73deg, #b90000, #5f5f5f, #0000ff)',
            };
        case Badges.RetiredSiteQ:
            return {
                text: 'Retired Site-Q',
                textColor: '#7e4900',
                backgroundColor: '#fdc076'
            };
        case Badges.FirstF:
            return {
                text: 'First F',
                textColor: '#fff',
                backgroundColor: '#455ee8'
            };
        case Badges.SecondF:
            return {
                text: 'Second F',
                textColor: '#fff',
                backgroundColor: 'rgb(10 107 28)'
            };
        case Badges.ThirdF:
            return {
                text: 'Third F',
                textColor: '#fff',
                backgroundColor: '#800080'
            };
        case Badges.Nantan:
            return {
                text: 'Nantan',
                textColor: '#fff',
                backgroundColor: '#000'
            };
        case Badges.NantanEmeritus:
            return {
                text: 'Nantan Emeritus',
                textColor: '#fff',
                backgroundColor: '#626262'
            };
        case Badges.CommzQ:
            return {
                text: 'Commz Q',
                textColor: '#fff',
                backgroundColor: '#524dbc'
            };
        case Badges.Respect:
            return {
                text: 'Respect',
                textColor: '#fff',
                backgroundColor: "#c54747"
            }
        case Badges.Hate:
            return {
                text: 'Hate',
                textColor: '#fff',
                backgroundColor: '#54c4ff'
            };
        case Badges.MurphChallenge2024:
            return {
                text: 'Murph Challenge \'24',
                textColor: '#fff',
                backgroundColor: 'linear-gradient(360deg, #9432af, #5436ea)'
            };
        default:
            console.error("Badge not found");
            return undefined;
    }
}