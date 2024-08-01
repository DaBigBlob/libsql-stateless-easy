import { libsqlBatch, libsqlExecute, libsqlServerCompatCheck } from "../src/main";
import { skjdgfksg } from "./conf";

(async () => {
    const conf = skjdgfksg;
    
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
    console.log(res);

    const res2 = await libsqlExecute(conf, {
        sql: "select first_name, last_name, email, contact_id from contacts where contact_id = ?;",
        args: [1]
    });
    console.log(res2);

    const res3 = await libsqlServerCompatCheck(conf);
    if (res3) console.log("Server Compat Check OK");
    else console.error("Server Compat Check NOT OK");
})();