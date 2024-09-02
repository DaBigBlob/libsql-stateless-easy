//@ts-nocheck
//USING AXIOS
import * as axios from 'axios';
import { createClient, libsqlFetchLike } from 'libsql-stateless-easy';
import { conf } from './conf';

(async () => {
    const client = createClient({
        url: conf.db_url,
        authToken: conf.authToken,
        //creating an usable fetch-like from axios API
        fetch: async (...args: Parameters<libsqlFetchLike>): ReturnType<libsqlFetchLike> => {
            const rawRes = await axios.default({
                url: args[0],
                method: args[1]?.method,
                headers: args[1]?.headers,
                data: args[1]?.body,
                responseType: 'text',
                responseEncoding: 'utf8',
                validateStatus: (s: number) => true
            });
            return {
                ok: ((rawRes.status > 199)&&(rawRes.status < 300)),
                status: rawRes.status,
                async text() {
                    if (typeof(rawRes.data) != 'string') throw new Error("Axios Response not utf8 str");
                    return rawRes.data;
                },
                async json() {
                    if (typeof(rawRes.data) != 'string') throw new Error("Axios Response not utf8 str");
                    return JSON.parse(rawRes.data);
                }
            };
        }
    });

    const res = await client.execute("select * from contacts;");
    console.log(res);
})();

