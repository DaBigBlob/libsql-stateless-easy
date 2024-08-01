import { LibsqlError } from "../errors.js";

/** Error thrown when the Base64 sub-library throws error. */
export class Base64Error extends LibsqlError {
    constructor(message: string, code: string) {
        super(message, code, new class extends Error {
            
            /** @private */
            constructor() {
                super(message);
                this.name = "Base64Error";
            }
        }());
    }
}