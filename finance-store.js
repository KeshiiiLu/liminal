/* Liminal · shared Wallet runtime store and legacy migration */

(function () {
  "use strict";

  const STORAGE_KEY = "liminal_wallet_v1";
  const CURRENT_SCHEMA_VERSION = 2;
  const definitions = window.LiminalFinanceData;

  if (!definitions) {
    console.error("Finance definitions are unavailable.");
    return;
  }

  const allowedTypes = new Set(
    definitions.transactionTypes.map((item) => item.id)
  );

  function createId(prefix = "wallet") {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      return `${prefix}_${window.crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function isFiniteAmount(value) {
    return Number.isFinite(Number(value)) && Number(value) >= 0;
  }

  function uniqueId(base, used) {
    let result = String(base || createId("transaction"));
    let suffix = 2;
    while (used.has(result)) {
      result = `${base || "transaction"}_${suffix}`;
      suffix += 1;
    }
    used.add(result);
    return result;
  }

  function accountDefinition(accountId) {
    return definitions.accounts.find((item) => item.id === accountId) || null;
  }

  function mapLegacyAccount(value, originWorld = "sub") {
    const aliases = {
      Keshi: "keshi_main",
      Lennon: "cmb_daily",
      luzhen: "cmb_daily",
      Family: "cmb_daily"
    };

    if (accountDefinition(value)) {
      return value;
    }

    return aliases[value] || (originWorld === "main" ? "keshi_main" : "cmb_daily");
  }

  function mapLegacyOwner(value, fallback = "keshi") {
    const aliases = {
      Keshi: "keshi",
      Lennon: "luzhen",
      luzhen: "luzhen",
      Family: "family",
      family: "family"
    };
    return aliases[value] || (["keshi", "luzhen", "family"].includes(value) ? value : fallback);
  }

  function splitDateTime(value) {
    const parsed = value ? new Date(value) : new Date();
    const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    const localDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
    const localTime = [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0")
    ].join(":");
    return { date: localDate, time: localTime };
  }

  function normalizeTransaction(input, fallbackWorld, usedIds) {
    const source = input && typeof input === "object" ? input : {};
    const originWorld = source.originWorld === "main" || source.originWorld === "sub"
      ? source.originWorld
      : fallbackWorld;
    const transactionId = uniqueId(
      source.transactionId || source.id || createId("transaction"),
      usedIds
    );
    const legacyDateTime = splitDateTime(source.occurredAt || source.createdAt || source.time);
    const fromAccountId = mapLegacyAccount(
      source.fromAccountId || source.account,
      originWorld
    );
    const type = allowedTypes.has(source.type) ? source.type : "expense";
    const defaultOwner = originWorld === "main"
      ? "keshi"
      : mapLegacyOwner(source.account, "luzhen");
    const date = /^\d{4}-\d{2}-\d{2}$/.test(source.date || "")
      ? source.date
      : legacyDateTime.date;
    const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(source.timeOfDay || "")
      ? source.timeOfDay
      : legacyDateTime.time;

    return {
      ...source,
      transactionId,
      id: transactionId,
      originWorld,
      type,
      amount: isFiniteAmount(source.amount) ? Number(source.amount) : 0,
      currency: source.currency || accountDefinition(fromAccountId)?.currency || "CNY",
      title: String(source.title || "未命名流水"),
      category: String(source.category || "其他"),
      subcategory: String(source.subcategory || ""),
      note: String(source.note || ""),
      fromAccountId,
      toAccountId: source.toAccountId ? mapLegacyAccount(source.toAccountId, originWorld) : "",
      ledgerOwner: mapLegacyOwner(source.ledgerOwner || source.account, defaultOwner),
      source: source.source || "manual",
      date,
      timeOfDay: time,
      occurredAt: `${date}T${time}:00`,
      createdAt: source.createdAt || source.time || new Date().toISOString()
    };
  }

  function createAccountState() {
    return Object.fromEntries(
      definitions.accounts.map((account) => [
        account.id,
        {
          accountId: account.id,
          currency: account.currency,
          openingBalance: account.openingBalance,
          initializedAt: definitions.baselineDate
        }
      ])
    );
  }

  function createInitialState() {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      initializedAt: new Date().toISOString(),
      baselineDate: definitions.baselineDate,
      accounts: createAccountState(),
      transactions: [],
      migration: null
    };
  }

  function ensureAccountState(accounts) {
    const result = accounts && typeof accounts === "object" && !Array.isArray(accounts)
      ? { ...accounts }
      : {};

    definitions.accounts.forEach((account) => {
      if (!hasOwn(result, account.id) || !result[account.id] || typeof result[account.id] !== "object") {
        result[account.id] = {
          accountId: account.id,
          currency: account.currency,
          openingBalance: account.openingBalance,
          initializedAt: definitions.baselineDate
        };
        return;
      }

      const stored = result[account.id];
      result[account.id] = {
        ...stored,
        accountId: account.id,
        currency: stored.currency || account.currency,
        openingBalance: isFiniteAmount(stored.openingBalance)
          ? Number(stored.openingBalance)
          : account.openingBalance
      };
    });

    return result;
  }

  function migrateLegacyState(parsed) {
    const state = createInitialState();
    const usedIds = new Set();
    const main = Array.isArray(parsed?.main) ? parsed.main : [];
    const sub = Array.isArray(parsed?.liminal) ? parsed.liminal : [];
    const mainIds = new Set(main.map((item) => String(item?.id || item?.transactionId || "")));

    main.forEach((item) => {
      state.transactions.push(normalizeTransaction(item, "main", usedIds));
    });

    sub.forEach((item) => {
      const mirrorSource = String(item?.mirroredFrom || "");
      const legacyId = String(item?.id || item?.transactionId || "");
      if ((mirrorSource && mainIds.has(mirrorSource)) || (legacyId && mainIds.has(legacyId))) {
        return;
      }
      state.transactions.push(normalizeTransaction(item, "sub", usedIds));
    });

    state.migration = {
      from: "wallet-v1-dual-arrays",
      migratedAt: new Date().toISOString(),
      legacyMainCount: main.length,
      legacySubCount: sub.length,
      resultCount: state.transactions.length
    };
    return state;
  }

  function normalizeCurrentState(parsed) {
    const usedIds = new Set();
    return {
      ...parsed,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      baselineDate: parsed.baselineDate || definitions.baselineDate,
      initializedAt: parsed.initializedAt || new Date().toISOString(),
      accounts: ensureAccountState(parsed.accounts),
      transactions: (Array.isArray(parsed.transactions) ? parsed.transactions : [])
        .map((item) => normalizeTransaction(item, item?.originWorld || "sub", usedIds))
    };
  }

  function readState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { state: createInitialState(), shouldSave: true };
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.transactions)) {
        return { state: normalizeCurrentState(parsed), shouldSave: parsed.schemaVersion !== CURRENT_SCHEMA_VERSION };
      }
      return { state: migrateLegacyState(parsed), shouldSave: true };
    } catch (error) {
      console.error("读取 Wallet 数据失败，原始内容未删除。", error);
      return { state: createInitialState(), shouldSave: false };
    }
  }

  const loaded = readState();
  let state = loaded.state;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  if (loaded.shouldSave) {
    save();
  }

  function getTransactionsForWorld(world) {
    return state.transactions
      .filter((item) => world === "sub" || item.originWorld === "main")
      .slice()
      .sort((a, b) => (
        `${b.date}T${b.timeOfDay}`.localeCompare(`${a.date}T${a.timeOfDay}`) ||
        String(b.createdAt).localeCompare(String(a.createdAt))
      ));
  }

  function transactionDeltaForAccount(transaction, accountId) {
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === "income") {
      return (transaction.toAccountId || transaction.fromAccountId) === accountId ? amount : 0;
    }
    if (["transfer", "asset_transfer", "investment"].includes(transaction.type)) {
      let delta = 0;
      if (transaction.fromAccountId === accountId) delta -= amount;
      if (transaction.toAccountId === accountId) delta += amount;
      return delta;
    }
    return transaction.fromAccountId === accountId ? -amount : 0;
  }

  function getAccountBalance(accountId, world = "sub") {
    const opening = Number(state.accounts?.[accountId]?.openingBalance) || 0;
    return getTransactionsForWorld(world).reduce(
      (total, transaction) => total + transactionDeltaForAccount(transaction, accountId),
      opening
    );
  }

  function accountVisibleInWorld(account, world) {
    return Array.isArray(account.worlds) && account.worlds.includes(world);
  }

  function getAccounts(world = "sub", owner = "all") {
    return definitions.accounts.filter((account) => (
      accountVisibleInWorld(account, world) &&
      (owner === "all" || account.owner === owner)
    ));
  }

  function getCurrencyTotals(world = "sub", owner = "all") {
    return getAccounts(world, owner).reduce((totals, account) => {
      totals[account.currency] = (totals[account.currency] || 0) + getAccountBalance(account.id, world);
      return totals;
    }, {});
  }

  function getTransaction(transactionId) {
    return state.transactions.find((item) => item.transactionId === transactionId) || null;
  }

  function upsertTransaction(input) {
    const requestedId = input?.transactionId || input?.id || createId("transaction");
    const existingIndex = state.transactions.findIndex((item) => (
      item.transactionId === requestedId ||
      (input?.externalRef && item.externalRef === input.externalRef)
    ));
    const usedIds = new Set(
      state.transactions
        .filter((_, index) => index !== existingIndex)
        .map((item) => item.transactionId)
    );
    const normalized = normalizeTransaction(
      { ...input, transactionId: requestedId },
      input?.originWorld === "main" ? "main" : "sub",
      usedIds
    );

    if (existingIndex >= 0) {
      state.transactions[existingIndex] = normalized;
    } else {
      state.transactions.push(normalized);
    }
    save();
    return normalized;
  }

  function deleteTransaction(transactionId) {
    const next = state.transactions.filter((item) => item.transactionId !== transactionId);
    if (next.length === state.transactions.length) return false;
    state.transactions = next;
    save();
    return true;
  }

  function resetCachedStateForTests() {
    state = readState().state;
  }

  window.LiminalFinance = {
    STORAGE_KEY,
    CURRENT_SCHEMA_VERSION,
    definitions,
    getState: () => state,
    save,
    createId,
    getAccount: accountDefinition,
    getAccounts,
    getTransactionsForWorld,
    getTransaction,
    getAccountBalance,
    getCurrencyTotals,
    transactionDeltaForAccount,
    upsertTransaction,
    deleteTransaction,
    mapLegacyAccount,
    mapLegacyOwner,
    resetCachedStateForTests
  };
})();
