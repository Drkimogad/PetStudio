// auth-init.js
function onGapiLoad() { 
  window.gapiLoaded = true;
  console.log("Google API client loaded");
}

function onGisLoad() { 
  window.gisLoaded = true;
  console.log("Google Identity Services loaded");
}
