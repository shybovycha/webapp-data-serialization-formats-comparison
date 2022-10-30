const base64 = require('@protobufjs/base64');
const utf8 = require('@protobufjs/utf8');

const thrift = require('thrift');

const ThriftType = require('./test5-thrift-compiled-proto');

const encode = (data) => {
    let thriftBuffer = null;

    const thriftTransport = new thrift.TBufferedTransport(null, res => thriftBuffer = res);
    const compactThriftProtocol = new thrift.TCompactProtocol(thriftTransport);

    const dataPoints = data.dataPoints.map(dp => {
        const vs = new ThriftType.TimeframeValues(dp.values);

        return new ThriftType.Timeframe({ timestamp: dp.timestamp, values: vs });
    });

    const obj = new ThriftType.TimeframeData({ dataPoints });

    obj.write(compactThriftProtocol);

    compactThriftProtocol.flush();

    return thriftBuffer;
};

const decode = (data) => {
    let obj = null;

    const tr = thrift.TBufferedTransport.receiver(transport => {
        const protocol = new thrift.TCompactProtocol(transport);

        obj = ThriftType.TimeframeData.read(protocol);
    });

    tr(Buffer.from(data));

    return obj;
};

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

const buf = encode(data);
const obj = decode(buf);

console.log('> pre-utf8:', buf);
console.log('> post-utf8:', utf8.read(buf, 0, buf.length));
console.log('> base-64:', base64.encode(buf, 0, buf.length));
console.log('> decoded:', obj);
