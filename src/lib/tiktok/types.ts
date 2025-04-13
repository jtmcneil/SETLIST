export interface ErrorResponse {
    error: string;
    error_description: string;
    log_id: string;
}

/**
 * Response from token refresh or authorization code exchange
 */
export interface RefreshTokenResponse {
    open_id: string;
    scope: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
}

/**
 * User profile data returned by the TikTok API
 */
export interface UserDataResponse {
    data: {
        user: {
            open_id: string;
            union_id: string;
            avatar_url: string;
            avatar_url_100: string;
            avatar_url_200: string;
            display_name: string;
            profile_deep_link: string;
            bio_description: string;
            followers_count: number;
            following_count: number;
            likes_count: number;
            video_count: number;
        };
    };
    error?: {
        code: string;
        message: string;
        log_id: string;
    };
}

/**
 * Response when uploading media (photo or video)
 */
export interface MediaUploadResponse {
    data: {
        media_id: string;
        expire_in_seconds: number;
    };
    error?: {
        code: string;
        message: string;
        log_id: string;
    };
}

/**
 * Response when creating a post
 */
export interface PostCreationResponse {
    data: {
        post_id: string;
        post_link: string;
    };
    error?: {
        code: string;
        message: string;
        log_id: string;
    };
}

/**
 * Post Info for creating a video post
 */
export interface VideoPostInfo {
    privacy_level:
        | "PUBLIC_TO_EVERYONE"
        | "MUTUAL_FOLLOW_FRIENDS"
        | "FOLLOWER_OF_CREATOR"
        | "SELF_ONLY";
    title?: string;
    disable_duet?: boolean;
    disable_stitch?: boolean;
    disable_comment?: boolean;
    video_cover_timestamp_ms?: number;
    brand_content_toggle?: boolean;
    brand_organic_toggle?: boolean;
    is_aigc?: boolean;
}

/**
 * Source Info for creating a video post
 */
export interface VideoSourceInfo {
    source: "PULL_FROM_URL";
    video_url: string;
}

/**
 * Video Post Body
 */
export interface VideoPostBody {
    post_info: VideoPostInfo;
    source_info: VideoSourceInfo;
}

/**
 * Post Info for creating a photo post
 */
export interface PhotoPostInfo {
    title?: string;
    description?: string;
    privacy_level:
        | "PUBLIC_TO_EVERYONE"
        | "MUTUAL_FOLLOW_FRIENDS"
        | "FOLLOWER_OF_CREATOR"
        | "SELF_ONLY";
    disable_comment?: boolean;
    auto_add_music?: boolean;
    brand_content_toggle?: boolean;
    brand_organic_toggle?: boolean;
}

/**
 * Source Infor for creating a photo post
 */
export interface PhotoSourceInfo {
    source: "PULL_FROM_URL";
    photo_images: string[];
    photo_cover_index: number;
}

/**
 * Photo Post Body
 */
export interface PhotoPostBody {
    media_type: "PHOTO";
    post_mode: "DIRECT_POST";
    post_info: PhotoPostInfo;
    source_info: PhotoSourceInfo;
}
