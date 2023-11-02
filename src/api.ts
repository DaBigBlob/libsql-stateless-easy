/** Configuration object for {@link createClient}. */
export interface Config {
    /** The database URL.
     *
     * The client supports `http:`/`https:` URL.
     * 
     */
    url: string;

    /** Authentication token for the database. */
    authToken?: string;

    /** How to convert SQLite integers to JavaScript values:
     *
     * - `"number"` (default): returns SQLite integers as JavaScript `number`-s (double precision floats).
     * `number` cannot precisely represent integers larger than 2^53-1 in absolute value, so attempting to read
     * larger integers will throw a `RangeError`.
     * - `"bigint"`: returns SQLite integers as JavaScript `bigint`-s (arbitrary precision integers). Bigints can
     * precisely represent all SQLite integers.
     * - `"string"`: returns SQLite integers as strings.
     */
    intMode?: IntMode;
}

/** Representation of integers from database as JavaScript values. See {@link Config.intMode}. */
export type IntMode = "number" | "bigint" | "string";

/** Error of unsuccfully executing an SQL statement. */
export interface ResultErr {
    //TODO
}

/** Result of executing an SQL statement.
 *
 * ```javascript
 * const rs = await execute(config, "SELECT name, title FROM books");
 * console.log(`Found ${rs.rows.length} books`);
 * for (const row in rs.rows) {
 *     console.log(`Book ${row[0]} by ${row[1]}`);
 * }
 *
 * const rs = await execute(config, "DELETE FROM books WHERE author = 'Jane Austen'");
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
}

/** Row returned from an SQL statement.
 *
 * The row object can be used as an `Array` or as an object:
 *
 * ```javascript
 * const rs = await execute(config, "SELECT name, title FROM books");
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
    [index: number]: Value;

    /** Columns can be accessed like an object by column names. */
    [name: string]: Value;
}

export type Value =
    | null
    | string
    | number
    | bigint
    | ArrayBuffer

export type InValue =
    | Value
    | boolean
    | Uint8Array
    | Date

export type InStatement = { sql: string, args: InArgs } | string;
export type InArgs = Array<InValue> | Record<string, InValue>;