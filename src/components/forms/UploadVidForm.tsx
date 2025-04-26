"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { load, transcode } from "@/lib/ffmpeg";
import InstagramReel from "../screens/instagram/InstagramReel";

import { useSession } from "next-auth/react";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Switch } from "../ui/switch";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

const MAX_FILE_SIZE = 30e7; // 300 MB in bytes
const ACCEPTED_FILE_TYPES = ["video/mp4", "video/quicktime"];
const PLATFORMS = [
    { id: "instagram", label: "Instagram" },
    { id: "tiktok", label: "TikTok" },
];
enum STATUS {
    start = "",
    transcoding = "Transcoding media",
    uploading = "Uploading media",
    posting = "Posting media",
    done = "Post complete",
    error = "There was an error with your psot",
}

export default function UploadVidForm() {
    const { data: session } = useSession();
    const [caption, setCaption] = useState<string>("");
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [scheduled, setScheduled] = useState<boolean>(false);
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
                      .instanceof(FileList, { message: "No files selected." })
                      .refine(
                          (files) => files?.length === 1,
                          "Only 1 file please."
                      )
                      .refine(
                          (files) =>
                              Array.from(files).every((file) =>
                                  ACCEPTED_FILE_TYPES.includes(file.type)
                              ),
                          "Only mp4 & mov formats are supported."
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
        scheduled: z.boolean().default(false),
        datetime: z.date().optional(),
    });

    // Form definition
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            platforms: ["instagram", "tiktok"],
        },
    });

    // Input handlers
    function handleDateSelect(date: Date | undefined) {
        if (date) {
            form.setValue("datetime", date);
        }
    }

    function handleTimeChange(time: string) {
        console.log(time);
        const currentDate = form.getValues("datetime") || new Date();
        const newDate = new Date(currentDate);
        const [hour, minute] = time.split(":").map(Number);
        newDate.setHours(hour);
        newDate.setMinutes(minute);
        form.setValue("datetime", newDate);
    }

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
                        scheduled: values.scheduled,
                        datetime: values.datetime,
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
        <div className="flex flex-col sm:flex-row w-full gap-4">
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
                            <div className="flex flex-col gap-3 rounded-lg border p-3 shadow-sm">
                                <FormField
                                    control={form.control}
                                    name="scheduled"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5 w-3/4">
                                                    <FormLabel className="text-base">
                                                        Scheduled Post
                                                    </FormLabel>
                                                    <FormDescription className="">
                                                        Schedule this post for a
                                                        later date or time
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={(
                                                            e
                                                        ) => {
                                                            field.onChange(e);
                                                            setScheduled(e);
                                                        }}
                                                        aria-readonly
                                                    />
                                                </FormControl>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                {scheduled && (
                                    <FormField
                                        control={form.control}
                                        name="datetime"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-base">
                                                    Date & Time
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={
                                                                    "outline"
                                                                }
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value &&
                                                                        "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    `${field.value.toLocaleString(
                                                                        [],
                                                                        {
                                                                            month: "short",
                                                                            day: "2-digit",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            hour12: true,
                                                                        }
                                                                    )}`
                                                                ) : (
                                                                    <span>
                                                                        MM/DD/YYYY
                                                                        hh:mm aa
                                                                    </span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <div className="flex flex-col">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    field.value
                                                                }
                                                                onSelect={
                                                                    handleDateSelect
                                                                }
                                                                disabled={(
                                                                    date
                                                                ) =>
                                                                    date <
                                                                    new Date(
                                                                        new Date().setDate(
                                                                            new Date().getDate() -
                                                                                1
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                            <div className="p-4">
                                                                <FormLabel className="text-base">
                                                                    Time
                                                                </FormLabel>
                                                                <Input
                                                                    // defaultValue={
                                                                    //     field.value
                                                                    //         ? `${field.value.getHours()}:${field.value.getMinutes()}`
                                                                    //         : ""
                                                                    // }
                                                                    id="time"
                                                                    type="time"
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        handleTimeChange(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        );
                                                                    }}
                                                                ></Input>
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormDescription>
                                                    Enter the time you want this
                                                    post to uhh... post
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
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
                <div className="paper shadow-inner px-2 md:px-4 lg:px-6 xl:px-16 py-4 flex justify-center items-center h-full">
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
