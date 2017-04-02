var config = require('./../config/config.json');

module.exports = {
  get_organization_repos: function (org_name, page) {
    return "https://api.github.com/orgs/" + org_name + "/repos?page=" + page;
  },
  repo: function (full_name) {
    return "https://api.github.com/repos/" + full_name;
  },
  fork_repo: function (full_name, destination) {
    return "https://api.github.com/repos/" + full_name + "/forks?org=" + destination;
  },
  header: function () {
    return {'Authorization': 'token ' + config.access_token, 'User-Agent': config.app_name}
  }
};
