/* =========================================
   Liminal Chat Interaction Frequency

   与 World Rules 共用：
   liminal_world_rules_v2
   ========================================= */


const RULES_STORAGE_KEY =
  "liminal_world_rules_v2";


const TODAY_ODDS_STORAGE_KEY =
  "liminal_today_odds_v2";


/* =========================================
   人物
   ========================================= */

const CHAT_PEOPLE = {

  luzhen: {
    id: "luzhen",
    name: "陆榛",
    displayName: "榛榛",
    avatar: "L"
  },

  jasper: {
    id: "jasper",
    name: "Jasper",
    displayName: "Jasper",
    avatar: "J"
  }

};


const params =
  new URLSearchParams(
    window.location.search
  );


const requestedPersonId =
  params.get("person");


const currentPerson =
  CHAT_PEOPLE[
    requestedPersonId
  ] ||
  CHAT_PEOPLE.luzhen;


/* =========================================
   频率规则定义
   ========================================= */

const FREQUENCY_RULES =
  window
    .LiminalWorldRulesDefaults
    .rules;


/* =========================================
   页面元素
   ========================================= */

const messageFrequencyList =
  document.getElementById(
    "messageFrequencyList"
  );


const callFrequencyList =
  document.getElementById(
    "callFrequencyList"
  );


const moneyFrequencyList =
  document.getElementById(
    "moneyFrequencyList"
  );


const saveFrequencyButton =
  document.getElementById(
    "saveFrequencyButton"
  );


const frequencySaveMessage =
  document.getElementById(
    "frequencySaveMessage"
  );


/* =========================================
   页面人物
   ========================================= */

document.getElementById(
  "frequencyPersonName"
).textContent =
  currentPerson.displayName;


document.getElementById(
  "frequencyAvatar"
).textContent =
  currentPerson.avatar;


document.title =
  `${currentPerson.displayName} · 互动频率 · Liminal`;


/* 返回 */

document.getElementById(
  "frequencyBack"
).addEventListener(
  "click",
  function () {

    window.location.href =
      `chat-settings.html?person=${encodeURIComponent(
        currentPerson.id
      )}`;

  }
);


/* =========================================
   工具
   ========================================= */

function normalizeProbability(
  value
) {

  let number =
    Number(
      value
    );


  if (
    !Number.isFinite(
      number
    )
  ) {

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

/* 整数范围 */

function normalizeInteger(
  value,
  minimum = 0
) {

  let number =
    Number(
      value
    );


  if (
    !Number.isFinite(
      number
    )
  ) {

    number =
      minimum;

  }


  return Math.max(
    minimum,
    Math.round(
      number
    )
  );

}

/* =========================================
   读取 World Rules
   ========================================= */

function loadWorldRules() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          RULES_STORAGE_KEY
        )
      );


    if (
      saved &&
      saved.version === 2 &&
      saved.people
    ) {

      return saved;

    }

  } catch (error) {

    console.warn(
      "读取世界规则失败",
      error
    );

  }


  /*
    极端情况下本地还没有 v2，
    先建立最小结构。
  */

  return {

    version: 2,

    updatedAt:
      Date.now(),

    people: {}

  };

}


/* =========================================
   确保 v2 人物和频率规则存在

   只补缺失内容，
   不覆盖现有 Rules 数值。
   ========================================= */

function ensureFrequencyRules(
  worldData
) {

  const result =
    window
      .LiminalWorldRulesDefaults
      .ensureWorldRules(
        worldData
      );


  /*
    这里只做增量补全，不改变规则更新时间，
    也不删除或强制重建已有的今日概率。
  */

  if (
    result.changed
  ) {

    localStorage.setItem(
      RULES_STORAGE_KEY,
      JSON.stringify(
        result.worldData
      )
    );

  }


  return result.worldData;

}

/* =========================================
   今日固定概率
   与 World Rules 共用同一份数据
   ========================================= */

