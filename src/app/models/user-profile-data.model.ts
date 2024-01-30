export interface IUserProfileDataEntity {
    links: Record<string, ExternalLink>;
    badges: Badge[];
    countOfEHUsers: number;
    ehUserJsonString: string;
}

export interface UserProfileData {
    links: Record<string, ExternalLink>;
    badges: Badge[];
    countOfEHUsers: number;
    ehUsers: { id: string, f3Name: string }[];
}

interface ExternalLink {
    url: string;
}

export interface Badge {
    backgroundColor: string;
    text: string;
    textColor: string;
    backgroundImage?: string;
}
