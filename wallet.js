const finance = window.LiminalFinance;
const financeData = window.LiminalFinanceData;

if (!finance || !financeData) {
  throw new Error("Wallet finance data layer failed to load.");
}

let currentWorld = "main";
let currentTab = "overview";
let ownerFilter = "all";
let analyticsPeriod = "month";
let ledgerTypeFilter = "all";
let ledgerAccountFilter = "all";
let editingTransactionId = "";
let editorType = "expense";

const $ = (id) => document.getElementById(id);

function make(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== "") element.textContent = text;
  return element;
}

function localDateParts(date = new Date()) {
  return {
    date: [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-"),
    time: [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0")
    ].join(":")
  };
}

function formatMoney(amount, currency = "CNY", digits = 2) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(Number(amount) || 0);
}

function formatCompactMoney(amount, currency = "CNY") {
  return formatMoney(amount, currency, 0);
}

function formatTotals(totals, digits = 2) {
  const parts = [];
  if (Object.prototype.hasOwnProperty.call(totals, "CNY")) {
    parts.push(formatMoney(totals.CNY, "CNY", digits));
  }
  if (Object.prototype.hasOwnProperty.call(totals, "EUR")) {
    parts.push(formatMoney(totals.EUR, "EUR", digits));
  }
  return parts.length ? parts.join(" + ") : formatMoney(0, "CNY", digits);
}

function getAccountLabel(accountId) {
  return finance.getAccount(accountId)?.shortName || accountId || "未记录账户";
}

function getOwnerLabel(owner) {
  return financeData.ledgerOwners.find((item) => item.id === owner)?.label || "未归属";
}

function getTypeLabel(type) {
  return [
    ...financeData.transactionTypes,
    ...(Array.isArray(financeData.systemTransactionTypes) ? financeData.systemTransactionTypes : [])
  ].find((item) => item.id === type)?.label || "流水";
}

function getSourceLabel(transaction) {
  if (currentWorld === "sub" && transaction.originWorld === "main") return "现实同步";
  const labels = { manual: "手动", mall: "Mall", chat: "Chat", system: "系统", main_world_sync: "现实同步" };
  return labels[transaction.source] || transaction.source || "手动";
}

function isInPeriod(transaction, period) {
  if (period === "all") return true;
  const now = new Date();
  const prefix = period === "month"
    ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    : String(now.getFullYear());
  return String(transaction.date || "").startsWith(prefix);
}

function getVisibleTransactions(period = "all") {
  return finance.getTransactionsForWorld(currentWorld).filter((transaction) => (
    isInPeriod(transaction, period) &&
    (currentWorld === "main" || ownerFilter === "all" || transaction.ledgerOwner === ownerFilter)
  ));
}

function totalsForTransactions(transactions) {
  return transactions.reduce((totals, transaction) => {
    const currency = transaction.currency || "CNY";
    if (!totals[currency]) totals[currency] = { income: 0, expense: 0 };
    totals[currency].income += finance.getStatisticalAmount(transaction, "income");
    totals[currency].expense += finance.getStatisticalAmount(transaction, "expense");
    return totals;
  }, {});
}

function createMetric(label, value, note = "") {
  const card = make("article", "metric-card");
  card.append(make("span", "", label), make("strong", "", value));
  if (note) card.appendChild(make("small", "", note));
  return card;
}

function activateTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".wallet-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  document.querySelectorAll(".wallet-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tab);
  });
  renderCurrentTab();
}

function setWorld(world) {
  currentWorld = world === "sub" ? "sub" : "main";
  if (currentWorld === "main") ownerFilter = "all";
  document.querySelectorAll(".world-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.world === currentWorld);
  });
  $("ownerFilter").hidden = currentWorld === "main";
  document.querySelectorAll(".owner-filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.owner === ownerFilter);
  });
  ledgerAccountFilter = "all";
  renderAll();
}

function accountTotalsForView() {
  return finance.getCurrencyTotals(currentWorld, currentWorld === "sub" ? ownerFilter : "all");
}

