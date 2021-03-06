'use strict';
const {Transform} = require('stream');
const defaultOpts = {writableObjectMode: true};

/**
 * Settings for DocumentTagger.
 * @memberof module:@e2fyi/streams
 * @alias DocumentTaggerSettings
 * @typedef {Object} DocumentTaggerSettings
 * @property {String} autoIncrement - The auto-increment field to tag onto the
 * stream object.
 * @property {Boolean} ignoreNonObject - If `true`, no errors will be emitted
 * when the chunk in the stream cannot be parsed into `Object`.
 * @property {Boolean} readableObjectMode - If `true`, `Object` will be emitted
 * from the stream, otherwise a `String` or `Buffer` representation or will
 * emitted instead.
 * @property {Boolean} objectMode - If `true`, `Object` will be emitted
 * from the stream, otherwise a `String` or `Buffer` representation or will
 * emitted instead. Overwrites `writableObjectMode`.
 * @property {Function} filter - Function to filter the objects in the stream.
 * Return `true` to keep the object.
 * @property {Function|Object} mutate - Function or Object to mutate the stream.
 * If an Object is provided, each stream object will be mutated with the
 * `Object.assign(streamObj, mutateObj)`.
 */

/**
 * `filtered` event. Emits the objects in the stream that are filtered out.
 *
 * @event DocumentTagger#filtered
 * @type {object}
 */

/**
 * Transform Object stream (objectMode=true) to tag with an autoIncrement id.
 *  An object or function can be optionally provided to mutate each object in
 * the stream.
 * @memberof module:@e2fyi/streams
 * @extends stream.Transform
 * @fires DocumentTagger#filtered
 * @example
 * const docTagger = new DocumentTagger({autoIncrement: 'id', mutate: { project: 'test' }});
 * someReadableStreamFromArray([{text: 'abc'}, {text: 'efg'}])
 *   .pipe(docTagger)
 *   .pipe(process.stdout);
 * // stdout >
 * // {"text": "abc", "id": 0, "project": "test"}
 * // {"text": "efg", "id": 1, "project": "test"}
 */
class DocumentTagger extends Transform {
  /**
   * Create a new DocumentTagger stream.
   * @param {DocumentTaggerSettings} opts Settings for the stream.
   */
  constructor(opts = defaultOpts) {
    opts = Object.assign(opts, defaultOpts);
    super(Object.assign(opts, defaultOpts));
    this._counter_ = 0;
    this._chunk_ = null;
    this._ignoreNonObject_ = opts.ignoreNonObject;
    this._autoIncrement_ = opts.autoIncrement;
    this._filter_ = opts.filter;
    this._toString_ = !(opts.readableObjectMode || opts.objectMode);
    if (opts.mutate) {
      this._mutate_ =
        typeof opts.mutate === 'function'
          ? opts.mutate
          : d => Object.assign(d, opts.mutate);
    }
  }
  _transform(chunk, encoding, callback) {
    // termination
    if (!chunk) {
      this.push(chunk);
      return;
    }
    // if is buffer convert to Object
    if (Buffer.isBuffer(chunk) || typeof chunk === 'string') {
      if (this._chunk_) {
        chunk = this._chunk_ + '' + chunk;
        this._chunk_ = null;
      }
      try {
        chunk = JSON.parse(chunk);
      } catch (error) {
        if (this._ignoreNonObject_) {
          this._chunk_ = chunk;
          callback();
          return;
        } else {
          this.emit('error', error);
          callback(error);
          return;
        }
      }
    }
    // filters the chunk
    if (this._filter_ && !this._filter_(chunk)) {
      this.emit('filtered', chunk);
      callback();
      return;
    }
    // mutates the chunk
    if (this._mutate_) {
      chunk = this._mutate_(chunk);
    }
    // autoincrement and tag to chunk
    if (chunk && this._autoIncrement_) {
      chunk[this._autoIncrement_] = this._counter_++;
    }
    // convert to string if required
    if (chunk && this._toString_) {
      try {
        chunk = JSON.stringify(chunk);
      } catch (error) {
        this.emit('error', error);
        callback(error);
      }
    }
    this.push(chunk);
    callback();
  }
}

module.exports = DocumentTagger;
