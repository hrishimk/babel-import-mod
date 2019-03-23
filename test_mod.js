import 'test_mod2.js';

export function log(msg) {
    console.log(msg);
    log2();
}