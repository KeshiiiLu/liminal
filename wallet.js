const STORAGE_KEY = "liminal_wallet_v1";

let currentWorld = "main";
let currentType = "expense";

let mainStatsPeriod = "month";
let liminalStatsPeriod = "month";
let liminalAccountFilter = "all";

let walletData = loadWalletData();


/* =========================
   固定分类
   ========================= */

const expenseCategories = [
  "餐饮",
  "外卖",
  "零食饮料",
  "购物",
  "日用品",
  "交通",
  "学习",
  "医疗",
  "娱乐",
  "礼物",
  "居住",
  "其他"
];

const incomeCategories = [
  "生活费",
  "工资",
  "兼职",
  "咨询",
  "督导",
  "讲座",
  "企业项目",
  "转账",
  "红包",
  "退款",
  "礼金",
  "其他"
];


/*
  饼状图颜色。

  以后如果你不喜欢这套，
  我们可以单独调成更符合 Liminal 的配色。
*/

const categoryColors = [
  "#858f83",
  "#b8a58d",
  "#c9b7a7",
  "#8f9ca3",
  "#aaa69a",
  "#9290a0",
  "#b0a58f",
  "#9aa999",
  "#b29da1",
  "#aa927f",
  "#8e887d",
  "#cbc8c0"
];


/* =========================
   数据
   ========================= */

function loadWalletData() {

  const saved =
    localStorage.getItem(STORAGE_KEY);

  if (!saved) {

    return {
      main: [],
      liminal: []
    };

  }

  try {

    const parsed =
      JSON.parse(saved);

    return {
      main:
        Array.isArray(parsed.main)
          ? parsed.main
          : [],

      liminal:
        Array.isArray(parsed.liminal)
          ? parsed.liminal
          : []
    };

  } catch {

    return {
      main: [],
      liminal: []
    };

  }

}


function saveWalletData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(walletData)
  );

}


/* =========================
   世界切换
   ========================= */

const worldButtons =
  document.querySelectorAll(".world-button");

const mainWorldPanel =
  document.getElementById("mainWorldPanel");

const liminalWorldPanel =
  document.getElementById("liminalWorldPanel");


worldButtons.forEach((button) => {

  button.addEventListener("click", () => {

    currentWorld =
      button.dataset.world;


    worldButtons.forEach((item) => {

      item.classList.toggle(
        "active",
        item === button
      );

    });


    mainWorldPanel.classList.toggle(
      "active",
      currentWorld === "main"
    );

    liminalWorldPanel.classList.toggle(
      "active",
      currentWorld === "liminal"
    );

  });

});


/* =========================
   记账弹窗
   ========================= */

const recordOverlay =
  document.getElementById("recordOverlay");

const closeRecord =
  document.getElementById("closeRecord");

const amountInput =
  document.getElementById("transactionAmount");

const titleInput =
  document.getElementById("transactionTitle");

const categoryInput =
  document.getElementById("transactionCategory");

const accountSelect =
  document.getElementById("transactionAccount");

const noteInput =
  document.getElementById("transactionNote");

const syncOption =
  document.getElementById("syncOption");

const syncToLiminal =
  document.getElementById("syncToLiminal");

const saveTransactionButton =
  document.getElementById("saveTransaction");

const typeButtons =
  document.querySelectorAll(".type-button");


document
  .querySelectorAll("[data-open-record]")
  .forEach((button) => {

    button.addEventListener("click", () => {

      openRecordSheet(
        button.dataset.openRecord
      );

    });

  });


function openRecordSheet(
  world,
  preset = null
) {

  currentWorld = world;

  resetRecordForm();

  updateAccountOptions();

  syncOption.hidden =
    currentWorld !== "main";


  if (preset) {

    currentType =
      preset.type || "income";

    updateTypeButtons();

    amountInput.value =
      preset.amount || "";

    titleInput.value =
      preset.title || "";

    noteInput.value =
      preset.note || "";

    syncToLiminal.checked =
      Boolean(preset.sync);


    if (
      preset.category &&
      [
        ...expenseCategories,
        ...incomeCategories
      ].includes(preset.category)
    ) {

      categoryInput.value =
        preset.category;

    }

  }


  recordOverlay.hidden = false;


  setTimeout(() => {

    amountInput.focus();

  }, 100);

}


function closeRecordSheet() {

  recordOverlay.hidden = true;

}


closeRecord.addEventListener(
  "click",
  closeRecordSheet
);


recordOverlay.addEventListener(
  "click",
  (event) => {

    if (event.target === recordOverlay) {

      closeRecordSheet();

    }

  }
);


