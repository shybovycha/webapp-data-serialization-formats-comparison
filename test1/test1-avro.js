const avro = require('avsc');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

const type = avro.Type.forSchema({
    type: 'record',
    name: 'Pet',
    fields: [
        {
            name: 'kind',
            type: {
                type: 'enum',
                name: 'PetKind',
                symbols: ['CAT', 'DOG']
            }
        },
        {
            name: 'name',
            type: 'string'
        }
    ]
});

const buf = type.toBuffer({ kind: 'CAT', name: 'Albert' });

console.log('> pre-utf8:', buf);
console.log('> post-utf8:', utf8.read(buf, 0, buf.length));
console.log('> base-64:', base64.encode(buf, 0, buf.length));
