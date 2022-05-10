const { unpack, pack } = require('msgpackr');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

const buf = pack({ kind: 'CAT', name: 'Albert' });

console.log('> pre-utf8:', buf);
console.log('> post-utf8:', utf8.read(buf, 0, buf.length));
console.log('> base-64:', base64.encode(buf, 0, buf.length));
