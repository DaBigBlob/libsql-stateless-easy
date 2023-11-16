import { libsqlConfig } from "libsql-stateless";
import { rawSQLStatement } from "./types.js";
import { libsqlBatch, libsqlExecute, libsqlServerCompatCheck } from "./functions";
import { LibsqlError } from "./errors.js";

class libsqlClient {
    private readonly conf: libsqlConfig;

    constructor(conf: libsqlConfig) {
        this.conf = conf;
    }

    public async execute(stmt: rawSQLStatement) {
        return await libsqlExecute(this.conf, stmt);
    }

    public async batch(steps: Array<rawSQLStatement>) {
        return await libsqlBatch(this.conf, steps);
    }

    public async transaction() {
        throw new LibsqlError("", "");
    }

    public async sync() {
        throw new LibsqlError("", "");
    }

    public async serverOk() {
        return await libsqlServerCompatCheck(this.conf);
    }
}

export function createClient(conf: libsqlConfig) {
    return new libsqlClient(conf);
}