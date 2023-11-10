import { Base64 } from 'js-base64';
import { rawSQLStatement, rawValue } from './types';
import { libsqlBatchReqStep, libsqlBatchReqStepExecCond, libsqlSQLStatement, libsqlSQLValue } from 'libsql-stateless';

//========================================================
export function SQLValueBuilder(value: rawValue): libsqlSQLValue {
    if (value===null) return {type: "null"};

    if (typeof(value)==="bigint") return {type: "integer", value: ""+value};
    if (typeof(value)==="number") return {type: "float", value: value};
    if (typeof(value)==="string") return {type: "text", value: value};
    if (value instanceof Uint8Array) return {type: "blob", base64: Base64.fromUint8Array(value)};
    throw new Error("Invalid Type.");
}

//========================================================
export function SQLStatementBuilder(s: rawSQLStatement): libsqlSQLStatement {
    if (typeof(s)!=="string")
    if (Object.prototype.toString.call(s.args) === '[object Array]') {
        let p_args: Array<libsqlSQLValue>=[];
        const _args = s.args as Array<rawValue>;

        for (let i=0;i<_args.length;i++) p_args.push(SQLValueBuilder(_args[i]));

        return {
            sql: s.sql,
            args: p_args,
            want_rows: s.want_rows
        };
    } else {
        let p_named_args: Array<{
            name: string,
            value: libsqlSQLValue,
        }>=[];
        const _args = s.args as Record<string, rawValue>;

        for (const key in _args) p_named_args.push({name: key, value: SQLValueBuilder(_args[key])});

        return {
            sql: s.sql,
            named_args: p_named_args,
            want_rows: s.want_rows
        };
    }

    return {
        sql: s
    };
}

//===========================================================
export function BatchReqStepsBuilder(batch_queries: Array<rawSQLStatement>): Array<libsqlBatchReqStep> {
    let p_stmts: Array<libsqlBatchReqStep> = [];
    for (let i=0;i<batch_queries.length;i++) p_stmts.push({stmt: SQLStatementBuilder(batch_queries[i])});
    return p_stmts;
}

//===========================================================
export function BatchReqStepExecCondBuilder(c: 
    {
        type: "ok";
        step: number; //uint32: 0-based index in the steps array
    } | 
    {
        type: "error";
        step: number; //uint32: 0-based index in the steps array
    } | 
    {
        type: "not";
        cond: libsqlBatchReqStepExecCond;
    } | {
        type: "and";
        conds: Array<libsqlBatchReqStepExecCond>;
    } | {
        type: "or";
        conds: Array<libsqlBatchReqStepExecCond>;
    } | {
        type: "is_autocommit";
    }
): libsqlBatchReqStepExecCond {
    return c;
}