# libsql-http-stateless

> libSQL http driver for TypeScript and JavaScript running with Web API.

- This is built for edge-functions that quickly spin up, do stuff, and die.
- No bullshit classes and nonsense computation to figure out protocol type and shit.
- Separate and small functions so you're not importing stuff you're not using.
- Is very small package (85 lines of code) and uses very little memory.
- Runs extremely fast on Cloudflare Workers, Vercel Edge Funcrions, etc.
- Works with any libsql server. (eg: Turso, self-hosted, etc.)

## Installation

```bash
$ npm i libsql-http-stateless
# OR
$ bun add libsql-http-stateless
```

## Usage

```ts
import {execute, executeBatch, checkServerCompat} from 'libsql-http-stateless'; //mjs
//or
{execute, executeBatch, checkServerCompat} = require('libsql-http-stateless'); //for cjs

//remember to use the following in async functions only (because await)
const res1 = await execute(
    {
        url: "https://the-pink-mad-man.turso.io", //DB url (http:// or https:// only)
        authToken: "skdfkvskdjvfcsjdvc.bd2y309rehwfg" //auth token
    },
    "SELECT * FROM chicken_yum_yum;"
);

const res2 = await execute(
    {
        url: "https://the-pink-mad-man.turso.io", //DB url (http:// or https:// only)
        authToken: "skdfkvskdjvfcsjdvc.bd2y309rehwfg"
    },
    {
        q: "SELECT * FROM chicken_yum_yum WHERE owner = ?",
        params: ["the_pink_man"]
    }
);

//execute return either
{
    isOk: true,
    val: {
        results: {
            columns: Array<string>, //the names of your columns
            rows: Array<Array<_Value>>, //values
        }
    }
}
//or
{
    isOk: false,
    err: string //reason for failure
}

const res3 = await executeBatch(
    {
        url: "https://the-pink-mad-man.turso.io", //DB url (http:// or https:// only)
        authToken: "skdfkvskdjvfcsjdvc.bd2y309rehwfg"
    },
    [
        {
            q: "SELECT * FROM chicken_yum_yum WHERE owner = ?",
            params: ["the_pink_man"]
        },
        {
            q: "SELECT * FROM chicken_yum_yum WHERE dead = ?",
            params: ["yes"]
        },
        "SELECT * FROM chicken_yum_yum;",
        //keep on going
    ]
);

//executeBatch return either
{
    isOk: true,
    val: Array<{ //an array of results cause you made an array or query
        results: {
            columns: Array<string>,
            rows: Array<Array<_Value>>,
        }
    }>
}
//or
{
    isOk: false,
    err: string //reason for failure
}
```

Because `isOk` boolean field is always gaurenteed, you can you something like:

```ts
if (res.isOk) {
    //do something with res.val
} else {
    //do somthing with res.err
}
```

### Other Helper Functions

```ts
import {extractBatchQueryResultRows, extractQueryResultRows, checkServerCompat} from 'libsql-http-stateless'; //mjs
//or
{extractBatchQueryResultRows, extractQueryResultRows, checkServerCompat} = require('libsql-http-stateless'); //for cjs

//you might've noticed that res.val is often pretty cluttered with redundant stuff.
//this is because of libsql's http api v0's schema, and executeBatch and execute doing exactly as much as fetching the data.
//this is on purpose. it is to give you the flexibility of being able to choose exactly what post-processing is done to your data.
//for this purpose, we also provide helper functions to clean thre res.val's up if you want
const res1 = await executeBatch(
    //stuff
);
if (res1.isOk) {
    const abc = extractBatchQueryResultRows(res);
    //returns:
    Array<Array<Array<Values>>>
  //  ^     ^   ^^^^^^^^^^^^
  //  |     |      just a row
  //  |  array or rows (for 1 query)
  // array of that (multiple query)
}

const res2 = await execute(
    //stuff
);
if (res2.isOk) {
    const abc = extractQueryResultRows(res);
    //returns:
    Array<Array<Values>>
  //  ^   ^^^^^^^^^^^^
  //  |      just a row
  //array or rows (for 1 query)
}
```

### Checking Server Compatiblity

```ts
import {checkServerCompat} from 'libsql-http-stateless'; //mjs
//or
{checkServerCompat} = require('libsql-http-stateless'); //for cjs

//remember to use the following in async functions only (because await)
const res = await checkServerCompat("https://the-pink-mad-man.turso.io");//DB url (http:// or https:// only)
//returns:
{
    isOk: true
}
//or
{
    isOk: false
}
//so again you can just use:
if (res.isOk) {
    //do something
} else {
    //do something
}
```

### Other Goodies

```ts
import {sqlite_text, sqlite_integer, sqlite_real, sqlite_blob, sqlite_null, sqlite_value, sqlite_query} from 'libsql-http-stateless'; //mjs
//or
{sqlite_text, sqlite_integer, sqlite_real, sqlite_blob, sqlite_null, sqlite_value, sqlite_query} = require('libsql-http-stateless'); //for cjs

// sqlite_text, sqlite_integer, sqlite_real, sqlite_blob and sqlite_null are the 5 datatypes supported by sqlite
// sqlite_value is the type union of the above datatypes
// sqlite_query is the query (the sql stuff you write) type for this library

//thsese are implemented as:
export type sqlite_value = sqlite_text|sqlite_integer|sqlite_integer|sqlite_real|sqlite_blob|sqlite_null;
export type sqlite_text = string; //a UTF-8 encoded string
export type sqlite_integer = number; //a 64-bit signed integer
export type sqlite_real = number; //a 64-bits floating number
export type sqlite_blob = string; //some binary data, encoded in base64
export type sqlite_null = null; //the null value

export type sqlite_query = string | { q: string, params: Record<string, sqlite_value> | Array<sqlite_value> };
```