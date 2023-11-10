export type rawValue = null|bigint|number|string|Uint8Array;

//from ***
/** Row returned from the database. This is an Array-like object (it has `length` and can be indexed with a
 * number), and in addition, it has enumerable properties from the named columns. */
export interface Row {
    length: number;
    [index: number]: rawValue;
    [name: string]: rawValue;
}

export type ResultSet = {
    rows: Array<Row>,
    columns: Array<string>,
    rowsAffected: number,
    lastInsertRowid: bigint | undefined
}