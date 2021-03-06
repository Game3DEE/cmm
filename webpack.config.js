import path from 'path'
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    main: './src/cmm.js',
    game: './src/game.js',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    fallback: {
      "buffer": false,
      "zlib": false,
    },
  },
}
