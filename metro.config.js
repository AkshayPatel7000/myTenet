const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration for optimized bundle size
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    // Enable bytecode optimization for smaller bundle size
    minifierConfig: {
      keep_fnames: false,
      compress: {
        passes: 2,
        drop_console: true, // Remove console.log in production
      },
    },
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  server: {
    middlewares: [],
  },
};

module.exports = mergeConfig(defaultConfig, config);
