import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { env } from "process";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const { code, scopes, state, error, error_derror_description } = params;

    // TODO: handle error getting code

    const user = await prisma.user.findUnique({
        where: { id: state }, // TODO: create a random state string in database instead of user id
    });

    if (!user) {
        return new Response("Unauthenticated Request", { status: 401 });
    }

    // get access token
    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            code: params.code!,
            grant_type: "authorization_code",
            redirect_uri:
                "https://glad-intensely-albacore.ngrok-free.app/api/oauth/tiktok/callback",
        }),
    }).then((res) => res.json());

    if (res.error) {
        return new Response("Server error", { status: 500 });
    }

    // store tiktok account in database
    await prisma.account.create({
        data: {
            userId: user.id,
            type: "oauth",
            provider: "tiktok",
            providerAccountId: res.open_id,
            refresh_token: res.refresh_token,
            access_token: res.access_token,
            expires_at: Math.floor(Date.now() / 1000) + res.expires_in,
            refresh_expires_at:
                Math.floor(Date.now() / 1000) + res.refresh_expires_in,
            token_type: res.token_type,
            scope: res.scope,
            id_token: null,
            session_state: null,
        },
    });

    redirect("/");
}
