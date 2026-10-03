// ========================================
// VELTARA INVESTMENT PLATFORM
// Complete Functional Demo
// ========================================


// ========================================
// GLOBAL HELPERS
// ========================================

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) =>
  document.querySelectorAll(selector);


const DEFAULT_BALANCE = 3712680;

let balanceVisible = true;


function toast(message) {

  const toastBox = $("#toast");

  if (!toastBox) return;

  toastBox.textContent = message;

  toastBox.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {

    toastBox.classList.remove("show");

  }, 2500);
}


function formatMoney(amount) {

  return `₦${Number(amount).toLocaleString("en-NG")}`;

}


// ========================================
// WALLET STORAGE
// ========================================

function getWallet() {

  let wallet =
    JSON.parse(
      localStorage.getItem("veltaraWallet") || "null"
    );


  if (!wallet) {

    wallet = {

      balance: DEFAULT_BALANCE,

      transactions: [

        {
          type: "Monthly Investment",
          amount: 100000,
          direction: "in",
          date: "Today"
        },

        {
          type: "Investment Return",
          amount: 18750,
          direction: "in",
          date: "Yesterday"
        }

      ]

    };


    localStorage.setItem(
      "veltaraWallet",
      JSON.stringify(wallet)
    );

  }


  return wallet;
}


function saveWallet(wallet) {

  localStorage.setItem(
    "veltaraWallet",
    JSON.stringify(wallet)
  );

}


// ========================================
// BALANCE DISPLAY
// ========================================

function updateBalanceDisplay() {

  const wallet = getWallet();


  const balanceElement =
    $("#balanceAmount");


  const walletBalance =
    document.querySelector(".wallet-balance");


  if (balanceElement) {

    balanceElement.textContent =
      balanceVisible
        ? formatMoney(wallet.balance)
        : "••••••••";

  }


  if (walletBalance) {

    walletBalance.textContent =
      formatMoney(wallet.balance);

  }

}


// ========================================
// AUTHENTICATION
// ========================================

let authMode = "login";


function updateAuthScreen() {

  const title =
    $("#authTitle");

  const description =
    $("#authDescription");

  const buttonText =
    $("#authButtonText");

  const switchButton =
    $("#switchAuth");


  if (!title) return;


  if (authMode === "login") {

    title.textContent =
      "Welcome back";

    description.textContent =
      "Sign in to your investment dashboard.";

    buttonText.textContent =
      "Sign in";

    switchButton.textContent =
      "Create an account";

  } else {

    title.textContent =
      "Create your account";

    description.textContent =
      "Create a demo account to explore Veltara.";

    buttonText.textContent =
      "Create account";

    switchButton.textContent =
      "I already have an account";

  }

}


// ========================================
// AUTH FORM
// ========================================

function setupAuthentication() {

  const authForm =
    $("#authForm");

  const switchAuth =
    $("#switchAuth");


  if (!authForm) return;


  switchAuth.addEventListener(
    "click",
    () => {

      authMode =
        authMode === "login"
          ? "signup"
          : "login";

      updateAuthScreen();

    }
  );


  authForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const email =
        $("#email").value
          .trim()
          .toLowerCase();


      const password =
        $("#password").value;


      if (!email || !password) {

        toast(
          "Please enter your email and password."
        );

        return;

      }


      // ====================================
      // CREATE ACCOUNT
      // ====================================

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


        // Create wallet if user has none
        if (
          !localStorage.getItem("veltaraWallet")
        ) {

          saveWallet({

            balance: DEFAULT_BALANCE,

            transactions: [

              {
                type: "Monthly Investment",
                amount: 100000,
                direction: "in",
                date: "Today"
              },

              {
                type: "Investment Return",
                amount: 18750,
                direction: "in",
                date: "Yesterday"
              }

            ]

          });

        }


        toast(
          "Account created successfully!"
        );


        setTimeout(
          showApplication,
          400
        );


        return;

      }


      // ====================================
      // LOGIN
      // ====================================

      const savedUser =
        JSON.parse(
          localStorage.getItem(
            "veltaraUser"
          ) || "null"
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


      toast(
        "Login successful!"
      );


      setTimeout(
        showApplication,
        400
      );

    }
  );

}


// ========================================
// SHOW APPLICATION
// ========================================

function showApplication() {

  const authScreen =
    $("#authScreen");

  const app =
    $("#app");


  if (authScreen) {

    authScreen.classList.add("hidden");

  }


  if (app) {

    app.classList.remove("hidden");

  }


  addProfileNavigation();

  addProfilePage();

  updateBalanceDisplay();

  renderRecentActivity();

}


// ========================================
// CHECK LOGIN
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


// ========================================
// PROFILE NAVIGATION
// ========================================

