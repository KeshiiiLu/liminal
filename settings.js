const RULES_STORAGE_KEY =
  "liminal_world_rules_v1";

const TODAY_ODDS_STORAGE_KEY =
  "liminal_today_odds_v1";


const defaultRules = {

  gift: {
    label: "主动送礼",
    min: 10.0,
    max: 30.0
  },

  message: {
    label: "主动发消息",
    min: 30.0,
    max: 60.0
  },

  call: {
    label: "主动打电话",
    min: 5.0,
    max: 15.0
  }

};


const inputs = {

  gift: {
    min: document.getElementById("giftMin"),
    max: document.getElementById("giftMax")
  },

  message: {
    min: document.getElementById("messageMin"),
    max: document.getElementById("messageMax")
  },

  call: {
    min: document.getElementById("callMin"),
    max: document.getElementById("callMax")
  }

};


const saveRulesButton =
  document.getElementById(
    "saveRulesButton"
  );

const saveMessage =
  document.getElementById(
    "saveMessage"
  );

const revealButtons =
  document.querySelectorAll(
    "[data-reveal-rule]"
  );


/* =========================
   今天的日期
   ========================= */

function getTodayKey() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;

}


/* =========================
   整理概率
   ========================= */

function normalizeProbability(
  value
) {

  let number =
    Number(value);


  if (!Number.isFinite(number)) {
    number = 0;
  }


  number =
    Math.max(
      0,
      Math.min(
        100,
        number
      )
    );


  return (
    Math.round(
      number * 10
    ) / 10
  );

}


/* =========================
   读取长期规则
   ========================= */

function loadRules() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          RULES_STORAGE_KEY
        )
      );


    if (
      saved &&
      saved.rules
    ) {

      return saved;

    }

  } catch (error) {

    console.warn(
      "读取随机规则失败",
      error
    );

  }


  return {

    updatedAt: 0,

    personId:
      "luzhen",

    personName:
      "陆榛",

    rules:
      JSON.parse(
        JSON.stringify(
          defaultRules
        )
      )

  };

}


/* =========================
   显示长期规则
   ========================= */

function renderRules() {

  const saved =
    loadRules();


  Object.keys(inputs)
    .forEach(
      function (ruleId) {

        const rule =
          saved.rules[ruleId] ||
          defaultRules[ruleId];


        inputs[ruleId].min.value =
          normalizeProbability(
            rule.min
          ).toFixed(1);


        inputs[ruleId].max.value =
          normalizeProbability(
            rule.max
          ).toFixed(1);

      }
    );

}


/* =========================
   范围随机
   ========================= */

function randomBetween(
  min,
  max
) {

  min =
    normalizeProbability(min);

  max =
    normalizeProbability(max);


  const value =
    min +
    Math.random() *
    (max - min);


  return (
    Math.round(
      value * 10
    ) / 10
  );

}


/* =========================
   生成今日概率
   ========================= */

function generateTodayOdds(
  rulesData
) {

  const values = {};


  Object.entries(
    rulesData.rules
  ).forEach(
    function (
      [ruleId, rule]
    ) {

      values[ruleId] = {

        label:
          rule.label,

        min:
          normalizeProbability(
            rule.min
          ),

        max:
          normalizeProbability(
            rule.max
          ),

        today:
          randomBetween(
            rule.min,
            rule.max
          )

      };

    }
  );


  const todayData = {

    date:
      getTodayKey(),

    generatedAt:
      Date.now(),

    rulesUpdatedAt:
      rulesData.updatedAt || 0,

    personId:
      "luzhen",

    personName:
      "陆榛",

    values

  };


  localStorage.setItem(
    TODAY_ODDS_STORAGE_KEY,
    JSON.stringify(
      todayData
    )
  );


  return todayData;

}


/* =========================
   获得今天固定的概率
   ========================= */

function getTodayOdds() {

  const rulesData =
    loadRules();


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          TODAY_ODDS_STORAGE_KEY
        )
      );


    /*
      日期没变，
      设置也没变：

      就继续使用今天原来的概率。
    */

    if (
      saved &&
      saved.date ===
        getTodayKey() &&
      saved.rulesUpdatedAt ===
        (rulesData.updatedAt || 0)
    ) {

      return saved;

    }

  } catch (error) {

    console.warn(
      "读取今日概率失败",
      error
    );

  }


  return (
    generateTodayOdds(
      rulesData
    )
  );

}


/* =========================
   保存规则
   ========================= */

saveRulesButton.addEventListener(
  "click",
  function () {

    const rules = {};


    for (
      const ruleId
      of Object.keys(inputs)
    ) {

      const min =
        normalizeProbability(
          inputs[ruleId].min.value
        );

      const max =
        normalizeProbability(
          inputs[ruleId].max.value
        );


      if (min > max) {

        alert(
          `${defaultRules[ruleId].label}：最低概率不能高于最高概率。`
        );

        return;

      }


      rules[ruleId] = {

        label:
          defaultRules[ruleId].label,

        min,
        max

      };

    }


    const data = {

      updatedAt:
        Date.now(),

      personId:
        "luzhen",

      personName:
        "陆榛",

      rules

    };


    localStorage.setItem(
      RULES_STORAGE_KEY,
      JSON.stringify(data)
    );


    /*
      设置变了以后，
      今天的概率需要按新范围重新生成。
    */

    generateTodayOdds(data);


    renderRules();


    /*
      保存以后把所有今日概率重新隐藏。
    */

    revealButtons.forEach(
      function (button) {

        button.dataset.revealed =
          "false";

        button.textContent =
          "点击查看";

      }
    );


    saveMessage.textContent =
      "已保存，并重新生成今日概率。";


    setTimeout(
      function () {

        saveMessage.textContent =
          "";

      },
      2500
    );

  }
);


/* =========================
   查看 / 隐藏 今日概率
   ========================= */

revealButtons.forEach(
  function (button) {

    button.dataset.revealed =
      "false";


    button.addEventListener(
      "click",
      function () {

        const ruleId =
          button.dataset.revealRule;


        const isRevealed =
          button.dataset.revealed ===
          "true";


        if (isRevealed) {

          button.dataset.revealed =
            "false";

          button.textContent =
            "点击查看";

          return;

        }


        const todayData =
          getTodayOdds();


        const rule =
          todayData.values[
            ruleId
          ];


        if (!rule) {

          button.textContent =
            "暂无数据";

          return;

        }


        button.dataset.revealed =
          "true";


        button.textContent =
          `${rule.today.toFixed(1)}%`;

      }
    );

  }
);


/* =========================
   初始化
   ========================= */

renderRules();

/*
  即使用户没有点“查看”，
  今天的概率也已经在这里生成好了。
*/

getTodayOdds();