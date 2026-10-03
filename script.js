// ========================================
// VELTARA INVESTMENT PLATFORM
// Demo Frontend Authentication & Dashboard
// ========================================

const $ = (selector) => document.querySelector(selector);

const toast = (message) => {
  const toastBox = $("#toast");

  toastBox.textContent = message;
  toastBox.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toastBox.classList.remove("show");
  }, 2500);
};


// ========================================
// AUTHENTICATION
// ========================================

let authMode = "login";

const authForm = $("#authForm");
const authTitle = $("#authTitle");
const authDescription = $("#authDescription");
const authButtonText = $("#authButtonText");
const switchAuth = $("#switchAuth");


function updateAuthScreen() {

  if (authMode === "login") {

    authTitle.textContent = "Welcome back";

    authDescription.textContent =
      "Sign in to your investment dashboard.";

    authButtonText.textContent = "Sign in";

    switchAuth.textContent =
      "Create an account";

  } else {

    authTitle.textContent =
      "Create your account";

    authDescription.textContent =
      "Create a demo account to explore Veltara.";

    authButtonText.textContent =
      "Create account";

    switchAuth.textContent =
      "I already have an account";
  }
}


switchAuth.addEventListener("click", () => {

  authMode =
    authMode === "login"
      ? "signup"
      : "login";

  updateAuthScreen();
});


authForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const email =
    $("#email").value.trim().toLowerCase();

  const password =
    $("#password").value;

  if (!email || !password) {

    toast("Please enter your email and password.");

    return;
  }


  // CREATE ACCOUNT

  if (authMode === "signup") {

    if (password.length < 6) {

      toast(
        "Password must contain at least 6 characters."
      );

      return;
    }


    const user = {
      email: email,
      password: password
    };


    localStorage.setItem(
      "veltaraUser",
      JSON.stringify(user)
    );


    localStorage.setItem(
      "veltaraLoggedIn",
      "true"
    );


    toast("Account created successfully!");

    setTimeout(() => {

      showApplication();

    }, 500);

    return;
  }


  // LOGIN

  const savedUser =
    JSON.parse(
      localStorage.getItem("veltaraUser") || "null"
    );


  if (!savedUser) {

    toast(
      "No account found. Please create an account first."
    );

    return;
  }


  if (
    savedUser.email !== email ||
    savedUser.password !== password
  ) {

    toast(
      "Incorrect email or password."
    );

    return;
  }


  localStorage.setItem(
    "veltaraLoggedIn",
    "true"
  );


  toast("Login successful!");

  setTimeout(() => {

    showApplication();

  }, 400);
});


// ========================================
// SHOW APPLICATION
// ========================================

function showApplication() {

  $("#authScreen").classList.add("hidden");

  $("#app").classList.remove("hidden");
}


// ========================================
// AUTO LOGIN
// ========================================

function checkLogin() {

  const loggedIn =
    localStorage.getItem(
      "veltaraLoggedIn"
    );

  if (loggedIn === "true") {

    showApplication();

  }
}


checkLogin();


// ========================================
// NAVIGATION
// ========================================

const navigationButtons =
  document.querySelectorAll(".nav-item");


navigationButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const page =
      button.dataset.page;


    // Update active navigation

    navigationButtons.forEach((item) => {

      item.classList.remove("active");

    });

    button.classList.add("active");


    // Hide every page

    document
      .querySelectorAll(".page")
      .forEach((section) => {

        section.classList.add("hidden");

      });


    // Show selected page

    const selectedPage =
      document.getElementById(page);


    if (selectedPage) {

      selectedPage.classList.remove("hidden");

    }

  });

});


// ========================================
// QUICK ACTIONS
// ========================================

const actionButtons =
  document.querySelectorAll(
    "[data-action]"
  );


actionButtons.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const action =
        button.dataset.action;


      switch (action) {


        // ------------------------------
        // INVEST
        // ------------------------------

        case "invest":

        case "plans":

          openPage("invest");

          break;


        // ------------------------------
        // DEPOSIT
        // ------------------------------

        case "deposit":

          toast(
            "Deposit flow is currently a demo."
          );

          break;


        // ------------------------------
        // WITHDRAW
        // ------------------------------

        case "withdraw":

          toast(
            "Withdrawal flow is currently a demo."
          );

          break;


        // ------------------------------
        // REFERRAL
        // ------------------------------

        case "refer":

          toast(
            "Referral rewards are coming soon."
          );

          break;


        // ------------------------------
        // DETAILS
        // ------------------------------

        case "details":

          toast(
            "Portfolio analytics opened."
          );

          break;


        // ------------------------------
        // ACTIVITY
        // ------------------------------

        case "activity":

          toast(
            "Showing recent account activity."
          );

          break;


        // ------------------------------
        // ALLOCATION
        // ------------------------------

        case "adjust":

          toast(
            "Asset allocation editor coming soon."
          );

          break;


        // ------------------------------
        // INVEST NOW
        // ------------------------------

        case "investNow":

          toast(
            "Demo investment selected. No real money was invested."
          );

          break;


        default:

          break;
      }

    }
  );

});


// ========================================
// OPEN PAGE FUNCTION
// ========================================

function openPage(pageName) {

  navigationButtons.forEach((button) => {

    button.classList.remove("active");

    if (
      button.dataset.page === pageName
    ) {

      button.classList.add("active");

    }

  });


  document
    .querySelectorAll(".page")
    .forEach((page) => {

      page.classList.add("hidden");

    });


  const page =
    document.getElementById(pageName);


  if (page) {

    page.classList.remove("hidden");

  }
}


// ========================================
// BALANCE VISIBILITY
// ========================================

let balanceVisible = true;


$("#toggleBalance").addEventListener(
  "click",
  () => {

    balanceVisible =
      !balanceVisible;


    if (balanceVisible) {

      $("#balanceAmount").textContent =
        "₦3,712,680";

    } else {

      $("#balanceAmount").textContent =
        "••••••••";

    }

  }
);


// ========================================
// LOGOUT
// ========================================

$("#logoutButton").addEventListener(
  "click",
  () => {

    localStorage.removeItem(
      "veltaraLoggedIn"
    );

    location.reload();

  }
);


// ========================================
// INITIALIZE
// ========================================

updateAuthScreen();
