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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import InstagramPost from "../screens/InstagramPost";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { resizeImage } from "@/lib/image";

const MAX_FILE_SIZE = 30e7; // 300 MB in bytes
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg"];
const PLATFORMS = [
    { id: "instagram", label: "Instagram" },
    { id: "tiktok", label: "TikTok" },
];

export default function UploadPicsForm() {
    const { data: session } = useSession();
    const [caption, setCaption] = useState<string>("");
    const [fileUrls, setFileUrls] = useState<string[] | null>(null);

    // get accounts
    const instagramAccount = session?.user.accounts.find(
        (account) => account.provider == "instagram"
    );
    const tiktokAccount = session?.user.accounts.find(
        (account) => account.provider == "tiktok"
    );

    // define schema
    const formSchema = z.object({
        platforms: z
            .array(z.string())
            .refine((value) => value.some((item) => item), {
                message: "You have to select at least one item.",
            }),
        files:
            typeof window === "undefined"
                ? z.any() // Server-side fallback
                : z
                      .instanceof(FileList)
                      .refine(
                          (files) => files?.length >= 1,
                          "File is required."
                      )
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
            // Get list of file extensions
            const exts = [];
            for (const file of values.files) {
                exts.push(file.name.split(".").pop());
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
                    body: await resizeImage(values.files[i]),
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

            //if the upload is successful, send request to backend to post pics
            await fetch("/api/post/pics", {
                cache: "no-store",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileNames,
                    caption,
                    platforms: values.platforms,
                }),
            });
        };
        uploadMedia();
    }

    return (
        <div className="flex w-full gap-4">
            <section className="flex-1">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
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
                                                field.onChange(e.target.files)
                                            }
                                            onChangeCapture={(e) => {
                                                const files =
                                                    e.currentTarget.files;
                                                if (files) {
                                                    const urls = Array.from(
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
                                        Upload one or more image files (jpeg)
                                        with a maximum size of 30 MB each.
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
                        <Button type="submit" className="w-full">
                            Post!
                        </Button>
                    </form>
                </Form>
            </section>
            <section className="flex-1">
                {instagramAccount && (
                    <InstagramPost
                        aviUrl={instagramAccount.avi_url} // TODO switch to insta
                        username={instagramAccount.username} // TODO switch to insta
                        caption={caption}
                        imageUrls={fileUrls}
                        location=""
                    />
                )}
            </section>
        </div>
    );
}
