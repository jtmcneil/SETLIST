"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 30e6; // 30 MB in bytes
const ACCEPTED_FILE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "video/mp4",
    "video/quicktime",
];

const formSchema = z.object({
    image: z
        .instanceof(FileList)
        .refine((files) => files?.length >= 1, "File is required.")
        .refine(
            (files) =>
                Array.from(files).every((file) =>
                    ACCEPTED_FILE_TYPES.includes(file.type)
                ),
            // ACCEPTED_IMAGE_TYPES.includes(files[0].type),
            "jpg, png, webp formats are supported."
        )
        .refine(
            (files) => files[0].size <= MAX_FILE_SIZE,
            `File size should not exceed ${MAX_FILE_SIZE / 1e6} MB.` // Convert bytes to MB for the error message
        ),
});

export default function UploadForm() {
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const uploadImage = async () => {
            // Get a signed URL from the server to upload the image to S3
            const { url } = await fetch("/api/s3").then((res) => res.json());

            // upload the image to S3 using the signed URL
            const s3Response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "image/jpeg", // Set the content type to the file type
                },
                body: values.image[0],
            });

            //if the upload is successful, send request to backend to post image to instagram
            if (s3Response.ok) {
                // Extract the file name from the URL
                const fileName = s3Response.url
                    .split("?")[0]
                    .split("/")
                    .pop() as string;
                // send post request to backend
                const res = await fetch("/api/post", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ fileName }),
                });
            }
        };
        uploadImage();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image</FormLabel>
                            <FormControl>
                                <Input
                                    id="image"
                                    type="file"
                                    onChange={(e) =>
                                        field.onChange(e.target.files)
                                    }
                                    multiple={false}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            </FormControl>
                            <FormDescription>
                                The image you would like to upload
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
