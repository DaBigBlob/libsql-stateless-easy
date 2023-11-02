import { _Query } from "./api";
import { Err, Ok, Result } from "./return-types";

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
export async function execute(
    config: {
        url: string,
        authToken?: string
    },
    statements: Array<_Query>
): Promise<object> {
    const res = await fetch(config.url, {
        method: 'POST',
        headers: (!config.authToken)?undefined:{'Authorization': 'Bearer '+config.authToken},
        body: JSON.stringify({statements})
    });
    return await res.json();
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
    if ((await fetch(url, {method: 'POST'})).status==401) return Ok(undefined);
    else return Err(undefined);
}