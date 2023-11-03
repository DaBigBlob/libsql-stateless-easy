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

/** Execute a batch of SQL statements. */
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

export function extractBatchQueryResultRows(result: Ok<Array<_QueryResponse>>|Err<Array<_QueryResponse|_ErrorResponse|null>>): Array<Array<Array<sqlite_value>>|null> {
    if (result.isOk) return result.val.map(e => e.results.rows);
    else return result.err.map(e => {
        if (
            !e ||
            (e as _ErrorResponse|null)?.error
        ) return null;
        else return (e as _QueryResponse).results.rows;
    });
}

export function extractQueryResultRows(result: Ok<_QueryResponse>|Err<_QueryResponse|_ErrorResponse>): Array<Array<sqlite_value>>|null {
    if (result.isOk) return result.val.results.rows;
    else return null;
}


/** Check if the server is compatible with sqld http API v0 */
export async function checkServerCompat(config: {
    /** The database URL.
     *
     * The client supports `http:`/`https:` URL.
     * 
     */
    url: string,

    /** Authentication token for the database. */
    authToken?: string
}): Promise<Ok<undefined>|Err<undefined>> {
    if ((await executeBatch(config, [""])).isOk) return Ok(undefined);
    else return Err(undefined);
}