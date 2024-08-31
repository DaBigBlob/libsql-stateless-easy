//USEND THE SAME TRANSPORT AS @libsql/client
import { Headers, fetch as iso_fetch, Request as iso_Request} from '@libsql/isomorphic-fetch';
import { createClient, libsqlFetchLike } from 'libsql-stateless-easy';
import { conf } from './conf';

(async () => {
    const client = createClient({
        url: conf.db_url,
        authToken: conf.authToken,
        fetch: async (...args: Parameters<libsqlFetchLike>): ReturnType<libsqlFetchLike> => {
            return await iso_fetch(
                new iso_Request(
                    args[0], {
                        body: args[1]?.body,
                        method: args[1]?.method,
                        //@ts-ignore
                        headers: new Headers(args[1]?.headers)
                    }

                )
            );
        }
    });

    const res = await client.execute("select * from contacts;", []);
    console.log(res);
})();