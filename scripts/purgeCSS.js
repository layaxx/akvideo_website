const { PurgeCSS } = require("purgecss");
const fs = require("fs/promises");

(async () => {
  const result = await new PurgeCSS().purge({
    content: ["_site/**/*.html"],
    css: ["_site/**/*.css"],
  });

  await Promise.all(
    result.map(async ({ file, css }) => {
      console.log(`Writing ${file} after purge`);
      return fs.writeFile(file, css);
    })
  );
})().then(() => console.log("Purged CSS"));
