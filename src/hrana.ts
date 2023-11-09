//### Result Type
export type Result<T, E> = { isOk: true, val: T}|{ isOk: false, err: E}

//### Hrana Types
//url: https://github.com/tursodatabase/libsql/blob/main/libsql-server/docs/HRANA_3_SPEC.md#hrana-over-http

//## Pipeline
type PipelineReqBody = {
    "baton": string | null,
    "requests": Array<StreamRequest>,
}

type PipelineRespOkBody = {
    "baton": string | null,
    "base_url": string | null,
    "results": Array<StreamResult>
}

type PipelineRespErrBody = {
    error: string
}