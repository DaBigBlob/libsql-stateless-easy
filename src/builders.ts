import { Base64 } from 'js-base64';
import { TransactionMode, rawSQLStatement, rawValue } from './types.js';
import { libsqlBatchReqStep, libsqlBatchReqStepExecCond, libsqlSQLStatement, libsqlSQLValue } from 'libsql-stateless';
import { InternalError } from './errors.js';

//========================================================
export function libsqlValueBuilder(value: rawValue): libsqlSQLValue {
    if (value===null) return {type: "null"};

    if (typeof(value)==="bigint") return {type: "integer", value: ""+value};
    if (typeof(value)==="number") return {type: "float", value: value};
    if (typeof(value)==="string") return {type: "text", value: value};
    if (value instanceof Uint8Array) return {type: "blob", base64: Base64.fromUint8Array(value)};
    throw new InternalError("Invalid type of input. Cannot build request to server.");
}

//========================================================
export function libsqlStatementBuilder(s: rawSQLStatement): libsqlSQLStatement {
    if (typeof(s)!=="string")
    if (Object.prototype.toString.call(s.args) === '[object Array]') {
        return {
            sql: s.sql,
            args: (s.args as Array<rawValue>).map(r => libsqlValueBuilder(r)),
            want_rows: s.want_rows
        };
    } else {
        let p_named_args: Array<{
            name: string,
            value: libsqlSQLValue,
        }>=[];
        const _args = s.args as Record<string, rawValue>;

        for (const key in _args) p_named_args.push({name: key, value: libsqlValueBuilder(_args[key])});

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
export const libsqlBatchReqStepExecCondBuilder = {
    ok: (step: number): libsqlBatchReqStepExecCond => {
        return {
            type: "ok",
            step //uint32: 0-based index in the steps array
        }
    },
    error: (step: number): libsqlBatchReqStepExecCond => {
        return {
            type: "error",
            step //uint32: 0-based index in the steps array
        }
    },
    not: (cond: libsqlBatchReqStepExecCond): libsqlBatchReqStepExecCond => {
        return {
            type: "not",
            cond,
        }
    },
    and: (conds: Array<libsqlBatchReqStepExecCond>): libsqlBatchReqStepExecCond => {
        return {
            type: "and",
            conds
        }
    },
    or: (conds: Array<libsqlBatchReqStepExecCond>): libsqlBatchReqStepExecCond => {
        return {
            type: "or",
            conds
        }
    },
    is_autocommit: (): libsqlBatchReqStepExecCond => {
        return {
            type: "is_autocommit"
        }
    }
}

//===========================================================
export function libsqlBatchReqStepsBuilder(
    batch_queries: Array<rawSQLStatement>,
    batch_conditions: Array<libsqlBatchReqStepExecCond|undefined|null>
): Array<libsqlBatchReqStep> {
    return batch_queries.map((q, i) => {return {
        stmt: libsqlStatementBuilder(q),
        condition: batch_conditions[i]||undefined
    }});
}

//========================================================
export function libsqlTransactionBeginStatement(mode: TransactionMode): libsqlBatchReqStep {
    if (mode === "write") {
        return {stmt: {sql: "BEGIN IMMEDIATE"}};
    } else if (mode === "read") {
        return {stmt: {sql: "BEGIN TRANSACTION READONLY"}};
    } else if (mode === "deferred") {
        return {stmt: {sql: "BEGIN DEFERRED"}};
    } else {
        throw RangeError('Unknown transaction mode, supported values are "write", "read" and "deferred"');
    }
}

//========================================================
export function libsqlTransactionEndStatements(last_step_before_this: number): Array<libsqlBatchReqStep> {
    return [
        {stmt: {sql: "COMMIT"}},
        {stmt: {sql: "ROLLBACK"}, condition: {type: "not", cond: {type: "ok", step: last_step_before_this+1}}}
    ]
}

//===========================================================
export function libsqlTransactionBatchReqStepsBuilder(
    queries: Array<rawSQLStatement>,
    mode: TransactionMode
): Array<libsqlBatchReqStep> {
    const main_steps: Array<libsqlBatchReqStep> = queries.map((q, i) => {return {
        stmt: libsqlStatementBuilder(q),
        condition: libsqlBatchReqStepExecCondBuilder.and([
            libsqlBatchReqStepExecCondBuilder.ok(i),
            libsqlBatchReqStepExecCondBuilder.not(libsqlBatchReqStepExecCondBuilder.is_autocommit())
        ])
    }});
    main_steps[0].condition = undefined; //elm 1's ok index is set to 0 (transaction begin); removing that
    return [libsqlTransactionBeginStatement(mode)].concat(main_steps).concat(libsqlTransactionEndStatements(main_steps.length));
}