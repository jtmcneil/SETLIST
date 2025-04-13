// src/lib/tiktok/client.ts
import {
    RefreshTokenResponse,
    UserDataResponse,
    PostCreationResponse,
    PhotoPostBody,
    VideoPostBody,
    ErrorResponse,
} from "./types";

import { prisma } from "@/lib/prisma";

/**
 * A client for interacting with the TikTok API with automatic token refresh
 */
export class TikTokClient {
    private account: DB.Account;

    /**
     * Creates a new TikTok API client
     *
     * @param account - The account returned from the DB
     */
    constructor(account: DB.Account) {
        this.account = account;
    }

    /**
     * Generates the authorization URL for TikTok OAuth
     *
     * @param scope - Space-separated list of permissions to request
     * @param state - Optional state parameter for security
     * @returns The authorization URL to redirect the user to
     */
    static getAuthorizationUrl(): void {}

    /**
     * Exchanges an authorization code for access and refresh tokens
     *
     * @param code - The authorization code from the callback URL
     * @returns The token exchange response
     */
    public exchangeCodeForToken(): void {}

    /**
     * Sets access and refresh tokens
     *
     * @param access_token - the access token
     * @param expires_in - the number of seconds until the access token expires
     */
    private async setAccessToken(access_token: string, expires_in: number) {
        const expiresAt = Math.floor(Date.now() / 1000) + expires_in;
        this.account.access_token = access_token;
        this.account.expires_at = expiresAt;

        await prisma.account.update({
            where: {
                provider_providerAccountId: {
                    providerAccountId: this.account.providerAccountId,
                    provider: "tiktok",
                },
            },
            data: {
                access_token,
                expires_at: expiresAt,
            },
        });
    }

    /**
     * Refreshes the access token using the refresh token
     *
     * @returns A promise that resolves when the token has been refreshed
     * @throws If refresh token is missing or refresh fails
     */
    private async refreshAccessToken(): Promise<void> {
        const urlEncodedData = new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: this.account.refresh_token!,
        });

        const response: RefreshTokenResponse | ErrorResponse = await fetch(
            `https://open.tiktokapis.com/v2/oauth/token/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: urlEncodedData.toString(),
            }
        ).then((res) => res.json());

        if ("error" in response) {
            throw new Error(
                `Failed to refresh token: ${response.error} - ${response.error_description}`
            );
        }

        const { access_token, expires_in } = response;
        await this.setAccessToken(access_token, expires_in);
    }

    /**
     * Ensures the access token is valid
     *
     * @returns nothing
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
     * Makes an authenticated request to the TikTok API
     *
     * @param endpoint - The API endpoint path
     * @param options - Fetch options for the request
     * @returns The parsed JSON response
     * @throws If the request fails
     */
    public async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        await this.ensureValidToken();

        const url = `https://open.tiktokapis.com/v2${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.account.access_token}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
        }).then((res) => res.json());

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status} ${response.statusText}`
            );
        }

        return response as Promise<T>;
    }

    /**
     * Gets the authenticated user's profile information
     *
     * @returns The user profile data
     */
    public async getUserProfile(): Promise<UserDataResponse> {
        return this.request<UserDataResponse>("/user/info/");
    }

    /**
     * Creates a new photo post on TikTok
     *
     * @param urls - list of urls where images are hosted
     * @param caption - The caption for the post
     */
    public async createPhotoPost(
        urls: string[],
        caption: string
    ): Promise<PostCreationResponse> {
        const body: PhotoPostBody = {
            media_type: "PHOTO",
            post_mode: "DIRECT_POST",
            post_info: {
                privacy_level: "SELF_ONLY", // TODO - allow user to choose
                description: caption,
            },
            source_info: {
                source: "PULL_FROM_URL",
                photo_images: urls,
                photo_cover_index: 0, // TODO - allow user to choose
            },
        };

        return this.request<PostCreationResponse>(
            "/post/publish/content/init/",
            {
                method: "POST",
                body: JSON.stringify(body),
            }
        );
    }

    /**
     * Creates a new video post on TikTok
     *
     * @param url - the url where the video is hosted
     * @param caption - the caption for the post
     */
    public async createVideoPost(
        url: string,
        caption: string
    ): Promise<PostCreationResponse> {
        const body: VideoPostBody = {
            post_info: {
                privacy_level: "SELF_ONLY", // TODO - allow the user to choose
                title: caption,
            },
            source_info: {
                source: "PULL_FROM_URL",
                video_url: url,
            },
        };
        return this.request<PostCreationResponse>("/post/publish/video/init/", {
            method: "POST",
            body: JSON.stringify(body),
        });
    }
}
