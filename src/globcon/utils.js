export const _hadConsoleError = typeof console.error === 'function';
export const _hasURL = typeof URL === 'function';

export const _useConsoleError = (str) => console.error(str);
export const _newURL = (str) => new URL(str);