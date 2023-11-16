import {
    libsqlExecute as LIBlibsqlExecute,
    libsqlBatch as LIBlibsqlBatch,
    libsqlServerCompatCheck as LIBlibsqlServerCompatCheck,
    libsqlConfig,
    libsqlBatchReqStepExecCond
} from "libsql-stateless";
import { ResultSet, rawSQLStatement } from "./types.js";
import { libsqlBatchReqStepsBuilder, libsqlStatementBuilder } from "./builders.js";
import { libsqlBatchStreamResParser, libsqlStatementResParser } from "./parsers.js";
import { HttpServerError, LibsqlError, ResponseError } from "./errors.js";

function CheckHttpUrl(url: string) {
    const _url: URL = (() => {
        try {
            return new URL(url);
        } catch (e) {
            throw new LibsqlError((e as Error).message, "ERR_INVALID_URL", (e as Error));
        }
    })();
    
    if (
        _url.protocol !== 'https:' &&
        _url.protocol !== 'http:'
    ) throw new LibsqlError(
        'This is a HTTP client and only supports "https:" and "http:" URLs, ' +
            `got ${JSON.stringify(_url.protocol + ":")}`,
        "URL_SCHEME_NOT_SUPPORTED",
    );
}

export async function libsqlExecute(conf: libsqlConfig, stmt: rawSQLStatement): Promise<ResultSet> {
    CheckHttpUrl(conf.db_url);
    const res = await LIBlibsqlExecute(conf, libsqlStatementBuilder(stmt));
    if (res.isOk) return libsqlStatementResParser(res.val);
    else {
        if (res.err.kind==="LIBSQL_SERVER_ERROR") throw new HttpServerError(res.err.server_message||"Server encountered error.", res.err.http_status_code);
        else throw new ResponseError(res.err.data.message, res.err.data);
    }
}

export async function libsqlBatch(conf: libsqlConfig, steps: Array<rawSQLStatement>, step_conditions?: Array<libsqlBatchReqStepExecCond|null|undefined>): Promise<Array<ResultSet>> {
    CheckHttpUrl(conf.db_url);
    const res = await LIBlibsqlBatch(conf, libsqlBatchReqStepsBuilder(steps, step_conditions));
    if (res.isOk) return libsqlBatchStreamResParser(res.val);
    else {
        if (res.err.kind==="LIBSQL_SERVER_ERROR") throw new HttpServerError(res.err.server_message||"Server encountered error.", res.err.http_status_code);
        else throw new ResponseError(res.err.data.message, res.err.data);
    }
}

export async function libsqlServerCompatCheck(conf: libsqlConfig) {
    CheckHttpUrl(conf.db_url);
    const res = await LIBlibsqlServerCompatCheck(conf);
    return (res.isOk) ? true : false;
}