const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.resolve(root, "_site");

if (path.dirname(output) !== root || path.basename(output) !== "_site") {
  throw new Error(`Refusing to remove unexpected output path: ${output}`);
}

fs.rmSync(output, { recursive: true, force: true });
console.log(`Cleaned ${output}`);
