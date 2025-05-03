"use client";

import { SessionProvider } from "next-auth/react";
import CreatePostForm from "@/components/forms/CreatePostForm";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PostPage() {
    const searchParams = useSearchParams();
    const scheduled = searchParams.get("scheduled") === "true";

    return (
        <div className="flex flex-col m-10 p-10 shadow-lg bg-white justify-between gap-4">
            <div className="flex flex-col ">
                <div className="w-8 h-8 p-1 mb-4 flex items-center justify-center border border-gray-400 rounded-full hover:bg-gray-100 transition-colors">
                    <Link href={"/dashboard"}>
                        <ChevronLeft className="text-gray-400" />
                    </Link>
                </div>

                <h1>New Post</h1>
                <p>Select your post type, then go bananas </p>
            </div>
            <SessionProvider>
                <CreatePostForm scheduled={scheduled} />
            </SessionProvider>
        </div>
    );
}
