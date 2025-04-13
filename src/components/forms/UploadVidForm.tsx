"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { load, transcode } from "@/lib/ffmpeg";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 30e7; // 300 MB in bytes
const ACCEPTED_FILE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "video/mp4",
    "video/quicktime",
];

const formSchema = z.object({
    type: z.enum(["video", "pics"]),
    files: z
        .instanceof(FileList)
        .refine((files) => files?.length >= 1, "File is required.")
        .refine(
            (files) =>
                Array.from(files).every((file) =>
                    ACCEPTED_FILE_TYPES.includes(file.type)
                ),
            // ACCEPTED_IMAGE_TYPES.includes(files[0].type),
            "Only jpg, mp4, & mov formats are supported."
        )
        .refine(
            (files) =>
                Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
            `File size should not exceed ${MAX_FILE_SIZE / 1e6} MB.` // Convert bytes to MB for the error message
        ),
});

export default function UploadVidForm() {
    // Form definition
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    // Submit handler
    function onSubmit(values: z.infer<typeof formSchema>) {
        const uploadMedia = async () => {
            // Get list of file extensions
            const exts = [];
            for (const file of values.files) {
                exts.push(file.name.split(".").pop());
            }

            let videoFile: File | null = null;
            // transcode video
            if (values.type === "video") {
                const ffmpeg = await load();
                videoFile = await transcode(ffmpeg, values.files[0]);
            }

            // Get signed URLs from the server to upload the image to S3
            const { urls } = await fetch("/api/s3", {
                cache: "no-store",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ exts }),
            }).then((res) => res.json());

            const fileNames: string[] = [];

            for (let i = 0; i < values.files.length; i++) {
                // upload media to S3 using the signed URL
                const s3Response = await fetch(urls[i], {
                    cache: "no-store",
                    method: "PUT",
                    headers: {
                        "Content-Type": values.files[i].type, // Set the content type to the file type
                    },
                    body: values.type === "video" ? videoFile : values.files[i],
                });

                if (s3Response.ok) {
                    const fileName = s3Response.url
                        .split("?")[0]
                        .split("/")
                        .pop() as string;
                    fileNames.push(fileName);
                } else {
                    // TODO Handle the error
                }
            }

            //if the upload is successful, send request to backend to post image to instagram
            await fetch("/api/post", {
                cache: "no-store",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type: values.type, fileNames }),
            });
        };
        uploadMedia();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Post Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a content type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="pics">Pics</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Select Video to upload short form content (IG
                                Reels, TikTok)
                                <br />
                                Select Pics to upload a single image or a
                                carousel
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="files"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Media</FormLabel>
                            <FormControl>
                                <Input
                                    id="files"
                                    type="file"
                                    onChange={(e) =>
                                        field.onChange(e.target.files)
                                    }
                                    multiple={true}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            </FormControl>
                            <FormDescription>
                                {form.watch("type") === "video"
                                    ? "Upload a video file (mp4 or mov) with a maximum size of 30 MB."
                                    : "Upload one or more image files (jpg) with a maximum size of 30 MB each."}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
