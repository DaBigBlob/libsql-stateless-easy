//### return types ###

type Ok<T> = { isOk: true, val: T};
type Err<E> = { isOk: false, err: E};

function Ok<T>(val: T): Ok<T> {
    return { isOk: true, val};
}
function Err<E>(err: E): Err<E> {
    return { isOk: false, err};
}


//### db types ###

export type sqlite_value = sqlite_text|sqlite_integer|sqlite_integer|sqlite_real|sqlite_blob|sqlite_null;
export type sqlite_text = string; //a UTF-8 encoded string
export type sqlite_integer = number; //a 64-bit signed integer
export type sqlite_real = number; //a 64-bits floating number
export type sqlite_blob = string; //some binary data, encoded in base64
export type sqlite_null = null; //the null value

export type sqlite_query = string | { q: string, params: Record<string, sqlite_value> | Array<sqlite_value> };

type _QueryResponse = {
    results: {
        columns: Array<string>,
        rows: Array<Array<sqlite_value>>,
    }
}

type _ErrorResponse = {
    error: string
}



//### function ###

/** Check if the server is compatible with sqld http API v0
 * 
 * This only works properly if the database requires authToken.
 * 
*/
export async function checkServerCompat(
    /** The database URL.
     *
     * The client supports `http:`/`https:` URL.
     * 
     */
    url: string
): Promise<Ok<undefined>|Err<undefined>> {
    if ((await fetch(url, {method: 'POST'})).status==401) return Ok(undefined);
    else return Err(undefined);
}

/** Execute a batch of SQL statements atomically. */
export async function executeBatch(
    config: {
        /** The database URL.
         *
         * The client supports `http:`/`https:` URL.
         * 
         */
        url: string,

        /** Authentication token for the database. */
        authToken?: string
    },
    statements: Array<sqlite_query>
): Promise<Ok<Array<_QueryResponse>>|Err<Array<_QueryResponse|_ErrorResponse|null>>> {
    const res = await (await fetch(config.url, {
        method: 'POST',
        headers: (!config.authToken)?undefined:{'Authorization': 'Bearer '+config.authToken},
        body: JSON.stringify({statements})
    })).json() as Array<_QueryResponse|_ErrorResponse|null>;
    if (!res.find(qr => (
        !qr || 
        !!(qr as _ErrorResponse).error
    ))) return Ok(res as Array<_QueryResponse>);
    else return Err(res as Array<_QueryResponse|_ErrorResponse|null>);
}

/** Execute an SQL statements. */
export async function execute(
    config: {
        /** The database URL.
         *
         * The client supports `http:`/`https:` URL.
         * 
         */
        url: string,

        /** Authentication token for the database. */
        authToken?: string
    },
    statement: sqlite_query
): Promise<Ok<_QueryResponse>|Err<_QueryResponse|_ErrorResponse>> {
    const res = await executeBatch(config, [statement]);
    if (res.isOk) return Ok(res.val[0]);
    else return Err(res.err[0] as _QueryResponse|_ErrorResponse);
}

export function extractBatchQueryResultRows(ok_result: Ok<Array<_QueryResponse>>) {
    return ok_result.val.map((e) => e.results.rows);
}

export function extractQueryResultRows(ok_result: Ok<_QueryResponse>) {
    return ok_result.val.results.rows;
}