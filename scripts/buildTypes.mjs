// Based on https://bennypowers.dev/posts/typescript-11ty-config/

import { $ } from "execa";
import fs from "fs/promises";

await fs.rm("types/@11ty/", { recursive: true, force: true });

// 11ty doesn't actually export this type, so we have to make use
// of our private knowledge of 11ty guts, if we want to have cognitive a11y
// in our config files.
await $`yarn tsc 
        node_modules/@11ty/eleventy/src/UserConfig.js
        node_modules/@11ty/eleventy/src/Benchmark/BenchmarkManager.js
        node_modules/@11ty/eleventy/src/Util/AsyncEventEmitter.js
        --declaration
        --allowJs
        --emitDeclarationOnly
        --outDir types/@11ty/eleventy`;
