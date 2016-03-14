var S3FileStore = require('./libs/s3');
var GoogleFileStore = require('./libs/google');

module.exports = {
  S3: S3FileStore,
  Google: GoogleFileStore
}
