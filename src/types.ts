import type { libsqlFetchLike } from "libsql-stateless";
import type {
    Client as clientInterface,
    ResultSet as resultSetInterface,
    IntMode as intMode,
    Config as configInterface,
    Row,
    Value as rawValue,
    TransactionMode
} from './official_api_1726012615447.js';

export type rawSQL = string;
export type rawSQLArgs = Array<rawValue> | Record<string, rawValue>;
export type rawSQLStatement = {
    sql: rawSQL,
    args: rawSQLArgs,
    want_rows?: boolean
}

export interface ResultSet extends resultSetInterface {
    /** Rows read during processing query.
     * 
     * Might not be available on older server versions.
     */
    rowsRead: number,

    /** Rows written during processing query.
     * 
     * Might not be available on older server versions.
     */
    rowsWritten: number,

    /** Wall time of work done by server.
     * 
     * Might not be available on older server versions.
     */
    queryDurationMS: number
}

export interface libsqlConfig extends configInterface {
    /** Disables performing some critical checks to make sure the library works well.
     *
     * By default, these checks are enabled. Set to true to disable.
     * 
     * These includes:
     * -    Checking the Database URL is valid (appropriate protocol, etc)
     * -    Checking if global fetch is available and functioning properly.
     * -    Checking if the LibSQL server supports this client.
     * 
     * IF YOU ARE SURE ALL OF THESE ARE CORRECT, PLEASE DISABLE THESE CHECKS BY SETTING TO TRUE.
     * 
     */
    disableCriticalChecks?: boolean;

    fetch?: libsqlFetchLike;
}

export type {
    libsqlFetchLike,
    clientInterface,
    intMode,
    Row,
    rawValue,
    TransactionMode
};