/* =========================================================
   Liminal World Rules

   数据结构：
   人物 → 领域 / App → 规则

   当前支持：
   - 陆榛
   - Jasper

   每个人的规则完全独立保存。
   ========================================================= */


/* =========================
   Storage Keys
   ========================= */

const OLD_RULES_STORAGE_KEY =
  "liminal_world_rules_v1";

const RULES_STORAGE_KEY =
  "liminal_world_rules_v2";

const TODAY_ODDS_STORAGE_KEY =
  "liminal_today_odds_v2";

const SELECTED_PERSON_STORAGE_KEY =
  "liminal_rules_selected_person_v1";


/* =========================
   默认世界规则
   ========================= */

const defaultWorldRules = {

  version: 2,

  updatedAt: 0,

  people: {


    /* =========================
       陆榛
       ========================= */

    luzhen: {

      id: "luzhen",

      name: "陆榛",

      domains: {


        /* Mall */

        mall: {

          id: "mall",

          label: "Mall",

          rules: {

            gift: {

              id: "gift",

              label: "主动送礼",

              type: "probability",

              min: 10.0,

              max: 30.0

            }

          }

        },


        /* Chat */

        chat: {

          id: "chat",

          label: "Chat",

          rules: {

            message: {

              id: "message",

              label: "主动发消息",

              type: "probability",

              min: 30.0,

              max: 60.0

            },


            call: {

              id: "call",

              label: "主动打电话",

              type: "probability",

              min: 5.0,

              max: 15.0

            }

          }

        }

      }

    },


    /* =========================
       Jasper
       测试默认值，之后可以修改
       ========================= */

    jasper: {

      id: "jasper",

      name: "Jasper",

      domains: {


        /* Mall */

        mall: {

          id: "mall",

          label: "Mall",

          rules: {

            gift: {

              id: "gift",

              label: "主动送礼",

              type: "probability",

              min: 8.0,

              max: 20.0

            }

          }

        },


        /* Chat */

        chat: {

          id: "chat",

          label: "Chat",

          rules: {

            message: {

              id: "message",

              label: "主动发消息",

              type: "probability",

              min: 20.0,

              max: 50.0

            },


            call: {

              id: "call",

              label: "主动打电话",

              type: "probability",

              min: 3.0,

              max: 12.0

            }

          }

        }

      }

    }

  }

};


/* =========================
   页面元素
   ========================= */

const personSelect =
  document.getElementById(
    "personSelect"
  );


const personRuleDescription =
  document.getElementById(
    "personRuleDescription"
  );


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
   页面规则绑定

   不写死人物。
   当前人物由 currentPersonId 决定。
   ========================= */

const ruleBindings = {

  gift: {

    domainId:
      "mall",

    ruleId:
      "gift",

    minInput:
      document.getElementById(
        "giftMin"
      ),

    maxInput:
      document.getElementById(
        "giftMax"
      )

  },


  message: {

    domainId:
      "chat",

    ruleId:
      "message",

    minInput:
      document.getElementById(
        "messageMin"
      ),

    maxInput:
      document.getElementById(
        "messageMax"
      )

  },


  call: {

    domainId:
      "chat",

    ruleId:
      "call",

    minInput:
      document.getElementById(
        "callMin"
      ),

    maxInput:
      document.getElementById(
        "callMax"
      )

  }

};


let currentPersonId =
  "luzhen";


/* =========================
   基础工具
   ========================= */

function deepClone(data) {

  return JSON.parse(
    JSON.stringify(data)
  );

}


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


/* =========================
   概率数字整理
   ========================= */

