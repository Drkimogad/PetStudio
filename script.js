//🌟PetStudio SCRIPT.JS 🌟
// 🔶DECLARE GLOBALS🔶🔶🔶
  let auth = null; 
  let provider = null;
  let isSignupInProgress = false;
  let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  let isEditing = false;
  let currentEditIndex = null;

// 🌟 GIS-AUTH MAIN FUNCTION NEW IMPLEMENTATION 🌟
async function main() {
  try {
    // Load GIS client
    console.log("Loading Google Identity Services client...");
    await new Promise((resolve, reject) => {
      const gisScript = document.createElement("script");
      gisScript.src = "https://accounts.google.com/gsi/client";
      gisScript.onload = () => resolve();
      gisScript.onerror = () =>
        reject(new Error("Failed to load Google Identity Services script."));
      document.head.appendChild(gisScript);
    });

    console.log("Google Identity Services client loaded successfully.");

    // Initialize GIS OAuth 2.0 Token Client
    window.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        "540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com",
      scope:
        "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email",
      prompt: "", // auto prompt if needed
      callback: async (tokenResponse) => {
        try {
          if (tokenResponse.error) {
            console.error("Token error:", tokenResponse);
            return showErrorToUser("Google login failed. Please try again.");
          }

          console.log("✅ GIS token received:", tokenResponse);

          // Store token
          window.gapiToken = tokenResponse.access_token;

          // Load GAPI client
          console.log("Loading Google API client...");
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://apis.google.com/js/api.js";
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error("Failed to load Google API client script."));
            document.head.appendChild(script);
          });

          console.log("Google API client loaded successfully.");

          // Initialize GAPI client with access token
          await gapi.load("client", async () => {
            await gapi.client.init({
              apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
            });
            gapi.client.setToken({ access_token: window.gapiToken });
            console.log("✅ GAPI initialized with token");
            renderProfiles();

            // Set up Google login button
            setupGoogleLoginButton();
          });
        } catch (error) {
          console.error("Error during GIS callback:", error);
          showErrorToUser("An error occurred during Google login.");
        }
      },
    });
  } catch (error) {
    console.error("GIS initialization failed:", error);
    showErrorToUser(
      "Failed to load Google services. Please check your connection and try again."
    );
  }
}

// 🌐 Global DOM element references🔶🔶🔶
const DOM = {
  authContainer: document.getElementById("authContainer"),
  signupPage: document.getElementById("signupPage"),
  loginPage: document.getElementById("loginPage"),
  dashboard: document.getElementById("dashboard"),
  logoutBtn: document.getElementById("logoutBtn"),
  signupForm: document.getElementById("signupForm"),
  loginForm: document.getElementById("loginForm"),
  switchToLogin: document.getElementById("switchToLogin"),
  switchToSignup: document.getElementById("switchToSignup"),
  addPetProfileBtn: document.getElementById("addPetProfileBtn"),
  profileSection: document.getElementById("profileSection"),
  petList: document.getElementById("petList"),
  fullPageBanner: document.getElementById("fullPageBanner"),
  profileForm: document.getElementById("profileForm"),
};

// 🌟 Validate DOM elements and provide user-friendly error feedback
function validateDOMElements() {
  for (const [key, element] of Object.entries(DOM)) {
    if (!element) {
      console.error(`❌ Missing DOM element: ${key}`);
      showErrorToUser(
        `Critical error: Unable to find the required element "${key}". Please contact support.`
      );
    }
  }
}

// Run validation
validateDOMElements();

// 🔶 Runtime origin check
if (!VALID_ORIGINS.includes(window.location.origin)) {
  console.warn(
    `⚠️ Invalid origin detected: ${window.location.origin}. Redirecting to a valid origin.`
  );
  // Provide user-friendly feedback before redirecting
  showErrorToUser(
    "You are being redirected because this application is not supported on the current domain."
  );
  setTimeout(() => {
    window.location.href = "https://drkimogad.github.io/PetStudio";
  }, 3000); // Allow time for the user to read the message
}

// 🔶 HELPER FUNCTION DISABLE UI (MOVE TO TOP)
function disableUI() {
  console.error("❌ Critical Error: Application interface failed to load.");
  document.body.innerHTML = `
    <h1 style="color: red; padding: 2rem; text-align: center">
      Critical Error: Failed to load application interface. Please try refreshing the page or contact support.
    </h1>
  `;
}

// 🌟 MAIN INITIALIZATION
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🔄 Application initialization started...");

  try {
    console.log("🚀 Loading essential scripts...");
    await loadEssentialScripts(); // ✅ This is now valid because the function is async
    console.log("✅ Essential scripts loaded successfully.");

    console.log("🎯 Initializing QR modal...");
    initQRModal(); // Initialize QR modal
    console.log("✅ QR modal initialized successfully.");

    console.log("🎉 Application fully initialized.");
  } catch (error) {
    console.error("❌ Initialization failed:", error.message, error.stack);
    showErrorToUser(
      "Critical error: Unable to initialize the application. Please refresh the page or contact support."
    );
    disableUI(); // Show critical error message and disable UI
  }
});

// 🟢 INITIAL FORM STATE (using our helpers)
try {
  console.log("🔄 Setting initial form states...");
  showAuthForm("login"); // Always show login first
  DOM.dashboard.classList.add("hidden"); // Hide dashboard on load
  DOM.fullPageBanner.classList.remove("hidden");
  DOM.profileSection.classList.add("hidden");
  console.log("✅ Initial form states set successfully.");
} catch (error) {
  console.error("❌ Failed to set initial form states:", error.message, error.stack);
  showErrorToUser(
    "Application error: Unable to set initial form states. Some features may not work as expected."
  );
}


// Auth Helper functions
// 🔶 Auth Helper Functions
function showAuthForm(form) {
  try {
    console.log(`🔄 Switching to ${form} page...`);

    if (!DOM.authContainer || !DOM.loginPage || !DOM.signupPage) {
      throw new Error("Required DOM elements for authentication forms are missing.");
    }

    alert(`Switching to ${form} page`); // Inform user explicitly
    DOM.authContainer.classList.remove("hidden");
    DOM.loginPage.classList.toggle("hidden", form !== "login");
    DOM.signupPage.classList.toggle("hidden", form !== "signup");

    console.log(`✅ Successfully switched to ${form} page.`);
  } catch (error) {
    console.error("❌ Failed to switch authentication forms:", error.message, error.stack);
    showErrorToUser(
      `An error occurred while switching to the ${form} page. Please refresh the page or contact support.`
    );
  }
}

function showDashboard() {
  try {
    console.log("🔄 Switching to dashboard...");

    if (!DOM.authContainer || !DOM.dashboard || !DOM.fullPageBanner || !DOM.profileSection) {
      throw new Error("Required DOM elements for the dashboard are missing.");
    }

    DOM.authContainer.classList.add("hidden");
    DOM.dashboard.classList.remove("hidden");

    // Reset banner/profile state
    DOM.fullPageBanner.classList.remove("hidden");
    DOM.profileSection.classList.add("hidden");

    console.log("✅ Dashboard displayed successfully.");
  } catch (error) {
    console.error("❌ Failed to display the dashboard:", error.message, error.stack);
    showErrorToUser(
      "An error occurred while displaying the dashboard. Please refresh the page or contact support."
    );
  }
}

// 🔶 UI Listeners
// Attach event listener for "Create Account" button
if (DOM.switchToSignup) {
  console.log("✅ 'Create Account' button found. Attaching event listener...");
  DOM.switchToSignup.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("🔄 Switching to sign-up form...");
    showAuthForm("signup"); // Toggle to the sign-up form
  });
} else {
  const errorMsg = "❌ The 'Create Account' button with id='switchToSignup' was not found in the DOM.";
  console.error(errorMsg);
  showErrorToUser("Unable to locate the 'Create Account' button. Please refresh the page or contact support.");
}

