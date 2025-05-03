import { zodResolver } from "@hookform/resolvers/zod";
import { Post } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { EditPostPayload } from "@/types/api";

export default function EditPostForm({
    post,
    onSubmit,
}: {
    post: Post;
    onSubmit: () => void;
}) {
    const formSchema = z.object({
        caption: z.string().optional(),
        datetime: z.date(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            caption: post.caption || "",
            datetime: post.postedAt ? new Date(post.postedAt) : new Date(),
        },
    });

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

    async function handleSubmit(data: z.infer<typeof formSchema>) {
        const body: EditPostPayload = {
            postId: post.id,
            caption: data.caption || post.caption,
            postedAt: data.datetime,
        };

        const response = await fetch("/api/post", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        onSubmit();
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col h-full justify-between"
            >
                <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base">Caption</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter caption"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="datetime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-base">
                                Date & Time
                            </FormLabel>
                            <Popover modal>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
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
                                                <span>MM/DD/YYYY hh:mm aa</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 ml-8"
                                    side="right"
                                >
                                    <div className="flex flex-col">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={handleDateSelect}
                                            disabled={(date) =>
                                                date <
                                                new Date(
                                                    new Date().setDate(
                                                        new Date().getDate() - 1
                                                    )
                                                )
                                            }
                                        />
                                        <div className="p-4">
                                            <FormLabel className="text-base">
                                                Time
                                            </FormLabel>
                                            <Input
                                                value={
                                                    field.value
                                                        ? field.value
                                                              .toTimeString()
                                                              .slice(0, 5)
                                                        : ""
                                                }
                                                id="time"
                                                type="time"
                                                onChange={(e) => {
                                                    handleTimeChange(
                                                        e.target.value
                                                    );
                                                }}
                                            ></Input>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Enter the time you want this post to uhh... post
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="mt-4">
                    Update Post
                </Button>
            </form>
        </Form>
    );
}
