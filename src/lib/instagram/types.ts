/**
 * Request Param Types
 */

export type AuthorizationParams = {
    client_id: string;
    redirect_uri: string;
    response_type: "code";
    scope: string[];
    state?: string;
    enable_fb_login?: "0" | "1";
    force_authentication?: "0" | "1";
};

export type TokenParams = {
    client_id: string;
    client_secret: string;
    grant_type: "authorization_code";
    redirect_uri: string;
    code: string;
};

export type LongTokenParams = {
    grant_type: "ig_exchange_token";
    client_secret: string;
    access_token: string;
};

export type RefreshTokenParams = {
    grant_type: "ig_refresh_token";
    access_token: string;
};

export type CreateImageContainerParams = {
    access_token: string;
    image_url: string;
    alt_text?: string;
    caption?: string;
    collaborators?: string[];
    is_carousel_item?: boolean;
    location_id?: string;
    product_tags?: [{ product_id: string; x?: number; y?: number }];
    user_tags?: [{ usernames: string; x?: number; y?: number }];
};

export type CreateCarouselContainerParams = {
    access_token: string;
    children: string[];
    caption?: string;
    collaborators?: string[];
    location_id?: string;
    media_type: "CAROUSEL";
};

export type CreateReelContainerParams = {
    access_token: string;
    video_url: string;
    audio_name?: string;
    caption?: string;
    collaborators?: string[];
    cover_url?: string;
    thumb_offset?: number;
    location_id?: string;
    media_type: "REELS";
    product_tags?: [{ product_id: string; x?: number; y?: number }];
    share_to_feed?: boolean;
    user_tags?: [{ usernames: string; x?: number; y?: number }];
};

export type CreateStoryContainerParams = {
    access_token: string;
    caption?: string;
    image_url?: string;
    video_url?: string;
    location_id?: string;
    media_type?: "STORIES";
    product_tags?: [{ product_id: string; x?: number; y?: number }];
    user_tags?: [{ usernames: string; x?: number; y?: number }];
};

export type PublishMediaParams = {
    access_token: string;
    creation_id: string;
};

export type GetUserParams = {
    access_token: string;
    fields: string;
};

/**
 * Response Types
 */

export type AuthoriationSuccessResponse = {
    code: string;
};

export type AuthorizationErrorResponse = {
    error: string;
    error_reason: string;
    error_description: string;
};

export type AuthoriationResponse =
    | AuthoriationSuccessResponse
    | AuthorizationErrorResponse;

export type TokenSuccessResponse = {
    data: [
        {
            access_token: string;
            user_id: string;
            permissions: string;
        }
    ];
};

export type LongTokenSuccessResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    permissions: string;
};

export type TokenErrorResponse = {
    error_type: string;
    code: number;
    error_message: string;
};

export type TokenResponse =
    | TokenSuccessResponse
    | LongTokenSuccessResponse
    | TokenErrorResponse;

export type MediaSuccessResponse = {
    id: string;
};

export type MediaErrorResponse = {
    error: {
        message?: string;
        code?: number;
        error_subcode?: number;
        is_transient?: string;
        error_user_title?: string;
        error_user_msg?: string;
        fbtrace_id?: string;
    };
};

export type MediaResponse = MediaSuccessResponse | MediaErrorResponse;

export type ContainerResponse = {
    id: string;
    status: string;
    status_code: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
};

export type GetUserResponse = {
    id: string;
    user_id: string;
    username: string;
    profile_picture_url?: string;
};
