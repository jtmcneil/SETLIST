import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        image: string;
        accounts: {
            provider: string | null;
            avi_url: string | null;
            username: string | null;
        }[];
    }

    interface Session {
        user: User & DefaultSession["user"];
        expires: string;
        error: string;
    }
}
