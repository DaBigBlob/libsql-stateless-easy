import {
    libsqlExecute as LIBlibsqlExecute,
    libsqlBatch as LIBlibsqlBatch,
    libsqlServerCompatCheck as LIBlibsqlServerCompatCheck,
    libsqlConfig,
    libsqlBatchReqStep
} from "libsql-stateless";
import { ResultSet, rawSQLStatement } from "./types";
import { SQLStatementBuilder } from "./builders";
import { libsqlBatchStreamResParser, libsqlStatementResParser } from "./parsers";

export async function libsqlExecute(conf: libsqlConfig, stmt: rawSQLStatement): Promise<ResultSet> {
    const res = await LIBlibsqlExecute(conf, SQLStatementBuilder(stmt));
    if (res.isOk) return libsqlStatementResParser(res.val);
    else throw Error(JSON.stringify(res.err));
}

export async function libsqlBatch(conf: libsqlConfig, steps: Array<rawSQLStatement>): Promise<Array<ResultSet>> {
    let _steps: Array<libsqlBatchReqStep> = [];
    for (let i=0;i<steps.length;i++) _steps.push({stmt: SQLStatementBuilder(steps[i])});

    const res = await LIBlibsqlBatch(conf, _steps);
    if (res.isOk) return libsqlBatchStreamResParser(res.val);
    else throw Error(JSON.stringify(res.err));
}

export async function libsqlServerCompatCheck(conf: libsqlConfig) {
    const res = await LIBlibsqlServerCompatCheck(conf);
    return (res.isOk) ? true : false;
}