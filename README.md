# libsql-stateless

> Thin libSQL stateless HTTP driver for TypeScript and JavaScript.
- **Supported runtime environments:** Web API (browser, serverless), Bun, Node.js (>=18)
- **Extremely thin:** Has no dependency, only has a few functions that implement the `Hrana v3 HTTP` protocol from scratch, and has no classes.
- **Is built for:** Quick stateless query execution. (Mainly for serverless and edge functions.)

## The Result Type
Every function in this library returns a `Result<T, R>` type.

`Result<T, R>` is either:
```ts
{
    isOk: true,
    val: T
}
```
or:
```ts
{
    isOk: false,
    err: R
}
```
For example, the function `await execute(conf: libsqlConf, stmt: libsql_statement)` returns `Result<libsql_statement_result, libsql_error>`, which is either:
```ts
{
    isOk: true,
    val: libsql_statement_result
}
```
or:
```ts
{
    isOk: false,
    err: libsql_error
}
```
### Benefits of Result Type
- No need of ugly try { } catch { }.
- Elegant error handling:
```ts
//you can do something like
const res = await execute(conf, {sql: "SELECT * FROM mad_cats;"});

if (res.isOk) {
    //now res.val is guaranteed by typescript [js users, sorry]
    console.log(res.val.rows); //the rows returned
    console.log(res.val.affected_row_count) //affected rows
    //...
} else {
    //now res.err is guaranteed by typescript
    console.log(res.err.message); //error message
    doSomething(res.err.code) //do something with the error code
    //...
}
```

## The `execute` Function
This function executes exactly one (1) SQL query.
### Type
```ts
async function execute(conf: libsqlConf, stmt: libsql_statement): Promise<Result<libsql_statement_result, libsql_error>>;
```

### Parameters
 1. `conf` of type `libsqlConf`
```ts
import { libsqlConf } from "libsql-stateless"; //for mjs
//or
{ libsqlConf } = require("libsql-stateless"); //for cjs

//sturucture of libsqlConf
{
    db_url: string,
    authToken?: string
}
```

2. `stmt` of type `libsql_statement`
```ts
import { libsql_statement, libsql_value } from "libsql-stateless"; //for mjs
//or
{ libsql_statement, libsql_value } = require("libsql-stateless"); //for cjs

//sturucture of libsql_statement
{
    "sql": string,
    "args"?: Array<libsql_value>,
    "named_args"?: Array<{
        "name": string,
        "value": libsql_value,
    }>,
    "want_rows"?: boolean,
}

//structure of libsql_value
{ "type": "null" } |
{ "type": "integer", "value": string } |
{ "type": "float", "value": number } |
{ "type": "text", "value": string } |
{ "type": "blob", "base64": string };
```

### Returns
This function returns a `Promise<Result<libsql_statement_result, libsql_error>>` therefore `await` is used before it to get `Result<libsql_statement_result, libsql_error>`.

`Result<T, R>` types have heen discussed above.

```ts
import { libsql_statement_result, libsql_error, libsql_column, libsql_value } from "libsql-stateless"; //for mjs
//or
{ libsql_statement_result, libsql_error, libsql_column, libsql_value } = require("libsql-stateless"); //for cjs

//structure of libsql_error
{
    "message": string;
    "code"?: string | null;
}

//structure of libsql_statement_result
{
    "cols": Array<libsql_column>,
    "rows": Array<Array<libsql_value>>,
    "affected_row_count": number, //uint32
    "last_insert_rowid": string | null,
}

//structure of libsql_column
{
    "name": string | null,
    "decltype": string | null,
}

//structure of libsql_value
{ "type": "null" } |
{ "type": "integer", "value": string } |
{ "type": "float", "value": number } |
{ "type": "text", "value": string } |
{ "type": "blob", "base64": string };
```

### Example
```ts
import { execute } from "libsql-stateless"; //for mjs
//or
{ execute } = require("libsql-stateless"); //for cjs

const res = await execute(conf, {sql: "SELECT * FROM mad_cats;"});
//or
const res = await execute(conf, {
    sql: "SELECT madness, power_level FROM mad_cats WHERE cat_id = ? AND owner_name = ?;",
    args: [
        {
            type: "integer",
            value: "89342"
        },
        {
            type: "text",
            value: "John Smith"
        }
    ]
});
//or
const res = await execute(conf, {
    sql: "INSERT INTO mad_cats VALUES (:cat_name, :power_level, :madness);", //In SQLite, the names of arguments include the prefix sign (:, @ or $).
    named_args: [
        {
            name: "cat_name",
            value: {
                type: "text",
                value: "Bgorthe, The Destroyer of Worlds"
            }
        },
        {
            name: "power_level",
            value: {
                type: "integer",
                value: "9105"
            }
        },
        {
            name: "madness",
            value: {
                type: "float",
                value: "32.5"
            }
        }
    ]
});
```

