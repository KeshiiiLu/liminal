/*
  Liminal · Lu Zhen reconstructed financial history

  This file contains deterministic rules and fixed events only. It never writes
  storage by itself. Every generated row is a sub-world historical record.
*/

(function () {
  "use strict";

  const SEED_VERSION = "luzhen-history-v1";
  const GENERATOR_SEED = "luzhen-wallet-history-2022-2026-v1";
  const RANGE_START = "2022-07-01";
  const RANGE_END = "2026-09-05";
  const MARKER_KEY = "liminal_wallet_luzhen_history_seed_v1";
  const payrollConfig = window.LiminalWalletRuntimeData?.payroll;

  if (!payrollConfig) {
    console.error("Wallet history：未找到 wallet-runtime-data.js");
    return;
  }

  function hashSeed(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function createRandom(seedText) {
    let state = hashSeed(seedText) || 1;
    return function random() {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function pad(value, length = 2) {
    return String(value).padStart(length, "0");
  }

  function dateText(year, month, day) {
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  function nextMonth(year, month) {
    return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  }

  function monthRange(startYear, startMonth, endYear, endMonth) {
    const result = [];
    let year = startYear;
    let month = startMonth;
    while (year < endYear || (year === endYear && month <= endMonth)) {
      result.push({ year, month });
      const next = nextMonth(year, month);
      year = next.year;
      month = next.month;
    }
    return result;
  }

  function buildTransactions() {
    const random = createRandom(GENERATOR_SEED);
    const transactions = [];
    const counters = new Map();

    function add(kind, input) {
      if (!input.date || input.date < RANGE_START || input.date > RANGE_END) return null;
      const counter = (counters.get(kind) || 0) + 1;
      counters.set(kind, counter);
      const timeOfDay = input.timeOfDay || `${pad(7 + Math.floor(random() * 15))}:${pad(Math.floor(random() * 60))}`;
      const transaction = {
        transactionId: `hist-lz-${input.date.replaceAll("-", "")}-${kind}-${pad(counter, 3)}`,
        id: `hist-lz-${input.date.replaceAll("-", "")}-${kind}-${pad(counter, 3)}`,
        originWorld: "sub",
        owner: "luzhen",
        ledgerOwner: input.ledgerOwner || "luzhen",
        historical: true,
        seedVersion: SEED_VERSION,
        provenance: "reconstructed",
        source: "system",
        currency: input.currency || "CNY",
        category: input.category || "其他",
        subcategory: input.subcategory || "",
        note: input.note || "",
        fromAccountId: input.fromAccountId || "",
        toAccountId: input.toAccountId || "",
        type: input.type || "expense",
        title: input.title,
        amount: roundMoney(input.amount || 0),
        date: input.date,
        timeOfDay,
        occurredAt: `${input.date}T${timeOfDay}:00+08:00`,
        createdAt: `${input.date}T${timeOfDay}:00+08:00`,
        ...input
      };
      transaction.transactionId = `hist-lz-${input.date.replaceAll("-", "")}-${kind}-${pad(counter, 3)}`;
      transaction.id = transaction.transactionId;
      transaction.originWorld = "sub";
      transaction.owner = "luzhen";
      transaction.historical = true;
      transaction.seedVersion = SEED_VERSION;
      transaction.provenance = "reconstructed";
      transactions.push(transaction);
      return transaction;
    }

    function relationshipOwner(date) {
      if (date < "2024-09-12") return "luzhen";
      const roll = random();
      if (date >= "2025-10-29") {
        if (roll < 0.42) return "family";
        if (roll < 0.56) return "keshi";
        return "luzhen";
      }
      if (roll < 0.25) return "family";
      if (roll < 0.36) return "keshi";
      return "luzhen";
    }

    add("opening", {
      date: "2022-07-01",
      timeOfDay: "08:00",
      type: "opening_balance",
      title: "德国时期及既有个人资产承接",
      amount: 3000000,
      currency: "CNY",
      category: "历史资产承接",
      toAccountId: "boc_main",
      excludeFromIncome: true,
      accountDeltas: {
        boc_main: 3000000,
        cmb_daily: 45000,
        sparkasse_giro: 11000,
        sparkasse_tagesgeld: 5000
      },
      note: "德国时期个人资产、既有家庭资产安排及来华前个人积累的历史承接；不属于职业收入。",
      historicalRole: "opening_balance"
    });

    monthRange(2022, 7, 2026, 7).forEach(({ year, month }) => {
      const salaryIndex = year === 2022 ? month - 7 : month - 1;
      const gross = payrollConfig.salaryGrossByWorkYear[year][salaryIndex] || 0;
      const payMonth = nextMonth(year, month);
      const payDay = 9 + Math.floor(random() * 3);
      const payDate = dateText(payMonth.year, payMonth.month, payDay);
      const centVariation = roundMoney((random() - 0.5) * 160);
      const net = roundMoney(gross * payrollConfig.salaryNetRates[year] + centVariation);
      add("salary", {
        date: payDate,
        timeOfDay: "09:18",
        type: "income",
        title: "曼朗心理｜工资及绩效",
        amount: net,
        category: "工资",
        subcategory: "税后工资及绩效",
        toAccountId: "boc_main",
        grossEstimate: gross,
        withholdingEstimate: roundMoney(gross - net),
        workMonth: `${year}-${pad(month)}`,
        employer: "上海曼朗心理",
        note: "机构统一核算个税后的工资、个案绩效及当期已确认项目收入。",
        historicalRole: "professional_income"
      });
    });

    monthRange(2022, 7, 2024, 1).forEach(({ year, month }) => {
      const amount = roundMoney(18400 + (year - 2022) * 650 + month * 37 + Math.floor(random() * 900));
      add("rent", {
        date: dateText(year, month, 3),
        timeOfDay: "08:35",
        type: "expense",
        title: "静安 / 长宁长期租赁公寓",
        amount,
        category: "居住",
        subcategory: "租金",
        fromAccountId: "boc_main",
        housingMode: "rental",
        note: "购入 Loft 前的长期租赁居住支出。",
        historicalRole: "rental_housing"
      });
    });

    const dailyPatterns = [
      { title: "工作日晚餐", category: "餐饮", min: 42, max: 168 },
      { title: "咖啡与简餐", category: "餐饮", min: 28, max: 92 },
      { title: "周末采购", category: "生鲜 / 买菜", min: 118, max: 426 },
      { title: "盒马生鲜", category: "生鲜 / 买菜", min: 86, max: 389 },
      { title: "超市补货", category: "超市", min: 64, max: 318 },
      { title: "工作日外卖", category: "外卖", min: 31, max: 89 },
      { title: "滴滴出行", category: "网约车", min: 24, max: 136 },
      { title: "上海地铁", category: "交通", min: 4, max: 22 },
      { title: "生活用品", category: "生活用品", min: 38, max: 286 },
      { title: "专业书籍", category: "专业书籍", min: 76, max: 428 },
      { title: "专业资料", category: "专业资料", min: 45, max: 360 },
      { title: "药房", category: "医疗 / 药品", min: 35, max: 248 },
      { title: "朋友聚餐", category: "朋友聚餐", min: 168, max: 668 },
      { title: "个人护理", category: "个人护理", min: 88, max: 480 },
      { title: "京东 / 淘宝", category: "普通网购", min: 49, max: 519 },
      { title: "通信与网络", category: "通信", min: 79, max: 219 },
      { title: "物业 / 水电", category: "物业 / 水电", min: 260, max: 1180 },
      { title: "停车 / 加油", category: "车辆使用", min: 180, max: 690 },
      { title: "家庭用品", category: "家居用品", min: 72, max: 520 },
      { title: "健身与运动", category: "健身", min: 88, max: 399 }
    ];
    const dailyCounts = { 2022: 8, 2023: 10, 2024: 13, 2025: 15, 2026: 20 };
    monthRange(2022, 7, 2026, 9).forEach(({ year, month }) => {
      const count = year === 2026 && month === 9 ? 4 : dailyCounts[year];
      for (let index = 0; index < count; index += 1) {
        const maxDay = year === 2026 && month === 9 ? 5 : 28;
        const day = 1 + Math.floor(random() * maxDay);
        const date = dateText(year, month, day);
        let pattern = dailyPatterns[Math.floor(random() * dailyPatterns.length)];
        if (date < "2024-02-01" && ["停车 / 加油", "家庭用品"].includes(pattern.title)) {
          pattern = dailyPatterns[Math.floor(random() * 15)];
        }
        const owner = relationshipOwner(date);
        let title = pattern.title;
        if (owner === "family" && date >= "2024-09-12") {
          if (pattern.category === "餐饮") title = "两人晚餐";
          if (["生鲜 / 买菜", "超市"].includes(pattern.category)) title = "家庭采购";
          if (["生活用品", "家居用品"].includes(pattern.category)) title = "Loft 家庭用品";
        }
        if (owner === "keshi" && date >= "2024-09-12" && pattern.category === "餐饮") {
          title = "和 Keshi 吃饭";
        }
        const rawAmount = pattern.min + random() * (pattern.max - pattern.min);
        const amount = random() < 0.58
          ? Math.round(rawAmount)
          : (random() < 0.5 ? Math.round(rawAmount * 2) / 2 : roundMoney(rawAmount));
        add("daily", {
          date,
          type: "expense",
          title,
          amount,
          category: pattern.category,
          fromAccountId: "cmb_daily",
          ledgerOwner: owner,
          housingMode: date < "2024-02-01" ? "rental" : "loft",
          historicalRole: "daily_life"
        });
      }
    });

    const topUps = [
      ["2022-08-18", 8000], ["2022-11-24", 7000],
      ["2023-02-17", 9000], ["2023-05-26", 8000], ["2023-08-21", 10000], ["2023-11-23", 9000],
      ["2024-03-22", 9000], ["2024-06-28", 8000], ["2024-09-20", 10000], ["2024-12-19", 9000],
      ["2025-02-21", 9000], ["2025-04-25", 8000], ["2025-07-18", 10000], ["2025-09-26", 8000], ["2025-12-18", 11000],
      ["2026-02-20", 9000], ["2026-04-24", 8000], ["2026-06-19", 10000], ["2026-08-21", 9000]
    ];
    topUps.forEach(([date, amount]) => add("topup", {
      date,
      timeOfDay: "16:10",
      type: "transfer",
      title: "补充招商银行生活账户",
      amount,
      category: "账户划转",
      fromAccountId: "boc_main",
      toAccountId: "cmb_daily",
      excludeFromIncome: true,
      excludeFromExpense: true,
      historicalRole: "daily_account_waterline"
    }));

    const reserveTransfers = [
      ["2022-12-20", "emergency_fund", 20000, "建立即时应急资金"],
      ["2023-03-24", "emergency_fund", 15000, "补充即时应急资金"],
      ["2025-03-21", "emergency_fund", 10000, "恢复即时应急资金"],
      ["2026-03-20", "emergency_fund", 15000, "应急资金达到目标水位"],
      ["2023-06-23", "short_term_deposit", 30000, "建立短期滚动定期"],
      ["2024-08-23", "short_term_deposit", 25000, "补充短期滚动定期"],
      ["2025-12-05", "short_term_deposit", 20000, "恢复短期定期水位"],
      ["2026-05-22", "short_term_deposit", 25000, "短期定期达到目标水位"],
      ["2023-10-20", "low_risk_reserve", 25000, "建立低风险储备"],
      ["2024-11-22", "low_risk_reserve", 25000, "补充低风险现金 / 固收"],
      ["2025-05-23", "low_risk_reserve", 30000, "恢复低风险储备"],
      ["2026-07-24", "low_risk_reserve", 20000, "低风险储备达到目标水位"],
      ["2024-01-12", "boc_mortgage_reserve", 50000, "建立房贷安全缓冲"],
      ["2025-12-19", "boc_mortgage_reserve", 21000, "补充房贷安全缓冲"],
      ["2026-06-26", "boc_mortgage_reserve", 15000, "房贷备用金恢复目标水位"]
    ];
    reserveTransfers.forEach(([date, target, amount, title]) => add("reserve", {
      date,
      timeOfDay: "15:40",
      type: "asset_transfer",
      title,
      amount,
      category: "储备资金",
      fromAccountId: "boc_main",
      toAccountId: target,
      excludeFromIncome: true,
      excludeFromExpense: true,
      historicalRole: "target_waterline"
    }));

    const investments = [
      ["2023-04-21", 20000], ["2023-09-22", 20000],
      ["2024-04-26", 20000], ["2024-07-19", 25000], ["2024-12-20", 25000],
      ["2025-02-28", 20000], ["2025-04-18", 20000], ["2025-06-20", 25000], ["2026-01-23", 30000],
      ["2025-10-24", 35000], ["2025-11-21", 25000], ["2026-02-06", 40000],
      ["2026-02-27", 20000], ["2026-04-17", 25000], ["2026-05-29", 30000],
      ["2026-07-17", 25000], ["2026-08-28", 33000]
    ];
    investments.forEach(([date, amount], index) => add("investment", {
      date,
      timeOfDay: "14:25",
      type: "investment",
      title: index % 3 === 1 ? "长期分散配置｜债券 ETF / 债券基金" : "长期分散配置｜宽基指数 ETF",
      amount,
      category: "长期投资",
      fromAccountId: "boc_main",
      toAccountId: "china_securities",
      excludeFromIncome: true,
      excludeFromExpense: true,
      investmentStyle: "long_term_diversified",
      historicalRole: "securities_formation"
    }));

    const propertyDate = "2024-01-18";
    add("mortgage-draw", {
      date: propertyDate,
      timeOfDay: "09:20",
      type: "loan_drawdown",
      title: "Loft 住房贷款放款",
      amount: 7000000,
      category: "住房贷款",
      toAccountId: "boc_main",
      excludeFromIncome: true,
      loanPrincipal: 7000000,
      termMonths: 360,
      annualRate: 0.031,
      relatedAssetId: "loft",
      historicalRole: "loan_drawdown"
    });
    add("family-draw", {
      date: propertyDate,
      timeOfDay: "09:35",
      type: "family_loan_drawdown",
      title: "Engel 家庭购房借款",
      amount: 5000000,
      category: "家庭借款",
      toAccountId: "boc_main",
      excludeFromIncome: true,
      interestRate: 0,
      relatedAssetId: "loft",
      historicalRole: "family_loan_drawdown"
    });
    add("property", {
      date: propertyDate,
      timeOfDay: "14:10",
      type: "asset_acquisition",
      title: "购入中星海上华庭 Loft + 产权车位",
      amount: 15000000,
      category: "房产取得",
      fromAccountId: "boc_main",
      excludeFromExpense: true,
      capitalExpense: true,
      relatedAssetId: "loft",
      capitalSources: { personal: 3000000, bankMortgage: 7000000, familyLoan: 5000000 },
      historicalRole: "asset_acquisition"
    });

    const principal = 7000000;
    const monthlyRate = 0.031 / 12;
    const payment = roundMoney(principal * monthlyRate * ((1 + monthlyRate) ** 360) / (((1 + monthlyRate) ** 360) - 1));
    let remainingPrincipal = principal;
    monthRange(2024, 2, 2026, 8).forEach(({ year, month }, index) => {
      const interest = roundMoney(remainingPrincipal * monthlyRate);
      const principalPaid = roundMoney(payment - interest);
      remainingPrincipal = roundMoney(remainingPrincipal - principalPaid);
      add("mortgage", {
        date: dateText(year, month, 15),
        timeOfDay: "07:45",
        type: "repayment",
        title: "住房贷款月供",
        amount: payment,
        category: "住房贷款利息",
        subcategory: "等额本息",
        fromAccountId: "boc_main",
        expenseAmount: interest,
        payment,
        principal: principalPaid,
        interest,
        remainingPrincipal,
        installmentNumber: index + 1,
        annualRate: 0.031,
        relatedLiabilityId: "bank_mortgage",
        historicalRole: "mortgage_repayment"
      });
    });

    const familyRepaymentDrafts = monthRange(2024, 4, 2026, 8).map(({ year, month }, index) => {
      let eurAmount = [1000, 1200, 1500, 1100, 1300][index % 5];
      if (month === 12) eurAmount += 3000;
      if ((year === 2025 && month === 6) || (year === 2026 && month === 6)) eurAmount += 1800;
      const baseRate = 7.58 + random() * 0.34;
      return { year, month, eurAmount, baseRate, raw: eurAmount * baseRate };
    });
    const rawFamilyTotal = familyRepaymentDrafts.reduce((sum, item) => sum + item.raw, 0);
    const familyScale = 350000 / rawFamilyTotal;
    let familyRoundedTotal = 0;
    familyRepaymentDrafts.forEach((item, index) => {
      const isLast = index === familyRepaymentDrafts.length - 1;
      const cnyEquivalent = isLast
        ? roundMoney(350000 - familyRoundedTotal)
        : roundMoney(item.raw * familyScale);
      familyRoundedTotal = roundMoney(familyRoundedTotal + cnyEquivalent);
      add("family-repay", {
        date: dateText(item.year, item.month, 20 + (index % 4)),
        timeOfDay: "11:30",
        type: "repayment",
        title: "Engel 家庭借款偿还",
        amount: cnyEquivalent,
        category: "family_loan_repayment",
        subcategory: "家庭借款偿还 / 长期反哺父母",
        fromAccountId: "boc_main",
        excludeFromExpense: true,
        eurAmount: item.eurAmount,
        fxRate: roundMoney(cnyEquivalent / item.eurAmount),
        cnyEquivalent,
        principal: cnyEquivalent,
        relatedLiabilityId: "family_loan",
        remainingPrincipal: roundMoney(5000000 - familyRoundedTotal),
        historicalRole: "family_loan_repayment"
      });
    });

    const renovationStages = [
      ["2024-02-28", "设计与拆改", 90000],
      ["2024-04-08", "施工第一阶段款", 130000],
      ["2024-05-24", "水电工程", 115000],
      ["2024-07-05", "基础硬装", 180000],
      ["2024-08-30", "木作与定制", 155000],
      ["2024-10-18", "厨卫设备", 130000],
      ["2024-12-06", "主要家具", 160000],
      ["2025-02-14", "照明与电器", 125000],
      ["2025-04-11", "主要家电", 95000],
      ["2025-06-30", "软装布置", 80000],
      ["2025-07-11", "收纳与补充家具", 50000],
      ["2025-08-29", "装修收尾", 40000]
    ];
    renovationStages.forEach(([date, stage, amount]) => add("renovation", {
      date,
      timeOfDay: "13:20",
      type: "asset_acquisition",
      title: `Loft 装修｜${stage}`,
      amount,
      category: "装修历史投入",
      fromAccountId: "boc_main",
      ledgerOwner: date >= "2024-09-12" ? "family" : "luzhen",
      excludeFromExpense: true,
      capitalExpense: true,
      relatedAssetId: "loft",
      historicalRole: "renovation"
    }));

    const vehicleCosts = [
      ["2024-06-20", "Volvo XC90 车辆购置", 540000, "车辆购置"],
      ["2024-06-21", "Volvo XC90 购置税", 47787.61, "购置税"],
      ["2024-06-22", "Volvo XC90 首年保险", 16842.39, "保险"],
      ["2024-06-24", "上海车牌及登记相关成本", 40370, "牌照 / 登记"]
    ];
    vehicleCosts.forEach(([date, title, amount, subcategory]) => add("vehicle", {
      date,
      timeOfDay: "10:30",
      type: "asset_acquisition",
      title,
      amount,
      category: "车辆取得",
      subcategory,
      fromAccountId: "boc_main",
      excludeFromExpense: true,
      capitalExpense: true,
      relatedAssetId: "xc90",
      historicalRole: "vehicle_acquisition"
    }));

    const euroConversions = [
      ["2023-05-19", 1500, 7.63],
      ["2025-03-14", 1700, 7.82],
      ["2026-04-10", 1000, 7.74]
    ];
    euroConversions.forEach(([date, eurAmount, fxRate]) => {
      const cnyAmount = roundMoney(eurAmount * fxRate);
      add("fx", {
        date,
        timeOfDay: "14:08",
        type: "capital_transfer",
        title: "中国银行账户购汇 EUR",
        amount: cnyAmount,
        currency: "CNY",
        category: "购汇",
        fromAccountId: "boc_main",
        toAccountId: "boc_eur",
        toAmount: eurAmount,
        accountDeltas: { boc_main: -cnyAmount, boc_eur: eurAmount },
        excludeFromIncome: true,
        excludeFromExpense: true,
        eurAmount,
        fxRate,
        cnyEquivalent: cnyAmount,
        historicalRole: "fx_conversion"
      });
    });

    [
      ["2023-08-16", "sparkasse_giro", "sparkasse_tagesgeld", 1200, "德国账户内部储备划转"],
      ["2025-01-17", "sparkasse_tagesgeld", "sparkasse_giro", 600, "德国账户低频内部调度"]
    ].forEach(([date, from, to, amount, title]) => add("eur-transfer", {
      date,
      timeOfDay: "13:05",
      type: "asset_transfer",
      title,
      amount,
      currency: "EUR",
      category: "欧元内部划转",
      fromAccountId: from,
      toAccountId: to,
      excludeFromIncome: true,
      excludeFromExpense: true,
      historicalRole: "euro_account_maintenance"
    }));

    [
      ["2022-12-29", 18.4], ["2023-12-28", 21.6], ["2024-12-30", 23.4],
      ["2025-12-29", 24.8], ["2026-06-29", 12.4]
    ].forEach(([date, amount]) => add("eur-fee", {
      date,
      timeOfDay: "12:00",
      type: "expense",
      title: "欧洲账户维护",
      amount,
      currency: "EUR",
      category: "账户维护",
      fromAccountId: "sparkasse_giro",
      historicalRole: "euro_account_maintenance"
    }));

    // Reconcile the explicit 2022 opening event against the authoritative
    // 2026-09-05 account anchors. This keeps the reconstructed opening visible
    // and auditable instead of hiding a final-day correction in the ledger.
    const openingTransaction = transactions.find((item) => item.historicalRole === "opening_balance");
    const finance = window.LiminalFinance;
    const definitions = window.LiminalFinanceData;
    if (openingTransaction && finance && definitions) {
      const openingBalances = {};
      definitions.accounts.filter((account) => account.owner === "luzhen").forEach((account) => {
        const laterDelta = transactions
          .filter((item) => item !== openingTransaction)
          .reduce((sum, item) => sum + finance.transactionDeltaForAccount(item, account.id), 0);
        const requiredOpening = roundMoney(account.openingBalance - laterDelta);
        if (Math.abs(requiredOpening) >= 0.005) openingBalances[account.id] = requiredOpening;
      });
      openingTransaction.accountDeltas = openingBalances;
      openingTransaction.openingBalances = { ...openingBalances };
      openingTransaction.amount = openingBalances.boc_main || 0;
      openingTransaction.note = "根据 2026-09-05 权威余额反推的德国时期个人资产、既有家庭资产安排及来华前个人积累；不属于职业收入。";
    }

    return transactions.sort((left, right) => (
      `${left.date}T${left.timeOfDay}`.localeCompare(`${right.date}T${right.timeOfDay}`) ||
      left.transactionId.localeCompare(right.transactionId)
    ));
  }

  window.LiminalWalletHistory = {
    seedVersion: SEED_VERSION,
    generatorSeed: GENERATOR_SEED,
    markerKey: MARKER_KEY,
    rangeStart: RANGE_START,
    rangeEnd: RANGE_END,
    buildTransactions
  };
})();
