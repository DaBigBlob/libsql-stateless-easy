//### Result Type
export type Result<T, E> = { isOk: true, val: T}|{ isOk: false, err: E}

//### Config Type
export type Config = {
    db_url: string,
    authToken?: string
}

//### Hrana Types
//url: https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#hrana-over-http
//## Pipeline Intractions =============================================================
export type PipelineReq<StreamReqKind=CloseStreamReq|ExecuteStreamReq|BatchStreamReq> = {
    baton: string | null,
    requests: Array<StreamReqKind>
}
export type PipelineResOk<StreamResKind=StreamResOk|StreamResErr> = {
    baton: string | null,
    base_url: string | null,
    results: Array<StreamResKind>
}
export type PipelineResErr = {
    error: string
}

//## StreamReqKind =============================================================
export type CloseStreamReq = {
    type: "close",
}
export type ExecuteStreamReq = {
    type: "execute",
    stmt: SQLStatement
}
export type BatchStreamReq = {
    type: "batch",
    batch: {
        steps: Array<BatchReqSteps>,
    }
}
//other types are not dealt with in this lib

//## StreamResKind =============================================================
export type StreamResOk<StreamResOkKind=CloseStreamResOk|ExecuteStreamResOk|BatchStreamResOk> = {
    type: "ok",
    response:  StreamResOkKind
}
export type StreamResErr = {
    type: "error",
    error: StreamResErrData
}

//## SQLStatement =================================================================
export type SQLStatement = {
    sql: string,
    args?: Array<SQLValues>,
    named_args?: Array<{
        name: string,
        value: SQLValues,
    }>,
    want_rows?: boolean,
}

//## BatchReqSteps =================================================================
export type BatchReqSteps = {
    condition?: BatchReqStepExecCond | null,
    stmt: SQLValues,
}

//## Stream Res Ok Kinds =================================================================
export type CloseStreamResOk = {
    type: "close",
}
export type ExecuteStreamResOk = {
    type: "execute",
    result: StatementResOkData
}
export type BatchStreamResOk = {
    type: "batch",
    result: BatchStreamResOkData,
}
//other types are not dealt with in this lib

//## StreamResErrData =================================================================
export type StreamResErrData = {
    message: string,
    code?: string | null
}

//## SQLValues =================================================================
export type SQLValues = 
    { type: "null" } |
    { type: "integer", value: string } |
    { type: "float", value: number } |
    { type: "text", value: string } |
    { type: "blob", base64: string };

//## BatchReqStepExecCond =================================================================
export type BatchReqStepExecCond = 
    { type: "ok", step: number } | //uint32: 0-based index in the steps array
    { type: "error", step: number } | //uint32: 0-based index in the steps array
    { type: "not", cond: BatchReqStepExecCond } |
    { type: "and", conds: Array<BatchReqStepExecCond> } |
    { type: "or", conds: Array<BatchReqStepExecCond> } |
    { type: "is_autocommit" };

//## StatementResOkData =================================================================
export type StatementResOkData = {
    cols: Array<SQLColumn>,
    rows: Array<Array<SQLValues>>,
    affected_row_count: number, //uint32
    last_insert_rowid: string | null
}

//## BatchStreamResOkData =================================================================
export type BatchStreamResOkData = {
    step_results: Array<StatementResOkData | null>,
    step_errors: Array<StreamResErrData | null>
}

//## SQLColumn =================================================================
export type SQLColumn = {
    name: string | null,
    decltype: string | null
}