function addProfileNavigation() {

  const nav =
    document.querySelector(
      ".sidebar nav"
    );


  if (!nav) return;


  if (
    document.querySelector(
      '[data-page="profile"]'
    )
  ) {

    return;

  }


  const button =
    document.createElement("button");


  button.className =
    "nav-item";


  button.dataset.page =
    "profile";


  button.innerHTML = `
    <span>♙</span>
    Profile
  `;


  nav.appendChild(button);


  button.addEventListener(
    "click",
    () => {

      openPage("profile");

    }
  );

}


// ========================================
// PROFILE PAGE
// ========================================

function addProfilePage() {

  if ($("#profile")) return;


  const main =
    document.querySelector(
      ".main-content"
    );


  if (!main) return;


  const footer =
    main.querySelector("footer");


  const profile =
    document.createElement("section");


  profile.id =
    "profile";


  profile.className =
    "page hidden";


  const savedUser =
    JSON.parse(
      localStorage.getItem(
        "veltaraUser"
      ) || "null"
    );


  const email =
    savedUser?.email ||
    "investor@example.com";


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

          <strong>
            Investor
          </strong>

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

            <option>
              Conservative
            </option>

            <option selected>
              Moderate
            </option>

            <option>
              Aggressive
            </option>

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

        <button
          data-profile-action="security"
        >

          <strong>
            Security
          </strong>

          <span>
            Manage your account security
          </span>

        </button>


        <button
          data-profile-action="notifications"
        >

          <strong>
            Notifications
          </strong>

          <span>
            Manage investment notifications
          </span>

        </button>


        <button
          data-profile-action="help"
        >

          <strong>
            Help & Support
          </strong>

          <span>
            Get help with your account
          </span>

        </button>

      </div>


      <div class="notice">

        Veltara is currently a demonstration interface.
        No real financial account or investment transaction
        is connected.

      </div>

    </div>

  `;


  if (footer) {

    main.insertBefore(
      profile,
      footer
    );

  } else {

    main.appendChild(profile);

  }


  const saveButton =
    $("#saveProfile");


  if (saveButton) {

    saveButton.addEventListener(
      "click",
      () => {

        const name =
          $("#profileName")
            .value
            .trim();


        if (!name) {

          toast(
            "Please enter your name."
          );

          return;

        }


        toast(
          "Profile updated successfully."
        );

      }
    );

  }


  profile
    .querySelectorAll(
      "[data-profile-action]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const action =
            button.dataset.profileAction;


          if (
            action === "security"
          ) {

            toast(
              "Security settings opened."
            );

          }


          if (
            action === "notifications"
          ) {

            toast(
              "Notification settings opened."
            );

          }


          if (
            action === "help"
          ) {

            toast(
              "Support center opened."
            );

          }

        }
      );

    });

}


// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {

  $$(".nav-item")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.page;


          if (page) {

            openPage(page);

          }

        }
      );

    });

}


// ========================================
// OPEN PAGE
// ========================================

function openPage(pageName) {

  $$(".nav-item")
    .forEach((button) => {

      button.classList.remove(
        "active"
      );


      if (
        button.dataset.page ===
        pageName
      ) {

        button.classList.add(
          "active"
        );

      }

    });


  $$(".page")
    .forEach((page) => {

      page.classList.add(
        "hidden"
      );

    });


  const page =
    document.getElementById(
      pageName
    );


  if (page) {

    page.classList.remove(
      "hidden"
    );

  }


  if (
    pageName === "wallet"
  ) {

    updateBalanceDisplay();

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ========================================
// MODAL
// ========================================

function closeModal() {

  const modal =
    $("#veltaraModal");


  if (modal) {

    modal.remove();

  }

}


function openModal(
  title,
  content
) {

  closeModal();


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "veltaraModal";


  modal.className =
    "modal-overlay";


  modal.innerHTML = `

    <div class="modal-card">

      <button
        class="modal-close"
        id="modalClose"
      >
        ×
      </button>

      <h2>
        ${title}
      </h2>

      <div class="modal-content">

        ${content}

      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  const closeButton =
    $("#modalClose");


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeModal
    );

  }


  modal.addEventListener(
    "click",
    (event) => {

      if (
        event.target === modal
      ) {

        closeModal();

      }

    }
  );

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

        Demo only.
        No money will actually be transferred.

      </div>

    `
  );


  const button =
    $("#confirmDeposit");


  if (!button) return;


  button.addEventListener(
    "click",
    () => {

      const amount =
        Number(
          $("#depositAmount").value
        );


      if (
        !amount ||
        amount < 1000
      ) {

        toast(
          "Enter an amount of at least ₦1,000."
        );

        return;

      }


      const wallet =
        getWallet();


      wallet.balance =
        wallet.balance + amount;


      wallet.transactions.unshift({

        type: "Deposit",

        amount: amount,

        direction: "in",

        date: "Just now"

      });


      saveWallet(wallet);


      closeModal();


      updateBalanceDisplay();


      renderRecentActivity();


      toast(
        `${formatMoney(amount)} deposited successfully.`
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

        Demo only.
        No real withdrawal will occur.

      </div>

    `
  );


  const button =
    $("#confirmWithdraw");


  if (!button) return;


  button.addEventListener(
    "click",
    () => {

      const amount =
        Number(
          $("#withdrawAmount").value
        );


      if (
        !amount ||
        amount < 1000
      ) {

        toast(
          "Enter an amount of at least ₦1,000."
        );

        return;

      }


      const wallet =
        getWallet();


      if (
        amount > wallet.balance
      ) {

        toast(
          "Insufficient demo wallet balance."
        );

        return;

      }


      wallet.balance =
        wallet.balance - amount;


      wallet.transactions.unshift({

        type: "Withdrawal",

        amount: amount,

        direction: "out",

        date: "Just now"

      });


      saveWallet(wallet);


      closeModal();


      updateBalanceDisplay();


      renderRecentActivity();


      toast(
        `${formatMoney(amount)} withdrawn successfully.`
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

          <strong>
            Balanced Growth
          </strong>

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

          <strong>
            Long-Term Wealth
          </strong>

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


  $$("[data-modal-invest]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const plan =
            button.dataset.modalInvest;


          closeModal();


          toast(
            `${plan} selected for this demo.`
          );

        }
      );

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

        <span>
          Total invested
        </span>

        <strong>
          ₦2,500,000
        </strong>

      </div>


      <div class="detail-row">

        <span>
          Current returns
        </span>

        <strong class="green">
          ₦312,680
        </strong>

      </div>


      <div class="detail-row">

        <span>
          Growth
        </span>

        <strong class="green">
          +12.6%
        </strong>

      </div>


      <div class="detail-row">

        <span>
          Risk profile
        </span>

        <strong>
          Moderate
        </strong>

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

          <input
            type="range"
            value="35"
          >

        </label>


        <label>

          Bonds & T-bills

          <input
            type="range"
            value="25"
          >

        </label>


        <label>

          Global ETFs

          <input
            type="range"
            value="20"
          >

        </label>


        <label>

          REITs

          <input
            type="range"
            value="10"
          >

        </label>


        <label>

          Cash

          <input
            type="range"
            value="10"
          >

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


  const button =
    $("#saveAllocation");


  if (button) {

    button.addEventListener(
      "click",
      () => {

        closeModal();

        toast(
          "Asset allocation updated for this demo."
        );

      }
    );

  }

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


  const button =
    $("#copyReferral");


  if (button) {

    button.addEventListener(
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

}


// ========================================
// RECENT ACTIVITY
// ========================================

function renderRecentActivity() {

  const activity =
    document.querySelector(
      ".activity-card"
    );


  if (!activity) return;


  const wallet =
    getWallet();


  const transactions =
    wallet.transactions.slice(
      0,
      5
    );


  activity.innerHTML =
    transactions.map(
      (transaction) => {

        const incoming =
          transaction.direction === "in";


        const sign =
          incoming
            ? "+"
            : "-";


        const icon =
          incoming
            ? "＋"
            : "↗";


        return `

          <div class="activity-row">

            <div class="activity-icon">
              ${icon}
            </div>


            <div>

              <strong>
                ${transaction.type}
              </strong>

              <small>
                ${transaction.date} • Wallet
              </small>

            </div>


            <b
              class="${incoming ? "green" : ""}"
            >
              ${sign}
              ${formatMoney(transaction.amount)}
            </b>

          </div>

        `;

      }
    ).join("");

}


// ========================================
// ACTIVITY MODAL
// ========================================

function openActivity() {

  const wallet =
    getWallet();


  const transactions =
    wallet.transactions.slice(
      0,
      10
    );


  const content =
    transactions.map(
      (transaction) => {

        const incoming =
          transaction.direction === "in";


        return `

          <div class="detail-row">

            <span>
              ${transaction.type}
            </span>

            <strong
              class="${incoming ? "green" : ""}"
            >
              ${incoming ? "+" : "-"}
              ${formatMoney(transaction.amount)}
            </strong>

          </div>

        `;

      }
    ).join("");


  openModal(
    "Recent Activity",
    content
  );

}


// ========================================
// QUICK ACTIONS
// ========================================

function setupActions() {

  $$("[data-action]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

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

          }

        }
      );

    });

}


// ========================================
// BALANCE TOGGLE
// ========================================

function setupBalanceToggle() {

  const toggle =
    $("#toggleBalance");


  if (!toggle) return;


  toggle.addEventListener(
    "click",
    () => {

      balanceVisible =
        !balanceVisible;


      updateBalanceDisplay();

    }
  );

}


// ========================================
// LOGOUT
// ========================================

function setupLogout() {

  const logout =
    $("#logoutButton");


  if (!logout) return;


  logout.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "veltaraLoggedIn"
      );


      location.reload();

    }
  );

}


// ========================================
// INITIALIZE EVERYTHING
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateAuthScreen();

    setupAuthentication();

    setupNavigation();

    setupActions();

    setupBalanceToggle();

    setupLogout();

    updateBalanceDisplay();

    checkLogin();

  }
);