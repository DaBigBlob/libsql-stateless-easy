import { libsqlType } from "libsql-stateless/.";

type rawValues = null|bigint|number|string|Uint8Array;


export const libsqlBuilder = { SQLStatement: SQLStatementB };
// function Value(w: e.ObjectWriter, msg: proto.Value): void {
//     if (msg === null) {
//         w.stringRaw("type", "null");
//     } else if (typeof msg === "bigint") {
//         w.stringRaw("type", "integer");
//         w.stringRaw("value", ""+msg);
//     } else if (typeof msg === "number") {
//         w.stringRaw("type", "float");
//         w.number("value", msg);
//     } else if (typeof msg === "string") {
//         w.stringRaw("type", "text");
//         w.string("value", msg);
//     } else if (msg instanceof Uint8Array) {
//         w.stringRaw("type", "blob");
//         w.stringRaw("base64", Base64.fromUint8Array(msg));
//     } else if (msg === undefined) {
//         // do nothing
//     } else {
//         throw impossible(msg, "Impossible type of Value");
//     }
// }
function SQLValueB(value: rawValues): libsqlType.SQLValue {
    if (value===null) return {type: "null"};

    if (typeof(value)==="bigint") return {type: "integer", value: ""+value};
    if (typeof(value)==="number") return {type: "float", value: value};
    if (typeof(value)==="string") return {type: "text", value: value};
    if (value instanceof Uint8Array) {
        const a = new FileReader
    }
    if (typeof(value)==="number") return {type: "float", value: value};
    //last case
}

function SQLStatementB(
    sql: string,
    args: Array<rawValues> | Record<string, rawValues> | null = null,
    want_rows: boolean = true
): libsqlType.SQLStatement {
    let _args: Array<libsqlType.SQLValue>|undefined;
    let _named_args: Array<{
        name: string,
        value: libsqlType.SQLValue,
    }>|undefined;

    if (args)
    if (Object.prototype.toString.call(args) === '[object Array]') {
        const __args = args as Array<rawValues>;
        for (let i=0;i<__args.length;i++) {
            //if (typeof(__args[i]) === "null")
        }
    } else {

    }

    return {
        sql,
        args: _args,
        named_args: _named_args,
        want_rows
    };
}

export const libsqlProcessor = {  };