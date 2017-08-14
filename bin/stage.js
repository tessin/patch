const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const test = fs.readFileSync(path.join(root, "src/index.test.js"), "utf8");
const test2 = test.replace('require("./index")', 'require("./index.min")');
fs.writeFileSync(path.join(root, "lib/index.min.test.js"), test2, "utf8");
