import { PipelineReqBody, PipelineRespBody } from "./hrana-types";

export async function hranaFetch(
    url: string,
    init: {
        method: 'GET'|'POST',
        authToken?: string,
        req_json?: PipelineReqBody
    }
) {
    return await (await fetch(
        url,
        {
            method: init.method,
            headers: (init.authToken) ? {'Authorization': 'Bearer '+init.authToken} : undefined,
            body: (init.req_json) ? JSON.stringify(init.req_json) : undefined
        }
    )).json() as PipelineRespBody;
}