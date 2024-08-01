import type { libsqlBatchStreamResOkData, libsqlSQLValue, libsqlStatementResOkData } from "libsql-stateless";
import type { ResultSet, Row, rawValue, intMode } from "./types.js";
import { toUint8Array } from './base64/mod.js';
import { MisuseError, ProtoError, ResponseError } from "./errors.js";

//========================================================
function parseLibsqlInt(number: string, intMode: intMode = "number") {
    switch (intMode) {
        case ("number"): return (+number);
        case ("string"): return number;
        case ("bigint"): return BigInt(number);
        default: throw new MisuseError(`Invalid value for "intMode".`);
    }
}

//========================================================
export function libsqlValueParser(value: libsqlSQLValue, intMode?: intMode): rawValue {
    switch (value.type) {
        case ("null"): return null;
        case ("integer"): return parseLibsqlInt(value.value, intMode);
        case ("float"): return Number(value.value);
        case ("text"): return value.value;
        case ("blob"): return toUint8Array(value.base64);
        default: throw new ProtoError("Invalid data type from server. Cannot parse.");
    }
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
    res: libsqlStatementResOkData,
    intMode?: intMode
): ResultSet {
    let Rows: Array<Row> = [];

    for (let i=0;i<res.rows.length;i++) {
        const row = {};

        Object.defineProperty(row, "length", { value: res.rows[i].length });
        for (let j=0;j<res.rows[i].length;j++) {
            const value = libsqlValueParser(res.rows[i][j], intMode);
            Object.defineProperty(row, j, { value });

            const colName = res.cols[j].name!;
            if (colName !== undefined && !Object.hasOwn(row, colName)) {
                Object.defineProperty(row, colName, { value, enumerable: true, configurable: true, writable: true });
            }
        }
        Rows.push(row as Row);
    }

    const resultset: Omit<ResultSet, "toJSON"> = {
        rows: Rows,
        columns: res.cols.map(c => c.name??""),
        columnTypes: res.cols.map(c => c.decltype??""),
        rowsAffected: res.affected_row_count,
        lastInsertRowid: (res.last_insert_rowid) ? BigInt(res.last_insert_rowid) : undefined,
        rowsRead: res.rows_read,
        rowsWritten: res.rows_written,
        queryDurationMS: res.query_duration_ms
    }
    return {
        ...resultset,
        toJSON: (): any => {return resultset}
    }
}

//========================================================
export function libsqlBatchStreamResParser(
    res: libsqlBatchStreamResOkData,
    intMode?: intMode
): Array<ResultSet|null> {
    return res.step_results.map((r, i) => {
        if (r) return libsqlStatementResParser(r, intMode);
        else if (res.step_errors[i]) throw new ResponseError(res.step_errors[i]?.message??"No error message supplied by server.", res.step_errors[i]!);
        else return null;
    });
}

//========================================================
export function libsqlTransactionBatchStreamResParser(
    res: libsqlBatchStreamResOkData,
    intMode?: intMode
): Array<ResultSet> {
    const resResArr = libsqlBatchStreamResParser(res, intMode);
    return resResArr.slice(1, resResArr.length-2).filter(r => r!==null) as Array<ResultSet>;
}
