const BSON = require('bson');
const CBOR = require('cbor-x');
const MessagePack = require('msgpackr');

const avro = require('avsc');
const protobuf = require('protobufjs');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

const path = require('path');

const AvroType = avro.Type.forSchema({
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

const ProtobufType = protobuf.load(path.join(path.dirname(__filename), 'test1.proto'))
    .then(root => root.lookupType('testpackage.Pet'));

const CBOREncode = (data) => {
    return CBOR.encode(data);
};

const CBORDecode = (data) => {
    return CBOR.decode(data);
};

const BSONEncode = (data) => {
    return BSON.serialize(data);
};

const BSONDecode = (data) => {
    return BSON.deserialize(data);
};

const MessagePackEncode = (data) => {
    return MessagePack.pack(data);
};

const MessagePackDecode = (data) => {
    return MessagePack.unpack(data);
};

const AvroEncode = (data) => {
    return AvroType.toBuffer(data);
};

const AvroDecode = (data) => {
    return AvroType.fromBuffer(data);
};

const ProtobufEncode = (Pet) => (data) => {
    return Pet.encode(data).finish();
};

const ProtobufDecode = (Pet) => (data) => {
    return Pet.decode(data);
};

const Serializers = [
    Promise.resolve([ 'CBOR', CBOREncode, CBORDecode ]),

    Promise.resolve([ 'BSON', BSONEncode, BSONDecode ]),

    Promise.resolve([ 'MessagePack', MessagePackEncode, MessagePackDecode ]),

    Promise.resolve([ 'Avro', AvroEncode, AvroDecode ]),

    ProtobufType.then(Pet => [ 'Protobuf', ProtobufEncode(Pet), ProtobufDecode(Pet) ]),
];

Promise.all(Serializers)
    .then(serializers => {
        serializers.forEach(([ serializerName, encodeFn, decodeFn ]) => {
            console.time(`${serializerName}-encode`);

            const buf = encodeFn({ name: 'Rodrigo', kind: 'DOG' });

            console.timeEnd(`${serializerName}-encode`);

            console.time(`${serializerName}-decode`);

            const source = decodeFn(buf);

            console.timeEnd(`${serializerName}-decode`);

            const utf8Buf = utf8.read(buf, 0, buf.length);
            const base64Buf = base64.encode(buf, 0, buf.length);

            console.log(`[${serializerName}]> pre-utf8 (${buf.length}):`, buf);
            console.log(`[${serializerName}]> post-utf8 (${utf8Buf.length}):`, utf8Buf);
            console.log(`[${serializerName}]> base-64 (${base64Buf.length}):`, base64Buf);
            console.log(`[${serializerName}]> decoded:`, source);
        });
    });
