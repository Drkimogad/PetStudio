// auth-init.js
function loadGoogleAPIs() {
  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.onload = () => window.gapiLoaded = true;
  document.head.appendChild(gapiScript);

  const gisScript = document.createElement('script');
  gisScript.src = 'https://accounts.google.com/gsi/client';
  gisScript.onload = () => window.gisLoaded = true;
  document.head.appendChild(gisScript);
}

// Initialize after Firebase