/* =========================
   收入 / 支出切换
   ========================= */

typeButtons.forEach((button) => {

  button.addEventListener("click", () => {

    currentType =
      button.dataset.type;

    updateTypeButtons();

  });

});


function updateTypeButtons() {

  typeButtons.forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.type === currentType
    );

  });

  updateCategoryOptions();

}


/* =========================
   分类
   ========================= */

function updateCategoryOptions() {

  categoryInput.innerHTML = "";


  const categories =
    currentType === "income"
      ? incomeCategories
      : expenseCategories;


  categories.forEach((category) => {

    const option =
      document.createElement("option");

    option.value =
      category;

    option.textContent =
      category;

    categoryInput.appendChild(option);

  });

}


/* =========================
   账户选择
   ========================= */

function updateAccountOptions() {

  accountSelect.innerHTML = "";


  if (currentWorld === "main") {

    addAccountOption(
      "Keshi",
      "Keshi · 主世界个人账户"
    );

    return;

  }


  addAccountOption(
    "Keshi",
    "Keshi · 个人账户"
  );

  addAccountOption(
    "Lennon",
    "榛榛 · 个人账户"
  );

  addAccountOption(
    "Family",
    "家庭账户"
  );

}


function addAccountOption(
  value,
  text
) {

  const option =
    document.createElement("option");

  option.value = value;
  option.textContent = text;

  accountSelect.appendChild(option);

}


/* =========================
   重置表单
   ========================= */

function resetRecordForm() {

  currentType = "expense";

  updateTypeButtons();

  amountInput.value = "";
  titleInput.value = "";
  noteInput.value = "";

  syncToLiminal.checked = false;

}


/* =========================
   生活费确认到账
   ========================= */

document
  .querySelectorAll(".expected-confirm")
  .forEach((button) => {

    button.addEventListener("click", () => {

      const amount =
        button.dataset.amount;

      const day =
        button.dataset.day;


      openRecordSheet(
        "main",
        {
          type: "income",
          amount: amount,
          title: "生活费",
          category: "生活费",
          note:
            `常见到账节奏：每月${day}日`,
          sync: true
        }
      );

    });

  });


/* =========================
   保存流水
   ========================= */

saveTransactionButton.addEventListener(
  "click",
  saveTransaction
);


function saveTransaction() {

  const amount =
    Number(amountInput.value);

  const title =
    titleInput.value.trim();

  const category =
    categoryInput.value;

  const note =
    noteInput.value.trim();

  const account =
    accountSelect.value;


  if (!amount || amount <= 0) {

    alert("先填一个金额吧。");

    return;

  }


  if (!title) {

    alert("给这笔账写个名称吧。");

    return;

  }


  if (!category) {

    alert("给这笔账选一个分类吧。");

    return;

  }


  const transaction = {

    id:
      createId(),

    type:
      currentType,

    amount:
      amount,

    title:
      title,

    category:
      category,

    note:
      note,

    account:
      account,

    time:
      new Date().toISOString()

  };


  walletData[currentWorld]
    .unshift(transaction);


  /*
    主世界勾选同步以后：

    生成一条独立的副世界流水，
    并不是两个世界共享同一条记录。
  */

  if (
    currentWorld === "main" &&
    syncToLiminal.checked
  ) {

    const mirroredTransaction = {

      ...transaction,

      id:
        createId(),

      account:
        "Keshi",

      mirroredFrom:
        transaction.id

    };


    walletData.liminal
      .unshift(mirroredTransaction);

  }


  saveWalletData();

  renderWallet();

  closeRecordSheet();

}


function createId() {

  if (
    window.crypto &&
    typeof crypto.randomUUID === "function"
  ) {

    return crypto.randomUUID();

  }

  return (
    Date.now().toString() +
    Math.random().toString(16).slice(2)
  );

}


/* =========================
   时间范围
   ========================= */

function isInPeriod(
  isoTime,
  period
) {

  const date =
    new Date(isoTime);

  const now =
    new Date();


  if (
    date.getFullYear() !==
    now.getFullYear()
  ) {

    return false;

  }


  if (period === "year") {

    return true;

  }


  return (
    date.getMonth() ===
    now.getMonth()
  );

}


/* =========================
   金额计算
   ========================= */

function calculateSummary(
  transactions,
  period = null
) {

  let income = 0;
  let expense = 0;


  transactions.forEach((item) => {

    if (
      period &&
      !isInPeriod(item.time, period)
    ) {

      return;

    }


    if (item.type === "income") {

      income += item.amount;

    } else {

      expense += item.amount;

    }

  });


  return {

    income,

    expense,

    balance:
      income - expense

  };

}


