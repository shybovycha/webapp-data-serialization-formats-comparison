const avro = require('avsc/etc/browser/avsc-types');
const BSON = require('bson');
const CBOR = require('cbor-x');
const MessagePack = require('msgpackr');
const protobufFull = require('protobufjs');
const flatbuffers = require('flatbuffers');
const thrift = require('thrift');

const base64 = require('@protobufjs/base64');
// const utf8 = require('@protobufjs/utf8');

const LongType = avro.types.LongType.__with({
    fromBuffer: (buf) => buf.readBigInt64LE(),
    toBuffer: (n) => {
        const buf = Buffer.alloc(8);
        buf.writeBigInt64LE(BigInt(n));
        return buf;
    },
    fromJSON: Number,
    toJSON: Number,
    isValid: (n) => typeof n == 'number',
    compare: (n1, n2) => { return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1); }
});

const AvroType = avro.Type.forSchema({
    type: 'record',
    name: 'TimeframeResource',
    fields: [
        {
            name: 'dataPoints',
            type: {
                type: 'array',
                items: {
                    type: 'record',
                    name: 'DataPoint',
                    fields: [
                        {
                            name: 'timestamp',
                            type: 'long',
                        },

                        {
                            name: 'values',
                            type: {
                                type: 'record',
                                name: 'TimeframeValues',
                                fields: [
                                    {
                                        name: 'category1',
                                        type: 'double',
                                    },

                                    {
                                        name: 'category2',
                                        type: 'double',
                                    },

                                    {
                                        name: 'category3',
                                        type: 'double',
                                    },
                                ],
                            },
                        },
                    ],
                },
                default: [],
            },
        },
    ],
},
{
    registry: { 'long': LongType }
});

const ProtobufProto = `syntax = "proto3";

package testpackage;

message TimeframeValues {
    double category1 = 1;
    double category2 = 2;
    double category3 = 3;
}

message Timeframe {
    int64 timestamp = 1;
    TimeframeValues values = 2;
}

message TimeframeData {
    repeated Timeframe dataPoints = 1;
}
`;

const ProtobufType = protobufFull.parse(ProtobufProto).root.lookupType('testpackage.TimeframeData');

const ProtobufCompiledType = require('./test5-protobuf-compiled-proto').testpackage.TimeframeData;

const FlatbuffersTimeframeData = require('./test5-flatbuffers-compiled-proto/testpackage/timeframe-data');
const FlatbuffersTimeframe = require('./test5-flatbuffers-compiled-proto/testpackage/timeframe');
const FlatbuffersTimeframeValues = require('./test5-flatbuffers-compiled-proto/testpackage/timeframe-values');

const ThriftType = require('./test5-thrift-compiled-proto');

const data = {
    dataPoints: [...Array(1000)].map((_, idx) => ({
        timestamp: new Date().getTime(),
        values: {
            category1: (Math.random() * 120) - (Math.random() * 50),
            category2: (Math.random() * 150) - (Math.random() * 125),
            category3: (Math.random() * 50) - (Math.random() * 75),
        },
    }))
};

const benchmark = (fn) => {
    const start = new Date().getTime();

    const result = fn();

    const end = new Date().getTime();

    const duration = end - start;

    return { result, duration };
};

