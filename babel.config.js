module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      'babel-preset-expo',
      // Explicitly add React preset so Metro can parse JSX in expo-router internals
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: ['expo-router/babel'],
  }
}