function calculateAccountBalance(
  account
) {

  let balance = 0;


  walletData.liminal
    .forEach((item) => {

      if (item.account !== account) {

        return;

      }


      if (item.type === "income") {

        balance += item.amount;

      } else {

        balance -= item.amount;

      }

    });


  return balance;

}


/* =========================
   格式化
   ========================= */

function formatMoney(amount) {

  return new Intl.NumberFormat(
    "zh-CN",
    {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2
    }
  ).format(amount);

}


function formatCompactMoney(amount) {

  return new Intl.NumberFormat(
    "zh-CN",
    {
      style: "currency",
      currency: "CNY",
      maximumFractionDigits: 0
    }
  ).format(amount);

}


function formatTime(isoTime) {

  const date =
    new Date(isoTime);


  return date.toLocaleString(
    "zh-CN",
    {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  );

}


function getAccountName(account) {

  if (account === "Family") {

    return "家庭账户";

  }

  if (account === "Lennon") {

    return "榛榛";

  }

  return "Keshi";

}


/* =========================
   渲染流水
   ========================= */

function renderTransactions(
  container,
  transactions,
  worldName
) {

  container.innerHTML = "";


  if (transactions.length === 0) {

    const empty =
      document.createElement("div");

    empty.className =
      "empty-transactions";

    empty.textContent =
      "还没有流水。";

    container.appendChild(empty);

    return;

  }


  transactions
    .slice(0, 8)
    .forEach((item) => {

      const row =
        document.createElement("article");

      row.className =
        "transaction-row";


      const icon =
        document.createElement("div");

      icon.className =
        `transaction-icon ${item.type}`;

      icon.textContent =
        item.type === "income"
          ? "收"
          : "支";


      const text =
        document.createElement("div");

      text.className =
        "transaction-text";


      const title =
        document.createElement("strong");

      title.textContent =
        item.title;


      const detail =
        document.createElement("span");

      detail.textContent =
        `${getAccountName(item.account)} · ${worldName} · ${item.category} · ${formatTime(item.time)}`;


      text.appendChild(title);
      text.appendChild(detail);


      const money =
        document.createElement("div");

      money.className =
        `transaction-money ${item.type}`;

      money.textContent =
        `${item.type === "income" ? "+" : "-"} ${formatMoney(item.amount)}`;


      row.appendChild(icon);
      row.appendChild(text);
      row.appendChild(money);

      container.appendChild(row);

    });

}


/* =========================
   消费统计
   ========================= */

function getExpenseStats(
  world,
  period,
  accountFilter = "all"
) {

  const result = {};


  walletData[world]
    .forEach((item) => {

      if (item.type !== "expense") {

        return;

      }


      if (
        !isInPeriod(
          item.time,
          period
        )
      ) {

        return;

      }


      if (
        accountFilter !== "all" &&
        item.account !== accountFilter
      ) {

        return;

      }


      const category =
        item.category || "其他";


      if (!result[category]) {

        result[category] = 0;

      }


      result[category] +=
        Number(item.amount);

    });


  return result;

}


/* =========================
   饼状图
   ========================= */

function renderPieChart(
  chartElement,
  totalElement,
  legendElement,
  stats
) {

  const entries =
    Object.entries(stats)
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);


  const total =
    entries.reduce(
      (sum, [, amount]) =>
        sum + amount,
      0
    );


  totalElement.textContent =
    formatCompactMoney(total);


  legendElement.innerHTML = "";


  if (total <= 0) {

    chartElement.style.background =
      "#eceae5";


    const empty =
      document.createElement("div");

    empty.className =
      "chart-empty";

    empty.textContent =
      "还没有符合当前条件的支出。";

    legendElement.appendChild(empty);

    return;

  }


  let currentAngle = 0;

  const gradientParts = [];


  entries.forEach(
    ([category, amount], index) => {

      const percent =
        amount / total;

      const startAngle =
        currentAngle;

      const endAngle =
        currentAngle +
        percent * 360;

      const color =
        categoryColors[
          index % categoryColors.length
        ];


      gradientParts.push(
        `${color} ${startAngle}deg ${endAngle}deg`
      );


      currentAngle =
        endAngle;


      const row =
        document.createElement("div");

      row.className =
        "legend-row";


      const dot =
        document.createElement("span");

      dot.className =
        "legend-dot";

      dot.style.background =
        color;


      const name =
        document.createElement("span");

      name.className =
        "legend-name";

      name.textContent =
        category;


      const value =
        document.createElement("div");

      value.className =
        "legend-value";


      const money =
        document.createElement("span");

      money.textContent =
        formatCompactMoney(amount);


      const percentText =
        document.createElement("small");

      percentText.textContent =
        `${Math.round(percent * 100)}%`;


      value.appendChild(money);
      value.appendChild(percentText);


      row.appendChild(dot);
      row.appendChild(name);
      row.appendChild(value);


      legendElement.appendChild(row);

    }
  );


  chartElement.style.background =
    `conic-gradient(${gradientParts.join(", ")})`;

}