function getTodayKey() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}-${month}-${day}`
  );

}


/* 范围内随机到 0.1% */

function randomProbabilityBetween(
  min,
  max
) {

  min =
    normalizeProbability(
      min
    );


  max =
    normalizeProbability(
      max
    );


  const value =
    min +
    Math.random() *
    (
      max - min
    );


  return (
    Math.round(
      value * 10
    ) / 10
  );

}


/* 为一个人物生成今天所有概率 */

function generatePersonTodayOdds(
  worldData,
  personId
) {

  const person =
    worldData
      ?.people
      ?.[personId];


  if (!person) {

    return null;

  }


  const personOdds = {

    id:
      person.id,

    name:
      person.name,

    domains: {}

  };


  Object.entries(
    person.domains || {}
  ).forEach(
    function (
      [domainId, domain]
    ) {

      personOdds.domains[
        domainId
      ] = {

        id:
          domain.id,

        label:
          domain.label,

        rules: {}

      };


      Object.entries(
        domain.rules || {}
      ).forEach(
        function (
          [ruleId, rule]
        ) {

          if (
            rule.type !==
            "probability"
          ) {

            return;

          }


          personOdds
            .domains[
              domainId
            ]
            .rules[
              ruleId
            ] = {

              id:
                rule.id,

              label:
                rule.label,

              type:
                rule.type,

              min:
                normalizeProbability(
                  rule.min
                ),

              max:
                normalizeProbability(
                  rule.max
                ),

              today:
                randomProbabilityBetween(
                  rule.min,
                  rule.max
                )

            };

        }
      );

    }
  );


  return personOdds;

}


/* 为整个世界生成今天的数据 */

function generateTodayOdds(
  worldData
) {

  const people = {};


  Object.keys(
    worldData.people || {}
  ).forEach(
    function (personId) {

      people[
        personId
      ] =
        generatePersonTodayOdds(
          worldData,
          personId
        );

    }
  );


  const todayData = {

    version: 2,

    date:
      getTodayKey(),

    generatedAt:
      Date.now(),

    rulesUpdatedAt:
      worldData.updatedAt || 0,

    people:
      people

  };


  localStorage.setItem(
    TODAY_ODDS_STORAGE_KEY,
    JSON.stringify(
      todayData
    )
  );


  return todayData;

}


/* 读取今天固定的概率 */

function getTodayOdds() {

  const worldData =
    ensureFrequencyRules(
      loadWorldRules()
    );


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          TODAY_ODDS_STORAGE_KEY
        )
      );


    if (
      saved &&
      saved.version === 2 &&
      saved.date ===
        getTodayKey() &&
      saved.rulesUpdatedAt ===
        (
          worldData.updatedAt ||
          0
        )
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
      worldData
    )
  );

}


/* 找某一条今日概率 */

function getTodayRule(
  todayData,
  definition
) {

  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.[definition.domainId]
      ?.rules
      ?.[definition.ruleId]
  );

}

/* =========================================
   找规则
   ========================================= */

function getRule(
  worldData,
  definition
) {

  return (
    worldData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.[definition.domainId]
      ?.rules
      ?.[definition.ruleId]
  );

}


/* =========================================
   创建一行
   ========================================= */

function createFrequencyRow(
  definition,
  worldData
) {

  const rule =
    getRule(
      worldData,
      definition
    );


  const probabilityDefaults =
    definition.defaults[
      currentPerson.id
    ] || [0, 0];


  const parameterDefaults =
    definition.parameters || {};


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "frequency-row";


  row.dataset.ruleKey =
    `${definition.domainId}.${definition.ruleId}`;


  row.innerHTML = `

    <div class="frequency-rule-head">

      <div class="frequency-rule-name">

        <strong>
        </strong>

        <span>
        </span>

      </div>

    </div>


    <div class="frequency-range">

      <label class="frequency-field">

        <span>
          最低
        </span>

        <div class="frequency-input-wrap">

          <input
            class="frequency-min"
            type="number"
            min="0"
            max="100"
            step="0.1"
          >

          <em>
            %
          </em>

        </div>

      </label>


      <span class="frequency-line">
        —
      </span>


      <label class="frequency-field">

        <span>
          最高
        </span>

        <div class="frequency-input-wrap">

          <input
            class="frequency-max"
            type="number"
            min="0"
            max="100"
            step="0.1"
          >

          <em>
            %
          </em>

        </div>

      </label>

    </div>

    <div class="frequency-today">

  <span>
    今日概率
  </span>

  <button
    class="frequency-today-button"
    type="button"
    data-today-rule="${definition.domainId}.${definition.ruleId}"
  >
    点击查看
  </button>

