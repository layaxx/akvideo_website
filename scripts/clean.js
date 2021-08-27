const fs = require("fs");

function deleteFolderRecursive(path) {
  if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
    fs.readdirSync(path).forEach(function (file) {
      const curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    console.log(`Deleting directory "${path}"...`);
    fs.rmdirSync(path);
  }
}

console.log("Cleaning working tree...");

deleteFolderRecursive("./_site");

console.log("Successfully cleaned working tree!");