function renderOverview() {
  const totals = accountTotalsForView();
  const ownerName = currentWorld === "main"
    ? "Keshi"
    : (ownerFilter === "all" ? "家庭财务" : getOwnerLabel(ownerFilter));
  $("overviewOwner").textContent = ownerName;
  $("overviewWorldBadge").textContent = currentWorld === "main" ? "主世界" : "副世界";
  $("overviewPosition").textContent = formatTotals(totals);
  $("overviewPositionNote").textContent = "金融资产 · 不含房产与车辆 · 不进行币种换算";

  const monthTotals = totalsForTransactions(getVisibleTransactions("month"));
  const income = {};
  const expense = {};
  Object.entries(monthTotals).forEach(([currency, values]) => {
    income[currency] = values.income;
    expense[currency] = values.expense;
  });
  const availableAccount = currentWorld === "main" || ownerFilter === "keshi"
    ? "keshi_main"
    : (ownerFilter === "family" ? "" : "cmb_daily");
  const liabilities = financeData.liabilities.reduce((sum, item) => sum + item.balance, 0);

  const metrics = $("overviewMetrics");
  metrics.innerHTML = "";
  metrics.append(
    createMetric(
      "日常可用",
      availableAccount
        ? formatMoney(finance.getAccountBalance(availableAccount, currentWorld), finance.getAccount(availableAccount)?.currency || "CNY")
        : "—",
      availableAccount ? getAccountLabel(availableAccount) : "家庭不是独立银行账户"
    ),
    createMetric("金融资产", formatTotals(totals), "各币种独立汇总"),
    createMetric("本月收入", formatTotals(income), "不含账户内部划转"),
    createMetric("本月支出", formatTotals(expense), "不含账户内部划转"),
    createMetric("住房负债", formatCompactMoney(liabilities), "银行房贷 + 家庭借款")
  );

  renderStructure();
  renderTransactions($("overviewTransactions"), getVisibleTransactions("all").slice(0, 6));
}

function renderStructure() {
  const container = $("overviewStructure");
  container.innerHTML = "";
  const accounts = finance.getAccounts(currentWorld, currentWorld === "sub" ? ownerFilter : "all");
  const groups = [
    { label: "现金 / 活期", kinds: ["cash"], currency: "CNY" },
    { label: "应急储备", ids: ["emergency_fund"], currency: "CNY" },
    { label: "低风险储备", kinds: ["reserve", "fixed_income"], exclude: ["emergency_fund"], currency: "CNY" },
    { label: "投资", kinds: ["investment"], currency: "CNY" },
    { label: "欧元资金", kinds: ["foreign"], currency: "EUR" }
  ];
  const values = groups.map((group) => ({
    ...group,
    value: accounts.filter((account) => (
      account.currency === group.currency &&
      (!group.kinds || group.kinds.includes(account.kind)) &&
      (!group.ids || group.ids.includes(account.id)) &&
      (!group.exclude || !group.exclude.includes(account.id))
    )).reduce((sum, account) => sum + finance.getAccountBalance(account.id, currentWorld), 0)
  }));
  const maxByCurrency = {
    CNY: Math.max(1, ...values.filter((item) => item.currency === "CNY").map((item) => item.value)),
    EUR: Math.max(1, ...values.filter((item) => item.currency === "EUR").map((item) => item.value))
  };
  values.forEach((item) => {
    const row = make("div", "structure-row");
    const meta = make("div", "structure-meta");
    meta.append(make("span", "", item.label), make("span", "", formatCompactMoney(item.value, item.currency)));
    const track = make("div", "structure-track");
    const fill = make("div", "structure-fill");
    fill.style.width = `${Math.max(0, item.value / maxByCurrency[item.currency] * 100)}%`;
    track.appendChild(fill);
    row.append(meta, track);
    container.appendChild(row);
  });
  if (currentWorld === "sub" && ["all", "luzhen"].includes(ownerFilter)) {
    const debt = financeData.liabilities.reduce((sum, item) => sum + item.balance, 0);
    const row = make("div", "structure-row");
    const meta = make("div", "structure-meta");
    meta.append(make("span", "", "住房负债"), make("span", "", formatCompactMoney(debt)));
    const track = make("div", "structure-track");
    const fill = make("div", "structure-fill");
    fill.style.width = "100%";
    fill.style.background = "#b69a95";
    track.appendChild(fill);
    row.append(meta, track);
    container.appendChild(row);
  }
}

