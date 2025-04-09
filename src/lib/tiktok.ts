export async function createTikTokVideoPost(
    tiktokID: string,
    accessToken: string,
    url: string
) {
    const response = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/video/init/",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                post_info: {
                    privacy_level: "SELF_ONLY", // TODO - change to public
                },
                source_info: {
                    source: "PULL_FROM_URL",
                    video_url: url,
                },
            }),
        }
    ).then((res) => res.json());
    return response;
}

export async function createTikTokPhotoPost(
    tiktokID: string,
    accessToken: string,
    urls: string[]
) {
    const response = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/content/init/",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                media_type: "PHOTO",
                post_mode: "DIRECT_POST",
                post_info: {
                    privacy_level: "SELF_ONLY", // TODO - change to public
                    title: "Setlistt Post",
                },
                source_info: {
                    source: "PULL_FROM_URL",
                    photo_images: urls,
                    photo_cover_index: 0,
                },
            }),
        }
    ).then((res) => res.json());
    return response;
}
