/**
 * Write tests for ghost-storage plugin
 *
 * @author Qishen  https://github.com/VictorCoder123
 */

'use strict'
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
var S3FileStore = require('../libs/s3');
var s3config = require('../config').S3;

// Set up chai plugin to enable promise test
chai.use(chaiAsPromised);
chai.should();

describe('Ghost Storage', function () {

  var s3Store = new S3FileStore(s3config);

  it('should connect to AWS s3 and get all buckets', function (done) {
    s3Store.listBuckets(function (data) {
      //console.log(data);
      expect(data).to.not.equal(null);
      done();
    });
  });

  it('should return false after querying non-existing object', function () {
    s3Store.exists('nonexistingfilename')
      .should.eventually.equal(false);
  });

  // Make sure a file named test.js is uploaded in s3 storage
  it('should return true after querying test.js file', function () {
    s3Store.exists('test.js')
      .should.eventually.equal(true);
  });
});
