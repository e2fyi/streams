`use strict`;
const {Transform} = require('stream');
const defaultOpts = {objectMode: true, itemWaterMark: 50};

/**
 * Settings for MongooseStream.
 * @memberof module:@e2fyi/streams
 * @alias MongooseStreamSettings
 * @typedef {Object} MongooseStreamSettings
 * @property {Number} [itemWaterMark=50] - The number of item collected before writing to mongodb.
 * @property {mongoose.Model} model - [mongoose Model]{@link http://mongoosejs.com/docs/models.html}.
 */

/**
 * A custom NodeJS Transform stream to mongo via mongoose.
 * @memberof module:@e2fyi/streams
 * @extends stream.Transform
 * @example
 * var stream2mongo = new MongooseStream({mode: SomeMongooseModel});
 * someReadableStreamFromArray([{text: 'abc'}, {text: 'efg'}])
 *   .pipe(stream2mongo) // writes to mongo (while stream are also passthrough)
 *   .pipe(response); // stream same results back to some request
 */
class MongooseStream extends Transform {
  /**
   * Create a Transform stream which bulkWrite to mongo based on the itemWaterMark.
   * model (mongoose Model) is a required field.
   * @param {MongooseStreamSettings} opts Configuration for MongoStream. Default value for `itemWaterMark` is 50.
   */
  constructor(opts = defaultOpts) {
    opts = Object.assign(opts, defaultOpts);
    super(opts);
    this.itemWaterMark = opts.itemWaterMark;
    this.model = opts.model;
    this._stack_ = [];
    if (!opts.model) {
      throw new Error('Mongoose Model must be defined!');
    }
  }
  _transform(chunk, encoding, callback) {
    if (chunk) {
      this._stack_.push({insertOne: {document: chunk}});
      if (this._stack_.length >= this.itemWaterMark) {
        let job = this._stack_;
        this._stack_ = [];
        return this.model.bulkWrite(job, err => {
          callback(err, chunk);
        });
      }
    }
    callback(null, chunk);
  }
  _flush(callback) {
    if (this._stack_.length > 0) {
      let job = this._stack_;
      this._stack_ = [];
      return this.model.bulkWrite(job, err => {
        callback(err, '\0');
      });
    }
    callback(null, '\0');
  }
}

module.exports = MongooseStream;
