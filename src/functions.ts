import {
    libsqlExecute as LIBlibsqlExecute,
    libsqlBatch as LIBlibsqlBatch,
    libsqlServerCompatCheck as LIBlibsqlServerCompatCheck,
    libsqlConfig,
    libsqlBatchReqStep
} from "libsql-stateless";
import { ResultSet, rawSQLStatement } from "./types";
import { libsqlStatementBuilder } from "./builders";
import { libsqlBatchStreamResParser, libsqlStatementResParser } from "./parsers";
import { HttpServerError, ResponseError, mapHranaError } from "./errors";

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
        let _steps: Array<libsqlBatchReqStep> = [];
        for (let i=0;i<steps.length;i++) _steps.push({stmt: libsqlStatementBuilder(steps[i])});

        const res = await LIBlibsqlBatch(conf, _steps);
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