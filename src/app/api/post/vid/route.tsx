import { auth } from "@/lib/auth";
import { InstagramClient } from "@/lib/instagram/client";
// import { createInstagramPost, createInstagramReel } from "@/lib/instagram";
import { prisma } from "@/lib/prisma";
import { TikTokClient } from "@/lib/tiktok/client";
import { ApiError, BadRequestError, UnauthorizedError } from "@/types/errors";
import { NextResponse } from "next/server";

const s3Url = "https://s3.us-east-1.amazonaws.com/media.setlistt.com";
const setlisttUrl = "http://media.setlistt.com";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user) {
        return new UnauthorizedError("Unauthorized request").response;
    }

    const { fileName, caption, platforms } = await req.json();

    const accounts = await prisma.account.findMany({
        where: {
            userId: session.user.id,
            provider: {
                in: platforms,
            },
        },
    });

    if (accounts.length === 0) {
        return new UnauthorizedError(
            "No accounts found, connect accounts to post"
        ).response;
    }

    if (!fileName) {
        return new BadRequestError("No file provided").response;
    } else {
        // Post to Instagram
        if (platforms.includes("instagram")) {
            const instagramAccount = accounts.find(
                (account) => account.provider === "instagram"
            );
            if (!instagramAccount) {
                return new BadRequestError("No Instagram account found")
                    .response;
            }
            try {
                const instagram = new InstagramClient(instagramAccount);
                const post = await instagram.createReel(
                    `${setlisttUrl}/${fileName}`,
                    caption
                );
                console.log(post);
            } catch (e) {
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
                return ApiError.getResponse(e);
            }
        }
    }
    return new NextResponse("Post created successfully");
}
