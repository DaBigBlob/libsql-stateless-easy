import { libsql_batch_statement_result, libsql_batch_statement_step, libsql_error, libsql_statement, libsql_value } from "./main";

export async function hranaFetch(s: {
    db_url: string,
    authToken?: string,
    req_json: PipelineReqBody
}) {
    return await (await fetch(
        `${s.db_url}/v3/pipeline`, //https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#execute-a-pipeline-of-requests-json
        {
            method: 'POST',
            headers: (s.authToken) ? {'Authorization': 'Bearer '+s.authToken} : undefined,
            body: JSON.stringify(s.req_json)
        }
    )).json() as PipelineRespBody;
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
    "result": StmtResult,
}

//## Statement results
export type StmtResult = {
    "cols": Array<Col>,
    "rows": Array<Array<libsql_value>>,
    "affected_row_count": number, //uint32
    "last_insert_rowid": string | null,
}

type Col = {
    "name": string | null,
    "decltype": string | null,
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
