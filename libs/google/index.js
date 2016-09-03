/**
 * GoogleFileStore Class to connect Ghost blog with Amazon S3 Storage
 *
 * @author Qishen  https://github.com/VictorCoder123
 */

var Q = require('q');
var path = require('path');
var gcloud = require('gcloud')

var baseStore = require('../base');

var GoogleFileStore = function (gconfig) {
  var gcloudAuthed = gcloud({
    projectId: gconfig.projectId,
    keyFilename: gconfig.keyFilename
  });

  this.gcs = gcloudAuthed.storage();
  // Use default gcloud path if not specified
  this.gcloudPath = gconfig.gcloudPath || 'storage.googleapis.com';
  this.gcloudHost = gconfig.cdnHost || false;
  this.bucketname = gconfig.bucket;

  // Check if bucket exists by bucketname
  this.bucket = this.gcs.bucket(this.bucketname);
  this.bucket.acl.default.add({
    entity: 'allUsers',
    role: this.gcs.acl.OWNER_ROLE
  }, function(err, aclObject) {});
  /*
  this.bucket.exists(function(err, exists){
    if(err) console.log(err);
    if(exists === true){
      // Make any new objects added to a bucket publicly readable.
      this.bucket.acl.default.add({
        entity: 'allUsers',
        role: this.gcs.acl.READER_ROLE
      }, function(err, aclObject) {});
    }
    else
      throw new Error('Given bucket doesn\'t exist');
  });*/
}

// Prototypal inheritance from baseStore
GoogleFileStore.prototype = Object.create(baseStore.prototype);
GoogleFileStore.prototype.constructor = GoogleFileStore;

/**
 * Method only for testing connectivity in Google Cloud Storage
 * @param  {Function} callback
 * @return {void}
 */
GoogleFileStore.prototype.getFiles = function (callback) {
  this.bucket.getFiles(function(err, files){
    if(err) console.log(err);
    else callback(files);
  });
}

GoogleFileStore.prototype.deleteFile = function (filename, callback) {
  var file = this.bucket.file(filename);
  file.delete(function(err, apiResponse) {
    callback(apiResponse);
  });
}

/**
 * Save image to storage in Google Cloud
 * @param  {Image}  image
 * @param  {String} targetDir
 * @return {Promise} returns a promise resolve to full url of uploaded image
 */
GoogleFileStore.prototype.save = function (image, targetDir) {
  var self = this;
  if(image.path === null || image.name === null)
    deferred.reject(new Error('Image object is broken.'));

  targetDir = targetDir || this.getTargetDir();
  var pathname; // Assign a value in promise and return later

  // Generate promise to return url after fulfilled
  var uploadFile = function (localfile, filename) {
    var deferred = Q.defer();
    var options = {
      destination: filename,
    };
    self.bucket.upload(localfile, options, function(err, file, apiResponse){
      if(err) deferred.reject(err);
      else deferred.resolve(file);
    });
    return deferred.promise;
  }

  // Generate promise to get unique filename
  return this.getUniqueFileName(image, targetDir)
    .then(function(filename){
      pathname = filename;
      return uploadFile(image.path, filename);
    })
    .then(function(){
      // Return url for uploaded image
      if (this.gcloudHost)
        return this.gcloudHost + pathname;
      return 'https://' + self.gcloudPath + '/' + self.bucketname + '/' + pathname;
    });
}

/**
 * If your module's save() method returns absolute URLs,
 * serve() can be a no-op pass through middleware function
 * @return {void}
 */
GoogleFileStore.prototype.serve = function () {
  // a no-op, these are absolute URLs
  return function (req, res, next) {
    next();
  };
}

/**
 * Overwrite method in baseStore class
 * @param  {String} filename [whole filename including directory path]
 * @return {Promise}         [return boolean value after fulfilled]
 */
GoogleFileStore.prototype.exists = function (filename) {
  var deferred = Q.defer();
  var file = this.bucket.file(filename);
  // Check if file exists in current bucket
  file.exists(function(err, exists){
    if(err) deferred.reject(err);
    else deferred.resolve(exists);
  });
  return deferred.promise;
}

module.exports = GoogleFileStore;
