import { Button } from "@/components/ui/button";
import TikTokButton from "@/components/ui/TikTokButton";
import YouTubeButton from "@/components/ui/YouTubeButton";
import InstagramButton from "@/components/ui/InstagramButton";
import { checkAuth } from "@/lib/auth";
import { createInstagramPost } from "@/lib/instagram";
import Link from "next/link";

export default async function Dashboard() {
    await checkAuth();

    // await createInstagramPost(
    //     "https://setlist-test-bucket.s3.us-east-1.amazonaws.com/IMG_3020.jpeg"
    // );

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="flex w-5 justify-center space-x-4 m-4">
                <InstagramButton />
                <YouTubeButton />
                <TikTokButton />
            </div>
            <div className="flex w-5 justify-center space-x-4 m-4">
                <Button asChild>
                    <Link href="/post">Post now</Link>
                </Button>
                <Button>Schedule post</Button>
            </div>
        </main>
    );
}
