/**
 * Write tests for ghost-storage plugin
 *
 * @author Qishen  https://github.com/VictorCoder123
 */

'use strict'
var path = require('path');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;

// Amazon S3 dependencies
var S3FileStore = require('../libs/s3');
var s3config = require('./config').S3;

var GoogleFileStore = require('../libs/google');
var gconfig = require('./config').Google;

// Set up chai plugin to enable promise test
chai.use(chaiAsPromised);
chai.should();

/*describe('Amazon S3 Storage', function () {

  var s3Store = new S3FileStore(s3config);
  var filename;

  // Clean up generated mock file on S3
  after(function(done){
    s3Store.deleteObject(filename, function(){
      done();
    });
  });

  it('should connect to AWS s3 and get all buckets', function (done) {
    s3Store.listBuckets(function (data) {
      //console.log(data);
      expect(data).to.not.equal(null);
      done();
    });
  });

  it('should return false after querying non-existing object', function (done) {
    s3Store.exists('testsssss.js')
      .then(function(exists){
        expect(exists).to.equal(true);
        done();
      })
      .catch(function(err){
        done();
      });;
  });

  // Make sure a file named test.js is uploaded in s3 storage
  it('should return true after querying test.js file', function (done) {
    s3Store.exists('test.js')
      .then(function(exists){
        expect(exists).to.equal(true);
        done();
      });
  });

  it('should upload a file into S3 bucket base on image object', function (done) {
    var mockImage = {
      path: path.join(__dirname, './test.js'),
      name: 'mock-file'
    }
    // Kind reminder: Don't test it on date like Jan 31, 23:59:59 etc.
    // I guess you know why :)
    filename = s3Store.getTargetDir() + '/' + mockImage.name;
    s3Store.save(mockImage)
      .then(function(url){
        expect(url).to.have.string('http');
        done();
      })
      .catch(function(err){
        console.log(err);
      });
  });
});*/


describe('Google Cloud Storage', function (done) {
  var googleStore = new GoogleFileStore(gconfig);
  var filename;

  // Clean up after running through last test
  after(function(done){
    googleStore.deleteFile(filename, function(data){
      done();
    });
  });

  it('should connect to Google Cloud Storage by testing contents in bucket', function (done) {
    googleStore.getFiles(function(data){
      expect(data).to.not.equal(null);
      done();
    });
  });

  // Make sure a file named test.js is uploaded in Google cloud storage
  it('should return true after querying test.js file', function (done) {
    googleStore.exists('test.js')
      .then(function(exists){
        expect(exists).to.equal(true);
        done();
      })
      .catch(function(err){
        console.log(err);
        done();
      });
  });

  it('should return false after querying non-existing object', function (done) {
    googleStore.exists('testsssss.js')
      .then(function(exists){
        expect(exists).to.equal(false);
        done();
      })
  });

  it('should uplaod a file into bucket based on image object', function (done) {
    var mockImage = {
      path: path.join(__dirname, './test.js'),
      name: 'mock-file'
    }
    // Kind reminder: Don't test it on date like Jan 31, 23:59:59 etc.
    // I guess you know why :)
    // Cache filename to clean it up after test
    filename = googleStore.getTargetDir() + '/' + mockImage.name;
    googleStore.save(mockImage)
      .then(function(url){
        expect(url).to.have.string('http');
        done();
      })
      .catch(function(err){
        console.log(err);
      });
  });

})