</div>

  `;


  row
    .querySelector(
      ".frequency-rule-name strong"
    )
    .textContent =
      definition.label;


  row
    .querySelector(
      ".frequency-rule-name span"
    )
    .textContent =
      definition.description;


  row
    .querySelector(
      ".frequency-min"
    )
    .value =
      normalizeProbability(
        rule?.min ??
          probabilityDefaults[0]
      ).toFixed(1);


  row
    .querySelector(
      ".frequency-max"
    )
    .value =
      normalizeProbability(
        rule?.max ??
          probabilityDefaults[1]
      ).toFixed(1);

/* =========================
   回复专属：
   回复时间 + 回复条数
   ========================= */

if (
  definition.ruleId ===
    "reply"
) {

  const extra =
    document.createElement(
      "div"
    );


  extra.className =
    "frequency-extra";


  extra.innerHTML = `

    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        回复时间
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="reply-delay-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="reply-delay-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>

      </div>

    </div>


       <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        回复条数
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="reply-count-min"
              type="number"
              min="1"
              step="1"
            >

            <em>
              条
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="reply-count-max"
              type="number"
              min="1"
              step="1"
            >

            <em>
              条
            </em>

          </div>

        </label>

      </div>

    </div>


    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        消息间隔
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="reply-interval-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="reply-interval-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>

      </div>

    </div>

  `;


  extra
    .querySelector(
      ".reply-delay-min"
    )
    .value =
      rule.delaySeconds?.min ??
      parameterDefaults
        .delaySeconds
        .min;


  extra
    .querySelector(
      ".reply-delay-max"
    )
    .value =
      rule.delaySeconds?.max ??
      parameterDefaults
        .delaySeconds
        .max;


  extra
    .querySelector(
      ".reply-count-min"
    )
    .value =
      rule.messageCount?.min ??
      parameterDefaults
        .messageCount
        .min;


  extra
    .querySelector(
      ".reply-count-max"
    )
    .value =
      rule.messageCount?.max ??
      parameterDefaults
        .messageCount
        .max;


  extra
    .querySelector(
      ".reply-interval-min"
    )
    .value =
      rule.messageIntervalSeconds?.min ??
      parameterDefaults
        .messageIntervalSeconds
        .min;


  extra
    .querySelector(
      ".reply-interval-max"
    )
    .value =
      rule.messageIntervalSeconds?.max ??
      parameterDefaults
        .messageIntervalSeconds
        .max;


  /*
    放在“今日概率”上面。
  */

  const todayRow =
    row.querySelector(
      ".frequency-today"
    );


  if (todayRow) {

    row.insertBefore(
      extra,
      todayRow
    );

  } else {

    row.appendChild(
      extra
    );

  }

}

/* =========================
   主动发消息专属：
   主动等待时间 + 消息条数 + 消息间隔
   ========================= */

if (
  definition.ruleId ===
    "message"
) {

  const extra =
    document.createElement(
      "div"
    );


  extra.className =
    "frequency-extra";


  extra.innerHTML = `

    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        主动等待时间
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="message-wait-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              分钟
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="message-wait-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              分钟
            </em>

          </div>

        </label>

      </div>

    </div>


    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        消息条数
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="message-count-min"
              type="number"
              min="1"
              step="1"
            >

            <em>
              条
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="message-count-max"
              type="number"
              min="1"
              step="1"
            >

            <em>
              条
            </em>

          </div>

        </label>

      </div>

    </div>


    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        消息间隔
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="message-interval-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="message-interval-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>

      </div>

    </div>

  `;


  extra
    .querySelector(
      ".message-wait-min"
    )
    .value =
      rule.waitMinutes?.min ??
      parameterDefaults
        .waitMinutes
        .min;


  extra
    .querySelector(
      ".message-wait-max"
    )
    .value =
      rule.waitMinutes?.max ??
      parameterDefaults
        .waitMinutes
        .max;


  extra
    .querySelector(
      ".message-count-min"
    )
    .value =
      rule.messageCount?.min ??
      parameterDefaults
        .messageCount
        .min;


  extra
    .querySelector(
      ".message-count-max"
    )
    .value =
      rule.messageCount?.max ??
      parameterDefaults
        .messageCount
        .max;


  extra
    .querySelector(
      ".message-interval-min"
    )
    .value =
      rule.messageIntervalSeconds?.min ??
      parameterDefaults
        .messageIntervalSeconds
        .min;


  extra
    .querySelector(
      ".message-interval-max"
    )
    .value =
      rule.messageIntervalSeconds?.max ??
      parameterDefaults
        .messageIntervalSeconds
        .max;


  /*
    放在“今日概率”上面。
  */

  const todayRow =
    row.querySelector(
      ".frequency-today"
    );


  if (todayRow) {

    row.insertBefore(
      extra,
      todayRow
    );

  } else {

    row.appendChild(
      extra
    );

  }

}

/* =========================
   继续说专属：
   消息条数 + 消息间隔
   ========================= */

if (
  definition.ruleId ===
    "continue"
) {

  const extra =
    document.createElement(
      "div"
    );


  extra.className =
    "frequency-extra";


  extra.innerHTML = `

    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        消息条数
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="continue-count-min"
              type="number"
              min="1"
              step="1"
            >

            <em>
              条
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="continue-count-max"
              type="number"
              min="1"
              step="1"
            >

            <em>
              条
            </em>

          </div>

        </label>

      </div>

    </div>


    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        消息间隔
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="continue-interval-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="continue-interval-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>

      </div>

    </div>

  `;


  extra
    .querySelector(
      ".continue-count-min"
    )
    .value =
      rule.messageCount?.min ??
      parameterDefaults
        .messageCount
        .min;


  extra
    .querySelector(
      ".continue-count-max"
    )
    .value =
      rule.messageCount?.max ??
      parameterDefaults
        .messageCount
        .max;


  extra
    .querySelector(
      ".continue-interval-min"
    )
    .value =
      rule.messageIntervalSeconds?.min ??
      parameterDefaults
        .messageIntervalSeconds
        .min;


  extra
    .querySelector(
      ".continue-interval-max"
    )
    .value =
      rule.messageIntervalSeconds?.max ??
      parameterDefaults
        .messageIntervalSeconds
        .max;


  /*
    放在“今日概率”上面。
  */

  const todayRow =
    row.querySelector(
      ".frequency-today"
    );


  if (todayRow) {

    row.insertBefore(
      extra,
      todayRow
    );

  } else {

    row.appendChild(
      extra
    );

  }

}

/* =========================
   拍一拍专属：
   轮次间隔
   ========================= */

if (
  definition.ruleId ===
    "poke"
) {

  const extra =
    document.createElement(
      "div"
    );


  extra.className =
    "frequency-extra";


  extra.innerHTML = `

    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        轮次间隔
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="poke-round-gap-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              轮
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="poke-round-gap-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              轮
            </em>

          </div>

        </label>

      </div>

    </div>

  `;


  extra
    .querySelector(
      ".poke-round-gap-min"
    )
    .value =
      rule.roundGap?.min ??
      parameterDefaults
        .roundGap
        .min;


  extra
    .querySelector(
      ".poke-round-gap-max"
    )
    .value =
      rule.roundGap?.max ??
      parameterDefaults
        .roundGap
        .max;


  /*
    放在“今日概率”上面。
  */

  const todayRow =
    row.querySelector(
      ".frequency-today"
    );


  if (todayRow) {

    row.insertBefore(
      extra,
      todayRow
    );

  } else {

    row.appendChild(
      extra
    );

  }

}

/* =========================
   撤回消息专属：
   撤回时间
   ========================= */

if (
  definition.ruleId ===
    "recall"
) {

  const extra =
    document.createElement(
      "div"
    );


  extra.className =
    "frequency-extra";


  extra.innerHTML = `

    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        撤回时间
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="recall-delay-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="recall-delay-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>

      </div>

    </div>

  `;


  extra
    .querySelector(
      ".recall-delay-min"
    )
    .value =
      rule.delaySeconds?.min ??
      parameterDefaults
        .delaySeconds
        .min;


  extra
    .querySelector(
      ".recall-delay-max"
    )
    .value =
      rule.delaySeconds?.max ??
      parameterDefaults
        .delaySeconds
        .max;


  /*
    放在“今日概率”上面。
  */

  const todayRow =
    row.querySelector(
      ".frequency-today"
    );


  if (todayRow) {

    row.insertBefore(
      extra,
      todayRow
    );

  } else {

    row.appendChild(
      extra
    );

  }

}

/* =========================
   主动拨打专属：
   拨打等待时间
   ========================= */

if (
  definition.ruleId ===
    "call"
) {

  const extra =
    document.createElement(
      "div"
    );


  extra.className =
    "frequency-extra";


  extra.innerHTML = `

    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        拨打等待时间
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="call-wait-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              小时
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="call-wait-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              小时
            </em>

          </div>

        </label>

      </div>

    </div>

  `;


  extra
    .querySelector(
      ".call-wait-min"
    )
    .value =
      rule.waitHours?.min ??
      parameterDefaults
        .waitHours
        .min;


  extra
    .querySelector(
      ".call-wait-max"
    )
    .value =
      rule.waitHours?.max ??
      parameterDefaults
        .waitHours
        .max;


  /*
    放在“今日概率”上面。
  */

  const todayRow =
    row.querySelector(
      ".frequency-today"
    );


  if (todayRow) {

    row.insertBefore(
      extra,
      todayRow
    );

  } else {

    row.appendChild(
      extra
    );

  }

}

/* =========================
   接听专属：
   接听时间
   ========================= */

if (
  definition.ruleId ===
    "answerCall"
) {

  const extra =
    document.createElement(
      "div"
    );


  extra.className =
    "frequency-extra";


  extra.innerHTML = `

    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        接听时间
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="answer-call-delay-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="answer-call-delay-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              秒
            </em>

          </div>

        </label>

      </div>

    </div>

  `;


  extra
    .querySelector(
      ".answer-call-delay-min"
    )
    .value =
      rule.delaySeconds?.min ??
      parameterDefaults
        .delaySeconds
        .min;


  extra
    .querySelector(
      ".answer-call-delay-max"
    )
    .value =
      rule.delaySeconds?.max ??
      parameterDefaults
        .delaySeconds
        .max;


  /*
    放在“今日概率”上面。
  */

  const todayRow =
    row.querySelector(
      ".frequency-today"
    );


  if (todayRow) {

    row.insertBefore(
      extra,
      todayRow
    );

  } else {

    row.appendChild(
      extra
    );

  }

}

/* =========================
   金钱与礼物专属：
   等待时间（天）
   ========================= */

if (
  parameterDefaults.waitDays
) {

  const defaults =
    parameterDefaults.waitDays;


  const extra =
    document.createElement(
      "div"
    );


  extra.className =
    "frequency-extra";


  extra.innerHTML = `

    <div class="frequency-extra-block">

      <span class="frequency-extra-title">
        等待时间
      </span>


      <div class="frequency-extra-range">

        <label class="frequency-field">

          <span>
            最低
          </span>

          <div class="frequency-input-wrap">

            <input
              class="wait-days-min"
              type="number"
              min="0"
              step="1"
            >

            <em>
              天
            </em>

          </div>

        </label>


        <span class="frequency-extra-line">
          —
        </span>


        <label class="frequency-field">

          <span>
            最高
          </span>

          <div class="frequency-input-wrap">

            <input
              class="wait-days-max"
              type="number"
              min="0"
              step="1"
            >

            <em>
              天
            </em>

          </div>

        </label>

      </div>

    </div>

  `;


  extra
    .querySelector(
      ".wait-days-min"
    )
    .value =
      rule.waitDays?.min ??
      defaults.min;


  extra
    .querySelector(
      ".wait-days-max"
    )
    .value =
      rule.waitDays?.max ??
      defaults.max;


  /*
    放在“今日概率”上面。
  */

  const todayRow =
    row.querySelector(
      ".frequency-today"
    );


  if (todayRow) {

    row.insertBefore(
      extra,
      todayRow
    );

  } else {

    row.appendChild(
      extra
    );

  }

}

  return row;

}


/* =========================================
   渲染
   ========================================= */

function renderFrequencyRules() {

  let worldData =
    loadWorldRules();


  worldData =
    ensureFrequencyRules(
      worldData
    );


  messageFrequencyList.innerHTML =
    "";

  callFrequencyList.innerHTML =
    "";

  moneyFrequencyList.innerHTML =
    "";


  FREQUENCY_RULES.forEach(
    function (definition) {

      const row =
        createFrequencyRow(
          definition,
          worldData
        );


      if (
        definition.group ===
          "message"
      ) {

        messageFrequencyList
          .appendChild(
            row
          );

      }


      if (
        definition.group ===
          "call"
      ) {

        callFrequencyList
          .appendChild(
            row
          );

      }


      if (
        definition.group ===
          "money"
      ) {

        moneyFrequencyList
          .appendChild(
            row
          );

      }

    }
  );

}


/* =========================================
   保存
   ========================================= */

saveFrequencyButton.addEventListener(
  "click",
  function () {

    const worldData =
      ensureFrequencyRules(
        loadWorldRules()
      );


    for (
      const definition
      of FREQUENCY_RULES
    ) {

      const key =
        `${definition.domainId}.${definition.ruleId}`;


      const row =
        document.querySelector(
          `[data-rule-key="${key}"]`
        );


      if (!row) {

        continue;

      }


      const min =
        normalizeProbability(
          row.querySelector(
            ".frequency-min"
          ).value
        );


      const max =
        normalizeProbability(
          row.querySelector(
            ".frequency-max"
          ).value
        );


      if (
        min > max
      ) {

        window.alert(
          `${definition.label}：最低概率不能高于最高概率。`
        );


        return;

      }


      const rule =
        getRule(
          worldData,
          definition
        );


      rule.min =
        min;


      rule.max =
        max;

        /* 回复专属参数 */

if (
  definition.ruleId ===
    "reply"
) {

  const delayMin =
    normalizeInteger(
      row.querySelector(
        ".reply-delay-min"
      ).value,
      0
    );


  const delayMax =
    normalizeInteger(
      row.querySelector(
        ".reply-delay-max"
      ).value,
      0
    );


  const countMin =
    normalizeInteger(
      row.querySelector(
        ".reply-count-min"
      ).value,
      1
    );


  const countMax =
    normalizeInteger(
      row.querySelector(
        ".reply-count-max"
      ).value,
      1
    );


  const intervalMin =
    normalizeInteger(
      row.querySelector(
        ".reply-interval-min"
      ).value,
      0
    );


  const intervalMax =
    normalizeInteger(
      row.querySelector(
        ".reply-interval-max"
      ).value,
      0
    );


  if (
    delayMin > delayMax
  ) {

    window.alert(
      "回复时间：最低不能高于最高。"
    );

    return;

  }


  if (
    countMin > countMax
  ) {

    window.alert(
      "回复条数：最低不能高于最高。"
    );

    return;

  }


  if (
    intervalMin > intervalMax
  ) {

    window.alert(
      "消息间隔：最低不能高于最高。"
    );

    return;

  }


  rule.delaySeconds = {

    min:
      delayMin,

    max:
      delayMax

  };


  rule.messageCount = {

    min:
      countMin,

    max:
      countMax

  };


  rule.messageIntervalSeconds = {

    min:
      intervalMin,

    max:
      intervalMax

  };

}


/* 主动发消息专属参数 */

if (
  definition.ruleId ===
    "message"
) {

  const waitMin =
    normalizeInteger(
      row.querySelector(
        ".message-wait-min"
      ).value,
      0
    );


  const waitMax =
    normalizeInteger(
      row.querySelector(
        ".message-wait-max"
      ).value,
      0
    );


  const countMin =
    normalizeInteger(
      row.querySelector(
        ".message-count-min"
      ).value,
      1
    );


  const countMax =
    normalizeInteger(
      row.querySelector(
        ".message-count-max"
      ).value,
      1
    );


  const intervalMin =
    normalizeInteger(
      row.querySelector(
        ".message-interval-min"
      ).value,
      0
    );


  const intervalMax =
    normalizeInteger(
      row.querySelector(
        ".message-interval-max"
      ).value,
      0
    );


  if (
    waitMin > waitMax
  ) {

    window.alert(
      "主动等待时间：最低不能高于最高。"
    );

    return;

  }


  if (
    countMin > countMax
  ) {

    window.alert(
      "主动发消息条数：最低不能高于最高。"
    );

    return;

  }


  if (
    intervalMin > intervalMax
  ) {

    window.alert(
      "主动发消息间隔：最低不能高于最高。"
    );

    return;

  }


  rule.waitMinutes = {

    min:
      waitMin,

    max:
      waitMax

  };


  rule.messageCount = {

    min:
      countMin,

    max:
      countMax

  };


  rule.messageIntervalSeconds = {

    min:
      intervalMin,

    max:
      intervalMax

  };

}


/* 继续说专属参数 */

if (
  definition.ruleId ===
    "continue"
) {

  const countMin =
    normalizeInteger(
      row.querySelector(
        ".continue-count-min"
      ).value,
      1
    );


  const countMax =
    normalizeInteger(
      row.querySelector(
        ".continue-count-max"
      ).value,
      1
    );


  const intervalMin =
    normalizeInteger(
      row.querySelector(
        ".continue-interval-min"
      ).value,
      0
    );


  const intervalMax =
    normalizeInteger(
      row.querySelector(
        ".continue-interval-max"
      ).value,
      0
    );


  if (
    countMin > countMax
  ) {

    window.alert(
      "继续说消息条数：最低不能高于最高。"
    );

    return;

  }


  if (
    intervalMin > intervalMax
  ) {

    window.alert(
      "继续说消息间隔：最低不能高于最高。"
    );

    return;

  }


  rule.messageCount = {

    min:
      countMin,

    max:
      countMax

  };


  rule.messageIntervalSeconds = {

    min:
      intervalMin,

    max:
      intervalMax

  };

}

/* 拍一拍专属参数 */

if (
  definition.ruleId ===
    "poke"
) {

  const roundGapMin =
    normalizeInteger(
      row.querySelector(
        ".poke-round-gap-min"
      ).value,
      0
    );


  const roundGapMax =
    normalizeInteger(
      row.querySelector(
        ".poke-round-gap-max"
      ).value,
      0
    );


  if (
    roundGapMin > roundGapMax
  ) {

    window.alert(
      "拍一拍轮次间隔：最低不能高于最高。"
    );

    return;

  }


  rule.roundGap = {

    min:
      roundGapMin,

    max:
      roundGapMax

  };

}

/* 撤回消息专属参数 */

if (
  definition.ruleId ===
    "recall"
) {

  const delayMin =
    normalizeInteger(
      row.querySelector(
        ".recall-delay-min"
      ).value,
      0
    );


  const delayMax =
    normalizeInteger(
      row.querySelector(
        ".recall-delay-max"
      ).value,
      0
    );


  if (
    delayMin > delayMax
  ) {

    window.alert(
      "撤回时间：最低不能高于最高。"
    );

    return;

  }


  rule.delaySeconds = {

    min:
      delayMin,

    max:
      delayMax

  };

}

/* 主动拨打专属参数 */

if (
  definition.ruleId ===
    "call"
) {

  const waitMin =
    normalizeInteger(
      row.querySelector(
        ".call-wait-min"
      ).value,
      0
    );


  const waitMax =
    normalizeInteger(
      row.querySelector(
        ".call-wait-max"
      ).value,
      0
    );


  if (
    waitMin > waitMax
  ) {

    window.alert(
      "拨打等待时间：最低不能高于最高。"
    );

    return;

  }


  rule.waitHours = {

    min:
      waitMin,

    max:
      waitMax

  };

}

/* 接听专属参数 */

if (
  definition.ruleId ===
    "answerCall"
) {

  const delayMin =
    normalizeInteger(
      row.querySelector(
        ".answer-call-delay-min"
      ).value,
      0
    );


  const delayMax =
    normalizeInteger(
      row.querySelector(
        ".answer-call-delay-max"
      ).value,
      0
    );


  if (
    delayMin > delayMax
  ) {

    window.alert(
      "接听时间：最低不能高于最高。"
    );

    return;

  }


  rule.delaySeconds = {

    min:
      delayMin,

    max:
      delayMax

  };

}

/* 金钱与礼物专属参数 */

if (
  [
    "redPacket",
    "transfer",
    "gift"
  ].includes(
    definition.ruleId
  )
) {

  const waitDaysMin =
    normalizeInteger(
      row.querySelector(
        ".wait-days-min"
      ).value,
      0
    );


  const waitDaysMax =
    normalizeInteger(
      row.querySelector(
        ".wait-days-max"
      ).value,
      0
    );


  if (
    waitDaysMin > waitDaysMax
  ) {

    window.alert(
      `${definition.label}等待时间：最低不能高于最高。`
    );

    return;

  }


  rule.waitDays = {

    min:
      waitDaysMin,

    max:
      waitDaysMax

  };

}

    }


    worldData.updatedAt =
      Date.now();


    localStorage.setItem(
      RULES_STORAGE_KEY,
      JSON.stringify(
        worldData
      )
    );


    /*
      范围变了，
      让今日概率下次重新生成。
    */

    localStorage.removeItem(
      TODAY_ODDS_STORAGE_KEY
    );


    renderFrequencyRules();


    frequencySaveMessage.textContent =
      `${currentPerson.displayName}的互动频率已保存。`;


    setTimeout(
      function () {

        frequencySaveMessage.textContent =
          "";

      },
      2200
    );

  }
);


/* =========================================
   查看 / 隐藏 今日概率
   ========================================= */

document.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        ".frequency-today-button"
      );


    if (!button) {

      return;

    }


    const key =
      button.dataset.todayRule;


    const definition =
      FREQUENCY_RULES.find(
        function (item) {

          return (
            `${item.domainId}.${item.ruleId}` ===
            key
          );

        }
      );


    if (!definition) {

      return;

    }


    const revealed =
      button.dataset.revealed ===
      "true";


    /*
      已经显示：
      再点一次只是隐藏，
      不重新随机。
    */

    if (revealed) {

      button.dataset.revealed =
        "false";

      button.classList.remove(
        "revealed"
      );

      button.textContent =
        "点击查看";


      return;

    }


    const todayData =
      getTodayOdds();


    const todayRule =
      getTodayRule(
        todayData,
        definition
      );


    if (!todayRule) {

      button.textContent =
        "尚未配置";

      return;

    }


    button.dataset.revealed =
      "true";


    button.classList.add(
      "revealed"
    );


    button.textContent =
      `${todayRule.today.toFixed(1)}%`;

  }
);


/* =========================================
   初始化
   ========================================= */

renderFrequencyRules();
