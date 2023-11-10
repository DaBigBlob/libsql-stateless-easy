import { libsqlConfig } from "libsql-stateless";
import { rawSQLStatement } from "./types";
import { libsqlBatch, libsqlExecute, libsqlServerCompatCheck } from "./simple_functions";

export class libsqlClient {
    private readonly conf: libsqlConfig;
    private readonly checkServerOnRun: boolean;

    constructor(conf: libsqlConfig, checkServerOnRun: boolean) {
        this.conf = conf;
        this.checkServerOnRun = checkServerOnRun;
    }

    public async execute(stmt: rawSQLStatement) {
        if (
            this.checkServerOnRun &&
            !(await this.serverOk())
        ) throw Error("Server is not compatible with `libsql-stateless`");
        return await libsqlExecute(this.conf, stmt);
    }

    public async batch(steps: Array<rawSQLStatement>) {
        if (
            this.checkServerOnRun &&
            !(await this.serverOk())
        ) throw Error("Server is not compatible with `libsql-stateless`");
        return await libsqlBatch(this.conf, steps);
    }

    public async serverOk() {
        return await libsqlServerCompatCheck(this.conf);
    }
}