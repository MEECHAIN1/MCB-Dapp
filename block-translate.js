(function() {
  // Activate only in common local dev hostnames/ports
  try {
    const host = window.location.hostname;
    const port = window.location.port;
    const devHosts = ['127.0.0.1', 'localhost'];
    const devPorts = ['5173', '3000', '9545', '3001'];
    const isDev = devHosts.includes(host) || devPorts.includes(port);
    if (!isDev) return;
  } catch (e) {
    // If any error, fail safe and do nothing
    return;
  }

  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    try {
      const url = args[0];
      if (typeof url === 'string' && url.includes('translate.googleapis.com')) {
        console.warn('Blocked request to Google Translate:', url);
        return Promise.reject(new Error('Blocked translate.googleapis.com (dev-only)'));
      }
    } catch (e) {
      // continue to original fetch
    }
    return originalFetch.apply(this, args);
  };

  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    try {
      if (typeof url === 'string' && url.includes('translate.googleapis.com')) {
        console.warn('Blocked XHR to Google Translate:', url);
        // throw to prevent the request from being opened
        throw new Error('Blocked translate.googleapis.com (dev-only)');
      }
    } catch (e) {
      // swallow and throw so caller knows it's blocked
      throw e;
    }
    return originalXhrOpen.call(this, method, url, ...rest);
  };

  console.info('Dev intercept active: translate.googleapis.com requests will be blocked.');
})();
