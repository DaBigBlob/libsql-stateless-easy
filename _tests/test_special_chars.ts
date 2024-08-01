import { createClient } from "../src/main";
//import { createClient } from '@libsql/client/web';
import { skjdgfksg } from "./conf";

(async () => {
    const client = createClient({url: skjdgfksg.db_url, authToken: skjdgfksg.authToken,
         //disableCriticalChecks: true
    });
    const res2 = await client.execute({
        sql: "insert into contacts (contact_id,first_name,last_name,email,phone) values (?,?,?,?,?);",
        args: [6,"glomm\nangk","feru","moca@doro.co","001"]
    });
    console.log(res2);

    const res4 = await client.execute({
        sql: "select * from contacts where contact_id = :kkl",
        args: {kkl: 6}
    });
    console.log("\n===WITH SPECIAL CHARS START===\n"+JSON.stringify(res4.rows[0], null, 4)+"\n===WITH SPECIAL CHARS START===\n");

    const res3 = await client.execute({
        sql: "delete from contacts where contact_id = :kkl",
        args: {kkl: 6}
    });
    console.log(res3);
})();