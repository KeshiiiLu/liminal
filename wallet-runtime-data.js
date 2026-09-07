/* Liminal · Wallet automation and payroll definitions. Static data only. */

window.LiminalWalletRuntimeData = {
  version: 1,
  timeZone: "Asia/Shanghai",

  mealExpenses: {
    delivery: { min: 42, max: 96, category: "外卖", reimbursable: false },
    restaurant: { min: 78, max: 238, category: "餐饮", reimbursable: false },
    work_meal: { min: 32, max: 86, category: "餐饮", reimbursable: false },
    travel_meal: { min: 45, max: 148, category: "餐饮", reimbursable: true }
  },

  payroll: {
    runtimeStartPeriod: "2026-08",
    payDay: 10,
    payTime: "09:18",
    employer: "上海曼朗心理",
    accountId: "boc_main",
    salaryGrossByWorkYear: {
      2022: [52000, 58000, 55000, 62000, 60000, 73000],
      2023: [62000, 64000, 67000, 65000, 70000, 76000, 62000, 69000, 78000, 66000, 72000, 99000],
      2024: [80000, 82000, 90000, 86000, 98000, 110000, 84000, 92000, 108000, 88000, 105000, 177000],
      2025: [100000, 105000, 118000, 110000, 160000, 160000, 140000, 130000, 100000, 80000, 101000, 216000],
      2026: [110000, 104000, 118000, 96000, 132000, 150000, 105000, 112000, 120000, 98000, 130000, 145000]
    },
    salaryNetRates: {
      2022: 0.79,
      2023: 0.76,
      2024: 0.73,
      2025: 0.71,
      2026: 0.72
    },
    projectSettlementDelayMonths: 1
  }
};
