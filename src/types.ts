export type rawValue = null|bigint|number|string|Uint8Array;

export type rawSQLStatement = string|{
    sql: string,
    args: Array<rawValue> | Record<string, rawValue>,
    want_rows?: boolean
}

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

/** Transaction mode.
 *
 * The client supports multiple modes for transactions:
 *
 * - `"write"` is a read-write transaction, started with `BEGIN IMMEDIATE`. This transaction mode supports
 * both read statements (`SELECT`) and write statements (`INSERT`, `UPDATE`, `CREATE TABLE`, etc). The libSQL
 * server cannot process multiple write transactions concurrently, so if there is another write transaction
 * already started, our transaction will wait in a queue before it can begin.
 *
 * - `"read"` is a read-only transaction, started with `BEGIN TRANSACTION READONLY` (a libSQL extension). This
 * transaction mode supports only reads (`SELECT`) and will not accept write statements. The libSQL server can
 * handle multiple read transactions at the same time, so we don't need to wait for other transactions to
 * complete. A read-only transaction can also be executed on a local replica, so it provides lower latency.
 *
 * - `"deferred"` is a transaction started with `BEGIN DEFERRED`, which starts as a read transaction, but the
 * first write statement will try to upgrade it to a write transaction. However, this upgrade may fail if
 * there already is a write transaction executing on the server, so you should be ready to handle these
 * failures.
 *
 * If your transaction includes only read statements, `"read"` is always preferred over `"deferred"` or
 * `"write"`, because `"read"` transactions can be executed more efficiently and don't block other
 * transactions.
 *
 * If your transaction includes both read and write statements, you should be using the `"write"` mode most of
 * the time. Use the `"deferred"` mode only if you prefer to fail the write transaction instead of waiting for
 * the previous write transactions to complete.
 */
export type TransactionMode = "write" | "read" | "deferred";