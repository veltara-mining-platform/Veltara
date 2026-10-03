const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);


/* =========================
   SUPABASE
========================= */

const SUPABASE_URL =
  "https://qsayxiuomatoidxgzczk.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_S9TgEhZvhm3jT_FAnlYXDw_d6UHveO_";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


let authMode = "login";
let balanceVisible = true;
let currentWallet = {
  balance: 0,
  transactions: []
};


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

  form.addEventListener("submit", async (event) => {
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

    const submitButton =
      form.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      if (authMode === "signup") {
        await createAccount(email, password);
      } else {
        await login(email, password);
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}


/* =========================
   CREATE ACCOUNT
========================= */

async function createAccount(email, password) {
  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password
    });

  if (error) {
    console.error("Signup error:", error);

    toast(error.message);

    return;
  }

  /*
    Supabase may require email confirmation.
  */

  if (!data.session) {
    toast(
      "Account created. Please check your email to confirm your account."
    );

    authMode = "login";
    updateAuthScreen();

    return;
  }

  toast("Account created successfully.");

  await loadWallet();

  showApplication();
}


/* =========================
   LOGIN
========================= */

async function login(email, password) {
  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    console.error("Login error:", error);

    toast(error.message);

    return;
  }

  toast("Login successful.");

  await loadWallet();

  showApplication();
}


/* =========================
   LOGOUT
========================= */

async function logout() {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error);

    toast(error.message);

    return;
  }

  currentWallet = {
    balance: 0,
    transactions: []
  };

  $("#app").classList.add("hidden");
  $("#authScreen").classList.remove("hidden");

  authMode = "login";

  updateAuthScreen();

  toast("You have been logged out.");
}


/* =========================
   CHECK AUTH
========================= */

async function checkLogin() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    await loadWallet();
    showApplication();
  }
}


/* =========================
   WALLET
========================= */

async function loadWallet() {
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.error("User error:", userError);
    return;
  }

  const { data: wallet, error: walletError } =
    await supabaseClient
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

  if (walletError) {
    console.error("Wallet error:", walletError);

    toast(
      "Your wallet could not be loaded."
    );

    return;
  }

  const {
    data: transactions,
    error: transactionError
  } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false
    })
    .limit(10);

  if (transactionError) {
    console.error(
      "Transaction error:",
      transactionError
    );
  }

  currentWallet = {
    balance: Number(wallet.balance || 0),
    transactions: transactions || []
  };

  updateBalanceDisplay();
  renderActivity();
}


/* =========================
   UPDATE BALANCE
========================= */

function updateBalanceDisplay() {
  const balance =
    $("#balanceAmount");

  const walletBalance =
    document.querySelector(".wallet-balance");

  const amount =
    currentWallet.balance || 0;

  if (balance) {
    balance.textContent =
      balanceVisible
        ? formatMoney(amount)
        : "••••••••";
  }

  if (walletBalance) {
    walletBalance.textContent =
      formatMoney(amount);
  }
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

  const page =
    $(`#${pageName}`);

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
          "Investment functionality will be connected next."
        );
      }
    });
  });
}


/* =========================
   DEPOSIT
========================= */

async function openDeposit() {
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
        Continue to Payment
      </button>

      <div class="notice">
        You will be redirected to Paystack to complete your payment.
      </div>
    `
  );

  const button = $("#confirmDeposit");

  if (!button) return;

  button.addEventListener("click", async () => {
    const amount = Number($("#depositAmount").value);

    if (!Number.isFinite(amount)) {
      toast("Please enter a valid amount.");
      return;
    }

    if (amount < 1000) {
      toast("Minimum deposit is ₦1,000.");
      return;
    }

    try {
      button.disabled = true;
      button.textContent = "Connecting to Paystack...";

      const {
  data: { user },
} = await supabaseClient.auth.getUser();

      if (!user) {
        toast("Please log in again.");
        button.disabled = false;
        button.textContent = "Continue to Payment";
        return;
      }

      const response = await fetch(
        "/.netlify/functions/initialize-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            amount: amount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status || !data.data?.authorization_url) {
        throw new Error(
          data.message || data.error || "Unable to start payment."
        );
      }

      window.location.href = data.data.authorization_url;
    } catch (error) {
      console.error(error);

      toast(
        error.message || "Payment could not be started."
      );

      button.disabled = false;
      button.textContent = "Continue to Payment";
    }
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
        Request Withdrawal
      </button>

      <div class="notice">
        Withdrawal processing will be connected after the payment system is complete.
      </div>
    `
  );

  const button =
    $("#confirmWithdraw");

  if (!button) return;

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

    if (amount > currentWallet.balance) {
      toast("Insufficient balance.");
      return;
    }

    toast(
      "Withdrawal processing will be connected next."
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
  const activityCards =
    document.querySelectorAll(
      ".activity-card"
    );

  if (!activityCards.length) return;

  const card =
    activityCards[0];

  if (!currentWallet.transactions.length) {
    card.innerHTML = `
      <div class="activity-row">
        <div>
          <strong>No transactions yet</strong>
          <small>Your activity will appear here.</small>
        </div>
      </div>
    `;

    return;
  }

  card.innerHTML =
    currentWallet.transactions
      .slice(0, 10)
      .map((transaction) => {
        const incoming =
          transaction.type === "deposit" ||
          transaction.type === "return";

        const sign =
          incoming ? "+" : "-";

        const date =
          transaction.created_at
            ? new Date(
                transaction.created_at
              ).toLocaleString("en-NG")
            : "Just now";

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
                ${date}
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
    logout
  );
}


/* =========================
   AUTH STATE LISTENER
========================= */

function setupAuthListener() {
  supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

      if (
        event === "SIGNED_IN" &&
        session
      ) {
        await loadWallet();
      }

      if (event === "SIGNED_OUT") {
        currentWallet = {
          balance: 0,
          transactions: []
        };

        $("#app").classList.add("hidden");
        $("#authScreen").classList.remove("hidden");
      }

    }
  );
}


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    updateAuthScreen();

    setupAuthentication();
    setupNavigation();
    setupActions();
    setupBalanceToggle();
    setupLogout();
    setupAuthListener();

    await checkLogin();

  }
);