import { Button } from "@/components/ui/button";
import { checkAuth } from "@/lib/auth";

export default async function Dashboard() {
    await checkAuth();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <Button>Post now</Button>
            <Button>Schedule post</Button>
            <div>Calendar TODO</div>
        </main>
    );
}
