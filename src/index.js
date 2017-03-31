const fs  = require('fs');
const path  = require('path');
const gitLabel = require('git-label');

let labels = [];

function readFiles(dirname) {
  return new Promise((resolve, reject) => {
    try {
      const result = [];
      const filesNames = fs.readdirSync(dirname);

      filesNames.forEach((filename) => {
        const contents = fs.readFileSync(path.join(dirname, filename), 'utf8');

        result.push({ filename, contents: JSON.parse(contents) });
      });

      return resolve(result);
    }
    catch (error) {
      return reject(error);
    }
  });
}

const gitLabels = (repo, token) => {
  if (!repo) {
    throw new Error('`repo` is required');
  }

  if (!token) {
    throw new Error('`token` is required');
  }

  return new Promise((resolve, reject) => {
    let response = [];

    readFiles(path.join(__dirname, '..', 'labels/'))
      .then(results => {
        results.map(d => {
          d.contents.forEach(l => {
            labels.push(l);
          });
        });

        return labels;
      })
      .then(labels => {
        const config = {
          api: 'https://api.github.com',
          repo,
          token
        };

        try {
          gitLabel.remove(config, labels)
            .then(removeResponse => {
              response.push(removeResponse);

              gitLabel.add(config, labels)
                .then(addResponse => {
                  response.push(addResponse);

                  return resolve(response);
                })
            });
        }
        catch (error) {
          return reject(error);
        }
      })
      .catch(error => {
        return reject(error);
      });
  });
};

export default gitLabels;
