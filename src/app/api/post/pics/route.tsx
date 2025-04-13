import { auth } from "@/lib/auth";
// import { createInstagramPost, createInstagramReel } from "@/lib/instagram";
import { prisma } from "@/lib/prisma";
import { TikTokClient } from "@/lib/tiktok/client";

const s3Url = "https://s3.us-east-1.amazonaws.com/media.setlistt.com";
const setlisttUrl = "http://media.setlistt.com";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
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
        return new Response("No accounts found, connect accounts to post", {
            status: 401,
        });
    }

    if (!fileNames || fileNames.length === 0) {
        return new Response("No files provided", { status: 400 });
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
        // const instagramPost = await createInstagramPost(
        //     fileNames.map((fileName: string) => `${setlisttUrl}/${fileName}`)
        // );

        if (platforms.includes("tiktok")) {
            const tiktokAccount = accounts.find(
                (account) => account.provider === "tiktok"
            );
            if (!tiktokAccount) {
                return new Response("No TikTok account found", { status: 400 });
            }
            const tiktok = new TikTokClient(tiktokAccount);
            const post = await tiktok.createPhotoPost(
                fileNames.map((fileName: string) => `${s3Url}/${fileName}`),
                caption
            );
            console.log(post);
        }

        return new Response("Post created successfully");
    }
}
