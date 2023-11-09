import { PipelineReq, PipelineResErr, PipelineResOk, Result } from "./types";


async function hranaFetch(s: {
    db_url: string,
    authToken?: string,
    req_json: PipelineReq
}): Promise<Result<PipelineResOk, PipelineResErr>> {
    const res = await fetch(
        `${s.db_url}/v3/pipeline`, //https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#execute-a-pipeline-of-requests-json
        {
            method: 'POST',
            headers: (s.authToken) ? {'Authorization': 'Bearer '+s.authToken} : undefined,
            body: JSON.stringify(s.req_json)
        }
    );
    if (res.ok) return {isOk: true, val: (await res.json() as PipelineResOk)};
    else return {isOk: false, err: (await res.json() as PipelineResErr)};
}