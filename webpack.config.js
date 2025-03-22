import path from 'path';
import { fileURLToPath } from 'url';
import GopeedPolyfillPlugin from 'gopeed-polyfill-webpack-plugin';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(import.meta.url);

export default (_, argv) => ({
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist'),
  },
  devtool: argv.mode === 'production' ? undefined : false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new GopeedPolyfillPlugin(),
    {
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tap('RunTestsBeforeBuild', () => {
          try {
            console.log('Running tests before build...');
            execSync('npm run test', { stdio: 'inherit' });
          } catch (err) {
            console.error('Tests failed:', err);
            process.exit(1);
          }
        });
      },
    },
  ],
});