// Attach event listener for "Back to Login" button
if (DOM.switchToLogin) {
  console.log("✅ 'Back to Login' button found. Attaching event listener...");
  DOM.switchToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("🔄 Switching to login form...");
    showAuthForm("login"); // Toggle to the login form
  });
} else {
  const errorMsg = "❌ The 'Back to Login' button with id='switchToLogin' was not found in the DOM.";
  console.error(errorMsg);
  showErrorToUser("Unable to locate the 'Back to Login' button. Please refresh the page or contact support.");
}
  
// 🌟 Load essential scripts and initialize application
await loadEssentialScripts();
initQRModal();
console.log("✅ App fully initialized.");

// ⏳ ADD LOADING STATE
document.body.classList.add("loading");

try {
  console.log("🔥 Initializing Firebase...");
  const firebaseInit = await initializeFirebase();
  auth = firebase.auth(app);
  console.log("✅ Firebase initialized successfully.");

  console.log("🔒 Setting authentication persistence...");
  await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
      console.log("✅ Authentication persistence set to LOCAL.");
      console.log("🔄 Initializing authentication listeners...");
      initAuthListeners();
      console.log("✅ Authentication listeners initialized successfully.");

      console.log("🎨 Initializing UI...");
      initUI();
      console.log("✅ UI initialized successfully.");
    })
    .catch((error) => {
      console.error("❌ Persistence error:", error.message, error.stack);
      showErrorToUser(
        "Authentication system failed to initialize. Please refresh the page or contact support."
      );
    });
} catch (error) {
  console.error("❌ Firebase initialization failed:", error.message, error.stack);
  showErrorToUser(
    "Critical error: Unable to initialize Firebase. Please refresh the page or contact support."
  );
} finally {
  console.log("⏳ Removing loading state...");
  document.body.classList.remove("loading");
}


// 🔄 INIT AUTH LISTENERS AFTER FIREBASE / next
// 🔄 Initialize Authentication Listeners
try {
  console.log("🔄 Initializing authentication listeners...");
  initAuthListeners();
  if (!DOM.authContainer) {
    throw new Error("❌ Auth container element is missing in the DOM.");
  }
  console.log("✅ Authentication listeners initialized successfully.");
} catch (error) {
  console.error("❌ Failed to initialize authentication listeners:", error.message, error.stack);
  showErrorToUser(
    "Critical error: Unable to set up authentication. Please refresh the page or contact support."
  );
}

// 🌟 GIS LOGIN BUTTON HANDLER NEW IMPLEMENTATION 🌟
function setupGoogleLoginButton() {
  try {
    console.log("🔄 Setting up Google Sign-In button...");
    
    // Remove existing button if it exists
    const existingBtn = document.getElementById("googleSignInBtn");
    if (existingBtn) {
      console.warn("⚠️ Existing Google Sign-In button found. Removing it...");
      existingBtn.remove();
    }

    // Create and configure the new button
    const btn = document.createElement("button");
    btn.id = "googleSignInBtn";
    btn.className = "auth-btn google-btn";
    btn.innerHTML = `
      <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google logo">
      Continue with Google
    `;

    if (!DOM.authContainer) {
      throw new Error("❌ Auth container element is missing in the DOM.");
    }

    DOM.authContainer.appendChild(btn);
    console.log("✅ Google Sign-In button added successfully.");

    // Attach click event listener
    btn.addEventListener("click", () => {
      console.log("🔄 Google Sign-In button clicked...");
      if (window.tokenClient) {
        console.log("✅ Requesting Google access token...");
        window.tokenClient.requestAccessToken();
      } else {
        console.error("❌ Google Identity Services not ready.");
        showErrorToUser("Google Identity Services are not ready. Please reload the page.");
      }
    });
  } catch (error) {
    console.error("❌ Failed to set up Google Sign-In button:", error.message, error.stack);
    showErrorToUser(
      "An error occurred while setting up Google Sign-In. Please refresh the page or contact support."
    );
  }
}
    
// ✅ MAINTAIN YOUR SCRIPT LOADING ORDER
    await loadEssentialScripts();
// ✅ MAINTAIN YOUR SCRIPT LOADING ORDER
try {
  console.log("🔄 Loading essential scripts...");
  await loadEssentialScripts();
  console.log("✅ Essential scripts loaded successfully.");
} catch (error) {
  console.error("❌ Initialization failed:", error.message, error.stack);
  showErrorToUser(
    "Critical error: Failed to initialize the application. Please refresh the page or contact support."
  );
  disableUI(); // Disable the UI to prevent further actions
} finally {
  console.log("⏳ Removing loading state...");
  document.body.classList.remove("loading");
}

// 🟢 CORRECTED AUTH LISTENER IMPLEMENTATION
function initAuthListeners() {
  try {
    console.log("🔄 Initializing authentication listeners...");

    if (!auth) {
      console.warn("⚠️ Auth not initialized yet. Retrying later...");
      return;
    }

    auth.onAuthStateChanged((user) => {
      console.log("🔄 Auth state changed:", user ? "Authenticated" : "Unauthenticated");

      if (user) {
        console.log("✅ User authenticated. Updating UI...");
        // ✅ Reset flag only when authentication is confirmed
        isSignupInProgress = false;

        if (!DOM.dashboard || !DOM.authContainer) {
          throw new Error("⚠️ Critical DOM elements (dashboard or authContainer) are missing.");
        }

        DOM.dashboard.classList.remove("hidden");
        DOM.authContainer.classList.add("hidden");
        renderProfiles();
      } else {
        console.log("🚪 User not authenticated.");
        // User not authenticated - Respect signup flag
        if (!isSignupInProgress) {
          if (!DOM.dashboard || !DOM.authContainer) {
            throw new Error("⚠️ Critical DOM elements (dashboard or authContainer) are missing.");
          }

          DOM.dashboard.classList.add("hidden");
          DOM.authContainer.classList.remove("hidden");
        }
      }
    });

    console.log("✅ Authentication listeners set up successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize authentication listeners:", error.message, error.stack);
    showErrorToUser(
      "An error occurred while setting up authentication. Please refresh the page or contact support."
    );
  }
}

// 🧩 IMPROVED SCRIPT LOADING
async function loadEssentialScripts() {
  try {
    console.log("🔄 Loading essential scripts...");

    // Initialize Google APIs and render profiles
    console.log("🎯 Loading Google APIs...");
    await loadGAPI();
    console.log("✅ Google APIs loaded successfully.");

    console.log("🎯 Running main application initialization...");
    await main();
    console.log("✅ Application main initialization completed.");

    console.log("🎯 Setting up logout button...");
    setupLogoutButton();
    console.log("✅ Logout button set up successfully.");

    // Wait for Firebase Auth and GAPI Client to be ready
    console.log("⏳ Waiting for Firebase Auth and GAPI Client to be ready...");
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.firebase?.auth && window.gapi?.client) {
          clearInterval(checkInterval);
          console.log("✅ Firebase Auth and GAPI Client are loaded.");
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds if Firebase/GAPI are not ready
      setTimeout(() => {
        clearInterval(checkInterval);
        const errorMsg = "❌ Timeout: Firebase Auth or GAPI Client failed to load.";
        console.error(errorMsg);
        reject(new Error(errorMsg));
      }, 10000);
    });
  } catch (error) {
    console.error("❌ Failed to load essential scripts:", error.message, error.stack);
    showErrorToUser(
      "Critical error: Unable to load essential scripts. Please refresh the page or contact support."
    );
    throw error; // Re-throw the error to handle it in the calling function
  }
}

// 🟢 GAPI LOADER
function loadGAPI() {
  return new Promise((resolve, reject) => {
    try {
      console.log("🔄 Loading Google API client...");

      if (window.gapi) {
        console.log("✅ Google API client already loaded.");
        return resolve();
      }

      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;

      // Event listeners for success and failure
      script.onload = () => {
        console.log("✅ Google API client script loaded successfully.");
        resolve();
      };
      script.onerror = () => {
        const errorMsg = "❌ Failed to load Google API client script.";
        console.error(errorMsg);
        showErrorToUser(
          "Critical error: Unable to load Google API client. Please refresh the page."
        );
        reject(new Error(errorMsg));
      };

      // Append the script to the document head
      document.head.appendChild(script);
    } catch (error) {
      console.error("❌ Unexpected error while loading Google API client:", error.message, error.stack);
      showErrorToUser(
        "An unexpected error occurred while loading Google API client. Please refresh the page."
      );
      reject(error);
    }
  });
}

