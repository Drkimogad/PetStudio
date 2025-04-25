// auth-init.js
function loadGoogleAPIs() {
  const nonce = 'YourRandomNonceValue'; // Must match CSP nonce
  
  const gapiScript = document.createElement('script');
  gapiScript.nonce = nonce;
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.onload = () => console.log('Google API loaded');
  
  const gsiScript = document.createElement('script');
  gsiScript.nonce = nonce;
  gsiScript.src = 'https://accounts.google.com/gsi/client';
  
  document.head.append(gapiScript, gsiScript);
}
