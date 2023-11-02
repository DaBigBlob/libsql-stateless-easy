import { Config, InStatement, ResultSet, TransactionMode } from "./api";

export class createClient {
    constructor(config: Config) {
        if (config) {}; //place holder
    }

    async execute(stmt: InStatement): Promise<ResultSet> {
        if (stmt) {}; //place holder
        return {} as ResultSet; //place holder
    }

    async batch(stmts: Array<InStatement>, mode: TransactionMode = "deferred"): Promise<Array<ResultSet>> {
        if (stmts||mode) {}; //place holder
        return {} as Array<ResultSet>; //place holder
    }
}