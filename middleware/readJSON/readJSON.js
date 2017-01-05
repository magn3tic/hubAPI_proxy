var fs = require('fs');

function readJSONFile(filename) {
  const readFile = new Promise((resolve, reject) => {
    fs.readFile(filename, "utf-8", function (err, json) {
      if (err) {
        reject(err);
        return;
      }
        resolve(json);
    });
  })
  return readFile;
}

module.exports = readJSONFile;