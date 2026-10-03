// ========================================
// VELTARA INVESTMENT PLATFORM
// Functional Demo Dashboard
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


  if (authMode === "signup") {

    if (password.length < 6) {

      toast(
        "Password must contain at least 6 characters."
      );

      return;
    }

    const user = {
      email,
      password
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

    setTimeout(showApplication, 400);

    return;
  }


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

    toast("Incorrect email or password.");

    return;
  }


  localStorage.setItem(
    "veltaraLoggedIn",
    "true"
  );

  toast("Login successful!");

  setTimeout(showApplication, 400);
});


// ========================================
// APPLICATION
// ========================================

function showApplication() {

  $("#authScreen").classList.add("hidden");

  $("#app").classList.remove("hidden");

  addProfileNavigation();

  addProfilePage();
}


function checkLogin() {

  const loggedIn =
    localStorage.getItem("veltaraLoggedIn");

  if (loggedIn === "true") {

    showApplication();

  }
}


checkLogin();


// ========================================
// PROFILE NAVIGATION
// ========================================

function addProfileNavigation() {

  const nav = document.querySelector(".sidebar nav");

  if (!nav) return;

  if (document.querySelector('[data-page="profile"]')) {
    return;
  }

  const profileButton =
    document.createElement("button");

  profileButton.className = "nav-item";

  profileButton.dataset.page = "profile";

  profileButton.innerHTML = `
    <span>♙</span>
    Profile
  `;

  nav.appendChild(profileButton);

  profileButton.addEventListener("click", () => {
    openPage("profile");
  });
}


// ========================================
// PROFILE PAGE
// ========================================

function addProfilePage() {

  if ($("#profile")) return;

  const main =
    document.querySelector(".main-content");

  const footer =
    main.querySelector("footer");

  const profile =
    document.createElement("section");

  profile.id = "profile";

  profile.className = "page hidden";

  const savedUser =
    JSON.parse(
      localStorage.getItem("veltaraUser") || "null"
    );

  const email =
    savedUser?.email || "investor@example.com";

  profile.innerHTML = `

    <div class="profile-page">

      <div class="profile-heading">
        <span class="eyebrow">
          ACCOUNT SETTINGS
        </span>

        <h2>Your Profile</h2>

        <p>
          Manage your Veltara demo account.
        </p>
      </div>


      <div class="profile-card">

        <div class="large-avatar">
          I
        </div>

        <div>
          <strong>Investor</strong>

          <span>
            Demo account
          </span>
        </div>

      </div>


      <div class="profile-form">

        <label>
          Full name

          <input
            id="profileName"
            type="text"
            value="Investor"
          >
        </label>


        <label>
          Email address

          <input
            id="profileEmail"
            type="email"
            value="${email}"
          >
        </label>


        <label>
          Investment preference

          <select id="riskPreference">

            <option>Conservative</option>
            <option selected>Moderate</option>
            <option>Aggressive</option>

          </select>
        </label>


        <button
          class="primary-button"
          id="saveProfile"
        >
          Save Changes
        </button>

      </div>


      <div class="profile-options">

        <button data-profile-action="security">
          <strong>Security</strong>
          <span>Manage your account security</span>
        </button>


        <button data-profile-action="notifications">
          <strong>Notifications</strong>
          <span>Manage investment notifications</span>
        </button>


        <button data-profile-action="help">
          <strong>Help & Support</strong>
          <span>Get help with your account</span>
        </button>

      </div>


      <div class="notice">
        Veltara is currently a demonstration interface.
        No real financial account or investment transaction
        is connected.
      </div>

    </div>
  `;

  main.insertBefore(profile, footer);


  $("#saveProfile").addEventListener("click", () => {

    const name =
      $("#profileName").value.trim();

    if (!name) {

      toast("Please enter your name.");

      return;
    }

    toast("Profile updated successfully.");
  });


  profile
    .querySelectorAll("[data-profile-action]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const action =
          button.dataset.profileAction;

        if (action === "security") {

          toast(
            "Security settings opened."
          );

        }

        if (action === "notifications") {

          toast(
            "Notification settings opened."
          );

        }

        if (action === "help") {

          toast(
            "Support center opened."
          );
        }

      });

    });
}


// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {

  document
    .querySelectorAll(".nav-item")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const page =
          button.dataset.page;

        openPage(page);

      });

    });
}

setupNavigation();


// ========================================
// OPEN PAGE
// ========================================

function openPage(pageName) {

  document
    .querySelectorAll(".nav-item")
    .forEach((button) => {

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

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ========================================
// MODAL SYSTEM
// ========================================

function openModal(title, content) {

  closeModal();

  const modal =
    document.createElement("div");

  modal.id = "veltaraModal";

  modal.className = "modal-overlay";

  modal.innerHTML = `

    <div class="modal-card">

      <button
        class="modal-close"
        id="modalClose"
      >
        ×
      </button>

      <h2>${title}</h2>

      <div class="modal-content">
        ${content}
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  $("#modalClose").addEventListener(
    "click",
    closeModal
  );

  modal.addEventListener("click", (event) => {

    if (
      event.target === modal
    ) {

      closeModal();

    }

  });
}


function closeModal() {

  const modal =
    $("#veltaraModal");

  if (modal) {

    modal.remove();

  }
}


// ========================================
// DEPOSIT
// ========================================

function openDeposit() {

  openModal(
    "Deposit Funds",
    `

      <p>
        Add funds to your Veltara demo wallet.
      </p>

      <label class="modal-label">
        Amount

        <input
          id="depositAmount"
          type="number"
          placeholder="100000"
          min="1000"
        >
      </label>

      <button
        class="primary-button full-width"
        id="confirmDeposit"
      >
        Deposit
      </button>

      <div class="notice">
        Demo only. No money will actually be transferred.
      </div>
    `
  );


  $("#confirmDeposit").addEventListener(
    "click",
    () => {

      const amount =
        Number($("#depositAmount").value);

      if (!amount || amount < 1000) {

        toast(
          "Enter an amount of at least ₦1,000."
        );

        return;
      }

      closeModal();

      toast(
        `Demo deposit of ₦${amount.toLocaleString()} created.`
      );

    }
  );
}


// ========================================
// WITHDRAW
// ========================================

function openWithdraw() {

  openModal(
    "Withdraw Funds",
    `

      <p>
        Request a withdrawal from your demo wallet.
      </p>

      <label class="modal-label">
        Amount

        <input
          id="withdrawAmount"
          type="number"
          placeholder="50000"
          min="1000"
        >
      </label>

      <button
        class="primary-button full-width"
        id="confirmWithdraw"
      >
        Withdraw
      </button>

      <div class="notice">
        Demo only. No real withdrawal will occur.
      </div>
    `
  );


  $("#confirmWithdraw").addEventListener(
    "click",
    () => {

      const amount =
        Number($("#withdrawAmount").value);

      if (!amount || amount < 1000) {

        toast(
          "Enter an amount of at least ₦1,000."
        );

        return;
      }

      closeModal();

      toast(
        `Demo withdrawal of ₦${amount.toLocaleString()} created.`
      );

    }
  );
}


// ========================================
// INVESTMENT PLANS
// ========================================

function openPlans() {

  openModal(
    "Investment Plans",
    `

      <div class="modal-plan">

        <div>
          <strong>Balanced Growth</strong>

          <small>
            12 months • 12.6% target
          </small>
        </div>

        <button
          class="primary-button"
          data-modal-invest="Balanced Growth"
        >
          Select
        </button>

      </div>


      <div class="modal-plan">

        <div>
          <strong>Long-Term Wealth</strong>

          <small>
            10 year horizon
          </small>
        </div>

        <button
          class="primary-button"
          data-modal-invest="Long-Term Wealth"
        >
          Select
        </button>

      </div>

      <div class="notice">
        These are demonstration plans and do not represent
        an offer to provide investment services.
      </div>
    `
  );


  document
    .querySelectorAll("[data-modal-invest]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const plan =
          button.dataset.modalInvest;

        closeModal();

        toast(
          `${plan} selected for this demo.`
        );

      });

    });
}


// ========================================
// PORTFOLIO DETAILS
// ========================================

function openPortfolioDetails() {

  openModal(
    "Portfolio Details",
    `

      <div class="detail-row">
        <span>Total invested</span>
        <strong>₦2,500,000</strong>
      </div>

      <div class="detail-row">
        <span>Current returns</span>
        <strong class="green">₦312,680</strong>
      </div>

      <div class="detail-row">
        <span>Growth</span>
        <strong class="green">+12.6%</strong>
      </div>

      <div class="detail-row">
        <span>Risk profile</span>
        <strong>Moderate</strong>
      </div>

      <div class="notice">
        Portfolio values shown here are demo figures.
      </div>
    `
  );
}


// ========================================
// ASSET ALLOCATION
// ========================================

function openAllocation() {

  openModal(
    "Asset Allocation",
    `

      <p>
        Current demonstration allocation:
      </p>

      <div class="allocation-edit">

        <label>
          Nigerian equities
          <input type="range" value="35">
        </label>

        <label>
          Bonds & T-bills
          <input type="range" value="25">
        </label>

        <label>
          Global ETFs
          <input type="range" value="20">
        </label>

        <label>
          REITs
          <input type="range" value="10">
        </label>

        <label>
          Cash
          <input type="range" value="10">
        </label>

      </div>

      <button
        class="primary-button full-width"
        id="saveAllocation"
      >
        Save Allocation
      </button>
    `
  );


  $("#saveAllocation").addEventListener(
    "click",
    () => {

      closeModal();

      toast(
        "Asset allocation updated for this demo."
      );

    }
  );
}


// ========================================
// REFERRAL
// ========================================

function openReferral() {

  openModal(
    "Refer & Earn",
    `

      <div class="referral-box">

        <strong>
          Invite friends to Veltara
        </strong>

        <p>
          Share your referral code with friends.
        </p>

        <div class="referral-code">
          VELTARA2026
        </div>

        <button
          class="primary-button full-width"
          id="copyReferral"
        >
          Copy Referral Code
        </button>

      </div>
    `
  );


  $("#copyReferral").addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          "VELTARA2026"
        );

        toast(
          "Referral code copied."
        );

      } catch {

        toast(
          "Referral code: VELTARA2026"
        );

      }

    }
  );
}


// ========================================
// ACTIVITY
// ========================================

function openActivity() {

  openModal(
    "Recent Activity",
    `

      <div class="detail-row">
        <span>Monthly Investment</span>
        <strong class="green">
          + ₦100,000
        </strong>
      </div>

      <div class="detail-row">
        <span>Investment Return</span>
        <strong class="green">
          + ₦18,750
        </strong>
      </div>

      <div class="detail-row">
        <span>Portfolio Review</span>
        <strong>
          Completed
        </strong>
      </div>

    `
  );
}


// ========================================
// QUICK ACTION HANDLERS
// ========================================

document
  .querySelectorAll("[data-action]")
  .forEach((button) => {

    button.addEventListener("click", () => {

      const action =
        button.dataset.action;

      switch (action) {

        case "invest":

          openPage("invest");

          break;


        case "deposit":

          openDeposit();

          break;


        case "withdraw":

          openWithdraw();

          break;


        case "plans":

          openPlans();

          break;


        case "refer":

          openReferral();

          break;


        case "details":

          openPortfolioDetails();

          break;


        case "activity":

          openActivity();

          break;


        case "adjust":

          openAllocation();

          break;


        case "investNow":

          toast(
            "Demo investment selected. No real money was invested."
          );

          break;

        default:

          break;
      }

    });

  });


// ========================================
// BALANCE VISIBILITY
// ========================================

let balanceVisible = true;

$("#toggleBalance").addEventListener(
  "click",
  () => {

    balanceVisible =
      !balanceVisible;

    $("#balanceAmount").textContent =
      balanceVisible
        ? "₦3,712,680"
        : "••••••••";

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