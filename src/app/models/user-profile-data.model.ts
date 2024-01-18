export interface UserProfileData {
    links: Record<string, ExternalLink>;
    badges: Badge[];
    countOfEHUsers: number;
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
