const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const DEFAULT_BALANCE = 3712680;

let balanceVisible = true;
let authMode = "login";

/* =========================
   TOAST
========================= */

function toast(message) {
  let toastBox = $("#toast");

  if (!toastBox) {
    toastBox = document.createElement("div");
    toastBox.id = "toast";
    toastBox.className = "toast";
    document.body.appendChild(toastBox);
  }

  toastBox.textContent = message;
  toastBox.classList.add("show");

  setTimeout(() => {
    toastBox.classList.remove("show");
  }, 3000);
}


/* =========================
   MONEY FORMAT
========================= */

function formatMoney(amount) {
  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return "₦0";
  }

  return (
    "₦" +
    number.toLocaleString("en-NG", {
      maximumFractionDigits: 0
    })
  );
}


/* =========================
   WALLET
========================= */

function saveWallet(wallet) {
  localStorage.setItem(
    "veltaraWallet",
    JSON.stringify(wallet)
  );
}


function getWallet() {
  const rawWallet = localStorage.getItem("veltaraWallet");

  let wallet = null;

  try {
    wallet = rawWallet
      ? JSON.parse(rawWallet)
      : null;
  } catch (error) {
    wallet = null;
  }

  if (!wallet || typeof wallet !== "object") {
    wallet = {};
  }

  /*
    IMPORTANT:
    Always convert balance into a number.
    This prevents problems like:

    "3712680" + 100000

    becoming:

    "3712680100000"
  */

  const numericBalance = Number(wallet.balance);

  if (Number.isFinite(numericBalance)) {
    wallet.balance = numericBalance;
  } else {
    wallet.balance = DEFAULT_BALANCE;
  }

  if (!Array.isArray(wallet.transactions)) {
    wallet.transactions = [
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
    ];
  }

  saveWallet(wallet);

  return wallet;
}


/* =========================
   BALANCE DISPLAY
========================= */

function updateBalanceDisplay() {
  const wallet = getWallet();

  const balanceElement = $("#balanceAmount");
  const walletBalance = document.querySelector(
    ".wallet-balance"
  );

  if (balanceElement) {
    if (balanceVisible) {
      balanceElement.textContent =
        formatMoney(wallet.balance);
    } else {
      balanceElement.textContent = "••••••••";
    }
  }

  if (walletBalance) {
    walletBalance.textContent =
      formatMoney(wallet.balance);
  }
}


/* =========================
   AUTH SCREEN
========================= */

function updateAuthScreen() {
  const title = $("#authTitle");
  const description = $("#authDescription");
  const buttonText = $("#authButtonText");
  const switchAuth = $("#switchAuth");

  if (authMode === "login") {
    if (title) {
      title.textContent = "Welcome back";
    }

    if (description) {
      description.textContent =
        "Login to continue to your Veltara dashboard.";
    }

    if (buttonText) {
      buttonText.textContent = "Login";
    }

    if (switchAuth) {
      switchAuth.textContent =
        "Don't have an account? Create account";
    }
  } else {
    if (title) {
      title.textContent = "Create your account";
    }

    if (description) {
      description.textContent =
        "Create your Veltara account to start managing your investments.";
    }

    if (buttonText) {
      buttonText.textContent = "Create Account";
    }

    if (switchAuth) {
      switchAuth.textContent =
        "Already have an account? Login";
    }
  }
}


/* =========================
   AUTHENTICATION
========================= */

function setupAuthentication() {
  const form = $("#authForm");
  const switchAuth = $("#switchAuth");

  if (switchAuth) {
    switchAuth.addEventListener("click", (event) => {
      event.preventDefault();

      authMode =
        authMode === "login"
          ? "signup"
          : "login";

      updateAuthScreen();
    });
  }

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput = $("#email");
    const passwordInput = $("#password");

    if (!emailInput || !passwordInput) {
      return;
    }

    const email = emailInput.value
      .trim()
      .toLowerCase();

    const password = passwordInput.value;

    if (!email || !password) {
      toast("Please enter your email and password.");
      return;
    }

    if (authMode === "signup") {
      createAccount(email, password);
    } else {
      login(email, password);
    }
  });
}


/* =========================
   CREATE ACCOUNT
========================= */

