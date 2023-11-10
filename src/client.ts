import { libsqlConfig } from "libsql-stateless";

export class libsqlClient {
    public readonly conf: libsqlConfig;

    constructor(conf: libsqlConfig) {
        this.conf = conf;
    }

    public execute() {

    }

    public batch() {

    }
}