// 🧩 FIREBASE INIT FUNCTION
async function initializeFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
    authDomain: "swiftreach2025.firebaseapp.com",
    projectId: "swiftreach2025",
    storageBucket: "swiftreach2025.appspot.com",
    messagingSenderId: "540185558422",
    appId: "1:540185558422:web:d560ac90eb1dff3e5071b7",
  };

  try {
    console.log("🔄 Initializing Firebase with the provided configuration...");
    const app = firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized successfully.");

    auth = firebase.auth(app);
    console.log("🔒 Firebase Auth initialized successfully.");

    // Initialize authentication listeners
    console.log("🎯 Initializing authentication listeners...");
    initAuthListeners();
    console.log("✅ Authentication listeners initialized successfully.");

    return { app, auth };
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error.message, error.stack);
    showErrorToUser(
      "Critical error: Failed to initialize Firebase. Please refresh the page or contact support."
    );
    throw error; // Re-throw the error for further handling
  }
}

// 🌟 URL PARAM HANDLING
try {
  console.log("🔄 Parsing URL parameters...");
  const urlParams = new URLSearchParams(window.location.search);

  // Check if the 'profile' parameter is present
  if (urlParams.has("profile")) {
    console.log("🔍 'profile' parameter detected in URL.");

    const profileIndex = parseInt(urlParams.get("profile"), 10);

    // 🔄 IMPROVED VALIDATION
    if (Number.isNaN(profileIndex)) {
      throw new Error("Invalid profile ID: Not a number.");
    }

    console.log(`📂 Requested profile index: ${profileIndex}`);

    // Retrieve valid profiles from localStorage
    const validProfiles = JSON.parse(localStorage.getItem("petProfiles")) || [];
    console.log(`📊 Total profiles available: ${validProfiles.length}`);

    if (validProfiles.length > profileIndex) {
      console.log("✅ Valid profile found. Displaying profile...");
      printProfile(validProfiles[profileIndex]); // Display the requested profile
    } else {
      console.warn("⚠️ Requested profile index out of bounds.");
      showErrorToUser("Requested profile not found.");
      // Clean up the URL to remove invalid query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } else {
    console.log("ℹ️ No 'profile' parameter found in URL.");
  }
} catch (error) {
  console.error("❌ Profile load error:", error.message, error.stack);
  showErrorToUser("Invalid profile URL. Please check the link or try again.");
  // Clean up the URL to remove invalid query parameters
  window.history.replaceState({}, document.title, window.location.pathname);
}

// 🌟 PET PROFILE INIT
try {
  console.log("🔄 Initializing pet profiles...");
  
  if (window.petProfiles?.length > 0) {
    console.log(`✅ Found ${window.petProfiles.length} pet profiles. Rendering profiles...`);
    renderProfiles(); // Render the available pet profiles
  } else {
    console.warn("⚠️ No pet profiles found. Switching to empty state...");
    DOM.petList?.classList.add("empty-state"); // Show an empty state if no profiles are found
  }
} catch (error) {
  console.error("❌ Failed to initialize pet profiles:", error.message, error.stack);
  showErrorToUser(
    "An error occurred while initializing pet profiles. Please refresh the page or contact support."
  );
}

// 🌟 ERROR HANDLING ❌
function showErrorToUser(message) {
  try {
    console.log("⚠️ Displaying error message to user:", message);

    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
      errorDiv.textContent = message; // Update the error message in the DOM
      errorDiv.style.display = "block"; // Show the error message div
      console.log("✅ Error message displayed using error div.");
    } else {
      console.warn("⚠️ Error div not found. Falling back to alert.");
      alert(message); // Fallback to alert if error div is not available
    }
  } catch (fallbackError) {
    console.error(
      "❌ An error occurred while displaying the error message:",
      fallbackError.message,
      fallbackError.stack
    );
    alert(message); // Ensure the message is still shown in case of a secondary error
  }
}

// 🌟🔐 AUTHENTICATION FLOW
async function refreshDriveTokenIfNeeded() {
  try {
    console.log("🔄 Checking if Drive token refresh is needed...");

    if (!auth?.currentUser) {
      throw new Error("No authenticated user. Unable to refresh token.");
    }

    // Retrieve the ID token and its expiration time
    const authResponse = await auth.currentUser.getIdTokenResult();
    const expiration = new Date(authResponse.expirationTime);
    console.log(`📅 Token expiration time: ${expiration.toISOString()}`);

    // Check if the token is expired or about to expire
    if (expiration <= new Date()) {
      console.warn("⚠️ Token expired. Requesting re-authentication...");
      await signInWithRedirect(auth, provider); // Trigger re-authentication
    } else {
      console.log("✅ Token is valid. No re-authentication required.");
    }
  } catch (error) {
    console.error("❌ Token refresh error:", error.message, error.stack);
    showErrorToUser("Session expired - please log in again.");
  }
}

// 🌟 Init UI
function initUI() {
  console.log("🔄 Initializing UI...");
  try {
    // Your existing UI initialization code
    checkAuthState(); // Check the current authentication state
    console.log("✅ UI initialized successfully.");
  } catch (error) {
    console.error("❌ UI initialization error:", error.message, error.stack);
    showErrorToUser("Failed to initialize the UI. Please refresh the page.");
  }
}

// 🌟 FUNCTION CHECK AUTH STATE
async function checkAuthState() {
  try {
    console.log("🔍 Checking authentication state...");
    const user = await auth.currentUser;

    if (user) {
      console.log("✅ User is authenticated. Redirecting to main app...");
      window.location.href = "/main-app"; // Redirect to the main app
    } else {
      console.log("🚪 User is not authenticated. Showing login form...");
      showAuthForm("login"); // Show the login screen
    }
  } catch (error) {
    console.error("❌ Error checking authentication state:", error.message, error.stack);
    showErrorToUser("An error occurred while checking authentication status.");
  }
}

// 🟢 CORRECTED AUTH LISTENER
function initAuthListeners() {
  try {
    console.log("🔄 Initializing authentication listeners...");
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("✅ User authenticated. Showing dashboard...");
        showDashboard(); // Show the dashboard for authenticated users
        renderProfiles(); // Render user-specific profiles
      } else {
        console.log("🚪 User unauthenticated. Showing login form...");
        showAuthForm("login"); // Show the login form for unauthenticated users
      }
    });
    console.log("✅ Authentication listeners initialized successfully.");
  } catch (error) {
    console.error("❌ Error initializing authentication listeners:", error.message, error.stack);
    showErrorToUser(
      "An error occurred while setting up authentication listeners. Please refresh the page."
    );
  }
}

