import { getS3UploadUrl } from "@/lib/s3";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
    // generate random bytes for a unique file name
    const rawBytes = await randomBytes(16);
    const fileName = rawBytes.toString("hex") + ".jpeg"; // Create a unique file name with .jpg extension

    // Handle GET request to provide a signed URL for uploading to S3
    // Generate a unique file name using random bytes

    try {
        const url = await getS3UploadUrl(fileName);
        return new Response(JSON.stringify({ url }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error generating S3 upload URL:", error);
        return new Response("Failed to generate upload URL", { status: 500 });
    }
}
