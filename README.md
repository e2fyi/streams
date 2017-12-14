@e2fyi/streams
======================
[![GitHub release](https://img.shields.io/github/release/e2fyi/streams.svg)](https://github.com/e2fyi/streams/releases)
[![Build Status](https://travis-ci.org/e2fyi/streams.svg?branch=master)](https://travis-ci.org/e2fyi/streams)
[![Coverage Status](https://coveralls.io/repos/github/e2fyi/streams/badge.svg?branch=master)](https://coveralls.io/github/e2fyi/streams?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/e2fyi/streams/badge.svg)](https://snyk.io/test/github/e2fyi/streams)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This NodeJS library provides custom [NodeJS streams](https://nodejs.org/api/stream.html)
for specific use cases.

Currently, the following streams are available:

- [`DocumentTagger`](#module_@e2fyi/streams.DocumentTagger): A Transform stream to tag an auto-increment field to each object in the stream. Can also mutate the stream objects through a function or default Object.

- [`MongooseStream`](#module_@e2fyi/streams.MongooseStream): A Transform stream which will bulk write the objects in the stream to mongodb via a [mongoose model](http://mongoosejs.com/docs/models.html).

## ChangeLog
- v1.0.0: new streams: `DocumentTagger`, `MongooseStream`.

## Quick start
Using CommonJS module
```js
// importing DocumentTagger and MongooseStream
const {DocumentTagger, MongooseStream} = require('@e2fyi/streams');
```

## API reference
The API documentation is also available at [https://e2fyi.github.io/streams](https://e2fyi.github.io/streams).

  <a name="module_@e2fyi/streams"></a>

## @e2fyi/streams

* [@e2fyi/streams](#module_@e2fyi/streams)
    * [.DocumentTagger](#module_@e2fyi/streams.DocumentTagger) ⇐ <code>stream.Transform</code>
        * [new DocumentTagger(opts)](#new_module_@e2fyi/streams.DocumentTagger_new)
    * [.MongooseStream](#module_@e2fyi/streams.MongooseStream) ⇐ <code>stream.Transform</code>
        * [new MongooseStream(opts)](#new_module_@e2fyi/streams.MongooseStream_new)
    * [.DocumentTaggerSettings](#module_@e2fyi/streams.DocumentTaggerSettings) : <code>Object</code>
    * [.MongooseStreamSettings](#module_@e2fyi/streams.MongooseStreamSettings) : <code>Object</code>

<a name="module_@e2fyi/streams.DocumentTagger"></a>

### @e2fyi/streams.DocumentTagger ⇐ <code>stream.Transform</code>
Transform Object stream (objectMode=true) to tag with an autoIncrement id.
 An object or function can be optionally provided to mutate each object in
the stream.

**Kind**: static class of [<code>@e2fyi/streams</code>](#module_@e2fyi/streams)  
**Extends**: <code>stream.Transform</code>  
**Emits**: [<code>filtered</code>](#DocumentTagger+event_filtered)  
<a name="new_module_@e2fyi/streams.DocumentTagger_new"></a>

#### new DocumentTagger(opts)
Create a new DocumentTagger stream.


| Param | Type | Description |
| --- | --- | --- |
| opts | <code>DocumentTaggerSettings</code> | Settings for the stream. |

**Example**  
```js
const docTagger = new DocumentTagger({autoIncrement: 'id', mutate: { project: 'test' }});
someReadableStreamFromArray([{text: 'abc'}, {text: 'efg'}])
  .pipe(docTagger)
  .pipe(process.stdout);
// stdout >
// {"text": "abc", "id": 0, "project": "test"}
// {"text": "efg", "id": 1, "project": "test"}
```
<a name="module_@e2fyi/streams.MongooseStream"></a>

### @e2fyi/streams.MongooseStream ⇐ <code>stream.Transform</code>
A custom NodeJS Transform stream to mongo via mongoose.

**Kind**: static class of [<code>@e2fyi/streams</code>](#module_@e2fyi/streams)  
**Extends**: <code>stream.Transform</code>  
**Emits**: [<code>mongoose-bulk-write</code>](#MongooseStream+event_mongoose-bulk-write)  
<a name="new_module_@e2fyi/streams.MongooseStream_new"></a>

#### new MongooseStream(opts)
Create a Transform stream which bulkWrite to mongo based on the itemWaterMark.
model (mongoose Model) is a required field.


| Param | Type | Description |
| --- | --- | --- |
| opts | <code>MongooseStreamSettings</code> | Configuration for MongoStream. Default value for `itemWaterMark` is 50. |

**Example**  
```js
var stream2mongo = new MongooseStream({mode: SomeMongooseModel});
someReadableStreamFromArray([{text: 'abc'}, {text: 'efg'}])
  .pipe(stream2mongo) // writes to mongo (while stream are also passthrough)
  .pipe(response); // stream same results back to some request
```
<a name="module_@e2fyi/streams.DocumentTaggerSettings"></a>

### @e2fyi/streams.DocumentTaggerSettings : <code>Object</code>
Settings for DocumentTagger.

**Kind**: static typedef of [<code>@e2fyi/streams</code>](#module_@e2fyi/streams)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| autoIncrement | <code>String</code> | The auto-increment field to tag onto the stream object. |
| ignoreNonObject | <code>Boolean</code> | If `true`, no errors will be emitted when the chunk in the stream cannot be parsed into `Object`. |
| readableObjectMode | <code>Boolean</code> | If `true`, `Object` will be emitted from the stream, otherwise a `String` or `Buffer` representation or will emitted instead. |
| objectMode | <code>Boolean</code> | If `true`, `Object` will be emitted from the stream, otherwise a `String` or `Buffer` representation or will emitted instead. Overwrites `writableObjectMode`. |
| filter | <code>function</code> | Function to filter the objects in the stream. Return `true` to keep the object. |
| mutate | <code>function</code> \| <code>Object</code> | Function or Object to mutate the stream. If an Object is provided, each stream object will be mutated with the `Object.assign(streamObj, mutateObj)`. |

<a name="module_@e2fyi/streams.MongooseStreamSettings"></a>

### @e2fyi/streams.MongooseStreamSettings : <code>Object</code>
Settings for MongooseStream.

**Kind**: static typedef of [<code>@e2fyi/streams</code>](#module_@e2fyi/streams)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| itemWaterMark | <code>Number</code> | <code>50</code> | The number of item collected before writing to mongodb. |
| passThrough | <code>Boolean</code> |  | If `false` nothing will be emitted from the stream. |
| model | <code>mongoose.Model</code> |  | [mongoose Model](http://mongoosejs.com/docs/models.html). |


## Development

Unit testing
```
npm test
```

Build documentation
```
npm run build
```
