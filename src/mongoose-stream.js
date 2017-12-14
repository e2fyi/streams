'use strict';
const {Transform} = require('stream');
const defaultOpts = {objectMode: true, itemWaterMark: 50};

/**
 * Settings for MongooseStream.
 * @memberof module:@e2fyi/streams
 * @alias MongooseStreamSettings
 * @typedef {Object} MongooseStreamSettings
 * @property {Number} [itemWaterMark=50] - The number of item collected before writing to mongodb.
 * @property {Boolean} passThrough - If `false` nothing will be emitted from the stream.
 * @property {mongoose.Model} model - [mongoose Model]{@link http://mongoosejs.com/docs/models.html}.
 */

/**
 * `mongoose-bulk-write` event. Emits the response from the bulkWrite via mongoose.
 *
 * @event MongooseStream#mongoose-bulk-write
 * @type {object}
 */

/**
 * A custom NodeJS Transform stream to mongo via mongoose.
 * @memberof module:@e2fyi/streams
 * @extends stream.Transform
 * @fires MongooseStream#mongoose-bulk-write
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
    this._passThrough_ = opts.passThrough;
    this._stack_ = [];
    if (!opts.model) {
      throw new Error('Mongoose Model must be defined!');
    }
  }
  _transform(chunk, encoding, callback) {
    // termination chunk
    if (!chunk) {
      this.push(chunk);
    } else if (this._passThrough_) {
      this.push(chunk);
    }
    if (chunk) {
      this._stack_.push({insertOne: {document: chunk}});
      if (this._stack_.length >= this.itemWaterMark) {
        let job = this._stack_;
        this._stack_ = [];
        return this.model.bulkWrite(job, (error, res) => {
          this.emit('mongoose-bulk-write', res);
          if (error) callback(error);
          else callback();
        });
      }
    }
    callback();
  }
  _flush(callback) {
    if (this._stack_.length > 0) {
      let job = this._stack_;
      this._stack_ = [];
      return this.model.bulkWrite(job, (error, res) => {
        this.emit('mongoose-bulk-write', res);
        this.push(null);
        if (error) callback(error);
        else callback();
      });
    }
    this.push(null);
    callback();
  }
}

module.exports = MongooseStream;
