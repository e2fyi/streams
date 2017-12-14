'use strict';

const {PassThrough} = require('stream');

// utility functions for unit testing
module.exports = {
  createStream,
  createMongooseModel
};

function createStream(data, objectMode = false) {
  // create PassThrough stream
  var stream = new PassThrough({objectMode});
  data.forEach(d => stream.write(d));
  stream.end();
  return stream;
}

/**
 * Fake mongoose for testing
 * @return {Object}
 */
function createMongooseModel() {
  var ctx = {
    outStream: [],
    bulkWrite: function(data, opts, cb) {
      cb = arguments.length == 2 ? opts : cb;
      ctx.outStream.push(data);
      cb(null, ctx.outStream);
      return Promise.resolve(ctx.outStream);
    }
  };
  return ctx;
}