function transactionAmountText(transaction) {
  const money = formatMoney(transaction.amount, transaction.currency);
  if (["income", "opening_balance", "loan_drawdown", "family_loan_drawdown"].includes(transaction.type)) return `+ ${money}`;
  if (["expense", "repayment", "asset_acquisition"].includes(transaction.type)) return `− ${money}`;
  if (["transfer", "asset_transfer", "investment", "capital_transfer"].includes(transaction.type)) return `↔ ${money}`;
  return money;
}

function renderTransactions(container, transactions) {
  container.innerHTML = "";
  if (!transactions.length) {
    container.appendChild(make("div", "empty-state", "还没有符合当前条件的流水。"));
    return;
  }
  transactions.forEach((transaction) => {
    const row = make("button", "transaction-row");
    row.type = "button";
    const icon = make("span", `transaction-icon ${transaction.type}`, getTypeLabel(transaction.type).slice(0, 1));
    const text = make("span", "transaction-text");
    text.appendChild(make("strong", "", transaction.title));
    const accountText = ["transfer", "asset_transfer", "investment", "capital_transfer"].includes(transaction.type) && transaction.toAccountId
      ? `${getAccountLabel(transaction.fromAccountId)} → ${getAccountLabel(transaction.toAccountId)}`
      : (["income", "opening_balance", "loan_drawdown", "family_loan_drawdown"].includes(transaction.type)
        ? getAccountLabel(transaction.toAccountId)
        : getAccountLabel(transaction.fromAccountId));
    text.appendChild(make("span", "", `${transaction.date} ${transaction.timeOfDay} · ${accountText} · ${transaction.category}`));
    const tags = make("span", "transaction-tags");
    tags.append(make("i", "", getOwnerLabel(transaction.ledgerOwner)), make("i", "", getSourceLabel(transaction)));
    text.appendChild(tags);
    const money = make("strong", `transaction-money ${transaction.type}`, transactionAmountText(transaction));
    row.append(icon, text, money);
    row.addEventListener("click", () => openTransactionEditor(transaction.transactionId));
    container.appendChild(row);
  });
}

function renderAccounts() {
  const container = $("accountGroups");
  container.innerHTML = "";
  const accounts = finance.getAccounts(currentWorld, currentWorld === "sub" ? ownerFilter : "all");
  const groups = new Map();
  accounts.forEach((account) => {
    if (!groups.has(account.institution)) groups.set(account.institution, []);
    groups.get(account.institution).push(account);
  });
  groups.forEach((items, institution) => {
    const group = make("section", "account-group");
    group.appendChild(make("h2", "", institution));
    const list = make("div", "account-list");
    items.forEach((account) => {
      const card = make("button", "account-card");
      card.type = "button";
      const info = make("div");
      info.append(make("span", "", account.currency), make("h3", "", account.name));
      const tags = make("div", "account-tags");
      account.tags.forEach((tag) => tags.appendChild(make("i", "", tag)));
      info.appendChild(tags);
      card.append(info, make("strong", "", formatMoney(finance.getAccountBalance(account.id, currentWorld), account.currency)));
      card.addEventListener("click", () => openAccountDetail(account.id));
      list.appendChild(card);
    });
    group.appendChild(list);
    container.appendChild(group);
  });
  if (!accounts.length) container.appendChild(make("div", "empty-state", "当前筛选下没有对应账户。"));
}

function populateLedgerAccountFilter() {
  const select = $("ledgerAccountFilter");
  const previous = ledgerAccountFilter;
  select.innerHTML = "";
  const all = make("option", "", "全部账户");
  all.value = "all";
  select.appendChild(all);
  finance.getAccounts(currentWorld, currentWorld === "sub" ? ownerFilter : "all").forEach((account) => {
    const option = make("option", "", `${account.shortName} · ${account.currency}`);
    option.value = account.id;
    select.appendChild(option);
  });
  ledgerAccountFilter = [...select.options].some((option) => option.value === previous) ? previous : "all";
  select.value = ledgerAccountFilter;
}

