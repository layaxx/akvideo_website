const fs = require("fs");

class CSMConfig {
  data() {
    return {
      permalink: `/admin/config.yml`,
      sitemap: { ignore: true },
    };
  }

  render(data) {
    let yml = fs.readFileSync("./src/admin/config.yml");
    if (data.env.environment != "production") {
      yml += "\nlocal_backend: true";
    }

    return yml;
  }
}

module.exports = CSMConfig;
