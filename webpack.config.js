const path = require('path');

module.exports = {
  entry: './transpilled/git-diff.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'git-diff.js'
  }
};