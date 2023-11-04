import { PipelineRespErrorBody, StreamResultError, hranaCheck, hranaFetch } from "./hrana"
import { Err, Ok, Result } from "./return_types";

//## types
export type libsql_conf = {
    db_url: string,
    authToken?: string
}

export type libsql_value = 
    | { "type": "null" }
    | { "type": "integer", "value": string }
    | { "type": "float", "value": number }
    | { "type": "text", "value": string }
    | { "type": "blob", "base64": string };
export type libsql_column = {
    "name": string | null,
    "decltype": string | null,
}
export type libsql_statement = {
    "sql": string,
    "args"?: Array<libsql_value>,
    "named_args"?: Array<{
        "name": string,
        "value": libsql_value,
    }>,
    "want_rows"?: boolean,
};
export type libsql_statement_result = {
    "cols": Array<libsql_column>,
    "rows": Array<Array<libsql_value>>,
    "affected_row_count": number, //uint32
    "last_insert_rowid": string | null,
};
export type libsql_error = {
    "message": string,
    "code"?: string | null,
};
export type libsql_batch_execution_condition = 
    | { "type": "ok", "step": number } //uint32
    | { "type": "error", "step": number } //uint32
    | { "type": "not", "cond": libsql_batch_execution_condition }
    | { "type": "and", "conds": Array<libsql_batch_execution_condition> }
    | { "type": "or", "conds": Array<libsql_batch_execution_condition> }
    | { "type": "is_autocommit" };
export type libsql_batch_step = {
    "condition"?: libsql_batch_execution_condition | null,
    "stmt": libsql_statement,
}
export type libsql_batch_statement_result = {
    "step_results": Array<libsql_statement_result | null>,
    "step_errors": Array<libsql_error | null>,
}

//## functions
export async function libsqlExecute(conf: libsql_conf, stmt: libsql_statement): Promise<Result<libsql_statement_result, libsql_error>> {
    const res = await hranaFetch({
        ...conf,
        req_json: {
            "baton": null,
            "requests": [
                {
                    "type": "execute",
                    "stmt": stmt,
                },
                {
                    "type": "close",
                }
            ],
        }
    });

    if (res.isOk) {
        const resu = res.val.results[0]; //this because [0] is where we executed the statement
        if (
            resu.type=="ok" &&
            resu.response.type=="execute"
        ) return Ok(resu.response.result);
        else return Err((resu as StreamResultError).error);
    }
    else return Err({message: (res.err as PipelineRespErrorBody).error});
}

export async function libsqlBatch(conf: libsql_conf, batch_steps: Array<libsql_batch_step>): Promise<Result<libsql_batch_statement_result, libsql_error>> {
    const res = await hranaFetch({
        ...conf,
        req_json: {
            "baton": null,
            "requests": [
                {
                    "type": "batch",
                    "batch": {
                        "steps": batch_steps,
                    },
                },
                {
                    "type": "close",
                }
            ]
        }
    });

    if (res.isOk) {
        const resu = res.val.results[0]; //this because [0] is where we executed the statement
        if (
            resu.type=="ok" &&
            resu.response.type=="batch"
        ) return Ok(resu.response.result);
        else return Err((resu as StreamResultError).error);
    }
    else return Err({message: (res.err as PipelineRespErrorBody).error});
}

export async function libsqlServerCompatCheck(db_url: string): Promise<Result<undefined, undefined>> {
    if (await hranaCheck(db_url)) return Ok(undefined);
    else return Err(undefined);
}