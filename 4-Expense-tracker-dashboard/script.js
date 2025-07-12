window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("main-dashboard").style.display = "block";
    loadFromStorage();
  }, 3500);
});

let transactions = [];
let categoryTotals = {};
let income = 0, expenses = 0;
let selectedCategory = "All";
let budgets = {};
let editIndex = -1;

const pieCtx = document.getElementById("expense-chart").getContext("2d");
const barCtx = document.getElementById("bar-chart").getContext("2d");
const lineCtx = document.getElementById("line-chart").getContext("2d");

let pieChart = new Chart(pieCtx, {
  type: 'pie',
  data: {
    labels: [],
    datasets: [{
      label: 'Expenses by Category',
      data: [],
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  }
});

let barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Total by Category',
      data: [],
      backgroundColor: '#3b82f6'
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});

let lineChart = new Chart(lineCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Expenses Over Time',
      data: [],
      fill: false,
      borderColor: '#ef4444',
      tension: 0.3
    }]
  },
  options: {
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  }
});

document.getElementById("transaction-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value || "Uncategorized";

  const newTransaction = { title, amount, type, date, category };

  if (editIndex >= 0) {
    transactions[editIndex] = newTransaction;
    editIndex = -1;
    document.querySelector("#transaction-form button").textContent = "Add Transaction";
  } else {
    transactions.push(newTransaction);
  }

  saveToStorage();
  updateFilterDropdown();
  renderAllTransactions();
  updateSummaries();
  checkBudgetWarnings();
  this.reset();
});

document.getElementById("filter-category").addEventListener("change", function () {
  selectedCategory = this.value;
  renderAllTransactions();
});

document.getElementById("budget-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const category = document.getElementById("budget-category").value.trim();
  const amount = parseFloat(document.getElementById("budget-amount").value);

  if (!category || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid category and amount.");
    return;
  }

  budgets[category] = amount;
  saveBudgets();
  alert(`Budget of ₹${amount} set for category "${category}"`);
  this.reset();
});

function renderAllTransactions() {
  const list = document.getElementById("transaction-list");
  list.innerHTML = "";

  const filtered = selectedCategory === "All"
    ? transactions
    : transactions.filter(tx => tx.category === selectedCategory);

  filtered.reverse().forEach((tx, index) => {
    const actualIndex = transactions.length - 1 - index;

    const li = document.createElement("li");
    li.innerHTML = `
      ${tx.title} - ₹${tx.amount} <span>${tx.date}</span>
      <div>
        <button onclick="editTransaction(${actualIndex})" style="margin-right: 5px;">✏️</button>
        <button onclick="deleteTransaction(${actualIndex})">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function editTransaction(index) {
  const tx = transactions[index];
  document.getElementById("title").value = tx.title;
  document.getElementById("amount").value = tx.amount;
  document.getElementById("type").value = tx.type;
  document.getElementById("date").value = tx.date;
  document.getElementById("category").value = tx.category;

  editIndex = index;
  document.querySelector("#transaction-form button").textContent = "Update Transaction";
  document.getElementById("title").focus();
}

function deleteTransaction(index) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions.splice(index, 1);
    saveToStorage();
    updateFilterDropdown();
    renderAllTransactions();
    updateSummaries();
  }
}

function updateSummaries() {
  income = 0;
  expenses = 0;
  categoryTotals = {};

  transactions.forEach(tx => {
    if (tx.type === "income") {
      income += tx.amount;
    } else {
      expenses += tx.amount;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    }
  });

  document.querySelector(".balance").innerHTML = `₹${income - expenses}<br><span>Total Balance</span>`;
  document.querySelector(".income").innerHTML = `₹${income}<br><span>Income</span>`;
  document.querySelector(".expenses").innerHTML = `₹${expenses}<br><span>Expenses</span>`;

  updateCharts();
}

function updateCharts() {
  pieChart.data.labels = Object.keys(categoryTotals);
  pieChart.data.datasets[0].data = Object.values(categoryTotals);
  pieChart.update();

  barChart.data.labels = Object.keys(categoryTotals);
  barChart.data.datasets[0].data = Object.values(categoryTotals);
  barChart.update();

  const dailyTotals = {};
  transactions.forEach(tx => {
    if (tx.type === "expense") {
      dailyTotals[tx.date] = (dailyTotals[tx.date] || 0) + tx.amount;
    }
  });
  const sortedDates = Object.keys(dailyTotals).sort();
  lineChart.data.labels = sortedDates;
  lineChart.data.datasets[0].data = sortedDates.map(date => dailyTotals[date]);
  lineChart.update();
}

function updateFilterDropdown() {
  const dropdown = document.getElementById("filter-category");
  const categories = Array.from(new Set(transactions.map(tx => tx.category)));
  dropdown.innerHTML = `<option value="All">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });
}

function saveToStorage() {
  localStorage.setItem("trackifyTransactions", JSON.stringify(transactions));
}

function loadFromStorage() {
  const stored = localStorage.getItem("trackifyTransactions");
  if (stored) {
    transactions = JSON.parse(stored);
    updateFilterDropdown();
    renderAllTransactions();
    updateSummaries();
  }
  loadBudgets();
  checkBudgetWarnings();
}

function loadBudgets() {
  const storedBudgets = localStorage.getItem("trackifyBudgets");
  if (storedBudgets) budgets = JSON.parse(storedBudgets);
}

function saveBudgets() {
  localStorage.setItem("trackifyBudgets", JSON.stringify(budgets));
}

function checkBudgetWarnings() {
  const warnings = [];

  Object.keys(budgets).forEach(cat => {
    const spent = transactions
      .filter(tx => tx.type === "expense" && tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (spent > budgets[cat]) {
      warnings.push(`⚠️ You exceeded the budget for "${cat}" by ₹${spent - budgets[cat]}`);
    }
  });

  if (warnings.length > 0) {
    alert(warnings.join('\n'));
  }
}

// ✅ Fix: Expose functions to HTML for buttons
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
