import { createInstagramPost, createInstagramReel } from "@/lib/instagram";

export async function POST(req: Request) {
    const { type, fileNames } = await req.json();

    if (!fileNames || fileNames.length === 0) {
        // TODO Handle the error
    } else if (type === "video") {
        const media = await createInstagramReel(
            `http://media.setlistt.com/${fileNames[0]}`
        );
        return new Response(JSON.stringify(media));
    } else if (type === "pics") {
        const media = await createInstagramPost(
            fileNames.map(
                (fileName: string) => `http://media.setlistt.com/${fileName}`
            )
        );
        return new Response(JSON.stringify(media));
    }
}
