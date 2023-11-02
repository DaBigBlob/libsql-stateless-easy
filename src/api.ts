//values
export type _Value = _Text|_Integer|_Integer|_Real|_Blob|_Null;
export type _Text = string; //a UTF-8 encoded string
export type _Integer = number; //a 64-bit signed integer
export type _Real = number; //a 64-bits floating number
export type _Blob = string; //some binary data, encoded in base64
export type _Null = null; //the null value


export type _Query = string | ParamQuery;
type ParamQuery = { q: string, params: Record<string, _Value> | Array<_Value> }



export type _BatchResponse = {
    results: {
        columns: Array<string>,
        rows: Array<Array<_Value>>,
    }
}


export type _ErrorResponse = {
    error: string
}