import type { TransactionMode, rawSQLStatement, libsqlConfig, rawSQLArgs, rawSQL, ResultSet, clientInterface } from "./commons.js";
import { libsqlBatchWithoutTransaction, libsqlBatch, libsqlExecute, libsqlExecuteMultiple, libsqlMigrate } from "./functions.js";
import { MisuseError } from "./errors.js";
import { checkHttpUrl, conserror, ensure_fetch } from "./globcon/mod.js";
import type { libsqlBatchReqStepExecCond } from "libsql-stateless";

export function createClient(conf: libsqlConfig) {
    return new libsqlClient(conf);
}


export class libsqlClient implements clientInterface {
    private readonly conf: libsqlConfig;
    public closed: boolean;

    /** Which protocol does the client use?
     *
     * - `"http"` if the client connects over HTTP
     * - `"ws"` if the client connects over WebSockets
     * - `"file"` if the client works with a local file
     */
    public protocol: string;

    constructor(conf: libsqlConfig) {
        if (!conf.disableCriticalChecks) {
            checkHttpUrl(conf.url);
            ensure_fetch(conf);
        }
        
        this.conf = conf;
        this.closed = false;
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
     * const rs = await client.execute(
     *     "SELECT * FROM books WHERE author = ?",
     *     ["Jane Austen"],
     * );
     * // for backward compatibality
     * const rs = await client.execute({
     *     sql: "SELECT * FROM books WHERE author = ?",
     *     args: ["Jane Austen"],
     * });
     *
     * // execute a statement with named arguments
     * const rs = await client.execute(
     *     "SELECT * FROM books WHERE published_at > $year",
     *     {year: 1719},
     * );
     * // for backward compatibality
     * const rs = await client.execute({
     *     sql: "SELECT * FROM books WHERE published_at > $year",
     *     args: {year: 1719},
     * });
     * ```
     */
    public async execute(stmt: rawSQL, args?: rawSQLArgs, want_rows?: boolean): Promise<ResultSet>;
    public async execute(stmt: rawSQLStatement): Promise<ResultSet>;
    public async execute(stmt_or_sql: rawSQL|rawSQLStatement, or_args?: rawSQLArgs, or_want_rows?: boolean) {
        return await libsqlExecute(this.conf, stmt_or_sql, or_args, or_want_rows);
    }

    /** Execute a batch of SQL statements in a transaction.
     * 
     * NOTE: For batch SQL statement execution without transaction, use {@link batchWithoutTransaction}.
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
        steps: Array<rawSQL|rawSQLStatement>,
        mode?: TransactionMode
    ) {
        return await libsqlBatch(this.conf, steps, mode);
    }

    /** Execute a batch of SQL statements.
     *
     * The same as {@link batch} but the SQL statements are not executed in a transaction.
     * 
     * The `step_conditions` is an array of step conditions generated using {@link libsqlBatchReqStepExecCondBuilder}.
     */
    public async batchWithoutTransaction(
        steps: Array<rawSQL|rawSQLStatement>,
        step_conditions: Array<libsqlBatchReqStepExecCond|null|undefined>
    ) {
        return await libsqlBatchWithoutTransaction(this.conf, steps, step_conditions);
    }

    public async migrate(stmts: Array<rawSQL|rawSQLStatement>) {
        return await libsqlMigrate(this.conf, stmts);
    }

    // @ts-ignore
    public async transaction(mode?: TransactionMode): Promise<any> {
        throw new MisuseError("'libsql-stateless' is stateless and does not support interactive transactions. Use this.batch() instead.");
    }

    /** Execute a sequence of SQL statements separated by semicolons.
     * 
     * NOTE: libsql-stateless-easy implements this function using `batch` under the hood instead of the `serial` endpoint.
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

    public async sync(): Promise<any> {
        // throw new LibsqlError("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
        // don't throw error for max compatiblity
        conserror("'libsql-stateless' is remote only so nothing to sync.");
    }

    public close() {
        // throw new InternalError("'libsql-stateless' is stateless therefore no connection to close.");
        // don't throw error for max compatiblity
        conserror("'libsql-stateless' is stateless therefore no connection to close.");
    }
}