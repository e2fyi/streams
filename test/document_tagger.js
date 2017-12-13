const {PassThrough} = require('stream');
const assert = require('chai').assert;
const {DocumentTagger} = require('../index.js');

describe('DocumentTagger', function() {
  var stream;
  var sample;

  beforeEach(function() {
    // create PassThrough stream
    stream = new PassThrough({objectMode: true});
    sample = [1, 2, 3, 4, 5].map(content => {
      return {content};
    });
    sample.forEach(d => stream.write(d));
    stream.end();
  });

  describe('PassThrough only', function() {
    it('output should be same as input when no argument', function(cb) {
      var test = [];
      stream
        .pipe(new DocumentTagger())
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(sample, test));
        });
    });
  });

  describe('autoIncrement=docid', function() {
    it('output should has an auto-increment field "docid"', function(cb) {
      var test = [];
      var sample1 = sample.map((d, i) => {
        d.docid = i;
        return d;
      });
      stream
        .pipe(new DocumentTagger({autoIncrement: 'docid'}))
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(sample1, test));
        });
    });
  });

  describe('mutate=function', function() {
    it('output should mutate based on the function provided', function(cb) {
      var test = [];
      var mutate = d => d.content * d.content;
      var sample1 = sample.map(mutate);
      stream
        .pipe(new DocumentTagger({mutate}))
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(sample1, test));
        });
    });
  });

  describe('mutate=object', function() {
    it('output should merge with the mutate object provided', function(cb) {
      var test = [];
      var mutate = {project: 'test'};
      var sample1 = sample.map(d => Object.assign(d, mutate));
      stream
        .pipe(new DocumentTagger({mutate}))
        .on('data', data => {
          test.push(data);
        })
        .on('end', () => {
          cb(assert.deepEqual(sample1, test));
        });
    });
  });
});
