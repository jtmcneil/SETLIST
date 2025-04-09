import { auth } from "@/lib/auth";
import { createInstagramPost, createInstagramReel } from "@/lib/instagram";
import { prisma } from "@/lib/prisma";
import { createTikTokVideoPost, createTikTokPhotoPost } from "@/lib/tiktok";

const s3Url = "https://s3.us-east-1.amazonaws.com/media.setlistt.com";
const setlisttUrl = "http://media.setlistt.com";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const accounts = await prisma.account.findMany({
        where: {
            userId: session.user.id,
        },
    });

    if (accounts.length === 0) {
        return new Response("No accounts found, connect accounts to post", {
            status: 401,
        });
    }

    const credentials = {
        instagram: accounts.find((account) => account.provider === "instagram"),
        tiktok: accounts.find((account) => account.provider === "tiktok"),
    };

    const { type, fileNames } = await req.json();

    if (!fileNames || fileNames.length === 0) {
        return new Response("No files provided", { status: 400 });
    } else if (type === "video") {
        // const instagramReel = await createInstagramReel(
        //     `${setlisttUrl}/${fileNames[0]}`
        // );
        const tiktokPost = await createTikTokVideoPost(
            credentials.tiktok?.providerAccountId!,
            credentials.tiktok?.access_token!,
            `${s3Url}/${fileNames[0]}`
        );
        return new Response("Post created successfully");
    } else if (type === "pics") {
        // const instagramPost = await createInstagramPost(
        //     fileNames.map((fileName: string) => `${setlisttUrl}/${fileName}`)
        // );
        const tiktokPost = await createTikTokPhotoPost(
            credentials.tiktok?.providerAccountId!,
            credentials.tiktok?.access_token!,
            fileNames.map((fileName: string) => `${s3Url}/${fileName}`)
        );
        console.log(tiktokPost);
        return new Response("Post created successfully");
    }
}
