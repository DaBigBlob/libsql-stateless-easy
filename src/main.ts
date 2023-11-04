import { Stmt } from "./hrana"

//## types
export type libsqlConf = {
    db_url: string,
    authToken?: string
}

//## functions
export async function execute(conf: libsqlConf, stmt: Stmt) {
    
}