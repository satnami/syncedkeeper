var request = require('request'),
  kue = require('./lib/kue'),
  config = require('./../config/config.json'),
  url_builder = require('./url_builder');

var page = config.page;

function get_orgs_repos(org_name, page, callback) {
  request.get({
    url: url_builder.get_organization_repos(org_name, page),
    headers: url_builder.header(),
    json: true
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var orgs_repos = body.map(function (repo) {
        return {name: repo.name, full_name: repo.full_name};
      });

      callback(null, orgs_repos);
      return;
    }

    err = err || response.statusCode;
    callback(err);
  })
}

function get_orgs_repo_information(org_name, repo_name, repo_full_name, callback) {
  request.get({
    url: url_builder.repo(repo_full_name),
    headers: url_builder.header(),
    json: true
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = null;
      if (body.fork == true) {
        data = {
          org_name: org_name,
          repo: {
            name: body.name,
            full_name: body.full_name
          },
          parent: {
            name: body.parent.name,
            full_name: body.parent.full_name
          }
        }
      }
      callback(null, data);
      return;
    }

    err = err || response.statusCode;
    callback(err);
  })
}

function delete_repo(full_name, callback) {
  request.delete({
    url: url_builder.repo(full_name),
    headers: url_builder.header(),
    json: true
  }, function (err, response, body) {
    if (!err && (response.statusCode == 200 || response.statusCode == 204)) {
      callback(null, true);
      return;
    }

    err = err || response.statusCode;
    callback(err);
  })
}

function fork_repo(full_name, destination, callback) {
  request.post({
    url: url_builder.fork_repo(full_name, destination),
    headers: url_builder.header(),
    json: true
  }, function (err, response, body) {
    if (!err && (response.statusCode == 200 || response.statusCode == 202)) {
      callback(null, true);
      return;
    }

    err = err || response.statusCode;
    callback(err);
  })
}

function get_orgs_data(org_name, callback) {
  get_orgs_repos(org_name, page, function (err, repos) {
    if (err) {
      console.log(err);
      return;
    }

    setTimeout(function () {
      page = page + 1;
      if (repos.length > 0) get_orgs_data(org_name);
    }, config.time_out);

    repos.forEach(function (repo) {
      // if (result) kue.create('fork', repo);
      get_orgs_repo_information(org_name, repo.name, repo.full_name, function (errInternal, result) {
        if (errInternal) {
          console.log(errInternal);
        }
        else if (result) {
          console.log(result.repo.full_name + ', from: ' + result.parent.full_name + ',started!');
          delete_repo(result.repo.full_name, function (err, success) {
            if (!err && success) {
              console.log(result.repo.full_name + ', from: ' + result.parent.full_name + ',deleted!');
              fork_repo(result.parent.full_name, result.org_name, function (errf, successf) {
                if (!errf && successf) {
                  console.log(result.repo.full_name + ', from: ' + result.parent.full_name + ',forked!');
                } else
                  console.log('Error: ' + result.repo.full_name + ', from: ' + result.parent.full_name + ',error while fork!');
              })
            }
            else
              console.log('Error: ' + result.repo.full_name + ', from: ' + result.parent.full_name + ',error while delete!');
          })
        }
      })
    })
  })
}

module.exports = get_orgs_data;
