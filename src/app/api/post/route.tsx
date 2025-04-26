import { schedulePostPics, schedulePostVid } from "@/lib/agenda/schedule";
import { PostPicsParams, PostVidParams } from "@/lib/agenda/types";
import { auth } from "@/lib/auth";
import { postPics, postVid } from "@/lib/post";
import { prisma } from "@/lib/prisma";
import { PostPayload } from "@/types/api";
import { Account } from "@/types/db";
import { BadRequestError, UnauthorizedError } from "@/types/errors";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session?.user?.id) {
        return new UnauthorizedError("Unauthorized request").response;
    }

    const {
        type,
        fileNames,
        caption,
        platforms,
        scheduled,
        datetime,
    }: PostPayload = await req.json();

    const accounts: Account[] = await prisma.account.findMany({
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

    if (type === "pics") {
        if (scheduled && datetime) {
            const params: PostPicsParams = {
                userId: session.user.id,
                fileNames,
                caption,
                platforms,
            };
            await schedulePostPics(datetime, params);
            return new Response("Post successfully scheduled.");
        }

        if (!fileNames || fileNames.length === 0) {
            return new BadRequestError("No files provided").response;
        } else {
            await postPics(fileNames, caption, platforms, accounts);
        }
    } else if (type === "vid") {
        if (scheduled) {
            const params: PostVidParams = {
                userId: session.user.id,
                fileName: fileNames[0],
                caption,
                platforms,
            };
            await schedulePostVid(datetime, params);
        } else {
            if (!fileNames || fileNames.length === 0) {
                return new BadRequestError("No file provided").response;
            } else {
                await postVid(fileNames[0], caption, platforms, accounts);
            }
        }
    }

    return new NextResponse("Post created successfully");
}
