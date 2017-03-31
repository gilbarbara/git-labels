'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var fs = require('fs');
var path = require('path');
var gitLabel = require('git-label');

var labels = [];

function readFiles(dirname) {
  return new Promise(function (resolve, reject) {
    try {
      var result = [];
      var filesNames = fs.readdirSync(dirname);

      filesNames.forEach(function (filename) {
        var contents = fs.readFileSync(path.join(dirname, filename), 'utf8');

        result.push({ filename: filename, contents: JSON.parse(contents) });
      });

      return resolve(result);
    } catch (error) {
      return reject(error);
    }
  });
}

var gitLabels = function gitLabels(repo, token) {
  if (!repo) {
    throw new Error('`repo` is required');
  }

  if (!token) {
    throw new Error('`token` is required');
  }

  return new Promise(function (resolve, reject) {
    var response = [];

    readFiles(path.join(__dirname, '..', 'labels/')).then(function (results) {
      results.map(function (d) {
        d.contents.forEach(function (l) {
          labels.push(l);
        });
      });

      return labels;
    }).then(function (labels) {
      var config = {
        api: 'https://api.github.com',
        repo: repo,
        token: token
      };

      try {
        gitLabel.remove(config, labels).then(function (removeResponse) {
          response.push(removeResponse);

          gitLabel.add(config, labels).then(function (addResponse) {
            response.push(addResponse);

            return resolve(response);
          });
        });
      } catch (error) {
        return reject(error);
      }
    }).catch(function (error) {
      return reject(error);
    });
  });
};

exports.default = gitLabels;
//# sourceMappingURL=index.js.map