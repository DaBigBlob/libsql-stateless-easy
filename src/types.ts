import type { libsqlConfig as LIBlibsqlConfig } from "libsql-stateless";

export type rawValue = null|bigint|number|string|ArrayBuffer;
export type intMode = "bigint" | "number" | "string";
export type rawSQLStatement = string|{
    sql: string,
    args: Array<rawValue> | Record<string, rawValue>,
    want_rows?: boolean
}

export interface libsqlConfig extends LIBlibsqlConfig {
    /** How to convert SQLite integers to JavaScript values:
     *
     * - `"number"` (default): returns SQLite integers as JavaScript `number`-s (double precision floats).
     * `number` cannot precisely represent integers larger than 2^53-1 in absolute value, so attempting to read
     * larger integers will throw a `RangeError`.
     * - `"bigint"`: returns SQLite integers as JavaScript `bigint`-s (arbitrary precision integers). Bigints can
     * precisely represent all SQLite integers.
     * - `"string"`: returns SQLite integers as strings.
     */
    intMode?: intMode;

    /** Custom `fetch` function to use for the HTTP client.
     *
     * By default, the HTTP client uses `fetch` from the `@libsql/isomorphic-fetch` package, but you can pass
     * your own function here. The argument to this function will be `Request` from
     * `@libsql/isomorphic-fetch`, and it must return a promise that resolves to an object that is compatible
     * with the Web `Response`.
     */
    fetch?: Function;
}

/** Row returned from an SQL statement.
 *
 * The row object can be used as an `Array` or as an object:
 *
 * ```javascript
 * const rs = await client.execute("SELECT name, title FROM books");
 * for (const row in rs.rows) {
 *     // Get the value from column `name`
 *     console.log(row.name);
 *     // Get the value from second column (`title`)
 *     console.log(row[1]);
 * }
 * ```
 */
export interface Row {
    /** Number of columns in this row.
     *
     * All rows in one {@link ResultSet} have the same number and names of columns.
     */
    length: number;

    /** Columns can be accessed like an array by numeric indexes. */
    [index: number]: rawValue;

    /** Columns can be accessed like an object by column names. */
    [name: string]: rawValue;
}

/** Result of executing an SQL statement.
 *
 * ```javascript
 * const rs = await client.execute("SELECT name, title FROM books");
 * console.log(`Found ${rs.rows.length} books`);
 * for (const row in rs.rows) {
 *     console.log(`Book ${row[0]} by ${row[1]}`);
 * }
 *
 * const rs = await client.execute("DELETE FROM books WHERE author = 'Jane Austen'");
 * console.log(`Deleted ${rs.rowsAffected} books`);
 * ```
 */
export interface ResultSet {
    /** Names of columns.
     *
     * Names of columns can be defined using the `AS` keyword in SQL:
     *
     * ```sql
     * SELECT author AS author, COUNT(*) AS count FROM books GROUP BY author
     * ```
     */
    columns: Array<string>;

    /** Types of columns.
     *
     * The types are currently shown for types declared in a SQL table. For
     * column types of function calls, for example, an empty string is
     * returned.
     */
    columnTypes: Array<string>;
    
    /** Rows produced by the statement. */
    rows: Array<Row>;

    /** Number of rows that were affected by an UPDATE, INSERT or DELETE operation.
     *
     * This value is not specified for other SQL statements.
     */
    rowsAffected: number;

    /** ROWID of the last inserted row.
     *
     * This value is not specified if the SQL statement was not an INSERT or if the table was not a ROWID
     * table.
     */
    lastInsertRowid: bigint | undefined;

    /** Converts the result set to JSON.
     *
     * This is used automatically by `JSON.stringify()`, but you can also call it explicitly.
     */
    toJSON(): any;

    /** Rows read during processing query.
     * Might not be available on older server versions.
     */
    rowsRead: number,

    /** Rows written during processing query.
     * Might not be available on older server versions.
     */
    rowsWritten: number,

    /** Wall time of work done by server.
     * Might not be available on older server versions.
     */
    queryDurationMS: number
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
