import { libsqlBatchReqStepExecCond, libsqlConfig } from "libsql-stateless";
import { TransactionMode, rawSQLStatement } from "./types.js";
import { libsqlBatch, libsqlBatchTransaction, libsqlExecute, libsqlExecuteMultiple, libsqlServerCompatCheck } from "./functions";
import { InternalError, LibsqlError } from "./errors.js";

class libsqlClient {
    private readonly conf: libsqlConfig;
    public closed: boolean;
    public protocol: string;

    constructor(conf: libsqlConfig) {
        this.conf = conf;
        this.closed = true;
        this.protocol = "http";
    }

    /** Execute a single SQL statement.
     *
     * Every statement executed with this method is executed in its own logical database connection. If you
     * want to execute a group of statements in a transaction, use the {@link batch} method.
     *
     * ```javascript
     * // execute a statement without arguments
     * const rs = await client.execute("SELECT * FROM books");
     *
     * // execute a statement with positional arguments
     * const rs = await client.execute({
     *     sql: "SELECT * FROM books WHERE author = ?",
     *     args: ["Jane Austen"],
     * });
     *
     * // execute a statement with named arguments
     * const rs = await client.execute({
     *     sql: "SELECT * FROM books WHERE published_at > $year",
     *     args: {year: 1719},
     * });
     * ```
     */
    public async execute(stmt: rawSQLStatement) {
        return await libsqlExecute(this.conf, stmt);
    }

    /** Execute a batch of SQL statements in a transaction.
     *
     * The batch is executed in its own logical database connection and the statements are wrapped in a
     * transaction. This ensures that the batch is applied atomically: either all or no changes are applied.
     *
     * The `mode` parameter selects the transaction mode for the batch; please see {@link TransactionMode} for
     * details. The default transaction mode is `"deferred"`.
     * 
     * If any of the statements in the batch fails with an error, the batch is aborted, the transaction is
     * rolled back and the returned promise is rejected.
     *
     * This method provides non-interactive transactions.
     *
     * ```javascript
     * const rss = await client.batch([
     *     // batch statement without arguments
     *     "DELETE FROM books WHERE name LIKE '%Crusoe'",
     *
     *     // batch statement with positional arguments
     *     {
     *         sql: "INSERT INTO books (name, author, published_at) VALUES (?, ?, ?)",
     *         args: ["First Impressions", "Jane Austen", 1813],
     *     },
     *
     *     // batch statement with named arguments
     *     {
     *         sql: "UPDATE books SET name = $new WHERE name = $old",
     *         args: {old: "First Impressions", new: "Pride and Prejudice"},
     *     },
     * ], "write");
     * ```
     */
    public async batch(
        steps: Array<rawSQLStatement>,
        mode?: TransactionMode
    ) {
        return await libsqlBatchTransaction(this.conf, steps, mode);
    }

    public async batchPrimitive(
        steps: Array<rawSQLStatement>,
        step_conditions?: Array<libsqlBatchReqStepExecCond|null|undefined>
    ) {
        return await libsqlBatch(this.conf, steps, step_conditions);
    }

    public async transaction(mode?: TransactionMode) {
        if (mode) {}
        throw new InternalError("'libsql-stateless' is stateless and does not support interactive transactions. Use this.batch() instead.");
    }

    /** Execute a sequence of SQL statements separated by semicolons.
     *
     * The statements are executed sequentially on a new logical database connection. If a statement fails,
     * further statements are not executed and this method throws an error. All results from the statements
     * are ignored.
     *
     * We do not wrap the statements in a transaction, but the SQL can contain explicit transaction-control
     * statements such as `BEGIN` and `COMMIT`.
     *
     * This method is intended to be used with existing SQL scripts, such as migrations or small database
     * dumps. If you want to execute a sequence of statements programmatically, please use {@link batch}
     * instead.
     *
     * ```javascript
     * await client.executeMultiple(`
     *     CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER NOT NULL);
     *     CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
     * `);
     * ```
     */
    public async executeMultiple(sql: string) {
        return await libsqlExecuteMultiple(this.conf, sql);
    }

    public async sync() {
        throw new LibsqlError("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
    }

    /** Which protocol does the client use?
     *
     * - `"http"` if the client connects over HTTP
     * - `"ws"` if the client connects over WebSockets
     * - `"file"` if the client works with a local file
     */
    public close() {
        throw new InternalError("'libsql-stateless' is stateless therefore no connection to close.");
    }

    public async serverOk() {
        return await libsqlServerCompatCheck(this.conf);
    }
}

export function createClient(conf: libsqlConfig) {
    return new libsqlClient(conf);
}