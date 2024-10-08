
import { LibsqlError } from "./commons.js";
export { LibsqlError };

/** Error thrown when the server violates the protocol. */
export class ProtoError extends LibsqlError {
    constructor(message: string) {
        super(message, "HRANA_PROTO_ERROR");
        this.name = "ProtoError";
    }
}

/** Error thrown when the server returns an error response. */
export class ResponseError extends LibsqlError {
    constructor(message: string, code?: string|null) {
        super(message, code ?? "UNKNOWN");
        this.name = "ResponseError";
        this.stack = undefined;
    }
}

/** Error thrown when the HTTP server returns an error response. */
export class HttpServerError extends LibsqlError {
    http_status_code: number;  
    constructor(status: number, message?: string|null) {
        super(`HTTP code ${status}: ${message ?? "No error message from server."}`, "SERVER_ERROR");
        this.http_status_code = status;
        this.name = "HttpServerError";
    }
}

/** Error thrown when an internal client error happens. */
// export class InternalError extends LibsqlError {
//     constructor(message: string) {
//         super(message, "INTERNAL_ERROR", new class extends Error {
//             /** @private */
//             constructor() {
//                 super(message);
//                 this.name = "InternalError";
//             }
//         }());
//     }
// }

/** Error thrown when the API is misused. */
export class MisuseError extends LibsqlError {
    constructor(message: string) {
        super(message, "UNKNOWN");
        this.name = "MisuseError";
    }
}
