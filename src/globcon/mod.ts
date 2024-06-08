import { LibsqlError } from "../errors.js";
import { libsqlServerCompatCheck } from "../functions.js";
import type { libsqlConfig } from "../types.js";
import { _hadConsoleError, _hasFetch, _hasURL, _newURL, _setFetch, _useConsoleError, _hasGlobalThis } from "./utils.js";

export function ensure_fetch(conf: libsqlConfig) {
    if (!_hasFetch && !!conf.fetch && _hasGlobalThis) {
        _setFetch(conf.fetch)
    } else throw new LibsqlError("No global fetch. Please provide one.", "NO_GLOBAL_FETCH");

    try {
        const res = libsqlServerCompatCheck(conf);
        if (!res) throw new LibsqlError("Server incompatible. Please upgrade your libSQL server.", "OUT_OF_DATE_SERVER");
    } catch {
        throw new LibsqlError("The fetch function is non functional.", "FETCH_FUCKED");
    }
}

export function conserror(str: string) {
    if (_hadConsoleError) _useConsoleError(str);
}

export function checkHttpUrl(url: string) {
    const is_bad: boolean = (() => {
        if (_hasURL) {
            try {
                const _url = _newURL(url);
                if (
                    _url.protocol === 'https:' ||
                    _url.protocol === 'http:'
                ) return false;
                return true;
            } catch (e) {
                throw new LibsqlError((e as Error).message, "ERR_INVALID_URL", (e as Error));
            }
        } else if (
            url.startsWith('https://') ||
            url.startsWith('http://')
        ) return false;
        return true;
    })();

    if (is_bad) throw new LibsqlError(
        'This is a HTTP client and only supports "https:" and "http:" URLs.',
        "URL_SCHEME_NOT_SUPPORTED",
    );
}