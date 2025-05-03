import {
    rescheduleJob,
    schedulePostPics,
    schedulePostVid,
} from "@/lib/agenda/schedule";
import { JobPayload } from "@/lib/agenda/types";
import { auth } from "@/lib/auth";
import { postPics, postVid } from "@/lib/post";
import { prisma } from "@/lib/prisma";
import { CreatePostPayload, EditPostPayload } from "@/types/api";
import { Account } from "@/types/db";
import { BadRequestError, UnauthorizedError } from "@/types/errors";
import { Job } from "agenda";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

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
    }: CreatePostPayload = await req.json();

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

    const postId = uuidv4();

    let job: Job | null = null;
    if (type === "pics") {
        if (scheduled && datetime) {
            const params: JobPayload = { postId };
            job = await schedulePostPics(datetime, params);
        }

        if (!fileNames || fileNames.length === 0) {
            return new BadRequestError("No files provided").response;
        } else {
            await postPics(fileNames, caption, platforms, accounts);
        }
    } else if (type === "vid") {
        if (scheduled && datetime) {
            const params: JobPayload = {
                postId,
            };
            job = await schedulePostVid(datetime, params);
        } else {
            if (!fileNames || fileNames.length === 0) {
                return new BadRequestError("No file provided").response;
            } else {
                await postVid(fileNames[0], caption, platforms, accounts);
            }
        }
    }

    await prisma.post.create({
        data: {
            id: postId,
            userId: session.user.id,
            type,
            caption: caption || "",
            media: fileNames,
            platforms,
            agendaId: job ? job.attrs._id.toString() : null,
            postedAt: scheduled && datetime ? new Date(datetime) : new Date(),
        },
    });

    return new NextResponse("Post created successfully");
}

export async function PUT(req: Request) {
    const session = await auth();
    if (!session || !session?.user?.id) {
        return new UnauthorizedError("Unauthorized request").response;
    }

    const { postId, caption, postedAt }: EditPostPayload = await req.json();

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
                userId: session.user.id,
            },
        });

        if (!post) {
            return new BadRequestError("Post not found").response;
        }

        let newJob: Job | null = null;
        // If the postedAt date has changed, reschedule the job if it exists
        if (postedAt !== post.postedAt && post.agendaId) {
            newJob = await rescheduleJob(post.agendaId, postedAt);
        }

        // Update the post
        await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                agendaId: newJob ? newJob.attrs._id.toString() : post.agendaId,
                caption: caption || post.caption,
                postedAt: postedAt || post.postedAt,
            },
        });

        return new NextResponse("Post updated successfully");
    } catch (error) {
        console.error("Error updating post:", error);
        return new BadRequestError("Failed to update post").response;
    }
}
