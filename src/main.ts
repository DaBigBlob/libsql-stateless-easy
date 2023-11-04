import { BatchResult, BatchStep, Error_, Stmt, StmtResult, StreamResultError, hranaFetch } from "./hrana"
import { Err, Ok, Result } from "./return_types";

//## types
export type libsqlConf = {
    db_url: string,
    authToken?: string
}

//## functions
export async function execute(conf: libsqlConf, stmt: Stmt): Promise<Result<StmtResult, Error_>> {
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

export async function executeBatch(conf: libsqlConf, batch_steps: Array<BatchStep>): Promise<Result<BatchResult, Error_>> {
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