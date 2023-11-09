//### Result Type
export type Result<T, E> = { isOk: true, val: T}|{ isOk: false, err: E}

//### Hrana Types
//url: https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#hrana-over-http

//## Pipeline Intractions =============================================================
type PipelineReq = {
    baton: string | null,
    requests: Array<CloseStreamReq|ExecuteStreamReq|BatchStreamReq> //other types are not dealt with in this lib
}
    type CloseStreamReq = {
        type: "close",
    }
    type ExecuteStreamReq = {
        type: "execute",
        stmt: SQLStatement
    }
        type SQLStatement = {
            sql: string,
            args?: Array<SQLValues>,
            named_args?: Array<{
                name: string,
                value: SQLValues,
            }>,
            want_rows?: boolean,
        }
            type SQLValues = 
                { type: "null" } |
                { type: "integer", value: string } |
                { type: "float", value: number } |
                { type: "text", value: string } |
                { type: "blob", base64: string };
    type BatchStreamReq = {
        type: "batch",
        batch: {
            steps: Array<BatchReqSteps>,
        }
    }
        type BatchReqSteps = {
            condition?: BatchReqStepExecCond | null,
            stmt: SQLValues,
        }
            type BatchReqStepExecCond = 
                { type: "ok", step: number } | //uint32: 0-based index in the steps array
                { type: "error", step: number } | //uint32: 0-based index in the steps array
                { type: "not", cond: BatchReqStepExecCond } |
                { type: "and", conds: Array<BatchReqStepExecCond> } |
                { type: "or", conds: Array<BatchReqStepExecCond> } |
                { type: "is_autocommit" };

type PipelineResOk = {
    baton: string | null,
    base_url: string | null,
    results: Array<StreamResOk|StreamResErr>
}
    type StreamResOk = {
        type: "ok",
        response: CloseStreamResOk|ExecuteStreamResOk|BatchStreamResOk //other types are not dealt with in this lib
    }
    type StreamResErr = {
        type: "error",
        error: StreamResErrData
    }
        type StreamResErrData = {
            message: string,
            code?: string | null
        }

type PipelineResErr = {
    error: string
}



//## Stream Res Kinds =======================================================


//## Stream Res Ok Kinds ============================================================
type CloseStreamResOk = {
    type: "close",
}
type ExecuteStreamResOk = {
    type: "execute",
    result: ExecuteStreamResOkData
}
    type ExecuteStreamResOkData = {
        "cols": Array<libsql_column>,
        "rows": Array<Array<libsql_value>>,
        "affected_row_count": number, //uint32
        "last_insert_rowid": string | null,
    }
type BatchStreamResOk = {
    type: "batch",
    result: BatchStreamResOkData,
}
    type BatchStreamResOkData = {
        "step_results": Array<libsql_statement_result | null>,
        "step_errors": Array<libsql_error | null>,
    }



