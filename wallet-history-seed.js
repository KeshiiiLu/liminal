/* Liminal · one-time Lu Zhen historical Wallet seed */

(function () {
  "use strict";

  const finance = window.LiminalFinance;
  const history = window.LiminalWalletHistory;

  if (!finance || !history) {
    console.error("Lu Zhen Wallet history dependencies are unavailable.");
    return;
  }

  try {
    const transactions = history.buildTransactions();
    const result = finance.seedHistoricalTransactions(
      history.seedVersion,
      transactions
    );
    const marker = {
      app: "Liminal",
      seedVersion: history.seedVersion,
      generatorSeed: history.generatorSeed,
      rangeStart: history.rangeStart,
      rangeEnd: history.rangeEnd,
      generated: transactions.length,
      historicalCount: result.historicalCount,
      seededAt: result.seededAt,
      completed: true
    };
    localStorage.setItem(history.markerKey, JSON.stringify(marker));
    window.LiminalWalletHistorySeedResult = { ...result, marker };
  } catch (error) {
    console.error("陆榛历史财务流水初始化失败；现有 Wallet 数据未被删除。", error);
  }
})();
