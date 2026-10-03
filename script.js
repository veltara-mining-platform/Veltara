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
// WALLET DATA
// ========================================

const DEFAULT_BALANCE = 3712680;

function getBalance() {
  const saved = localStorage.getItem("veltaraBalance");

  if (saved === null) {
    localStorage.setItem(
      "veltaraBalance",
      DEFAULT_BALANCE
    );

    return DEFAULT_BALANCE;
  }

  return Number(saved);
}


function setBalance(amount) {
  localStorage.setItem(
    "veltaraBalance",
    String(amount)
  );

  updateBalanceDisplay();
}


function getTransactions() {
  return JSON.parse(
    localStorage.getItem("veltaraTransactions") || "[]"
  );
}


function saveTransaction(transaction) {
  const transactions = getTransactions();

  transactions.unshift(transaction);

  localStorage.setItem(
    "veltaraTransactions",
    JSON.stringify(transactions)
  );
}


function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString()}`;
}


// ========================================
// UPDATE BALANCE EVERYWHERE
// ========================================

function updateBalanceDisplay() {

  const balance = getBalance();

  const balanceAmount =
    $("#balanceAmount");

  if (balanceAmount && balanceVisible) {
    balanceAmount.textContent =
      formatNaira(balance);
  }

  const walletBalance =
    document.querySelector(".wallet-balance");

  if (walletBalance) {
    walletBalance.textContent =
      formatNaira(balance);
  }
}


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

    authTitle.textContent =
      "Welcome back";

    authDescription.textContent =
      "Sign in to your investment dashboard.";

    authButtonText.textContent =
      "Sign in";

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

    toast(
      "Please enter your email and password."
    );

    return;
  }


  if (authMode === "signup") {

    if (password.length < 6