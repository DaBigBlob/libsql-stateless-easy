import { libsqlStreamResErrData } from "libsql-stateless";

/** Generic error produced by the Hrana client. */
export class ClientError extends Error {
    /** @private */
    constructor(message: string) {
        super(message);
        this.name = "ClientError";
    }
}

/** Error thrown when the server violates the protocol. */
export class ProtoError extends ClientError {
    /** @private */
    constructor(message: string) {
        super(message);
        this.name = "ProtoError";
    }
}

/** Error thrown when the server returns an error response. */
export class ResponseError extends ClientError {
    code: string | undefined;
    /** @internal */
    proto: libsqlStreamResErrData;

    /** @private */
    constructor(message: string, protoError: libsqlStreamResErrData) {
        super(message);
        this.name = "ResponseError";
        this.code = protoError.code;
        this.proto = protoError;
        this.stack = undefined;
    }
}

/** Error thrown when the HTTP server returns an error response. */
export class HttpServerError extends ClientError {
    status: number;

    /** @private */
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "HttpServerError";
    }
}

/** Error thrown when an internal client error happens. */
export class InternalError extends ClientError {
    /** @private */
    constructor(message: string) {
        super(message);
        this.name = "InternalError";
    }
}

/** Error thrown when the API is misused. */
export class MisuseError extends ClientError {
    /** @private */
    constructor(message: string) {
        super(message);
        this.name = "MisuseError";
    }
}


/** Error thrown by the client. */
class LibsqlError extends Error {
    /** Machine-readable error code. */
    code: string;
    /** Raw numeric error code */
    rawCode?: number;
    
    constructor(message: string, code: string, rawCode?: number, cause?: Error) {
        if (code !== undefined) {
            message = `${code}: ${message}`;
        }
        super(message, { cause });
        this.code = code;
        this.rawCode = rawCode
        this.name = "LibsqlError";
    }
}

function mapHranaErrorCode(e: ClientError): string {
    if (e instanceof ResponseError && e.code !== undefined) {
        return e.code;
    } else if (e instanceof ProtoError) {
        return "HRANA_PROTO_ERROR";
    } else if (e instanceof HttpServerError) {
        return "SERVER_ERROR";
    } else if (e instanceof InternalError) {
        return "INTERNAL_ERROR";
    } else {
        return "UNKNOWN";
    }
}

export function mapHranaError(e: unknown): unknown {
    if (e instanceof ClientError) {
        const code = mapHranaErrorCode(e);
        return new LibsqlError(e.message, code, undefined, e);
    }
    return e;
}