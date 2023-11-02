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

 type _Value = _Text|_Integer|_Integer|_Real|_Blob|_Null;
 type _Text = string; //a UTF-8 encoded string
 type _Integer = number; //a 64-bit signed integer
 type _Real = number; //a 64-bits floating number
 type _Blob = string; //some binary data, encoded in base64
 type _Null = null; //the null value

 type _Query = string | { q: string, params: Record<string, _Value> | Array<_Value> };

 type _QueryResponse = {
    results: {
        columns: Array<string>,
        rows: Array<Array<_Value>>,
    }
}

type _ErrorResponse = {
    error: string
}



//### function ###

/** Check if the server is compatible with sqld http API v0 */
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
    statements: Array<_Query>
): Promise<Ok<Array<_QueryResponse>>|Err<string>> {
    const res = await fetch(config.url, {
        method: 'POST',
        headers: (!config.authToken)?undefined:{'Authorization': 'Bearer '+config.authToken},
        body: JSON.stringify({statements})
    });
    if (res.ok) return Ok(await res.json() as Array<_QueryResponse>);
    else return Err((await res.json() as _ErrorResponse).error);
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
    statement: _Query
): Promise<Ok<_QueryResponse>|Err<string>> {
    const res = await executeBatch(config, [statement]);
    if (res.isOk) return Ok(res.val[0]);
    else return Err(res.err);
}

export function extractBatchQueryResultRows(ok_result: Ok<Array<_QueryResponse>>) {
    return ok_result.val.map((e) => e.results.rows);
}

export function extractQueryResultRows(ok_result: Ok<_QueryResponse>) {
    return ok_result.val.results.rows;
}