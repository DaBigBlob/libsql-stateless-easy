//@ts-nocheck
//USING UNDICI
import { createClient, libsqlFetchLike } from 'libsql-stateless-easy';
import { conf } from './conf';

(async () => {
    const client = createClient({
        url: conf.db_url,
        authToken: conf.authToken,
        // as easy as that
        fetch: async (...args: Parameters<libsqlFetchLike>): ReturnType<libsqlFetchLike> => {
            console.log(`[${args[1]?.method} ${args[0]}]: ${args[1]?.body}`);
            return await globalThis.fetch(...args);
        }
    });

    const res = await client.execute("select * from contacts;");
    console.log(res);
})();

