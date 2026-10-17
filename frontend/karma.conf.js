// Minimal Karma config on top of the Angular CLI defaults.
// It only defines a headless launcher that works as root inside CI containers
// (Chromium refuses to start as root without --no-sandbox).
module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
  });
};