// 🌟 FUNCTION HANDLE AUTH ACTION
function handleAuthAction() {
  try {
    console.log("🔄 Handling authentication action...");
    if (auth && provider) {
      console.log("✅ Redirecting to authentication provider...");
      auth.signInWithRedirect(provider); // Redirect to the authentication provider
    } else {
      throw new Error("Authentication or provider is not configured.");
    }
  } catch (error) {
    console.error("❌ Error handling authentication action:", error.message, error.stack);
    showErrorToUser(
      "An error occurred while attempting to authenticate. Please try again or contact support."
    );
  }
}
// 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
// DRIVE MANAGEMENT  SECTION
// 🔄 Get or Create Drive Folder ID
async function getOrCreateDriveFolderId() {
  try {
    console.log("🔄 Checking for existing 'PetStudio' folder in Google Drive...");
    const response = await gapi.client.drive.files.list({
      q: "name='PetStudio' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id)",
      spaces: "drive",
    });

    if (response.result.files.length > 0) {
      console.log("✅ Found existing 'PetStudio' folder.");
      return response.result.files[0].id;
    }

    console.log("📂 'PetStudio' folder not found. Creating a new folder...");
    const folder = await gapi.client.drive.files.create({
      resource: {
        name: "PetStudio",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });

    console.log("✅ 'PetStudio' folder created successfully:", folder.result.id);
    return folder.result.id;
  } catch (error) {
    console.error("❌ Error in getting or creating Drive folder:", error.message, error.stack);
    throw new Error("Failed to ensure Drive folder existence.");
  }
}

// 💾 Save a Profile to Google Drive
async function saveProfileToDrive(profile) {
  try {
    console.log("🔄 Saving profile to Google Drive...");
    if (!gapi.client.drive) {
      throw new Error("Drive API not initialized.");
    }

    const folderId = await getOrCreateDriveFolderId();

    // Create a unique and clean file name
    const fileName = `${profile.name.replace(/\s+/g, "_")}_${profile.id || Date.now()}.json`;
    const metadata = {
      name: fileName,
      mimeType: "application/json",
      parents: [folderId],
    };

    const fileContent = JSON.stringify({
      ...profile,
      lastUpdated: new Date().toISOString(),
    });

    const file = await gapi.client.drive.files.create({
      resource: metadata,
      media: {
        mimeType: "application/json",
        body: fileContent,
      },
      fields: "id,name,webViewLink",
    });

    console.log("✅ Profile saved to Drive:", file.result);
    return file.result;
  } catch (error) {
    console.error("❌ Failed to save profile to Drive:", error.message, error.stack);
    throw new Error("Drive save failed.");
  }
}

// 🧩 Unified Save Function (Local + Drive + Firestore fallback)
async function savePetProfile(profile) {
  try {
    console.log("🔄 Saving pet profile...");
    if (isEditing) {
      petProfiles[currentEditIndex] = profile;
    } else {
      petProfiles.push(profile);
    }

    // Save to LocalStorage
    localStorage.setItem("petProfiles", JSON.stringify(petProfiles));
    console.log("✅ Profile saved to LocalStorage.");

    // Attempt to save to Google Drive if the user is a Google user
    const isGoogleUser = auth.currentUser?.providerData?.some(
      (p) => p.providerId === "google.com"
    );

    if (isGoogleUser && gapi.client?.drive) {
      try {
        await saveProfileToDrive(profile);
      } catch (driveError) {
        console.warn("⚠️ Drive backup failed. Falling back to Firestore...");
        try {
          await saveToFirestore(profile);
        } catch (firestoreError) {
          console.error("❌ Firestore fallback also failed:", firestoreError.message, firestoreError.stack);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error saving pet profile:", error.message, error.stack);
    showErrorToUser("An error occurred while saving the profile. Please try again.");
  }
}

// 🗑️ Delete function with Drive cleanup
async function deleteProfile(index) {
  const profile = petProfiles[index];

  // Confirm deletion
  if (!confirm("Are you sure you want to delete this profile?")) return;

  // Try to delete from Google Drive if applicable
  const fileId = profile.driveFileId;
  if (fileId) {
    try {
      await deleteProfileFromDrive(fileId, profile.gallery); // Pass gallery here
      console.log("✅ Drive files deleted successfully.");
    } catch (driveError) {
      console.error("❌ Error deleting Drive files:", driveError.message, driveError.stack);
    }
  }

  // Remove the profile from LocalStorage
  petProfiles.splice(index, 1);
  localStorage.setItem("petProfiles", JSON.stringify(petProfiles));
  console.log("✅ Profile deleted locally.");
  renderProfiles();
}

// Helper function to delete pet images and profile file from Google Drive
async function deleteProfileFromDrive(fileId, gallery = []) {
  try {
    console.log("🔄 Deleting profile and gallery files from Google Drive...");

    for (let img of gallery) {
      await deleteImageFromDrive(img); // Assuming `img` contains the Drive fileId
    }

    await gapi.client.drive.files.delete({ fileId });
    console.log("✅ Profile file deleted from Google Drive.");
  } catch (error) {
    console.error("❌ Error deleting profile from Google Drive:", error.message, error.stack);
  }
}

// 🔼 NEW FUNCTION 🌟🌟🌟 Handle Authenticated User
function handleAuthenticatedUser(user) {
  try {
    console.log("✅ Authenticated successfully:", user.uid);
    DOM.dashboard.classList.remove("hidden");
    DOM.authContainer.classList.add("hidden");
    initializeGoogleAPI(); // Ensure Drive is ready
  } catch (error) {
    console.error("❌ Error handling authenticated user:", error.message, error.stack);
    showErrorToUser("An error occurred while setting up the dashboard. Please refresh the page.");
  }
}

// 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
// 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷  
// 🔄 UI UPDATES
renderProfiles(); // Render all pet profiles
DOM.profileSection.classList.add("hidden");
DOM.fullPageBanner.classList.remove("hidden");
isEditing = false;
currentEditIndex = null;

// Add event listener to the "Add Pet Profile" button
DOM.addPetProfileBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("➕ Add Pet Profile button clicked.");
  
  if (!isEditing) {
    console.log("🔄 Resetting profile form for new entry...");
    DOM.profileForm.reset();
    currentEditIndex = null;
  }
  
  console.log("🔄 Switching to add profile view...");
  DOM.fullPageBanner.classList.remove("hidden");
  DOM.profileSection.classList.add("hidden");
});

// 🔷 PROFILE RENDERING FUNCTIONS
function renderProfiles() {
  console.log("🔄 Rendering pet profiles...");
  
  // Clear the profile list before rendering
  DOM.petList.innerHTML = '';

  if (petProfiles.length === 0) {
    console.warn("⚠️ No profiles found. Displaying empty state.");
    DOM.petList.innerHTML = '<p>No profiles available. Please add a pet profile!</p>';
    return;
  }

  // Render each profile
  petProfiles.forEach((profile, index) => {
    console.log(`📄 Rendering profile: ${profile.name} (Index: ${index})`);

    // Create the profile card container
    const petCard = document.createElement("div");
    petCard.classList.add("petCard");
    petCard.id = `pet-card-${profile.id}`; // For compatibility with html2canvas

    // Get cover photo URL and apply as background if available
    const coverPhotoUrl = profile.gallery[profile.coverPhotoIndex];
    const profileHeaderStyle = coverPhotoUrl ? `style="background-image: url('${coverPhotoUrl}');"` : '';

    // Populate the pet card with profile details
    petCard.innerHTML = `
      <div class="profile-header" ${profileHeaderStyle}>
          <h3>${profile.name}</h3>
          <p class="countdown">${getCountdown(profile.birthday)}</p>
      </div>
      <div class="profile-details">
          <p><strong>Breed:</strong> ${profile.breed}</p>
          <p><strong>DOB:</strong> ${profile.dob}</p>
          <p><strong>Next Birthday:</strong> ${profile.birthday}</p>
      </div>
      <div class="gallery-grid">
          ${profile.gallery.map((img, imgIndex) => `
              <div class="gallery-item">
                 <img src="${img}" alt="Pet Photo" onload="this.classList.add('loaded')">
                  <button class="cover-btn ${imgIndex === profile.coverPhotoIndex ? 'active' : ''}" data-index="${imgIndex}">★</button>
              </div>
          `).join('')}
      </div>
      <div class="mood-tracker">
          <div class="mood-buttons">
              <span>Log Mood:</span>
              <button class="mood-btn" data-mood="happy">😊</button>
              <button class="mood-btn" data-mood="neutral">😐</button>
              <button class="mood-btn" data-mood="sad">😞</button>
          </div>
          <div class="mood-history">
              ${renderMoodHistory(profile)}
          </div>
      </div>
      <div class="action-buttons">
          <button class="editBtn">✏️ Edit</button>
          <button class="deleteBtn">🗑️ Delete</button>
          <button class="printBtn">🖨️ Print</button>
          <button class="shareBtn" onclick="sharePetCard(${JSON.stringify(profile)})">📤 Share</button>
          <button class="qrBtn">🔲 QR Code</button>
      </div>
    `;
    
    // =====================
    // EVENT LISTENERS 🌟🌟🌟
    // ===================== 
    // Edit Button
    petCard.querySelector(".editBtn").addEventListener("click", () => {
      console.log(`✏️ Edit button clicked for profile: ${profile.name}`);
      openEditForm(index);
    });

    // Delete Button
    petCard.querySelector(".deleteBtn").addEventListener("click", () => {
      console.log(`🗑️ Delete button clicked for profile: ${profile.name}`);
      deleteProfile(index);
    });

    // Print Button
    petCard.querySelector(".printBtn").addEventListener("click", () => {
      console.log(`🖨️ Print button clicked for profile: ${profile.name}`);
      printProfile(profile);
    });

    // Share Button
    petCard.querySelector(".shareBtn").addEventListener("click", () => {
      console.log(`📤 Share button clicked for profile: ${profile.name}`);
      sharePetCard(profile);
    });

    // QR Button
    petCard.querySelector(".qrBtn").addEventListener("click", () => {
      console.log(`🔲 QR Code button clicked for profile: ${profile.name}`);
      generateQRCode(index);
    });

    // Mood Buttons
    petCard.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log(`😊 Mood button clicked: ${btn.dataset.mood} for profile: ${profile.name}`);
        logMood(index, btn.dataset.mood);
      });
    });

    // Cover Photo Buttons
    petCard.querySelectorAll(".cover-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log(`📷 Cover photo button clicked for image index: ${btn.dataset.index}`);
        setCoverPhoto(index, parseInt(btn.dataset.index));
      });
    });

    // Append the profile card to the pet list
    DOM.petList.appendChild(petCard);
  });

  console.log("✅ Profiles rendered successfully.");
}

