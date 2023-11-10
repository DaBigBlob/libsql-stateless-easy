import { libsqlPipelineResErr, libsqlResult, libsqlSQLValue, libsqlStatementResOkData, libsqlStreamResErrData } from "libsql-stateless";
import { ResultSet, Row, rawValue } from "./types";
import { Base64 } from "js-base64";
import { SQLValueBuilder } from "./builders";



//========================================================
export function SQLValueParser(value: libsqlSQLValue): rawValue {
    if (value.type==="null") return null;
    if (value.type==="integer") return BigInt(value.value);
    if (value.type==="float") return Number(value.value);
    if (value.type==="text") return Base64.toUint8Array(value.value);
    throw new Error("Invalid Type from Server.");
}

//========================================================
//from hrana-client-ts/src/result.ts
function rowFromProto(
    colNames: Array<string | undefined>,
    values: Array<rawValue>
): Row {
    const row = {};
    // make sure that the "length" property is not enumerable
    Object.defineProperty(row, "length", { value: values.length });
    for (let i = 0; i < values.length; ++i) {
        const value = SQLValueBuilder(values[i]);
        Object.defineProperty(row, i, { value });

        const colName = colNames[i];
        if (colName !== undefined && !Object.hasOwn(row, colName)) {
            Object.defineProperty(row, colName, { value, enumerable: true });
        }
    }
    return row as Row;
}

//========================================================
export function libsqlExecuteResParser(
    res: libsqlResult<libsqlStatementResOkData, libsqlStreamResErrData|libsqlPipelineResErr>
): ResultSet {
    if (res.isOk) {

        return {
            rows: [],
            columns: [],
            rowsAffected: 0,
            lastInsertRowid: BigInt(1)
        }
    } else throw Error("Data not Ok: "+res.err);
}