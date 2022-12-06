const path = require('path');

const buildLintCommand = (filenames) =>
  `cd functions && eslint ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

const buildFormatCommand = (filenames) =>
  `cd functions && prettier ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

module.exports = {
  '**/*.{js,jsx,ts,tsx}': [buildLintCommand],
  '**/*.{js,jsx,ts,tsx,json}': [buildFormatCommand],
};
