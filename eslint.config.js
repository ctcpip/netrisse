const ultraMegaConfig = require('eslint-config-ultra-mega');

module.exports = [
  ...ultraMegaConfig,
  { languageOptions: { globals: { screen: 'off' } } },
];
