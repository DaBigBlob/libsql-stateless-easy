import { libsqlBatchReqStepExecCond, libsqlConfig } from "libsql-stateless";
import { rawSQLStatement } from "./types.js";
import { libsqlBatch, libsqlExecute, libsqlServerCompatCheck } from "./functions";
import { InternalError, LibsqlError } from "./errors.js";

class libsqlClient {
    private readonly conf: libsqlConfig;
    public closed: boolean;
    public protocol: string;

    constructor(conf: libsqlConfig) {
        this.conf = conf;
        this.closed = true;
        this.protocol = "http";
    }

    public async execute(stmt: rawSQLStatement) {
        return await libsqlExecute(this.conf, stmt);
    }

    public async batch(
        steps: Array<rawSQLStatement>,
        step_conditions?: Array<libsqlBatchReqStepExecCond|null|undefined>,
        mode?: "write" | "read" | "deferred"
    ) {
        if (mode) {}
        return await libsqlBatch(this.conf, steps, step_conditions);
    }

    public async transaction(mode?: "write" | "read" | "deferred") {
        if (mode) {}
        throw new InternalError("'libsql-stateless' is stateless and does not support interactive transactions.");
    }

    public async executeMultiple(sql: string) {
        const sqlArr = sql.split(";")
    }

    public async sync() {
        throw new LibsqlError("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
    }

    public close() {
        throw new InternalError("'libsql-stateless' is stateless therefore no connection to close.");
    }

    public async serverOk() {
        return await libsqlServerCompatCheck(this.conf);
    }
}

export function createClient(conf: libsqlConfig) {
    return new libsqlClient(conf);
}