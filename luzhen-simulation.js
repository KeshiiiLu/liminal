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

  const time =
    window.LiminalTime || null;


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


  function chooseWeighted(
    random,
    weightMap
  ) {

    const entries =
      Object.entries(
        weightMap || {}
      ).filter(
        function (entry) {

          return Number(
            entry[1]
          ) > 0;

        }
      );


    const total =
      entries.reduce(
        function (sum, entry) {

          return sum +
            Number(entry[1]);

        },
        0
      );


    if (!entries.length || total <= 0) {
      return "";
    }


    let cursor =
      random() * total;


    for (const [key, weight] of entries) {
      cursor -= Number(weight);
      if (cursor <= 0) return key;
    }


    return entries[
      entries.length - 1
    ][0];

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


    if (
      !calendarData.simulation.luzhen.generatedWeeks ||
      typeof calendarData.simulation.luzhen.generatedWeeks !==
        "object" ||
      Array.isArray(calendarData.simulation.luzhen.generatedWeeks)
    ) {

      calendarData.simulation.luzhen.generatedWeeks = {};

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
          mealResolved: false,
          shoppingResolved: false,
          sleepResolved: false,
          bodyResolved: false
        };

    }


    const meta =
      calendarData.simulation
        .luzhen[dateKey];


    if (typeof meta.mealResolved !== "boolean") {
      meta.mealResolved = false;
    }


    if (typeof meta.shoppingResolved !== "boolean") {
      meta.shoppingResolved = false;
    }


    return meta;

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
              : [],

          eventType:
            template.eventType ||
            "schedule",

          mealType:
            template.mealType ||
            "",

          mealSource:
            template.mealSource ||
            "",

          owner:
            template.owner ||
            "luzhen",

          location:
            template.location ||
            "shanghai",

          status:
            "planned"

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

        if (event.eventType === "meal") {

          const shared =
            event.owner === "both";


          calendarData.schedule[
            dateKey
          ].push({

            eventType: "meal",
            mealType: event.mealType,
            mealSource: event.mealSource,
            owner: event.owner,
            title: event.title,
            startTime: event.start,
            endTime: event.end,
            location: event.location,
            source: "generated",
            world: "secondary",
            originWorld: "sub",
            simulationId: event.id,
            tags: event.tags,
            status: "planned",
            expenseContext:
              createMealExpenseContext(
                event.mealSource,
                event.location,
                event.title
              ),

            keshiTime: shared ? event.start : "",
            keshiEndTime: shared ? event.end : "",
            keshi: shared ? event.title : "",

            luzhenTime: event.start,
            luzhenEndTime: event.end,
            luzhen: event.title,
            luzhenSource: "generated",
            luzhenSimulationId: event.id,
            luzhenWorkload: event.workload,
            luzhenTags: event.tags,
            luzhenEventType: "meal",
            luzhenMealType: event.mealType,
            luzhenMealSource: event.mealSource,
            luzhenLocation: event.location

          });


          return;

        }

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
            event.tags,

          luzhenEventType:
            event.eventType,

          luzhenLocation:
            event.location,

          status:
            "planned"

        });

      }
    );


    return generated;

  }


  function inferMealType(
    title,
    start
  ) {

    if (/早餐/.test(title)) return "breakfast";
    if (/午饭|午餐/.test(title)) return "lunch";
    if (/晚饭|晚餐|聚餐|一起做饭/.test(title)) return "dinner";
    if (/咖啡|饮品/.test(title)) return "coffee";
    if (/加餐|甜点/.test(title)) return "snack";


    const minutes =
      timeToMinutes(start);


    if (minutes < 10 * 60 + 30) return "breakfast";
    if (minutes < 15 * 60) return "lunch";
    if (minutes >= 17 * 60) return "dinner";
    return "snack";

  }


  function createMealExpenseContext(
    mealSource,
    location,
    title
  ) {

    const immediateExpense =
      [
        "delivery",
        "restaurant",
        "work_meal",
        "travel_meal"
      ].includes(mealSource);


    return {
      source: mealSource,
      immediateExpense,
      category:
        mealSource === "delivery"
          ? "外卖"
          : "餐饮",
      title,
      location,
      payer: "luzhen",
      accountHint: "cmb_daily",
      scope: "household",
      world: "secondary",
      originWorld: "sub",
      status: "context_only"
    };

  }


  function eventOverlaps(
    events,
    start,
    end
  ) {

    const startMinutes =
      timeToMinutes(start);


    const endMinutes =
      timeToMinutes(end);


    return events.some(
      function (event) {

        const eventStart =
          timeToMinutes(event.start);


        let eventEnd =
          event.end
            ? timeToMinutes(event.end)
            : eventStart + 40;


        if (eventEnd < eventStart) {
          eventEnd += 1440;
        }


        return (
          startMinutes < eventEnd &&
          endMinutes > eventStart
        );

      }
    );

  }


  function resolveMealLocation(
    calendarData,
    dateKey,
    events
  ) {

    if (
      window.LiminalHouseholdShopping &&
      typeof window
        .LiminalHouseholdShopping
        .getCalendarContext === "function"
    ) {

      return window
        .LiminalHouseholdShopping
        .getCalendarContext(
          calendarData,
          dateKey
        ).location;

    }


    const explicit =
      calendarData.locationState
        ?.[dateKey];


    if (typeof explicit === "string" && explicit) {
      return explicit;
    }


    const travel =
      events.find(
        event =>
          Array.isArray(event.tags) &&
          event.tags.includes("travel")
      );


    return travel?.location || "shanghai";

  }


  function applyMealContextWeights(
    weights,
    contextKey,
    mealType
  ) {

    const multipliers =
      config.mealRules
        ?.contextMultipliers
        ?.[contextKey]
        ?.[mealType] ||
      {};


    Object.entries(
      multipliers
    ).forEach(
      function ([source, multiplier]) {

        weights[source] =
          Number(weights[source] || 0) *
          Number(multiplier);

      }
    );

  }


  function uniqueMealItems(
    values
  ) {

    return [
      ...new Set(
        (Array.isArray(values) ? values : [])
          .map(value => String(value || "").trim())
          .filter(Boolean)
      )
    ];

  }


  function buildMealItems(
    calendarData,
    dateKey,
    mealType,
    owner,
    random
  ) {

    const pools =
      config.mealRules
        ?.itemPools
        ?.[mealType] ||
      {};


    const hints =
      window.LiminalHouseholdShopping &&
      typeof window
        .LiminalHouseholdShopping
        .getMealItemHints === "function"
        ? window
            .LiminalHouseholdShopping
            .getMealItemHints(
              calendarData,
              dateKey,
              mealType
            )
        : [];


    const sharedPool =
      uniqueMealItems([
        ...hints,
        ...(pools.shared || [])
      ]);


    const chooseDistinct =
      function (pool, count) {

        const remaining =
          uniqueMealItems(pool);


        const selected = [];


        while (
          remaining.length &&
          selected.length < count
        ) {

          const index =
            randomInt(
              random,
              0,
              remaining.length - 1
            );


          selected.push(
            remaining.splice(index, 1)[0]
          );

        }


        return selected;

      };


    if (owner !== "both") {

      return {
        shared: [],
        keshi: owner === "keshi"
          ? chooseDistinct(
              [
                ...(pools.keshi || []),
                ...sharedPool
              ],
              mealType === "dinner" ? 2 : 1
            )
          : [],
        luzhen: owner === "luzhen"
          ? chooseDistinct(
              [
                ...(pools.luzhen || []),
                ...sharedPool
              ],
              mealType === "dinner" ? 2 : 1
            )
          : []
      };

    }


    return {
      shared:
        chooseDistinct(
          sharedPool,
          mealType === "dinner" ? 2 : 1
        ),
      keshi:
        chooseDistinct(
          pools.keshi || [],
          1
        ),
      luzhen:
        chooseDistinct(
          pools.luzhen || [],
          1
        )
    };

  }


  function getMealLocationAtTime(
    calendarData,
    dateKey,
    time,
    fallbackLocation
  ) {

    if (
      window.LiminalHouseholdShopping &&
      typeof window
        .LiminalHouseholdShopping
        .getLocationAtTime === "function"
    ) {

      const location =
        window
          .LiminalHouseholdShopping
          .getLocationAtTime(
            calendarData,
            dateKey,
            time
          );


      return {
        location,
        isShanghai:
          [
            "shanghai",
            "loft",
            "上海",
            "上海家里"
          ].includes(
            String(location)
              .toLowerCase()
          )
      };

    }


    return {
      location: fallbackLocation,
      isShanghai:
        [
          "shanghai",
          "loft",
          "上海",
          "上海家里"
        ].includes(
          String(fallbackLocation)
            .toLowerCase()
        )
    };

  }


  function createMealTitle(
    mealType,
    mealSource
  ) {

    const mealLabel =
      config.mealRules
        ?.types
        ?.[mealType]
        ?.label ||
      "用餐";


    const prefixes = {
      home: "Loft",
      delivery: "外卖",
      restaurant: "外出",
      work_meal: "工作",
      project_meal: "项目方",
      travel_meal: "出差"
    };


    return `${prefixes[mealSource] || ""}${mealLabel}`;

  }


  function generateMeals(
    calendarData,
    dateKey
  ) {

    const rules =
      config.mealRules;


    if (!rules) return [];


    const random =
      createRandom(
        `${dateKey}|meals|v${config.version}`
      );


    const date =
      dateFromKey(dateKey);


    const events =
      getLuzhenScheduleEvents(
        calendarData,
        dateKey
      );


    const existingMealTypes =
      new Set(
        events
          .filter(
            event =>
              event.eventType === "meal" ||
              event.tags.includes("meal")
          )
          .map(
            event =>
              event.mealType ||
              inferMealType(
                event.title,
                event.start
              )
          )
      );


    const workload =
      calculateWorkload(events);


    const workEvents =
      events.filter(
        event =>
          event.eventType !== "meal"
      );


    const locationState =
      resolveMealLocation(
        calendarData,
        dateKey,
        events
      );


    const isShanghai =
      [
        "shanghai",
        "loft",
        "上海",
        "上海家里"
      ].includes(
        String(locationState)
          .toLowerCase()
      );


    const latestWorkEnd =
      workEvents.reduce(
        function (latest, event) {

          const value =
            event.end || event.start;


          return value > latest
            ? value
            : latest;

        },
        "00:00"
      );


    const context = {
      highIntensity:
        workload >= 4 ||
        workEvents.length >= 4,
      institutionDay:
        workEvents.some(
          event =>
            /医院|机构|接诊/.test(
              event.title
            )
        ),
      externalProject:
        workEvents.some(
          event =>
            /项目|讲座|培训|大学活动/.test(
              event.title
            )
        ),
      fridayEarlyFinish:
        date.getDay() === 5 &&
        timeToMinutes(
          latestWorkEnd
        ) <= 17 * 60 + 45,
      sunday:
        date.getDay() === 0
    };


    const generated = [];


    Object.entries(
      rules.types
    ).forEach(
      function ([mealType, rule]) {

        if (
          existingMealTypes.has(mealType) ||
          random() > rule.probability
        ) {
          return;
        }


        const weights = {
          ...(rules.sources[mealType] || {})
        };


        Object.entries(context)
          .filter(entry => entry[1])
          .forEach(
            entry =>
              applyMealContextWeights(
                weights,
                entry[0],
                mealType
              )
          );


        if (!isShanghai) {
          Object.keys(weights).forEach(
            source => {
              weights[source] = 0;
            }
          );
          weights.travel_meal = 5;
          weights.project_meal =
            context.externalProject
              ? 2
              : 0.6;
        }


        let mealSource =
          chooseWeighted(
            random,
            weights
          );


        if (!mealSource) return;


        const duration =
          randomInt(
            random,
            rule.durationRange[0],
            rule.durationRange[1]
          );


        let start = "";
        let end = "";


        for (
          let attempt = 0;
          attempt < 28;
          attempt += 1
        ) {

          const candidate =
            randomTime(
              random,
              rule.timeRange
            );


          const candidateEnd =
            minutesToTime(
              timeToMinutes(candidate) +
              duration
            );


          if (
            !eventOverlaps(
              [
                ...events,
                ...generated
              ],
              candidate,
              candidateEnd
            )
          ) {
            start = candidate;
            end = candidateEnd;
            break;
          }

        }


        if (!start) return;


        const mealLocation =
          getMealLocationAtTime(
            calendarData,
            dateKey,
            start,
            locationState
          );


        if (!mealLocation.isShanghai) {
          mealSource =
            context.externalProject
              ? "project_meal"
              : "travel_meal";
        }


        let owner = "luzhen";


        if (
          mealLocation.isShanghai &&
          mealSource === "home" &&
          (
            mealType === "dinner" ||
            date.getDay() === 0 ||
            date.getDay() === 6
          ) &&
          random() < 0.72
        ) {
          owner = "both";
        }


        const location =
          !mealLocation.isShanghai
            ? String(mealLocation.location)
            : mealSource === "home"
              ? "loft"
              : "shanghai";


        const mealItems =
          buildMealItems(
            calendarData,
            dateKey,
            mealType,
            owner,
            random
          );


        const event = {
          id:
            `luzhen_meal_${dateKey}_${mealType}`,
          eventType: "meal",
          mealType,
          mealSource,
          title:
            createMealTitle(
              mealType,
              mealSource
            ),
          owner,
          start,
          end,
          location,
          source: "generated",
          world: "secondary",
          originWorld: "sub",
          workload: 0,
          mealItems,
          tags: [
            "life",
            "meal",
            mealType,
            mealSource,
            ...(owner === "both"
              ? ["together"]
              : [])
          ]
        };


        generated.push(event);

      }
    );


    if (
      !Array.isArray(
        calendarData.schedule[
          dateKey
        ]
      )
    ) {
      calendarData.schedule[dateKey] = [];
    }


    generated.forEach(
      function (event) {

        const shared =
          event.owner === "both";


        calendarData.schedule[
          dateKey
        ].push({
          eventType: "meal",
          mealType: event.mealType,
          mealSource: event.mealSource,
          owner: event.owner,
          title: event.title,
          startTime: event.start,
          endTime: event.end,
          location: event.location,
          source: "generated",
          world: "secondary",
          originWorld: "sub",
          simulationId: event.id,
          tags: event.tags,
          status: "planned",
          expenseContext:
            createMealExpenseContext(
              event.mealSource,
              event.location,
              event.title
            ),
          mealItems: {
            shared: [...event.mealItems.shared],
            keshi: [...event.mealItems.keshi],
            luzhen: [...event.mealItems.luzhen]
          },
          keshiTime: shared ? event.start : "",
          keshiEndTime: shared ? event.end : "",
          keshi: shared ? event.title : "",
          luzhenTime: event.start,
          luzhenEndTime: event.end,
          luzhen: event.title,
          luzhenSource: "generated",
          luzhenSimulationId: event.id,
          luzhenWorkload: 0,
          luzhenTags: event.tags,
          luzhenEventType: "meal",
          luzhenMealType: event.mealType,
          luzhenMealSource: event.mealSource,
          luzhenLocation: event.location,
          luzhenMealItems: {
            shared: [...event.mealItems.shared],
            keshi: [...event.mealItems.keshi],
            luzhen: [...event.mealItems.luzhen]
          }
        });

      }
    );


    return generated;

  }


  function resolveMeals(
    calendarData,
    dateKey,
    meta
  ) {

    const rows =
      Array.isArray(
        calendarData.schedule
          ?.[dateKey]
      )
        ? calendarData.schedule[dateKey]
        : [];


    let itemsChanged =
      false;


    rows.forEach(
      function (row, index) {

        const isMeal =
          row.eventType === "meal" ||
          row.luzhenEventType === "meal";


        if (
          !isMeal ||
          (
            row.mealItems &&
            typeof row.mealItems === "object"
          )
        ) {
          return;
        }


        const mealType =
          row.mealType ||
          row.luzhenMealType ||
          inferMealType(
            row.title ||
              row.luzhen ||
              row.keshi ||
              "",
            row.startTime ||
              row.luzhenTime ||
              row.keshiTime ||
              "12:00"
          );


        const owner =
          row.owner ||
          (
            row.keshi &&
            row.luzhen
              ? "both"
              : row.keshi
                ? "keshi"
                : "luzhen"
          );


        const random =
          createRandom(
            `${dateKey}|meal-items|${index}|v${config.version}`
          );


        row.mealItems =
          buildMealItems(
            calendarData,
            dateKey,
            mealType,
            owner,
            random
          );


        row.luzhenMealItems = {
          shared: [...row.mealItems.shared],
          keshi: [...row.mealItems.keshi],
          luzhen: [...row.mealItems.luzhen]
        };


        itemsChanged =
          true;

      }
    );

    if (meta.mealResolved) {
      return itemsChanged;
    }


    generateMeals(
      calendarData,
      dateKey
    );


    meta.mealResolved = true;
    return true;

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
              Number.isFinite(
                Number(
                  row.luzhenWorkload
                )
              )
                ? Number(
                    row.luzhenWorkload
                  )
                : 0.8,

            eventType:
              row.eventType ||
              row.luzhenEventType ||
              (
                (
                  Array.isArray(
                    row.luzhenTags
                  ) &&
                  row.luzhenTags.includes(
                    "meal"
                  )
                ) ||
                /早餐|午饭|午餐|晚饭|晚餐|聚餐|一起做饭|咖啡|饮品|加餐|甜点/.test(
                  row.luzhen
                )
                  ? "meal"
                  : "schedule"
              ),

            mealType:
              row.mealType ||
              row.luzhenMealType ||
              "",

            mealSource:
              row.mealSource ||
              row.luzhenMealSource ||
              "",

            location:
              row.location ||
              row.luzhenLocation ||
              "",

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


    const workEventCount =
      events.filter(
        event =>
          event.eventType === "schedule" &&
          Number(event.workload) > 0
      ).length;


    if (
      workEventCount >=
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
      resolveMeals(
        calendarData,
        dateKey,
        meta
      )
    ) {

      changed = true;

    }


    if (
      !meta.shoppingResolved &&
      window.LiminalHouseholdShopping &&
      typeof window
        .LiminalHouseholdShopping
        .ensureDate === "function"
    ) {

      const shoppingResult =
        window
          .LiminalHouseholdShopping
          .ensureDate(
            calendarData,
            dateKey
          );


      meta.shoppingResolved = true;


      changed = true;


      if (shoppingResult.changed) {
        changed = true;
      }

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


  function ensureWeek(
    calendarData,
    anchorDateKey
  ) {

    if (
      !calendarData ||
      !anchorDateKey ||
      !time ||
      typeof time.mondayWeekRange !== "function"
    ) {
      return {
        changed: false,
        generated: false,
        reason: "time_utility_unavailable"
      };
    }


    ensureContainers(calendarData);


    const range =
      time.mondayWeekRange(anchorDateKey);


    const weeklyState =
      calendarData.simulation.luzhen.generatedWeeks;


    const existing =
      weeklyState[range.start];


    if (
      existing?.completed === true &&
      existing.weekEnd === range.end
    ) {
      calendarData.simulation.luzhen.calendarGenerationState = {
        generatedWeekStart: range.start,
        generatedWeekEnd: range.end,
        generatedAt: existing.generatedAt,
        version: existing.version
      };
      return {
        changed: false,
        generated: false,
        weekStart: range.start,
        weekEnd: range.end
      };
    }


    let changed = false;


    time.enumerateDateKeys(range.start, range.end).forEach(
      function (dateKey) {

        if (ensureDate(calendarData, dateKey)) {
          changed = true;
        }

      }
    );


    const generatedAt =
      new Date().toISOString();


    weeklyState[range.start] = {
      weekStart: range.start,
      weekEnd: range.end,
      generatedAt,
      version: config.version,
      completed: true
    };


    calendarData.simulation.luzhen.calendarGenerationState = {
      generatedWeekStart: range.start,
      generatedWeekEnd: range.end,
      generatedAt,
      version: config.version
    };


    return {
      changed: true,
      generated: true,
      weekStart: range.start,
      weekEnd: range.end,
      contentChanged: changed
    };

  }


  window.LiminalLuzhenSimulation = {

    ensureDate:
      ensureDate,

    ensureWeek:
      ensureWeek,

    generateMeals:
      generateMeals,

    getLuzhenScheduleEvents:
      getLuzhenScheduleEvents

  };

})();
