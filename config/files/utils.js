const path = require("path");
const ROOT_DIR = path.resolve(__dirname, "../..");
const resources = [path.join(ROOT_DIR, "src/assets/css/_theme.scss")];

module.exports = resources.map(file => path.resolve(__dirname, file));
