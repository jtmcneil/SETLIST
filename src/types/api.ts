enum Platform {
    "instagram",
    "tiktok",
}

export interface PostPayload {
    type: "vid" | "pics" | "story";
    fileNames: string[];
    caption: string;
    platforms: string[];
    scheduled: boolean;
    datetime?: Date;
}
