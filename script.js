wallet.balance = Number(wallet.balance) + Number(amount);

localStorage.setItem(
  "veltaraWallet",
  JSON.stringify(wallet)
);

document.getElementById("balanceAmount").textContent =
  formatMoney(wallet.balance);

const walletBalance =
  document.querySelector(".wallet-balance");

if (walletBalance) {
  walletBalance.textContent =
    formatMoney(wallet.balance);
}

alert(
  "Deposit successful. New balance: " +
  formatMoney(wallet.balance)
);