const protobuf = require('protobufjs');

const path = require('path');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

protobuf.load(path.join(path.dirname(__filename), 'test2.proto'))
    .then(root => {
        const Pet = root.lookupType('testpackage.StringIdsResource');
        const buf = Pet.encode({ ids: [ 'partner1-001', 'partner2-001', 'partner1-104201', 'partner2-003' ] }).finish();

        console.log('> pre-utf8:', buf);
        console.log('> post-utf8:', utf8.read(buf, 0, buf.length));
        console.log('> base-64:', base64.encode(buf, 0, buf.length));
    });
