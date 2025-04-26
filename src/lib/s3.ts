import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client();
const bucketName = process.env.AWS_BUCKET_NAME!;

export async function getS3UploadUrl(fileName: string) {
    // Create a command to put an object in the S3 bucket
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });

    // Get a signed URL for the command
    return getSignedUrl(s3, command, { expiresIn: 3600 });
}
