import { rawValue } from "../src/commons";

(() => {
    let a: Record<string, rawValue> = {
        1: "aa",
        null: "bb",
        ll: 1
    }
    let b: Array<string> = ["ll"]
    console.log(typeof(a.length));
    console.log(typeof(b.length));
    for (const m in a) {
        console.log(m+" "+a[m]);
    }
})();