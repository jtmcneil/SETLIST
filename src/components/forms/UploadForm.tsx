"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { resizeImage } from "@/lib/image";
import { load, transcode } from "@/lib/ffmpeg";
import InstagramPost from "../screens/instagram/InstagramPost";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import InstagramReel from "../screens/instagram/InstagramReel";

import { PostPayload } from "@/types/api";

const PLATFORMS = [
    { id: "instagram", label: "Instagram" },
    { id: "tiktok", label: "TikTok" },
];

interface postType {
    label: string;
    description: string;
    formats: string[];
    maxSize: number;
}

const POST_TYPE_MAP = new Map<string, postType>([
    [
        "vid",
        {
            label: "Vid",
            description:
                "Upload a video file with a maximum size of 30 MB. Supported formats: mp4, mo.",
            formats: ["video/mp4", "video/quicktime"],
            maxSize: 30e7,
        },
    ],
    [
        "pics",
        {
            label: "Pics",
            description:
                "Upload one or more image files (jpeg) with a maximum size of 30 MB each.",
            formats: ["image/jpeg", "image/jpg"],
            maxSize: 30e7,
        },
    ],
]);

enum STATUS {
    start = "",
    transcoding = "Transcoding media",
    uploading = "Uploading media",
    posting = "Posting media",
    done = "Post complete",
    error = "There was an error with your post",
}

