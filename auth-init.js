function loadGoogleAPIs() {
  // Load gapi.js with integrity check
  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.integrity = 'sha256-...'; // Get from https://cdn.jsdelivr.net/npm/apis.google.com/js/api.js
  gapiScript.crossOrigin = 'anonymous';
  
  // Load GSI client with integrity check
  const gsiScript = document.createElement('script');
  gsiScript.src = 'https://accounts.google.com/gsi/client';
  gsiScript.integrity = 'sha256-...'; // Get from https://cdn.jsdelivr.net/npm/accounts.google.com/gsi/client
  gsiScript.crossOrigin = 'anonymous';

  document.head.append(gapiScript, gsiScript);
}
