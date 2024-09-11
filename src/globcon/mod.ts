import { LibsqlError } from "../errors.js";
import { libsqlServerCompatCheck } from "../functions.js";
import type { libsqlConfig } from "../commons.js";
import { _hasConsoleError, _hasURL, _newURL, _useConsoleError } from "./utils.js";

export function ensure_fetch(conf: libsqlConfig) {
    try {
        const res = libsqlServerCompatCheck(conf);
        if (!res) throw new LibsqlError("Server incompatible. Please upgrade your libSQL server.", "OUT_OF_DATE_SERVER");
    } catch {
        throw new LibsqlError("The fetch function is non functional.", "FETCH_FUCKED");
    }
}

export function conserror(str: string) {
    if (_hasConsoleError) _useConsoleError(str);
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
                throw new LibsqlError((e as Error).message, "ERR_INVALID_URL", undefined, (e as Error));
            }
        } else if (
            url.startsWith('https://') ||
            url.startsWith('http://')
        ) return false;
        return true;
    })();

    if (is_bad) throw new LibsqlError(
        'This is a HTTP client and only supports "https:" and "http:" URLs. For modern libsql DBs simply changing "libsql://" to "https://" should resolve this.',
        "URL_SCHEME_NOT_SUPPORTED",
    );
}

export function checkRedundantConfig(conf: libsqlConfig) {
    if (conf.encryptionKey) conserror("'encryptionKey' config unsupported.");
    if (conf.syncUrl) conserror("'syncUrl' config unsupported because 'url' is the remote url. (embedded replicas unsupported)");
    if (conf.syncInterval) conserror("'syncInterval' config unsupported because nothing to sync. (embedded replicas unsupported)");
    if (conf.tls) conserror("'tls' config unsupported. Change url scheme to 'http' for no tls and 'https' for tls.");
    if (conf.concurrency) conserror("'concurrency' config unsupported. You may use a custom fetch to specify concurrency.");
}