/**
 * Created by samialmouhtaseb on 02/08/16.
 */
var Kue = require('kue'),
  queue = Kue.createQueue();

module.exports.create = function (job, data, callback) {
  callback = callback || function () {
    };
  var job = queue.create(job, data).removeOnComplete(true).save(function (err) {
    err ? callback(err, null) : callback(null, job.id);
  });
};

module.exports.process = function (job, callback) {
  queue.process(job, function (job, done) {
    callback = callback || function () {
      };
    callback(job.data, done);
  });
};
