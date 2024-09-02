//@ts-nocheck
//USING UNDICI
import { fetch as undici_fetch } from 'undici';
import { createClient } from 'libsql-stateless-easy';
import { conf } from './conf';

(async () => {
    const client = createClient({
        url: conf.db_url,
        authToken: conf.authToken,
        // as easy as that
        fetch: undici_fetch
    });

    const res = await client.execute("select * from contacts;");
    console.log(res);
})();

