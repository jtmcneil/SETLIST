import { auth } from "@/lib/auth";
import { InstagramClient } from "@/lib/instagram/client";
// import { createInstagramPost, createInstagramReel } from "@/lib/instagram";
import { prisma } from "@/lib/prisma";
import { TikTokClient } from "@/lib/tiktok/client";
import { ApiError, BadRequestError, UnauthorizedError } from "@/types/errors";

const s3Url = "https://s3.us-east-1.amazonaws.com/media.setlistt.com";
const setlisttUrl = "http://media.setlistt.com";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user) {
        return new UnauthorizedError("Unauthorized request").response;
    }

    const { fileNames, caption, platforms } = await req.json();

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

    if (!fileNames || fileNames.length === 0) {
        return new BadRequestError("No files provided").response;
        // } else if (type === "video") {
        //     if ("instagram" in platforms) {
        //         // await createInstagramReel(`${setlisttUrl}/${fileNames[0]}`);
        //     }
        //     if ("tiktok" in platforms) {
        //         const tiktokPost = await createTikTokVideoPost(
        //             credentials.tiktok?.access_token,
        //             `${s3Url}/${fileNames[0]}`
        //         );
        //     }
        //     return new Response("Post created successfully");
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
                const post = await instagram.createPost(
                    fileNames.map(
                        (fileName: string) => `${setlisttUrl}/${fileName}`
                    ),
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
                const post = await tiktok.createPhotoPost(
                    fileNames.map((fileName: string) => `${s3Url}/${fileName}`),
                    caption
                );
                console.log(post);
            } catch (e) {
                return ApiError.getResponse(e);
            }
        }

        return new Response("Post created successfully");
    }
}
