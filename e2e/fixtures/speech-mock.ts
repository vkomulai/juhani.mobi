/**
 * Mock for webkitSpeechRecognition API.
 *
 * This script is injected via page.addInitScript() BEFORE the app loads
 * so that `'webkitSpeechRecognition' in window` evaluates to true.
 *
 * IMPORTANT: The app calls recognition.start() BEFORE setting .onresult
 * and .onspeechend. So start() must defer all handler checks into the
 * setTimeout callback, not check them synchronously.
 *
 * Control from tests:
 *   page.evaluate(() => { window.__speechMockTranscript = 'banaani maito' })
 *   page.evaluate(() => { window.__speechMockShouldError = true })
 */
export const speechMockScript = `
  window.__speechMockTranscript = '';
  window.__speechMockShouldError = false;

  window.webkitSpeechRecognition = class MockSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.lang = '';
      this.onresult = null;
      this.onspeechend = null;
      this.onerror = null;
    }

    start() {
      var self = this;

      if (window.__speechMockShouldError) {
        setTimeout(function() {
          if (self.onerror) {
            self.onerror({ error: 'mock-error' });
          }
          setTimeout(function() {
            if (self.onspeechend) {
              self.onspeechend();
            }
          }, 50);
        }, 100);
        return;
      }

      var transcript = window.__speechMockTranscript;
      setTimeout(function() {
        if (transcript && self.onresult) {
          var event = {
            resultIndex: 0,
            results: [{
              0: { transcript: transcript },
              isFinal: true,
              length: 1
            }]
          };
          self.onresult(event);
        }
        setTimeout(function() {
          if (self.onspeechend) {
            self.onspeechend();
          }
        }, 50);
      }, 100);
    }

    stop() {}
    abort() {}
  };
`
