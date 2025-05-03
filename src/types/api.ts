// enum Platform {
//     "instagram",
//     "tiktok",
// }

export interface CreatePostPayload {
    type: "vid" | "pics" | "story";
    fileNames: string[];
    caption: string;
    platforms: string[];
    scheduled: boolean;
    datetime?: Date;
}

export interface EditPostPayload {
    postId: string;
    caption?: string;
    postedAt: Date;
}
