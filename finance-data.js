/*
  Liminal · Finance fixed world definitions

  Static definitions live here. Runtime balances and transactions are copied
  into / derived from liminal_wallet_v1 and are never written back to this file.
*/

window.LiminalFinanceData = {
  baselineDate: "2026-09-05",

  currencies: [
    { id: "CNY", symbol: "¥", label: "人民币" },
    { id: "EUR", symbol: "€", label: "欧元" }
  ],

  transactionTypes: [
    { id: "income", label: "收入" },
    { id: "expense", label: "支出" },
    { id: "transfer", label: "转账" },
    { id: "asset_transfer", label: "资产划转" },
    { id: "investment", label: "投资" },
    { id: "repayment", label: "还款" }
  ],

  ledgerOwners: [
    { id: "keshi", label: "Keshi" },
    { id: "luzhen", label: "陆榛" },
    { id: "family", label: "家庭" }
  ],

  expenseCategories: [
    "餐饮", "买菜", "外卖", "零食饮料", "购物", "日用品",
    "交通", "学习", "医疗", "娱乐", "礼物", "居住", "其他"
  ],

  incomeCategories: [
    "生活费", "工资", "绩效", "兼职", "咨询", "督导", "讲座",
    "企业项目", "转账", "红包", "退款", "礼金", "投资收益", "其他"
  ],

  accounts: [
    {
      id: "keshi_main",
      institution: "主世界",
      name: "Keshi · 主世界个人账户",
      shortName: "Keshi 主世界账户",
      currency: "CNY",
      openingBalance: 0,
      owner: "keshi",
      worlds: ["main", "sub"],
      kind: "cash",
      tags: ["现实账户", "个人收支"]
    },
    {
      id: "boc_main",
      institution: "中国银行",
      name: "工资 / 主资金账户",
      shortName: "中行主资金",
      currency: "CNY",
      openingBalance: 118430.26,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "cash",
      tags: ["工资结算", "资金调度", "房贷扣款"]
    },
    {
      id: "boc_mortgage_reserve",
      institution: "中国银行",
      name: "住房贷款备用金",
      shortName: "房贷备用金",
      currency: "CNY",
      openingBalance: 86000,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "reserve",
      tags: ["房贷缓冲"]
    },
    {
      id: "boc_eur",
      institution: "中国银行",
      name: "EUR 账户",
      shortName: "中行 EUR",
      currency: "EUR",
      openingBalance: 4200,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "foreign",
      tags: ["欧元资金"]
    },
    {
      id: "cmb_daily",
      institution: "招商银行",
      name: "日常生活账户",
      shortName: "招行生活账户",
      currency: "CNY",
      openingBalance: 42680.14,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "cash",
      tags: ["生活消费", "家庭消费"]
    },
    {
      id: "emergency_fund",
      institution: "储备",
      name: "即时应急资金",
      shortName: "应急资金",
      currency: "CNY",
      openingBalance: 60000,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "reserve",
      tags: ["应急"]
    },
    {
      id: "short_term_deposit",
      institution: "储备",
      name: "短期滚动定期",
      shortName: "滚动定期",
      currency: "CNY",
      openingBalance: 100000,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "reserve",
      tags: ["短期储备"]
    },
    {
      id: "low_risk_reserve",
      institution: "储备",
      name: "低风险现金 / 固收储备",
      shortName: "低风险储备",
      currency: "CNY",
      openingBalance: 100000,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "fixed_income",
      tags: ["低风险", "固收"]
    },
    {
      id: "china_securities",
      institution: "投资",
      name: "中国证券账户",
      shortName: "中国证券",
      currency: "CNY",
      openingBalance: 438000,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "investment",
      tags: ["长期投资"]
    },
    {
      id: "sparkasse_giro",
      institution: "德国",
      name: "Sparkasse Girokonto",
      shortName: "Sparkasse Giro",
      currency: "EUR",
      openingBalance: 5600,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "foreign",
      tags: ["欧洲支付"]
    },
    {
      id: "sparkasse_tagesgeld",
      institution: "德国",
      name: "Sparkasse Tagesgeld",
      shortName: "Sparkasse Tagesgeld",
      currency: "EUR",
      openingBalance: 3400,
      owner: "luzhen",
      worlds: ["sub"],
      kind: "foreign",
      tags: ["欧元储备"]
    }
  ],

  physicalAssets: [
    {
      id: "loft",
      name: "Loft + 产权车位",
      owner: "陆榛",
      use: "家庭住宅",
      currency: "CNY",
      purchaseCost: 15000000,
      bankMortgageBalance: 6600000,
      familyLoanBalance: 4650000,
      roughEquity: 3750000,
      renovationInvestment: 1350000,
      renovationPeriod: "2024—2025",
      timeline: [
        { date: "2024.01", text: "购入 Loft" },
        { date: "2024—2025", text: "完成主要装修" },
        { date: "2026.09", text: "银行房贷剩余约 ¥6.6M" }
      ]
    },
    {
      id: "xc90",
      name: "Volvo XC90 B5 智行豪华版 5座",
      owner: "陆榛",
      use: "家庭用车",
      currency: "CNY",
      purchaseCostRange: [640000, 650000],
      purchasedAt: "未记录",
      vehicleLoan: 0
    }
  ],

  liabilities: [
    {
      id: "bank_mortgage",
      name: "银行住房贷款",
      currency: "CNY",
      balance: 6600000,
      owner: "陆榛",
      relatedAssetId: "loft"
    },
    {
      id: "family_loan",
      name: "Engel 家庭内部借款",
      currency: "CNY",
      balance: 4650000,
      owner: "陆榛",
      relatedAssetId: "loft"
    }
  ]
};
