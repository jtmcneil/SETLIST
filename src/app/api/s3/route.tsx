import { getS3UploadUrl } from "@/lib/s3";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
    // get number of files from request
    const { exts } = await req.json();
    const numFiles = exts.length;

    const urls: string[] = [];

    try {
        for (let i = 0; i < numFiles; i++) {
            // generate random bytes for a unique file name
            const rawBytes = await randomBytes(16);
            const fileName = `${rawBytes.toString("hex")}.${exts[i]}`; // Create a unique file name with .jpg extension
            // generate signed URLs for each file
            const url = await getS3UploadUrl(fileName);
            urls.push(url);
        }
        return new Response(JSON.stringify({ urls }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error generating S3 upload URL:", error);
        return new Response("Failed to generate upload URL", { status: 500 });
    }
}
