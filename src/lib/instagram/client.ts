import { InternalServerError, NotImplementedError } from "@/types/errors";
import {
    ContainerResponse,
    CreateCarouselContainerParams,
    CreateImageContainerParams,
    CreateReelContainerParams,
    GetUserParams,
    GetUserResponse,
    MediaResponse,
    MediaSuccessResponse,
    PublishMediaParams,
} from "./types";
import { Account } from "@/types/db";

/**
 * A client for interacting with the Instagram API with automatic token refresh
 */
export class InstagramClient {
    private account: Account;

    /**
     * Creates a new Instagram API Client
     *
     * @param account - The account returned from the DB
     */
    constructor(account: Account) {
        this.account = account;
    }

    /**
     * Refreshes the access token using the refresh token
     *
     * @returns A promise that resolves when the token has been refreshed
     * @throws If refresh token is missing or refresh fails
     */
    private async refreshAccessToken(): Promise<void> {
        throw new NotImplementedError();
    }

    /**
     * Ensures the access token is valid
     *
     * @returns a promise that resolves after the acces token is verified
     * @throws If there is a failure refreshing the token
     */
    private async ensureValidToken(): Promise<void> {
        if (
            !this.account.expires_at ||
            Math.floor(Date.now() / 1000) >= this.account.expires_at - 5 * 60
        ) {
            await this.refreshAccessToken();
        }
    }

    /**
     * Makes an authenticated request to the Instagram API
     *
     * @param endpoint - The API endpoint path
     * @param options - Fetch options for the request
     * @returns The parsed JSON response
     * @throws If the request fails
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        await this.ensureValidToken();

        const url = `https://graph.instagram.com${endpoint}`;

        const response = await fetch(url, {
            cache: "no-store",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        }).then((res) => res.json());

        if ("error" in response) {
            throw new InternalServerError(
                `API request failed: ${response.error.message} - Code:${response.error.code} Subcode:${response.error.subcode}`
            );
        }

        return response as Promise<T>;
    }

    /**
     *
     * @returns a promise that resolves to the user or an error
     */
    public async getInstagramUser(): Promise<GetUserResponse> {
        const params: GetUserParams = {
            access_token: this.account.access_token!,
            fields: "user_id,username,profile_picture_url",
        };
        const queryString = new URLSearchParams(params).toString();

        const user = this.request<GetUserResponse>(`/me?${queryString}`);

        return user;
    }

    /**
     *
     * @param url - the url of the image
     * @param isCarouselItem - set to true if this container will be included in a carousel
     * @param caption - the caption for the image
     * @throws if there is a failure creating the container
     * @returns the container id
     */
    private async createImageContainer(
        url: string,
        isCarouselItem: boolean = false,
        caption?: string
    ): Promise<MediaSuccessResponse> {
        const body: CreateImageContainerParams = {
            access_token: this.account.access_token!,
            image_url: url,
            is_carousel_item: isCarouselItem,
            caption,
        };

        const container = await this.request<MediaResponse>(
            `/v22.0/${this.account.providerAccountId}/media`,
            {
                method: "POST",
                body: JSON.stringify(body),
            }
        );

        if ("error" in container) {
            throw new InternalServerError(
                `Error Creating Container: ${container.error.error_user_msg} - Code:${container.error.code} Subcode:${container.error.error_subcode}`
            );
        }

        return container;
    }

    /**
     *
     * @param children - a list of container ids to add to the carousel
     * @param caption - the caption for the carousel
     * @throws if there is a failure creating the container
     * @returns the container id
     */
    private async createCarouselContainer(
        children: string[],
        caption?: string
    ): Promise<MediaSuccessResponse> {
        const body: CreateCarouselContainerParams = {
            access_token: this.account.access_token!,
            children,
            media_type: "CAROUSEL",
            caption,
        };

        const container = await this.request<MediaResponse>(
            `/v22.0/${this.account.providerAccountId}/media`,
            {
                method: "POST",
                body: JSON.stringify(body),
            }
        );

        if ("error" in container) {
            throw new InternalServerError(
                `Error Creating Container: ${container.error.error_user_msg} - Code:${container.error.code} Subcode:${container.error.error_subcode}`
            );
        }

        return container;
    }

    /**
     *
     * @param url - the url of the video
     * @param caption - the caption for the reel
     * @throws if there is a failure creating the container
     * @returns the container id
     */
    private async createReelContainer(
        url: string,
        caption?: string
    ): Promise<MediaSuccessResponse> {
        const body: CreateReelContainerParams = {
            access_token: this.account.access_token!,
            video_url: url,
            media_type: "REELS",
            caption,
        };

        const container = await this.request<MediaResponse>(
            `/v22.0/${this.account.providerAccountId}/media`,
            {
                method: "POST",
                body: JSON.stringify(body),
            }
        );

        if ("error" in container) {
            throw new InternalServerError(
                `Error Creating Container: ${container.error.error_user_msg} - Code:${container.error.code} Subcode:${container.error.error_subcode}`
            );
        }

        return container;
    }

    /**
     *
     * @param containerId the container id to await
     */
    private async awaitContainer(containerId: string): Promise<void> {
        let status = await this.request<ContainerResponse>(
            `/v22.0/${containerId}?access_token=${this.account.access_token!}`
        );

        while (status.status === "IN_PROGRESS") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            status = await this.request<ContainerResponse>(
                `/v22.0/${containerId}?access_token=${this.account
                    .access_token!}`
            );
        }
    }

    /**
     *
     * @param containerId the container id to publish
     * @throws if there's an error publishing the container
     */
    private async publishMedia(
        containerId: string
    ): Promise<MediaSuccessResponse> {
        const body: PublishMediaParams = {
            access_token: this.account.access_token!,
            creation_id: containerId,
        };

        const media = await this.request<MediaResponse>(
            `/v22.0/${this.account.providerAccountId}/media_publish`,
            {
                method: "POST",
                body: JSON.stringify(body),
            }
        );

        if ("error" in media) {
            throw new InternalServerError(
                `Error Publishing Container: ${media.error.error_user_msg} - Code:${media.error.code} Subcode:${media.error.error_subcode}`
            );
        }

        return media;
    }

    /**
     *
     * @param urls - list of image urls to publish
     * @param caption - the caption of the post
     * @returns the media id of the post
     */
    public async createPost(
        urls: string[],
        caption?: string
    ): Promise<MediaSuccessResponse> {
        const containers: string[] = [];

        for (let i = 0; i < urls.length; i++) {
            const container = await this.createImageContainer(
                urls[i],
                urls.length > 1,
                urls.length > 1 ? undefined : caption
            );
            containers.push(container.id);
        }

        let carouselContainer, media: MediaSuccessResponse;

        if (containers.length > 1) {
            carouselContainer = await this.createCarouselContainer(
                containers,
                caption
            );
            media = await this.publishMedia(carouselContainer.id);
        } else {
            media = await this.publishMedia(containers[0]);
        }

        return media;
    }

    /**
     *
     * @param url the url of the video to post
     * @returns the media id of the reel
     */
    public async createReel(url: string, caption?: string) {
        const container = await this.createReelContainer(url, caption);
        await this.awaitContainer(container.id);
        const media = await this.publishMedia(container.id);
        return media;
    }
}
