/* =========================
   Liminal · Luzhen Simulation Data
   只放规则 / 概率 / 语料，不负责渲染页面
   ========================= */

window.LIMINAL_LUZHEN_SIMULATION_DATA = {

  version: 1,


  /* =========================
     周节奏
     0 = 周日，1 = 周一 ... 6 = 周六
     ========================= */

  weeklyRoutine: {

    1: {
      label: "周一",
      events: [
        {
          title: "Loft 咨询 / 线上咨询",
          startRange: ["08:50", "09:20"],
          durationRange: [150, 210],
          probability: 0.92,
          workload: 2.2,
          tags: ["work", "consulting"]
        },
        {
          title: "病例整理 / 备课",
          startRange: ["13:20", "14:10"],
          durationRange: [100, 160],
          probability: 0.82,
          workload: 1.3,
          tags: ["work", "desk"]
        },
        {
          title: "健身",
          startRange: ["18:20", "19:20"],
          durationRange: [55, 85],
          probability: 0.78,
          workload: 0.5,
          tags: ["exercise"]
        }
      ]
    },


    2: {
      label: "周二",
      events: [
        {
          title: "晨跑",
          startRange: ["06:35", "07:05"],
          durationRange: [30, 50],
          probability: 0.58,
          workload: 0.35,
          tags: ["exercise", "run"]
        },
        {
          title: "医院督导 / 病例工作",
          startRange: ["08:50", "09:30"],
          durationRange: [170, 230],
          probability: 0.88,
          workload: 2.5,
          tags: ["work", "supervision"]
        },
        {
          title: "和同事吃午饭",
          startRange: ["11:50", "12:30"],
          durationRange: [50, 85],
          probability: 0.68,
          workload: 0.1,
          tags: ["social", "meal"],
          eventType: "meal",
          mealType: "lunch",
          mealSource: "work_meal",
          owner: "luzhen",
          location: "shanghai"
        },
        {
          title: "会议 / 讨论",
          startRange: ["14:00", "15:00"],
          durationRange: [80, 150],
          probability: 0.72,
          workload: 1.4,
          tags: ["work", "meeting"]
        }
      ]
    },


    3: {
      label: "周三",
      events: [
        {
          title: "Loft 咨询 / 远程工作",
          startRange: ["09:00", "09:40"],
          durationRange: [140, 200],
          probability: 0.86,
          workload: 2.0,
          tags: ["work", "consulting"]
        },
        {
          title: "文献 / 备课",
          startRange: ["13:30", "14:30"],
          durationRange: [90, 150],
          probability: 0.78,
          workload: 1.1,
          tags: ["work", "desk"]
        },
        {
          title: "健身",
          startRange: ["18:10", "19:10"],
          durationRange: [55, 85],
          probability: 0.74,
          workload: 0.5,
          tags: ["exercise"]
        },
        {
          title: "小组督导 / 专业交流",
          startRange: ["19:30", "20:20"],
          durationRange: [70, 110],
          probability: 0.28,
          workload: 0.8,
          tags: ["work", "supervision"]
        }
      ]
    },


    4: {
      label: "周四",
      events: [
        {
          title: "讲座 / 培训",
          startRange: ["08:50", "09:30"],
          durationRange: [140, 210],
          probability: 0.76,
          workload: 1.8,
          tags: ["work", "lecture"]
        },
        {
          title: "小组督导 / 专业会议",
          startRange: ["13:40", "14:30"],
          durationRange: [100, 170],
          probability: 0.82,
          workload: 1.8,
          tags: ["work", "supervision"]
        },
        {
          title: "专业聚餐 / 旧同事见面",
          startRange: ["18:20", "19:10"],
          durationRange: [90, 150],
          probability: 0.52,
          workload: 0.25,
          tags: ["social", "meal"],
          eventType: "meal",
          mealType: "dinner",
          mealSource: "restaurant",
          owner: "luzhen",
          location: "shanghai"
        }
      ]
    },


    5: {
      label: "周五",
      events: [
        {
          title: "晨跑",
          startRange: ["06:35", "07:05"],
          durationRange: [30, 50],
          probability: 0.46,
          workload: 0.35,
          tags: ["exercise", "run"]
        },
        {
          title: "Loft 咨询",
          startRange: ["08:40", "09:10"],
          durationRange: [190, 250],
          probability: 0.92,
          workload: 2.7,
          tags: ["work", "consulting"]
        },
        {
          title: "专项 / 国际督导",
          startRange: ["14:00", "14:50"],
          durationRange: [80, 130],
          probability: 0.58,
          workload: 1.2,
          tags: ["work", "supervision"]
        },
        {
          title: "和 Keshi 一起做饭",
          startRange: ["18:10", "19:00"],
          durationRange: [55, 95],
          probability: 0.66,
          workload: 0.0,
          tags: ["life", "meal", "together"],
          eventType: "meal",
          mealType: "dinner",
          mealSource: "home",
          owner: "both",
          location: "loft"
        }
      ]
    },


    6: {
      label: "周六",
      events: [
        {
          title: "讲座 / 大学活动",
          startRange: ["09:00", "10:00"],
          durationRange: [100, 180],
          probability: 0.36,
          workload: 1.2,
          tags: ["work", "lecture"]
        },
        {
          title: "同行见面 / 咖啡 / 外出",
          startRange: ["13:30", "15:00"],
          durationRange: [90, 180],
          probability: 0.58,
          workload: 0.2,
          tags: ["social", "life"]
        },
        {
          title: "健身",
          startRange: ["17:30", "19:00"],
          durationRange: [55, 90],
          probability: 0.76,
          workload: 0.5,
          tags: ["exercise"]
        },
        {
          title: "家人 / 行业社交",
          startRange: ["19:20", "20:20"],
          durationRange: [80, 150],
          probability: 0.3,
          workload: 0.2,
          tags: ["social"]
        }
      ]
    },


    0: {
      label: "周日",
      events: [
        {
          title: "睡懒觉 / 慢慢起床",
          startRange: ["08:30", "09:40"],
          durationRange: [30, 70],
          probability: 0.72,
          workload: -0.2,
          tags: ["life", "rest"]
        },
        {
          title: "家务 / 补给",
          startRange: ["10:30", "12:00"],
          durationRange: [50, 100],
          probability: 0.66,
          workload: 0.1,
          tags: ["life"]
        },
        {
          title: "和 Keshi 出门 / 户外",
          startRange: ["14:00", "16:00"],
          durationRange: [100, 220],
          probability: 0.7,
          workload: 0.0,
          tags: ["life", "together"]
        },
        {
          title: "核心训练 / 拉伸",
          startRange: ["17:30", "19:00"],
          durationRange: [30, 55],
          probability: 0.42,
          workload: 0.2,
          tags: ["exercise"]
        }
      ]
    }

  },


  /* =========================
     Meal 生活事件规则
     概率和倾向集中在数据层，渲染层只负责显示。
     ========================= */

  mealRules: {

    types: {
      breakfast: {
        label: "早餐",
        timeRange: ["07:10", "09:30"],
        durationRange: [20, 40],
        probability: 0.94
      },
      lunch: {
        label: "午饭",
        timeRange: ["11:40", "13:40"],
        durationRange: [30, 60],
        probability: 0.98
      },
      dinner: {
        label: "晚饭",
        timeRange: ["18:00", "20:30"],
        durationRange: [40, 85],
        probability: 0.97
      },
      snack: {
        label: "加餐",
        timeRange: ["15:00", "17:20"],
        durationRange: [10, 25],
        probability: 0.18
      },
      coffee: {
        label: "咖啡 / 饮品",
        timeRange: ["09:40", "16:40"],
        durationRange: [10, 30],
        probability: 0.24
      }
    },

    sources: {
      breakfast: {
        home: 5.2,
        delivery: 0.45,
        restaurant: 0.25,
        work_meal: 0.2
      },
      lunch: {
        home: 2.1,
        delivery: 1.3,
        restaurant: 0.65,
        work_meal: 1.15,
        project_meal: 0.45,
        travel_meal: 0.2
      },
      dinner: {
        home: 3.4,
        delivery: 0.9,
        restaurant: 1.0,
        work_meal: 0.25,
        project_meal: 0.4,
        travel_meal: 0.2
      },
      snack: {
        home: 2.0,
        delivery: 0.3,
        restaurant: 0.25,
        work_meal: 0.7
      },
      coffee: {
        home: 1.6,
        delivery: 0.2,
        restaurant: 0.75,
        work_meal: 1.0
      }
    },

    itemPools: {
      breakfast: {
        shared: [
          "烤面包",
          "原味酸奶",
          "蓝莓",
          "脆苹果",
          "咖啡"
        ],
        keshi: [
          "黄油松饼",
          "鸡蛋",
          "苹果蕉"
        ],
        luzhen: [
          "可生食鸡蛋",
          "奶酪",
          "葡萄柚"
        ]
      },
      lunch: {
        shared: [
          "乌冬面",
          "牛肉片",
          "西兰花",
          "菌菇",
          "小馄饨"
        ],
        keshi: [
          "照烧鸡腿",
          "鸡胸肉",
          "米饭"
        ],
        luzhen: [
          "海鱼",
          "豆腐",
          "荞麦面"
        ]
      },
      dinner: {
        shared: [
          "乌冬面",
          "豆腐",
          "菌菇",
          "娃娃菜",
          "葡萄柚"
        ],
        keshi: [
          "照烧鸡腿",
          "牛腩",
          "牛肉片"
        ],
        luzhen: [
          "三文鱼刺身",
          "海鱼",
          "日式小菜"
        ]
      },
      snack: {
        shared: [
          "原味酸奶",
          "蓝莓",
          "坚果",
          "高可可黑巧"
        ],
        keshi: [
          "杨桃味果冻",
          "原味薯片"
        ],
        luzhen: [
          "抹茶巧克力",
          "葡萄柚"
        ]
      },
      coffee: {
        shared: [
          "咖啡",
          "茶",
          "气泡水"
        ],
        keshi: [
          "奶咖"
        ],
        luzhen: [
          "黑咖啡"
        ]
      }
    },

    contextMultipliers: {
      highIntensity: {
        lunch: { delivery: 2.3, home: 0.55 },
        dinner: { home: 1.25, delivery: 1.2 }
      },
      institutionDay: {
        lunch: { work_meal: 2.4, restaurant: 1.25, home: 0.08 }
      },
      externalProject: {
        lunch: { project_meal: 2.8, work_meal: 1.4, home: 0.1 },
        dinner: { project_meal: 2.5, restaurant: 1.5, home: 0.35 }
      },
      fridayEarlyFinish: {
        dinner: { home: 2.2, restaurant: 0.75 }
      },
      sunday: {
        lunch: { home: 1.9, restaurant: 1.3, work_meal: 0 },
        dinner: { home: 2.0, restaurant: 1.2, work_meal: 0 }
      }
    }

  },


  /* =========================
     睡眠规则
     ========================= */

  sleepRules: {

    bedtimeRangeWeekday: [
      "23:25",
      "00:35"
    ],

    bedtimeRangeWeekend: [
      "23:40",
      "01:00"
    ],

    wakeLeadMinutes: [
      80,
      115
    ],

    noMorningEventWakeRange: [
      "07:35",
      "08:40"
    ],

    sundayWakeRange: [
      "08:20",
      "09:30"
    ],

    durationQuality: [
      {
        minMinutes: 450,
        quality: "不错"
      },
      {
        minMinutes: 390,
        quality: "一般"
      },
      {
        minMinutes: 0,
        quality: "偏差"
      }
    ],

    napProbability: {
      lowLoad: 0.08,
      normalLoad: 0.14,
      highLoad: 0.22,
      shortSleep: 0.32
    },

    napStartRange: [
      "13:00",
      "15:30"
    ],

    napDurationRange: [
      20,
      55
    ]

  },


  /* =========================
     身体状态评分
     分数越高 = 越疲劳
     ========================= */

  bodyRules: {

    sleepScore: [
      {
        maxMinutes: 330,
        score: 2.2
      },
      {
        maxMinutes: 390,
        score: 1.4
      },
      {
        maxMinutes: 435,
        score: 0.7
      },
      {
        maxMinutes: Infinity,
        score: 0
      }
    ],

    workloadMultiplier: 0.72,

    manyEventsThreshold: 4,
    manyEventsScore: 0.6,

    exerciseScore: 0.18,

    randomNoise: [
      -0.35,
      0.45
    ],

    levels: [
      {
        maxScore: 1.2,
        key: "good",
        energy: [4, 5]
      },
      {
        maxScore: 2.5,
        key: "normal",
        energy: [3, 4]
      },
      {
        maxScore: 4.0,
        key: "mildTired",
        energy: [2, 3]
      },
      {
        maxScore: Infinity,
        key: "tired",
        energy: [1, 2]
      }
    ],

    appetite: {
      normal: [
        "正常",
        "正常",
        "正常"
      ],
      afterExercise: [
        "正常",
        "比平时好一点"
      ],
      tired: [
        "正常",
        "一般"
      ]
    },

    discomfort: {
      good: [
        "无",
        "无",
        "无"
      ],
      normal: [
        "无",
        "无",
        "肩颈有点紧"
      ],
      mildTired: [
        "无",
        "肩颈有点紧",
        "有一点疲惫"
      ],
      tired: [
        "有一点疲惫",
        "肩颈有点紧",
        "明显疲惫"
      ]
    }

  },


  /* =========================
     状态语料
     ========================= */

  stateCorpus: {

    good: [
      "今天状态很好。",
      "精神挺足的，整体很轻松。",
      "今天精力不错，做事很顺。",
      "整体状态很好，没有明显疲惫感。"
    ],

    normal: [
      "今天状态正常，整体比较稳定。",
      "没什么特别的不舒服，精神还可以。",
      "今天就是普通状态，不算累。",
      "整体还算稳定，下午也没有明显掉状态。"
    ],

    mildTired: [
      "今天有一点累，但还在正常范围。",
      "精神一般，下午开始有些疲惫。",
      "状态不算差，就是比平时更容易累一点。",
      "今天消耗有点大，晚些时候明显想休息。"
    ],

    tired: [
      "今天确实比较累，精神状态偏低。",
      "工作消耗有点大，后半天明显疲惫。",
      "今天状态不太好，比较需要早点休息。",
      "整天都有些疲惫，晚上不太想再安排事情。"
    ]

  }

};
