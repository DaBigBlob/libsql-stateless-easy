import { libsqlExecute } from "../src/main";
import { skjdgfksg } from "./conf";

(async () => {
    const res4 = await libsqlExecute(
        skjdgfksg,
        "analyze;"
    );
    console.log(res4);
})();