// 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷
// 🌟🌟🌟 FUNCTION TO CREATE NEW PROFILES
function createNewProfile() {
  try {
    console.log("➕ Creating a new pet profile...");

    const timestamp = Date.now(); // Generate unique ID based on timestamp

    // Retrieve profile input values
    const name = document.getElementById("petName")?.value.trim();
    const breed = document.getElementById("petBreed")?.value.trim();
    const petDob = document.getElementById("petDob")?.value.trim();
    const birthday = document.getElementById("petBirthday")?.value.trim();

    // Validate required input fields
    if (!name || !breed || !petDob || !birthday) {
      console.warn("⚠️ Missing required fields. Please fill in all fields.");
      showErrorToUser("All fields are required. Please fill them out before proceeding.");
      return;
    }

    // Construct the new profile object
    const newProfile = {
      id: timestamp, // Simple unique ID
      fileName: `pet_${timestamp}`, // 🔒 Stable file name for Drive storage
      name,
      breed,
      petDob,
      birthday,
      gallery: [], // Initialize with an empty gallery
      moodHistory: [], // Initialize with an empty mood history
      coverPhotoIndex: 0, // Default to the first photo
    };

    console.log("📄 New profile created:", newProfile);

    // Add the new profile to the profiles array
    petProfiles.push(newProfile);

    // Save the profile locally and remotely
    console.log("💾 Saving new profile...");
    savePetProfile(newProfile);

    // Re-render the profiles to include the new one
    console.log("🔄 Rendering profiles...");
    renderProfiles();

    console.log("✅ New pet profile successfully created and saved.");
  } catch (error) {
    console.error("❌ Error creating new profile:", error.message, error.stack);
    showErrorToUser("An error occurred while creating the profile. Please try again.");
  }
}
  // 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
// 🌟🌟🌟 DAYS COUNTDOWN FUNCTION
function getCountdown(birthday) {
  try {
    console.log("🔄 Calculating countdown for birthday:", birthday);

    const today = new Date();
    const nextBirthday = new Date(birthday);

    // Validate if the provided date is valid
    if (isNaN(nextBirthday.getTime())) {
      throw new Error("Invalid birthday date provided.");
    }

    // Adjust the year to the closest upcoming birthday
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    // Calculate the difference in days
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    const countdownMessage = `${diffDays} days until birthday! 🎉`;

    console.log("✅ Countdown calculated successfully:", countdownMessage);
    return countdownMessage;
  } catch (error) {
    console.error("❌ Error calculating countdown:", error.message, error.stack);
    return "Invalid date provided. Please check the birthday input.";
  }
}
// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
  // MOOD HISTORY FUNCTION 🌟🌟🌟
// 🌟🌟🌟 RENDER MOOD HISTORY FUNCTION
function renderMoodHistory(profile) {
  try {
    console.log("🔄 Rendering mood history for profile:", profile.name);

    // Check if mood history exists and has entries
    if (!profile.moodHistory || profile.moodHistory.length === 0) {
      console.log("ℹ️ No mood history available for this profile.");
      return "No mood logs yet.";
    }

    // Render the last 7 mood entries
    const moodHistoryHTML = profile.moodHistory
      .slice(-7) // Limit to the last 7 entries
      .map((entry) => {
        const date = sanitizeDate(entry.date);
        const emoji = getMoodEmoji(entry.mood);
        return `${date}: ${emoji}`;
      })
      .join("<br>");

    console.log("✅ Mood history rendered successfully.");
    return moodHistoryHTML;
  } catch (error) {
    console.error("❌ Error rendering mood history:", error.message, error.stack);
    return "An error occurred while loading mood history.";
  }
}

// 🌟🌟🌟 GET MOOD EMOJI FUNCTION
function getMoodEmoji(mood) {
  try {
    console.log("🔄 Converting mood to emoji:", mood);

    // Define mood-to-emoji mapping
    const moodEmojiMap = {
      happy: "😊",
      sad: "😞",
      neutral: "😐",
    };

    // Return the corresponding emoji or a default one if mood is unknown
    const emoji = moodEmojiMap[mood] || "❓";
    console.log("✅ Mood converted to emoji:", emoji);
    return emoji;
  } catch (error) {
    console.error("❌ Error getting mood emoji:", error.message, error.stack);
    return "❓"; // Return a default emoji in case of an error
  }
}

// 🌟 HELPERS: DATE SANITIZATION
function sanitizeDate(date) {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format.");
    }
    return parsedDate.toLocaleDateString(); // Format date to a user-friendly string
  } catch (error) {
    console.error("❌ Error sanitizing date:", error.message, error.stack);
    return "Invalid date"; // Fallback date if parsing fails
  }
}
// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
// 🌟🌟🌟 EDIT PROFILE FUNCTION
function openEditForm(index) {
  try {
    console.log(`✏️ Opening edit form for profile at index: ${index}`);

    isEditing = true; // Mark the state as editing
    currentEditIndex = index; // Track the index of the profile being edited
    const profile = petProfiles[index];

    if (!profile) {
      throw new Error(`Profile at index ${index} does not exist.`);
    }

    // Populate form fields with profile data
    console.log("🔄 Populating form fields with profile data...");
    document.getElementById("petName").value = profile.name || "";
    document.getElementById("petBreed").value = profile.breed || "";
    document.getElementById("petDob").value = profile.petDob || ""; // Ensure `petDob` is used correctly
    document.getElementById("petBirthday").value = profile.birthday || "";

    // Populate mood history into a text area (if it exists)
    const moodInput = document.getElementById("moodHistoryInput");
    if (moodInput) {
      console.log("🔄 Populating mood history...");
      moodInput.value = (profile.moodHistory || [])
        .map((entry) => `${sanitizeDate(entry.date)}: ${entry.mood}`)
        .join("\n");
    } else {
      console.warn("⚠️ Mood history input field not found.");
    }

    // Update UI to show the profile section and hide the full-page banner
    console.log("🔄 Updating UI for editing...");
    DOM.profileSection.classList.remove("hidden");
    DOM.fullPageBanner.classList.add("hidden");

    console.log("✅ Edit form opened successfully.");
  } catch (error) {
    console.error("❌ Error opening edit form:", error.message, error.stack);
    showErrorToUser("An error occurred while opening the edit form. Please try again.");
  }
}

