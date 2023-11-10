import { Base64 } from 'js-base64';
import { libsqlType } from 'libsql-stateless';
import { rawValues } from './types';

export const libsqlBuilder = {
    SQLStatement: SQLStatementB,
    SQLValue: SQLValueB,
    BatchReqSteps: BatchReqStepsB
};
//========================================================
function SQLValueB(value: rawValues): libsqlType.SQLValue {
    if (value===null) return {type: "null"};

    if (typeof(value)==="bigint") return {type: "integer", value: ""+value};
    if (typeof(value)==="number") return {type: "float", value: value};
    if (typeof(value)==="string") return {type: "text", value: value};
    if (value instanceof Uint8Array) return {type: "blob", base64: Base64.fromUint8Array(value)};
    throw new Error("Invalid Type.");
}

//========================================================
function SQLStatementB(s: string|{
    sql: string,
    args: Array<rawValues> | Record<string, rawValues>,
    want_rows?: boolean
}): libsqlType.SQLStatement {
    if (typeof(s)!=="string")
    if (Object.prototype.toString.call(s.args) === '[object Array]') {
        let p_args: Array<libsqlType.SQLValue>=[];
        const _args = s.args as Array<rawValues>;

        for (let i=0;i<_args.length;i++) p_args.push(SQLValueB(_args[i]));

        return {
            sql: s.sql,
            args: p_args,
            want_rows: s.want_rows
        };
    } else {
        let p_named_args: Array<{
            name: string,
            value: libsqlType.SQLValue,
        }>=[];
        const _args = s.args as Record<string, rawValues>;

        for (const key in _args) p_named_args.push({name: key, value: SQLValueB(_args[key])});

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
function BatchReqStepsB (batch_queries: Array<{
    sql: string,
    args?: Array<rawValues> | Record<string, rawValues>,
    want_rows?: boolean
}>) {
    return batch_queries;
}