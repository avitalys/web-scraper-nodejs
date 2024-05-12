const fs = require("fs");

const saveToFile = (filename, data) => {
  if (filename) {
    fs.writeFile(`./dist/${filename}.json`, JSON.stringify(data), (err) => {
      if (err) throw err;
      console.log(`Done writing to file /${filename}`);
    });
  }
};

// const createWriteStream = (path, options) => {
//   if (path) {
//     fs.createWriteStream(path, { ...options, flsgs:  });
//   }
// };

module.exports = {
  saveToFile,
};
