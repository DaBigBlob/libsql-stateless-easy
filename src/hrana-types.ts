//## Pipeline
export type PipelineReqBody = {
    "baton": string | null,
    "requests": Array<StreamRequest>,
}

export type PipelineRespBody = {
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

type StreamResultError = {
    "type": "error",
    "error": Error,
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
    "stmt": Stmt,
}

type ExecuteStreamResp = {
    "type": "execute",
    "result": StmtResult,
}

//## Statements
type Stmt = {
    "sql"?: string | null,
    "args"?: Array<Value>,
    "named_args"?: Array<NamedArg>,
    "want_rows"?: boolean,
}

type NamedArg = {
    "name": string,
    "value": Value,
}

//## Statement results
type StmtResult = {
    "cols": Array<Col>,
    "rows": Array<Array<Value>>,
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
    "result": BatchResult,
}

//## Batches
type Batch = {
    "steps": Array<BatchStep>,
}

type BatchStep = {
    "condition"?: BatchCond | null,
    "stmt": Stmt,
}

//## Batch results
type BatchResult = {
    "step_results": Array<StmtResult | null>,
    "step_errors": Array<Error | null>,
}

//## Conditions
type BatchCond =
    | { "type": "ok", "step": number } //uint32
    | { "type": "error", "step": number } //uint32
    | { "type": "not", "cond": BatchCond }
    | { "type": "and", "conds": Array<BatchCond> }
    | { "type": "or", "conds": Array<BatchCond> }
    | { "type": "is_autocommit" }

//## Values
type Value =
    | { "type": "null" }
    | { "type": "integer", "value": string }
    | { "type": "float", "value": number }
    | { "type": "text", "value": string }
    | { "type": "blob", "base64": string }