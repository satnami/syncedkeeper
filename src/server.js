var request = require('./lib/request'),
  kue = require('./lib/kue'),
  git = require('./lib/git-commands');

var org_name='';

request(org_name);

kue.process('clone', function (data, done) {
  git(data);
  done();
});
