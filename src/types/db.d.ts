// db.d.ts

/**
 * These types represent the database models and their relationships
 * as defined in your Prisma schema.
 */

/**
 * User model
 */

export interface User {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    accounts?: Account[];
    sessions?: Session[];
}

/**
 * Account model for OAuth providers
 */
export interface Account {
    // Composite ID fields
    provider: string;
    providerAccountId: string;

    // Other fields
    userId: string;
    type: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    refresh_expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
    avi_url: string | null;
    username: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    user?: User;
}

export interface Post {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    type: string;
    caption: string;
    media: string[];
    platforms: string[];
    agendaId: string | null;
    instagramId: string | null;
    tikTokId: string | null;
    instagramUrl: string | null;
    tikTokUrl: string | null;
    postedAt: Date;
}

/**
 * Types for create operations
 */

export interface UserCreateInput {
    id?: string;
    name?: string | null;
    email: string;
    emailVerified?: Date | null;
    image?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    accounts?: AccountCreateNestedManyInput;
    sessions?: SessionCreateNestedManyInput;
}

export interface AccountCreateInput {
    provider: string;
    providerAccountId: string;
    type: string;
    userId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    refresh_expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
    avi_url?: string | null;
    username?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    user?: UserCreateNestedOneInput;
}

export interface PostCreateInput {
    userId: string;
    type: "pics" | "vid";
    caption?: string;
    postedAt: Date;
    media?: string[];
    platforms: string[];
    agendaId?: string;
    instagramId?: string;
    tikTokId?: string | null;
    instagramUrl?: string | null;
    tikTokUrl?: string | null;
}

/**
 * Types for update operations
 */

export interface UserUpdateInput {
    name?: string | null;
    email?: string;
    emailVerified?: Date | null;
    image?: string | null;
    accounts?: AccountUpdateManyInput;
    sessions?: SessionUpdateManyInput;
}

export interface AccountUpdateInput {
    type?: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    refresh_expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
    avi_url?: string | null;
    username?: string | null;
    userId?: string;
}
