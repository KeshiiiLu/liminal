(function () {

  "use strict";


  /* =========================================
     Liminal World Rules v2

     互动频率的唯一默认值来源。

     这里只补缺失或无效字段；已经存在的合法值，
     包括 0–0，都会原样保留。
     ========================================= */


  const PEOPLE = {

    luzhen: {
      id: "luzhen",
      name: "陆榛"
    },

    jasper: {
      id: "jasper",
      name: "Jasper"
    }

  };


  const RULES = [

    {
      group: "message",
      domainId: "chat",
      domainLabel: "Chat",
      ruleId: "reply",
      label: "回复",
      description: "收到你的消息后，选择回应的概率",
      defaults: {
        luzhen: [0.0, 0.0],
        jasper: [0.0, 0.0]
      },
      parameters: {
        delaySeconds: {
          min: 5,
          max: 60,
          minimum: 0
        },
        messageCount: {
          min: 1,
          max: 3,
          minimum: 1
        },
        messageIntervalSeconds: {
          min: 2,
          max: 12,
          minimum: 0
        }
      }
    },

    {
      group: "message",
      domainId: "chat",
      domainLabel: "Chat",
      ruleId: "message",
      label: "主动发消息",
      description: "没有由你先开口时，主动发送消息",
      defaults: {
        luzhen: [30.0, 60.0],
        jasper: [20.0, 50.0]
      },
      parameters: {
        waitMinutes: {
          min: 30,
          max: 180,
          minimum: 0
        },
        messageCount: {
          min: 1,
          max: 4,
          minimum: 1
        },
        messageIntervalSeconds: {
          min: 2,
          max: 12,
          minimum: 0
        }
      }
    },

    {
      group: "message",
      domainId: "chat",
      domainLabel: "Chat",
      ruleId: "continue",
      label: "继续说",
      description: "一条消息之后继续补充内容",
      defaults: {
        luzhen: [0.0, 0.0],
        jasper: [0.0, 0.0]
      },
      parameters: {
        messageCount: {
          min: 1,
          max: 4,
          minimum: 1
        },
        messageIntervalSeconds: {
          min: 2,
          max: 12,
          minimum: 0
        }
      }
    },

    {
      group: "message",
      domainId: "chat",
      domainLabel: "Chat",
      ruleId: "poke",
      label: "拍一拍",
      description: "主动触发拍一拍互动",
      defaults: {
        luzhen: [0.0, 0.0],
        jasper: [0.0, 0.0]
      },
      parameters: {
        roundGap: {
          min: 2,
          max: 6,
          minimum: 0
        }
      }
    },

    {
      group: "message",
      domainId: "chat",
      domainLabel: "Chat",
      ruleId: "recall",
      label: "撤回消息",
      description: "发送消息后主动撤回",
      defaults: {
        luzhen: [0.0, 0.0],
        jasper: [0.0, 0.0]
      },
      parameters: {
        delaySeconds: {
          min: 5,
          max: 120,
          minimum: 0
        }
      }
    },

    {
      group: "call",
      domainId: "chat",
      domainLabel: "Chat",
      ruleId: "call",
      label: "主动拨打",
      description: "对方主动给你拨打视频通话",
      defaults: {
        luzhen: [5.0, 15.0],
        jasper: [3.0, 12.0]
      },
      parameters: {
        waitHours: {
          min: 3,
          max: 12,
          minimum: 0
        }
      }
    },

    {
      group: "call",
      domainId: "chat",
      domainLabel: "Chat",
      ruleId: "answerCall",
      label: "接听",
      description: "你主动拨打时选择接听",
      defaults: {
        luzhen: [0.0, 0.0],
        jasper: [0.0, 0.0]
      },
      parameters: {
        delaySeconds: {
          min: 3,
          max: 30,
          minimum: 0
        }
      }
    },

    {
      group: "call",
      domainId: "chat",
      domainLabel: "Chat",
      ruleId: "rejectCall",
      label: "拒接",
      description: "未选择接听时，主动拒绝通话",
      defaults: {
        luzhen: [0.0, 0.0],
        jasper: [0.0, 0.0]
      }
    },

    {
      group: "money",
      domainId: "wallet",
      domainLabel: "Wallet",
      ruleId: "redPacket",
      label: "主动发红包",
      description: "主动发送红包",
      defaults: {
        luzhen: [0.0, 0.0],
        jasper: [0.0, 0.0]
      },
      parameters: {
        waitDays: {
          min: 1,
          max: 7,
          minimum: 0
        }
      }
    },

    {
      group: "money",
      domainId: "wallet",
      domainLabel: "Wallet",
      ruleId: "transfer",
      label: "主动转账",
      description: "主动向你发起转账",
      defaults: {
        luzhen: [0.0, 0.0],
        jasper: [0.0, 0.0]
      },
      parameters: {
        waitDays: {
          min: 3,
          max: 14,
          minimum: 0
        }
      }
    },

    {
      group: "money",
      domainId: "mall",
      domainLabel: "Mall",
      ruleId: "gift",
      label: "主动买礼物",
      description: "主动购买并赠送礼物",
      defaults: {
        luzhen: [10.0, 30.0],
        jasper: [8.0, 20.0]
      },
      parameters: {
        waitDays: {
          min: 7,
          max: 30,
          minimum: 0
        }
      }
    }

  ];


  function isObject(
    value
  ) {

    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );

  }


  function isValidNumber(
    value,
    minimum,
    maximum = Infinity
  ) {

    if (
      value === null ||
      value === ""
    ) {

      return false;

    }


    const number =
      Number(value);


    return (
      Number.isFinite(number) &&
      number >= minimum &&
      number <= maximum
    );

  }


  function ensureTextField(
    target,
    field,
    fallback
  ) {

    if (
      typeof target[field] === "string" &&
      target[field].length > 0
    ) {

      return false;

    }


    target[field] =
      fallback;


    return true;

  }


  function ensureRange(
    owner,
    field,
    defaults,
    minimum,
    maximum = Infinity
  ) {

    let changed =
      false;


    if (
      !isObject(owner[field])
    ) {

      owner[field] = {};

      changed =
        true;

    }


    const range =
      owner[field];


    changed =
      ensureNumberField(
        range,
        "min",
        defaults.min,
        minimum,
        maximum
      ) || changed;


    changed =
      ensureNumberField(
        range,
        "max",
        defaults.max,
        minimum,
        maximum
      ) || changed;


    return changed;

  }


  function ensureNumberField(
    target,
    field,
    fallback,
    minimum,
    maximum = Infinity
  ) {

    if (
      isValidNumber(
        target[field],
        minimum,
        maximum
      )
    ) {

      return false;

    }


    target[field] =
      fallback;


    return true;

  }


  function ensureWorldRules(
    worldData,
    requestedPersonIds
  ) {

    let changed =
      false;


    if (
      !isObject(worldData)
    ) {

      worldData = {
        version: 2,
        updatedAt: 0,
        people: {}
      };

      changed =
        true;

    }


    if (
      !isValidNumber(
        worldData.version,
        0
      )
    ) {

      worldData.version = 2;

      changed =
        true;

    }


    if (
      !isObject(worldData.people)
    ) {

      worldData.people = {};

      changed =
        true;

    }


    const personIds =
      Array.isArray(
        requestedPersonIds
      )
        ? requestedPersonIds
        : Object.keys(
            PEOPLE
          );


    personIds.forEach(
      function (
        personId
      ) {

        const personDefaults =
          PEOPLE[personId];


        if (
          !personDefaults
        ) {

          return;

        }


        if (
          !isObject(
            worldData.people[
              personId
            ]
          )
        ) {

          worldData.people[
            personId
          ] = {};

          changed =
            true;

        }


        const person =
          worldData.people[
            personId
          ];


        changed =
          ensureTextField(
            person,
            "id",
            personDefaults.id
          ) || changed;


        changed =
          ensureTextField(
            person,
            "name",
            personDefaults.name
          ) || changed;


        if (
          !isObject(
            person.domains
          )
        ) {

          person.domains = {};

          changed =
            true;

        }


        RULES.forEach(
          function (
            definition
          ) {

            if (
              !isObject(
                person.domains[
                  definition.domainId
                ]
              )
            ) {

              person.domains[
                definition.domainId
              ] = {};

              changed =
                true;

            }


            const domain =
              person.domains[
                definition.domainId
              ];


            changed =
              ensureTextField(
                domain,
                "id",
                definition.domainId
              ) || changed;


            changed =
              ensureTextField(
                domain,
                "label",
                definition.domainLabel
              ) || changed;


            if (
              !isObject(
                domain.rules
              )
            ) {

              domain.rules = {};

              changed =
                true;

            }


            if (
              !isObject(
                domain.rules[
                  definition.ruleId
                ]
              )
            ) {

              domain.rules[
                definition.ruleId
              ] = {};

              changed =
                true;

            }


            const rule =
              domain.rules[
                definition.ruleId
              ];


            changed =
              ensureTextField(
                rule,
                "id",
                definition.ruleId
              ) || changed;


            changed =
              ensureTextField(
                rule,
                "label",
                definition.label
              ) || changed;


            changed =
              ensureTextField(
                rule,
                "type",
                "probability"
              ) || changed;


            const probabilityDefaults =
              definition.defaults[
                personId
              ] || [0, 0];


            changed =
              ensureNumberField(
                rule,
                "min",
                probabilityDefaults[0],
                0,
                100
              ) || changed;


            changed =
              ensureNumberField(
                rule,
                "max",
                probabilityDefaults[1],
                0,
                100
              ) || changed;


            Object.entries(
              definition.parameters || {}
            ).forEach(
              function (
                [field, defaults]
              ) {

                changed =
                  ensureRange(
                    rule,
                    field,
                    defaults,
                    defaults.minimum ?? 0
                  ) || changed;

              }
            );

          }
        );

      }
    );


    return {
      worldData,
      changed
    };

  }


  function createDefaultWorldRules() {

    const result =
      ensureWorldRules({
        version: 2,
        updatedAt: 0,
        people: {}
      });


    result.worldData.updatedAt =
      0;


    return result.worldData;

  }


  window.LiminalWorldRulesDefaults = {
    people: PEOPLE,
    rules: RULES,
    ensureWorldRules,
    createDefaultWorldRules
  };

}());
