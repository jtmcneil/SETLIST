const baseUrl = "https://graph.instagram.com";

export async function getInstagramUser() {
    const url = `${baseUrl}/me`;
    const params = new URLSearchParams({
        fields: "user_id,username",
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN!, //TODO - switch to user access token instead of env
    });
    const user = await fetch(`${url}?${params.toString()}`).then((res) =>
        res.json()
    );
    return user;
}

async function createContainer(
    userId: string,
    url: string,
    isCarouselItem: boolean,
    isReel: boolean
) {
    // const isVideo = url.endsWith(".mp4") || url.endsWith(".mov");
    const body = {
        is_carousel_item: isCarouselItem,
        media_type: isReel ? "REELS" : null,
        share_to_feed: isReel ? true : null,
        thumb_offset: isReel ? 0 : null,
        video_url: isReel ? url : null,
        image_url: isReel ? null : url,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN!, //TODO - switch to user access token instead of env
    };

    const container = await fetch(`${baseUrl}/v22.0/${userId}/media`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    }).then((res) => res.json());
    console.log(container);

    return container;
}

async function waitForContainer(containerId: string) {
    let status = await fetch(
        `${baseUrl}/v22.0/${containerId}?access_token=${process.env
            .INSTAGRAM_ACCESS_TOKEN!}` //TODO - switch to user access token instead of env
    ).then((res) => res.json());

    while (status.status === "IN_PROGRESS") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        status = await fetch(
            `${baseUrl}/v22.0/${containerId}?access_token=${process.env
                .INSTAGRAM_ACCESS_TOKEN!}` //TODO - switch to user access token instead of env
        ).then((res) => res.json());
    }

    console.log(status);
}

async function createMedia(userId: string, containerId: string) {
    const media = await fetch(`${baseUrl}/v22.0/${userId}/media_publish`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            creation_id: containerId,
            access_token: process.env.INSTAGRAM_ACCESS_TOKEN!, //TODO - switch to user access token instead of env
        }),
    }).then((res) => res.json());
    console.log(media);
    return media;
}

export async function createInstagramPost(urls: string[]) {
    const user = await getInstagramUser();
    const containers: string[] = [];

    for (let i = 0; i < urls.length; i++) {
        const container = await createContainer(
            user.user_id!,
            urls[i],
            true,
            false
        );
        containers.push(container.id!);
    }

    let carouselContainer;

    if (containers.length > 1) {
        carouselContainer = await fetch(
            `${baseUrl}/v22.0/${user.user_id!}/media`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    media_type: "CAROUSEL",
                    children: containers.join(","),
                    access_token: process.env.INSTAGRAM_ACCESS_TOKEN!, //TODO - switch to user access token instead of env
                }),
            }
        ).then((res) => res.json());
    }

    const media = await createMedia(
        user.user_id!,
        containers.length > 1 ? carouselContainer.id! : containers[0]
    );

    return media;
}

export async function createInstagramReel(url: string) {
    const user = await getInstagramUser();
    const container = await createContainer(user.user_id!, url, false, true);
    await waitForContainer(container.id!);
    const media = await createMedia(user.user_id!, container.id!);
    return media;
}
