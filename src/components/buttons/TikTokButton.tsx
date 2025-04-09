import { Button } from "@/components/ui/button";
import { FaTiktok } from "react-icons/fa6";
import Link from "next/link";

export default function TikTokButton() {
    return (
        <Button>
            <Link href="/api/oauth/tiktok">
                <FaTiktok />
            </Link>
        </Button>
    );
}
