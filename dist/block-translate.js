// Dev-only: block requests to translate.googleapis.com to reduce noisy logs
(function () {
  if (typeof window === 'undefined') return;
  try {
    const blockedHost = 'translate.googleapis.com';

    const origFetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        const url = typeof input === 'string' ? input : input?.url;
        if (url && url.includes(blockedHost)) {
          console.warn('[dev] blocked fetch to', url);
          return new Promise(() => {});
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };

    const XHR = window.XMLHttpRequest;
    const origOpen = XHR.prototype.open;
    XHR.prototype.open = function (method, url) {
      try {
        if (url && url.includes(blockedHost)) {
          console.warn('[dev] blocked XHR to', url);
          this.abort();
          return;
        }
      } catch (e) {}
      return origOpen.apply(this, arguments);
    };
  } catch (e) {
    // noop
  }
})();
