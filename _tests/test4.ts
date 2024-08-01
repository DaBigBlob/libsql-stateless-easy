import { createClient } from "../src/main";
import { skjdgfksg } from "./conf";

(async () => {
    const client = createClient({url: skjdgfksg.db_url, authToken: skjdgfksg.authToken});
    
    const res = await client.batch([
        {
            sql: "select * from contacts where contact_id = ?;",
            args: [3]
        },
        "select first_name, last_name, email from contacts where contact_id = 2",
        {
            sql: "insert into contacts (contact_id,first_name,last_name,email,phone) values (?,?,?,?,?);",
            args: [6,"glomm","feru","moca@doro.co","001"]
        },
        {
            sql: "delete from contacts where contact_id = :kkll",
            args: {kkl: 6}
        }
    ]);
    console.log(res);

    const res2 = await client.execute({
        sql: "select first_name, last_name, email, contact_id from contacts where contact_id = ?;",
        args: [1]
    });
    console.log(res2);

    const res3 = await client.execute(
        "select first_name, last_name, email, contact_id from contacts where contact_id = ?;",
        [1]
    );
    console.log(res3);

    const res4 = await client.execute(
        "select first_name, last_name, email, contact_id from contacts where contact_id = :aae;",
        {aae: 1}
    );
    console.log(res4);

    const ress = await client.executeMultiple(
    `insert into contacts (contact_id,first_name,last_name,email,phone) values (6,"glomm","feru","moca@doro.co","001"); delete from contacts where contact_id = 6`
    );
    console.log(ress === undefined);

    // const res3 = await client.serverOk();
    // if (res3) console.log("Server Compat Check OK");
    // else console.error("Server Compat Check NOT OK");
})();