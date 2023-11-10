import { libsqlType } from "libsql-stateless";

export class libsqlClient {
    public readonly conf: libsqlType.Config;

    constructor(conf: libsqlType.Config) {
        this.conf = conf;
    }

    public execute() {

    }

    public batch() {

    }
}