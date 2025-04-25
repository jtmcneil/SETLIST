import { ApiError, BadRequestError } from "@/types/errors";
import { InstagramClient } from "./instagram/client";
import { TikTokClient } from "./tiktok/client";
import { Account } from "@/types/db";

const s3Url = "https://s3.us-east-1.amazonaws.com/media.setlistt.com";
const setlisttUrl = "http://media.setlistt.com";

export async function postVid(
    fileName: string,
    caption: string,
    platforms: string[],
    accounts: Account[]
) {
    // Post to Instagram
    if (platforms.includes("instagram")) {
        const instagramAccount = accounts.find(
            (account) => account.provider === "instagram"
        );
        if (!instagramAccount) {
            return new BadRequestError("No Instagram account found").response;
        }
        try {
            const instagram = new InstagramClient(instagramAccount);
            const post = await instagram.createReel(
                `${setlisttUrl}/${fileName}`,
                caption
            );
            console.log(post);
        } catch (e) {
            console.error(e);
            return ApiError.getResponse(e);
        }
    }
    // Post to TikTok
    if (platforms.includes("tiktok")) {
        const tiktokAccount = accounts.find(
            (account) => account.provider === "tiktok"
        );
        if (!tiktokAccount) {
            return new BadRequestError("No TikTok account found").response;
        }
        try {
            const tiktok = new TikTokClient(tiktokAccount);
            const post = await tiktok.createVideoPost(
                `${s3Url}/${fileName}`,
                caption
            );
            console.log(post);
        } catch (e) {
            console.error(e);
            return ApiError.getResponse(e);
        }
    }
}

export async function postPics(
    fileNames: string[],
    caption: string,
    platforms: string[],
    accounts: Account[]
) {
    // Post to Instagram
    if (platforms.includes("instagram")) {
        const instagramAccount = accounts.find(
            (account) => account.provider === "instagram"
        );
        if (!instagramAccount) {
            return new BadRequestError("No Instagram account found").response;
        }
        try {
            const instagram = new InstagramClient(instagramAccount);
            await instagram.createPost(
                fileNames.map(
                    (fileName: string) => `${setlisttUrl}/${fileName}`
                ),
                caption
            );
        } catch (e) {
            console.error(e);
            return ApiError.getResponse(e);
        }
    }

    // Post to TikTok
    if (platforms.includes("tiktok")) {
        const tiktokAccount = accounts.find(
            (account) => account.provider === "tiktok"
        );
        if (!tiktokAccount) {
            return new BadRequestError("No TikTok account found").response;
        }
        try {
            const tiktok = new TikTokClient(tiktokAccount);
            await tiktok.createPhotoPost(
                fileNames.map((fileName: string) => `${s3Url}/${fileName}`),
                caption
            );
        } catch (e) {
            console.error(e);
            return ApiError.getResponse(e);
        }
    }
}
