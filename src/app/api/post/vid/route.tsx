import { schedulePostVid } from "@/lib/agenda/schedule";
import { PostVidParams } from "@/lib/agenda/types";
import { auth } from "@/lib/auth";
import { postVid } from "@/lib/post";
import { prisma } from "@/lib/prisma";
import { Account } from "@/types/db";
import { BadRequestError, UnauthorizedError } from "@/types/errors";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session?.user?.id) {
        return new UnauthorizedError("Unauthorized request").response;
    }

    const { fileName, caption, platforms, scheduled, datetime } =
        await req.json();

    if (scheduled) {
        const params: PostVidParams = {
            userId: session.user.id,
            fileName,
            caption,
            platforms,
        };
        await schedulePostVid(datetime, params);
    } else {
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

        if (!fileName) {
            return new BadRequestError("No file provided").response;
        } else {
            await postVid(fileName, caption, platforms, accounts);
        }
    }

    prisma.post.create({
        data: {
            userId: session.user.id,
            postedAt: scheduled ? datetime : new Date(),
        },
    });

    return new NextResponse("Post created successfully");
}