/* =========================
   本月 / 全年按钮
   ========================= */

document
  .querySelectorAll(".period-switch")
  .forEach((switchElement) => {

    const world =
      switchElement.dataset.statsWorld;


    switchElement
      .querySelectorAll(".period-button")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            switchElement
              .querySelectorAll(".period-button")
              .forEach((item) => {

                item.classList.toggle(
                  "active",
                  item === button
                );

              });


            if (world === "main") {

              mainStatsPeriod =
                button.dataset.period;

            } else {

              liminalStatsPeriod =
                button.dataset.period;

            }


            renderCharts();

          }
        );

      });

  });


/* =========================
   副世界账户筛选
   ========================= */

document
  .querySelectorAll(
    ".account-filter-button"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        liminalAccountFilter =
          button.dataset.accountFilter;


        document
          .querySelectorAll(
            ".account-filter-button"
          )
          .forEach((item) => {

            item.classList.toggle(
              "active",
              item === button
            );

          });


        renderCharts();

      }
    );

  });


/* =========================
   刷新图表
   ========================= */

function renderCharts() {

  const mainStats =
    getExpenseStats(
      "main",
      mainStatsPeriod
    );


  renderPieChart(
    document.getElementById(
      "mainPieChart"
    ),

    document.getElementById(
      "mainPieTotal"
    ),

    document.getElementById(
      "mainChartLegend"
    ),

    mainStats
  );


  const liminalStats =
    getExpenseStats(
      "liminal",
      liminalStatsPeriod,
      liminalAccountFilter
    );


  renderPieChart(
    document.getElementById(
      "liminalPieChart"
    ),

    document.getElementById(
      "liminalPieTotal"
    ),

    document.getElementById(
      "liminalChartLegend"
    ),

    liminalStats
  );

}


/* =========================
   整体刷新
   ========================= */

function renderWallet() {

  /*
    余额 = 当前所有已录入流水累计

    顶部“本月收入 / 本月支出”
    则只统计本月。
  */

  const mainAll =
    calculateSummary(
      walletData.main
    );

  const mainMonth =
    calculateSummary(
      walletData.main,
      "month"
    );


  const liminalAll =
    calculateSummary(
      walletData.liminal
    );

  const liminalMonth =
    calculateSummary(
      walletData.liminal,
      "month"
    );


  document.getElementById(
    "mainBalance"
  ).textContent =
    formatMoney(
      mainAll.balance
    );


  document.getElementById(
    "mainIncome"
  ).textContent =
    formatMoney(
      mainMonth.income
    );


  document.getElementById(
    "mainExpense"
  ).textContent =
    formatMoney(
      mainMonth.expense
    );


  document.getElementById(
    "liminalBalance"
  ).textContent =
    formatMoney(
      liminalAll.balance
    );


  document.getElementById(
    "liminalIncome"
  ).textContent =
    formatMoney(
      liminalMonth.income
    );


  document.getElementById(
    "liminalExpense"
  ).textContent =
    formatMoney(
      liminalMonth.expense
    );


  document.getElementById(
    "keshiBalance"
  ).textContent =
    formatMoney(
      calculateAccountBalance(
        "Keshi"
      )
    );


  document.getElementById(
    "lennonBalance"
  ).textContent =
    formatMoney(
      calculateAccountBalance(
        "Lennon"
      )
    );


  document.getElementById(
    "familyBalance"
  ).textContent =
    formatMoney(
      calculateAccountBalance(
        "Family"
      )
    );


  renderTransactions(
    document.getElementById(
      "mainTransactions"
    ),

    walletData.main,

    "主世界"
  );


  renderTransactions(
    document.getElementById(
      "liminalTransactions"
    ),

    walletData.liminal,

    "副世界"
  );


  renderCharts();

}


/* 第一次加载 */

updateCategoryOptions();

renderWallet();