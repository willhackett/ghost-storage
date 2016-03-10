/**
 * S3FileStore Class to connect Ghost blog with Amazon S3 Storage
 *
 * @author Qishen  https://github.com/VictorCoder123
 */

var AWS = require('aws-sdk');
var Q = require('q');
var promise = require('bluebird'),
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
}

// Prototypal inheritance from baseStore
S3FileStore.prototype = Object.create(baseStore.prototype);
S3FileStore.prototype.constructor = S3FileStore;

// Only for test aws
S3FileStore.prototype.listBuckets = function (callback) {
  this.s3.listBuckets(function(err, data){
    if(err) console.log(err);
    else callback(data);
  });
}

/**
 * Save
 * @param  {Image} image     [description]
 * @param  {String} targetDir [description]
 * @return {Promise}           [description]
 */
S3FileStore.prototype.save = function (image, targetDir) {
  var self = this;
  if(image.path === null || image.name === null)
    deferred.reject(new Error('Image object is broken.'));

  targetDir = targetDir || this.getTargetDir();
  var buffer_promise = promise.promisify(fs.readFile)(image.path);
  var filename_promise = this.getUniqueFileName(image, targetDir);

  var putObject = function (params) {
    var deferred = Q.defer();
    self.s3.putObject(params, function(err, data){

    });
    return deferred.promise;
  }

  return Q.all([buffer_promise, filename_promise])
    .then(function(list){
      // return [buffer, filename] as list
      var params = {
        Bucket: this.bucket,
        Key: list[1],
        Body: list[0]
      };
      return params;
    })
    .then(function(params){
      self.s3.putObject(params, function(err, data){

      });
    });
}

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
    console.log(data);
    if(err) deferred.reject(err);
    else deferred.resolve(data !== null);
  });
  return deferred.promise;
}

module.exports = S3FileStore;







