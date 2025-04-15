"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useState } from "react";
import InstagramReel from "../screens/instagram/InstagramReel";

const MAX_FILE_SIZE = 30e7; // 300 MB in bytes
const ACCEPTED_FILE_TYPES = ["video/mp4", "video/quicktime"];
const PLATFORMS = [
    { id: "instagram", label: "Instagram" },
    { id: "tiktok", label: "TikTok" },
];
enum STATUS {
    start = "",
    transcoding = "Transcoding video",
    uploading = "Uploading video",
    posting = "Posting video",
    done = "Post complete",
    error = "There was an error posting your video",
}

export default function UploadVidForm() {
    const { data: session } = useSession();
    const [caption, setCaption] = useState<string>("");
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [status, setStatus] = useState<STATUS>(STATUS.start);

    // get accounts
    const instagramAccount = session?.user.accounts.find(
        (account) => account.provider == "instagram"
    );
    const tiktokAccount = session?.user.accounts.find(
        (account) => account.provider == "tiktok"
    );

    // Define Schema
    const formSchema = z.object({
        platforms: z
            .array(z.string())
            .refine((value) => value.some((item) => item), {
                message: "You have to select at least one item.",
            }),
        files:
            typeof window === "undefined"
                ? z.any() // Server-side fallback z
                : z
                      .instanceof(FileList)
                      .refine(
                          (files) => files?.length === 1,
                          "File is required."
                      )
                      .refine(
                          (files) =>
                              Array.from(files).every((file) =>
                                  ACCEPTED_FILE_TYPES.includes(file.type)
                              ),
                          "Only mp4, & mov formats are supported."
                      )
                      .refine(
                          (files) =>
                              Array.from(files).every(
                                  (file) => file.size <= MAX_FILE_SIZE
                              ),
                          `File size should not exceed ${
                              MAX_FILE_SIZE / 1e6
                          } MB.` // Convert bytes to MB for the error message
                      ),
        caption: z.string().optional(), // TODO - add validation for length
    });

    // Form definition
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            platforms: ["instagram", "tiktok"],
        },
    });

    // Submit handler
    function onSubmit(values: z.infer<typeof formSchema>) {
        const uploadMedia = async () => {
            // transcode video
            setStatus(STATUS.transcoding);
            setProgress(10);
            const ffmpeg = await load();
            setProgress(25);
            const videoFile = await transcode(ffmpeg, values.files[0]);
            setProgress(60);

            // Get signed URLs from the server to upload the image to S3
            setStatus(STATUS.uploading);
            const { urls } = await fetch("/api/s3", {
                cache: "no-store",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    exts: [values.files[0].name.split(".").pop()],
                }),
            }).then((res) => res.json());
            setProgress(75);

            // upload media to S3 using the signed URL
            const s3Response = await fetch(urls[0], {
                cache: "no-store",
                method: "PUT",
                headers: {
                    "Content-Type": values.files[0].type, // Set the content type to the file type
                },
                body: videoFile,
            });
            setProgress(90);

            if (s3Response.ok) {
                const fileName = s3Response.url
                    .split("?")[0]
                    .split("/")
                    .pop() as string;

                //if the upload is successful, send request to backend to post video
                setStatus(STATUS.posting);
                await fetch("/api/post/vid", {
                    cache: "no-store",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileName,
                        caption,
                        platforms: values.platforms,
                    }),
                });

                //Complete
                setStatus(STATUS.done);
                setProgress(100);
            } else {
                // TODO Handle the error
                setStatus(STATUS.error);
                setProgress(0);
            }
        };
        uploadMedia();
    }

    return (
        <div className="flex w-full gap-4">
            <section className="flex-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <fieldset
                            className="space-y-8"
                            disabled={status !== STATUS.start}
                        >
                            <FormField
                                control={form.control}
                                name="platforms"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">
                                                Platforms
                                            </FormLabel>
                                            <FormDescription>
                                                Select the platforms you want to
                                                post to.
                                            </FormDescription>
                                        </div>
                                        {PLATFORMS.map((platform) => (
                                            <FormField
                                                key={platform.id}
                                                control={form.control}
                                                name="platforms"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={platform.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(
                                                                        platform.id
                                                                    )}
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) => {
                                                                        return checked
                                                                            ? field.onChange(
                                                                                  [
                                                                                      ...field.value,
                                                                                      platform.id,
                                                                                  ]
                                                                              )
                                                                            : field.onChange(
                                                                                  field.value?.filter(
                                                                                      (
                                                                                          value
                                                                                      ) =>
                                                                                          value !==
                                                                                          platform.id
                                                                                  )
                                                                              );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-sm font-normal">
                                                                {platform.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="files"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Pics
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="files"
                                                type="file"
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.files
                                                    )
                                                }
                                                onChangeCapture={(e) => {
                                                    const files =
                                                        e.currentTarget.files;
                                                    if (
                                                        files &&
                                                        files?.length > 0
                                                    ) {
                                                        const url =
                                                            URL.createObjectURL(
                                                                files[0]
                                                            );
                                                        setFileUrl(url);
                                                    }
                                                }}
                                                multiple={false}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Select a video to upload with a
                                            maximum size of 30 MB.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="caption"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Caption
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write something about your post... or don't"
                                                className="h-48 resize-none"
                                                onChangeCapture={(e) => {
                                                    setCaption(
                                                        e.currentTarget.value
                                                    );
                                                }}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {/* You can <span>@mention</span> other users
                                    and organizations. */}
                                            {/* TODO */}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {status === STATUS.start && (
                                <InteractiveHoverButton
                                    type="submit"
                                    className="w-full"
                                >
                                    Post!
                                </InteractiveHoverButton>
                            )}
                            {status !== STATUS.start && (
                                <div>
                                    <Progress value={progress} />
                                    <p className="pt-2">{status}</p>
                                </div>
                            )}
                        </fieldset>
                    </form>
                </Form>
            </section>
            <section className="flex-1">
                <div className="paper shadow-inner px-16 py-4 flex justify-center items-center h-full">
                    {instagramAccount && (
                        <InstagramReel
                            aviUrl={instagramAccount.avi_url} // TODO switch to insta
                            username={instagramAccount.username} // TODO switch to insta
                            caption={caption}
                            videoUrl={fileUrl ? fileUrl : null}
                            location=""
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
