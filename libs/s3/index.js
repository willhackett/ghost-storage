/**
 * S3FileStore Class to connect Ghost blog with Amazon S3 Storage
 *
 * @author Qishen  https://github.com/VictorCoder123
 */

var AWS = require('aws-sdk');
var Q = require('q');
var path = require('path');
var moment = require('moment');
var fs = require('fs');

var baseStore = require('../base');

var S3FileStore = function (s3config) {
  AWS.config.update({
    accessKeyId: s3config.accessKeyId,
    secretAccessKey: s3config.secretAccessKey
  });
  this.s3 = new AWS.S3();
  this.bucket = s3config.bucket;
  this.awsPath = s3config.awsPath;
  this.awsHost = s3config.cdnHost || false;
}

// Prototypal inheritance from baseStore
S3FileStore.prototype = Object.create(baseStore.prototype);
S3FileStore.prototype.constructor = S3FileStore;

/**
 * List all buckets in current s3 storage, this method is actually
 * irrelevant to implementation of ghost-storage plugin, but used to
 * test the connection between server and s3 storage.
 * @param  {Function} callback
 * @return {void}
 */
S3FileStore.prototype.listBuckets = function (callback) {
  this.s3.listBuckets(function(err, data){
    if(err) console.log(err);
    else callback(data);
  });
}

/**
 * Delete object in current bucket
 * This method is only used in testing
 * @param  {String} filename
 * @return {void}
 */
S3FileStore.prototype.deleteObject = function (filename, callback) {
  var params = {
    Bucket: this.bucket,
    Key: filename
  };
  this.s3.deleteObject(params, function(err, data){
    if(err) console.log(err);
    callback();
  });
}

/**
 * Save image to storage in S3
 * @param  {Image}  image
 * @param  {String} targetDir
 * @return {Promise} returns a promise resolve to full url of uploaded image
 */
S3FileStore.prototype.save = function (image, targetDir) {
  var self = this;
  if(image.path === null || image.name === null)
    deferred.reject(new Error('Image object is broken.'));

  targetDir = targetDir || this.getTargetDir();
  var pathname; // Assign a value in promise and return later

  // Helper function to generate buffer promise
  var getBuffer = function (path) {
    var deferred = Q.defer();
    fs.readFile(path, function(err, buffer){
      if(err) deferred.reject(err);
      else deferred.resolve(buffer);
    });
    return deferred.promise;
  }
  // Helper function to generate putObject promise in S3 operation
  var putObject = function (params) {
    var deferred = Q.defer();
    self.s3.putObject(params, function(err, data){
      if(err) deferred.reject(err);
      else deferred.resolve(data);
    });
    return deferred.promise;
  }
  // Generate two promises for getting filename and buffer
  var filename_promise = this.getUniqueFileName(image, targetDir);
  var buffer_promise = getBuffer(image.path);

  return Q.all([buffer_promise, filename_promise])
    .spread(function(buffer, filename){
      // return [buffer, filename] as list
      pathname = filename;
      var params = {
        Bucket: self.bucket,
        Key: filename,
        Body: buffer
      };
      return putObject(params);
    })
    .then(function(){
      if (self.awsHost)
        return self.awsHost + pathname;
      return 'http://' + self.bucket + '.' + self.awsPath + '/' + pathname;
    });
}

/**
 * If your module's save() method returns absolute URLs,
 * serve() can be a no-op pass through middleware function
 * @return {void}
 */
S3FileStore.prototype.serve = function () {
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
S3FileStore.prototype.exists = function (filename) {
  var deferred = Q.defer();
  var params = { Bucket: this.bucket, Key: filename };
  this.s3.getObject(params, function (err, data) {
    //console.log(err.code);
    if(data !== null) deferred.resolve(true);
    else if(err && err.code === 'NoSuchKey') deferred.resolve(false);
    else deferred.reject(err);
  });
  return deferred.promise;
}

module.exports = S3FileStore;
