const assert = require('chai').assert;
const {createStream} = require('../utility/test.js');
const {DocumentTagger} = require('../index.js');

const baseSample = ['a', 'b', 'c', 'd', 'e'];
const objSample = baseSample.map(content => {
  return {content};
});
const jsonStrSample = objSample.map(d => JSON.stringify(d));

describe('DocumentTagger', function() {
  describe('JSON string stream with no parameter', function() {
    it('output should be same as input', function(cb) {
      var test = [];
      createStream(jsonStrSample, false)
        .pipe(new DocumentTagger())
        .on('data', data => {
          test.push(data.toString());
        })
        .on('end', () => {
          cb(assert.deepEqual(jsonStrSample, test));
        });
    });
  });

  describe('JSON string stream with readableObjectMode=true', function() {
    it('output should be parsed Object for each input', function(cb) {
      var test = [];
      createStream(jsonStrSample, false)
        .pipe(new DocumentTagger({readableObjectMode: true}))
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(objSample, test));
        });
    });
  });

  describe('Object input stream with no parameter', function() {
    it('output should be the buffer strings of the input objects', function(cb) {
      var test = [];
      createStream(objSample, true)
        .pipe(new DocumentTagger())
        .on('error', error => cb(error))
        .on('data', data => {
          test.push(data.toString());
        })
        .on('end', () => {
          cb(assert.deepEqual(jsonStrSample, test));
        });
    });
  });

  describe('Object input stream with readableObjectMode=true', function() {
    it('output should be same as input', function(cb) {
      var test = [];
      createStream(objSample, true)
        .pipe(new DocumentTagger({readableObjectMode: true}))
        .on('error', error => cb(error))
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(objSample, test));
        });
    });
  });

  describe('Object input stream with readableObjectMode=true and autoIncrement=docid', function() {
    it('output should has an auto-increment field "docid"', function(cb) {
      var test = [];
      var sample1 = objSample.map((d, i) => {
        d.docid = i;
        return d;
      });
      createStream(objSample, true)
        .pipe(
          new DocumentTagger({autoIncrement: 'docid', readableObjectMode: true})
        )
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(sample1, test));
        });
    });
  });

  describe('Object input stream with readableObjectMode=true and mutate=function', function() {
    it('output should mutate based on the function provided', function(cb) {
      var test = [];
      var mutate = d => d.content * d.content;
      var sample1 = objSample.map(mutate);
      createStream(objSample, true)
        .pipe(new DocumentTagger({mutate, readableObjectMode: true}))
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(sample1, test));
        });
    });
  });

  describe('Object input stream with readableObjectMode=true and mutate=object', function() {
    it('output should merge with the mutate object provided', function(cb) {
      var test = [];
      var mutate = {project: 'test'};
      var sample1 = objSample.map(d => Object.assign(d, mutate));
      createStream(objSample, true)
        .pipe(new DocumentTagger({mutate, readableObjectMode: true}))
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(sample1, test));
        });
    });
  });
});
