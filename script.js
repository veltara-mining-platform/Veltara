const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const DEFAULT_BALANCE = 3712680;

let authMode = "login";
let balanceVisible = true;


/* =========================
   MONEY
========================= */

function formatMoney(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}


/* =========================
   TOAST
========================= */

function toast(message) {
  const box = $("#toast");

  if (!box) {
    alert(message);
    return;
  }

  box.textContent = message;
  box.classList.add("show");

  setTimeout(() => {
    box.classList.remove("show");
  }, 3000);
}


/* =========================
   WALLET
========================= */

function getWallet() {
  let wallet = null;

  try {
    wallet = JSON.parse(
      localStorage.getItem("veltaraWallet")
    );
  } catch (error) {
    wallet = null;
  }

  if (!wallet || typeof wallet !== "object") {
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
  }

  wallet.balance = Number(wallet.balance);

  if (!Number.isFinite(wallet.balance)) {
    wallet.balance = DEFAULT_BALANCE;
  }

  if (!Array.isArray(wallet.transactions)) {
    wallet.transactions = [];
  }

  localStorage.setItem(
    "veltaraWallet",
    JSON.stringify(wallet)
  );

  return wallet;
}


function saveWallet(wallet) {
  localStorage.setItem(
    "veltaraWallet",
    JSON.stringify(wallet)
  );
}


/* =========================
   UPDATE BALANCE
========================= */

