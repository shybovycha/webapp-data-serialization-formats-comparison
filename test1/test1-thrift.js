const fs = require('fs');
const path = require('path');

const { Thrift } = require('thriftrw');
const bufrw = require('bufrw');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

const source = fs.readFileSync(path.join(__dirname, 'test1.thrift'), 'utf-8');

const { Pet } = new Thrift({
    source: source,
    strict: true,
    allowOptionalArguments: true,
    defaultAsUndefined: false
});

const buf = bufrw.toBuffer(Pet, new Pet({ kind: 'CAT', name: 'Albert' }));

console.log('> pre-utf8:', buf);
console.log('> post-utf8:', utf8.read(buf, 0, buf.length));
console.log('> base-64:', base64.encode(buf, 0, buf.length));

/*
TypeError: rw.byteLength is not a function
    at toBufferResult (node_modules\bufrw\interface.js:133:21)
    at Object.toBuffer (node_modules\bufrw\interface.js:65:12)
*/
