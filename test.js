const babel = require('@babel/core');
const plugin = require('./index.js');
const fs = require('fs');

let file_name = './test_cont.js';

let content = fs.readFileSync(file_name, 'utf-8');

let a = babel.transform(content, {
    plugins: [plugin],
    filename: file_name
});

console.log(a.code);