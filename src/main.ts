import { Config, InStatement, ResultErr, ResultSet } from "./api";
import { Ok, Result } from "./return-types";

/** Execute a single SQL statement.
*
* Every statement executed with this method is executed in its own logical database connection.
*
* ```javascript
* // execute a statement without arguments
* const rs = await execute(config, "SELECT * FROM books");
*
* // execute a statement with positional arguments
* const rs = await execute(config, {
*     sql: "SELECT * FROM books WHERE author = ?",
*     args: ["Jane Austen"],
* });
*
* // execute a statement with named arguments
* const rs = await execute(config, {
*     sql: "SELECT * FROM books WHERE published_at > $year",
*     args: {year: 1719},
* });
* ```
*/
export async function execute(config: Config, stmt: InStatement): Promise<Result<ResultSet, ResultErr>> {
    if (stmt||config) {}; //place holder
    return Ok({} as ResultSet); //place holder
}

/** Execute a batch of SQL statements in a transaction.
 *
 * The batch is executed in its own logical database connection but the statements are not wrapped in a
 * transaction. This means the batch is not applied atomically.
 * 
 * If any of the statements in the batch fails with an error, the batch is not aborted and the successful
 * results are returned returned with #TODO
 *
 * ```javascript
 * const rss = await batchExecute(config, [
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
 * ]);
 * ```
 */
export async function batchExecute(config: Config, stmts: Array<InStatement>): Promise<Array<Result<ResultSet, ResultErr>>> {
    if (stmts||config) {}; //place holder
    return {} as Array<Result<ResultSet, ResultErr>>; //place holder
}

/** Check if the server is compatible with sqld http API v0 */
export async function checkServerCompat(
    /** The database URL.
     *
     * The client supports `http:`/`https:` URL.
     * 
     */
    url: string
): Promise<Result<undefined, undefined>> {
    const res = await fetch();
}