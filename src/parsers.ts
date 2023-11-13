import { libsqlBatchStreamResOkData, libsqlSQLValue, libsqlStatementResOkData } from "libsql-stateless";
import { ResultSet, Row, rawValue } from "./types";
import { Base64 } from "js-base64";
import { ProtoError, ResponseError } from "./errors";


//========================================================
export function libsqlValueParser(value: libsqlSQLValue): rawValue {
    if (value.type==="null") return null;
    if (value.type==="integer") return BigInt(value.value);
    if (value.type==="float") return Number(value.value);
    if (value.type==="text") return value.value;
    if (value.type==="blob") return Base64.toUint8Array(value.base64);
    throw new ProtoError("Invalid data type from server. Cannot parse.");
}

//========================================================
//from hrana-client-ts/src/result.ts
// function rowFromRawValue(
//     colNames: Array<string | undefined>,
//     values: Array<rawValue>
// ): Row {
//     const row = {};
//     // make sure that the "length" property is not enumerable
//     Object.defineProperty(row, "length", { value: values.length });
//     for (let i = 0; i < values.length; ++i) {
//         const value = values[i];
//         Object.defineProperty(row, i, { value });

//         const colName = colNames[i];
//         if (colName !== undefined && !Object.hasOwn(row, colName)) {
//             Object.defineProperty(row, colName, { value, enumerable: true });
//         }
//     }
//     return row as Row;
// }

//========================================================
export function libsqlStatementResParser(
    res: libsqlStatementResOkData
): ResultSet {
    let Rows: Array<Row> = [];

    for (let i=0;i<res.rows.length;i++) {
        const row = {};

        Object.defineProperty(row, "length", { value: res.rows[i].length });
        for (let j=0;j<res.rows[i].length;j++) {
            const value = libsqlValueParser(res.rows[i][j]);
            Object.defineProperty(row, j, { value });

            const colName = res.cols[j].name!;
            if (colName !== undefined && !Object.hasOwn(row, colName)) {
                Object.defineProperty(row, colName, { value, enumerable: true });
            }
        }
        Rows.push(row as Row);
    }

    return {
        rows: Rows,
        columns: res.cols.map(c => c.name!),
        rowsAffected: res.affected_row_count,
        lastInsertRowid: (res.last_insert_rowid) ? BigInt(res.last_insert_rowid) : undefined
    }
}

//========================================================
export function libsqlBatchStreamResParser(
    res: libsqlBatchStreamResOkData
): Array<ResultSet> {
    let batchResults: Array<ResultSet> = [];
    for (let j=0;j<res.step_results.length;j++) {
        if (res.step_results[j]) batchResults.push(libsqlStatementResParser(res.step_results[j]!));
        else throw new ResponseError("An SQL statements in batch.", res.step_errors[j]!);
    }
    return batchResults;
}