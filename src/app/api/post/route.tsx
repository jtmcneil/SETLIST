import { createInstagramPost } from "@/lib/instagram";

export async function POST(req: Request) {
    const { fileName } = await req.json();
    // console.log(`https://media.setlistt.com/${fileName}`);
    createInstagramPost(`http://media.setlistt.com/${fileName}`); // TODO: should probably switch this to https, but need certificates for it to work
    return new Response();
}
