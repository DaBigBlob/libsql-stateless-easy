import { _hasBuffer, _useBufferU8a, _useBufferBin, _useBufferStr, _hadBtoa, _hadAtob, _useAtob, _useBufferAsc } from './utils.js';

const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = Array.prototype.slice.call(b64ch);
const b64tab = ((a) => {
    let tab: any = {};
    a.forEach((c, i) => tab[c] = i);
    return tab;
})(b64chs);
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

const btoaPolyfill = (bin: string) => {
    // console.log('polyfilled');
    let u32, c0, c1, c2, asc = '';
    const pad = bin.length % 3;
    for (let i = 0; i < bin.length;) {
        if ((c0 = bin.charCodeAt(i++)) > 255 ||
            (c1 = bin.charCodeAt(i++)) > 255 ||
            (c2 = bin.charCodeAt(i++)) > 255)
            throw new TypeError('invalid character found');
        u32 = (c0 << 16) | (c1 << 8) | c2;
        asc += b64chs[u32 >> 18 & 63]
            + b64chs[u32 >> 12 & 63]
            + b64chs[u32 >> 6 & 63]
            + b64chs[u32 & 63];
    }
    return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};

const _btoa = _hadBtoa
    ? (bin: string) => btoa(bin)
    : _hasBuffer
        ? (bin: string) => _useBufferBin(bin)
        : btoaPolyfill
;

const _mkUriSafe = (src: string) => src.replace(/=/g, '').replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_');

const _fromUint8Array = _hasBuffer
    ? (u8a: Uint8Array) => _useBufferU8a(u8a) as string
    : (u8a: Uint8Array) => {
        // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
        const maxargs = 0x1000;
        let strs: string[] = [];
        for (let i = 0, l = u8a.length; i < l; i += maxargs) {
            let _numarr: number[] = [];
            u8a.subarray(i, i + maxargs).forEach(u => _numarr.push(u.valueOf()));
            strs.push(_fromCC.apply(null, 
                _numarr
            ));
        }
        return _btoa(strs.join(''));
    }
;

const _fromCC = String.fromCharCode.bind(String);

export const fromUint8Array = (u8a: Uint8Array, urlsafe: boolean = false): string => urlsafe
    ? _mkUriSafe(_fromUint8Array(u8a))
    : _fromUint8Array(u8a)
;

const _tidyB64 = (s: string) => s.replace(/[^A-Za-z0-9\+\/]/g, '');

const atobPolyfill = (asc: string) => {
    // console.log('polyfilled');
    asc = asc.replace(/\s+/g, '');
    if (!b64re.test(asc)) throw new TypeError('malformed base64.');
    asc += '=='.slice(2 - (asc.length & 3));
    let u24, bin = '', r1, r2;
    for (let i = 0; i < asc.length;) {
        u24 = b64tab[asc.charAt(i++)] << 18
            | b64tab[asc.charAt(i++)] << 12
            | (r1 = b64tab[asc.charAt(i++)]) << 6
            | (r2 = b64tab[asc.charAt(i++)]);
        bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)
            : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)
                : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
    }
    return bin;
};

const _atob = _hadAtob
    ? (asc: string) => _useAtob(_tidyB64(asc))
    : _hasBuffer
        ? (asc: string) => _useBufferAsc(asc)
        : atobPolyfill
;

const _U8Afrom = typeof Uint8Array.from === 'function'
    ? Uint8Array.from.bind(Uint8Array)
    : (it: any) => new Uint8Array(Array.prototype.slice.call(it, 0));

const _toUint8Array = _hasBuffer
    ? (a: string) => _U8Afrom(_useBufferStr(a))
    : (a: string) => _U8Afrom(_atob(a).split('').map((c: string) => c.charCodeAt(0)))
;

const _unURI = (a: string) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));

export const toUint8Array = (a: string): Uint8Array => _toUint8Array(_unURI(a));

/**
 * To prevent supply chain attack, copied from https://github.com/dankogai/js-base64
 * at 1713503973017 unix epoch miliseconds.
 * 
 *  == LICENSE BEGIN ==
 * Copyright (c) 2014, Dan Kogai
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * 
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * 
 * * Neither the name of js-base64 nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *  == LICENSE END ==
 */