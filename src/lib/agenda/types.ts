import { JobAttributesData } from "agenda";

export enum JobType {
    postPics = "POST PICS",
    postVid = "POST VID",
}

export type JobPayload = PostPicsParams | PostVidParams;

export interface PostPicsParams extends JobAttributesData {
    userId: string;
    fileNames: string[];
    caption: string;
    platforms: string[];
}

export interface PostVidParams extends JobAttributesData {
    userId: string;
    fileName: string;
    caption: string;
    platforms: string[];
}
