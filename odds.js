const RULES_STORAGE_KEY =
  "liminal_world_rules_v1";

const ODDS_STORAGE_KEY =
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


const oddsList =
  document.getElementById(
    "oddsList"
  );

const todayDate =
  document.getElementById(
    "todayDate"
  );


/* =========================
   今天日期
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


function getTodayDisplay() {

  const now =
    new Date();


  return (
    `${now.getMonth() + 1}月` +
    `${now.getDate()}日`
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
      defaultRules

  };

}


/* =========================
   范围随机
   ========================= */

function randomBetween(
  min,
  max
) {

  const value =
    min +
    Math.random() *
    (max - min);


  return (
    Math.round(value * 10) / 10
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
          Number(rule.min),

        max:
          Number(rule.max),

        today:
          randomBetween(
            Number(rule.min),
            Number(rule.max)
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
    ODDS_STORAGE_KEY,
    JSON.stringify(
      todayData
    )
  );


  return todayData;

}


/* =========================
   获取今天的数据
   ========================= */

function getTodayOdds() {

  const rules =
    loadRules();


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          ODDS_STORAGE_KEY
        )
      );


    /*
      同一天
      并且长期规则没有变化，
      就继续使用今天原来的数值。
    */

    if (
      saved &&
      saved.date ===
        getTodayKey() &&
      saved.rulesUpdatedAt ===
        (rules.updatedAt || 0)
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
      rules
    )
  );

}


/* =========================
   显示
   ========================= */

function renderTodayOdds() {

  const today =
    getTodayOdds();


  todayDate.textContent =
    getTodayDisplay();


  oddsList.innerHTML =
    "";


  Object.values(
    today.values
  ).forEach(
    function (item) {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "odds-row";


      card.innerHTML = `

        <div class="odds-name">

          <span>
            ${item.min.toFixed(1)}%
            —
            ${item.max.toFixed(1)}%
          </span>

          <strong>
            ${item.label}
          </strong>

        </div>


        <div class="odds-value">

          <strong>
            ${item.today.toFixed(1)}
          </strong>

          <span>%</span>

        </div>

      `;


      oddsList.appendChild(
        card
      );

    }
  );

}


renderTodayOdds();