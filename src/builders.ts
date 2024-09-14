import { fromUint8Array } from './base64/mod.js';
import type { TransactionMode, rawSQL, rawSQLArgs, rawSQLStatement, rawValue } from './commons.js';
import type { libsqlBatchReqStep, libsqlBatchReqStepExecCond, libsqlSQLStatement, libsqlSQLValue } from 'libsql-stateless';
import { MisuseError } from './errors.js';

//========================================================
export function libsqlValueBuilder(value: rawValue): libsqlSQLValue {
    if (value===null) return {type: "null"};
    if (typeof(value)==="string") return {type: "text", value: value};
    if (typeof(value)==="number") {
        if (!Number.isFinite(value)) throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
        return {type: "float", value: value};
    }
    if (typeof(value)==="bigint") {
        if (value < -9223372036854775808n || value > 9223372036854775807n)
            throw new RangeError("This bigint value is too large to be represented as a 64-bit integer and passed as argument");
        return {type: "integer", value: ""+value};
    }
    if (typeof value === "boolean") return {type: "integer", value: ""+(value ? 1n : 0n)};
    if (value instanceof ArrayBuffer) return {type: "blob", base64: fromUint8Array(new Uint8Array(value))};
    if (value instanceof Uint8Array) return {type: "blob", base64: fromUint8Array(value)};
    if (value instanceof Date) return {type: "float", value: +value.valueOf()};
    throw new MisuseError("Invalid type of input. Cannot build request to server.");
}

//========================================================
export function libsqlArgumentsBuilder(a?: rawSQLArgs): Omit<libsqlSQLStatement, 'sql'|'want_rows'> {
    if (a === undefined) return {};

    if (Object.prototype.toString.call(a) === '[object Array]') {
        return {
            args: (a as Array<rawValue>).map(r => libsqlValueBuilder(r)),
        };
    } else {
        let p_named_args: Array<{
            name: string,
            value: libsqlSQLValue,
        }>=[];
        const _args = a as Record<string, rawValue>;

        for (const key in _args) p_named_args.push({name: key, value: libsqlValueBuilder(_args[key])});

        return {
            named_args: p_named_args,
        };
    }
}

//========================================================
export function libsqlStatementBuilder(s: rawSQL|rawSQLStatement, or_a?: rawSQLArgs, or_want_rows?: boolean): libsqlSQLStatement {
    if (typeof(s)=="string") { // arguments as tuple
        const _args = libsqlArgumentsBuilder(or_a);
        return {
            sql: s,
            args: _args.args,
            named_args: _args.named_args,
            want_rows: or_want_rows
        };
    } else { // arguments as object
        const s_args = libsqlArgumentsBuilder(s.args);
        return {
            sql: s.sql,
            args: s_args.args,
            named_args: s_args.named_args,
            want_rows: s.want_rows
        }
    }
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
    batch_queries: Array<rawSQL|rawSQLStatement>,
    batch_conditions: Array<libsqlBatchReqStepExecCond|undefined|null>
): Array<libsqlBatchReqStep> {
    return batch_queries.map((q, i) => {return {
        stmt: libsqlStatementBuilder(q),
        condition: batch_conditions[i]??undefined
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
export function libsqlTransactionEndStatements(step_before_this: number): Array<libsqlBatchReqStep> {
    return [
        {stmt: {sql: "COMMIT"}, condition: {type: "ok", step: step_before_this}},
        {stmt: {sql: "ROLLBACK"}, condition: {type: "not", cond: {type: "ok", step: step_before_this+1}}}
    ]
}

//===========================================================
export function libsqlTransactionBatchReqStepsBuilder(
    queries: Array<rawSQL|rawSQLStatement>,
    mode: TransactionMode,
    offset: number = 0
): Array<libsqlBatchReqStep> {
    const main_steps: Array<libsqlBatchReqStep> = queries.map((q, i) => {return {
        stmt: libsqlStatementBuilder(q),
        condition: libsqlBatchReqStepExecCondBuilder.and([
            libsqlBatchReqStepExecCondBuilder.ok(i+offset), // step before this
            libsqlBatchReqStepExecCondBuilder.not(libsqlBatchReqStepExecCondBuilder.is_autocommit())
        ])
    }});
    return [libsqlTransactionBeginStatement(mode)] // is idx: 0 + offset
        .concat(main_steps) // is idx: (1..=len) + offset
        .concat(libsqlTransactionEndStatements(main_steps.length+offset)); // is idx: len+1 + offset
}