function filteredLedgerTransactions() {
  return getVisibleTransactions("all").filter((transaction) => (
    (ledgerTypeFilter === "all" || transaction.type === ledgerTypeFilter) &&
    (ledgerAccountFilter === "all" || transaction.fromAccountId === ledgerAccountFilter || transaction.toAccountId === ledgerAccountFilter)
  ));
}

function renderLedger() {
  populateLedgerAccountFilter();
  const transactions = filteredLedgerTransactions();
  const totals = totalsForTransactions(transactions);
  const income = {};
  const expense = {};
  Object.entries(totals).forEach(([currency, values]) => {
    income[currency] = values.income;
    expense[currency] = values.expense;
  });
  const summary = $("ledgerSummary");
  summary.innerHTML = "";
  const incomeCard = make("div");
  incomeCard.append(make("span", "", "筛选收入"), make("strong", "", formatTotals(income)));
  const expenseCard = make("div");
  expenseCard.append(make("span", "", "筛选支出"), make("strong", "", formatTotals(expense)));
  summary.append(incomeCard, expenseCard);
  renderTransactions($("ledgerTransactions"), transactions);
}

function renderAssets() {
  const totals = accountTotalsForView();
  const totalCard = $("financialAssetTotals");
  totalCard.innerHTML = "";
  ["CNY", "EUR"].forEach((currency) => {
    const item = make("div");
    item.append(make("span", "", currency === "CNY" ? "人民币金融资产" : "欧元金融资产"), make("strong", "", formatMoney(totals[currency] || 0, currency)));
    totalCard.appendChild(item);
  });

  const financial = $("financialAssetList");
  financial.innerHTML = "";
  finance.getAccounts(currentWorld, currentWorld === "sub" ? ownerFilter : "all").forEach((account) => {
    const card = make("button", "asset-card");
    card.type = "button";
    card.dataset.accountId = account.id;
    const info = make("div");
    info.append(make("span", "", account.institution), make("h3", "", account.name));
    card.append(info, make("strong", "", formatMoney(finance.getAccountBalance(account.id, currentWorld), account.currency)));
    card.addEventListener("click", () => openAccountDetail(account.id));
    financial.appendChild(card);
  });

  const physical = $("physicalAssetList");
  physical.innerHTML = "";
  const shouldShowLuzhenAssets = currentWorld === "sub" && ["all", "luzhen", "family"].includes(ownerFilter);
  if (shouldShowLuzhenAssets) {
    financeData.physicalAssets.forEach((asset) => {
      const card = make("button", "asset-card");
      card.type = "button";
      card.dataset.assetId = asset.id;
      const info = make("div");
      info.append(make("span", "", `${asset.owner} · ${asset.use}`), make("h3", "", asset.name));
      const value = asset.purchaseCost
        ? `约 ${formatCompactMoney(asset.purchaseCost)}`
        : `约 ${formatCompactMoney(asset.purchaseCostRange[0])}–${formatCompactMoney(asset.purchaseCostRange[1])}`;
      card.append(info, make("strong", "", value));
      card.addEventListener("click", () => openAssetDetail(asset.id));
      physical.appendChild(card);
    });
  } else {
    physical.appendChild(make("div", "empty-state", "当前世界或归属下没有实物资产。"));
  }

  const liabilities = $("liabilityList");
  liabilities.innerHTML = "";
  if (currentWorld === "sub" && ["all", "luzhen", "family"].includes(ownerFilter)) {
    financeData.liabilities.forEach((liability) => {
      const card = make("article", "liability-card");
      const info = make("div");
      info.append(make("span", "", liability.owner), make("h3", "", liability.name));
      card.append(info, make("strong", "", `约 ${formatCompactMoney(liability.balance, liability.currency)}`));
      liabilities.appendChild(card);
    });
  } else {
    liabilities.appendChild(make("div", "empty-state", "当前世界或归属下没有负债记录。"));
  }
}

function aggregateBreakdown(transactions, direction) {
  const result = new Map();
  transactions.forEach((transaction) => {
    const statisticalAmount = finance.getStatisticalAmount(transaction, direction);
    if (statisticalAmount <= 0) return;
    const key = `${transaction.currency}|${transaction.category || "其他"}`;
    result.set(key, (result.get(key) || 0) + statisticalAmount);
  });
  return [...result.entries()].map(([key, amount]) => {
    const [currency, label] = key.split("|");
    return { currency, label, amount };
  }).sort((a, b) => b.amount - a.amount);
}

