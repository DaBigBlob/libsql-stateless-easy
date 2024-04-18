import type { libsqlStreamResErrData } from "libsql-stateless";

/** Error thrown by the client. */
export class LibsqlError extends Error {
    /** Machine-readable error code. */
    code: string;
    /** Raw numeric error code */
    rawCode?: number;
    
    constructor(message: string, code: string, cause?: Error) {
        super(`${code}: ${message}`, { cause });
        this.code = code;
        this.rawCode = undefined;
        this.name = "LibsqlError";
    }
}

/** Error thrown when the server violates the protocol. */
export class ProtoError extends LibsqlError {
    constructor(message: string) {
        super(message, "HRANA_PROTO_ERROR", new class extends Error {
            
            /** @private */
            constructor() {
                super(message);
                this.name = "ProtoError";
            }
        }());
    }
}

/** Error thrown when the server returns an error response. */
export class ResponseError extends LibsqlError {
    constructor(message: string, protoError: libsqlStreamResErrData) {
        super(message, protoError.code||"UNKNOWN", new class extends Error {
            /** @internal */
            proto: libsqlStreamResErrData;

            /** @private */
            constructor() {
                super(message);
                this.name = "ResponseError";
                this.proto = protoError;
                this.stack = undefined;
            }
        }());
    }
}

/** Error thrown when the HTTP server returns an error response. */
export class HttpServerError extends LibsqlError {

    constructor(message: string, status: number) {
        super(message, "SERVER_ERROR", new class extends Error {
            status: number;

            /** @private */
            constructor() {
                super(message);
                this.status = status;
                this.name = "HttpServerError";
            }
        }());
    }
}

/** Error thrown when an internal client error happens. */
export class InternalError extends LibsqlError {

    constructor(message: string) {
        super(message, "INTERNAL_ERROR", new class extends Error {

            /** @private */
            constructor() {
                super(message);
                this.name = "InternalError";
            }
        }());
    }
}

/** Error thrown when the API is misused. */
export class MisuseError extends LibsqlError {

    constructor(message: string) {
        super(message, "UNKNOWN", new class extends Error {

            /** @private */
            constructor() {
                super(message);
                this.name = "MisuseError";
            }
        }());
    }
}
