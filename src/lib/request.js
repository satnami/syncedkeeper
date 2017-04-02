/**
 * Created by samialmouhtaseb on 02/08/16.
 */
var request = require('request'),
  config= require('./../config/config.json'),
  kue = require('./kue');

var page = config.page;
function org_repos_url_builder(org_name, page) {
  return "https://api.github.com/orgs/" + org_name + "/repos?page=" + page + "&access_token=" + config.access_token;
}

function org_repo_url_builder(org_name, repo_name) {
  return "https://api.github.com/repos/" + org_name + "/" + repo_name + "?access_token=" + config.access_token;
}

function get_orgs_repos(org_name, page, callback) {
  request.get({
    url: org_repos_url_builder(org_name, page),
    headers: {'User-Agent': 'request-me'},
    json: true
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var orgs_repos = body.map(function (repo) {
        return repo.name;
      });

      callback(null, orgs_repos);
      return;
    }

    err = err || response.statusCode;
    callback(err);
  })
}

function get_orgs_repo_information(org_name, repo_name, callback) {
  request.get({
    url: org_repo_url_builder(org_name, repo_name),
    headers: {'User-Agent': 'request'},
    json: true
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = null;
      if (body.fork == true) {
        data = {
          org: org_name,
          origin: {
            name: body.name,
            ssh: body.ssh_url,
            clone: body.clone_url,
            default_branch: body.default_branch
          },
          upstream: {
            name: body.source.name,
            ssh: body.source.ssh_url,
            clone: body.source.clone_url,
            default_branch: body.source.default_branch
          }
        }
      }

      console.log("Starting with: " + body.name);
      callback(null, data);
      return;
    }

    err = err || response.statusCode;
    callback(err);
  })
}

function get_orgs_data(org_name, callback) {
  get_orgs_repos(org_name, page, function (err, results) {
    if (err) {
      console.log(err);
      return;
    }

    setTimeout(function () {
      page = page + 1;
      if (results.length > 0) get_orgs_data(org_name);
    }, config.time_out);

    results.forEach(function (repo_name) {
      get_orgs_repo_information(org_name, repo_name, function (errInternal, result) {
        if (errInternal) {
          console.log(errInternal);
          return;
        }
        if (result) kue.create('clone', result);
      })
    })
  })
}

module.exports = get_orgs_data;