function renderBreakdown(container, items, emptyText) {
  container.innerHTML = "";
  if (!items.length) {
    container.appendChild(make("div", "empty-state", emptyText));
    return;
  }
  const totals = items.reduce((result, item) => {
    result[item.currency] = (result[item.currency] || 0) + item.amount;
    return result;
  }, {});
  items.forEach((item) => {
    const row = make("div", "breakdown-row");
    const meta = make("div", "breakdown-meta");
    meta.append(make("span", "", item.label), make("span", "", formatMoney(item.amount, item.currency)));
    const track = make("div", "breakdown-track");
    const fill = make("div", "breakdown-fill");
    fill.style.width = `${totals[item.currency] ? item.amount / totals[item.currency] * 100 : 0}%`;
    track.appendChild(fill);
    row.append(meta, track);
    container.appendChild(row);
  });
}

function renderAnalytics() {
  const transactions = getVisibleTransactions(analyticsPeriod);
  const totals = totalsForTransactions(transactions);
  const income = {};
  const expense = {};
  Object.entries(totals).forEach(([currency, values]) => {
    income[currency] = values.income;
    expense[currency] = values.expense;
  });
  const summary = $("analyticsSummary");
  summary.innerHTML = "";
  const incomeCard = make("div");
  incomeCard.append(make("span", "", "收入"), make("strong", "", formatTotals(income)));
  const expenseCard = make("div");
  expenseCard.append(make("span", "", "支出"), make("strong", "", formatTotals(expense)));
  summary.append(incomeCard, expenseCard);
  renderBreakdown($("expenseBreakdown"), aggregateBreakdown(transactions, "expense"), "当前范围内还没有消费。账户内部划转与资本支出不会出现在这里。");
  renderBreakdown($("incomeBreakdown"), aggregateBreakdown(transactions, "income"), "当前范围内还没有收入。资产承接与借款放款不会出现在这里。");
  renderBalanceChanges(transactions);
  renderAssetAllocation();
  renderCashflow();
}

function renderBalanceChanges(transactions) {
  const container = $("balanceChanges");
  container.innerHTML = "";
  const changes = finance.getAccounts(currentWorld, currentWorld === "sub" ? ownerFilter : "all").map((account) => ({
    account,
    value: transactions.reduce((sum, transaction) => sum + finance.transactionDeltaForAccount(transaction, account.id), 0)
  })).filter((item) => item.value !== 0);
  if (!changes.length) {
    container.appendChild(make("div", "empty-state", "当前范围内没有账户余额变化。"));
    return;
  }
  changes.forEach(({ account, value }) => {
    const row = make("div", "change-row");
    row.append(make("span", "", account.shortName), make("strong", "", `${value > 0 ? "+ " : "− "}${formatMoney(Math.abs(value), account.currency)}`));
    container.appendChild(row);
  });
}

function renderAssetAllocation() {
  const kindNames = { cash: "现金 / 活期", reserve: "储备资金", fixed_income: "低风险固收", investment: "长期投资", foreign: "欧元资金" };
  const map = new Map();
  finance.getAccounts(currentWorld, currentWorld === "sub" ? ownerFilter : "all").forEach((account) => {
    const key = `${account.currency}|${account.kind}`;
    map.set(key, (map.get(key) || 0) + finance.getAccountBalance(account.id, currentWorld));
  });
  const items = [...map.entries()].map(([key, amount]) => {
    const [currency, kind] = key.split("|");
    return { currency, label: `${kindNames[kind] || kind} · ${currency}`, amount };
  }).filter((item) => item.amount > 0);
  renderBreakdown($("assetAllocation"), items, "当前筛选下没有金融资产配置。" );
}

