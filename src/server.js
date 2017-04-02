var kue = require('./lib/kue'),
  request = require('./lib/request');

request('maniacs-games');

kue.process('fork', function (data, done) {
  done();
});
