import Agenda, { Job } from "agenda";
import { JobType, JobPayload } from "../lib/agenda/types";
import { postPics, postVid } from "@/lib/post";
import { InternalServerError } from "@/types/errors";
import { prisma } from "@/lib/prisma";

export function defineJobs(agenda: Agenda) {
    agenda.define<JobPayload>(
        JobType.postPics,
        async (job: Job<JobPayload>) => {
            const { postId }: JobPayload = job.attrs.data;
            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: { user: { include: { accounts: true } } },
            });
            if (!post?.user.accounts) {
                throw new InternalServerError("User has no connected accounts");
            }
            await postPics(
                post.media,
                post.caption,
                post.platforms,
                post.user.accounts
            );
        }
    );

    agenda.define<JobPayload>(JobType.postVid, async (job: Job<JobPayload>) => {
        const { postId }: JobPayload = job.attrs.data;
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { user: { include: { accounts: true } } },
        });
        if (!post?.user.accounts) {
            throw new InternalServerError("User has no connected accounts");
        }
        await postVid(
            post.media[0],
            post.caption,
            post.platforms,
            post.user.accounts
        );
    });

    return agenda;
}