function renderCashflow() {
  const container = $("cashflowChart");
  container.innerHTML = "";
  const now = new Date();
  const months = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const rows = getVisibleTransactions("all").filter((item) => item.date.startsWith(key) && item.currency === "CNY");
    const summary = totalsForTransactions(rows).CNY || { income: 0, expense: 0 };
    months.push({ key, label: `${date.getMonth() + 1}月`, ...summary });
  }
  const max = Math.max(1, ...months.flatMap((item) => [item.income, item.expense]));
  months.forEach((month) => {
    const column = make("div", "cashflow-month");
    const bars = make("div", "cashflow-bars");
    const income = make("div", "cashflow-bar income");
    income.style.height = `${Math.max(2, month.income / max * 100)}%`;
    income.title = `收入 ${formatMoney(month.income)}`;
    const expense = make("div", "cashflow-bar expense");
    expense.style.height = `${Math.max(2, month.expense / max * 100)}%`;
    expense.title = `支出 ${formatMoney(month.expense)}`;
    bars.append(income, expense);
    column.append(bars, make("span", "", month.label));
    container.appendChild(column);
  });
}

function openAccountDetail(accountId) {
  const account = finance.getAccount(accountId);
  if (!account) return;
  $("accountDetailTitle").textContent = account.name;
  const content = $("accountDetailContent");
  content.innerHTML = "";
  const hero = make("div", "detail-hero");
  hero.append(make("span", "", `${account.institution} · ${account.currency}`), make("strong", "", formatMoney(finance.getAccountBalance(account.id, currentWorld), account.currency)));
  const details = make("div", "detail-list");
  const owner = make("div", "detail-row"); owner.append(make("span", "", "归属"), make("strong", "", getOwnerLabel(account.owner)));
  const purpose = make("div", "detail-row"); purpose.append(make("span", "", "用途"), make("strong", "", account.tags.join(" / ")));
  const baseline = make("div", "detail-row"); baseline.append(make("span", "", `余额锚点 · ${financeData.baselineDate}`), make("strong", "", formatMoney(account.openingBalance, account.currency)));
  details.append(owner, purpose, baseline);
  const button = make("button", "primary-small-button", "查看该账户流水");
  button.type = "button";
  button.addEventListener("click", () => {
    ledgerAccountFilter = account.id;
    $("accountDetailBackdrop").hidden = true;
    activateTab("ledger");
  });
  content.append(hero, details, button);
  $("accountDetailBackdrop").hidden = false;
}

function detailRow(label, value) {
  const row = make("div", "detail-row");
  row.append(make("span", "", label), make("strong", "", value));
  return row;
}

function openAssetDetail(assetId) {
  const asset = financeData.physicalAssets.find((item) => item.id === assetId);
  if (!asset) return;
  $("assetDetailTitle").textContent = asset.name;
  const content = $("assetDetailContent");
  content.innerHTML = "";
  const hero = make("div", "detail-hero");
  hero.append(make("span", "", `${asset.owner} · ${asset.use}`));
  const value = asset.purchaseCost
    ? `约 ${formatMoney(asset.purchaseCost, asset.currency, 0)}`
    : `约 ${formatMoney(asset.purchaseCostRange[0], asset.currency, 0)}–${formatMoney(asset.purchaseCostRange[1], asset.currency, 0)}`;
  hero.appendChild(make("strong", "", value));
  const list = make("div", "detail-list");
  list.append(detailRow("产权人", asset.owner), detailRow("用途", asset.use));
  if (asset.id === "loft") {
    list.append(
      detailRow("购入成本", `约 ${formatCompactMoney(asset.purchaseCost)}`),
      detailRow("银行房贷余额", `约 ${formatCompactMoney(asset.bankMortgageBalance)}`),
      detailRow("家庭内部借款", `约 ${formatCompactMoney(asset.familyLoanBalance)}`),
      detailRow("按购入成本粗略权益", `约 ${formatCompactMoney(asset.roughEquity)}`),
      detailRow("历史装修投入", `${asset.renovationPeriod} · 约 ${formatCompactMoney(asset.renovationInvestment)}`)
    );
    const timeline = make("div", "detail-timeline");
    asset.timeline.forEach((item) => {
      const row = make("div");
      row.append(make("span", "", item.date), make("strong", "", item.text));
      timeline.appendChild(row);
    });
    content.append(hero, list, timeline);
  } else {
    list.append(detailRow("购置时间", asset.purchasedAt), detailRow("车贷", asset.vehicleLoan ? formatMoney(asset.vehicleLoan) : "无"));
    content.append(hero, list);
  }
  $("assetDetailBackdrop").hidden = false;
}

