export type rawValues = null|bigint|number|string|Uint8Array;

export type Row = Array<rawValues>;

export type ResultSet = {
    rows: Array<Row>,
    columns: Array<string>,
    rowsAffected: number,
    lastInsertRowid: bigint | undefined
}