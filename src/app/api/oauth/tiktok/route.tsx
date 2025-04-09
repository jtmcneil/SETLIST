import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/*
Implement the server code to handle authorization grant flow
The server code must be responsible for the following:

- Ensuring that the client secret and refresh token are stored securely.
- Ensuring that the security for each user is protected by preventing request forgery attacks.
- Handling the refresh flow before access token expiry.
- Managing the access token request flow for each user.
*/

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const baseUrl = "https://www.tiktok.com/v2/auth/authorize/";
    const params = new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        scope: "user.info.basic,video.publish,video.upload",
        redirect_uri:
            "https://glad-intensely-albacore.ngrok-free.app/api/oauth/tiktok/callback",
        state: session.user.id!, // TODO create a random state string in database instead of user id
        response_type: "code",
        disable_auto_auth: "1",
    });
    const url = `${baseUrl}?${params.toString()}`;

    redirect(url);
    // return new Response(`${baseUrl}?${params.toString()}`);
}
