import { BatchReqSteps, BatchStreamResOkData, Config, PipelineReq, PipelineResErr, PipelineResOk, Result, StreamResErr } from "./types";

async function hranaFetch(s: {
    conf: Config,
    req_json: PipelineReq
}): Promise<Result<PipelineResOk, PipelineResErr>> {
    const res = await fetch(
        `${s.conf.db_url}/v3/pipeline`, //https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#execute-a-pipeline-of-requests-json
        {
            method: 'POST',
            headers: (s.conf.authToken) ? {'Authorization': 'Bearer '+s.conf.authToken} : undefined,
            body: JSON.stringify(s.req_json)
        }
    );
    if (res.ok) return {isOk: true, val: (await res.json() as PipelineResOk)};
    else return {isOk: false, err: (await res.json() as PipelineResErr)};
}

export async function batch(conf: Config, batch_steps: Array<BatchReqSteps>): Promise<Result<BatchStreamResOkData, StreamResErr>> {
    const res = await hranaFetch({conf, req_json: {
            baton: null,
            requests: [
                {
                    type: "batch",
                    batch: { steps: batch_steps }
                },
                {
                    type: "close"
                }
            ]
    }});

    if (res.isOk) {
        const resu = res.val.results[0]; //this because [0] is where we executed the statement
        if (
            resu.type=="ok" &&
            resu.response.type=="batch"
        ) return {isOk: true, val: (resu.response.result)};
        else return {isOk: false, err: (resu as StreamResultError).error};
    }
    else return {isOk: false, err: {message: res.err.error}};
}