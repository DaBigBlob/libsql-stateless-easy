import { libsql_batch_statement_result, libsql_batch_statement_step, libsql_error, libsql_statement, libsql_statement_result } from "./main";
import { Err, Ok } from "./return_types";

export async function hranaFetch(s: {
    db_url: string,
    authToken?: string,
    req_json: PipelineReqBody
}) {
    const res = await fetch(
        `${s.db_url}/v3/pipeline`, //https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#execute-a-pipeline-of-requests-json
        {
            method: 'POST',
            headers: (s.authToken) ? {'Authorization': 'Bearer '+s.authToken} : undefined,
            body: JSON.stringify(s.req_json)
        }
    );
    if (res.ok) return Ok(await res.json() as PipelineRespBody);
    else return Err(await res.json() as PipelineRespErrorBody);
}

export async function hranaCheck(db_url: string) {
    return (await fetch(
        `${db_url}/v3`,
        {
            method: 'GET'
        }
    )).ok;
}


//### Hrana Types
//url: https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#hrana-over-http
//## Pipeline
type PipelineReqBody = {
    "baton": string | null,
    "requests": Array<StreamRequest>,
}

type PipelineRespBody = {
    "baton": string | null,
    "base_url": string | null,
    "results": Array<StreamResult>
}
export type PipelineRespErrorBody = {
    error: string
}

type StreamResult =
    | StreamResultOk
    | StreamResultError

type StreamResultOk = {
    "type": "ok",
    "response": StreamResponse,
}

export type StreamResultError = {
    "type": "error",
    "error": libsql_error,
}

//## Requests
type StreamRequest =
    | CloseStreamReq
    | ExecuteStreamReq
    | BatchStreamReq

type StreamResponse =
    | CloseStreamResp
    | ExecuteStreamResp
    | BatchStreamResp

//## Close stream
type CloseStreamReq = {
    "type": "close",
}

type CloseStreamResp = {
    "type": "close",
}

//## Execute a statement
type ExecuteStreamReq = {
    "type": "execute",
    "stmt": libsql_statement,
}

type ExecuteStreamResp = {
    "type": "execute",
    "result": libsql_statement_result,
}

//## Execute a batch
type BatchStreamReq = {
    "type": "batch",
    "batch": Batch,
}

type BatchStreamResp = {
    "type": "batch",
    "result": libsql_batch_statement_result,
}

//## Batches
type Batch = {
    "steps": Array<libsql_batch_statement_step>,
}
