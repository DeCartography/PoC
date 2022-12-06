const path = require("path");

const buildLintCommand = (filenames) =>
  `yarn eslint ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" ")}`;

const buildFormatCommand = (filenames) =>
  `yarn prettier ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" ")} `;

module.exports = {
  "**/*.{js,jsx,ts,tsx}": [buildLintCommand],
  "**/*": [buildFormatCommand],
};
