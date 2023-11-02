export class createClient {
    constructor(s: {
        /** The database URL.
         *
         * The client supports `libsql:`, `http:`/`https:`, `ws:`/`wss:` and `file:` URL. For more infomation,
         * please refer to the project README:
         *
         * https://github.com/libsql/libsql-client-ts#supported-urls
         */
        url: string,
    
        /** Authentication token for the database. */
        authToken?: string,
    
        /** How to convert SQLite integers to JavaScript values:
         *
         * - `"number"` (default): returns SQLite integers as JavaScript `number`-s (double precision floats).
         * `number` cannot precisely represent integers larger than 2^53-1 in absolute value, so attempting to read
         * larger integers will throw a `RangeError`.
         * - `"bigint"`: returns SQLite integers as JavaScript `bigint`-s (arbitrary precision integers). Bigints can
         * precisely represent all SQLite integers.
         * - `"string"`: returns SQLite integers as strings.
         */
        intMode?: "number" | "bigint" | "string"
    }) {
        
    }
}