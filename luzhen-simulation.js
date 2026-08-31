/* =========================
   Liminal · Luzhen Simulation Engine

   目标：
   1. 榛榛的日程 / 睡眠 / 身体状态可自动生成。
   2. 每个日期只自动生成一次。
   3. 已存在的数据永远优先，不覆盖手动内容。
   4. 手动删改后，也不会因为刷新而重新生成。
   ========================= */

(function () {

  const config =
    window.LIMINAL_LUZHEN_SIMULATION_DATA;


  if (
    !config
  ) {

    console.warn(
      "Luzhen Simulation：未找到 luzhen-simulation-data.js"
    );

    return;

  }


  /* =========================
     基础工具
     ========================= */

  function padNumber(
    value
  ) {

    return String(
      value
    ).padStart(
      2,
      "0"
    );

  }


  function dateFromKey(
    dateKey
  ) {

    const [
      year,
      month,
      day
    ] =
      dateKey
        .split("-")
        .map(Number);


    return new Date(
      year,
      month - 1,
      day
    );

  }


  function timeToMinutes(
    time
  ) {

    const [
      hour,
      minute
    ] =
      String(time)
        .split(":")
        .map(Number);


    return (
      hour * 60 +
      minute
    );

  }


  function minutesToTime(
    totalMinutes
  ) {

    const normalized =
      ((totalMinutes % 1440) + 1440) % 1440;


    const hour =
      Math.floor(
        normalized / 60
      );


    const minute =
      normalized % 60;


    return (
      `${padNumber(hour)}:${padNumber(minute)}`
    );

  }


  function durationMinutes(
    start,
    end
  ) {

    if (
      !start ||
      !end
    ) {

      return 0;

    }


    const startMinutes =
      timeToMinutes(
        start
      );


    let endMinutes =
      timeToMinutes(
        end
      );


    if (
      endMinutes <
        startMinutes
    ) {

      endMinutes +=
        1440;

    }


    return (
      endMinutes -
      startMinutes
    );

  }


  function durationText(
    totalMinutes
  ) {

    const hours =
      Math.floor(
        totalMinutes / 60
      );


    const minutes =
      totalMinutes % 60;


    return (
      `${hours}h${minutes}m`
    );

  }


  /* =========================
     每个日期固定的伪随机

     同一个日期 + 同一个频道，
     得到稳定随机结果。
     ========================= */

  function hashString(
    text
  ) {

    let hash =
      2166136261;


    for (
      let index = 0;
      index < text.length;
      index += 1
    ) {

      hash ^=
        text.charCodeAt(
          index
        );


      hash =
        Math.imul(
          hash,
          16777619
        );

    }


    return (
      hash >>> 0
    );

  }


  function createRandom(
    seedText
  ) {

    let seed =
      hashString(
        seedText
      );


    return function () {

      seed +=
        0x6D2B79F5;


      let value =
        seed;


      value =
        Math.imul(
          value ^
            (value >>> 15),
          value | 1
        );


      value ^=
        value +
        Math.imul(
          value ^
            (value >>> 7),
          value | 61
        );


      return (
        (
          value ^
          (value >>> 14)
        ) >>> 0
      ) / 4294967296;

    };

  }


  function randomBetween(
    random,
    min,
    max
  ) {

    return (
      min +
      random() *
      (max - min)
    );

  }


  function randomInt(
    random,
    min,
    max
  ) {

    return Math.floor(
      randomBetween(
        random,
        min,
        max + 1
      )
    );

  }


  function randomFrom(
    random,
    list
  ) {

    if (
      !Array.isArray(list) ||
      !list.length
    ) {

      return "";

    }


    return list[
      randomInt(
        random,
        0,
        list.length - 1
      )
    ];

  }


  function randomTime(
    random,
    range
  ) {

    const start =
      timeToMinutes(
        range[0]
      );


    const end =
      timeToMinutes(
        range[1]
      );


    let adjustedEnd =
      end;


    if (
      adjustedEnd <
        start
    ) {

      adjustedEnd +=
        1440;

    }


    return minutesToTime(
      randomInt(
        random,
        start,
        adjustedEnd
      )
    );

  }


  /* =========================
     数据容器
     ========================= */

  function ensureContainers(
    calendarData
  ) {

    if (
      !calendarData.schedule ||
      typeof calendarData.schedule !==
        "object"
    ) {

      calendarData.schedule =
        {};

    }


    if (
      !calendarData.sleepLuzhen ||
      typeof calendarData.sleepLuzhen !==
        "object"
    ) {

      calendarData.sleepLuzhen =
        {};

    }


    if (
      !calendarData.bodyLuzhen ||
      typeof calendarData.bodyLuzhen !==
        "object"
    ) {

      calendarData.bodyLuzhen =
        {};

    }


    if (
      !calendarData.simulation ||
      typeof calendarData.simulation !==
        "object"
    ) {

      calendarData.simulation =
        {};

    }


    if (
      !calendarData.simulation.luzhen ||
      typeof calendarData.simulation.luzhen !==
        "object"
    ) {

      calendarData.simulation.luzhen =
        {};

    }

  }


  function getDateMeta(
    calendarData,
    dateKey
  ) {

    ensureContainers(
      calendarData
    );


    if (
      !calendarData.simulation
        .luzhen[dateKey]
    ) {

      calendarData.simulation
        .luzhen[dateKey] = {
          scheduleResolved: false,
          sleepResolved: false,
          bodyResolved: false
        };

    }


    return (
      calendarData.simulation
        .luzhen[dateKey]
    );

  }


  /* =========================
     日程
     ========================= */

  function hasExistingLuzhenSchedule(
    calendarData,
    dateKey
  ) {

    const rows =
      calendarData.schedule
        ?.[dateKey];


    return (
      Array.isArray(rows) &&
      rows.some(
        function (row) {

          return Boolean(
            row.luzhenTime &&
            row.luzhen
          );

        }
      )
    );

  }


  function generateSchedule(
    calendarData,
    dateKey
  ) {

    const date =
      dateFromKey(
        dateKey
      );


    const weekday =
      date.getDay();


    const routine =
      config.weeklyRoutine[
        weekday
      ];


    if (
      !routine
    ) {

      return [];

    }


    const random =
      createRandom(
        `${dateKey}|schedule`
      );


    const generated =
      [];


    routine.events.forEach(
      function (
        template,
        index
      ) {

        if (
          random() >
            template.probability
        ) {

          return;

        }


        const start =
          randomTime(
            random,
            template.startRange
          );


        const duration =
          randomInt(
            random,
            template.durationRange[0],
            template.durationRange[1]
          );


        const end =
          minutesToTime(
            timeToMinutes(start) +
            duration
          );


        generated.push({

          id:
            `luzhen_generated_${dateKey}_${index}`,

          title:
            template.title,

          start:
            start,

          end:
            end,

          workload:
            Number(
              template.workload ||
              0
            ),

          tags:
            Array.isArray(
              template.tags
            )
              ? [
                  ...template.tags
                ]
              : []

        });

      }
    );


    generated.sort(
      function (a, b) {

        return a.start.localeCompare(
          b.start
        );

      }
    );


    if (
      !Array.isArray(
        calendarData.schedule[
          dateKey
        ]
      )
    ) {

      calendarData.schedule[
        dateKey
      ] = [];

    }


    generated.forEach(
      function (event) {

        calendarData.schedule[
          dateKey
        ].push({

          keshiTime: "",
          keshiEndTime: "",
          keshi: "",

          luzhenTime:
            event.start,

          luzhenEndTime:
            event.end,

          luzhen:
            event.title,

          luzhenSource:
            "generated",

          luzhenSimulationId:
            event.id,

          luzhenWorkload:
            event.workload,

          luzhenTags:
            event.tags

        });

      }
    );


    return generated;

  }


  function resolveSchedule(
    calendarData,
    dateKey,
    meta
  ) {

    if (
      meta.scheduleResolved
    ) {

      return false;

    }


    if (
      hasExistingLuzhenSchedule(
        calendarData,
        dateKey
      )
    ) {

      meta.scheduleResolved =
        true;

      return true;

    }


    generateSchedule(
      calendarData,
      dateKey
    );


    meta.scheduleResolved =
      true;


    return true;

  }


  function getLuzhenScheduleEvents(
    calendarData,
    dateKey
  ) {

    const rows =
      calendarData.schedule
        ?.[dateKey] ||
      [];


    return rows
      .filter(
        function (row) {

          return Boolean(
            row.luzhenTime &&
            row.luzhen
          );

        }
      )
      .map(
        function (row) {

          return {
            start:
              row.luzhenTime,

            end:
              row.luzhenEndTime ||
              "",

            title:
              row.luzhen,

            workload:
              Number(
                row.luzhenWorkload ||
                0.8
              ),

            tags:
              Array.isArray(
                row.luzhenTags
              )
                ? row.luzhenTags
                : []
          };

        }
      );

  }


  /* =========================
     睡眠
     ========================= */

  function pickWakeTime(
    random,
    weekday,
    events
  ) {

    if (
      weekday === 0
    ) {

      return randomTime(
        random,
        config.sleepRules
          .sundayWakeRange
      );

    }


    const morningEvents =
      events
        .filter(
          function (event) {

            return (
              timeToMinutes(
                event.start
              ) <
              12 * 60
            );

          }
        )
        .sort(
          function (a, b) {

            return a.start.localeCompare(
              b.start
            );

          }
        );


    if (
      morningEvents.length
    ) {

      const earliest =
        timeToMinutes(
          morningEvents[0]
            .start
        );


      const lead =
        randomInt(
          random,
          config.sleepRules
            .wakeLeadMinutes[0],
          config.sleepRules
            .wakeLeadMinutes[1]
        );


      const wakeMinutes =
        Math.max(
          6 * 60 + 15,
          earliest - lead
        );


      return minutesToTime(
        wakeMinutes
      );

    }


    return randomTime(
      random,
      config.sleepRules
        .noMorningEventWakeRange
    );

  }


  function getSleepQuality(
    duration
  ) {

    const rule =
      config.sleepRules
        .durationQuality
        .find(
          function (item) {

            return (
              duration >=
              item.minMinutes
            );

          }
        );


    return (
      rule
        ?.quality ||
      "一般"
    );

  }


  function calculateWorkload(
    events
  ) {

    return events.reduce(
      function (
        total,
        event
      ) {

        return (
          total +
          Number(
            event.workload ||
            0
          )
        );

      },
      0
    );

  }


  function generateSleep(
    calendarData,
    dateKey
  ) {

    const random =
      createRandom(
        `${dateKey}|sleep`
      );


    const date =
      dateFromKey(
        dateKey
      );


    const weekday =
      date.getDay();


    const events =
      getLuzhenScheduleEvents(
        calendarData,
        dateKey
      );


    const wake =
      pickWakeTime(
        random,
        weekday,
        events
      );


    const bedtimeRange =
      weekday === 0 ||
      weekday === 6
        ? config.sleepRules
            .bedtimeRangeWeekend
        : config.sleepRules
            .bedtimeRangeWeekday;


    const start =
      randomTime(
        random,
        bedtimeRange
      );


    const duration =
      durationMinutes(
        start,
        wake
      );


    const quality =
      getSleepQuality(
        duration
      );


    const workload =
      calculateWorkload(
        events
      );


    let napProbability =
      config.sleepRules
        .napProbability
        .normalLoad;


    if (
      workload < 1.5
    ) {

      napProbability =
        config.sleepRules
          .napProbability
          .lowLoad;

    }


    if (
      workload >= 4
    ) {

      napProbability =
        config.sleepRules
          .napProbability
          .highLoad;

    }


    if (
      duration < 390
    ) {

      napProbability =
        Math.max(
          napProbability,
          config.sleepRules
            .napProbability
            .shortSleep
        );

    }


    let nap =
      "暂无午睡";


    if (
      random() <
        napProbability
    ) {

      const napStart =
        randomTime(
          random,
          config.sleepRules
            .napStartRange
        );


      const napDuration =
        randomInt(
          random,
          config.sleepRules
            .napDurationRange[0],
          config.sleepRules
            .napDurationRange[1]
        );


      const napEnd =
        minutesToTime(
          timeToMinutes(
            napStart
          ) +
          napDuration
        );


      nap =
        `${napStart}–${napEnd}`;

    }


    calendarData.sleepLuzhen[
      dateKey
    ] = {

      start:
        start,

      end:
        wake,

      duration:
        durationText(
          duration
        ),

      quality:
        quality,

      nap:
        nap,

      source:
        "generated"

    };

  }


  function resolveSleep(
    calendarData,
    dateKey,
    meta
  ) {

    if (
      meta.sleepResolved
    ) {

      return false;

    }


    if (
      calendarData.sleepLuzhen[
        dateKey
      ]
    ) {

      meta.sleepResolved =
        true;

      return true;

    }


    generateSleep(
      calendarData,
      dateKey
    );


    meta.sleepResolved =
      true;


    return true;

  }


  /* =========================
     身体状态
     ========================= */

  function getSleepScore(
    sleepMinutes
  ) {

    const rule =
      config.bodyRules
        .sleepScore
        .find(
          function (item) {

            return (
              sleepMinutes <=
              item.maxMinutes
            );

          }
        );


    return Number(
      rule?.score ||
      0
    );

  }


  function getBodyLevel(
    fatigueScore
  ) {

    return (
      config.bodyRules
        .levels
        .find(
          function (level) {

            return (
              fatigueScore <=
              level.maxScore
            );

          }
        ) ||
      config.bodyRules
        .levels[
          config.bodyRules
            .levels.length - 1
        ]
    );

  }


  function hasTag(
    events,
    tag
  ) {

    return events.some(
      function (event) {

        return (
          Array.isArray(
            event.tags
          ) &&
          event.tags.includes(
            tag
          )
        );

      }
    );

  }


  function generateBody(
    calendarData,
    dateKey
  ) {

    const random =
      createRandom(
        `${dateKey}|body`
      );


    const sleep =
      calendarData.sleepLuzhen[
        dateKey
      ] ||
      {};


    const sleepMinutes =
      durationMinutes(
        sleep.start,
        sleep.end
      );


    const events =
      getLuzhenScheduleEvents(
        calendarData,
        dateKey
      );


    const workload =
      calculateWorkload(
        events
      );


    let fatigueScore =
      getSleepScore(
        sleepMinutes
      );


    fatigueScore +=
      workload *
      config.bodyRules
        .workloadMultiplier;


    if (
      events.length >=
        config.bodyRules
          .manyEventsThreshold
    ) {

      fatigueScore +=
        config.bodyRules
          .manyEventsScore;

    }


    const didExercise =
      hasTag(
        events,
        "exercise"
      );


    if (
      didExercise
    ) {

      fatigueScore +=
        config.bodyRules
          .exerciseScore;

    }


    fatigueScore +=
      randomBetween(
        random,
        config.bodyRules
          .randomNoise[0],
        config.bodyRules
          .randomNoise[1]
      );


    fatigueScore =
      Math.max(
        0,
        fatigueScore
      );


    const level =
      getBodyLevel(
        fatigueScore
      );


    const energy =
      randomInt(
        random,
        level.energy[0],
        level.energy[1]
      );


    let appetitePool =
      config.bodyRules
        .appetite.normal;


    if (
      didExercise
    ) {

      appetitePool =
        config.bodyRules
          .appetite.afterExercise;

    }


    if (
      level.key === "tired" ||
      level.key === "mildTired"
    ) {

      appetitePool =
        config.bodyRules
          .appetite.tired;

    }


    calendarData.bodyLuzhen[
      dateKey
    ] = {

      energy:
        `${energy} / 5`,

      appetite:
        randomFrom(
          random,
          appetitePool
        ),

      pain:
        randomFrom(
          random,
          config.bodyRules
            .discomfort[
              level.key
            ]
        ),

      note:
        randomFrom(
          random,
          config.stateCorpus[
            level.key
          ]
        ),

      fatigueScore:
        Number(
          fatigueScore.toFixed(
            2
          )
        ),

      source:
        "generated"

    };

  }


  function resolveBody(
    calendarData,
    dateKey,
    meta
  ) {

    if (
      meta.bodyResolved
    ) {

      return false;

    }


    if (
      calendarData.bodyLuzhen[
        dateKey
      ]
    ) {

      meta.bodyResolved =
        true;

      return true;

    }


    generateBody(
      calendarData,
      dateKey
    );


    meta.bodyResolved =
      true;


    return true;

  }


  /* =========================
     对外入口
     ========================= */

  function ensureDate(
    calendarData,
    dateKey
  ) {

    if (
      !calendarData ||
      !dateKey
    ) {

      return false;

    }


    ensureContainers(
      calendarData
    );


    const meta =
      getDateMeta(
        calendarData,
        dateKey
      );


    let changed =
      false;


    if (
      resolveSchedule(
        calendarData,
        dateKey,
        meta
      )
    ) {

      changed =
        true;

    }


    if (
      resolveSleep(
        calendarData,
        dateKey,
        meta
      )
    ) {

      changed =
        true;

    }


    if (
      resolveBody(
        calendarData,
        dateKey,
        meta
      )
    ) {

      changed =
        true;

    }


    return changed;

  }


  window.LiminalLuzhenSimulation = {

    ensureDate:
      ensureDate

  };

})();