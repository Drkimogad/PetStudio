function loadGoogleAPIs() {
  // Load gapi.js with integrity check
const gsiScript = document.createElement('script');
gsiScript.src = 'https://accounts.google.com/gsi/client';
gsiScript.integrity = 'sha256-+0JEH4h4yMMMF99dG0OZ8j4XlNk9XigLxE7k9wuRj5E=';
gsiScript.crossOrigin = 'anonymous';
  
  // Load GSI client with integrity check
const gsiScript = document.createElement('script');
gsiScript.src = 'https://accounts.google.com/gsi/client';
gsiScript.integrity = 'sha256-+0JEH4h4yMMMF99dG0OZ8j4XlNk9XigLxE7k9wuRj5E=';
gsiScript.crossOrigin = 'anonymous';

  document.head.append(gapiScript, gsiScript);
}
