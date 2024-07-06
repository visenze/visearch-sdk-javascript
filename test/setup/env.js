import JSDOMEnvironment from 'jest-environment-jsdom';

// JSDOM does not support fetch, thus we need to polyfill from the Node environment.
// Ref: https://github.com/jsdom/jsdom/issues/1724

class PolyfilledJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    this.global.fetch = fetch;
  }
}

module.exports = PolyfilledJSDOMEnvironment;
