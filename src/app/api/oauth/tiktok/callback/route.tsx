import { redirect } from "next/navigation";
import { TikTokClient } from "@/lib/tiktok/client";
import { ApiError, InternalServerError } from "@/types/errors";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const { code, state, error, error_description } = params;

    console.log(state);

    if (error) {
        return new InternalServerError(error_description).response;
    }

    // TODO: create a random state string in database instead of user id

    try {
        await TikTokClient.createAccount(state, code);
    } catch (e) {
        if (e instanceof ApiError) {
            return e.response;
        }
        return new InternalServerError("Error loggin into TikTok").response;
    }

    redirect("/");
}