// 🌟 HELPERS: DATE SANITIZATION
function sanitizeDate(date) {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format.");
    }
    return parsedDate.toLocaleDateString(); // Format date to a user-friendly string
  } catch (error) {
    console.error("❌ Error sanitizing date:", error.message, error.stack);
    return "Invalid date"; // Fallback date if parsing fails
  }
}
// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
// 🌟🌟🌟 PRINT PROFILE FUNCTION
function printProfile(profile) {
  try {
    console.log(`🖨️ Preparing to print profile for: ${profile.name}`);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Unable to open print window. Please check your browser settings.");
    }

    const printDocument = printWindow.document;

    // Generate the HTML for the print content
    const html = `
    <html>
      <head>
        <title>${profile.name}'s Profile</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .print-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin: 20px 0;
          }
          .print-gallery img {
            width: 100%;
            height: auto;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${profile.name}'s Profile</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="print-details">
          <p><strong>Breed:</strong> ${profile.breed}</p>
          <p><strong>Date of Birth:</strong> ${profile.dob}</p>
          <p><strong>Next Birthday:</strong> ${profile.birthday}</p>
        </div>
        <h3>Gallery</h3>
        <div class="print-gallery">
          ${profile.gallery.map(imgSrc => 
            `<img src="${imgSrc}" alt="Pet photo">`
          ).join('')}
        </div>
      </body>
    </html>`;

    // Write content to the new document
    printDocument.write(html);
    printDocument.close();

    console.log("📄 Print content written to the new window.");

    // Handle image loading before printing
    const images = printDocument.querySelectorAll("img");
    if (images.length === 0) {
      console.warn("⚠️ No images found in the gallery. Proceeding with print.");
      printWindow.print();
      return;
    }

    let loadedImages = 0;

    // Function to check if all images are loaded before printing
    const checkPrint = () => {
      loadedImages++;
      if (loadedImages === images.length) {
        console.log("✅ All images loaded. Sending to printer...");
        printWindow.print();
      }
    };

    images.forEach(img => {
      if (img.complete) {
        checkPrint(); // If the image is already loaded
      } else {
        img.addEventListener("load", checkPrint); // Wait for the image to load
        img.addEventListener("error", () => {
          console.error("❌ Error loading image:", img.src);
          checkPrint(); // Continue even if an image fails to load
        });
      }
    });
  } catch (error) {
    console.error("❌ Error occurred during profile printing:", error.message, error.stack);
    showErrorToUser("An error occurred while preparing the print. Please try again.");
  }
}


// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀  
// 🌟🌟🌟 SHARE PET CARD FUNCTION
async function sharePetCard(profile) {
  const loader = document.getElementById("processing-loader");
  let shareBtn, originalText; // Moved to parent scope for cleanup

  try {
    console.log(`🔄 Preparing to share profile for: ${profile.name}`);

    // 🚦 SHOW LOADER
    loader.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // 🔄 CAPTURE BUTTON PROPERLY
    shareBtn = event?.target || document.querySelector(`[onclick*="sharePetCard(${profile.id})"]`);
    if (shareBtn) {
      originalText = shareBtn.innerHTML;
      shareBtn.innerHTML = "🔄 Preparing...";
      shareBtn.disabled = true;
    }

    // 1. Generate Shareable Link
    const shareUrl = `${window.location.origin}/PetStudio/?profile=${profile.id}`;
    console.log("✅ Share URL generated:", shareUrl);

    // 2. Try Web Share API
    if (navigator.share) {
      try {
        console.log("🌐 Attempting Web Share API...");
        await navigator.share({
          title: `Meet ${profile.name}! 🐾`,
          text: `Check out ${profile.name}'s profile on PetStudio!`,
          url: shareUrl,
        });
        console.log("✅ Successfully shared using Web Share API.");
        return; // Exit early if sharing is successful
      } catch (error) {
        console.warn("⚠️ Web Share API cancelled or failed:", error.message);
      }
    }

    // 3. Desktop/Image Fallback
    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    if (!cardElement) throw new Error("Card element missing for profile.");

    console.log("🖼️ Capturing pet card using html2canvas...");
    const canvas = await html2canvas(cardElement, {
      useCORS: true,
      scale: 2,
      logging: false,
    });
    const imageUrl = canvas.toDataURL("image/png");

    // 4. Download Handling
    console.log("📥 Preparing download for pet card image...");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageUrl;
    downloadLink.download = `${profile.name}-petstudio.png`.replace(/[^a-z0-9]/gi, "_");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    console.log("✅ Pet card image downloaded successfully.");

    // 5. Clipboard Handling
    console.log("📋 Copying shareable link to clipboard...");
    await navigator.clipboard.writeText(shareUrl);
    showErrorToUser(`${profile.name}'s card saved! 🔗 Link copied to clipboard.`);
  } catch (error) {
    console.error("❌ Sharing failed:", error.message, error.stack);
    showErrorToUser("Sharing failed. Please try again.");
  } finally {
    // 🚦 CLEANUP
    console.log("🔄 Cleaning up loader and button states...");
    loader.classList.add("hidden");
    document.body.style.overflow = "auto";
    if (shareBtn) {
      shareBtn.innerHTML = originalText;
      shareBtn.disabled = false;
    }
  }
}


// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
// 🌟🌟🌟 AGE CALCULATION FUNCTION
function calculateAge(dobString) {
  try {
    console.log("🔄 Calculating age for date of birth:", dobString);

    // Parse the date of birth
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) {
      throw new Error("Invalid date format");
    }

    const today = new Date();

    // Calculate years
    let years = today.getFullYear() - birthDate.getFullYear();

    // Adjust years if the current date is before the birthday this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }

    // Calculate months
    let months = (today.getMonth() - birthDate.getMonth() + 12) % 12;

    // Adjust months to account for the day of the month
    if (today.getDate() < birthDate.getDate()) {
      months = (months + 11) % 12; // Compensate by subtracting another month
    }

    const result = `${years} years, ${months} months`;
    console.log("✅ Age calculated successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error calculating age:", error.message, error.stack);
    return "N/A"; // Return 'N/A' for invalid or missing dates
  }
}
// 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷
// QR CODE MODAL MANAGEMENT 🌟🌟🌟
// GENERATE, PRINT, DOWNLOAD, SHARE AND CLOSE QR CODE
// 🌟🌟🌟 GENERATE QR CODE FUNCTION
function generateQRCode(profileIndex) {
  const savedProfiles = JSON.parse(localStorage.getItem("petProfiles")) || [];
  const currentQRProfile = savedProfiles[profileIndex];
  const modal = document.getElementById("qr-modal");
  const container = document.getElementById("qrcode-container");

  // Clear previous QR code
  container.innerHTML = "";

  // Generate new QR code with error handling
  try {
    if (!currentQRProfile) throw new Error("Profile not found!");

    new QRCode(container, {
      text: `${window.location.origin}/?profile=${currentQRProfile.id}`, // Shortened URL
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  } catch (error) {
    console.error("QR Generation Error:", error);
    alert("QR code generation failed. Profile data might be too large.");
  }
}

// 🌟 PRINT QR CODE FUNCTION
function printQR() {
  try {
    const printContent = document.querySelector("#qr-modal .printable-area").cloneNode(true);
    const printWindow = window.open("", "_blank");

    if (!printWindow) throw new Error("Unable to open print preview window.");

    printWindow.document.write(`
      <html>
        <head><title>Print QR Code</title></head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    console.log("✅ QR Code printed successfully.");
  } catch (error) {
    console.error("❌ Error printing QR Code:", error);
    alert("Failed to print QR Code. Please try again.");
  }
}

// 🌟 DOWNLOAD QR CODE FUNCTION
function downloadQR() {
  try {
    const canvas = document.querySelector("#qrcode-container canvas");

    if (!canvas) throw new Error("QR code canvas not found.");

    const link = document.createElement("a");
    link.download = `${currentQRProfile?.name || "pet_profile"}_qr.png`.replace(/[^a-z0-9]/gi, "_");
    link.href = canvas.toDataURL();
    link.click();

    console.log("✅ QR Code downloaded successfully.");
  } catch (error) {
    console.error("❌ Error downloading QR Code:", error);
    alert("Failed to download QR Code. Please try again.");
  }
}

// 🌟 SHARE QR CODE FUNCTION
async function shareQR() {
  try {
    if (!currentQRProfile) throw new Error("No profile selected for sharing.");

    const shareData = {
      title: `${currentQRProfile.name}'s Pet Profile`,
      text: `Check out ${currentQRProfile.name}'s details!`,
      url: `${window.location.origin}/?profile=${currentQRProfile.id}`,
    };

    if (navigator.share) {
      console.log("🌐 Using Web Share API...");
      await navigator.share(shareData);
    } else {
      console.log("📋 Copying share URL to clipboard...");
      await navigator.clipboard.writeText(shareData.url);
      showQRStatus("Link copied to clipboard!", true);
    }
  } catch (error) {
    console.error("❌ Sharing failed:", error);
    showQRStatus("Sharing failed. Please copy manually.", false);
  }
}

// 🌟 QR MODAL INITIALIZATION FUNCTION
function initQRModal() {
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("qr-modal");

    if (!e.target.closest("#qr-modal")) return;

    if (e.target.classList.contains("qr-print")) {
      printQR();
    } else if (e.target.classList.contains("qr-download")) {
      downloadQR();
    } else if (e.target.classList.contains("qr-share")) {
      shareQR();
    } else if (e.target.classList.contains("qr-close")) {
      modal.style.display = "none";
      document.body.style.overflow = "auto"; // Allow scrolling again
    }
  });
}

