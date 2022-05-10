const avro = require('avsc');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

const type = avro.Type.forSchema({
    type: 'record',
    name: 'StringIdsResource',
    fields: [
        {
            name: 'ids',
            type: {
                type: 'array',
                items: 'string',
                default: []
            }
        }
    ]
});

const buf = type.toBuffer({ ids: [ 'partner1-001', 'partner2-001', 'partner1-104201', 'partner2-003' ] });

console.log('> pre-utf8:', buf);
console.log('> post-utf8:', utf8.read(buf, 0, buf.length));
console.log('> base-64:', base64.encode(buf, 0, buf.length));
