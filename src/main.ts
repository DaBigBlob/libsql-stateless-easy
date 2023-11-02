import { _BatchResponse, _ErrorResponse, _Query } from "./api";
import { Err, Ok, Result } from "./return-types";

export async function executeBatch(
    config: {
        url: string,
        authToken?: string
    },
    statements: Array<_Query>
): Promise<Result<_BatchResponse, _ErrorResponse>> {
    const res = await fetch(config.url, {
        method: 'POST',
        headers: (!config.authToken)?undefined:{'Authorization': 'Bearer '+config.authToken},
        body: JSON.stringify({statements})
    });
    if (res.ok) return Ok(await res.json() as _BatchResponse);
    else return Err(await res.json() as _ErrorResponse);
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