## The `executeBatch` Function
This function executes SQL queries in a batch.
### Type
```ts
async function executeBatch(conf: libsqlConf, batch_steps: Array<libsql_batch_statement_step>): Promise<Result<libsql_batch_statement_result, libsql_error>>;
```

### Parameters
 1. `conf` of type `libsqlConf`
```ts
import { libsqlConf } from "libsql-stateless"; //for mjs
//or
{ libsqlConf } = require("libsql-stateless"); //for cjs

//sturucture of libsqlConf
{
    db_url: string,
    authToken?: string
}
```

2. `batch_steps` of type `Array<libsql_batch_statement_step>`
```ts
import { libsql_batch_statement_step, libsql_batch_execution_condition, libsql_statement } from "libsql-stateless"; //for mjs
//or
{libsql_batch_statement_step } = require("libsql-stateless"); //for cjs

//sturucture of libsql_batch_statement_step
{
    "condition"?: libsql_batch_execution_condition | null;
    "stmt": libsql_statement;
}

//structure of libsql_batch_execution_condition
{ "type": "ok", "step": number } |//uint32
{ "type": "error", "step": number }  |//uint32
{ "type": "not", "cond": libsql_batch_execution_condition } |
{ "type": "and", "conds": Array<libsql_batch_execution_condition> } |
{ "type": "or", "conds": Array<libsql_batch_execution_condition> } |
{ "type": "is_autocommit" };

//sturucture of libsql_statement
{
    "sql": string,
    "args"?: Array<libsql_value>,
    "named_args"?: Array<{
        "name": string,
        "value": libsql_value,
    }>,
    "want_rows"?: boolean,
}
```

### Returns
This function returns a `Promise<Result<libsql_batch_statement_result, libsql_error>>` therefore `await` is used before it to get `Result<libsql_batch_statement_result, libsql_error>`.

`Result<T, R>` types have heen discussed above.

```ts
import { libsql_batch_statement_result, libsql_error, libsql_statement_result, libsql_column, libsql_value } from "libsql-stateless"; //for mjs
//or
{ libsql_batch_statement_result, libsql_error, libsql_statement_result, libsql_column, libsql_value } = require("libsql-stateless"); //for cjs

//structure of libsql_error
{
    "message": string;
    "code"?: string | null;
}

//structure of libsql_batch_statement_result
{
    "step_results": Array<libsql_statement_result | null>;
    "step_errors": Array<libsql_error | null>;
}

//structure of libsql_statement_result
{
    "cols": Array<libsql_column>,
    "rows": Array<Array<libsql_value>>,
    "affected_row_count": number, //uint32
    "last_insert_rowid": string | null,
}

//structure of libsql_column
{
    "name": string | null,
    "decltype": string | null,
}

//structure of libsql_value
{ "type": "null" } |
{ "type": "integer", "value": string } |
{ "type": "float", "value": number } |
{ "type": "text", "value": string } |
{ "type": "blob", "base64": string };
```

### Example
```ts
import { executeBatch } from "libsql-stateless"; //for mjs
//or
{ executeBatch } = require("libsql-stateless"); //for cjs

const res = await executeBatch(conf, [
    {stmt: {sql: "SELECT * FROM mad_cats;"}},
    {stmt: {
        sql: "SELECT madness, power_level FROM mad_cats WHERE cat_id = ? AND owner_name = ?;",
        args: [
            {
                type: "integer",
                value: "89342"
            },
            {
                type: "text",
                value: "John Smith"
            }
        ]
    }},
    {stmt: {
    sql: "INSERT INTO mad_cats VALUES (:cat_name, :power_level, :madness);", //In SQLite, the names of arguments include the prefix sign (:, @ or $).
    named_args: [
            {
                name: "cat_name",
                value: {
                    type: "text",
                    value: "Bgorthe, The Destroyer of Worlds"
                }
            },
            {
                name: "power_level",
                value: {
                    type: "integer",
                    value: "9105"
                }
            },
            {
                name: "madness",
                value: {
                    type: "float",
                    value: "32.5"
                }
            }
        ]
    }}
]);
//or
const res = await executeBatch(conf, [
    {stmt: {sql: "SELECT * FROM mad_cats;"}, condition: { "type": "is_autocommit" }}
]);
```
## The `serverCompatCheck` Function
This function checks if the `db_url`'s server supports `Hrana HTTP API v3`.
### Type
```ts
async function serverCompatCheck(db_url: string): Promise<Result<undefined, undefined>>;
```

### Parameters
 1. `db_url` of type `string`

### Returns
This function returns a `Promise<Result<undefined, undefined>>` therefore `await` is used before it to get `Result<undefined, undefined>`.

`Result<T, R>` types have heen discussed above.

### Example
```ts
import { serverCompatCheck } from "libsql-stateless"; //for mjs
//or
{ serverCompatCheck } = require("libsql-stateless"); //for cjs

const res = await serverCompatCheck(conf.db_url);
```

# Special Thanks
- The Voices in my Head