function renderTypeOptions() {
  const container = $("transactionTypeOptions");
  container.innerHTML = "";
  financeData.transactionTypes.forEach((type) => {
    const button = make("button", type.id === editorType ? "active" : "", type.label);
    button.type = "button";
    button.addEventListener("click", () => {
      editorType = type.id;
      renderEditorControls();
    });
    container.appendChild(button);
  });
}

function populateSelect(select, options, selected) {
  select.innerHTML = "";
  options.forEach((item) => {
    const option = make("option", "", item.label);
    option.value = item.value;
    select.appendChild(option);
  });
  if ([...select.options].some((option) => option.value === selected)) select.value = selected;
}

function renderEditorControls() {
  renderTypeOptions();
  const isTransfer = ["transfer", "asset_transfer", "investment"].includes(editorType);
  const isIncome = editorType === "income";
  $("transactionFromAccountLabel").textContent = isIncome ? "收款账户" : "付款账户";
  $("transactionToAccountField").hidden = !isTransfer;
  const currency = $("transactionCurrency").value;
  const accounts = finance.getAccounts(currentWorld).filter((account) => account.currency === currency);
  const fromValue = $("transactionFromAccount").value;
  const toValue = $("transactionToAccount").value;
  const options = accounts.map((account) => ({ value: account.id, label: `${account.institution} · ${account.name}` }));
  populateSelect($("transactionFromAccount"), options, fromValue);
  populateSelect($("transactionToAccount"), options, toValue);
  const categories = editorType === "income"
    ? financeData.incomeCategories
    : (isTransfer ? [editorType === "investment" ? "投资" : "账户划转"] : financeData.expenseCategories);
  const categoryValue = $("transactionCategory").value;
  populateSelect($("transactionCategory"), categories.map((item) => ({ value: item, label: item })), categoryValue);
}

function openTransactionEditor(transactionId = "") {
  let transaction = transactionId ? finance.getTransaction(transactionId) : null;
  if (transaction?.historical) {
    window.alert("历史重建流水属于固定财务基准，不能在普通流水编辑器中修改。");
    return;
  }
  if (transaction && currentWorld === "sub" && transaction.originWorld === "main") {
    setWorld("main");
    transaction = finance.getTransaction(transactionId);
  }
  editingTransactionId = transaction?.transactionId || "";
  const now = localDateParts();
  editorType = transaction?.type || "expense";
  $("transactionEditorTitle").textContent = transaction ? "编辑流水" : "记一笔";
  $("transactionWorldNote").textContent = currentWorld === "main"
    ? "主世界流水会以同一 transactionId 自动在副世界显示；修改和删除会同步体现。"
    : "副世界流水只存在于副世界，不会改变主世界账本或余额。";
  $("transactionDate").value = transaction?.date || now.date;
  $("transactionTime").value = transaction?.timeOfDay || now.time;
  $("transactionTitle").value = transaction?.title || "";
  $("transactionAmount").value = transaction?.amount || "";
  $("transactionCurrency").value = transaction?.currency || "CNY";
  populateSelect($("transactionOwner"), financeData.ledgerOwners.map((item) => ({ value: item.id, label: item.label })), transaction?.ledgerOwner || (currentWorld === "main" ? "keshi" : ownerFilter === "all" ? "luzhen" : ownerFilter));
  $("transactionOwner").disabled = currentWorld === "main";
  $("transactionNote").value = transaction?.note || "";
  renderEditorControls();
  if (transaction) {
    $("transactionFromAccount").value = transaction.fromAccountId;
    $("transactionToAccount").value = transaction.toAccountId || "";
    $("transactionCategory").value = transaction.category;
  }
  $("transactionDelete").hidden = !transaction;
  $("transactionEditorActions").classList.toggle("editing", Boolean(transaction));
  $("transactionEditorBackdrop").hidden = false;
  setTimeout(() => $("transactionTitle").focus(), 80);
}

function closeTransactionEditor() {
  $("transactionEditorBackdrop").hidden = true;
  editingTransactionId = "";
}