function normalizeProbability(
  value
) {

  let number =
    Number(value);


  if (
    !Number.isFinite(number)
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


/* =========================
   找到一条规则
   ========================= */

function getRule(
  worldData,
  personId,
  domainId,
  ruleId
) {

  return (
    worldData
      ?.people
      ?.[personId]
      ?.domains
      ?.[domainId]
      ?.rules
      ?.[ruleId]
  );

}


/* =========================
   给旧 v2 数据补上新人物 / 新规则

   非常重要：

   如果你浏览器已经保存过 v2，
   单纯修改 defaultWorldRules
   是不会自动出现 Jasper 的。

   所以这里会检查缺什么，
   只补缺失内容，
   不覆盖你已经改过的概率。
   ========================= */

function mergeMissingWorldDefaults(
  worldData
) {

  let changed =
    false;


  if (
    !worldData.people
  ) {

    worldData.people = {};

    changed =
      true;

  }


  Object.entries(
    defaultWorldRules.people
  ).forEach(
    function (
      [personId, defaultPerson]
    ) {


      /* 缺整个人物 */

      if (
        !worldData.people[
          personId
        ]
      ) {

        worldData.people[
          personId
        ] =
          deepClone(
            defaultPerson
          );


        changed =
          true;


        return;

      }


      const person =
        worldData.people[
          personId
        ];


      /*
        人物已经存在，
        继续检查领域。
      */

      if (
        !person.domains
      ) {

        person.domains = {};

        changed =
          true;

      }


      Object.entries(
        defaultPerson.domains
      ).forEach(
        function (
          [
            domainId,
            defaultDomain
          ]
        ) {


          /* 缺整个领域 */

          if (
            !person.domains[
              domainId
            ]
          ) {

            person.domains[
              domainId
            ] =
              deepClone(
                defaultDomain
              );


            changed =
              true;


            return;

          }


          const domain =
            person.domains[
              domainId
            ];


          if (
            !domain.rules
          ) {

            domain.rules = {};

            changed =
              true;

          }


          /*
            检查领域里的每一条规则。
          */

          Object.entries(
            defaultDomain.rules
          ).forEach(
            function (
              [
                ruleId,
                defaultRule
              ]
            ) {

              if (
                !domain.rules[
                  ruleId
                ]
              ) {

                domain.rules[
                  ruleId
                ] =
                  deepClone(
                    defaultRule
                  );


                changed =
                  true;

              }

            }
          );

        }
      );

    }
  );


  /*
    如果真的补过东西，
    更新时间也要变化。

    这样今日概率会重新生成，
    Jasper 才会得到今天的数据。
  */

  if (
    changed
  ) {

    worldData.updatedAt =
      Date.now();

  }


  return {
    worldData,
    changed
  };

}


/* =========================
   旧 v1 数据迁移
   ========================= */

function migrateOldRules() {

  let oldData = null;


  try {

    oldData =
      JSON.parse(
        localStorage.getItem(
          OLD_RULES_STORAGE_KEY
        )
      );

  } catch (error) {

    console.warn(
      "读取旧版世界规则失败",
      error
    );

  }


  const newData =
    deepClone(
      defaultWorldRules
    );


  /*
    没有旧 v1：
    直接使用新版默认数据。
  */

  if (
    !oldData ||
    !oldData.rules
  ) {

    newData.updatedAt =
      Date.now();


    localStorage.setItem(
      RULES_STORAGE_KEY,
      JSON.stringify(
        newData
      )
    );


    return newData;

  }


  /*
    只迁移原来属于陆榛的
    三条旧规则。

    Jasper 使用自己的默认值。
  */


  if (
    oldData.rules.gift
  ) {

    const target =
      getRule(
        newData,
        "luzhen",
        "mall",
        "gift"
      );


    target.min =
      normalizeProbability(
        oldData.rules.gift.min
      );


    target.max =
      normalizeProbability(
        oldData.rules.gift.max
      );

  }


  if (
    oldData.rules.message
  ) {

    const target =
      getRule(
        newData,
        "luzhen",
        "chat",
        "message"
      );


    target.min =
      normalizeProbability(
        oldData.rules.message.min
      );


    target.max =
      normalizeProbability(
        oldData.rules.message.max
      );

  }


  if (
    oldData.rules.call
  ) {

    const target =
      getRule(
        newData,
        "luzhen",
        "chat",
        "call"
      );


    target.min =
      normalizeProbability(
        oldData.rules.call.min
      );


    target.max =
      normalizeProbability(
        oldData.rules.call.max
      );

  }


  newData.updatedAt =
    Date.now();


  localStorage.setItem(
    RULES_STORAGE_KEY,
    JSON.stringify(
      newData
    )
  );


  return newData;

}


/* =========================
   读取世界规则
   ========================= */

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

      /*
        已经有 v2：

        检查有没有后来新增的人物 /
        领域 / 规则。

        缺什么补什么，
        已有数据绝不覆盖。
      */

      const merged =
        mergeMissingWorldDefaults(
          saved
        );


      if (
        merged.changed
      ) {

        localStorage.setItem(
          RULES_STORAGE_KEY,
          JSON.stringify(
            merged.worldData
          )
        );

      }


      return (
        merged.worldData
      );

    }

  } catch (error) {

    console.warn(
      "读取世界规则失败",
      error
    );

  }


  /*
    连 v2 都没有：
    才迁移旧版。
  */

  return migrateOldRules();

}


