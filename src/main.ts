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

export type _Value = _Text|_Integer|_Integer|_Real|_Blob|_Null;
export type _Text = string; //a UTF-8 encoded string
export type _Integer = number; //a 64-bit signed integer
export type _Real = number; //a 64-bits floating number
export type _Blob = string; //some binary data, encoded in base64
export type _Null = null; //the null value

export type _Query = string | { q: string, params: Record<string, _Value> | Array<_Value> };

export type _BatchResponse = Array<{
    results: {
        columns: Array<string>,
        rows: Array<Array<_Value>>,
    }
}>

export type _ErrorResponse = {
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

/** Execute a batch of SQL statements in a transaction. */
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
): Promise<Ok<_BatchResponse>|Err<_ErrorResponse>> {
    const res = await fetch(config.url, {
        method: 'POST',
        headers: (!config.authToken)?undefined:{'Authorization': 'Bearer '+config.authToken},
        body: JSON.stringify({statements})
    });
    if (res.ok) return Ok(await res.json() as _BatchResponse);
    else return Err(await res.json() as _ErrorResponse);
}