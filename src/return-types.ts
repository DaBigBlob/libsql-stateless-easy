type Ok<T> = { isOk: true, val: T};

type Err<E> = { isOk: false, err: E};

export type Result<T, E> = Ok<T>|Err<E>;

export function Ok<T>(val: T): Ok<T> {
    return { isOk: true, val};
}

export function Err<E>(err: E): Err<E> {
    return { isOk: false, err};
}

export function getVal<T, E>(result: Result<T, E>) {
    if (result.isOk) return result.val;
    return null;
}

export function getErr<T, E>(result: Result<T, E>) {
    if (!result.isOk) return result.err;
    return null;
}