/* =========================
   保存世界规则
   ========================= */

function saveWorldRules(
  worldData
) {

  localStorage.setItem(
    RULES_STORAGE_KEY,
    JSON.stringify(
      worldData
    )
  );

}


/* =========================
   人物切换器
   ========================= */

function renderPersonSelect() {

  const worldData =
    loadWorldRules();


  const people =
    Object.values(
      worldData.people
    );


  personSelect.innerHTML =
    "";


  people.forEach(
    function (person) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        person.id;


      option.textContent =
        person.name;


      personSelect.appendChild(
        option
      );

    }
  );


  /*
    恢复上次停留的人物。
  */

  const savedPersonId =
    localStorage.getItem(
      SELECTED_PERSON_STORAGE_KEY
    );


  if (
    savedPersonId &&
    worldData.people[
      savedPersonId
    ]
  ) {

    currentPersonId =
      savedPersonId;

  } else if (
    people.length > 0
  ) {

    currentPersonId =
      people[0].id;

  }


  personSelect.value =
    currentPersonId;


  updatePersonDescription();

}


/* =========================
   人物说明文字
   ========================= */

function updatePersonDescription() {

  const worldData =
    loadWorldRules();


  const person =
    worldData.people[
      currentPersonId
    ];


  if (
    !person
  ) {

    return;

  }


  personRuleDescription.textContent =
    `设置${person.name}在副世界中的长期随机范围。每天都会从范围内生成固定的今日概率。`;

}


/* =========================
   显示当前人物规则
   ========================= */

function renderRules() {

  const worldData =
    loadWorldRules();


  Object.entries(
    ruleBindings
  ).forEach(
    function (
      [
        uiRuleId,
        binding
      ]
    ) {

      const rule =
        getRule(
          worldData,
          currentPersonId,
          binding.domainId,
          binding.ruleId
        );


      /*
        当前人物没有这条规则。
      */

      if (
        !rule
      ) {

        binding.minInput.value =
          "";


        binding.maxInput.value =
          "";


        binding.minInput.disabled =
          true;


        binding.maxInput.disabled =
          true;


        return;

      }


      binding.minInput.disabled =
        false;


      binding.maxInput.disabled =
        false;


      binding.minInput.value =
        normalizeProbability(
          rule.min
        ).toFixed(1);


      binding.maxInput.value =
        normalizeProbability(
          rule.max
        ).toFixed(1);

    }
  );


  hideTodayOdds();

}


/* =========================
   隐藏今日概率
   ========================= */

function hideTodayOdds() {

  revealButtons.forEach(
    function (button) {

      button.dataset.revealed =
        "false";


      button.textContent =
        "点击查看";

    }
  );

}


