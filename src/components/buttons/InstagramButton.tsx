import { Button } from "../ui/button";
import { FaInstagram } from "react-icons/fa";
import Link from "next/link";

export default function InstagramButton() {
    return (
        <Button>
            <Link
                href={
                    "https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=2101208090302831&redirect_uri=https://localhost:3000/dashboard&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights"
                }
            >
                <FaInstagram />
            </Link>
        </Button>
    );
}