// 🌟 QR STATUS HELPER FUNCTION
function showQRStatus(message, isSuccess) {
  const statusEl = document.getElementById("qr-status");

  if (!statusEl) {
    console.warn("⚠️ Status element not found. Skipping status update.");
    return;
  }

  statusEl.textContent = message;
  statusEl.style.color = isSuccess ? "#28a745" : "#dc3545";

  setTimeout(() => {
    statusEl.textContent = "";
    statusEl.style.color = "";
  }, 3000);
}

  // LOG MOOD FUNCTION 🌟🌟🌟  next
// 🌟🌟🌟 LOG MOOD FUNCTION
function logMood(profileIndex, mood) {
  try {
    console.log(`🔄 Logging mood for profile at index: ${profileIndex} with mood: ${mood}`);

    // Validate profile index
    if (profileIndex < 0 || profileIndex >= petProfiles.length) {
      throw new Error("Invalid profile index provided.");
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Ensure moodHistory exists for the profile
    const profile = petProfiles[profileIndex];
    profile.moodHistory = profile.moodHistory || [];

    // Add the new mood entry
    profile.moodHistory.push({
      date: today,
      mood: mood,
    });

    // Save updated profiles to localStorage
    console.log("💾 Saving updated profiles to localStorage...");
    localStorage.setItem("petProfiles", JSON.stringify(petProfiles));

    // Re-render profiles
    console.log("🔄 Re-rendering profiles...");
    renderProfiles();

    // Provide user feedback
    showMoodStatus(`${profile.name}'s mood logged successfully!`, true);
    console.log(`✅ Mood logged successfully for ${profile.name}.`);
  } catch (error) {
    console.error("❌ Error logging mood:", error.message, error.stack);
    showMoodStatus("Failed to log mood. Please try again.", false);
  }
}

// 🌟 MOOD STATUS HELPER
function showMoodStatus(message, isSuccess) {
  const statusEl = document.getElementById("mood-status");
  if (!statusEl) {
    console.warn("⚠️ Mood status element not found. Skipping status update.");
    return;
  }

  statusEl.textContent = message;
  statusEl.style.color = isSuccess ? "#28a745" : "#dc3545";

  setTimeout(() => {
    statusEl.textContent = "";
    statusEl.style.color = "";
  }, 3000);
}

  // SET COVERPHOTO FUNCTION 🌟🌟🌟
// 🌟🌟🌟 SET COVER PHOTO FUNCTION
function setCoverPhoto(profileIndex, imageIndex) {
  try {
    console.log(`🔄 Setting cover photo for profile at index: ${profileIndex}, image index: ${imageIndex}`);

    // Validate profile index
    if (profileIndex < 0 || profileIndex >= petProfiles.length) {
      throw new Error("Invalid profile index provided.");
    }

    const profile = petProfiles[profileIndex];

    // Validate image index
    if (imageIndex < 0 || imageIndex >= profile.gallery.length) {
      throw new Error("Invalid image index provided.");
    }

    // Set the cover photo index
    profile.coverPhotoIndex = imageIndex;

    // Save updated profiles to localStorage
    console.log("💾 Saving updated profiles to localStorage...");
    localStorage.setItem("petProfiles", JSON.stringify(petProfiles));

    // Re-render profiles
    console.log("🔄 Re-rendering profiles...");
    renderProfiles();

    console.log(`✅ Cover photo set successfully for ${profile.name}.`);
  } catch (error) {
    console.error("❌ Error setting cover photo:", error.message, error.stack);
    alert("Failed to set cover photo. Please try again.");
  }
}

// 🌟🌟🌟 FORMAT FIRESTORE DATE FUNCTION
function formatFirestoreDate(dateString) {
  try {
    console.log(`🔄 Formatting date for Firestore: ${dateString}`);

    // Parse the date
    const date = new Date(dateString);

    // Validate date
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format provided.");
    }

    // Return date in "YYYY-MM-DD" format
    const formattedDate = date.toISOString().split("T")[0];
    console.log(`✅ Date formatted successfully: ${formattedDate}`);
    return formattedDate;
  } catch (error) {
    console.error("❌ Error formatting date:", error.message, error.stack);
    return null; // Return null for invalid dates
  }
}
  
// 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷
// 🌟🌟🌟 FORM SUBMISSION
DOM.profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    console.log("🔄 Submitting profile form...");

    // 1️⃣ Hardcoded user ID (temporary until auth implementation)
    const userId = "test-user";

    // 2️⃣ Get form values
    const petName = document.getElementById("petName")?.value.trim();
    const petBreed = document.getElementById("petBreed")?.value.trim();
    const petDob = document.getElementById("petDob")?.value.trim();
    const birthday = document.getElementById("petBirthday")?.value.trim();

    // Validate required fields
    if (!petName || !petBreed || !petDob) {
      throw new Error("Required fields (Name, Breed, DOB) are missing.");
    }

    console.log("✅ Form values captured successfully.");

    // 3️⃣ Handle birthday reminders in Firestore (if birthday is provided)
    if (birthday) {
      const reminderData = {
        userId: userId,
        petName: petName,
        date: formatFirestoreDate(birthday), // "YYYY-MM-DD"
        message: `It's ${petName}'s birthday today. We wish our pawsome friend a fabulous day! 🐾🎉`,
        createdAt: new Date().toISOString(),
      };

      try {
        console.log("🔄 Creating birthday reminder in Firestore...");
        await firebase.firestore().collection("reminders").add(reminderData);
        console.log("✅ Reminder created successfully.");
      } catch (error) {
        console.error("❌ Error creating reminder:", error.message);
      }
    }

    // 4️⃣ Parse Mood Logs
    const moodHistoryInput = document.getElementById("moodHistoryInput");
    const moodHistory =
      moodHistoryInput && moodHistoryInput.value.trim()
        ? moodHistoryInput.value
            .trim()
            .split("\n")
            .map((line) => {
              const [date, mood] = line.split(":");
              return { date: date.trim(), mood: mood.trim() };
            })
        : [];

    console.log("✅ Mood history parsed:", moodHistory);

    // 5️⃣ Build gallery URLs
    const galleryFiles = Array.from(document.getElementById("petGallery")?.files || []);
    const galleryUrls = await Promise.all(
      galleryFiles.map(async (file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        await new Promise((resolve) => {
          img.onerror = resolve;
          img.onload = resolve;
          img.src = url;
        });
        return url;
      })
    );

    console.log("✅ Gallery URLs generated:", galleryUrls);

    // 6️⃣ Build profile object
    const newProfile = {
      id: Date.now(), // Unique ID
      name: petName,
      breed: petBreed,
      dob: petDob,
      birthday: birthday,
      gallery: galleryUrls,
      moodHistory: moodHistory,
      coverPhotoIndex: 0, // Default cover photo
    };

    console.log("✅ New profile object created:", newProfile);

    // 7️⃣ Update profiles array
    if (isEditing) {
      petProfiles[currentEditIndex] = newProfile;
      console.log(`✏️ Profile edited at index: ${currentEditIndex}`);
    } else {
      petProfiles.push(newProfile);
      console.log("➕ New profile added to the profiles array.");
    }

    // 8️⃣ Save updated profiles to localStorage
    console.log("💾 Saving profiles to localStorage...");
    localStorage.setItem("petProfiles", JSON.stringify(petProfiles));

    // 9️⃣ Hide the form and banner
    DOM.profileSection.classList.add("hidden");

    // 🔟 Reset form fields
    DOM.profileForm.reset();

    // 🔄 Re-render profiles
    renderProfiles();

    // ⬆️ Scroll to top
    window.scrollTo(0, 0);

    console.log("✅ Profile form submission completed successfully.");
  } catch (error) {
    console.error("❌ Error during form submission:", error.message, error.stack);
    alert("Form submission failed. Please check your inputs and try again.");
  }
});
  
