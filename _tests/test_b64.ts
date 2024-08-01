import { fromUint8Array, toUint8Array } from '../src/base64/mod.js';
import { Base64 } from 'js-base64';

const teststr = "I need to write my resume. \n\nT-T";

(() => {
    const a = toUint8Array(teststr);
    const b = Base64.toUint8Array(teststr);
    if (fromUint8Array(a) == Base64.fromUint8Array(b)) console.log("[GOOD] same encode");
    else console.log("[BAD] encode: we fucked up");

    const ra = fromUint8Array(a);
    const rb = Base64.fromUint8Array(b);
    if (fromUint8Array(a) == Base64.fromUint8Array(b)) console.log("[GOOD] same decode");
    else console.log("[BAD] decode: we fucked up");

})();