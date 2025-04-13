import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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
    const accessTokenRes = await fetch(
        "https://open.tiktokapis.com/v2/oauth/token/",
        {
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
                    "https://glad-intensely-albacore.ngrok-free.app/api/oauth/tiktok/callback", //TODO: use env variable
            }),
        }
    ).then((res) => res.json());

    if (accessTokenRes.error) {
        return new Response("Server error", { status: 500 });
    }

    // get user info
    const userInfoRes = await fetch(
        "https://open.tiktokapis.com/v2/user/info?fields=avatar_url,display_name'",
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessTokenRes.access_token}`,
            },
        }
    );
    // .then((res) => res.json());

    // if (userInfoRes.error.code !== "ok") {
    //     return new Response("Server error", { status: 500 });
    // }

    console.log(userInfoRes);

    // store tiktok account in database
    await prisma.account.create({
        data: {
            userId: user.id,
            type: "oauth",
            provider: "tiktok",
            providerAccountId: accessTokenRes.open_id,
            refresh_token: accessTokenRes.refresh_token,
            access_token: accessTokenRes.access_token,
            expires_at:
                Math.floor(Date.now() / 1000) + accessTokenRes.expires_in,
            refresh_expires_at:
                Math.floor(Date.now() / 1000) +
                accessTokenRes.refresh_expires_in,
            token_type: accessTokenRes.token_type,
            scope: accessTokenRes.scope,
            id_token: null,
            session_state: null,
            avi_url: userInfoRes.data.user.avatar_url,
            username: userInfoRes.data.user.display_name,
        },
    });

    redirect("/");
}
