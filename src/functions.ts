import {
    libsqlExecute as LIBlibsqlExecute,
    libsqlBatch as LIBlibsqlBatch,
    libsqlServerCompatCheck as LIBlibsqlServerCompatCheck,
    libsqlConfig
} from "libsql-stateless";
import { ResultSet, rawSQLStatement } from "./types.js";
import { libsqlBatchReqStepsBuilder, libsqlStatementBuilder } from "./builders.js";
import { libsqlBatchStreamResParser, libsqlStatementResParser } from "./parsers.js";
import { HttpServerError, ResponseError, mapHranaError } from "./errors.js";

export async function libsqlExecute(conf: libsqlConfig, stmt: rawSQLStatement): Promise<ResultSet> {
    try {
        const res = await LIBlibsqlExecute(conf, libsqlStatementBuilder(stmt));
        if (res.isOk) return libsqlStatementResParser(res.val);
        else {
            if (res.err.kind==="LIBSQL_SERVER_ERROR") throw new HttpServerError(res.err.server_message||"Server encountered error.", res.err.http_status_code);
            else throw new ResponseError(res.err.data.message, res.err.data);
        }
    } catch (e) {
        throw mapHranaError(e);
    }
}

export async function libsqlBatch(conf: libsqlConfig, steps: Array<rawSQLStatement>): Promise<Array<ResultSet>> {
    try {
        const res = await LIBlibsqlBatch(conf, libsqlBatchReqStepsBuilder(steps));
        if (res.isOk) return libsqlBatchStreamResParser(res.val);
        else {
            if (res.err.kind==="LIBSQL_SERVER_ERROR") throw new HttpServerError(res.err.server_message||"Server encountered error.", res.err.http_status_code);
            else throw new ResponseError(res.err.data.message, res.err.data);
        }
    } catch (e) {
        throw mapHranaError(e);
    }
}

export async function libsqlServerCompatCheck(conf: libsqlConfig) {
    const res = await LIBlibsqlServerCompatCheck(conf);
    return (res.isOk) ? true : false;
}