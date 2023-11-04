import { BatchCond, BatchResult, BatchStep, Error_, StmtResult, StreamResultError, Value, hranaFetch } from "./hrana"
import { Err, Ok, Result } from "./return_types";

//## types
export type libsqlConf = {
    db_url: string,
    authToken?: string
}

export type libsql_value = Value;
export type libsql_statement = {
    "sql"?: string | null,
    "args"?: Array<libsql_value>,
    "named_args"?: Array<{
        "name": string,
        "value": Value,
    }>,
    "want_rows"?: boolean,
};
export type libsql_statement_result = StmtResult;
export type libsql_error = Error_;
export type libsql_batch_execution_condition = BatchCond;
export type libsql_batch_statement_step = {
    "condition"?: libsql_batch_execution_condition | null,
    "stmt": libsql_statement,
}

//## functions
export async function execute(conf: libsqlConf, stmt: libsql_statement): Promise<Result<libsql_statement_result, libsql_error>> {
    const res = (await hranaFetch({
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
    })).results[0]; //this because [0] is where we executed the statement

    if (
        res.type=="ok" &&
        res.response.type=="execute"
    ) return Ok(res.response.result);
    else return Err((res as StreamResultError).error);
}

export async function executeBatch(conf: libsqlConf, batch_steps: Array<BatchStep>): Promise<Result<BatchResult, libsql_error>> {
    const res = (await hranaFetch({
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
    })).results[0]; //this because [0] is where we executed the statement

    if (
        res.type=="ok" &&
        res.response.type=="batch"
    ) return Ok(res.response.result);
    else return Err((res as StreamResultError).error);
}