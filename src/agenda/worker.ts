// src/agenda/worker.ts
import Agenda, { Job } from "agenda";
import { defineJobs } from "@/agenda/jobs";

const dbUrl = process.env.AGENDA_DATABASE_URL;

if (!dbUrl) {
    throw new Error("AGENDA_DATABASE_URL environment variable is not set.");
}

const agenda = new Agenda({
    db: {
        address: dbUrl,
    },
});

const stopAgenda = async (): Promise<void> => {
    console.log("Stopping Agenda processing...");
    try {
        // `stop` waits for executing jobs to finish before resolving.
        await agenda.stop();
        console.log("Agenda processing stopped gracefully.");
        // Agenda handles closing its own DB connection on stop.
        process.exit(0); // Exit the worker process cleanly
    } catch (error) {
        console.error("Error stopping Agenda:", error);
        process.exit(1); // Exit worker with error
    }
};

// Immediately invoked async function to handle top-level await
(async () => {
    try {
        console.log("Starting Agenda worker...");

        // Define jobs
        defineJobs(agenda);

        // Logging
        agenda.on("ready", () => {
            console.log(
                "Agenda worker started successfully. Waiting for jobs..."
            );
        });

        agenda.on("start", (job: Job) => {
            console.log(`Job ${job.attrs.name} starting`);
        });

        agenda.on("success", (job: Job) => {
            console.log(`Job ${job.attrs.name} executed successfully`);
        });

        agenda.on("fail", (err, job: Job) => {
            console.log(`Job ${job.attrs.name} failed: ${err.message}`);
        });

        // Start the Agenda worker process
        await agenda.start();

        // Graceful shutdown handling
        process.on("SIGTERM", async () => {
            console.log("Received SIGTERM signal. Shutting down gracefully...");
            await stopAgenda();
        });
        process.on("SIGINT", async () => {
            console.log(
                "Received SIGINT signal (Ctrl+C). Shutting down gracefully..."
            );
            await stopAgenda();
        });
    } catch (error) {
        console.error("Failed to start Agenda worker:", error);
        process.exit(1); // Exit if initialization fails
    }
})();
