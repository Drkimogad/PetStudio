function loadGoogleAPIs() {
  // Load Google API client
  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.integrity = 'sha256-9NW5cOKKXx+MTufd4NoZwYPTk9Of4S2rqLkI4Bw0UwQ=';
  gapiScript.crossOrigin = 'anonymous';

  // Load Google Identity Services
  const gsiScript = document.createElement('script');
  gsiScript.src = 'https://accounts.google.com/gsi/client';
  gsiScript.integrity = 'sha256-+0JEH4h4yMMMF99dG0OZ8j4XlNk9XigLxE7k9wuRj5E=';
  gsiScript.crossOrigin = 'anonymous';

  document.head.append(gapiScript, gsiScript);
}
