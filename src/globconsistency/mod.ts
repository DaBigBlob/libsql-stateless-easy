import { LibsqlError } from "../errors.js";
import { _hasFetch, _hasURL, _newURL, _useConsoleError } from "./utils.js";

export function ensure_fetch(custom_fetch?: Function) {
    if (_hasFetch) return;
    if (!!custom_fetch) {
        // @ts-ignore
        globalThis.fetch = custom_fetch;
        return;
    }
    throw new LibsqlError("No global fetch. Please provide one.", "NO_GLOBAL_FETCH");
}

export function conserror(str: string): void {
    return _useConsoleError(str);
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