function createAccount(email, password) {
  const existingUser = localStorage.getItem(
    "veltaraUser"
  );

  if (existingUser) {
    toast(
      "An account already exists. Please login."
    );

    authMode = "login";
    updateAuthScreen();

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

  /*
    Only create the wallet if one doesn't already exist.
  */

  if (!localStorage.getItem("veltaraWallet")) {
    const wallet = {
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

    saveWallet(wallet);
  }

  toast("Account created successfully.");

  showApplication();
}


/* =========================
   LOGIN
========================= */

function login(email, password) {
  const savedUser = localStorage.getItem(
    "veltaraUser"
  );

  if (!savedUser) {
    toast(
      "No account found. Please create an account first."
    );
    return;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch (error) {
    toast("Account data is invalid.");
    return;
  }

  if (
    email !== user.email ||
    password !== user.password
  ) {
    toast("Incorrect email or password.");
    return;
  }

  localStorage.setItem(
    "veltaraLoggedIn",
    "true"
  );

  toast("Login successful.");

  showApplication();
}


/* =========================
   SHOW APP
========================= */

function showApplication() {
  const authScreen = $("#authScreen");
  const app = $("#app");

  if (authScreen) {
    authScreen.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }

  updateBalanceDisplay();
  renderRecentActivity();
}


/* =========================
   CHECK LOGIN
========================= */

function checkLogin() {
  const loggedIn =
    localStorage.getItem("veltaraLoggedIn");

  if (loggedIn === "true") {
    showApplication();
  }
}


/* =========================
   NAVIGATION
========================= */

function setupNavigation() {
  const navItems = $$(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;

      if (!page) {
        return;
      }

      openPage(page);
    });
  });
}


function openPage(pageName) {
  const pages = $$(".page");

  pages.forEach((page) => {
    page.classList.add("hidden");
  });

  const selectedPage = $(`#${pageName}`);

  if (selectedPage) {
    selectedPage.classList.remove("hidden");
  }

  const navItems = $$(".nav-item");

  navItems.forEach((item) => {
    item.classList.remove("active");

    if (item.dataset.page === pageName) {
      item.classList.add("active");
    }
  });

  updateBalanceDisplay();

  if (pageName === "wallet") {
    renderRecentActivity();
  }
}


/* =========================
   ACTION BUTTONS
========================= */

function setupActions() {
  const actions = $$("[data-action]");

  actions.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      switch (action) {
        case "deposit":
          openDeposit();
          break;

        case "withdraw":
          openWithdraw();
          break;

        case "invest":
          openInvest();
          break;

        case "plans":
          openPlans();
          break;

        case "refer":
          openRefer();
          break;

        default:
          break;
      }
    });
  });
}


/* =========================
   MODAL
========================= */

function openModal(title, content) {
  closeModal();

  const modal = document.createElement("div");

  modal.id = "veltaraModal";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button type="button" id="closeModal">
          ×
        </button>
      </div>

      <div class="modal-content">
        ${content}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeButton = $("#closeModal");

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeModal
    );
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}


function closeModal() {
  const modal = $("#veltaraModal");

  if (modal) {
    modal.remove();
  }
}


/* =========================
   DEPOSIT
========================= */

function openDeposit() {
  openModal(
    "Deposit Funds",
    `
      <div class="form-group">
        <label for="depositAmount">
          Amount
        </label>

        <input
          id="depositAmount"
          type="number"
          min="1000"
          placeholder="Enter amount"
        />
      </div>

      <button
        type="button"
        id="confirmDeposit"
        class="primary-button"
      >
        Deposit Funds
      </button>
    `
  );

  const button = $("#confirmDeposit");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const input = $("#depositAmount");

    if (!input) {
      return;
    }

    const amount = Number(input.value);

    if (!Number.isFinite(amount) || amount < 1000) {
      toast(
        "Minimum deposit is ₦1,000."
      );
      return;
    }

    const wallet = getWallet();

    /*
      IMPORTANT:
      Convert both values to numbers before adding.
    */

    wallet.balance =
      Number(wallet.balance) +
      Number(amount);

    wallet.transactions.unshift({
      type: "Deposit",
      amount: Number(amount),
      direction: "in",
      date: "Just now"
    });

    saveWallet(wallet);

    /*
      Update the screen immediately.
    */

    updateBalanceDisplay();
    renderRecentActivity();

    closeModal();

    toast(
      `${formatMoney(amount)} deposited successfully.`
    );
  });
}


/* =========================
   WITHDRAW
========================= */

