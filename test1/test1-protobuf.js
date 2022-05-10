const protobuf = require('protobufjs');

const path = require('path');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

protobuf.load(path.join(path.dirname(__filename), 'test1.proto'))
    .then(root => {
        const Pet = root.lookupType('testpackage.Pet');
        const buf = Pet.encode({ kind: 2, name: 'Albert' }).finish();

        console.log('> pre-utf8:', buf);
        console.log('> post-utf8:', utf8.read(buf, 0, buf.length));
        console.log('> base-64:', base64.encode(buf, 0, buf.length));
    });
