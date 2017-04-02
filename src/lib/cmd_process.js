var exec = require('child_process').exec;

module.exports.exec = function (command, callback) {
  callback = callback || function () {
    };

  exec(command, function (err, stdout, stderr) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, stdout);
  });
};
