//A GENERIC BOILERPLATE FOR IMPLEMENTING CUSTOM FETCH
import { createClient, libsqlFetchLike } from 'libsql-stateless-easy';
import { conf } from './conf';

(async () => {
    const client = createClient({
        url: conf.db_url,
        authToken: conf.authToken,
        fetch: async (...args: Parameters<libsqlFetchLike>): ReturnType<libsqlFetchLike> => {
                //implement your own fetch here (look at libsql_isomorphic_fetch.ts for concrete example)
                /** NOTE:
                 * args[0] is the url string
                 * args[1] is the request init
                 */
            );
        }
    });

    const res = await client.execute("select * from contacts;");
    console.log(res);
})();