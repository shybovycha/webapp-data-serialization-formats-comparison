const { decode, encode } = require('cbor-x');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

const buf = encode({ ids: [ 'partner1-001', 'partner2-001', 'partner1-104201', 'partner2-003' ] });

console.log('> pre-utf8:', buf);
console.log('> post-utf8:', utf8.read(buf, 0, buf.length));
console.log('> base-64:', base64.encode(buf, 0, buf.length));
