  // ======================
  // State Management
  // ======================
  let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  let isEditing = false;
  let currentEditIndex = null;

  // ======================
  // Auth Form Switching
  // ======================
  if (switchToLogin && switchToSignup) {
    switchToLogin.addEventListener("click", () => {
      signupPage.classList.add("hidden");
      loginPage.classList.remove("hidden");
    });

    switchToSignup.addEventListener("click", () => {
      loginPage.classList.add("hidden");
      signupPage.classList.remove("hidden");
    });
  }

  // ======================
  // Auth Functions (UPDATED)
  // ======================

  // Sign Up Handler
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = signupForm.querySelector("#signupEmail").value.trim();
    const password = signupForm.querySelector("#signupPassword").value.trim();
    const email = `${username}@petstudio.com`;

    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const submitBtn = signupForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        // Sign out immediately after signup
        return auth.signOut();
      })
      .then(() => {
        alert("Account created! Please log in.");
        signupForm.reset();
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
        document.getElementById("loginEmail").value = username;
      })
      .catch((error) => {
        alert("Error: " + error.message);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
      });
  });

  // Login Handler
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = loginForm.querySelector("#loginEmail")?.value.trim();
    const password = loginForm.querySelector("#loginPassword")?.value.trim();
    const email = `${username}@petstudio.com`;

    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const submitBtn = loginForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    auth.signInWithEmailAndPassword(email, password)
      .catch((error) => {
        let errorMessage = "Login failed: ";
        if (error.code === "auth/wrong-password") errorMessage += "Wrong password";
        else if (error.code === "auth/user-not-found") errorMessage += "User not found";
        else errorMessage += error.message;
        alert(errorMessage);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In";
      });
  });
  // Logout Handler (FIXED)
  function setupLogoutButton() {
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        auth.signOut()
          .then(() => {
            authContainer.classList.remove("hidden");
            dashboard.classList.add("hidden");
            loginPage.classList.remove("hidden");
            signupPage.classList.add("hidden");
          })
          .catch((error) => {
            alert("Logout error: " + error.message);
          });
      });
    }
  }

  // Auth State Observer //
  auth.onAuthStateChanged(async (user) => {
    if (user) {


      // =============================================
      // EXISTING UI CODE (unchanged)
      // =============================================
      authContainer.classList.add("hidden");
      dashboard.classList.remove("hidden");
      profileSection.classList.add("hidden");
      fullPageBanner.classList.remove("hidden");

      if (logoutBtn) {
        logoutBtn.style.display = "block";
        setupLogoutButton();
      }

      if (petProfiles.length > 0) {
        renderProfiles();
      } else {
        petList.innerHTML = '';
      }

    } else {
      // =============================================
      // NEW: Show Google Sign-In button when logged out
      // =============================================
      const googleSignInContainer = document.getElementById('googleSignInContainer');
      if (!googleSignInContainer) {
        const container = document.createElement('div');
        container.id = 'googleSignInContainer';
        container.innerHTML = `
        <button id="googleSignInBtn" class="auth-btn google-btn">
          <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google logo">
          Continue with Google
        </button>
      `;
        authContainer.insertBefore(container, loginPage);

        document.getElementById('googleSignInBtn').addEventListener('click', () => {
          auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        });
      }

      // =============================================
      // EXISTING LOGOUT CODE (unchanged)
      // =============================================
      authContainer.classList.remove("hidden");
      dashboard.classList.add("hidden");
      if (logoutBtn) logoutBtn.style.display = "none";

      loginPage?.classList.remove("hidden");
      signupPage?.classList.add("hidden");
    }
  });
  // ======================
  // Google Sign-In Handler - NEW FUNCTION
  // ======================
  function handleGoogleSignIn() {
    // Check if authContainer exists
    if (!authContainer) {
      console.error('authContainer not found');
      return;
    }
    const googleBtn = document.createElement('div');
    googleBtn.id = 'googleSignIn';
    googleBtn.innerHTML = '<button class="google-btn">Sign in with Google</button>';
    authContainer.appendChild(googleBtn);

    googleBtn.querySelector('button').addEventListener('click', () => {
      auth.signInWithPopup(provider)
        .then(async (result) => {
          // Initialize Drive API with Google token
          await initDriveAPI(result.credential.accessToken);
        })
        .catch((error) => {
          console.error("Google sign-in error:", error);
          // Fallback to email/password if needed
        });
    });
  }
export {
  petProfiles,
  isEditing,
  currentEditIndex,
  setupLogoutButton,
  handleGoogleSignIn
};
