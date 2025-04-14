import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { InstagramClient } from "@/lib/instagram/client";
import { prisma } from "@/lib/prisma";
import { LongTokenSuccessResponse } from "@/lib/instagram/types";
import { NotImplementedError } from "@/types/errors";

export async function GET(req: Request) {
    return new NotImplementedError().response;

    const session = await auth();
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const user = await prisma.user.findFirst({
        where: {
            email: session.user.email!,
        },
    });

    if (!user) {
        throw new Error("man wtf ");
    }

    // console.log(session);
    const igUser = await InstagramClient.getInstagramUser();

    const token: LongTokenSuccessResponse = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
    ).then((res) => res.json());

    const account = await prisma.account.create({
        data: {
            userId: user.id!,
            type: "oauth",
            provider: "instagram",
            providerAccountId: igUser.user_id,
            access_token: token.access_token,
            expires_at: Math.floor(Date.now() / 1000) + token.expires_in,
            token_type: token.token_type,
            scope: token.permissions,
            avi_url: igUser.profile_picture_url,
            username: igUser.username,
        },
    });

    console.log(account);
}
