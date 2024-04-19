export const _hasBuffer = typeof Buffer === 'function';
export const _hadBtoa = typeof btoa === 'function';
export const _hadAtob = typeof atob === 'function'

export const _useAtob = (str) => atob(str);
export const _useBufferU8a = (u8a) => Buffer.from(u8a).toString('base64');
export const _useBufferBin = (bin) => Buffer.from(bin, 'binary').toString('base64');
export const _useBufferStr = (a) => Buffer.from(a, 'base64');
export const _useBufferAsc = (asc) => Buffer.from(asc, 'base64').toString('binary');