var moment  = require('moment');
var path    = require('path');
var Q = require('q');

/**
 * Abstract base class for storage
 * StorageBase class cannot be instantiated
 */
function StorageBase() {
   if (this.constructor === StorageBase) {
      throw new Error("Can't instantiate abstract class!");
    }
}

/**
 * Get target directory based on current date, which can be used
 * to create file in storage.
 * @param  {String} baseDir [Optional base directory]
 * @return {String}         [whole directory path]
 */
StorageBase.prototype.getTargetDir = function (baseDir) {
  var m = moment(new Date().getTime()),
    month = m.format('MM'),
    year =  m.format('YYYY');

  if (baseDir) {
    return path.join(baseDir, year, month);
  }

  return path.join(year, month);
};

/**
 * Check if filename already exist in storage
 * This class should be implemented in inherited class
 * @param  {String} filename [whole filename including directory path]
 * @return {Promise}         [return boolean value after fulfilled]
 */
StorageBase.prototype.exists = function (filename) {
  var deferred = Q.defer();
  var error = new Error('This method is not implemented in base class');
  deferred.reject(error);
  return deferred.promise;
}

/**
 * Helper function to generate unique file name by incrementing suffix and
 * testing its existence in storage.
 * @param  {String} dir  [string of dir folder]
 * @param  {String} name [base name without ext]
 * @param  {String} ext  [ext name of file]
 * @param  {Integer} i    [suffix to be appended]
 * @return {Promise}     [return filename after fulfilled]
 */
StorageBase.prototype.generateUnique = function (dir, name, ext, i) {
  var self = this;
  var append = '';

  // Increment i and append it on filename to make it unique
  if (i) {
    append = '-' + i;
  }

  var filename = path.join(dir, name + append + ext);

  // Recursively find unique file name
  return self.exists(filename).then(function (exists) {
    if (exists) {
      i = i + 1;
      return self.generateUnique(dir, name, ext, i);
    } else {
      return filename;
    }
  });
};

/**
 * Create unique filename to be stored in cloud storage based on
 * express image uploaded by user.
 * @param  {Object} image     [express image object]
 * @param  {String} targetDir [directory path]
 * @return {Promise}          [Return unique filename after fulfilled]
 */
StorageBase.prototype.getUniqueFileName = function (image, targetDir) {
  var ext = path.extname(image.name);
  var name = path.basename(image.name, ext).replace(/[\W]/gi, '-');
  var self = this;

  return self.generateUnique(targetDir, name, ext, 0);
};

module.exports = StorageBase;








