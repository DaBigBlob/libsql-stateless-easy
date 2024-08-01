import { libsqlBatch, libsqlExecute } from "../src/main";
import { skjdgfksg } from "./conf";

(async () => {
    const conf = skjdgfksg;
    
    console.time("libsqlBatch");
    const res = await libsqlBatch(conf, [
        {
            sql: "select * from contacts where contact_id = ?;",
            args: [3]
        },
        {
            sql: "select first_name, last_name, email from contacts where contact_id = @koji;",
            args: {koji: 2}
        },
        {
            sql: "insert into contacts (contact_id,first_name,last_name,email,phone) values (?,?,?,?,?);",
            args: [6,"glomm","feru","moca@doro.co","001"]
        },
        {
            sql: "delete from contacts where contact_id = :kkl",
            args: {kkl: 6}
        }
    ], []);
    console.timeEnd("libsqlBatch");

    console.log(!!res);



    console.time("libsqlExecute");
    const res2 = await libsqlExecute(conf, {
        sql: "select first_name, last_name, email, contact_id from contacts where contact_id = ?;",
        args: [1]
    });
    console.timeEnd("libsqlExecute");

    console.log(!!res2);
})();