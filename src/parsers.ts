import { libsqlPipelineResErr, libsqlResult, libsqlSQLValue, libsqlStatementResOkData, libsqlStreamResErrData } from "libsql-stateless";
import { rawValues } from "./types";
import { Base64 } from "js-base64";

//========================================================
// export function SQLValueBuilder(value: rawValues): libsqlSQLValue {
//     if (value===null) return {type: "null"};

//     if (typeof(value)==="bigint") return {type: "integer", value: ""+value};
//     if (typeof(value)==="number") return {type: "float", value: value};
//     if (typeof(value)==="string") return {type: "text", value: value};
//     if (value instanceof Uint8Array) return {type: "blob", base64: Base64.fromUint8Array(value)};
//     throw new Error("Invalid Type.");
// }

export function libsqlExecuteResParser(
    res: libsqlResult<libsqlStatementResOkData, libsqlStreamResErrData|libsqlPipelineResErr>
) {
    if (res.isOk) {

    } else {

    }
}