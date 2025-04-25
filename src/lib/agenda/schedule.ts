import Agenda, { Job } from "agenda";
import { JobType, JobPayload, PostPicsParams, PostVidParams } from "./types";
import { InternalServerError } from "@/types/errors";

let agenda: Agenda | null = null;

/** Uses a singleton instance of agenda to scheudle jobs
 *
 * @param time - the time that the job should run
 * @param jobType - the type of job
 * @param payload - the payload for the job
 * @returns the scheduled job
 */
export async function schedule(
    time: Date,
    jobType: JobType,
    payload: JobPayload
) {
    // Ensure the agenda intance exists
    if (!agenda) {
        console.log("Initializing agenda scheduler");
        const dbUrl = process.env.AGENDA_DATABASE_URL;
        if (!dbUrl) {
            throw new InternalServerError(
                "AGENDA_DATABASE_URL environment variable is not set."
            );
        }
        agenda = new Agenda({
            db: {
                address: dbUrl,
            },
            processEvery: "1 day",
        });
        agenda.on("error", () => {
            throw new InternalServerError(
                "There was an error within the agenda scheduler"
            );
        });
        await agenda.start();
    }

    const job = await agenda.schedule(time, jobType, payload);
    console.log(`scheduled job "${jobType}" for ${time.toString()}`);

    return job;
}

export function schedulePostPics(
    time: Date,
    payload: PostPicsParams
): Promise<Job> {
    return schedule(time, JobType.postPics, payload);
}

export function schedulePostVid(
    time: Date,
    payload: PostVidParams
): Promise<Job> {
    return schedule(time, JobType.postVid, payload);
}
