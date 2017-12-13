`use strict`;
const {Transform} = require('stream');
const defaultOpts = {objectMode: true};

/**
 * Settings for DocumentTagger.
 * @memberof module:@e2fyi/streams
 * @alias DocumentTaggerSettings
 * @typedef {Object} DocumentTaggerSettings
 * @property {String} autoIncrement - The auto-increment field to tag onto the
 * stream object.
 * @property {Function|Object} mutate - Function or Object to mutate the stream.
 * If an Object is provided, each stream object will be mutated with the
 * `Object.assign(streamObj, mutateObj)`.
 */

/**
 * Transform Object stream (objectMode=true) to tag with an autoIncrement id.
 *  An object or function can be optionally provided to mutate each object in
 * the stream.
 * @memberof module:@e2fyi/streams
 * @extends stream.Transform
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
    super(opts);
    this._counter_ = 0;
    this._autoIncrement_ = opts.autoIncrement;
    if (opts.mutate) {
      this._mutate_ =
        typeof opts.mutate === 'function'
          ? opts.mutate
          : d => Object.assign(d, opts.mutate);
    }
  }
  _transform(chunk, encoding, callback) {
    if (chunk) {
      if (this._autoIncrement_ && this._counter_ >= 0)
        chunk[this._autoIncrement_] = this._counter_++;
      if (this._mutate_) chunk = this._mutate_(chunk) || chunk;
      callback(null, chunk);
    }
  }
}

module.exports = DocumentTagger;
