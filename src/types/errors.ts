export class ApiError extends Error {
    public code: number;
    public response: Response;
    constructor(message: string, code: number) {
        super(message);
        this.code = code;
        this.response = new Response(message, { status: code });
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    static getResponse(e: unknown): Response {
        if (e instanceof ApiError) {
            return e.response;
        } else {
            return new InternalServerError("Internal Server Error").response;
        }
    }
}

/**
 * Client Error Responses
 */

// Error 400
export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

// Error 401
export class UnauthorizedError extends ApiError {
    constructor(message: string) {
        super(message, 401);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

// Error 402
export class PaymentRequiredError extends ApiError {
    constructor(message: string) {
        super(message, 402);
        Object.setPrototypeOf(this, PaymentRequiredError.prototype);
    }
}

// Error 403
export class ForbiddenError extends ApiError {
    constructor(message: string) {
        super(message, 403);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

// Error 404
export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Server Error Responses
 */

// Error 500
export class InternalServerError extends ApiError {
    constructor(message: string) {
        super(message, 500);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}

// Error 501
export class NotImplementedError extends ApiError {
    constructor(message: string = "This is not yet implemented") {
        super(message, 501);
        Object.setPrototypeOf(this, NotImplementedError.prototype);
    }
}
