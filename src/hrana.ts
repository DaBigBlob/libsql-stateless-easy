//### Result Type
export type Result<T, E> = { isOk: true, val: T}|{ isOk: false, err: E}

//### Hrana Types
//url: https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#hrana-over-http

//## Pipeline Intractions =============================================================
type PipelineReq = {
    baton: string | null,
    requests: Array<CloseStreamReq|ExecuteStreamReq|BatchStreamReq> //other types are not dealt with in this lib
}
type PipelineResOk = {
    baton: string | null,
    base_url: string | null,
    results: Array<StreamResOk|StreamResErr>
}
type PipelineResErr = {
    error: string
}

//## Stream Req Kinds ============================================================
type CloseStreamReq = {
    type: "close",
}
type ExecuteStreamReq = {
    type: "execute",
    stmt: libsql_statement,
}
type BatchStreamReq = {
    type: "batch",
    batch: Batch,
}

//## Stream Res Kinds =======================================================
type StreamResOk = {
    type: "ok",
    response: CloseStreamResOk|ExecuteStreamResOk|BatchStreamResOk //other types are not dealt with in this lib
}
type StreamResErr = {
    type: "error",
    error: libsql_error,
}

//## Stream Res Ok Kinds ============================================================
type CloseStreamResOk = {
    type: "close",
}
type ExecuteStreamResOk = {
    type: "execute",
    result: libsql_statement_result,
}
type BatchStreamResOk = {
    type: "batch",
    result: libsql_batch_statement_result,
}