// 🟢🟢🟢AUTH FUNCTIONS🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢    
// 🌟🌟🌟 SIGN UP HANDLER
DOM.signupForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  try {
    console.log("🔄 Starting signup process...");

    isSignupInProgress = true; // ⭐ FLAG SET ON SUBMIT

    // Get form values
    const username = DOM.signupForm.querySelector("#signupEmail")?.value.trim();
    const password = DOM.signupForm.querySelector("#signupPassword")?.value.trim();
    const email = `${username}@petstudio.com`;

    // Validate inputs
    if (!username || !password) {
      showAuthError("Please fill all fields.");
      isSignupInProgress = false;
      return;
    }

    if (password.length < 6) {
      showAuthError("Password must be at least 6 characters long.");
      isSignupInProgress = false;
      return;
    }

    console.log("✅ Input validation successful.");

    // Disable submit button during signup
    const submitButton = DOM.signupForm.querySelector("button[type='submit']");
    submitButton.disabled = true;

    // Create user with email and password
    console.log("🔄 Creating user with email and password...");
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log("✅ Signup successful. Resetting form and showing login form.");
        DOM.signupForm.reset(); // Reset form fields
        showAuthForm("login"); // Immediately show login form
      })
      .catch((error) => {
        console.error("❌ Signup error:", error.message);
        showAuthError(error.message); // Display error message to user
      })
      .finally(() => {
        console.log("🔄 Resetting signup progress.");
        isSignupInProgress = false;
        submitButton.disabled = false; // Re-enable submit button
      });
  } catch (error) {
    console.error("❌ Unexpected error during signup:", error.message, error.stack);
    showAuthError("An unexpected error occurred. Please try again.");
    isSignupInProgress = false;
  }
});
  
// 🌟🌟🌟 LOGIN HANDLER
DOM.loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  try {
    console.log("🔄 Starting login process...");

    // Get form values
    const username = DOM.loginForm.querySelector("#loginEmail")?.value.trim();
    const password = DOM.loginForm.querySelector("#loginPassword")?.value.trim();
    const email = `${username}@petstudio.com`;

    // Validate inputs
    if (!username || !password) {
      showAuthError("Please fill all fields.");
      return;
    }

    console.log("✅ Input validation successful.");

    // Disable submit button during login
    const submitBtn = DOM.loginForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    // Sign in with email and password
    console.log("🔄 Attempting to log in...");
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log("✅ Login successful. Redirecting to dashboard...");
        showDashboard(); // Redirect to the dashboard after successful login
      })
      .catch((error) => {
        console.error("❌ Login error:", error.message);

        // Map Firebase error codes to user-friendly messages
        let errorMessage = "Login failed: ";
        if (error.code === "auth/wrong-password") {
          errorMessage += "Wrong password.";
        } else if (error.code === "auth/user-not-found") {
          errorMessage += "User not found.";
        } else {
          errorMessage += error.message;
        }

        // Display error message to user
        showAuthError(errorMessage);
      })
      .finally(() => {
        console.log("🔄 Resetting login button state...");
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In"; // Restore button text
      });
  } catch (error) {
    console.error("❌ Unexpected error during login:", error.message, error.stack);
    showAuthError("An unexpected error occurred. Please try again.");
  }
});

// 🌟🌟🌟 LOGOUT HANDLER
function setupLogoutButton() {
  DOM.logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      console.log("🔄 Logging out...");

      // Attempt to sign out
      await auth.signOut();

      console.log("✅ Logout successful. Redirecting to home page...");
      window.location.href = "/PetStudio/"; // Full redirect to the home page
    } catch (error) {
      console.error("❌ Logout failed:", error.message);

      // Provide user feedback
      alert("Logout failed. Please try again.");
    }
  });
}
// 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
// 🌟🌟🌟 SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('🔄 Attempting to register Service Worker...');

    // Register the Service Worker with proper path and scope
    navigator.serviceWorker
      .register('/PetStudio/service-worker.js', {
        scope: '/PetStudio/',
      })
      .then((registration) => {
        console.log('✅ Service Worker registered successfully for scope:', registration.scope);

        // Optional: Listen for updates in the Service Worker
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            console.log('🔄 New Service Worker update found.');
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('✨ New Service Worker installed. A page refresh is recommended.');
                } else {
                  console.log('🎉 Service Worker installed for the first time. Ready to use offline!');
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error.message, error.stack);
      });
  });
}

// 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
// 🌟🌟🌟 PUSH NOTIFICATIONS LOGIC
// 🟢 Global VAPID Configuration
const VAPID_PUBLIC_KEY = 'BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk';
const VERCEL_API = 'https://pet-studio.vercel.app/api/save-subscription';

// 🟢 Push Notification Subscription
async function subscribeUserToPushNotifications(registration) {
  try {
    console.log("🔄 Checking existing push subscription...");
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      console.log("✅ Already subscribed:", existingSubscription);
      return await sendSubscriptionToServer(existingSubscription); // Send existing subscription to server
    }

    console.log("🔄 Creating new push subscription...");
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log("✅ Push subscription successful:", newSubscription);
    await sendSubscriptionToServer(newSubscription); // Send new subscription to server
  } catch (error) {
    console.error("❌ Subscription failed:", error.message, error.stack);
  }
}

// 🟢 Send Subscription to Vercel API
async function sendSubscriptionToServer(subscription) {
  try {
    console.log("🔄 Sending subscription to Vercel API...");
    const user = auth.currentUser;

    if (!user) {
      console.error("❌ User not authenticated. Subscription cannot be saved.");
      return;
    }

    const response = await fetch(`${VERCEL_API}/save-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify({
        subscription,
        userId: user.uid,
        vapidPublicKey: VAPID_PUBLIC_KEY,
      }),
    });

    if (!response.ok) throw new Error("Vercel API rejected subscription");
    console.log("✅ Subscription saved via Vercel API.");
  } catch (error) {
    console.error("❌ Subscription sync failed:", error.message, error.stack);
    throw error; // Re-throw error for further handling if needed
  }
}

// 🟢 Helper Function: VAPID Key Conversion
function urlBase64ToUint8Array(base64String) {
  console.log("🔄 Converting VAPID key...");
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const byteArray = Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  console.log("✅ VAPID key converted successfully.");
  return byteArray;
}

// 🟢 Initialize Push Notifications
async function initializePushNotifications() {
  if (!('serviceWorker' in navigator)) {
    console.warn("⚠️ Service Workers are not supported in this browser.");
    return;
  }

  try {
    console.log("🔄 Registering Service Worker for Push Notifications...");
    const registration = await navigator.serviceWorker.register('/PetStudio/service-worker.js', {
      scope: '/PetStudio/',
    });

    console.log("✅ Service Worker registered successfully:", registration.scope);

    // Subscribe user to push notifications
    await subscribeUserToPushNotifications(registration);
  } catch (error) {
    console.error("❌ Push Notifications initialization failed:", error.message, error.stack);
  }
}

// 🟢 Initialize Profiles and Push Notifications
if (petProfiles.length > 0) {
  console.log("🔄 Rendering profiles...");
  renderProfiles(); // Render profiles if available
  initializePushNotifications(); // Initialize Push Notifications
}
