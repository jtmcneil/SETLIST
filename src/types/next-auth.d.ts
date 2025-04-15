import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        image: string;
        accounts: {
            provider: string;
            avi_url: string;
            username: string;
        }[];
    }

    interface Session {
        user: User & DefaultSession["user"];
        expires: string;
        error: string;
    }
}
