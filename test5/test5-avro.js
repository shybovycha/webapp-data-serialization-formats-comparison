const avro = require('avsc/etc/browser/avsc-types');

const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

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

const data = {
    dataPoints: [
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":-5.207119058209394,"category2":89.29685288758918,"category3":35.90829865270196}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":-43.35796609790218,"category2":21.846789565420153,"category3":124.58032201029741}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":13.762280721625489,"category2":-54.9001273679146,"category3":27.56539533070083}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":-27.035420499346376,"category2":-16.77792009600627,"category3":141.57795320626502}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":-2.72886911249212,"category2":-77.66332474452238,"category3":120.72722548749616}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":-17.359503714569467,"category2":85.43730013834735,"category3":87.47145798490703}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":67.18537717475347,"category2":14.27178735869062,"category3":10.937081106678992}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":62.521418975576594,"category2":-37.90002885705385,"category3":136.84480193385588}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":72.41404489510843,"category2":42.0994754557149,"category3":176.20460079069173}},
        {"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":20.314335440787378,"category2":121.8667690614612,"category3":160.49973577549778}}
    ],
};

const benchmark = (fn) => {
    const start = new Date().getTime();

    const result = fn();

    const end = new Date().getTime();

    const duration = end - start;

    return { result, duration };
};

const { result: buf, duration: encodingDuration } = benchmark(() => AvroType.toBuffer(data));

const { result: source, duration: decodingDuration } = benchmark(() => AvroType.fromBuffer(buf));

document.querySelector('#timings').innerHTML = `<p><b>encoding:</b>${encodingDuration}ms</p><p><b>decoding:</b>${decodingDuration}ms</p>`;
