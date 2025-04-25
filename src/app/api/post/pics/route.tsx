import { schedulePostPics } from "@/lib/agenda/schedule";
import { PostPicsParams } from "@/lib/agenda/types";
import { auth } from "@/lib/auth";
import { postPics } from "@/lib/post";
import { prisma } from "@/lib/prisma";
import { BadRequestError, UnauthorizedError } from "@/types/errors";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session?.user?.id) {
        return new UnauthorizedError("Unauthorized request").response;
    }

    const { fileNames, caption, platforms, scheduled, datetime } =
        await req.json();

    if (scheduled) {
        const params: PostPicsParams = {
            userId: session.user.id,
            fileNames,
            caption,
            platforms,
        };
        await schedulePostPics(datetime, params);
        return new Response("Post successfully scheduled.");
    }

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
    } else {
        await postPics(fileNames, caption, platforms, accounts);
    }

    return new NextResponse("Post created successfully");
}
