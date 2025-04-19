// auth-init.js
function loadGoogleAPIs() {
  // Load gapi.js
  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.onload = () => {
    window.gapiLoaded = true;
    console.log('Google API client loaded');
  };
  document.head.appendChild(gapiScript);

  // Load GSI client
  const gisScript = document.createElement('script');
  gisScript.src = 'https://accounts.google.com/gsi/client';
  gisScript.onload = () => {
    window.gisLoaded = true;
    console.log('Google Identity Services loaded');
  };
  document.head.appendChild(gisScript);
}
