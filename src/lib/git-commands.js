/**
 * Created by samialmouhtaseb on 02/08/16.
 */
var cmd = require('./cmd_process'),
  kue = require('./kue');

module.exports = function (data) {
  if (data.origin.default_branch == data.upstream.default_branch) {
    cmd.exec("cd /home/vagrant/tmp_sync && " +
      "sudo rm -r -f " + data.origin.name + "&&" +
      "git clone " + data.origin.ssh + " && " +
      "cd " + data.origin.name + " && " +
      "git checkout " + data.origin.default_branch + " && " +
      "git remote add upstream " + data.upstream.ssh + " && " +
      "git fetch upstream && " +
      "git checkout " + data.origin.default_branch + " && " +
      "git merge upstream/" + data.upstream.default_branch + " && " +
      "git push origin " + data.origin.default_branch
      , function (err, out) {
        if (err) {
          console.log("***");
          console.log("error: " + err);
          console.log("out: " + out);
          console.log("retry: " + data.origin.name);
          console.log("***");
          kue.create('clone', data);
        }
        else {
          setTimeout(function () {
            cmd.exec("sudo rm -r -f /home/vagrant/tmp_sync/" + data.origin.name);
          }, 20000);
          console.log("finished: " + data.origin.name);
        }
      }
    );
  }
};
