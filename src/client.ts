import { libsqlBatchReqStepExecCond, libsqlConfig } from "libsql-stateless";
import { TransactionMode, rawSQLStatement } from "./types.js";
import { libsqlBatch, libsqlBatchTransaction, libsqlExecute, libsqlExecuteMultiple, libsqlServerCompatCheck } from "./functions";
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
        mode?: TransactionMode
    ) {
        return await libsqlBatchTransaction(this.conf, steps, mode);
    }

    public async batchPrimitive(
        steps: Array<rawSQLStatement>,
        step_conditions?: Array<libsqlBatchReqStepExecCond|null|undefined>
    ) {
        return await libsqlBatch(this.conf, steps, step_conditions);
    }

    public async transaction(mode?: TransactionMode) {
        if (mode) {}
        throw new InternalError("'libsql-stateless' is stateless and does not support interactive transactions. Use this.batch() instead.");
    }

    public async executeMultiple(sql: string) {
        return await libsqlExecuteMultiple(this.conf, sql);
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