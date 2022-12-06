const path = require('path');

const buildLintCommand = (filenames) =>
  `yarn --cwd ./functions eslint ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

const buildFormatCommand = (filenames) =>
  `yarn --cwd ./functions prettier ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

module.exports = {
  '**/*.{js,jsx,ts,tsx}': [buildLintCommand],
  '**/*.{js,jsx,ts,tsx,json}': [buildFormatCommand],
};
