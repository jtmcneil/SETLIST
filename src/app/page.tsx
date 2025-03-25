import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-[100px]">Focus on the music!</h1>
            <h2 className="text-[36pt] text-gray-300">
                We&apos;ll do the rest.
            </h2>
            <Button asChild className="mt-8">
                <Link href={"/dashboard"}>Go to dashboard</Link>
            </Button>
        </main>
    );
}
