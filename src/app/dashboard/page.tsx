import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

import PostList from "./PostList";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Post } from "@/types/db";

export default async function Dashboard() {
    const session = await auth();

    if (!session?.user.id) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1>Please sign in to access the dashboard.</h1>
                <Button>
                    <Link href={"/api/auth/signin"}>Sign In</Link>
                </Button>
            </div>
        );
    }

    const posts: Post[] = await prisma.post.findMany({
        where: { userId: session.user.id },
        orderBy: { postedAt: "desc" },
    });

    return (
        <div className="flex flex-col m-10 p-10 shadow-lg bg-white justify-between gap-4">
            <div className="flex align-middle justify-between">
                <h1>Dashboard</h1>
                <InteractiveHoverButton>
                    <Link href={"/post"}>Create New Post</Link>
                </InteractiveHoverButton>
            </div>
            <Separator />
            <PostList posts={posts} />
        </div>
        // <div className="flex min-h-screen flex-col items-center justify-center p-24">
        //     <div className="flex w-5 justify-center space-x-4 m-4">
        //         <InstagramButton />
        //         <YouTubeButton />
        //         <TikTokButton />
        //     </div>
        //     <div className="flex w-5 justify-center space-x-4 m-4">
        //         <Button asChild>
        //             <Link href="/post">Post now</Link>
        //         </Button>
        //         <Button>Schedule post</Button>
        //     </div>
        // </div>
    );
}
