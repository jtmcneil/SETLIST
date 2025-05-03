import Agenda, { Job } from "agenda";
import { JobType, JobPayload } from "./types";
import { InternalServerError } from "@/types/errors";
import { ObjectId } from "mongodb";

let agenda: Agenda | null = null;

async function initializeAgenda() {
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

/** Uses a singleton instance of agenda to scheudle jobs
 *
 * @param time - the time that the job should run
 * @param jobType - the type of job
 * @param payload - the payload for the job
 * @returns the scheduled job
 */
export async function scheduleJob(
    time: Date,
    jobType: JobType,
    payload: JobPayload
) {
    // Ensure the agenda intance exists
    if (!agenda) {
        await initializeAgenda();
    }

    const job = await agenda!.schedule(time, jobType, payload);
    console.log(`scheduled job "${jobType}" for ${time.toString()}`);

    return job;
}
/**
 *
 * @param jobId - the id of the previous jobId
 * @param dateTime - the time to reschedule the job to
 * @returns the newly scheduled job
 */
export async function rescheduleJob(
    jobId: string,
    dateTime: Date
): Promise<Job> {
    // Ensure the agenda intance exists
    if (!agenda) {
        await initializeAgenda();
    }

    const jobIdObj = new ObjectId(jobId);
    const prevJob = await agenda!.jobs({ _id: jobIdObj });
    if (prevJob.length === 0) {
        throw new InternalServerError(`No job found with id ${jobId}.`);
    }

    const cancelledJobs = await agenda!.cancel({ _id: jobIdObj });
    if (!cancelledJobs || cancelledJobs === 0) {
        throw new InternalServerError(`No job found with id ${jobId}.`);
    }

    const rescheduledJob = await agenda!.schedule(
        dateTime,
        prevJob[0].attrs.name,
        prevJob[0].attrs.data
    );

    console.log(
        `rescheduled job "${
            prevJob[0].attrs.name
        }" for ${dateTime.toLocaleString()}`
    );

    return rescheduledJob;
}

export function schedulePostPics(
    time: Date,
    payload: JobPayload
): Promise<Job> {
    return scheduleJob(time, JobType.postPics, payload);
}

export function schedulePostVid(time: Date, payload: JobPayload): Promise<Job> {
    return scheduleJob(time, JobType.postVid, payload);
}