const Serializers = [
    { name: 'Avro', encode: (data) => AvroType.toBuffer(data), decode: (data) => AvroType.fromBuffer(data) },
    { name: 'BSON', encode: (data) => BSON.serialize(data), decode: (data) => BSON.deserialize(data) },
    { name: 'CBOR', encode: (data) => CBOR.encode(data), decode: (data) => CBOR.decode(data) },
    { name: 'MessagePack', encode: (data) => MessagePack.pack(data), decode: (data) => MessagePack.unpack(data) },
    { name: 'Protobuf', encode: (data) => ProtobufType.encode(data).finish(), decode: (data) => ProtobufType.decode(data) },
    { name: 'Protobuf, compiled', encode: (data) => ProtobufCompiledType.encode(data).finish(), decode: (data) => ProtobufCompiledType.decode(data) },
    {
        name: 'Flatbuffers',
        encode: ({ dataPoints }) => {
            const builder = new flatbuffers.Builder(0);

            const tfs = dataPoints.map(({ timestamp, values: { category1, category2, category3 } }) => {
                const vs = FlatbuffersTimeframeValues.TimeframeValues.createTimeframeValues(builder, category1, category2, category3);

                FlatbuffersTimeframe.Timeframe.startTimeframe(builder);

                    FlatbuffersTimeframe.Timeframe.addTimestamp(builder, timestamp);
                    FlatbuffersTimeframe.Timeframe.addValues(builder, vs);

                return FlatbuffersTimeframe.Timeframe.endTimeframe(builder);
            });

            const dps = FlatbuffersTimeframeData.TimeframeData.createDataPointsVector(builder, tfs);

            FlatbuffersTimeframeData.TimeframeData.startTimeframeData(builder);
            FlatbuffersTimeframeData.TimeframeData.addDataPoints(builder, dps);
            const offset = FlatbuffersTimeframeData.TimeframeData.endTimeframeData(builder);

            builder.finish(offset);

            return builder.asUint8Array();
        },
        decode: (data) => {
            const buf = new flatbuffers.ByteBuffer(data);

            const timeframeData = FlatbuffersTimeframeData.TimeframeData.getRootAsTimeframeData(buf);

            const dataPoints = [...Array(timeframeData.dataPointsLength())].map((_, idx) => {
                const dataPoint = timeframeData.dataPoints(idx);

                const timestamp = dataPoint.timestamp();

                const category1 = dataPoint.values().category1();
                const category2 = dataPoint.values().category2();
                const category3 = dataPoint.values().category3();

                return {
                    timestamp,
                    values: {
                        category1,
                        category2,
                        category3,
                    },
                };
            });

            return { dataPoints };
        },
    },
    {
        name: 'Thrift (binary)',
        encode: (data) => {
            let thriftBuffer = null;

            const thriftTransport = new thrift.TBufferedTransport(null, res => thriftBuffer = res);
            const binaryThriftProtocol = new thrift.TBinaryProtocol(thriftTransport);

            const dataPoints = data.dataPoints.map(dp => {
                const vs = new ThriftType.TimeframeValues(dp.values);

                return new ThriftType.Timeframe({ timestamp: dp.timestamp, values: vs });
            });

            const obj = new ThriftType.TimeframeData({ dataPoints });

            obj.write(binaryThriftProtocol);

            binaryThriftProtocol.flush();

            return thriftBuffer;
        },
        decode: (data) => {
            let obj = null;

            const tr = thrift.TBufferedTransport.receiver(transport => {
                const protocol = new thrift.TBinaryProtocol(transport);

                obj = ThriftType.TimeframeData.read(protocol);
            });

            tr(Buffer.from(data));

            return obj;
        },
    },
    {
        name: 'Thrift (compact)',
        encode: (data) => {
            let thriftBuffer = null;

            const thriftTransport = new thrift.TBufferedTransport(null, res => thriftBuffer = res);
            // const binaryThriftProtocol = new thrift.TBinaryProtocol(thriftTransport);
            const binaryThriftProtocol = new thrift.TCompactProtocol(thriftTransport);

            const dataPoints = data.dataPoints.map(dp => {
                const vs = new ThriftType.TimeframeValues(dp.values);

                return new ThriftType.Timeframe({ timestamp: dp.timestamp, values: vs });
            });

            const obj = new ThriftType.TimeframeData({ dataPoints });

            obj.write(binaryThriftProtocol);

            binaryThriftProtocol.flush();

            return thriftBuffer;
        },
        decode: (data) => {
            let obj = null;

            const tr = thrift.TBufferedTransport.receiver(transport => {
                const protocol = new thrift.TCompactProtocol(transport);

                obj = ThriftType.TimeframeData.read(protocol);
            });

            tr(Buffer.from(data));

            return obj;
        },
    },
];

Serializers.forEach(({ name, encode, decode }) => {
    const { result: buf, duration: encodingDuration } = benchmark(() => encode(data));

    const { result: source, duration: decodingDuration } = benchmark(() => decode(buf));

    console.log('deserialized with', name, source);

    // utf8.read(buf, 0, buf.length);

    document.querySelector('#timings').innerHTML += `
        <tr>
            <td>${name}</td>
            <td>${encodingDuration}ms</td>
            <td>${decodingDuration}ms</td>
            <td>${buf.length}</td>
            <td>${((1 - (buf.length / JSON.stringify(data).length)) * 100.0).toFixed(2)}%</td>
            <td>${base64.encode(buf, 0, buf.length).length}</td>
        </tr>`;
});