function openWithdraw() {
  openModal(
    "Withdraw Funds",
    `
      <div class="form-group">
        <label for="withdrawAmount">
          Amount
        </label>

        <input
          id="withdrawAmount"
          type="number"
          min="1000"
          placeholder="Enter amount"
        />
      </div>

      <button
        type="button"
        id="confirmWithdraw"
        class="primary-button"
      >
        Withdraw Funds
      </button>
    `
  );

  const button = $("#confirmWithdraw");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const input = $("#withdrawAmount");

    if (!input) {
      return;
    }

    const amount = Number(input.value);

    if (!Number.isFinite(amount) || amount < 1000) {
      toast(
        "Minimum withdrawal is ₦1,000."
      );
      return;
    }

    const wallet = getWallet();

    wallet.balance = Number(wallet.balance);

    if (amount > wallet.balance) {
      toast("Insufficient balance.");
      return;
    }

    wallet.balance =
      wallet.balance -
      Number(amount);

    wallet.transactions.unshift({
      type: "Withdrawal",
      amount: Number(amount),
      direction: "out",
      date: "Just now"
    });

    saveWallet(wallet);

    updateBalanceDisplay();
    renderRecentActivity();

    closeModal();

    toast(
      `${formatMoney(amount)} withdrawn successfully.`
    );
  });
}


/* =========================
   INVEST
========================= */

function openInvest() {
  openModal(
    "Invest",
    `
      <p>
        Choose an investment plan from your
        Veltara portfolio.
      </p>

      <button
        type="button"
        id="goToInvestments"
        class="primary-button"
      >
        View Investment Plans
      </button>
    `
  );

  const button = $("#goToInvestments");

  if (button) {
    button.addEventListener("click", () => {
      closeModal();
      openPage("invest");
    });
  }
}


/* =========================
   PLANS
========================= */

function openPlans() {
  closeModal();
  openPage("invest");
}


/* =========================
   REFER
========================= */

function openRefer() {
  openModal(
    "Refer & Earn",
    `
      <p>
        Invite friends to Veltara and earn
        rewards when they join.
      </p>

      <div class="detail-row">
        <span>Your referral code</span>
        <strong>VELTARA2026</strong>
      </div>

      <button
        type="button"
        id="copyReferral"
        class="primary-button"
      >
        Copy Referral Code
      </button>
    `
  );

  const button = $("#copyReferral");

  if (button) {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(
          "VELTARA2026"
        );

        toast("Referral code copied.");
      } catch (error) {
        toast("Referral code: VELTARA2026");
      }
    });
  }
}


/* =========================
   BALANCE TOGGLE
========================= */

function setupBalanceToggle() {
  const button = $("#toggleBalance");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    balanceVisible = !balanceVisible;

    updateBalanceDisplay();
  });
}


/* =========================
   RECENT ACTIVITY
========================= */

function renderRecentActivity() {
  const container =
    $("#recentActivity");

  if (!container) {
    return;
  }

  const wallet = getWallet();

  if (
    !wallet.transactions ||
    wallet.transactions.length === 0
  ) {
    container.innerHTML = `
      <div class="activity-row">
        <span>No activity yet.</span>
      </div>
    `;

    return;
  }

  container.innerHTML =
    wallet.transactions
      .slice(0, 10)
      .map((transaction) => {
        const isIncoming =
          transaction.direction === "in";

        const sign = isIncoming
          ? "+"
          : "-";

        const amountClass = isIncoming
          ? "green"
          : "";

        return `
          <div class="activity-row">
            <div>
              <strong>
                ${transaction.type}
              </strong>

              <small>
                ${transaction.date}
              </small>
            </div>

            <strong class="${amountClass}">
              ${sign}
              ${formatMoney(
                transaction.amount
              )}
            </strong>
          </div>
        `;
      })
      .join("");
}


/* =========================
   LOGOUT
========================= */

function setupLogout() {
  const logoutButton =
    $("#logoutButton");

  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener(
    "click",
    () => {
      localStorage.removeItem(
        "veltaraLoggedIn"
      );

      const app = $("#app");
      const authScreen = $("#authScreen");

      if (app) {
        app.classList.add("hidden");
      }

      if (authScreen) {
        authScreen.classList.remove("hidden");
      }

      authMode = "login";

      updateAuthScreen();

      toast("Logged out successfully.");
    }
  );
}


/* =========================
   INITIALIZE APP
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    updateAuthScreen();

    /*
      Create/repair the wallet immediately.
    */
    getWallet();

    setupAuthentication();
    setupNavigation();
    setupActions();
    setupBalanceToggle();
    setupLogout();

    updateBalanceDisplay();
    renderRecentActivity();

    checkLogin();
  }
);