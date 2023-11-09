//### Result Type
export type Result<T, E> = { isOk: true, val: T}|{ isOk: false, err: E}

//### Hrana Types
//url: https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#hrana-over-http

//## Pipeline Intractions =============================================================
type PipelineReq = {
    baton: string | null,
    requests: Array<CloseStreamReq|ExecuteStreamReq|BatchStreamReq> //other types are not dealt with in this lib
}
    //## Stream Req Kinds ============================================================
    type CloseStreamReq = {
        type: "close",
    }
    type ExecuteStreamReq = {
        type: "execute",
        stmt: SQLStatement
    }
        //## SQLStatement =================================================================
        type SQLStatement = {
            sql: string,
            args?: Array<libsql_value>,
            named_args?: Array<{
                name: string,
                value: libsql_value,
            }>,
            want_rows?: boolean,
        }
    type BatchStreamReq = {
        type: "batch",
        batch: {
            steps: Array<BatchReqSteps>,
        }
    }
        //## SQLBatchSteps ===================================================================
        type BatchReqSteps = {
            condition?: libsql_batch_execution_condition | null,
            stmt: libsql_statement,
        }

type PipelineResOk = {
    baton: string | null,
    base_url: string | null,
    results: Array<StreamResOk|StreamResErr>
}

type PipelineResErr = {
    error: string
}



//## Stream Res Kinds =======================================================
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



