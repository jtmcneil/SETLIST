import Agenda, { Job } from "agenda";
import { JobType, PostPicsParams, PostVidParams } from "../lib/agenda/types";
import { postPics, postVid } from "@/lib/post";
import { InternalServerError } from "@/types/errors";
import { prisma } from "@/lib/prisma";

export function defineJobs(agenda: Agenda) {
    agenda.define<PostPicsParams>(
        JobType.postPics,
        async (job: Job<PostPicsParams>) => {
            const { userId, fileNames, caption, platforms } = job.attrs.data;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { accounts: true },
            });
            if (!user?.accounts) {
                throw new InternalServerError("User has no connected accounts");
            }
            await postPics(fileNames, caption, platforms, user?.accounts);
        }
    );

    agenda.define<PostVidParams>(
        JobType.postVid,
        async (job: Job<PostVidParams>) => {
            const { userId, fileName, caption, platforms } = job.attrs.data;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { accounts: true },
            });
            if (!user?.accounts) {
                throw new InternalServerError("User has no connected accounts");
            }
            await postVid(fileName, caption, platforms, user?.accounts);
        }
    );

    return agenda;
}
