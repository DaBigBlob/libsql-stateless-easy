import {
    libsqlExecute as LIBlibsqlExecute,
    libsqlBatch as LIBlibsqlBatch,
    libsqlServerCompatCheck as LIBlibsqlServerCompatCheck,
    type libsqlConfig as LIBlibsqlConfig,
    type libsqlBatchReqStepExecCond,
    type libsqlBatchReqStep,
    type libsqlError as LIBlibsqlError
} from "libsql-stateless";
import type { ResultSet, TransactionMode, rawSQLStatement, libsqlConfig, rawSQLArgs, rawSQL } from "./types.js";
import { libsqlBatchReqStepExecCondBuilder, libsqlBatchReqStepsBuilder, libsqlStatementBuilder, libsqlTransactionBatchReqStepsBuilder } from "./builders.js";
import { libsqlBatchStreamResParser, libsqlStatementResParser, libsqlTransactionBatchStreamResParser } from "./parsers.js";
import { HttpServerError, ResponseError } from "./errors.js";

function confTranslate(conf: libsqlConfig): LIBlibsqlConfig {
    return {
        db_url: conf.url,
        authToken: conf.authToken,
        fetch: conf.fetch
    }
}

function errorTranslate(err: LIBlibsqlError) {
    if (err.kind==="LIBSQL_SERVER_ERROR")
        return new HttpServerError(
            err.server_message ?? "No error message from server.",
            err.http_status_code
        );
    else
        return new ResponseError(
            err.data.message,
            err.data
        );
}

export async function libsqlExecute(conf: libsqlConfig, stmt_or_sql: rawSQL|rawSQLStatement, or_args?: rawSQLArgs, or_want_rows?: boolean): Promise<ResultSet> {
    const res = await LIBlibsqlExecute(confTranslate(conf), libsqlStatementBuilder(stmt_or_sql, or_args, or_want_rows));

    if (res.isOk) return libsqlStatementResParser(res.val, conf.intMode);
    else throw errorTranslate(res.err);
}

export async function libsqlBatch(
    conf: libsqlConfig,
    steps: Array<rawSQL|rawSQLStatement>,
    step_conditions: Array<libsqlBatchReqStepExecCond|null|undefined>
): Promise<Array<ResultSet|null>> {
    const res = await LIBlibsqlBatch(confTranslate(conf), libsqlBatchReqStepsBuilder(steps, step_conditions));

    if (res.isOk) return libsqlBatchStreamResParser(res.val, conf.intMode);
    else throw errorTranslate(res.err);
}

export async function libsqlServerCompatCheck(conf: libsqlConfig) {
    return (await LIBlibsqlServerCompatCheck(
        confTranslate(conf)
    )).isOk;
}

export async function libsqlBatchTransaction(
    conf: libsqlConfig,
    steps: Array<rawSQL|rawSQLStatement>,
    mode: TransactionMode="deferred"
): Promise<Array<ResultSet>> {
    const res = await LIBlibsqlBatch(confTranslate(conf), libsqlTransactionBatchReqStepsBuilder(steps, mode));

    if (res.isOk) return libsqlTransactionBatchStreamResParser(res.val, conf.intMode);
    else throw errorTranslate(res.err);
}

export async function libsqlExecuteMultiple(conf: libsqlConfig, sql: string): Promise<undefined> {
    const sqlArr: Array<libsqlBatchReqStep> = sql.split(";").filter(s => s.trim()!=="").map((s, i) => {return {
        stmt: {sql: s},
        condition: libsqlBatchReqStepExecCondBuilder.ok(i-1)
    }});
    sqlArr[0].condition = undefined; //elm 0's ok index is set to -1; removing that

    const res = await LIBlibsqlBatch(confTranslate(conf), sqlArr);
    if (!res.isOk) throw errorTranslate(res.err);
}
