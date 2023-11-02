import { Config, InStatement, ResultSet } from "./api";

export async function execute(config: Config, stmt: InStatement): Promise<ResultSet> {
    if (stmt||config) {}; //place holder
    return {} as ResultSet; //place holder
}

export async function batch(config: Config, stmts: Array<InStatement>): Promise<Array<ResultSet>> {
    if (stmts||config) {}; //place holder
    return {} as Array<ResultSet>; //place holder
}