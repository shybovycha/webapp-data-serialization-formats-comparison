# Webapp data serialization formats comparison

This repo contains few tests for different data serialization formats comparison.

The formats are:

* [BSON](https://www.mongodb.com/json-and-bson)
* [CBOR](https://cbor.io/)
* [MessagePack](https://msgpack.org/)
* [Protobuf](https://developers.google.com/protocol-buffers/)
* [Thrift](https://github.com/apache/thrift)
* [Avro](https://github.com/apache/avro)
* [Cap'n'Proto](https://capnproto.org/)
* [FlatBuffers](https://github.com/google/flatbuffers)

## Structure

There are 5 tests total in the repo, for different types of data:

1. simple object (`{ name: 'Rodrigo', kind: 'DOG' }`) serialization / deserialization, mainly trying out an API of each tool; checking how enum type works in each tool
2. an object with a list of strings `{ ids: [ 'partner1-001', 'partner2-001', 'partner1-104201', 'partner2-003' ] }`
3. an object with a list of ints `{ ids: [ 1023001, 1024621, 32775, 78109 ] }`
4. a nested object with various data types (float, DateTime) `{"timestamp":new Date("2022-05-05T21:11:22+10:00").getTime(),"values":{"category1":-5.207119058209394,"category2":89.29685288758918,"category3":35.90829865270196}}`
5. same as previous, but a pack of `1000` objects

For the most part, you are fine checking out the `index.js` file within each directory.

The last test, though, generates the HTML which is to be used in browser to also measure the serialization / deserialization performance.