function saveTransaction() {
  const amount = Number($("transactionAmount").value);
  const title = $("transactionTitle").value.trim();
  const date = $("transactionDate").value;
  const timeOfDay = $("transactionTime").value;
  const fromAccountId = $("transactionFromAccount").value;
  const toAccountId = $("transactionToAccountField").hidden ? "" : $("transactionToAccount").value;
  if (!title) return window.alert("请填写流水标题。");
  if (!Number.isFinite(amount) || amount <= 0) return window.alert("金额必须大于 0。");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return window.alert("请选择有效日期。");
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeOfDay)) return window.alert("请选择有效时间。");
  if (!fromAccountId) return window.alert("请选择账户。");
  if (toAccountId && toAccountId === fromAccountId) return window.alert("转出与转入账户不能相同。");

  const existing = editingTransactionId ? finance.getTransaction(editingTransactionId) : null;
  finance.upsertTransaction({
    ...(existing || {}),
    transactionId: existing?.transactionId || finance.createId("transaction"),
    originWorld: existing?.originWorld || currentWorld,
    type: editorType,
    amount,
    currency: $("transactionCurrency").value,
    title,
    category: $("transactionCategory").value || "其他",
    note: $("transactionNote").value.trim(),
    fromAccountId,
    toAccountId,
    ledgerOwner: currentWorld === "main" ? "keshi" : $("transactionOwner").value,
    source: existing?.source || "manual",
    date,
    timeOfDay,
    occurredAt: `${date}T${timeOfDay}:00`,
    createdAt: existing?.createdAt || new Date().toISOString()
  });
  closeTransactionEditor();
  renderAll();
}

function deleteEditingTransaction() {
  if (!editingTransactionId || !window.confirm("确定删除这笔流水吗？")) return;
  finance.deleteTransaction(editingTransactionId);
  closeTransactionEditor();
  renderAll();
}

function renderCurrentTab() {
  if (currentTab === "overview") renderOverview();
  if (currentTab === "accounts") renderAccounts();
  if (currentTab === "ledger") renderLedger();
  if (currentTab === "assets") renderAssets();
  if (currentTab === "analytics") renderAnalytics();
}

function renderAll() {
  $("ownerFilter").hidden = currentWorld === "main";
  document.querySelectorAll(".world-button").forEach((button) => button.classList.toggle("active", button.dataset.world === currentWorld));
  document.querySelectorAll(".owner-filter-button").forEach((button) => button.classList.toggle("active", button.dataset.owner === ownerFilter));
  renderCurrentTab();
}

document.querySelectorAll(".world-button").forEach((button) => button.addEventListener("click", () => setWorld(button.dataset.world)));
document.querySelectorAll(".owner-filter-button").forEach((button) => button.addEventListener("click", () => {
  ownerFilter = button.dataset.owner;
  ledgerAccountFilter = "all";
  renderAll();
}));
document.querySelectorAll(".wallet-tab").forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.tab)));
document.querySelectorAll("[data-go-tab]").forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.goTab)));
$("headerAddTransaction").addEventListener("click", () => openTransactionEditor());
$("ledgerAddTransaction").addEventListener("click", () => openTransactionEditor());
$("ledgerTypeFilter").addEventListener("change", (event) => { ledgerTypeFilter = event.target.value; renderLedger(); });
$("ledgerAccountFilter").addEventListener("change", (event) => { ledgerAccountFilter = event.target.value; renderLedger(); });
$("analyticsPeriod").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
  analyticsPeriod = button.dataset.period;
  $("analyticsPeriod").querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  renderAnalytics();
}));
$("transactionCurrency").addEventListener("change", renderEditorControls);
$("transactionEditorClose").addEventListener("click", closeTransactionEditor);
$("transactionCancel").addEventListener("click", closeTransactionEditor);
$("transactionSave").addEventListener("click", saveTransaction);
$("transactionDelete").addEventListener("click", deleteEditingTransaction);
$("accountDetailClose").addEventListener("click", () => { $("accountDetailBackdrop").hidden = true; });
$("assetDetailClose").addEventListener("click", () => { $("assetDetailBackdrop").hidden = true; });
[$("transactionEditorBackdrop"), $("accountDetailBackdrop"), $("assetDetailBackdrop")].forEach((backdrop) => backdrop.addEventListener("click", (event) => {
  if (event.target === backdrop) backdrop.hidden = true;
}));

renderAll();
