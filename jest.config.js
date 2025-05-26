module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  testEnvironment: 'jsdom',
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ]
};