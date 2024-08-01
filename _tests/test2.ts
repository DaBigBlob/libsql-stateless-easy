import { libsqlExecute, libsqlBatch, libsqlServerCompatCheck} from "libsql-stateless";
import { libsqlStatementBuilder, libsqlBatchStreamResParser, libsqlStatementResParser } from "../src/main";
import { skjdgfksg } from "./conf";

(async () => {
    const conf = skjdgfksg;
    
    const res = await libsqlBatch(conf, [
        {
            stmt: libsqlStatementBuilder({
                sql: "select * from contacts where contact_id = ?;",
                args: [3]
            }),
            // condition: BatchReqStepExecCondBuilder({
            //     type: "and",
            //     conds: [
            //         BatchReqStepExecCondBuilder({type: "ok", step: 1}),
            //         BatchReqStepExecCondBuilder({type: "ok", step: 2})
            //     ]
            // })
        },
        {stmt: libsqlStatementBuilder({
            sql: "select first_name, last_name, email from contacts where contact_id = @koji;",
            args: {koji: 2}
        })},
        {stmt: libsqlStatementBuilder({
            sql: "insert into contacts (contact_id,first_name,last_name,email,phone) values (?,?,?,?,?);",
            args: [6,"glomm","feru","moca@doro.co","001"]
        })},    
        {stmt: libsqlStatementBuilder({
            sql: "delete from contacts where contact_id = :kkl",
            args: {kkl: 6}
        })}
    ]);
    if (res.isOk) console.log(libsqlBatchStreamResParser(res.val));
    else console.error(res.err);

    const res2 = await libsqlExecute(conf, libsqlStatementBuilder({
        sql: "select first_name, last_name, email, contact_id from contacts where contact_id = ?;",
        args: [1]
    }));
    if (res2.isOk) console.log(libsqlStatementResParser(res2.val));
    else console.error(res2.err);

    const res3 = await libsqlServerCompatCheck(conf);
    if (res3.isOk) console.log("Server Compat Check OK");
    else console.error("Server Compat Check NOT OK");
})();