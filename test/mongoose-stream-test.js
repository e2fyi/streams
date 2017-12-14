const chai = require('chai');
const assert = chai.assert;

const {Writable, PassThrough} = require('stream');
const {MongooseStream} = require('../index.js');
const {createStream, createMongooseModel} = require('../utility/test.js');

const objSample = ['a', 'b', 'c', 'd', 'e'].map(content => {
  return {content};
});

describe('MongooseStream', function() {
  var model;
  beforeEach(function() {
    // create a fake mongoose model with bulkWrite only
    model = createMongooseModel();
  });

  describe('Object input stream with itemWaterMark = 1', function() {
    it('number of bulkWrite should be same as number of items', function(cb) {
      var count = 0;
      createStream(objSample, true)
        .pipe(new MongooseStream({model, itemWaterMark: 1}))
        .on('mongoose-bulk-write', d => {
          count++;
        })
        .on('end', () => {
          cb(assert(count, objSample.length));
        })
        .pipe(new Writable());
    });
  });

  describe('Object input stream with itemWaterMark = 4', function() {
    it('number of bulkWrite should be 1 + 1', function(cb) {
      var count = 0;
      createStream(objSample, true)
        .pipe(new MongooseStream({model, itemWaterMark: 1}))
        .on('mongoose-bulk-write', d => {
          count++;
        })
        .on('end', () => {
          cb(assert(count, 2));
        })
        .pipe(new Writable());
    });
  });

  describe('Object input stream with itemWaterMark >= 5', function() {
    it('number of bulkWrite should be 1', function(cb) {
      var count = 0;
      createStream(objSample, true)
        .pipe(new MongooseStream({model, itemWaterMark: 5}))
        .on('mongoose-bulk-write', d => {
          count++;
        })
        .on('end', () => {
          cb(assert(count, 1));
        })
        .pipe(new Writable());
    });
  });

  describe('Object input stream with no passThrough', function() {
    it('should emit no data', function(cb) {
      createStream(objSample, true)
        .pipe(new MongooseStream({model}))
        .on('end', () => {
          cb();
        })
        .pipe(
          new Writable({
            objectMode: true,
            write: (chunk, encoding, callback) => {
              try {
                assert.isNull(chunk, 'data is emitted!');
              } catch (err) {
                cb(new Error('data is emitted!'));
                return;
              }
              callback();
            }
          })
        );
    });
  });

  describe('Object input stream with passThrough', function() {
    it('output should be same as input', function(cb) {
      var res = [];
      createStream(objSample, true)
        .pipe(new MongooseStream({model, passThrough: true}))
        .pipe(
          new Writable({
            objectMode: true,
            write: (chunk, encoding, callback) => {
              res.push(chunk);
              callback();
            }
          })
        )
        .on('finish', () => {
          cb(assert(objSample, res));
        });
    });
  });
});
