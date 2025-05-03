"use client";

import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FaInstagram, FaTiktok } from "react-icons/fa6";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Post } from "@/types/db";
import Link from "next/link";
import Image from "next/image";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import EditPostForm from "@/components/forms/EditPostForm";

interface PostListProps {
    posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
    const [dates, setDates] = useState<DateRange | undefined>(undefined);
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

    useEffect(() => {
        if (dates) {
            const { from, to } = dates;
            const filteredPosts = posts.filter((post) => {
                const postDate = new Date(post.postedAt);
                return (!from || postDate >= from) && (!to || postDate <= to);
            });
            setFilteredPosts(filteredPosts);
        } else {
            setFilteredPosts(posts);
        }
    }, [dates, posts]);

    useEffect(() => {
        if (platforms.length > 0) {
            const filteredPosts = posts.filter((post) =>
                platforms.some((platform) => post.platforms.includes(platform))
            );
            setFilteredPosts(filteredPosts);
        } else {
            setFilteredPosts(posts);
        }
    }, [platforms, posts]);

    const now = new Date();
    const futurePosts = filteredPosts.filter((post) => post.postedAt > now);
    const pastPosts = filteredPosts.filter((post) => post.postedAt <= now);

    return (
        <div className="flex">
            <section className="p-2">
                <h2>Filter</h2>
                <div>
                    <h3>by date</h3>
                    <Calendar
                        mode="range"
                        selected={dates}
                        onSelect={setDates}
                        className="p-2 border-2 rounded-lg border-gray-100"
                    />
                </div>
                <Separator className="my-3" />
                <div>
                    <h3>by platform</h3>
                    <ToggleGroup
                        type="multiple"
                        variant={"outline"}
                        className="flex justify-start p-2 border-2 rounded-lg border-gray-100"
                        onValueChange={setPlatforms}
                    >
                        <ToggleGroupItem
                            value="instagram"
                            className="data-[state=on]:bg-black data-[state=on]:text-white"
                        >
                            <FaInstagram className="scale-150" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="tiktok"
                            className="data-[state=on]:bg-black data-[state=on]:text-white"
                        >
                            <FaTiktok className="scale-125" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </section>
            <section className="flex-1 p-2">
                <h2>Your content</h2>
                <h3>Coming up</h3>
                {futurePosts.length === 0 && (
                    <p>
                        Nothing planned yet...{" "}
                        <Link
                            href={"/post?scheduled=true"}
                            className="text-blue-500"
                        >
                            schedule now!
                        </Link>
                    </p>
                )}
                {futurePosts.map((post) => (
                    <PostListItem post={post} key={post.id} />
                ))}
                {pastPosts.length > 0 && (
                    <>
                        <Separator className="my-4" />
                        <h3>Posted</h3>
                        {pastPosts.map((post) => (
                            <PostListItem post={post} key={post.id} />
                        ))}
                    </>
                )}
            </section>
        </div>
    );
}

function PostListItem({ post }: { post: Post }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog modal open={open} onOpenChange={setOpen}>
            <DialogTrigger className="flex justify-between w-full gap-4 p-2 border-2 rounded-lg border-gray-100 mb-2">
                <div className="flex gap-4 overflow-hidden">
                    <div className="relative w-12 h-12">
                        <Image
                            src={"http://media.setlistt.com/" + post.media[0]}
                            alt="Your media"
                            fill={true}
                            style={{ objectFit: "cover" }}
                            className="rounded-md"
                        />
                    </div>
                    <div className="flex flex-col text-left">
                        <h4 className="truncate max-w-xs">{post.caption}</h4>
                        <p className="text-gray-400">
                            {post.postedAt.toLocaleString([], {
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {post.platforms.includes("instagram") && (
                        <div className="border-2 border-grey-400 p-2 rounded-md">
                            <FaInstagram className="text-gray-400 scale-150" />
                        </div>
                    )}
                    {post.platforms.includes("tiktok") && (
                        <div className="border-2 border-grey-400 p-2 rounded-md">
                            <FaTiktok className="text-gray-400 scale-125" />
                        </div>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogDescription>
                        You can edit the post caption and scheduled date here.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4">
                    <Carousel className="flex-1 rounded-md overflow-hidden">
                        <CarouselContent>
                            {post.media.map((img, i) => (
                                <CarouselItem key={i}>
                                    <Image
                                        src={"http://media.setlistt.com/" + img}
                                        width={500} // Set the width of the image
                                        height={500} // Set the height of the image
                                        alt="your image"
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {post.media.length > 1 && (
                            <>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </>
                        )}
                    </Carousel>
                    <div className="flex-1">
                        <EditPostForm
                            post={post}
                            onSubmit={() => setOpen(false)}
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