function updateBalanceDisplay() {
  const wallet = getWallet();

  const balance = $("#balanceAmount");
  const walletBalance =
    document.querySelector(".wallet-balance");

  if (balance) {
    balance.textContent = balanceVisible
      ? formatMoney(wallet.balance)
      : "••••••••";
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
  const switchButton = $("#switchAuth");

  if (authMode === "login") {
    title.textContent = "Welcome back";

    description.textContent =
      "Sign in to your investment dashboard.";

    buttonText.textContent = "Sign in";

    switchButton.textContent =
      "Create an account";
  } else {
    title.textContent = "Create your account";

    description.textContent =
      "Create an account to access your dashboard.";

    buttonText.textContent =
      "Create Account";

    switchButton.textContent =
      "Already have an account? Sign in";
  }
}


/* =========================
   AUTHENTICATION
========================= */

function setupAuthentication() {
  const form = $("#authForm");
  const switchButton = $("#switchAuth");

  if (switchButton) {
    switchButton.addEventListener("click", () => {
      authMode =
        authMode === "login"
          ? "signup"
          : "login";

      updateAuthScreen();
    });
  }

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email =
      $("#email").value.trim().toLowerCase();

    const password =
      $("#password").value;

    if (!email || !password) {
      toast("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      toast("Password must be at least 6 characters.");
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
  const existingUser =
    localStorage.getItem("veltaraUser");

  if (existingUser) {
    toast(
      "An account already exists. Please sign in."
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

  getWallet();

  toast("Account created successfully.");

  showApplication();
}


/* =========================
   LOGIN
========================= */

function login(email, password) {
  const savedUser =
    localStorage.getItem("veltaraUser");

  if (!savedUser) {
    toast(
      "No account exists yet. Please create an account."
    );

    authMode = "signup";
    updateAuthScreen();

    return;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch (error) {
    localStorage.removeItem("veltaraUser");

    toast(
      "Account data was corrupted. Please create a new account."
    );

    authMode = "signup";
    updateAuthScreen();

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
   SHOW APPLICATION
========================= */

function showApplication() {
  const auth = $("#authScreen");
  const app = $("#app");

  if (auth) {
    auth.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }

  updateBalanceDisplay();
  renderActivity();
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
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const page =
        button.dataset.page;

      openPage(page);
    });
  });
}


function openPage(pageName) {
  $$(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  const page = $(`#${pageName}`);

  if (page) {
    page.classList.remove("hidden");
  }

  $$(".nav-item").forEach((button) => {
    button.classList.remove("active");

    if (
      button.dataset.page === pageName
    ) {
      button.classList.add("active");
    }
  });

  updateBalanceDisplay();
}


/* =========================
   ACTIONS
========================= */

function setupActions() {
  $$("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action =
        button.dataset.action;

      if (action === "deposit") {
        openDeposit();
      }

      if (action === "withdraw") {
        openWithdraw();
      }

      if (action === "invest") {
        openPage("invest");
      }

      if (action === "plans") {
        openPage("invest");
      }

      if (action === "refer") {
        toast(
          "Referral feature coming soon."
        );
      }

      if (action === "details") {
        toast(
          "Portfolio details coming soon."
        );
      }

      if (action === "adjust") {
        toast(
          "Asset allocation adjustment coming soon."
        );
      }

      if (action === "activity") {
        toast(
          "Showing your latest activity."
        );
      }

      if (action === "investNow") {
        toast(
          "Investment is available in demo mode only."
        );
      }
    });
  });
}


/* =========================
   DEPOSIT
========================= */

function openDeposit() {
  openModal(
    "Deposit Funds",
    `
      <label>
        Amount
        <input
          id="depositAmount"
          type="number"
          min="1000"
          placeholder="Enter amount"
        >
      </label>

      <br>

      <button
        id="confirmDeposit"
        class="primary-button full-width"
        type="button"
      >
        Deposit Funds
      </button>
    `
  );

  const button =
    $("#confirmDeposit");

  button.addEventListener("click", () => {
    const amount =
      Number($("#depositAmount").value);

    if (!Number.isFinite(amount)) {
      toast("Please enter a valid amount.");
      return;
    }

    if (amount < 1000) {
      toast("Minimum deposit is ₦1,000.");
      return;
    }

    const wallet = getWallet();

    /*
      THIS IS THE IMPORTANT PART.
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

    localStorage.setItem(
      "veltaraWallet",
      JSON.stringify(wallet)
    );

    /*
      Update dashboard immediately.
    */

    updateBalanceDisplay();
    renderActivity();

    closeModal();

    alert(
      "Deposit successful!\n\nNew balance: " +
      formatMoney(wallet.balance)
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
      <label>
        Amount
        <input
          id="withdrawAmount"
          type="number"
          min="1000"
          placeholder="Enter amount"
        >
      </label>

      <br>

      <button
        id="confirmWithdraw"
        class="primary-button full-width"
        type="button"
      >
        Withdraw Funds
      </button>
    `
  );

  const button =
    $("#confirmWithdraw");

  button.addEventListener("click", () => {
    const amount =
      Number($("#withdrawAmount").value);

    if (!Number.isFinite(amount)) {
      toast("Please enter a valid amount.");
      return;
    }

    if (amount < 1000) {
      toast("Minimum withdrawal is ₦1,000.");
      return;
    }

    const wallet = getWallet();

    wallet.balance =
      Number(wallet.balance);

    if (amount > wallet.balance) {
      toast("Insufficient balance.");
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

    updateBalanceDisplay();
    renderActivity();

    closeModal();

    alert(
      "Withdrawal successful!\n\nNew balance: " +
      formatMoney(wallet.balance)
    );
  });
}


/* =========================
   MODAL
========================= */

function openModal(title, content) {
  closeModal();

  const overlay =
    document.createElement("div");

  overlay.id = "veltaraModal";

  overlay.className =
    "modal-overlay";

  overlay.innerHTML = `
    <div class="modal">

      <div class="modal-header">
        <h3>${title}</h3>

        <button
          id="closeModal"
          type="button"
        >
          ×
        </button>
      </div>

      <div class="modal-content">
        ${content}
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  $("#closeModal").addEventListener(
    "click",
    closeModal
  );

  overlay.addEventListener(
    "click",
    (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    }
  );
}


function closeModal() {
  const modal =
    $("#veltaraModal");

  if (modal) {
    modal.remove();
  }
}


/* =========================
   ACTIVITY
========================= */

function renderActivity() {
  const wallet = getWallet();

  const activityCards =
    document.querySelectorAll(
      ".activity-card"
    );

  if (!activityCards.length) return;

  const card = activityCards[0];

  card.innerHTML =
    wallet.transactions
      .slice(0, 10)
      .map((transaction) => {
        const incoming =
          transaction.direction === "in";

        const sign =
          incoming ? "+" : "-";

        return `
          <div class="activity-row">

            <div class="activity-icon">
              ${incoming ? "＋" : "↗"}
            </div>

            <div>
              <strong>
                ${transaction.type}
              </strong>

              <small>
                ${transaction.date}
              </small>
            </div>

            <b class="${incoming ? "green" : ""}">
              ${sign}
              ${formatMoney(transaction.amount)}
            </b>

          </div>
        `;
      })
      .join("");
}


/* =========================
   BALANCE VISIBILITY
========================= */

function setupBalanceToggle() {
  const button =
    $("#toggleBalance");

  if (!button) return;

  button.addEventListener("click", () => {
    balanceVisible =
      !balanceVisible;

    updateBalanceDisplay();
  });
}


/* =========================
   LOGOUT
========================= */

function setupLogout() {
  const button =
    $("#logoutButton");

  if (!button) return;

  button.addEventListener(
    "click",
    () => {
      localStorage.removeItem(
        "veltaraLoggedIn"
      );

      $("#app").classList.add("hidden");
      $("#authScreen").classList.remove("hidden");

      authMode = "login";

      updateAuthScreen();

      toast("You have been logged out.");
    }
  );
}


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    updateAuthScreen();

    getWallet();

    setupAuthentication();
    setupNavigation();
    setupActions();
    setupBalanceToggle();
    setupLogout();

    updateBalanceDisplay();
    checkLogin();
  }
);