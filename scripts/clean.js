const fs = require("fs");

console.log("Removing build folder...");

fs.rmSync("./_site", { recursive: true, force: true });

console.log("Build folder removed!");