export default function UploadForm() {
    const { data: session } = useSession();
    const [type, setType] = useState<postType | null>(null);
    const [caption, setCaption] = useState<string>("");
    const [fileUrls, setFileUrls] = useState<string[] | null>(null);
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

    // define schema
    const formSchema = z.object({
        type: z.enum(["vid", "pics"]),
        platforms: z
            .array(z.string())
            .refine((value) => value.some((item) => item), {
                message: "You have to select at least one item.",
            }),
        files:
            typeof window === "undefined"
                ? z.any() // Server-side fallback
                : z
                      .instanceof(FileList, { message: "No files selected." })
                      .refine(
                          (files) => files?.length >= 1,
                          "File is required."
                      )
                      .refine(
                          (files) =>
                              Array.from(files).every((file) =>
                                  type?.formats.includes(file.type)
                              ),
                          // ACCEPTED_IMAGE_TYPES.includes(files[0].type),
                          "Only jpg / jpeg format is supported."
                      )
                      .refine(
                          (files) =>
                              Array.from(files).every(
                                  (file) =>
                                      file.size <= (type ? type.maxSize : 0)
                              ),
                          `File size should not exceed ${
                              type ? type.maxSize / 1e6 : 0
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
            datetime: new Date(),
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
        const getS3UploadUrls = async (): Promise<string[]> => {
            const exts = [];
            for (const file of values.files) {
                exts.push(file.name.split(".").pop());
            }
            const { urls } = await fetch("/api/s3", {
                cache: "no-store",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ exts }),
            }).then((res) => res.json());
            return urls;
        };

        const uploadToS3 = async (
            file: File,
            url: string
        ): Promise<Response> => {
            return await fetch(url, {
                cache: "no-store",
                method: "PUT",
                headers: {
                    "Content-Type": file.type, // Set the content type to the file type
                },
                body: file,
            });
        };

        const postMedia = async (body: PostPayload) => {
            await fetch("/api/post", {
                cache: "no-store",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
        };

        const uploadVid = async () => {
            // transcode video
            setStatus(STATUS.transcoding);
            setProgress(10);
            const ffmpeg = await load();
            setProgress(25);
            const videoFile = await transcode(ffmpeg, values.files[0]);
            setProgress(60);

            // get S3 urls
            setStatus(STATUS.uploading);
            const urls = await getS3UploadUrls();
            setProgress(75);

            // upload media to S3 using the signed URL
            const s3Response = await uploadToS3(videoFile, urls[0]);
            setProgress(90);

            if (s3Response.ok) {
                const fileName = s3Response.url
                    .split("?")[0]
                    .split("/")
                    .pop() as string;

                //if the upload is successful, send request to backend to post video
                setStatus(STATUS.posting);
                await postMedia({
                    type: "vid",
                    fileNames: [fileName],
                    caption,
                    platforms: values.platforms,
                    scheduled: values.scheduled,
                    datetime: values.datetime,
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
        const uploadPics = async () => {
            const urls = await getS3UploadUrls();
            setProgress(10);

            const fileNames: string[] = [];

            for (let i = 0; i < values.files.length; i++) {
                // upload media to S3 using the signed URL
                const s3Response = await uploadToS3(
                    await resizeImage(values.files[i]),
                    urls[i]
                );

                if (s3Response.ok) {
                    const fileName = s3Response.url
                        .split("?")[0]
                        .split("/")
                        .pop() as string;
                    fileNames.push(fileName);
                    setProgress(
                        (progress) => progress + 60 / values.files.length
                    );
                } else {
                    // TODO Handle the error
                }
            }
            setProgress(70);

            //if the upload is successful, send request to backend to post pics
            setStatus(STATUS.posting);
            await postMedia({
                type: "pics",
                fileNames,
                caption,
                platforms: values.platforms,
                scheduled: values.scheduled,
                datetime: values.datetime,
            });
            setStatus(STATUS.done);
            setProgress(100);
        };
        if (values.type === "vid") {
            uploadVid();
        } else if (values.type === "pics") {
            uploadPics();
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <fieldset disabled={status !== STATUS.start}>
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="gap-4 mb-8 pb-4 border-b-2">
                                <FormLabel className="text-base">
                                    Content Type
                                </FormLabel>
                                <Select
                                    onValueChange={(e) => {
                                        setType(POST_TYPE_MAP.get(e) || null);
                                        field.onChange(e);
                                    }}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Content Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vid">Vid</SelectItem>
                                        <SelectItem value="pics">
                                            Pics
                                        </SelectItem>
                                        <SelectItem value="story" disabled>
                                            Story (coming soon)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {type && (
                        <div className="flex flex-col sm:flex-row w-full gap-4">
                            <section className="flex-1 space-y-8">
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
                                                    Select the platforms you
                                                    want to post to.
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
                                                                key={
                                                                    platform.id
                                                                }
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
                                                                    {
                                                                        platform.label
                                                                    }
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
                                                {type?.label}
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
                                                            e.currentTarget
                                                                .files;
                                                        if (files) {
                                                            const urls =
                                                                Array.from(
                                                                    files
                                                                ).map((file) =>
                                                                    URL.createObjectURL(
                                                                        file
                                                                    )
                                                                );
                                                            setFileUrls(urls);
                                                        }
                                                    }}
                                                    multiple={true}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    ref={field.ref}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Upload one or more image files
                                                (jpeg) with a maximum size of 30
                                                MB each.
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
                                                            e.currentTarget
                                                                .value
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
                                                            Schedule this post
                                                            for a later date or
                                                            time
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={(
                                                                e
                                                            ) => {
                                                                field.onChange(
                                                                    e
                                                                );
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
                                                                            hh:mm
                                                                            aa
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
                                                        Enter the time you want
                                                        this post to uhh... post
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
                            </section>
                            <section className="flex-1">
                                <div className="paper shadow-inner px-2 md:px-4 lg:px-6 xl:px-16 py-4 flex justify-center items-center h-full">
                                    {type?.label === "Pics" &&
                                        instagramAccount && (
                                            <InstagramPost
                                                aviUrl={
                                                    instagramAccount.avi_url
                                                }
                                                username={
                                                    instagramAccount.username
                                                }
                                                caption={caption}
                                                imageUrls={fileUrls}
                                                location=""
                                            />
                                        )}
                                    {type?.label === "Vid" &&
                                        instagramAccount && (
                                            <InstagramReel
                                                aviUrl={
                                                    instagramAccount.avi_url
                                                }
                                                username={
                                                    instagramAccount.username
                                                }
                                                caption={caption}
                                                videoUrl={
                                                    fileUrls
                                                        ? fileUrls[0]
                                                        : null
                                                }
                                                location=""
                                            />
                                        )}
                                </div>
                            </section>
                        </div>
                    )}
                </fieldset>
            </form>
        </Form>
    );
}
