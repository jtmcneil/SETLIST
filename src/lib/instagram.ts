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

export async function createInstagramPost(url: string) {
    const user = await getInstagramUser();

    const container = await fetch(`${baseUrl}/v22.0/${user.user_id!}/media`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image_url: url,
            caption: "Hello world!",
            access_token: process.env.INSTAGRAM_ACCESS_TOKEN!, //TODO - switch to user access token instead of env
        }),
    }).then((res) => res.json());

    console.log(container);

    const media = await fetch(
        `${baseUrl}/v22.0/${user.user_id!}/media_publish`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                creation_id: container.id!,
                access_token: process.env.INSTAGRAM_ACCESS_TOKEN!, //TODO - switch to user access token instead of env
            }),
        }
    ).then((res) => res.json());

    console.log(media);
}
