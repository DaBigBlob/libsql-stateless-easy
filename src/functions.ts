import {
    libsqlExecute as LIBlibsqlExecute,
    libsqlBatch as LIBlibsqlBatch,
    libsqlServerCompatCheck as LIBlibsqlServerCompatCheck,
    libsqlBatchReqStepExecCond,
    libsqlBatchReqStep
} from "libsql-stateless";
import { ResultSet, TransactionMode, rawSQLStatement, libsqlConfig } from "./types.js";
import { libsqlBatchReqStepExecCondBuilder, libsqlBatchReqStepsBuilder, libsqlStatementBuilder, libsqlTransactionBatchReqStepsBuilder } from "./builders.js";
import { libsqlBatchStreamResParser, libsqlStatementResParser, libsqlTransactionBatchStreamResParser } from "./parsers.js";
import { HttpServerError, LibsqlError, ResponseError } from "./errors.js";

export function CheckHttpUrl(url: string) {
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
            `got ${JSON.stringify(_url.protocol)}`,
        "URL_SCHEME_NOT_SUPPORTED",
    );
}

export async function libsqlExecute(conf: libsqlConfig, stmt: rawSQLStatement): Promise<ResultSet> {
    const res = await LIBlibsqlExecute(conf, libsqlStatementBuilder(stmt));

    if (res.isOk) return libsqlStatementResParser(res.val, conf.intMode);
    else {
        if (res.err.kind==="LIBSQL_SERVER_ERROR") throw new HttpServerError(res.err.server_message||"Server encountered error.", res.err.http_status_code);
        else throw new ResponseError(res.err.data.message, res.err.data);
    }
}

export async function libsqlBatch(
    conf: libsqlConfig,
    steps: Array<rawSQLStatement>,
    step_conditions: Array<libsqlBatchReqStepExecCond|null|undefined>
): Promise<Array<ResultSet|null>> {
    const res = await LIBlibsqlBatch(conf, libsqlBatchReqStepsBuilder(steps, step_conditions));

    if (res.isOk) return libsqlBatchStreamResParser(res.val, conf.intMode);
    else {
        if (res.err.kind==="LIBSQL_SERVER_ERROR") throw new HttpServerError(res.err.server_message||"Server encountered error.", res.err.http_status_code);
        else throw new ResponseError(res.err.data.message, res.err.data);
    }
}

export async function libsqlServerCompatCheck(conf: libsqlConfig) {
    const res = await LIBlibsqlServerCompatCheck(conf);
    return (res.isOk) ? true : false;
}

export async function libsqlBatchTransaction(
    conf: libsqlConfig,
    steps: Array<rawSQLStatement>,
    mode: TransactionMode="deferred"
): Promise<Array<ResultSet>> {
    const res = await LIBlibsqlBatch(conf, libsqlTransactionBatchReqStepsBuilder(steps, mode));

    if (res.isOk) return libsqlTransactionBatchStreamResParser(res.val, conf.intMode);
    else {
        if (res.err.kind==="LIBSQL_SERVER_ERROR") throw new HttpServerError(res.err.server_message||"Server encountered error.", res.err.http_status_code);
        else throw new ResponseError(res.err.data.message, res.err.data);
    }
}

export async function libsqlExecuteMultiple(conf: libsqlConfig, sql: string): Promise<void> {
    const sqlArr: Array<libsqlBatchReqStep> = sql.split(";").filter(s => s.trim()!=="").map((s, i) => {return {
        stmt: {sql: s},
        condition: libsqlBatchReqStepExecCondBuilder.ok(i-1)
    }});
    sqlArr[0].condition = undefined; //elm 0's ok index is set to -1; removing that

    const res = await LIBlibsqlBatch(conf, sqlArr);
    if (!res.isOk) {
        if (res.err.kind==="LIBSQL_SERVER_ERROR") throw new HttpServerError(res.err.server_message||"Server encountered error.", res.err.http_status_code);
        else throw new ResponseError(res.err.data.message, res.err.data);
    }
}