/* =========================
   切换人物
   ========================= */

personSelect.addEventListener(
  "change",
  function () {

    currentPersonId =
      personSelect.value;


    localStorage.setItem(
      SELECTED_PERSON_STORAGE_KEY,
      currentPersonId
    );


    updatePersonDescription();


    renderRules();

  }
);


/* =========================
   范围随机
   ========================= */

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


/* =========================
   生成人物今日概率
   ========================= */

function generatePersonTodayOdds(
  worldData,
  personId
) {

  const person =
    worldData
      ?.people
      ?.[personId];


  if (
    !person
  ) {

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
    person.domains
  ).forEach(
    function (
      [
        domainId,
        domain
      ]
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
        domain.rules
      ).forEach(
        function (
          [
            ruleId,
            rule
          ]
        ) {

          /*
            目前只处理 probability。

            以后金额、时间、次数等
            会有自己的随机方法。
          */

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


/* =========================
   生成整个世界今日概率
   ========================= */

function generateTodayOdds(
  worldData
) {

  const people = {};


  Object.keys(
    worldData.people
  ).forEach(
    function (
      personId
    ) {

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
      worldData.updatedAt ||
      0,

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


/* =========================
   获取今天固定概率
   ========================= */

function getTodayOdds() {

  const worldData =
    loadWorldRules();


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


/* =========================
   找今日规则
   ========================= */

function getTodayRule(
  todayData,
  personId,
  domainId,
  ruleId
) {

  return (
    todayData
      ?.people
      ?.[personId]
      ?.domains
      ?.[domainId]
      ?.rules
      ?.[ruleId]
  );

}


/* =========================
   保存按钮
   ========================= */

saveRulesButton.addEventListener(
  "click",
  function () {

    const worldData =
      loadWorldRules();


    for (
      const [
        uiRuleId,
        binding
      ]
      of Object.entries(
        ruleBindings
      )
    ) {

      const targetRule =
        getRule(
          worldData,
          currentPersonId,
          binding.domainId,
          binding.ruleId
        );


      if (
        !targetRule
      ) {

        continue;

      }


      const min =
        normalizeProbability(
          binding
            .minInput
            .value
        );


      const max =
        normalizeProbability(
          binding
            .maxInput
            .value
        );


      if (
        min > max
      ) {

        alert(
          `${targetRule.label}：最低概率不能高于最高概率。`
        );


        return;

      }


      targetRule.min =
        min;


      targetRule.max =
        max;

    }


    worldData.updatedAt =
      Date.now();


    saveWorldRules(
      worldData
    );


    /*
      当前测试阶段：
      修改长期范围后，
      今天重新生成。
    */

    generateTodayOdds(
      worldData
    );


    renderRules();


    saveMessage.textContent =
      `${worldData.people[currentPersonId].name}的世界规则已保存。`;


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

        const uiRuleId =
          button.dataset
            .revealRule;


        const binding =
          ruleBindings[
            uiRuleId
          ];


        if (
          !binding
        ) {

          button.textContent =
            "暂无规则";

          return;

        }


        const isRevealed =
          button.dataset.revealed ===
          "true";


        if (
          isRevealed
        ) {

          button.dataset.revealed =
            "false";


          button.textContent =
            "点击查看";


          return;

        }


        const todayData =
          getTodayOdds();


        const todayRule =
          getTodayRule(
            todayData,
            currentPersonId,
            binding.domainId,
            binding.ruleId
          );


        if (
          !todayRule
        ) {

          button.textContent =
            "尚未配置";

          return;

        }


        button.dataset.revealed =
          "true";


        button.textContent =
          `${todayRule.today.toFixed(1)}%`;

      }
    );

  }
);


/* =========================
   初始化
   ========================= */

renderPersonSelect();

renderRules();

getTodayOdds();