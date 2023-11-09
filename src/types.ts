//### Result Type
export type Result<T, E> = { isOk: true, val: T}|{ isOk: false, err: E}

//### Hrana Types
//url: https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#hrana-over-http
export type a = PipelineReq|PipelineResOk|PipelineResErr;

//## Pipeline Intractions =============================================================
type PipelineReq<StreamReqKind=CloseStreamReq|ExecuteStreamReq|BatchStreamReq> = {
    baton: string | null,
    requests: Array<StreamReqKind>
}
type PipelineResOk<StreamResKind=StreamResOk|StreamResErr> = {
    baton: string | null,
    base_url: string | null,
    results: Array<StreamResKind>
}
type PipelineResErr = {
    error: string
}

//## StreamReqKind =============================================================
type CloseStreamReq = {
    type: "close",
}
type ExecuteStreamReq = {
    type: "execute",
    stmt: SQLStatement
}
type BatchStreamReq = {
    type: "batch",
    batch: {
        steps: Array<BatchReqSteps>,
    }
}
//other types are not dealt with in this lib

//## StreamResKind =============================================================
type StreamResOk<StreamResOkKind=CloseStreamResOk|ExecuteStreamResOk|BatchStreamResOk> = {
    type: "ok",
    response:  StreamResOkKind
}
type StreamResErr = {
    type: "error",
    error: StreamResErrData
}

//## SQLStatement =================================================================
type SQLStatement = {
    sql: string,
    args?: Array<SQLValues>,
    named_args?: Array<{
        name: string,
        value: SQLValues,
    }>,
    want_rows?: boolean,
}

//## BatchReqSteps =================================================================
type BatchReqSteps = {
    condition?: BatchReqStepExecCond | null,
    stmt: SQLValues,
}

//## Stream Res Ok Kinds =================================================================
type CloseStreamResOk = {
    type: "close",
}
type ExecuteStreamResOk = {
    type: "execute",
    result: StatementResOkData
}
type BatchStreamResOk = {
    type: "batch",
    result: BatchStreamResOkData,
}
//other types are not dealt with in this lib

//## StreamResErrData =================================================================
type StreamResErrData = {
    message: string,
    code?: string | null
}

//## SQLValues =================================================================
type SQLValues = 
    { type: "null" } |
    { type: "integer", value: string } |
    { type: "float", value: number } |
    { type: "text", value: string } |
    { type: "blob", base64: string };

//## BatchReqStepExecCond =================================================================
type BatchReqStepExecCond = 
    { type: "ok", step: number } | //uint32: 0-based index in the steps array
    { type: "error", step: number } | //uint32: 0-based index in the steps array
    { type: "not", cond: BatchReqStepExecCond } |
    { type: "and", conds: Array<BatchReqStepExecCond> } |
    { type: "or", conds: Array<BatchReqStepExecCond> } |
    { type: "is_autocommit" };

//## StatementResOkData =================================================================
type StatementResOkData = {
    cols: Array<SQLColumn>,
    rows: Array<Array<SQLValues>>,
    affected_row_count: number, //uint32
    last_insert_rowid: string | null
}

//## BatchStreamResOkData =================================================================
type BatchStreamResOkData = {
    step_results: Array<StatementResOkData | null>,
    step_errors: Array<StreamResErrData | null>
}

//## SQLColumn =================================================================
type SQLColumn = {
    name: string | null,
    decltype: string | null
}