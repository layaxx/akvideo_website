const { PurgeCSS } = require("purgecss");
const fs = require("fs");

(async () => {
  const result = await new PurgeCSS().purge({
    content: ["_site/**/*.html"],
    css: ["_site/**/*.css"],
  });

  for (const { file, css } of result) {
    console.log(`Writing ${file} after purge`);
    fs.writeFileSync(file, css);
  }
})().then(() => console.log("Purged CSS"));
