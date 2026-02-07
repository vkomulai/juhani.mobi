/**
 * Mock for webkitSpeechRecognition API.
 *
 * This script is injected via page.addInitScript() BEFORE the app loads
 * so that `'webkitSpeechRecognition' in window` evaluates to true.
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
      if (window.__speechMockShouldError) {
        if (this.onerror) {
          setTimeout(() => this.onerror({ error: 'mock-error' }), 50);
        }
        if (this.onspeechend) {
          setTimeout(() => this.onspeechend(), 100);
        }
        return;
      }

      const transcript = window.__speechMockTranscript;
      if (this.onresult && transcript) {
        const event = {
          resultIndex: 0,
          results: [{
            0: { transcript },
            isFinal: true,
            length: 1
          }]
        };
        // Small delay to simulate async speech recognition
        setTimeout(() => {
          this.onresult(event);
          if (this.onspeechend) {
            setTimeout(() => this.onspeechend(), 50);
          }
        }, 100);
      } else if (this.onspeechend) {
        setTimeout(() => this.onspeechend(), 150);
      }
    }

    stop() {}
    abort() {}
  };
`
