# libsql-stateless-easy

> Thin libSQL stateless HTTP driver for TypeScript and JavaScript for the edge but easy 🚀
- ✅ **Supported runtime environments:** Web API (browser, serverless), Bun, Node.js (>=18)
- ✅ **Is extremely light:** 8.3kB (unpacked)* / 3.5kB (gzipped)
- ✅ **Is built for:** Quick stateless query execution. (Mainly for serverless and edge functions.)
- ✅ Supports everything in `@libsql/client/web` **except `interactive transactions`.
- ✅ **Is Atomic and stateless**, every function performs complete execution in exactly 1 roundtrip.
- ✅ **`libsql-stateless-easy` is simply a drop-in replacement** and exactly same API as `@libsql/client/web`.

\* The actual js that is included with your project. (Excluding the type definitions and 2 copies of the main js for esm and cjs. (because you're gonna use one of them))  
\*\*Interactive transactions are not supported because this lib is stateless but [`transactions`](https://github.com/DaBigBlob/libsql-stateless/wiki/transactions) are supported.
<br>

# Installation
```sh
$ npm i libsql-stateless-easy #pnpm, yarn, etc.
# or
$ bun add libsql-stateless-easy
```

# Client Usage
`libsql-stateless-easy`'s `client` has the exact same API as [`@libsql/client/web`](https://docs.turso.tech/sdk/ts/reference)'s `client`.
```ts
    import { createClient } from "libsql-stateless-easy";
    //or
    const { createClient } = require("libsql-stateless-easy");

    const client = createClient({
        url: "https://da-fish-mandible.turso.io",
        authToken: "fksdgfgksdgfksdg.javsdKDGKSBkgsdfg289374dg"
    });
    
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
            sql: "delete from contacts where contact_id = :kkl",
            args: {kkl: 6}
        }
    ]);
    console.log(res);

    const res2 = await client.execute({
        sql: "select first_name, last_name, email, contact_id from contacts where contact_id = ?;",
        args: [1]
    });
    console.log(res2);

    const res3 = await client.execute("select first_name, last_name, email, contact_id from contacts where contact_id = 1;");
    console.log(res3);
```

# Drizzle (and other ORMs)
**`libsql-stateless-easy`'s `client` works with drizzle (and other ORMs) out-of-the-box.**
This library implements the same Interface is the official client and therefore works with all the ORMs that the official client works with.
```ts
    import { createClient } from "libsql-stateless-easy";
    import { drizzle } from 'drizzle-orm/libsql';

    const client = createClient({
        url: "https://da-fish-mandible.turso.io",
        authToken: "fksdgfgksdgfksdg.javsdKDGKSBkgsdfg289374dg"
    });

    const db = drizzle(client);

    const result = await db.select().from(table_name).all();
    console.log(result);
```

- **This library has the same `LibsqlError` codes as `@libsql/client`**

## Performance
This library checks your configs, environments and server compatibility by default.  
However this is _kinda_ resource intensive if you're creating client instances often.  
So, **IF YOU ARE SURE YOUR CONFIGURATION, ENVIRONMENT AND SERVER VERSION ARE CORRECT, PLEASE DISABLE THE CHECKS FOR EVEN BETTER PERFORMANCE.**
```ts
    const client = createClient({
        url: "https://da-fish-mandible.turso.io",
        authToken: "fksdgfgksdgfksdg.javsdKDGKSBkgsdfg289374dg",
        disableCriticalChecks: true
    });
```

## Custom Fetch
Pass your own implementation of fetch or fetch-like function if you don't want libsql-stateless-easy to use the global fetch or if your global fetch does not exist.
```ts
    import { createClient, libsqlFetchLike } from 'libsql-stateless-easy';

    const client = createClient({
        url: "https://da-fish-mandible.turso.io",
        authToken: "fksdgfgksdgfksdg.javsdKDGKSBkgsdfg289374dg",
        fetch: async (...args: Parameters<libsqlFetchLike>): ReturnType<libsqlFetchLike> => {
                //implement your own fetch here (look at examples/custom_fetch/libsql_isomorphic_fetch.ts for concrete example)
                /** NOTE:
                 * args[0] is the url string
                 * args[1] is the request init
                 */
            );
        }
    });

    const res = await client.execute("select * from contacts;");
    console.log(res);
```

## Modularity
`libsql-stateless-easy` is extremely modular. `execute`, `batch`, etc. can be used without initiating a `client`.  
```ts
    import { libsqlBatchTransaction, libsqlExecute } from "libsql-stateless-easy";
    //or
    const { libsqlBatchTransaction, libsqlExecute } = require("libsql-stateless-easy");

    const config = {
        url: "https://da-fish-mandible.turso.io",
        authToken: "fksdgfgksdgfksdg.javsdKDGKSBkgsdfg289374dg"
    };
    
    const res = await libsqlBatchTransaction(
        config,
        [
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
                sql: "delete from contacts where contact_id = :kkl",
                args: {kkl: 6}
            }
        ]
    );
    console.log(res);

    const res2 = await libsqlExecute(
        config,
        {
            sql: "select first_name, last_name, email, contact_id from contacts where contact_id = ?;",
            args: [1]
        }
    );
    console.log(res2);

    const res3 = await libsqlExecute(config, "select first_name, last_name, email, contact_id from contacts where contact_id = 1;", []);
    console.log(res3);
```
`libsql-stateless-easy`'s `client` just conveniently packages these individually executable functions to conform to the official sdk interface.

### List of other stuff in this library
Feel free to explore them (however you don't need to as they've been neatly packaged into the `client`)
```ts
    import {
        libsqlValueBuilder, libsqlArgumentsBuilder, libsqlStatementBuilder, libsqlBatchReqStepsBuilder, libsqlBatchReqStepExecCondBuilder, libsqlTransactionBeginStatement,
        libsqlValueParser, libsqlStatementResParser, libsqlBatchStreamResParser, libsqlTransactionBatchStreamResParser,
        libsqlExecute, //has easier API than `libsql-stateless`'s function of the same name
        libsqlBatch, //has easier API than `libsql-stateless`'s function of the same name
        libsqlServerCompatCheck, //has easier API than `libsql-stateless`'s function of the same name,
        libsqlBatchTransaction, libsqlExecuteMultiple
        createClient //used above
    } from "libsql-stateless-easy";
```


## API Level
> NOTE: current API level is that of latest stable [libsql-stateless](https://github.com/DaBigBlob/libsql-stateless).   
Read [this section](https://github.com/DaBigBlob/libsql-stateless/?tab=readme-ov-file#api-level).