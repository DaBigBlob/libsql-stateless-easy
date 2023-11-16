import { ResultSet, rawValue } from "./types";

type InStatement = { sql: string, args: InArgs } | string;
type InArgs = Array<InValue> | Record<string, InValue>;
type InValue =
    | rawValue
    | boolean
    | Uint8Array
    | Date

export interface __Transaction {
    execute(stmt: InStatement): Promise<ResultSet>;
    batch(stmts: Array<InStatement>): Promise<Array<ResultSet>>;
    executeMultiple(sql: string): Promise<void>;
    rollback(): Promise<void>;
    commit(): Promise<void>;
    close(): void;
    closed: boolean;
}