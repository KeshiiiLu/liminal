/* =========================
   Liminal · Calendar
   ========================= */

const STORAGE_KEY =
  "liminal_calendar_preview_v1";


const $ =
  (id) =>
    document.getElementById(
      id
    );


const $$ =
  (selector) =>
    [
      ...document.querySelectorAll(
        selector
      )
    ];


function make(
  tag,
  className = "",
  text = ""
) {

  const node =
    document.createElement(
      tag
    );


  if (
    className
  ) {

    node.className =
      className;

  }


  if (
    text !== ""
  ) {

    node.textContent =
      text;

  }


  return node;

}



/* =========================
   当前日期
   ========================= */

const today =
  new Date();


let viewYear =
  today.getFullYear();


let viewMonth =
  today.getMonth();


let selectedDate =
  new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );


let dayOverviewMode =
  "mine";


let scheduleEditorOwner =
  "keshi";


let editingSchedule =
  null;


let timelineMode =
  "milestone";


let transmissionFilter =
  "all";


let recordViewMode =
  "mine";


let bodyEditorOwner =
  "keshi";


let bodyEditorEnergy =
  "";

let bodyEditorDiscomforts =
  [];


let editingCyclePeriod =
  null;


let cycleEditorPresets =
  [];


let activeCycleDayKey =
  "";


let editingSexRecord =
  null;


let sexEditorForm =
  "partner";


let sexEditorProtection =
  "yes";


let sexEditorProtectionMethod =
  "condom";


let sexEditorPositions =
  [];


let sexEditorCustomPositions =
  [];


let sexEditorCustomPresets =
  [];


let sexEditorPositionCategory =
  "supine";


let sexEditorLocation =
  "";


let sexEditorInitiator =
  "";


let sexEditorOrgasms = {
  keshi: 0,
  luzhen: 0
};


let sexEditorAids =
  [];


let sexEditorCustomAids =
  [];


let sexEditorComfort =
  "";


let sexEditorSatisfaction =
  "";


let sexEditorMoodBefore =
  [];


let sexEditorMoodAfter =
  [];

  let sleepEditorOwner =
  "keshi";

let milestoneEditorOwner =
  "keshi";


let editingMilestone =
  null;


let transmissionEditorType =
  "tarot";


let editingTransmission =
  null;



const monthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月"
];


const weekNames = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];


const DAY_MS =
  24 * 60 * 60 * 1000;



/* =========================
   日期工具
   ========================= */

function padNumber(
  number
) {

  return String(
    number
  ).padStart(
    2,
    "0"
  );

}



function toDateKey(
  date
) {

  return [
    date.getFullYear(),

    padNumber(
      date.getMonth() +
        1
    ),

    padNumber(
      date.getDate()
    )

  ].join(
    "-"
  );

}



function dateFromKey(
  key
) {

  const [
    year,
    month,
    day
  ] =
    key
      .split("-")
      .map(Number);


  return new Date(
    year,
    month - 1,
    day
  );

}



function formatDateTitle(
  date
) {

  return (
    `${date.getMonth() + 1}月` +
    `${date.getDate()}日 · ` +
    `${weekNames[
      date.getDay()
    ]}`
  );

}



function sameDate(
  a,
  b
) {

  return (
    a.getFullYear() ===
      b.getFullYear() &&

    a.getMonth() ===
      b.getMonth() &&

    a.getDate() ===
      b.getDate()
  );

}



/* =========================
   初版预览数据
   ========================= */

function createPreviewData() {

  return {

    milestones: {

      "2026-08-22": [
        {
          title:
            "返校",

          owner:
            "keshi"
        }
      ],


      "2026-09-12": [
        {
          title:
            "纪念日",

          owner:
            "keshi"
        }
      ],


      "2026-09-13": [
        {
          title:
            "cos团建",

          owner:
            "keshi"
        }
      ]

    },


    body: {

      "2026-08-21": {

        energy:
          "3 / 5",

        appetite:
          "正常",

        pain:
          "无",

        note:
          "今天整体状态一般。"

      }

    },


    bodyLuzhen: {

      "2026-08-21": {

        energy:
          "4 / 5",

        appetite:
          "正常",

        pain:
          "无",

        note:
          "今天整体状态稳定。"

      }

    },


    sleep: {

      "2026-08-21": {

        start:
          "02:18",

        end:
          "09:00",

        duration:
          "6h42m",

        quality:
          "一般",

        nap:
          "暂无午睡"

      }

    },


    sleepLuzhen: {

      "2026-08-21": {

        start:
          "00:40",

        end:
          "07:10",

        duration:
          "6h30m",

        quality:
          "不错",

        nap:
          "暂无午睡"

      }

    },


    cycle: {

      periods: [],


      customSymptomPresets: [],

      actualPeriod: [
        "2026-08-14",
        "2026-08-15",
        "2026-08-16",
        "2026-08-17",
        "2026-08-18"
      ],


      predictedPeriod: [
        "2026-09-12",
        "2026-09-13",
        "2026-09-14",
        "2026-09-15",
        "2026-09-16"
      ],


      fertile: [
        "2026-08-26",
        "2026-08-27",
        "2026-08-28",
        "2026-08-29",
        "2026-08-30",
        "2026-08-31"
      ],


      ovulation: [
        "2026-08-29"
      ]

    },


    sexCustomPositionPresets: [],


    sex: {

      "2026-08-20": [

        {
          time:
            "23:20",

          count:
            1,

          form:
            "双人",

          protection:
            "有",

          protectionMethod:
            "避孕套",

          positions: [
            "侧卧",
            "传教士"
          ]

        }

      ],


      "2026-08-21": [

        {
          time:
            "00:45",

          count:
            1,

          form:
            "双人",

          protection:
            "有",

          protectionMethod:
            "避孕套",

          positions: [
            "传教士",
            "侧卧"
          ]

        }

      ]

    },


    transmissions: [

      {
        id:
          "transmission_20260821_1342",

        date:
          "2026-08-21",

        time:
          "13:42",

        type:
          "mediumship",

        title:
          "连接状态传讯",

        source:
          "通灵",

        summary:
          "今天的连接整体比较稳定。"
      },


      {
        id:
          "transmission_20260820_2316",

        date:
          "2026-08-20",

        time:
          "23:16",

        type:
          "tarot",

        title:
          "我要如何感受到他的回应",

        source:
          "塔罗",

        summary:
          "逆位圣杯九 / 逆位倒吊人 / 战车"
      },


      {
        id:
          "transmission_20260818_0103",

        date:
          "2026-08-18",

        time:
          "01:03",

        type:
          "other",

        title:
          "电子字卡传讯",

        source:
          "电子字卡",

        summary:
          "我在，靠近一点。"
      }

    ],


    schedule: {

      "2026-08-21": [

        {
  keshiTime:
    "08:00",

  keshiEndTime:
    "09:40",

  keshi:
    "内科学",

  luzhen:
    "早餐",

  luzhenTime:
    "07:00",

  luzhenEndTime:
    ""
},


        {
          keshiTime:
            "10:00",

          keshi:
            "神经",

          luzhen:
            "接诊",

          luzhenTime:
            "10:00"
        },


        {
          keshiTime:
            "",

          keshi:
            "",

          luzhen:
            "午饭",

          luzhenTime:
            "12:00"
        },


        {
          keshiTime:
            "",

          keshi:
            "",

          luzhen:
            "病例整理",

          luzhenTime:
            "14:00"
        },


        {
          keshiTime:
            "18:00",

          keshi:
            "晚餐",

          luzhen:
            "健身",

          luzhenTime:
            "18:00"
        },


        {
          keshiTime:
            "19:00",

          keshi:
            "考研课",

          luzhen:
            "回家",

          luzhenTime:
            "19:30"
        }

      ]

    }

  };

}



/* =========================
   Load / Save
   ========================= */

function loadCalendarData() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
      );


    if (
      saved &&
      typeof saved ===
        "object"
    ) {

      return saved;

    }

  } catch (
    error
  ) {

    console.warn(
      "读取 Calendar 失败",
      error
    );

  }


  return createPreviewData();

}



function saveCalendarData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      calendarData
    )
  );

}



let calendarData =
  loadCalendarData();


const previewDefaults =
  createPreviewData();



/*
  只补后来新增的字段。

  不覆盖用户已经产生的数据。
*/

if (
  !calendarData.bodyLuzhen
) {

  calendarData.bodyLuzhen =
    previewDefaults
      .bodyLuzhen;

}


if (
  !calendarData.sleepLuzhen
) {

  calendarData.sleepLuzhen =
    previewDefaults
      .sleepLuzhen;

}


if (
  !Array.isArray(
    calendarData.transmissions
  )
) {

  calendarData.transmissions =
    previewDefaults
      .transmissions;

}


/*
  兼容旧版日程数据：
  给已经存在的 8:00 内科学补上结束时间。
*/

const previewSchedule0821 =
  calendarData.schedule
    ?.[
      "2026-08-21"
    ];


if (
  Array.isArray(
    previewSchedule0821
  )
) {

  const internalMedicine =
    previewSchedule0821.find(
      function (row) {

        return (
          row.keshiTime ===
            "08:00" &&
          row.keshi ===
            "内科学"
        );

      }
    );


  if (
    internalMedicine &&
    !internalMedicine.keshiEndTime
  ) {

    internalMedicine.keshiEndTime =
      "09:40";

  }

}


initializeCycleData();


initializeSexData();


saveCalendarData();



/* =========================
   DOM
   ========================= */

const calendarPages =
  $("calendarPages");


const calendarTabs =
  $$(".calendar-tab");


const monthGrid =
  $("monthGrid");


const monthYearLabel =
  $("monthYearLabel");


const monthTitle =
  $("monthTitle");


const previousMonthButton =
  $("previousMonthButton");


const nextMonthButton =
  $("nextMonthButton");


const calendarTodayButton =
  $("calendarTodayButton");



/* 日程 */

const scheduleDateTitle =
  $("scheduleDateTitle");


const scheduleList =
  $("scheduleList");


const previousScheduleDay =
  $("previousScheduleDay");


const nextScheduleDay =
  $("nextScheduleDay");


const addScheduleButton =
  $("addScheduleButton");


const scheduleEditorBackdrop =
  $("scheduleEditorBackdrop");


const scheduleEditorTitle =
  $("scheduleEditorTitle");


const scheduleDateInput =
  $("scheduleDateInput");


const scheduleTitleInput =
  $("scheduleTitleInput");


const scheduleStartTimeInput =
  $("scheduleStartTimeInput");


const scheduleEndTimeInput =
  $("scheduleEndTimeInput");


const scheduleOwnerButtons =
  $$(".schedule-owner");


const scheduleEditorClose =
  $("scheduleEditorClose");


const scheduleEditorDelete =
  $("scheduleEditorDelete");


const scheduleEditorCancel =
  $("scheduleEditorCancel");


const scheduleEditorSave =
  $("scheduleEditorSave");


const scheduleEditorActions =
  scheduleEditorSave
    .closest(
      ".schedule-editor-actions"
    );



/* 时间线 */

const timelineList =
  $("timelineList");


const timelineModeButtons =
  $$(".timeline-mode-button");


const milestoneTimelinePanel =
  $("milestoneTimelinePanel");


const transmissionTimelinePanel =
  $("transmissionTimelinePanel");


const transmissionFilterButtons =
  $$(".transmission-filter-button");


const transmissionTimelineList =
  $("transmissionTimelineList");



/* 第四页 */

const recordDateTitle =
  $("recordDateTitle");


const recordBody =
  $("recordBody");


const recordSleep =
  $("recordSleep");


const recordCycle =
  $("recordCycle");


const recordCycleCard =
  $("recordCycleCard");


const manageCycleButton =
  $("manageCycleButton");


const recordSex =
  $("recordSex");


const recordSexCard =
  $("recordSexCard");


const manageSexButton =
  $("manageSexButton");


/* Sex 管理器 */

const sexManagerBackdrop =
  $("sexManagerBackdrop");


const sexManagerTitle =
  $("sexManagerTitle");


const sexManagerClose =
  $("sexManagerClose");


const sexManagerListView =
  $("sexManagerListView");


const sexManagerDate =
  $("sexManagerDate");


const sexManagerTotal =
  $("sexManagerTotal");


const sexRecordList =
  $("sexRecordList");


const sexAddRecordButton =
  $("sexAddRecordButton");


const sexRecordEditorView =
  $("sexRecordEditorView");


const sexRecordBackButton =
  $("sexRecordBackButton");


const sexDateInput =
  $("sexDateInput");


const sexTimeInput =
  $("sexTimeInput");


const sexFormOptions =
  $("sexFormOptions");


const sexCountInput =
  $("sexCountInput");


const sexProtectionOptions =
  $("sexProtectionOptions");


const sexProtectionMethodField =
  $("sexProtectionMethodField");


const sexProtectionMethodOptions =
  $("sexProtectionMethodOptions");


const sexPositionOptions =
  $("sexPositionOptions");


const sexPositionCategories =
  $("sexPositionCategories");


const sexPositionCategoryLabel =
  $("sexPositionCategoryLabel");


const sexSelectedPositionsBlock =
  $("sexSelectedPositionsBlock");


const sexSelectedPositions =
  $("sexSelectedPositions");


const sexCustomPositionInput =
  $("sexCustomPositionInput");


const sexSavePositionPreset =
  $("sexSavePositionPreset");


const sexAddCustomPositionButton =
  $("sexAddCustomPositionButton");


const sexDetailsToggle =
  $("sexDetailsToggle");


const sexDetailsPanel =
  $("sexDetailsPanel");


const sexEndTimeInput =
  $("sexEndTimeInput");


const sexDurationOutput =
  $("sexDurationOutput");


const sexLocationOptions =
  $("sexLocationOptions");


const sexCustomLocationInput =
  $("sexCustomLocationInput");


const sexInitiatorOptions =
  $("sexInitiatorOptions");


const sexKeshiOrgasmCount =
  $("sexKeshiOrgasmCount");


const sexLuzhenOrgasmCount =
  $("sexLuzhenOrgasmCount");


const sexAidOptions =
  $("sexAidOptions");


const sexCustomAidInput =
  $("sexCustomAidInput");


const sexAddCustomAidButton =
  $("sexAddCustomAidButton");


const sexSelectedAidsBlock =
  $("sexSelectedAidsBlock");


const sexSelectedAids =
  $("sexSelectedAids");


const sexComfortOptions =
  $("sexComfortOptions");


const sexSatisfactionOptions =
  $("sexSatisfactionOptions");


const sexMoodBeforeOptions =
  $("sexMoodBeforeOptions");


const sexMoodAfterOptions =
  $("sexMoodAfterOptions");


const sexNoteInput =
  $("sexNoteInput");


const sexEditorActions =
  $("sexEditorActions");


const sexDeleteRecordButton =
  $("sexDeleteRecordButton");


const sexCancelEditButton =
  $("sexCancelEditButton");


const sexSaveRecordButton =
  $("sexSaveRecordButton");


const recordViewButtons =
  $$(".record-view-button");


const recordBodyCard =
  $("recordBodyCard");


const editBodyButton =
  $("editBodyButton");

const recordSleepCard =
  $("recordSleepCard");


const editSleepButton =
  $("editSleepButton");


/* Cycle 管理器 */

const cycleManagerBackdrop =
  $("cycleManagerBackdrop");


const cycleManagerTitle =
  $("cycleManagerTitle");


const cycleManagerClose =
  $("cycleManagerClose");


const cycleManagerListView =
  $("cycleManagerListView");


const cycleLatestSummary =
  $("cycleLatestSummary");


const cyclePeriodList =
  $("cyclePeriodList");


const cycleAddPeriodButton =
  $("cycleAddPeriodButton");


const cyclePeriodEditorView =
  $("cyclePeriodEditorView");


const cyclePeriodBackButton =
  $("cyclePeriodBackButton");


const cycleStartInput =
  $("cycleStartInput");


const cycleEndInput =
  $("cycleEndInput");


const cycleDayEditor =
  $("cycleDayEditor");


const cycleEditorActions =
  $("cycleEditorActions");


const cycleDeletePeriodButton =
  $("cycleDeletePeriodButton");


const cycleCancelEditButton =
  $("cycleCancelEditButton");


const cycleSavePeriodButton =
  $("cycleSavePeriodButton");

/* Body 编辑器 */

const bodyEditorBackdrop =
  $("bodyEditorBackdrop");


const bodyEditorTitle =
  $("bodyEditorTitle");


const bodyDateInput =
  $("bodyDateInput");


const bodyOwnerButtons =
  $$("[data-body-owner]");


const bodyEnergyButtons =
  $$(".body-energy-options button");


const bodyAppetiteInput =
  $("bodyAppetiteInput");


const bodyPainInput =
  $("bodyPainInput");


const addBodyDiscomfortButton =
  $("addBodyDiscomfortButton");


const bodyDiscomfortList =
  $("bodyDiscomfortList");


const bodyLegacyPainNotice =
  $("bodyLegacyPainNotice");


const bodyNoteInput =
  $("bodyNoteInput");


const bodyEditorClose =
  $("bodyEditorClose");


const bodyEditorDelete =
  $("bodyEditorDelete");


const bodyEditorCancel =
  $("bodyEditorCancel");


const bodyEditorSave =
  $("bodyEditorSave");


const bodyEditorActions =
  bodyEditorSave
    .closest(
      ".body-editor-actions"
    );

/* Sleep 编辑器 */

const sleepEditorBackdrop =
  $("sleepEditorBackdrop");


const sleepEditorTitle =
  $("sleepEditorTitle");


const sleepDateInput =
  $("sleepDateInput");


const sleepOwnerButtons =
  $$(".sleep-owner");


const sleepStartInput =
  $("sleepStartInput");


const sleepEndInput =
  $("sleepEndInput");


const sleepQualityInput =
  $("sleepQualityInput");


const sleepNapInput =
  $("sleepNapInput");


const sleepEditorClose =
  $("sleepEditorClose");


const sleepEditorDelete =
  $("sleepEditorDelete");


const sleepEditorCancel =
  $("sleepEditorCancel");


const sleepEditorSave =
  $("sleepEditorSave");


const sleepEditorActions =
  $("sleepEditorActions");

/* 日历首页当天总览 */

const sheetDateTitle =
  $("sheetDateTitle");


const sheetMilestone =
  $("sheetMilestone");


const sheetTransmissionTimeline =
  $("sheetTransmissionTimeline");


const sheetBody =
  $("sheetBody");


const sheetSleep =
  $("sheetSleep");


const sheetCycle =
  $("sheetCycle");


const sheetSex =
  $("sheetSex");


const dayViewButtons =
  $$(".day-view-button");



/* 大事编辑器 */

const addMilestoneButton =
  $("addMilestoneButton");


const milestoneEditorBackdrop =
  $("milestoneEditorBackdrop");


const milestoneEditorTitle =
  $("milestoneEditorTitle");


const milestoneDateInput =
  $("milestoneDateInput");


const milestoneTitleInput =
  $("milestoneTitleInput");


const milestoneOwnerButtons =
  $$(".milestone-owner");


const milestoneEditorClose =
  $("milestoneEditorClose");


const milestoneEditorCancel =
  $("milestoneEditorCancel");


const milestoneEditorSave =
  $("milestoneEditorSave");



/* 传讯编辑器 */

const addTransmissionButton =
  $("addTransmissionButton");


const transmissionEditorBackdrop =
  $("transmissionEditorBackdrop");


const transmissionEditorTitle =
  $("transmissionEditorTitle");


const transmissionDateInput =
  $("transmissionDateInput");


const transmissionTimeInput =
  $("transmissionTimeInput");


const transmissionTitleInput =
  $("transmissionTitleInput");


const transmissionSourceInput =
  $("transmissionSourceInput");


const transmissionSummaryInput =
  $("transmissionSummaryInput");


const transmissionTypeOptions =
  $$(".transmission-type-option");


const transmissionEditorClose =
  $("transmissionEditorClose");


const transmissionEditorCancel =
  $("transmissionEditorCancel");


const transmissionEditorSave =
  $("transmissionEditorSave");



/* =========================
   App 内左右分页
   ========================= */

calendarTabs.forEach(
  function (
    tab,
    index
  ) {

    tab.addEventListener(
      "click",
      function () {

        calendarPages.scrollTo({

          left:
            calendarPages.clientWidth *
            index,

          behavior:
            "smooth"

        });

      }
    );

  }
);



calendarPages.addEventListener(
  "scroll",
  function () {

    const pageWidth =
      calendarPages.clientWidth;


    if (
      !pageWidth
    ) {

      return;

    }


    const currentPage =
      Math.round(
        calendarPages.scrollLeft /
        pageWidth
      );


    calendarTabs.forEach(
      function (
        tab,
        index
      ) {

        tab.classList.toggle(
          "active",
          index ===
            currentPage
        );

      }
    );

  }
);



/* =========================
   Cycle
   ========================= */

function isValidDateKey(
  value
) {

  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }


  const date =
    dateFromKey(value);


  return (
    !Number.isNaN(date.getTime()) &&
    toDateKey(date) === value
  );

}


function addDaysToKey(
  dateKey,
  offset
) {

  const date =
    dateFromKey(dateKey);


  date.setDate(
    date.getDate() + offset
  );


  return toDateKey(date);

}


function differenceInDays(
  fromKey,
  toKey
) {

  const from =
    dateFromKey(fromKey);

  const to =
    dateFromKey(toKey);


  return Math.round(
    (
      Date.UTC(
        to.getFullYear(),
        to.getMonth(),
        to.getDate()
      ) -
      Date.UTC(
        from.getFullYear(),
        from.getMonth(),
        from.getDate()
      )
    ) / DAY_MS
  );

}


function enumerateDateKeys(
  start,
  end
) {

  if (
    !isValidDateKey(start) ||
    !isValidDateKey(end) ||
    start > end
  ) {
    return [];
  }


  const result = [];
  let cursor = start;


  while (
    cursor <= end &&
    result.length < 400
  ) {
    result.push(cursor);
    cursor = addDaysToKey(
      cursor,
      1
    );
  }


  return result;

}


function createCyclePeriodId() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID ===
      "function"
  ) {
    return (
      "period_" +
      window.crypto.randomUUID()
    );
  }


  return (
    "period_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );

}


function normalizeCycleDay(
  value
) {

  const source =
    value &&
    typeof value === "object"
      ? value
      : {};


  const flowIds = new Set(
    (
      window.LiminalCycleData
        ?.flowOptions || []
    ).map(
      (option) => option.id
    )
  );


  return {
    ...source,
    flow:
      typeof source.flow === "string" &&
      flowIds.has(source.flow)
        ? source.flow
        : "",
    symptoms: Array.isArray(
      source.symptoms
    )
      ? [
          ...new Set(
            source.symptoms.filter(
              (item) =>
                typeof item === "string" &&
                item.trim()
            )
          )
        ]
      : [],
    customSymptoms: Array.isArray(
      source.customSymptoms
    )
      ? [
          ...new Set(
            source.customSymptoms
              .filter(
                (item) =>
                  typeof item === "string" &&
                  item.trim()
              )
              .map(
                (item) => item.trim()
              )
          )
        ]
      : [],
    note:
      typeof source.note === "string"
        ? source.note
        : ""
  };

}


function normalizeCyclePeriod(
  value
) {

  if (
    !value ||
    typeof value !== "object" ||
    !isValidDateKey(value.start) ||
    !isValidDateKey(value.end) ||
    value.start > value.end
  ) {
    return null;
  }


  const sourceDays =
    value.days &&
    typeof value.days === "object"
      ? value.days
      : {};


  const days = {};


  Object.keys(sourceDays)
    .filter(isValidDateKey)
    .forEach(
      function (dateKey) {
        days[dateKey] =
          normalizeCycleDay(
            sourceDays[dateKey]
          );
      }
    );


  return {
    ...value,
    id:
      typeof value.id === "string" &&
      value.id
        ? value.id
        : createCyclePeriodId(),
    start: value.start,
    end: value.end,
    days: days
  };

}


function legacyDatesToPeriods(
  actualPeriod
) {

  const dates = [
    ...new Set(
      (
        Array.isArray(actualPeriod)
          ? actualPeriod
          : []
      ).filter(isValidDateKey)
    )
  ].sort();


  const groups = [];


  dates.forEach(
    function (dateKey) {

      const current =
        groups[groups.length - 1];


      if (
        !current ||
        addDaysToKey(
          current.end,
          1
        ) !== dateKey
      ) {
        groups.push({
          id: createCyclePeriodId(),
          start: dateKey,
          end: dateKey,
          days: {}
        });
        return;
      }


      current.end = dateKey;

    }
  );


  return groups;

}


function averageRounded(
  values,
  fallback
) {

  const valid =
    values.filter(
      (value) =>
        Number.isFinite(value) &&
        value > 0
    );


  return valid.length
    ? Math.round(
        valid.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / valid.length
      )
    : fallback;

}


function getCyclePrediction() {

  const periods =
    (
      calendarData.cycle
        ?.periods || []
    )
      .map(normalizeCyclePeriod)
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.start.localeCompare(b.start)
      );


  if (!periods.length) {
    return null;
  }


  let cycleLength = 28;
  let periodLength = 5;


  if (periods.length >= 2) {

    const intervals = [];


    for (
      let index = 1;
      index < periods.length;
      index += 1
    ) {
      intervals.push(
        differenceInDays(
          periods[index - 1].start,
          periods[index].start
        )
      );
    }


    cycleLength = averageRounded(
      intervals.slice(-6),
      28
    );


    periodLength = averageRounded(
      periods
        .slice(-6)
        .map(
          (period) =>
            differenceInDays(
              period.start,
              period.end
            ) + 1
        ),
      5
    );

  }


  const latest =
    periods[periods.length - 1];


  const nextStart = addDaysToKey(
    latest.start,
    cycleLength
  );


  const nextEnd = addDaysToKey(
    nextStart,
    Math.max(1, periodLength) - 1
  );


  const ovulationDate = addDaysToKey(
    nextStart,
    -14
  );


  return {
    cycleLength: cycleLength,
    periodLength: periodLength,
    nextStart: nextStart,
    nextEnd: nextEnd,
    ovulationDate: ovulationDate,
    fertileStart: addDaysToKey(
      ovulationDate,
      -5
    ),
    fertileEnd: addDaysToKey(
      ovulationDate,
      1
    )
  };

}


function rebuildCycleDerivedFields() {

  const cycle = calendarData.cycle;


  cycle.actualPeriod = [
    ...new Set(
      cycle.periods.flatMap(
        (period) =>
          enumerateDateKeys(
            period.start,
            period.end
          )
      )
    )
  ].sort();


  const prediction =
    getCyclePrediction();


  cycle.predictedPeriod = prediction
    ? enumerateDateKeys(
        prediction.nextStart,
        prediction.nextEnd
      )
    : [];


  cycle.ovulation = prediction
    ? [prediction.ovulationDate]
    : [];


  cycle.fertile = prediction
    ? enumerateDateKeys(
        prediction.fertileStart,
        prediction.fertileEnd
      )
    : [];

}


function initializeCycleData() {

  if (
    !calendarData.cycle ||
    typeof calendarData.cycle !== "object"
  ) {
    calendarData.cycle = {};
  }


  const cycle = calendarData.cycle;


  const existingPeriods =
    Array.isArray(cycle.periods)
      ? cycle.periods
          .map(normalizeCyclePeriod)
          .filter(Boolean)
      : [];


  cycle.periods = existingPeriods.length
    ? existingPeriods
    : legacyDatesToPeriods(
        cycle.actualPeriod
      );


  cycle.customSymptomPresets =
    Array.isArray(
      cycle.customSymptomPresets
    )
      ? [
          ...new Set(
            cycle.customSymptomPresets
              .filter(
                (item) =>
                  typeof item === "string" &&
                  item.trim()
              )
              .map(
                (item) => item.trim()
              )
          )
        ]
      : [];


  rebuildCycleDerivedFields();

}

function dateHasFlag(
  list,
  dateKey
) {

  return (
    Array.isArray(
      list
    ) &&
    list.includes(
      dateKey
    )
  );

}



function getCyclePeriodForDate(
  dateKey
) {

  return (
    calendarData.cycle
      ?.periods || []
  ).find(
    (period) =>
      period.start <= dateKey &&
      period.end >= dateKey
  ) || null;

}


function getCycleDayRecord(
  dateKey
) {

  const period =
    getCyclePeriodForDate(dateKey);


  return period
    ? normalizeCycleDay(
        period.days?.[dateKey]
      )
    : null;

}


function getCycleFlowLabel(
  flowId
) {

  return (
    window.LiminalCycleData
      ?.flowOptions || []
  ).find(
    (option) =>
      option.id === flowId
  )?.label || "";

}


function getCycleSymptomLabel(
  symptomId
) {

  return (
    window.LiminalCycleData
      ?.symptomPresets || []
  ).find(
    (option) =>
      option.id === symptomId
  )?.label || symptomId;

}


function formatCycleShortDate(
  dateKey,
  includeYear = false
) {

  const date = dateFromKey(dateKey);


  return (
    (includeYear
      ? `${date.getFullYear()}年`
      : "") +
    `${date.getMonth() + 1}月` +
    `${date.getDate()}日`
  );

}


function formatCycleDotDate(
  dateKey,
  includeYear = true
) {

  const parts = dateKey.split("-");


  return includeYear
    ? parts.join(".")
    : `${parts[1]}.${parts[2]}`;

}


function getCycleDayLines(
  dateKey,
  label = "经期"
) {

  const period =
    getCyclePeriodForDate(dateKey);


  if (!period) {
    return [];
  }


  const day = normalizeCycleDay(
    period.days?.[dateKey]
  );


  const dayNumber =
    differenceInDays(
      period.start,
      dateKey
    ) + 1;


  const lines = [
    `${label} · 第${dayNumber}天`
  ];


  const flowLabel =
    getCycleFlowLabel(day.flow);


  if (flowLabel) {
    lines.push(`经量 · ${flowLabel}`);
  }


  const symptoms = [
    ...day.symptoms.map(
      getCycleSymptomLabel
    ),
    ...day.customSymptoms
  ];


  if (symptoms.length) {
    lines.push(symptoms.join(" / "));
  }


  return lines;

}


function getCycleText(
  dateKey
) {

  const period =
    getCyclePeriodForDate(dateKey);


  if (period) {

    const lines = getCycleDayLines(
      dateKey,
      "实际经期"
    );


    lines.splice(
      1,
      0,
      `${formatCycleShortDate(period.start)} – ` +
      `${formatCycleShortDate(period.end)}`
    );


    const note =
      getCycleDayRecord(dateKey)
        ?.note.trim();


    if (note) {
      lines.push("", "备注", note);
    }


    return lines.join("\n");

  }


  const prediction =
    getCyclePrediction();


  if (!prediction) {
    return (
      "暂无经期记录\n" +
      "添加历史记录后可生成预测"
    );
  }


  const daysUntil = differenceInDays(
    dateKey,
    prediction.nextStart
  );


  return [
    daysUntil >= 0
      ? `距预计下次经期 ${daysUntil} 天`
      : "当前预测日期已过，请补充最近经期",
    "",
    "预计经期",
    `${formatCycleShortDate(prediction.nextStart)} – ` +
      `${formatCycleShortDate(prediction.nextEnd)}`,
    "",
    "预计排卵",
    formatCycleShortDate(
      prediction.ovulationDate
    )
  ].join("\n");

}



/* =========================
   Sex data helpers
   ========================= */

function initializeSexData() {

  if (
    !calendarData.sex ||
    typeof calendarData.sex !== "object" ||
    Array.isArray(calendarData.sex)
  ) {
    calendarData.sex = {};
  }


  calendarData.sexCustomPositionPresets =
    Array.isArray(
      calendarData.sexCustomPositionPresets
    )
      ? [
          ...new Set(
            calendarData
              .sexCustomPositionPresets
              .filter(
                (item) =>
                  typeof item === "string" &&
                  item.trim()
              )
              .map(
                (item) => item.trim()
              )
          )
        ]
      : [];

}


function createSexRecordId() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID ===
      "function"
  ) {
    return (
      "sex_" +
      window.crypto.randomUUID()
    );
  }


  return (
    "sex_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );

}


function isValidSexTime(
  value
) {

  return (
    typeof value === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(
      value
    )
  );

}


function calculateSexDurationMinutes(
  startTime,
  endTime
) {

  if (
    !isValidSexTime(startTime) ||
    !isValidSexTime(endTime)
  ) {
    return null;
  }


  const [startHour, startMinute] =
    startTime.split(":").map(Number);


  const [endHour, endMinute] =
    endTime.split(":").map(Number);


  const startTotal =
    startHour * 60 + startMinute;


  const endTotal =
    endHour * 60 + endMinute;


  return (
    endTotal >= startTotal
      ? endTotal - startTotal
      : endTotal + 24 * 60 - startTotal
  );

}


function formatSexDuration(
  record
) {

  const calculated =
    calculateSexDurationMinutes(
      record?.time,
      record?.endTime
    );


  const stored =
    Number(record?.durationMinutes);


  const minutes =
    calculated !== null
      ? calculated
      : (
          Number.isInteger(stored) &&
          stored >= 0
            ? stored
            : null
        );


  if (minutes === null) {
    return "";
  }


  if (minutes < 60) {
    return `${minutes}分钟`;
  }


  const hours = Math.floor(
    minutes / 60
  );


  const remainder = minutes % 60;


  return (
    `${hours}h` +
    (remainder ? `${remainder}m` : "")
  );

}


function formatSexTimeRange(
  record
) {

  const startTime =
    isValidSexTime(record?.time)
      ? record.time
      : "";


  const endTime =
    isValidSexTime(record?.endTime)
      ? record.endTime
      : "";


  if (startTime && endTime) {
    return `${startTime}–${endTime}`;
  }


  return startTime || "未记录时间";

}


function getSexCount(
  record
) {

  const value =
    Number(record?.count);


  return (
    Number.isInteger(value) &&
    value > 0
  )
    ? value
    : 1;

}


function resolveSexOptionId(
  options,
  value,
  fallback
) {

  const match = options.find(
    (option) =>
      option.id === value ||
      option.label === value
  );


  return match
    ? match.id
    : fallback;

}


function getSexOptionLabel(
  options,
  value,
  fallback = "未记录"
) {

  const match = options.find(
    (option) =>
      option.id === value ||
      option.label === value
  );


  if (match) {
    return match.label;
  }


  return (
    typeof value === "string" &&
    value.trim()
  )
    ? value.trim()
    : fallback;

}


function getSexFormLabel(
  value
) {

  return getSexOptionLabel(
    window.LiminalSexData
      ?.formOptions || [],
    value
  );

}


function getSexProtectionLabel(
  value
) {

  return getSexOptionLabel(
    window.LiminalSexData
      ?.protectionOptions || [],
    value
  );

}


function getSexProtectionMethodLabel(
  value
) {

  return getSexOptionLabel(
    window.LiminalSexData
      ?.protectionMethods || [],
    value,
    ""
  );

}


function getSexPositionLabel(
  value
) {

  return getSexOptionLabel(
    window.LiminalSexData
      ?.positionPresets || [],
    value,
    value
  );

}


function getSexLocationLabel(
  record
) {

  if (
    record?.location === "other" &&
    typeof record.customLocation === "string" &&
    record.customLocation.trim()
  ) {
    return record.customLocation.trim();
  }


  return getSexOptionLabel(
    window.LiminalSexData
      ?.locationOptions || [],
    record?.location,
    ""
  );

}


function normalizeSexStringList(
  value
) {

  return [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .filter(
          (item) =>
            typeof item === "string" &&
            item.trim()
        )
        .map((item) => item.trim())
    )
  ];

}


function normalizeSexPresetList(
  value,
  options
) {

  const recognized = [];
  const custom = [];


  normalizeSexStringList(value).forEach(
    function (item) {

      const match = options.find(
        (option) =>
          option.id === item ||
          option.label === item
      );


      if (match) {
        recognized.push(match.id);
      } else {
        custom.push(item);
      }

    }
  );


  return {
    recognized: [
      ...new Set(recognized)
    ],
    custom: [
      ...new Set(custom)
    ]
  };

}


function normalizeSexRating(
  value
) {

  const number = Number(value);


  return (
    Number.isInteger(number) &&
    number >= 1 &&
    number <= 5
  )
    ? number
    : "";

}


function normalizeSexOrgasmCount(
  value
) {

  const number = Number(value);


  return (
    Number.isInteger(number) &&
    number >= 0
  )
    ? number
    : 0;

}


function sexRecordHasDetails(
  record
) {

  if (!record || typeof record !== "object") {
    return false;
  }


  return [
    "endTime",
    "durationMinutes",
    "location",
    "customLocation",
    "initiator",
    "orgasms",
    "aids",
    "customAids",
    "comfort",
    "satisfaction",
    "moodBefore",
    "moodAfter"
  ].some(
    (key) =>
      Object.prototype.hasOwnProperty.call(
        record,
        key
      )
  );

}


function normalizeSexRecordForEditor(
  value
) {

  const source =
    value &&
    typeof value === "object"
      ? value
      : {};


  const formOptions =
    window.LiminalSexData
      ?.formOptions || [];


  const protectionOptions =
    window.LiminalSexData
      ?.protectionOptions || [];


  const methodOptions =
    window.LiminalSexData
      ?.protectionMethods || [];


  const positionOptions =
    window.LiminalSexData
      ?.positionPresets || [];


  const normalizedPositions =
    normalizeSexPresetList(
      source.positions,
      positionOptions
    );


  const aidOptions =
    window.LiminalSexData
      ?.aidPresets || [];


  const normalizedAids =
    normalizeSexPresetList(
      source.aids,
      aidOptions
    );


  const beforeOptions =
    window.LiminalSexData
      ?.moodBeforePresets || [];


  const normalizedMoodBefore =
    normalizeSexPresetList(
      source.moodBefore,
      beforeOptions
    );


  const afterOptions =
    window.LiminalSexData
      ?.moodAfterPresets || [];


  const normalizedMoodAfter =
    normalizeSexPresetList(
      source.moodAfter,
      afterOptions
    );


  const protection =
    resolveSexOptionId(
      protectionOptions,
      source.protection,
      "na"
    );


  const endTime =
    isValidSexTime(source.endTime)
      ? source.endTime
      : "";


  const calculatedDuration =
    calculateSexDurationMinutes(
      source.time,
      endTime
    );


  const storedDuration =
    Number(source.durationMinutes);


  const location =
    resolveSexOptionId(
      window.LiminalSexData
        ?.locationOptions || [],
      source.location,
      ""
    );


  const initiator =
    resolveSexOptionId(
      window.LiminalSexData
        ?.initiatorOptions || [],
      source.initiator,
      ""
    );


  return {
    ...source,
    id:
      typeof source.id === "string" &&
      source.id
        ? source.id
        : createSexRecordId(),
    time: isValidSexTime(source.time)
      ? source.time
      : "",
    endTime: endTime,
    durationMinutes:
      calculatedDuration !== null
        ? calculatedDuration
        : (
            Number.isInteger(storedDuration) &&
            storedDuration >= 0
              ? storedDuration
              : null
          ),
    count: getSexCount(source),
    form: resolveSexOptionId(
      formOptions,
      source.form,
      "other"
    ),
    protection: protection,
    protectionMethod:
      protection === "yes"
        ? resolveSexOptionId(
            methodOptions,
            source.protectionMethod,
            "other"
          )
        : "",
    positions: [
      ...normalizedPositions.recognized
    ],
    customPositions: [
      ...new Set([
        ...normalizeSexStringList(
          source.customPositions
        ),
        ...normalizedPositions.custom
      ])
    ],
    location: location,
    customLocation:
      typeof source.customLocation === "string"
        ? source.customLocation
        : "",
    initiator: initiator,
    orgasms: {
      keshi: normalizeSexOrgasmCount(
        source.orgasms?.keshi
      ),
      luzhen: normalizeSexOrgasmCount(
        source.orgasms?.luzhen
      )
    },
    aids: normalizedAids.recognized,
    customAids: [
      ...new Set([
        ...normalizeSexStringList(
          source.customAids
        ),
        ...normalizedAids.custom
      ])
    ],
    comfort: normalizeSexRating(
      source.comfort
    ),
    satisfaction: normalizeSexRating(
      source.satisfaction
    ),
    moodBefore: [
      ...normalizedMoodBefore.recognized,
      ...normalizedMoodBefore.custom
    ],
    moodAfter: [
      ...normalizedMoodAfter.recognized,
      ...normalizedMoodAfter.custom
    ],
    note:
      typeof source.note === "string"
        ? source.note
        : ""
  };

}


function getSexRecords(
  dateKey
) {

  const records =
    calendarData.sex?.[dateKey];


  return Array.isArray(records)
    ? records
    : [];

}


function getSortedSexEntries(
  dateKey
) {

  return getSexRecords(dateKey)
    .map(
      (record, index) => ({
        record: record,
        index: index
      })
    )
    .sort(
      function (a, b) {

        const aTime =
          isValidSexTime(a.record.time)
            ? a.record.time
            : "99:99";


        const bTime =
          isValidSexTime(b.record.time)
            ? b.record.time
            : "99:99";


        return (
          aTime.localeCompare(bTime) ||
          a.index - b.index
        );

      }
    );

}


function getSexTotalCount(
  dateKey
) {

  return getSexRecords(dateKey)
    .reduce(
      (total, record) =>
        total + getSexCount(record),
      0
    );

}


/* =========================
   月历
   ========================= */

function renderMonth() {

  monthYearLabel.textContent =
    viewYear;


  monthTitle.textContent =
    monthNames[
      viewMonth
    ];


  monthGrid.innerHTML =
    "";


  const firstDay =
    new Date(
      viewYear,
      viewMonth,
      1
    );


  const mondayOffset =
    (
      firstDay.getDay() +
      6
    ) % 7;


  const gridStart =
    new Date(
      viewYear,
      viewMonth,
      1 -
        mondayOffset
    );


  for (
    let index = 0;
    index < 42;
    index += 1
  ) {

    const date =
      new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() +
          index
      );


    const dateKey =
      toDateKey(
        date
      );


    const button =
      make(
        "button",
        "calendar-day"
      );


    button.type =
      "button";


    if (
      date.getMonth() !==
        viewMonth
    ) {

      button.classList.add(
        "other-month"
      );

    }


    if (
      sameDate(
        date,
        today
      )
    ) {

      button.classList.add(
        "today"
      );

    }


    if (
      sameDate(
        date,
        selectedDate
      )
    ) {

      button.classList.add(
        "selected"
      );

    }


    if (
      dateHasFlag(
        calendarData.cycle
          ?.predictedPeriod,
        dateKey
      )
    ) {

      button.classList.add(
        "predicted-period-day"
      );

    }


    if (
      dateHasFlag(
        calendarData.cycle
          ?.fertile,
        dateKey
      )
    ) {

      button.classList.add(
        "fertile-day"
      );

    }


    if (
      dateHasFlag(
        calendarData.cycle
          ?.ovulation,
        dateKey
      )
    ) {

      button.classList.add(
        "ovulation-day"
      );

    }



    /* 日期数字 */

    button.appendChild(

      make(
        "span",
        "day-number",
        String(
          date.getDate()
        )
      )

    );



    /* 当天第一条大事 */

    const milestones =
      calendarData.milestones
        ?.[dateKey] ||
      [];


    button.appendChild(

      make(
        "span",
        "day-event",

        milestones[0]
          ?.title ||
          ""
      )

    );



    /*
      状态行：

      粉点 = 经期
      紫点 = 每次 Sex
      ✦ = 当天有传讯
    */

    const dots =
      make(
        "span",
        "day-dots"
      );


    if (
      dateHasFlag(
        calendarData.cycle
          ?.actualPeriod,
        dateKey
      )
    ) {

      dots.appendChild(

        make(
          "i",
          "period-dot"
        )

      );

    }



    const sexRecords =
      calendarData.sex
        ?.[dateKey] ||
      [];


    const sexCount =
      Array.isArray(
        sexRecords
      )
        ? sexRecords.reduce(
            function (
              total,
              record
            ) {

              return (
                total +
                getSexCount(record)
              );

            },
            0
          )

        : 0;



    for (
      let sexIndex = 0;
      sexIndex < sexCount;
      sexIndex += 1
    ) {

      dots.appendChild(

        make(
          "i",
          "sex-dot"
        )

      );

    }



    const hasTransmission =
      Array.isArray(
        calendarData.transmissions
      ) &&
      calendarData.transmissions
        .some(
          function (
            record
          ) {

            return (
              record.date ===
              dateKey
            );

          }
        );


    if (
      hasTransmission
    ) {

      dots.appendChild(

        make(
          "span",
          "transmission-mark",
          "✦"
        )

      );

    }


    button.appendChild(
      dots
    );



    /*
      选日期。

      这里统一修改 selectedDate。

      因此：
      首页总览
      日程
      记录

      都会一起切换。
    */

    button.addEventListener(
      "click",
      function () {

        selectedDate =
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );


        if (
          date.getMonth() !==
            viewMonth ||
          date.getFullYear() !==
            viewYear
        ) {

          viewYear =
            date.getFullYear();


          viewMonth =
            date.getMonth();

        }


        renderAll();

      }
    );


    monthGrid.appendChild(
      button
    );

  }

}



/* =========================
   日程
   ========================= */

function renderSchedule() {

  const dateKey =
    toDateKey(
      selectedDate
    );


  scheduleDateTitle.textContent =
    formatDateTitle(
      selectedDate
    );


  const sourceRows =
    calendarData.schedule
      ?.[dateKey] ||
    [];


  scheduleList.innerHTML =
    "";


  if (
    !sourceRows.length
  ) {

    scheduleList.appendChild(

      make(
        "div",
        "schedule-empty",
        "这一天暂时没有时间安排"
      )

    );


    return;

  }



  /*
    底层数据仍沿用旧结构，
    但显示时拆成两个人的独立事件。
  */

  const keshiEvents =
    [];


  const luzhenEvents =
    [];


  sourceRows.forEach(
    function (
      row,
      rowIndex
    ) {

      if (
        row.keshiTime &&
        row.keshi
      ) {

        keshiEvents.push({

          time:
            row.keshiTime,

          endTime:
            row.keshiEndTime ||
            "",

          title:
            row.keshi,

          rowIndex:
            rowIndex,

          owner:
            "keshi"

        });

      }


      if (
        row.luzhenTime &&
        row.luzhen
      ) {

        luzhenEvents.push({

          time:
            row.luzhenTime,

          endTime:
            row.luzhenEndTime ||
            "",

          title:
            row.luzhen,

          rowIndex:
            rowIndex,

          owner:
            "luzhen"

        });

      }

    }
  );



  const allTimes =
    [
      ...keshiEvents.map(
        event =>
          event.time
      ),

      ...luzhenEvents.map(
        event =>
          event.time
      )
    ];


  const uniqueTimes =
    [
      ...new Set(
        allTimes
      )
    ];


  uniqueTimes.sort(
    function (
      a,
      b
    ) {

      return (
        a.localeCompare(
          b
        )
      );

    }
  );



  if (
    !uniqueTimes.length
  ) {

    scheduleList.appendChild(

      make(
        "div",
        "schedule-empty",
        "这一天暂时没有时间安排"
      )

    );


    return;

  }



  function appendScheduleEvent(
    container,
    event
  ) {

    const item =
      make(
        "div",
        "schedule-event"
      );


    item.tabIndex =
      0;


    item.setAttribute(
      "role",
      "button"
    );


    item.appendChild(

      make(
        "strong",
        "schedule-event-title",
        event.title
      )

    );


    if (
      event.endTime
    ) {

      item.appendChild(

        make(
          "span",
          "schedule-event-range",
          `${event.time}–${event.endTime}`
        )

      );

    }


    function editThisEvent() {

      openScheduleEditor({

        dateKey:
          dateKey,

        rowIndex:
          event.rowIndex,

        owner:
          event.owner

      });

    }


    item.addEventListener(
      "click",
      editThisEvent
    );


    item.addEventListener(
      "keydown",
      function (
        keyboardEvent
      ) {

        if (
          keyboardEvent.key ===
            "Enter" ||
          keyboardEvent.key ===
            " "
        ) {

          keyboardEvent.preventDefault();

          editThisEvent();

        }

      }
    );


    container.appendChild(
      item
    );

  }



  uniqueTimes.forEach(
    function (
      time
    ) {

      const row =
        make(
          "div",
          "schedule-row"
        );


      const keshiAtTime =
        keshiEvents.filter(
          function (
            event
          ) {

            return (
              event.time ===
              time
            );

          }
        );


      const luzhenAtTime =
        luzhenEvents.filter(
          function (
            event
          ) {

            return (
              event.time ===
              time
            );

          }
        );


      const leftTime =
        make(
          "span",
          "schedule-time",
          time
        );


      const keshiCell =
        make(
          "div",
          "schedule-item keshi"
        );


      keshiAtTime.forEach(
        function (
          event
        ) {

          appendScheduleEvent(
            keshiCell,
            event
          );

        }
      );


      const luzhenCell =
        make(
          "div",
          "schedule-item luzhen"
        );


      luzhenAtTime.forEach(
        function (
          event
        ) {

          appendScheduleEvent(
            luzhenCell,
            event
          );

        }
      );


      const rightTime =
        make(
          "span",
          "schedule-time",
          time
        );


      row.append(
        leftTime,
        keshiCell,
        luzhenCell,
        rightTime
      );


      scheduleList.appendChild(
        row
      );

    }
  );

}



/* =========================
   日程新增 / 编辑 / 删除
   ========================= */

function setScheduleEditorOwner(
  owner
) {

  scheduleEditorOwner =
    owner ===
      "luzhen"
      ? "luzhen"
      : "keshi";


  scheduleOwnerButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.scheduleOwner ===
          scheduleEditorOwner
      );

    }
  );

}



function getScheduleEvent(
  target
) {

  if (
    !target
  ) {

    return null;

  }


  const rows =
    calendarData.schedule
      ?.[target.dateKey];


  if (
    !Array.isArray(
      rows
    )
  ) {

    return null;

  }


  const row =
    rows[
      target.rowIndex
    ];


  if (
    !row
  ) {

    return null;

  }


  if (
    target.owner ===
      "luzhen"
  ) {

    return {

      title:
        row.luzhen ||
        "",

      startTime:
        row.luzhenTime ||
        "",

      endTime:
        row.luzhenEndTime ||
        ""

    };

  }


  return {

    title:
      row.keshi ||
      "",

    startTime:
      row.keshiTime ||
      "",

    endTime:
      row.keshiEndTime ||
      ""

  };

}



function createScheduleRow(
  owner,
  title,
  startTime,
  endTime
) {

  const row = {

    keshiTime:
      "",

    keshiEndTime:
      "",

    keshi:
      "",

    luzhenTime:
      "",

    luzhenEndTime:
      "",

    luzhen:
      ""

  };


  if (
    owner ===
      "luzhen"
  ) {

    row.luzhenTime =
      startTime;

    row.luzhenEndTime =
      endTime;

    row.luzhen =
      title;

  } else {

    row.keshiTime =
      startTime;

    row.keshiEndTime =
      endTime;

    row.keshi =
      title;

  }


  return row;

}



function removeScheduleEvent(
  target
) {

  if (
    !target
  ) {

    return;

  }


  const rows =
    calendarData.schedule
      ?.[target.dateKey];


  if (
    !Array.isArray(
      rows
    )
  ) {

    return;

  }


  const row =
    rows[
      target.rowIndex
    ];


  if (
    !row
  ) {

    return;

  }


  if (
    target.owner ===
      "luzhen"
  ) {

    row.luzhenTime =
      "";

    row.luzhenEndTime =
      "";

    row.luzhen =
      "";

  } else {

    row.keshiTime =
      "";

    row.keshiEndTime =
      "";

    row.keshi =
      "";

  }


  const hasKeshi =
    Boolean(
      row.keshiTime ||
      row.keshiEndTime ||
      row.keshi
    );


  const hasLuzhen =
    Boolean(
      row.luzhenTime ||
      row.luzhenEndTime ||
      row.luzhen
    );


  if (
    !hasKeshi &&
    !hasLuzhen
  ) {

    rows.splice(
      target.rowIndex,
      1
    );

  }


  if (
    !rows.length
  ) {

    delete calendarData
      .schedule[
        target.dateKey
      ];

  }

}



function openScheduleEditor(
  target =
    null
) {

  editingSchedule =
    target;


  const event =
    getScheduleEvent(
      target
    );


  if (
    target &&
    event
  ) {

    scheduleEditorTitle.textContent =
      "编辑日程";


    scheduleDateInput.value =
      target.dateKey;


    scheduleTitleInput.value =
      event.title;


    scheduleStartTimeInput.value =
      event.startTime;


    scheduleEndTimeInput.value =
      event.endTime;


    setScheduleEditorOwner(
      target.owner
    );


    scheduleEditorDelete.hidden =
      false;


    scheduleEditorActions
      .classList.add(
        "editing"
      );

  } else {

    editingSchedule =
      null;


    scheduleEditorTitle.textContent =
      "添加日程";


    scheduleDateInput.value =
      toDateKey(
        selectedDate
      );


    scheduleTitleInput.value =
      "";


    scheduleStartTimeInput.value =
      "";


    scheduleEndTimeInput.value =
      "";


    setScheduleEditorOwner(
      "keshi"
    );


    scheduleEditorDelete.hidden =
      true;


    scheduleEditorActions
      .classList.remove(
        "editing"
      );

  }


  scheduleEditorBackdrop.hidden =
    false;


  setTimeout(
    function () {

      scheduleTitleInput.focus();

    },
    50
  );

}



function closeScheduleEditor() {

  scheduleEditorBackdrop.hidden =
    true;


  editingSchedule =
    null;

}



addScheduleButton.addEventListener(
  "click",
  function () {

    openScheduleEditor();

  }
);



scheduleOwnerButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setScheduleEditorOwner(
          button.dataset.scheduleOwner
        );

      }
    );

  }
);



scheduleEditorClose.addEventListener(
  "click",
  closeScheduleEditor
);



scheduleEditorCancel.addEventListener(
  "click",
  closeScheduleEditor
);



scheduleEditorBackdrop.addEventListener(
  "click",
  function (
    event
  ) {

    if (
      event.target ===
        scheduleEditorBackdrop
    ) {

      closeScheduleEditor();

    }

  }
);



scheduleEditorDelete.addEventListener(
  "click",
  function () {

    if (
      !editingSchedule
    ) {

      return;

    }


    const event =
      getScheduleEvent(
        editingSchedule
      );


    if (
      !event
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `删除「${
          event.title ||
          "这条日程"
        }」吗？`
      );


    if (
      !confirmed
    ) {

      return;

    }


    removeScheduleEvent(
      editingSchedule
    );


    saveCalendarData();

    closeScheduleEditor();

    renderAll();

  }
);



scheduleEditorSave.addEventListener(
  "click",
  function () {

    const dateKey =
      scheduleDateInput.value;


    const title =
      scheduleTitleInput
        .value
        .trim();


    const startTime =
      scheduleStartTimeInput
        .value;


    const endTime =
      scheduleEndTimeInput
        .value;


    if (
      !dateKey ||
      !title ||
      !startTime
    ) {

      return;

    }


    if (
      endTime &&
      endTime <
        startTime
    ) {

      window.alert(
        "结束时间不能早于开始时间。"
      );


      return;

    }


    if (
      !calendarData.schedule
    ) {

      calendarData.schedule =
        {};

    }


    if (
      editingSchedule
    ) {

      removeScheduleEvent(
        editingSchedule
      );

    }


    if (
      !Array.isArray(
        calendarData.schedule[
          dateKey
        ]
      )
    ) {

      calendarData.schedule[
        dateKey
      ] =
        [];

    }


    calendarData.schedule[
      dateKey
    ].push(

      createScheduleRow(
        scheduleEditorOwner,
        title,
        startTime,
        endTime
      )

    );


    selectedDate =
      dateFromKey(
        dateKey
      );


    viewYear =
      selectedDate
        .getFullYear();


    viewMonth =
      selectedDate
        .getMonth();


    saveCalendarData();

    closeScheduleEditor();

    renderAll();

  }
);



/* =========================
   大事总时间线
   ========================= */

function normalizeMilestoneOwner(
  owner
) {

  if (
    owner === "luzhen" ||
    owner === "both"
  ) {

    return owner;

  }


  return "keshi";

}



function milestoneOwnerIncludes(
  owner,
  person
) {

  const normalizedOwner =
    normalizeMilestoneOwner(
      owner
    );


  return (
    normalizedOwner ===
      "both" ||
    normalizedOwner ===
      person
  );

}



function toggleMilestoneOwner(
  owner,
  person
) {

  const normalizedOwner =
    normalizeMilestoneOwner(
      owner
    );


  if (
    person === "keshi"
  ) {

    if (
      normalizedOwner ===
        "keshi"
    ) {

      return normalizedOwner;

    }


    return (
      normalizedOwner ===
        "both"
        ? "luzhen"
        : "both"
    );

  }


  if (
    person === "luzhen"
  ) {

    if (
      normalizedOwner ===
        "luzhen"
    ) {

      return normalizedOwner;

    }


    return (
      normalizedOwner ===
        "both"
        ? "keshi"
        : "both"
    );

  }


  return normalizedOwner;

}

function renderTimeline() {

  const events =
    [];


  let sourceIndex =
    0;


  Object.entries(
    calendarData.milestones ||
      {}
  ).forEach(
    function (
      [
        dateKey,
        items
      ]
    ) {

      items.forEach(
        function (
          item
        ) {

          events.push({

            dateKey:
              dateKey,

            title:
              item.title,

            owner:
              normalizeMilestoneOwner(
                item.owner
              ),

            sourceIndex:
              sourceIndex

          });


          sourceIndex +=
            1;

        }
      );

    }
  );


  events.sort(
    function (
      a,
      b
    ) {

      return (
        a.dateKey.localeCompare(
          b.dateKey
        ) ||
        a.sourceIndex -
          b.sourceIndex
      );

    }
  );


  timelineList.innerHTML =
    "";


  const heading =
    make(
      "div",
      "dual-timeline-head"
    );


  heading.append(

    make(
      "span",
      "",
      "Keshi"
    ),

    make(
      "span",
      "",
      "榛榛"
    )

  );


  timelineList.appendChild(
    heading
  );


  const grid =
    make(
      "div",
      "dual-timeline-grid"
    );


  const eventRows =
    make(
      "div",
      "timeline-event-rows"
    );



  function renderLane(
    lane,
    laneEvents,
    side
  ) {


    laneEvents.forEach(
      function (
        event
      ) {

        const date =
          dateFromKey(
            event.dateKey
          );


        const item =
          make(
            "article",
            `lane-event ${side}`
          );


        const dot =
          make(
            "span",
            "lane-dot"
          );


        const content =
          make(
            "div",
            "lane-content"
          );


        const title =
          make(
            "strong",
            "",
            event.title
          );


        const dateText =
          make(
            "span",
            "",

            (
              `${date.getFullYear()} · ` +
              `${padNumber(
                date.getMonth() + 1
              )}.` +
              `${padNumber(
                date.getDate()
              )}`
            )
          );


        const actions =
          make(
            "div",
            "lane-actions"
          );


        const editButton =
          make(
            "button",
            "edit-milestone",
            "编辑"
          );


        editButton.type =
          "button";


        const deleteButton =
          make(
            "button",
            "delete-milestone",
            "删除"
          );


        deleteButton.type =
          "button";


        editButton.addEventListener(
          "click",
          function () {

            editMilestone(
              event
            );

          }
        );


        deleteButton.addEventListener(
          "click",
          function () {

            deleteMilestone(
              event
            );

          }
        );


        actions.append(
          editButton,
          deleteButton
        );


        content.append(
          title,
          dateText,
          actions
        );


        if (
          side ===
          "left"
        ) {

          item.append(
            dot,
            content
          );

        } else {

          item.append(
            content,
            dot
          );

        }


        const row =
          make(
            "div",
            `timeline-row ${side}`
          );


        row.appendChild(
          item
        );


        lane.appendChild(
          row
        );

      }
    );

  }


  function renderSharedEvent(
    container,
    event
  ) {

    const date =
      dateFromKey(
        event.dateKey
      );


    const item =
      make(
        "article",
        "shared-timeline-event"
      );


    const line =
      make(
        "div",
        "shared-timeline-line"
      );


    line.setAttribute(
      "aria-hidden",
      "true"
    );


    line.append(

      make(
        "span",
        "shared-timeline-dot left"
      ),

      make(
        "span",
        "shared-timeline-dot right"
      )

    );


    const content =
      make(
        "div",
        "shared-timeline-content"
      );


    const title =
      make(
        "strong",
        "",
        event.title
      );


    const dateText =
      make(
        "span",
        "shared-timeline-date",

        (
          `${date.getFullYear()} · ` +
          `${padNumber(
            date.getMonth() + 1
          )}.` +
          `${padNumber(
            date.getDate()
          )}`
        )
      );


    const actions =
      make(
        "div",
        "lane-actions shared-timeline-actions"
      );


    const editButton =
      make(
        "button",
        "edit-milestone",
        "编辑"
      );


    editButton.type =
      "button";


    const deleteButton =
      make(
        "button",
        "delete-milestone",
        "删除"
      );


    deleteButton.type =
      "button";


    editButton.addEventListener(
      "click",
      function () {

        editMilestone(
          event
        );

      }
    );


    deleteButton.addEventListener(
      "click",
      function () {

        deleteMilestone(
          event
        );

      }
    );


    actions.append(
      editButton,
      deleteButton
    );


    content.append(
      title,
      line,
      dateText,
      actions
    );


    item.appendChild(
      content
    );


    container.appendChild(
      item
    );

  }


  if (
    !events.length
  ) {

    eventRows.appendChild(

      make(
        "div",
        "timeline-empty",
        "暂无大事"
      )

    );

  }


  events.forEach(
    function (
      event
    ) {

      if (
        event.owner ===
          "both"
      ) {

        renderSharedEvent(
          eventRows,
          event
        );


        return;

      }


      renderLane(
        eventRows,
        [event],

        event.owner ===
          "luzhen"
          ? "right"
          : "left"
      );

    }
  );


  grid.appendChild(
    eventRows
  );


  timelineList.appendChild(
    grid
  );

}



/* =========================
   传讯总时间线
   ========================= */

function renderTransmissionTimeline() {

  const allRecords =
    Array.isArray(
      calendarData.transmissions
    )
      ? [
          ...calendarData.transmissions
        ]
      : [];


  const records =
    transmissionFilter ===
      "all"

      ? allRecords

      : allRecords.filter(
          function (
            record
          ) {

            return (
              record.type ===
              transmissionFilter
            );

          }
        );


  /*
    跨日期总时间线：

    最新的在最上面。
  */

  records.sort(
    function (
      a,
      b
    ) {

      const aKey =
        `${a.date}T${
          a.time ||
          "00:00"
        }`;


      const bKey =
        `${b.date}T${
          b.time ||
          "00:00"
        }`;


      return (
        bKey.localeCompare(
          aKey
        )
      );

    }
  );


  transmissionTimelineList
    .innerHTML =
      "";


  if (
    !records.length
  ) {

    transmissionTimelineList
      .appendChild(

        make(
          "div",
          "transmission-empty",
          "这个分类暂时没有传讯记录"
        )

      );


    return;

  }


  const typeNames = {

    tarot:
      "塔罗",

    mediumship:
      "通灵",

    other:
      "其他"

  };


  records.forEach(
    function (
      record
    ) {

      const item =
        make(
          "article",
          "transmission-item"
        );


      const track =
        make(
          "div",
          "transmission-track"
        );


      track.appendChild(

        make(
          "span",
          "transmission-dot"
        )

      );


      const content =
        make(
          "div",
          "transmission-content"
        );


      const meta =
        make(
          "div",
          "transmission-meta"
        );


      meta.append(

        make(
          "span",
          "transmission-date",

          (
            record.date +
            (
              record.time
                ? ` · ${record.time}`
                : ""
            )
          )
        ),


        make(
          "span",
          "transmission-type",

          typeNames[
            record.type
          ] ||
            "其他"
        )

      );


      content.append(

        meta,


        make(
          "strong",
          "",
          record.title ||
            "未命名传讯"
        )

      );


      if (
        record.summary
      ) {

        content.appendChild(

          make(
            "p",
            "transmission-summary",
            record.summary
          )

        );

      }


      if (
        record.source
      ) {

        content.appendChild(

          make(
            "span",
            "transmission-source",
            `来源 · ${record.source}`
          )

        );

      }


      const actions =
        make(
          "div",
          "transmission-actions"
        );


      const editButton =
        make(
          "button",
          "edit-transmission",
          "编辑"
        );


      editButton.type =
        "button";


      const deleteButton =
        make(
          "button",
          "delete-transmission",
          "删除"
        );


      deleteButton.type =
        "button";


      editButton.addEventListener(
        "click",
        function () {

          openTransmissionEditor(
            record
          );

        }
      );


      deleteButton.addEventListener(
        "click",
        function () {

          deleteTransmission(
            record
          );

        }
      );


      actions.append(
        editButton,
        deleteButton
      );


      content.appendChild(
        actions
      );


      item.append(
        track,
        content
      );


      transmissionTimelineList
        .appendChild(
          item
        );

    }
  );

}



/* =========================
   时间线：大事 / 传讯
   ========================= */

function setTimelineMode(
  mode
) {

  timelineMode =
    mode ===
      "transmission"
      ? "transmission"
      : "milestone";


  timelineModeButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.timelineMode ===
          timelineMode
      );

    }
  );


  milestoneTimelinePanel.hidden =
    timelineMode !==
      "milestone";


  transmissionTimelinePanel.hidden =
    timelineMode !==
      "transmission";

}



timelineModeButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setTimelineMode(
          button.dataset.timelineMode
        );

      }
    );

  }
);



/* =========================
   传讯分类筛选
   ========================= */

function setTransmissionFilter(
  filter
) {

  const allowed = [
    "all",
    "tarot",
    "mediumship",
    "other"
  ];


  transmissionFilter =
    allowed.includes(
      filter
    )
      ? filter
      : "all";


  transmissionFilterButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.transmissionFilter ===
          transmissionFilter
      );

    }
  );


  renderTransmissionTimeline();

}



transmissionFilterButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setTransmissionFilter(
          button.dataset.transmissionFilter
        );

      }
    );

  }
);



/* =========================
   大事新增 / 编辑
   ========================= */

function setMilestoneOwner(
  owner
) {

  milestoneEditorOwner =
    normalizeMilestoneOwner(
      owner
    );


  milestoneOwnerButtons.forEach(
    function (
      button
    ) {

      const isActive =
        milestoneOwnerIncludes(
          milestoneEditorOwner,
          button.dataset.owner
        );


      button.classList.toggle(
        "active",
        isActive
      );


      button.setAttribute(
        "aria-pressed",
        String(
          isActive
        )
      );

    }
  );

}



function openMilestoneEditor(
  event = null
) {

  editingMilestone =
    event;


  if (
    event
  ) {

    milestoneEditorTitle.textContent =
      "编辑大事";


    milestoneDateInput.value =
      event.dateKey;


    milestoneTitleInput.value =
      event.title;


    setMilestoneOwner(
      event.owner
    );

  } else {

    milestoneEditorTitle.textContent =
      "添加大事";


    milestoneDateInput.value =
      toDateKey(
        selectedDate
      );


    milestoneTitleInput.value =
      "";


    setMilestoneOwner(
      "keshi"
    );

  }


  milestoneEditorBackdrop.hidden =
    false;

}



function closeMilestoneEditor() {

  milestoneEditorBackdrop.hidden =
    true;


  editingMilestone =
    null;

}



function editMilestone(
  event
) {

  openMilestoneEditor(
    event
  );

}



function deleteMilestone(
  event
) {

  const confirmed =
    window.confirm(
      `删除「${event.title}」吗？`
    );


  if (
    !confirmed
  ) {

    return;

  }


  const items =
    calendarData.milestones
      ?.[event.dateKey];


  if (
    !Array.isArray(
      items
    )
  ) {

    return;

  }


  const index =
    items.findIndex(
      function (
        item
      ) {

        return (
          item.title ===
            event.title &&

          normalizeMilestoneOwner(
            item.owner
          ) ===
            normalizeMilestoneOwner(
              event.owner
            )
        );

      }
    );


  if (
    index ===
      -1
  ) {

    return;

  }


  items.splice(
    index,
    1
  );


  if (
    !items.length
  ) {

    delete calendarData
      .milestones[
        event.dateKey
      ];

  }


  saveCalendarData();

  renderAll();

}



addMilestoneButton.addEventListener(
  "click",
  function () {

    openMilestoneEditor();

  }
);



milestoneOwnerButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setMilestoneOwner(

          toggleMilestoneOwner(
            milestoneEditorOwner,
            button.dataset.owner
          )

        );

      }
    );

  }
);



milestoneEditorClose.addEventListener(
  "click",
  closeMilestoneEditor
);



milestoneEditorCancel.addEventListener(
  "click",
  closeMilestoneEditor
);



milestoneEditorBackdrop.addEventListener(
  "click",
  function (
    event
  ) {

    if (
      event.target ===
        milestoneEditorBackdrop
    ) {

      closeMilestoneEditor();

    }

  }
);



milestoneEditorSave.addEventListener(
  "click",
  function () {

    const dateKey =
      milestoneDateInput.value;


    const title =
      milestoneTitleInput
        .value
        .trim();


    if (
      !dateKey ||
      !title
    ) {

      return;

    }


    if (
      !calendarData.milestones
    ) {

      calendarData.milestones =
        {};

    }



    if (
      editingMilestone
    ) {

      const oldItems =
        calendarData.milestones
          ?.[
            editingMilestone
              .dateKey
          ];


      if (
        Array.isArray(
          oldItems
        )
      ) {

        const oldIndex =
          oldItems.findIndex(
            function (
              item
            ) {

              return (
                item.title ===
                  editingMilestone.title &&

                normalizeMilestoneOwner(
                  item.owner
                ) ===
                  normalizeMilestoneOwner(
                    editingMilestone.owner
                  )
              );

            }
          );


        if (
          oldIndex !==
            -1
        ) {

          oldItems.splice(
            oldIndex,
            1
          );

        }


        if (
          !oldItems.length
        ) {

          delete calendarData
            .milestones[
              editingMilestone
                .dateKey
            ];

        }

      }

    }



    if (
      !Array.isArray(
        calendarData
          .milestones[
            dateKey
          ]
      )
    ) {

      calendarData
        .milestones[
          dateKey
        ] =
          [];

    }


    calendarData
      .milestones[
        dateKey
      ]
      .push({

        title:
          title,

        owner:
          normalizeMilestoneOwner(
            milestoneEditorOwner
          )

      });


    saveCalendarData();

    closeMilestoneEditor();

    renderAll();

  }
);



/* =========================
   传讯新增 / 编辑 / 删除
   ========================= */

function createTransmissionId() {

  if (
    window.crypto &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return (
      `transmission_${crypto.randomUUID()}`
    );

  }


  return (
    "transmission_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );

}



function setTransmissionEditorType(
  type
) {

  const allowed = [
    "tarot",
    "mediumship",
    "other"
  ];


  transmissionEditorType =
    allowed.includes(
      type
    )
      ? type
      : "other";


  transmissionTypeOptions.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.transmissionType ===
          transmissionEditorType
      );

    }
  );

}



function openTransmissionEditor(
  record = null
) {

  editingTransmission =
    record;


  if (
    record
  ) {

    transmissionEditorTitle.textContent =
      "编辑传讯";


    transmissionDateInput.value =
      record.date ||
      "";


    transmissionTimeInput.value =
      record.time ||
      "";


    transmissionTitleInput.value =
      record.title ||
      "";


    transmissionSourceInput.value =
      record.source ||
      "";


    transmissionSummaryInput.value =
      record.summary ||
      "";


    setTransmissionEditorType(
      record.type ||
      "other"
    );

  } else {

    transmissionEditorTitle.textContent =
      "添加传讯";


    transmissionDateInput.value =
      toDateKey(
        selectedDate
      );


    transmissionTimeInput.value =
      "";


    transmissionTitleInput.value =
      "";


    transmissionSourceInput.value =
      "";


    transmissionSummaryInput.value =
      "";


    setTransmissionEditorType(
      "tarot"
    );

  }


  transmissionEditorBackdrop.hidden =
    false;

}



function closeTransmissionEditor() {

  transmissionEditorBackdrop.hidden =
    true;


  editingTransmission =
    null;

}



function findTransmissionIndex(
  record
) {

  if (
    !Array.isArray(
      calendarData.transmissions
    )
  ) {

    return -1;

  }


  if (
    record.id
  ) {

    const idIndex =
      calendarData.transmissions
        .findIndex(
          function (
            item
          ) {

            return (
              item.id ===
              record.id
            );

          }
        );


    if (
      idIndex !==
        -1
    ) {

      return idIndex;

    }

  }


  return (
    calendarData.transmissions
      .findIndex(
        function (
          item
        ) {

          return (
            item ===
              record ||

            (
              item.date ===
                record.date &&

              item.time ===
                record.time &&

              item.title ===
                record.title &&

              item.type ===
                record.type
            )
          );

        }
      )
  );

}



function deleteTransmission(
  record
) {

  const confirmed =
    window.confirm(
      `删除「${
        record.title ||
        "这条传讯"
      }」吗？`
    );


  if (
    !confirmed
  ) {

    return;

  }


  const index =
    findTransmissionIndex(
      record
    );


  if (
    index ===
      -1
  ) {

    return;

  }


  calendarData.transmissions
    .splice(
      index,
      1
    );


  saveCalendarData();

  renderAll();

}



addTransmissionButton.addEventListener(
  "click",
  function () {

    openTransmissionEditor();

  }
);



transmissionTypeOptions.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setTransmissionEditorType(
          button.dataset.transmissionType
        );

      }
    );

  }
);



transmissionEditorClose.addEventListener(
  "click",
  closeTransmissionEditor
);



transmissionEditorCancel.addEventListener(
  "click",
  closeTransmissionEditor
);



transmissionEditorBackdrop.addEventListener(
  "click",
  function (
    event
  ) {

    if (
      event.target ===
        transmissionEditorBackdrop
    ) {

      closeTransmissionEditor();

    }

  }
);



transmissionEditorSave.addEventListener(
  "click",
  function () {

    const date =
      transmissionDateInput.value;


    const time =
      transmissionTimeInput.value;


    const title =
      transmissionTitleInput
        .value
        .trim();


    const source =
      transmissionSourceInput
        .value
        .trim();


    const summary =
      transmissionSummaryInput
        .value
        .trim();


    if (
      !date ||
      !title
    ) {

      return;

    }


    if (
      !Array.isArray(
        calendarData.transmissions
      )
    ) {

      calendarData.transmissions =
        [];

    }


    const newRecord = {

      id:
        editingTransmission
          ?.id ||
        createTransmissionId(),

      date:
        date,

      time:
        time,

      type:
        transmissionEditorType,

      title:
        title,

      source:
        source,

      summary:
        summary

    };


    if (
      editingTransmission
    ) {

      const index =
        findTransmissionIndex(
          editingTransmission
        );


      if (
        index !==
          -1
      ) {

        calendarData
          .transmissions[
            index
          ] =
            newRecord;

      }

    } else {

      calendarData
        .transmissions
        .push(
          newRecord
        );

    }


    saveCalendarData();

    closeTransmissionEditor();

    renderAll();

  }
);



/* =========================
   Body 新增 / 编辑 / 删除
   ========================= */

function getBodyLibrary(
  owner
) {

  return (
    owner ===
      "luzhen"
      ? calendarData.bodyLuzhen
      : calendarData.body
  );

}


function ensureBodyLibrary(
  owner
) {

  if (
    owner ===
      "luzhen"
  ) {

    if (
      !calendarData.bodyLuzhen ||
      typeof calendarData.bodyLuzhen !==
        "object"
    ) {

      calendarData.bodyLuzhen =
        {};

    }


    return calendarData.bodyLuzhen;

  }


  if (
    !calendarData.body ||
    typeof calendarData.body !==
      "object"
  ) {

    calendarData.body =
      {};

  }


  return calendarData.body;

}


function getBodyRecord(
  dateKey,
  owner =
    "keshi"
) {

  const library =
    getBodyLibrary(
      owner
    );


  return (
    library
      ?.[dateKey] ||
    null
  );

}


function parseBodyEnergy(
  value
) {

  const match =
    String(
      value ||
      ""
    ).match(
      /[1-5]/
    );


  return (
    match
      ? match[0]
      : ""
  );

}


function setBodyEditorEnergy(
  energy
) {

  bodyEditorEnergy =
    [
      "1",
      "2",
      "3",
      "4",
      "5"
    ].includes(
      String(energy)
    )
      ? String(energy)
      : "";


  bodyEnergyButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.bodyEnergy ===
          bodyEditorEnergy
      );

    }
  );

}


function createBodyDiscomfortId() {

  if (
    window.crypto &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return (
      `discomfort_${crypto.randomUUID()}`
    );

  }


  return (
    `discomfort_${Date.now()}_` +
    `${Math.random()
      .toString(36)
      .slice(2, 9)}`
  );

}


function isValidBodyTime(
  value
) {

  return (
    typeof value ===
      "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/
      .test(value)
  );

}


function normalizeBodyDiscomfort(
  value
) {

  const source =
    value &&
    typeof value ===
      "object"
      ? value
      : {};


  const allDay =
    source.allDay ===
      true;


  const startTime =
    !allDay &&
    isValidBodyTime(
      source.startTime
    )
      ? source.startTime
      : "";


  const endTime =
    startTime &&
    isValidBodyTime(
      source.endTime
    )
      ? source.endTime
      : "";


  return {
    ...source,

    id:
      typeof source.id ===
        "string" &&
      source.id.trim()
        ? source.id
        : createBodyDiscomfortId(),

    symptom:
      typeof source.symptom ===
        "string"
        ? source.symptom
        : "",

    allDay:
      allDay,

    startTime:
      startTime,

    endTime:
      endTime,

    note:
      typeof source.note ===
        "string"
        ? source.note
        : ""
  };

}


function setBodyEditorDiscomforts(
  values
) {

  const usedIds =
    new Set();


  bodyEditorDiscomforts =
    (
      Array.isArray(values)
        ? values
        : []
    ).map(
      function (
        value
      ) {

        const discomfort =
          normalizeBodyDiscomfort(
            value
          );


        if (
          usedIds.has(
            discomfort.id
          )
        ) {

          discomfort.id =
            createBodyDiscomfortId();

        }


        usedIds.add(
          discomfort.id
        );


        return discomfort;

      }
    );


  renderBodyDiscomfortEditor();

}


function renderBodyDiscomfortEditor() {

  bodyDiscomfortList.innerHTML =
    "";


  if (
    !bodyEditorDiscomforts.length
  ) {

    bodyDiscomfortList.appendChild(

      make(
        "div",
        "body-discomfort-empty",
        "暂时没有身体不适"
      )

    );


    return;

  }


  function createField(
    labelText,
    input,
    className =
      ""
  ) {

    const field =
      make(
        "label",
        `body-discomfort-field ${className}`
          .trim()
      );


    field.append(

      make(
        "span",
        "",
        labelText
      ),

      input

    );


    return field;

  }


  bodyEditorDiscomforts.forEach(
    function (
      discomfort,
      index
    ) {

      const item =
        make(
          "article",
          "body-discomfort-item"
        );


      item.dataset.discomfortId =
        discomfort.id;


      const header =
        make(
          "div",
          "body-discomfort-item-header"
        );


      const deleteButton =
        make(
          "button",
          "body-discomfort-delete",
          "删除这条"
        );


      deleteButton.type =
        "button";


      deleteButton.addEventListener(
        "click",
        function () {

          bodyEditorDiscomforts
            .splice(
              index,
              1
            );


          renderBodyDiscomfortEditor();

        }
      );


      header.append(

        make(
          "strong",
          "",
          `不适 ${index + 1}`
        ),

        deleteButton

      );


      const symptomInput =
        make(
          "input",
          "body-discomfort-symptom"
        );


      symptomInput.type =
        "text";


      symptomInput.value =
        discomfort.symptom;


      symptomInput.placeholder =
        "例如：头痛 / 胃胀 / 腰酸";


      symptomInput.required =
        true;


      symptomInput.addEventListener(
        "input",
        function () {

          discomfort.symptom =
            symptomInput.value;

        }
      );


      const allDayLabel =
        make(
          "label",
          "body-discomfort-all-day"
        );


      const allDayInput =
        make(
          "input"
        );


      allDayInput.type =
        "checkbox";


      allDayInput.checked =
        discomfort.allDay;


      allDayInput.addEventListener(
        "change",
        function () {

          discomfort.allDay =
            allDayInput.checked;


          if (
            discomfort.allDay
          ) {

            discomfort.startTime =
              "";


            discomfort.endTime =
              "";

          }


          renderBodyDiscomfortEditor();

        }
      );


      allDayLabel.append(
        allDayInput,

        make(
          "span",
          "",
          "全天"
        )
      );


      const startTimeInput =
        make(
          "input"
        );


      startTimeInput.type =
        "time";


      startTimeInput.value =
        discomfort.startTime;


      startTimeInput.disabled =
        discomfort.allDay;


      startTimeInput.addEventListener(
        "change",
        function () {

          discomfort.startTime =
            startTimeInput.value;


          if (
            !discomfort.startTime
          ) {

            discomfort.endTime =
              "";

          }


          renderBodyDiscomfortEditor();

        }
      );


      const endTimeInput =
        make(
          "input"
        );


      endTimeInput.type =
        "time";


      endTimeInput.value =
        discomfort.endTime;


      endTimeInput.disabled =
        discomfort.allDay ||
        !discomfort.startTime;


      endTimeInput.addEventListener(
        "change",
        function () {

          discomfort.endTime =
            endTimeInput.value;

        }
      );


      const timeGrid =
        make(
          "div",
          "body-discomfort-time-grid"
        );


      timeGrid.append(

        createField(
          "开始时间（可选）",
          startTimeInput
        ),

        createField(
          "结束时间（可选）",
          endTimeInput
        )

      );


      const noteInput =
        make(
          "textarea"
        );


      noteInput.rows =
        2;


      noteInput.value =
        discomfort.note;


      noteInput.placeholder =
        "针对这一条不适的补充……";


      noteInput.addEventListener(
        "input",
        function () {

          discomfort.note =
            noteInput.value;

        }
      );


      item.append(
        header,

        createField(
          "不适",
          symptomInput
        ),

        allDayLabel,
        timeGrid,

        createField(
          "补充（可选）",
          noteInput,
          "body-discomfort-note-field"
        )
      );


      bodyDiscomfortList
        .appendChild(
          item
        );

    }
  );

}


function refreshBodyEditorFields() {

  const dateKey =
    bodyDateInput.value;


  const record =
    dateKey
      ? getBodyRecord(
          dateKey,
          bodyEditorOwner
        )
      : null;


  if (
    record
  ) {

    bodyEditorTitle.textContent =
      "编辑身体记录";


    setBodyEditorEnergy(
      parseBodyEnergy(
        record.energy
      )
    );


    bodyAppetiteInput.value =
      record.appetite ||
      "";


    bodyPainInput.value =
      record.pain ||
      "";


    bodyLegacyPainNotice.textContent =
      bodyPainInput.value
        ? `旧版不适记录：${bodyPainInput.value}`
        : "";


    bodyLegacyPainNotice.hidden =
      !bodyPainInput.value;


    setBodyEditorDiscomforts(
      record.discomforts
    );


    bodyNoteInput.value =
      record.note ||
      "";


    bodyEditorDelete.hidden =
      false;


    bodyEditorActions
      .classList.add(
        "editing"
      );

  } else {

    bodyEditorTitle.textContent =
      "添加身体记录";


    setBodyEditorEnergy(
      ""
    );


    bodyAppetiteInput.value =
      "";


    bodyPainInput.value =
      "";


    bodyLegacyPainNotice.textContent =
      "";


    bodyLegacyPainNotice.hidden =
      true;


    setBodyEditorDiscomforts(
      []
    );


    bodyNoteInput.value =
      "";


    bodyEditorDelete.hidden =
      true;


    bodyEditorActions
      .classList.remove(
        "editing"
      );

  }

}


function setBodyEditorOwner(
  owner,
  refresh =
    true
) {

  bodyEditorOwner =
    owner ===
      "luzhen"
      ? "luzhen"
      : "keshi";


  bodyOwnerButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.bodyOwner ===
          bodyEditorOwner
      );

    }
  );


  if (
    refresh
  ) {

    refreshBodyEditorFields();

  }

}


function openBodyEditor() {

  bodyDateInput.value =
    toDateKey(
      selectedDate
    );


  setBodyEditorOwner(
    "keshi",
    false
  );


  refreshBodyEditorFields();


  bodyEditorBackdrop.hidden =
    false;

}


function closeBodyEditor() {

  bodyEditorBackdrop.hidden =
    true;

}


recordBodyCard.addEventListener(
  "click",
  function () {

    openBodyEditor();

  }
);


bodyOwnerButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setBodyEditorOwner(
          button.dataset.bodyOwner
        );

      }
    );

  }
);


addBodyDiscomfortButton.addEventListener(
  "click",
  function () {

    bodyEditorDiscomforts.push(

      normalizeBodyDiscomfort({
        id:
          createBodyDiscomfortId(),

        symptom:
          "",

        allDay:
          false,

        startTime:
          "",

        endTime:
          "",

        note:
          ""
      })

    );


    renderBodyDiscomfortEditor();


    const symptomInputs =
      bodyDiscomfortList
        .querySelectorAll(
          ".body-discomfort-symptom"
        );


    symptomInputs[
      symptomInputs.length -
        1
    ]?.focus();

  }
);


bodyEnergyButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        const energy =
          button.dataset.bodyEnergy;


        setBodyEditorEnergy(
          bodyEditorEnergy ===
            energy
            ? ""
            : energy
        );

      }
    );

  }
);


bodyDateInput.addEventListener(
  "change",
  refreshBodyEditorFields
);


bodyEditorClose.addEventListener(
  "click",
  closeBodyEditor
);


bodyEditorCancel.addEventListener(
  "click",
  closeBodyEditor
);


bodyEditorBackdrop.addEventListener(
  "click",
  function (
    event
  ) {

    if (
      event.target ===
        bodyEditorBackdrop
    ) {

      closeBodyEditor();

    }

  }
);


bodyEditorDelete.addEventListener(
  "click",
  function () {

    const dateKey =
      bodyDateInput.value;


    const record =
      getBodyRecord(
        dateKey,
        bodyEditorOwner
      );


    if (
      !dateKey ||
      !record
    ) {

      return;

    }


    const personName =
      bodyEditorOwner ===
        "luzhen"
        ? "榛榛"
        : "Keshi";


    const confirmed =
      window.confirm(
        `删除 ${personName} 在 ${dateKey} 的身体记录吗？`
      );


    if (
      !confirmed
    ) {

      return;

    }


    const library =
      ensureBodyLibrary(
        bodyEditorOwner
      );


    delete library[
      dateKey
    ];


    saveCalendarData();

    closeBodyEditor();

    renderAll();

  }
);


bodyEditorSave.addEventListener(
  "click",
  function () {

    const dateKey =
      bodyDateInput.value;


    const appetite =
      bodyAppetiteInput
        .value
        .trim();


    const pain =
      bodyPainInput
        .value
        .trim();


    const note =
      bodyNoteInput
        .value
        .trim();


    const discomforts =
      bodyEditorDiscomforts.map(
        function (
          value
        ) {

          const discomfort =
            normalizeBodyDiscomfort(
              value
            );


          discomfort.symptom =
            discomfort.symptom
              .trim();


          discomfort.note =
            discomfort.note
              .trim();


          return discomfort;

        }
      );


    if (
      !dateKey
    ) {

      return;

    }


    const incompleteIndex =
      discomforts.findIndex(
        function (
          discomfort
        ) {

          return (
            !discomfort.symptom
          );

        }
      );


    if (
      incompleteIndex !==
        -1
    ) {

      window.alert(
        "请填写每条身体不适的名称，或删除空白条目。"
      );


      bodyDiscomfortList
        .querySelectorAll(
          ".body-discomfort-symptom"
        )[
          incompleteIndex
        ]?.focus();


      return;

    }


    if (
      !bodyEditorEnergy &&
      !appetite &&
      !pain &&
      !discomforts.length &&
      !note
    ) {

      window.alert(
        "至少填写一项身体记录。"
      );


      return;

    }


    const library =
      ensureBodyLibrary(
        bodyEditorOwner
      );


    const existingRecord =
      getBodyRecord(
        dateKey,
        bodyEditorOwner
      );


    library[
      dateKey
    ] = {
      ...(
        existingRecord &&
        typeof existingRecord ===
          "object"
          ? existingRecord
          : {}
      ),

      energy:
        bodyEditorEnergy
          ? `${bodyEditorEnergy} / 5`
          : "",

      appetite:
        appetite,

      pain:
        pain,

      discomforts:
        discomforts,

      note:
        note

    };


    selectedDate =
      dateFromKey(
        dateKey
      );


    viewYear =
      selectedDate
        .getFullYear();


    viewMonth =
      selectedDate
        .getMonth();


    saveCalendarData();

    closeBodyEditor();

    renderAll();

  }
);

/* =========================
   Sleep 新增 / 编辑 / 删除
   ========================= */

function getSleepLibrary(
  owner
) {

  return (
    owner ===
      "luzhen"
      ? calendarData.sleepLuzhen
      : calendarData.sleep
  );

}


function ensureSleepLibrary(
  owner
) {

  if (
    owner ===
      "luzhen"
  ) {

    if (
      !calendarData.sleepLuzhen ||
      typeof calendarData.sleepLuzhen !==
        "object"
    ) {

      calendarData.sleepLuzhen =
        {};

    }


    return calendarData.sleepLuzhen;

  }


  if (
    !calendarData.sleep ||
    typeof calendarData.sleep !==
      "object"
  ) {

    calendarData.sleep =
      {};

  }


  return calendarData.sleep;

}


function getSleepRecord(
  dateKey,
  owner =
    "keshi"
) {

  const library =
    getSleepLibrary(
      owner
    );


  return (
    library
      ?.[dateKey] ||
    null
  );

}


/*
  根据入睡 / 起床时间
  自动计算睡眠时长。

  23:30 → 07:30
  会自动识别为跨午夜。
*/

function calculateSleepDuration(
  start,
  end
) {

  if (
    !start ||
    !end
  ) {

    return "";

  }


  const [
    startHour,
    startMinute
  ] =
    start
      .split(":")
      .map(Number);


  const [
    endHour,
    endMinute
  ] =
    end
      .split(":")
      .map(Number);


  if (
    !Number.isFinite(
      startHour
    ) ||
    !Number.isFinite(
      startMinute
    ) ||
    !Number.isFinite(
      endHour
    ) ||
    !Number.isFinite(
      endMinute
    )
  ) {

    return "";

  }


  const startTotal =
    startHour * 60 +
    startMinute;


  let endTotal =
    endHour * 60 +
    endMinute;


  if (
    endTotal <
      startTotal
  ) {

    endTotal +=
      24 * 60;

  }


  const totalMinutes =
    endTotal -
    startTotal;


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


function refreshSleepEditorFields() {

  const dateKey =
    sleepDateInput.value;


  const record =
    dateKey
      ? getSleepRecord(
          dateKey,
          sleepEditorOwner
        )
      : null;


  if (
    record
  ) {

    sleepEditorTitle.textContent =
      "编辑睡眠记录";


    sleepStartInput.value =
      record.start ||
      "";


    sleepEndInput.value =
      record.end ||
      "";


    sleepQualityInput.value =
      record.quality ||
      "";


    sleepNapInput.value =
      record.nap ||
      "";


    sleepEditorDelete.hidden =
      false;


    sleepEditorActions
      .classList.add(
        "editing"
      );

  } else {

    sleepEditorTitle.textContent =
      "添加睡眠记录";


    sleepStartInput.value =
      "";


    sleepEndInput.value =
      "";


    sleepQualityInput.value =
      "";


    sleepNapInput.value =
      "";


    sleepEditorDelete.hidden =
      true;


    sleepEditorActions
      .classList.remove(
        "editing"
      );

  }

}


function setSleepEditorOwner(
  owner,
  refresh =
    true
) {

  sleepEditorOwner =
    owner ===
      "luzhen"
      ? "luzhen"
      : "keshi";


  sleepOwnerButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.sleepOwner ===
          sleepEditorOwner
      );

    }
  );


  if (
    refresh
  ) {

    refreshSleepEditorFields();

  }

}


function openSleepEditor() {

  sleepDateInput.value =
    toDateKey(
      selectedDate
    );


  setSleepEditorOwner(
    "keshi",
    false
  );


  refreshSleepEditorFields();


  sleepEditorBackdrop.hidden =
    false;

}


function closeSleepEditor() {

  sleepEditorBackdrop.hidden =
    true;

}


recordSleepCard.addEventListener(
  "click",
  function () {

    openSleepEditor();

  }
);


sleepOwnerButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setSleepEditorOwner(
          button.dataset.sleepOwner
        );

      }
    );

  }
);


sleepDateInput.addEventListener(
  "change",
  refreshSleepEditorFields
);


sleepEditorClose.addEventListener(
  "click",
  closeSleepEditor
);


sleepEditorCancel.addEventListener(
  "click",
  closeSleepEditor
);


sleepEditorBackdrop.addEventListener(
  "click",
  function (
    event
  ) {

    if (
      event.target ===
        sleepEditorBackdrop
    ) {

      closeSleepEditor();

    }

  }
);


sleepEditorDelete.addEventListener(
  "click",
  function () {

    const dateKey =
      sleepDateInput.value;


    const record =
      getSleepRecord(
        dateKey,
        sleepEditorOwner
      );


    if (
      !dateKey ||
      !record
    ) {

      return;

    }


    const personName =
      sleepEditorOwner ===
        "luzhen"
        ? "榛榛"
        : "Keshi";


    const confirmed =
      window.confirm(
        `删除 ${personName} 在 ${dateKey} 的睡眠记录吗？`
      );


    if (
      !confirmed
    ) {

      return;

    }


    const library =
      ensureSleepLibrary(
        sleepEditorOwner
      );


    delete library[
      dateKey
    ];


    saveCalendarData();

    closeSleepEditor();

    renderAll();

  }
);


sleepEditorSave.addEventListener(
  "click",
  function () {

    const dateKey =
      sleepDateInput.value;


    const start =
      sleepStartInput.value;


    const end =
      sleepEndInput.value;


    const quality =
      sleepQualityInput
        .value
        .trim();


    const nap =
      sleepNapInput
        .value
        .trim();


    if (
      !dateKey
    ) {

      return;

    }


    if (
      !start &&
      !end &&
      !quality &&
      !nap
    ) {

      window.alert(
        "至少填写一项睡眠记录。"
      );


      return;

    }


    const library =
      ensureSleepLibrary(
        sleepEditorOwner
      );


    library[
      dateKey
    ] = {

      start:
        start,

      end:
        end,

      duration:
        calculateSleepDuration(
          start,
          end
        ),

      quality:
        quality,

      nap:
        nap

    };


    selectedDate =
      dateFromKey(
        dateKey
      );


    viewYear =
      selectedDate
        .getFullYear();


    viewMonth =
      selectedDate
        .getMonth();


    saveCalendarData();

    closeSleepEditor();

    renderAll();

  }
);

/* =========================
   Cycle 管理 / 编辑
   ========================= */

function getSortedCyclePeriods() {

  return [
    ...(calendarData.cycle
      ?.periods || [])
  ].sort(
    (a, b) =>
      b.start.localeCompare(a.start)
  );

}


function getCyclePeriodDuration(
  period
) {

  return (
    differenceInDays(
      period.start,
      period.end
    ) + 1
  );

}


function renderCycleManagerList() {

  cycleManagerTitle.textContent =
    "周期记录";


  cycleManagerListView.hidden =
    false;


  cyclePeriodEditorView.hidden =
    true;


  const periods =
    getSortedCyclePeriods();


  cycleLatestSummary.innerHTML = "";


  if (periods.length) {

    const latest = periods[0];


    cycleLatestSummary.append(
      make(
        "span",
        "cycle-summary-label",
        "最近一次经期"
      ),
      make(
        "strong",
        "",
        `${formatCycleShortDate(latest.start)} – ` +
          `${formatCycleShortDate(latest.end)}`
      ),
      make(
        "small",
        "",
        `${getCyclePeriodDuration(latest)}天`
      )
    );

  } else {

    cycleLatestSummary.append(
      make(
        "span",
        "cycle-summary-label",
        "最近一次经期"
      ),
      make(
        "strong",
        "",
        "暂无记录"
      ),
      make(
        "small",
        "",
        "添加记录后会自动估算周期"
      )
    );

  }


  cyclePeriodList.innerHTML = "";


  if (!periods.length) {

    cyclePeriodList.appendChild(
      make(
        "p",
        "cycle-period-empty",
        "还没有经期历史"
      )
    );

    return;

  }


  periods.forEach(
    function (period) {

      const button = make(
        "button",
        "cycle-period-row"
      );


      button.type = "button";


      const dates = make(
        "span",
        "cycle-period-dates",
        `${formatCycleDotDate(period.start)} – ` +
          `${formatCycleDotDate(period.end, false)}`
      );


      const meta = make(
        "span",
        "cycle-period-meta",
        `${getCyclePeriodDuration(period)}天  ›`
      );


      button.append(dates, meta);


      button.addEventListener(
        "click",
        function () {
          openCyclePeriodEditor(
            period.id
          );
        }
      );


      cyclePeriodList.appendChild(button);

    }
  );

}


function openCycleManager() {

  renderCycleManagerList();


  cycleManagerBackdrop.hidden =
    false;

}


function closeCycleManager() {

  cycleManagerBackdrop.hidden =
    true;


  editingCyclePeriod = null;
  activeCycleDayKey = "";

}


function openCyclePeriodEditor(
  periodId = ""
) {

  const existing =
    (calendarData.cycle
      ?.periods || [])
      .find(
        (period) =>
          period.id === periodId
      );


  const selectedKey =
    toDateKey(selectedDate);


  editingCyclePeriod = existing
    ? normalizeCyclePeriod(
        JSON.parse(
          JSON.stringify(existing)
        )
      )
    : {
        id: createCyclePeriodId(),
        start: selectedKey,
        end: selectedKey,
        days: {}
      };


  cycleEditorPresets = [
    ...(calendarData.cycle
      ?.customSymptomPresets || [])
  ];


  activeCycleDayKey =
    editingCyclePeriod.start;


  cycleStartInput.value =
    editingCyclePeriod.start;


  cycleEndInput.value =
    editingCyclePeriod.end;


  cycleDeletePeriodButton.hidden =
    !existing;


  cycleEditorActions.classList.toggle(
    "editing",
    Boolean(existing)
  );


  cycleManagerTitle.textContent =
    existing
      ? "编辑经期"
      : "添加经期";


  cycleManagerListView.hidden = true;
  cyclePeriodEditorView.hidden = false;


  renderCycleDayEditor();

}


function ensureCycleDraftDay(
  dateKey
) {

  if (!editingCyclePeriod.days) {
    editingCyclePeriod.days = {};
  }


  if (!editingCyclePeriod.days[dateKey]) {
    editingCyclePeriod.days[dateKey] =
      normalizeCycleDay({});
  } else {
    editingCyclePeriod.days[dateKey] =
      normalizeCycleDay(
        editingCyclePeriod.days[dateKey]
      );
  }


  return editingCyclePeriod.days[dateKey];

}


function makeCyclePill(
  text,
  active,
  onClick
) {

  const button = make(
    "button",
    "cycle-pill" +
      (active ? " active" : ""),
    text
  );


  button.type = "button";
  button.setAttribute(
    "aria-pressed",
    String(active)
  );


  button.addEventListener(
    "click",
    onClick
  );


  return button;

}


function renderCycleDayEditor() {

  cycleDayEditor.innerHTML = "";


  if (
    !editingCyclePeriod ||
    !isValidDateKey(
      editingCyclePeriod.start
    ) ||
    !isValidDateKey(
      editingCyclePeriod.end
    ) ||
    editingCyclePeriod.start >
      editingCyclePeriod.end
  ) {

    cycleDayEditor.appendChild(
      make(
        "p",
        "cycle-period-empty",
        "请先选择有效的开始和结束日期"
      )
    );

    return;

  }


  const dates = enumerateDateKeys(
    editingCyclePeriod.start,
    editingCyclePeriod.end
  );


  if (!dates.includes(activeCycleDayKey)) {
    activeCycleDayKey = dates[0];
  }


  const tabs = make(
    "div",
    "cycle-day-tabs"
  );


  dates.forEach(
    function (dateKey, index) {

      const button = make(
        "button",
        "cycle-day-tab" +
          (
            dateKey === activeCycleDayKey
              ? " active"
              : ""
          ),
        `${dateFromKey(dateKey).getMonth() + 1}.` +
          `${dateFromKey(dateKey).getDate()}\n` +
          `第${index + 1}天`
      );


      button.type = "button";


      button.addEventListener(
        "click",
        function () {
          activeCycleDayKey = dateKey;
          renderCycleDayEditor();
        }
      );


      tabs.appendChild(button);

    }
  );


  cycleDayEditor.appendChild(tabs);


  const day = ensureCycleDraftDay(
    activeCycleDayKey
  );


  const panel = make(
    "section",
    "cycle-day-panel"
  );


  const dayIndex =
    dates.indexOf(activeCycleDayKey) + 1;


  panel.appendChild(
    make(
      "strong",
      "cycle-day-title",
      `${formatCycleShortDate(activeCycleDayKey)} · ` +
        `第${dayIndex}天`
    )
  );


  const flowGroup = make(
    "div",
    "cycle-option-group"
  );


  flowGroup.appendChild(
    make("span", "", "经量")
  );


  const flowPills = make(
    "div",
    "cycle-pill-grid cycle-flow-grid"
  );


  (
    window.LiminalCycleData
      ?.flowOptions || []
  ).forEach(
    function (option) {
      flowPills.appendChild(
        makeCyclePill(
          option.label,
          day.flow === option.id,
          function () {
            day.flow =
              day.flow === option.id
                ? ""
                : option.id;
            renderCycleDayEditor();
          }
        )
      );
    }
  );


  flowGroup.appendChild(flowPills);
  panel.appendChild(flowGroup);


  const symptomGroup = make(
    "div",
    "cycle-option-group"
  );


  symptomGroup.appendChild(
    make("span", "", "身体症状")
  );


  const symptomPills = make(
    "div",
    "cycle-pill-grid"
  );


  (
    window.LiminalCycleData
      ?.symptomPresets || []
  ).forEach(
    function (option) {

      symptomPills.appendChild(
        makeCyclePill(
          option.label,
          day.symptoms.includes(
            option.id
          ),
          function () {
            day.symptoms =
              day.symptoms.includes(option.id)
                ? day.symptoms.filter(
                    (id) => id !== option.id
                  )
                : [
                    ...day.symptoms,
                    option.id
                  ];
            renderCycleDayEditor();
          }
        )
      );

    }
  );


  symptomGroup.appendChild(symptomPills);


  const customNames = [
    ...new Set([
      ...cycleEditorPresets,
      ...day.customSymptoms
    ])
  ];


  if (customNames.length) {

    symptomGroup.appendChild(
      make(
        "span",
        "cycle-custom-label",
        "我的自定义症状"
      )
    );


    const customPills = make(
      "div",
      "cycle-pill-grid"
    );


    customNames.forEach(
      function (name) {
        customPills.appendChild(
          makeCyclePill(
            name,
            day.customSymptoms.includes(name),
            function () {
              day.customSymptoms =
                day.customSymptoms.includes(name)
                  ? day.customSymptoms.filter(
                      (item) => item !== name
                    )
                  : [
                      ...day.customSymptoms,
                      name
                    ];
              renderCycleDayEditor();
            }
          )
        );
      }
    );


    symptomGroup.appendChild(customPills);

  }


  const customBox = make(
    "div",
    "cycle-custom-box"
  );


  const customInput = document.createElement(
    "input"
  );


  customInput.type = "text";
  customInput.placeholder =
    "例如：腿酸";
  customInput.setAttribute(
    "aria-label",
    "自定义症状"
  );


  const presetLabel = make(
    "label",
    "cycle-save-preset"
  );


  const presetCheckbox =
    document.createElement("input");


  presetCheckbox.type = "checkbox";


  presetLabel.append(
    presetCheckbox,
    document.createTextNode(
      "保存到我的预设"
    )
  );


  const addCustomButton = make(
    "button",
    "cycle-add-custom",
    "＋ 自定义症状"
  );


  addCustomButton.type = "button";


  addCustomButton.addEventListener(
    "click",
    function () {

      const name =
        customInput.value.trim();


      if (!name) {
        customInput.focus();
        return;
      }


      if (!day.customSymptoms.includes(name)) {
        day.customSymptoms.push(name);
      }


      if (
        presetCheckbox.checked &&
        !cycleEditorPresets.includes(name)
      ) {
        cycleEditorPresets.push(name);
      }


      renderCycleDayEditor();

    }
  );


  customBox.append(
    customInput,
    presetLabel,
    addCustomButton
  );


  symptomGroup.appendChild(customBox);
  panel.appendChild(symptomGroup);


  const noteField = make(
    "label",
    "cycle-note-field"
  );


  noteField.appendChild(
    make("span", "", "备注")
  );


  const noteInput =
    document.createElement("textarea");


  noteInput.rows = 3;
  noteInput.placeholder =
    "记录这一天的其他感受……";
  noteInput.value = day.note;


  noteInput.addEventListener(
    "input",
    function () {
      day.note = noteInput.value;
    }
  );


  noteField.appendChild(noteInput);
  panel.appendChild(noteField);


  const clearButton = make(
    "button",
    "cycle-clear-day",
    "清空这一天的详细记录"
  );


  clearButton.type = "button";


  clearButton.addEventListener(
    "click",
    function () {
      editingCyclePeriod.days[
        activeCycleDayKey
      ] = normalizeCycleDay({});
      renderCycleDayEditor();
    }
  );


  panel.appendChild(clearButton);
  cycleDayEditor.appendChild(panel);

}


function syncCycleDraftRange() {

  if (!editingCyclePeriod) {
    return;
  }


  editingCyclePeriod.start =
    cycleStartInput.value;


  editingCyclePeriod.end =
    cycleEndInput.value;


  renderCycleDayEditor();

}


recordCycleCard.addEventListener(
  "click",
  openCycleManager
);


manageCycleButton.addEventListener(
  "click",
  function (event) {
    event.stopPropagation();
    openCycleManager();
  }
);


cycleManagerClose.addEventListener(
  "click",
  closeCycleManager
);


cycleManagerBackdrop.addEventListener(
  "click",
  function (event) {
    if (event.target === cycleManagerBackdrop) {
      closeCycleManager();
    }
  }
);


cycleAddPeriodButton.addEventListener(
  "click",
  function () {
    openCyclePeriodEditor();
  }
);


cyclePeriodBackButton.addEventListener(
  "click",
  renderCycleManagerList
);


cycleCancelEditButton.addEventListener(
  "click",
  renderCycleManagerList
);


cycleStartInput.addEventListener(
  "change",
  syncCycleDraftRange
);


cycleEndInput.addEventListener(
  "change",
  syncCycleDraftRange
);


cycleSavePeriodButton.addEventListener(
  "click",
  function () {

    syncCycleDraftRange();


    if (
      !editingCyclePeriod ||
      !isValidDateKey(
        editingCyclePeriod.start
      ) ||
      !isValidDateKey(
        editingCyclePeriod.end
      )
    ) {
      window.alert("请选择完整的经期日期。");
      return;
    }


    if (
      editingCyclePeriod.start >
      editingCyclePeriod.end
    ) {
      window.alert("结束日期不能早于开始日期。");
      return;
    }


    const allowedDates = new Set(
      enumerateDateKeys(
        editingCyclePeriod.start,
        editingCyclePeriod.end
      )
    );


    /*
      经期范围缩短后，旧范围之外的每日详情已不再属于本次经期，
      因此只在明确保存范围修改时移除这些越界日期。
    */
    Object.keys(
      editingCyclePeriod.days || {}
    ).forEach(
      function (dateKey) {
        if (!allowedDates.has(dateKey)) {
          delete editingCyclePeriod.days[dateKey];
        }
      }
    );


    const normalized =
      normalizeCyclePeriod(
        editingCyclePeriod
      );


    const index =
      calendarData.cycle.periods
        .findIndex(
          (period) =>
            period.id === normalized.id
        );


    if (index >= 0) {
      calendarData.cycle.periods[index] =
        normalized;
    } else {
      calendarData.cycle.periods.push(
        normalized
      );
    }


    calendarData.cycle
      .customSymptomPresets = [
        ...new Set(cycleEditorPresets)
      ];


    rebuildCycleDerivedFields();
    saveCalendarData();


    selectedDate = dateFromKey(
      normalized.start
    );
    viewYear = selectedDate.getFullYear();
    viewMonth = selectedDate.getMonth();


    renderCycleManagerList();
    renderAll();

  }
);


cycleDeletePeriodButton.addEventListener(
  "click",
  function () {

    if (!editingCyclePeriod) {
      return;
    }


    if (
      !window.confirm(
        "确定删除这次经期记录吗？"
      )
    ) {
      return;
    }


    calendarData.cycle.periods =
      calendarData.cycle.periods.filter(
        (period) =>
          period.id !==
            editingCyclePeriod.id
      );


    rebuildCycleDerivedFields();
    saveCalendarData();
    renderCycleManagerList();
    renderAll();

  }
);


/* =========================
   Sex 管理 / 编辑
   ========================= */

function formatSexManagerDate(
  dateKey
) {

  const date = dateFromKey(dateKey);


  return (
    `${date.getFullYear()}年` +
    `${date.getMonth() + 1}月` +
    `${date.getDate()}日`
  );

}


function getSexDisplayPositions(
  record
) {

  return [
    ...(
      Array.isArray(record.positions)
        ? record.positions
            .map(getSexPositionLabel)
            .filter(Boolean)
        : []
    ),
    ...(
      Array.isArray(record.customPositions)
        ? record.customPositions
            .filter(
              (item) =>
                typeof item === "string" &&
                item.trim()
            )
        : []
    )
  ];

}


function renderSexManagerList() {

  const dateKey =
    toDateKey(selectedDate);


  sexManagerTitle.textContent =
    "亲密记录";


  sexManagerListView.hidden = false;
  sexRecordEditorView.hidden = true;


  sexManagerDate.textContent =
    formatSexManagerDate(dateKey);


  sexManagerTotal.textContent =
    `当天共 ${getSexTotalCount(dateKey)} 次`;


  sexRecordList.innerHTML = "";


  const entries =
    getSortedSexEntries(dateKey);


  if (!entries.length) {

    sexRecordList.appendChild(
      make(
        "p",
        "cycle-period-empty",
        "当天还没有亲密记录"
      )
    );

    return;

  }


  entries.forEach(
    function (entry) {

      const record = entry.record;
      const button = make(
        "button",
        "sex-record-row"
      );


      button.type = "button";


      button.appendChild(
        make(
          "strong",
          "sex-record-time",
          formatSexTimeRange(record)
        )
      );


      button.appendChild(
        make(
          "span",
          "sex-record-primary",
          `${getSexFormLabel(record.form)} · ` +
            `${getSexCount(record)}次`
        )
      );


      const location =
        getSexLocationLabel(record);


      if (location) {
        button.appendChild(
          make(
            "span",
            "sex-record-detail",
            location
          )
        );
      }


      const protection =
        getSexProtectionLabel(
          record.protection
        );


      const protectionMethod =
        resolveSexOptionId(
          window.LiminalSexData
            ?.protectionOptions || [],
          record.protection,
          "na"
        ) === "yes"
          ? getSexProtectionMethodLabel(
              record.protectionMethod
            )
          : "";


      button.appendChild(
        make(
          "span",
          "sex-record-detail",
          protectionMethod
            ? `${protection} · ${protectionMethod}`
            : protection
        )
      );


      const positions =
        getSexDisplayPositions(record);


      if (positions.length) {
        button.appendChild(
          make(
            "span",
            "sex-record-detail",
            positions.join(" / ")
          )
        );
      }


      button.addEventListener(
        "click",
        function () {
          openSexRecordEditor(
            dateKey,
            entry.index
          );
        }
      );


      sexRecordList.appendChild(button);

    }
  );

}


function openSexManager() {

  renderSexManagerList();
  sexManagerBackdrop.hidden = false;

}


function closeSexManager() {

  sexManagerBackdrop.hidden = true;
  editingSexRecord = null;

}


function renderSexSingleOptions(
  container,
  options,
  selectedValue,
  onSelect
) {

  container.innerHTML = "";


  options.forEach(
    function (option) {

      const button = makeCyclePill(
        option.label,
        option.id === selectedValue,
        function () {
          onSelect(option.id);
        }
      );


      container.appendChild(button);

    }
  );

}


function renderSexPositionEditor() {

  sexPositionCategories.innerHTML = "";
  sexPositionOptions.innerHTML = "";
  sexSelectedPositions.innerHTML = "";


  const categories =
    window.LiminalSexData
      ?.positionCategories || [];


  const presets =
    window.LiminalSexData
      ?.positionPresets || [];


  if (
    !categories.some(
      (category) =>
        category.id ===
          sexEditorPositionCategory
    )
  ) {
    sexEditorPositionCategory =
      categories[0]?.id || "other";
  }


  categories.forEach(
    function (category) {

      sexPositionCategories.appendChild(
        makeCyclePill(
          category.shortLabel ||
            category.label,
          category.id ===
            sexEditorPositionCategory,
          function () {
            sexEditorPositionCategory =
              category.id;
            renderSexPositionEditor();
          }
        )
      );

    }
  );


  sexPositionCategoryLabel.textContent =
    categories.find(
      (category) =>
        category.id ===
          sexEditorPositionCategory
    )?.label || "其他";


  presets
    .filter(
      (option) =>
        option.category ===
          sexEditorPositionCategory
    )
    .forEach(
    function (option) {

      sexPositionOptions.appendChild(
        makeCyclePill(
          option.label,
          sexEditorPositions.includes(
            option.id
          ),
          function () {
            sexEditorPositions =
              sexEditorPositions.includes(
                option.id
              )
                ? sexEditorPositions.filter(
                    (id) => id !== option.id
                  )
                : [
                    ...sexEditorPositions,
                    option.id
                  ];
            renderSexPositionEditor();
          }
        )
      );

    }
  );


  const customNames = [
    ...new Set([
      ...sexEditorCustomPresets,
      ...sexEditorCustomPositions
    ])
  ];


  if (
    sexEditorPositionCategory === "other"
  ) {

    customNames.forEach(
      function (name) {

        sexPositionOptions.appendChild(
          makeCyclePill(
            name,
            sexEditorCustomPositions.includes(
              name
            ),
            function () {
              sexEditorCustomPositions =
                sexEditorCustomPositions.includes(
                  name
                )
                  ? sexEditorCustomPositions.filter(
                      (item) => item !== name
                    )
                  : [
                      ...sexEditorCustomPositions,
                      name
                    ];
              renderSexPositionEditor();
            }
          )
        );

      }
    );

  }


  if (!sexPositionOptions.children.length) {
    sexPositionOptions.appendChild(
      make(
        "span",
        "sex-option-empty",
        "可在下方添加自定义体位"
      )
    );
  }


  sexEditorPositions.forEach(
    function (id) {
      appendSexSelectedTag(
        sexSelectedPositions,
        getSexPositionLabel(id),
        function () {
          sexEditorPositions =
            sexEditorPositions.filter(
              (item) => item !== id
            );
          renderSexPositionEditor();
        }
      );
    }
  );


  sexEditorCustomPositions.forEach(
    function (name) {
      appendSexSelectedTag(
        sexSelectedPositions,
        name,
        function () {
          sexEditorCustomPositions =
            sexEditorCustomPositions.filter(
              (item) => item !== name
            );
          renderSexPositionEditor();
        }
      );
    }
  );


  sexSelectedPositionsBlock.hidden =
    !sexSelectedPositions.children.length;

}


function appendSexSelectedTag(
  container,
  label,
  onRemove
) {

  const button = make(
    "button",
    "sex-selected-tag",
    `${label} ×`
  );


  button.type = "button";
  button.setAttribute(
    "aria-label",
    `取消选择 ${label}`
  );
  button.addEventListener(
    "click",
    onRemove
  );
  container.appendChild(button);

}


function renderSexMultiOptions(
  container,
  options,
  selectedValues,
  onToggle
) {

  container.innerHTML = "";


  options.forEach(
    function (option) {
      container.appendChild(
        makeCyclePill(
          option.label,
          selectedValues.includes(option.id),
          function () {
            onToggle(option.id);
          }
        )
      );
    }
  );


  selectedValues
    .filter(
      (value) =>
        !options.some(
          (option) =>
            option.id === value ||
            option.label === value
        )
    )
    .forEach(
      function (value) {
        container.appendChild(
          makeCyclePill(
            value,
            true,
            function () {
              onToggle(value);
            }
          )
        );
      }
    );

}


function renderSexAidEditor() {

  const options =
    window.LiminalSexData
      ?.aidPresets || [];


  renderSexMultiOptions(
    sexAidOptions,
    options,
    sexEditorAids,
    function (value) {

      if (value === "none") {
        sexEditorAids =
          sexEditorAids.includes("none")
            ? []
            : ["none"];
        sexEditorCustomAids = [];
      } else {
        sexEditorAids =
          sexEditorAids.includes(value)
            ? sexEditorAids.filter(
                (item) => item !== value
              )
            : [
                ...sexEditorAids.filter(
                  (item) => item !== "none"
                ),
                value
              ];
      }


      renderSexAidEditor();

    }
  );


  sexSelectedAids.innerHTML = "";


  sexEditorAids.forEach(
    function (id) {
      appendSexSelectedTag(
        sexSelectedAids,
        getSexOptionLabel(
          options,
          id,
          id
        ),
        function () {
          sexEditorAids =
            sexEditorAids.filter(
              (item) => item !== id
            );
          renderSexAidEditor();
        }
      );
    }
  );


  sexEditorCustomAids.forEach(
    function (name) {
      appendSexSelectedTag(
        sexSelectedAids,
        name,
        function () {
          sexEditorCustomAids =
            sexEditorCustomAids.filter(
              (item) => item !== name
            );
          renderSexAidEditor();
        }
      );
    }
  );


  sexSelectedAidsBlock.hidden =
    !sexSelectedAids.children.length;

}


function renderSexScaleOptions(
  container,
  selectedValue,
  onSelect
) {

  container.innerHTML = "";


  for (let value = 1; value <= 5; value += 1) {
    const button = makeCyclePill(
      String(value),
      value === selectedValue,
      function () {
        onSelect(
          value === selectedValue
            ? ""
            : value
        );
      }
    );


    button.setAttribute(
      "aria-label",
      `${value} / 5`
    );
    container.appendChild(button);
  }

}


function setSexDetailsExpanded(
  expanded
) {

  sexDetailsPanel.hidden = !expanded;
  sexDetailsToggle.setAttribute(
    "aria-expanded",
    String(expanded)
  );
  sexDetailsToggle.classList.toggle(
    "expanded",
    expanded
  );

}


function updateSexDurationPreview() {

  const duration = formatSexDuration({
    time: sexTimeInput.value,
    endTime: sexEndTimeInput.value
  });


  sexDurationOutput.textContent =
    duration
      ? `时长 · ${duration}`
      : "未计算";

}


function renderSexEditorControls() {

  renderSexSingleOptions(
    sexFormOptions,
    window.LiminalSexData
      ?.formOptions || [],
    sexEditorForm,
    function (value) {
      sexEditorForm = value;
      renderSexEditorControls();
    }
  );


  renderSexSingleOptions(
    sexProtectionOptions,
    window.LiminalSexData
      ?.protectionOptions || [],
    sexEditorProtection,
    function (value) {
      sexEditorProtection = value;

      if (value !== "yes") {
        sexEditorProtectionMethod = "";
      } else if (!sexEditorProtectionMethod) {
        sexEditorProtectionMethod = "condom";
      }

      renderSexEditorControls();
    }
  );


  sexProtectionMethodField.hidden =
    sexEditorProtection !== "yes";


  renderSexSingleOptions(
    sexProtectionMethodOptions,
    window.LiminalSexData
      ?.protectionMethods || [],
    sexEditorProtectionMethod,
    function (value) {
      sexEditorProtectionMethod = value;
      renderSexEditorControls();
    }
  );


  renderSexPositionEditor();


  renderSexSingleOptions(
    sexLocationOptions,
    window.LiminalSexData
      ?.locationOptions || [],
    sexEditorLocation,
    function (value) {
      sexEditorLocation =
        value === sexEditorLocation
          ? ""
          : value;
      renderSexEditorControls();
    }
  );


  sexCustomLocationInput.hidden =
    sexEditorLocation !== "other";


  renderSexSingleOptions(
    sexInitiatorOptions,
    window.LiminalSexData
      ?.initiatorOptions || [],
    sexEditorInitiator,
    function (value) {
      sexEditorInitiator =
        value === sexEditorInitiator
          ? ""
          : value;
      renderSexEditorControls();
    }
  );


  sexKeshiOrgasmCount.textContent =
    String(sexEditorOrgasms.keshi);


  sexLuzhenOrgasmCount.textContent =
    String(sexEditorOrgasms.luzhen);


  renderSexAidEditor();


  renderSexScaleOptions(
    sexComfortOptions,
    sexEditorComfort,
    function (value) {
      sexEditorComfort = value;
      renderSexEditorControls();
    }
  );


  renderSexScaleOptions(
    sexSatisfactionOptions,
    sexEditorSatisfaction,
    function (value) {
      sexEditorSatisfaction = value;
      renderSexEditorControls();
    }
  );


  renderSexMultiOptions(
    sexMoodBeforeOptions,
    window.LiminalSexData
      ?.moodBeforePresets || [],
    sexEditorMoodBefore,
    function (value) {
      sexEditorMoodBefore =
        sexEditorMoodBefore.includes(value)
          ? sexEditorMoodBefore.filter(
              (item) => item !== value
            )
          : [...sexEditorMoodBefore, value];
      renderSexEditorControls();
    }
  );


  renderSexMultiOptions(
    sexMoodAfterOptions,
    window.LiminalSexData
      ?.moodAfterPresets || [],
    sexEditorMoodAfter,
    function (value) {
      sexEditorMoodAfter =
        sexEditorMoodAfter.includes(value)
          ? sexEditorMoodAfter.filter(
              (item) => item !== value
            )
          : [...sexEditorMoodAfter, value];
      renderSexEditorControls();
    }
  );


  updateSexDurationPreview();

}


function openSexRecordEditor(
  dateKey = toDateKey(selectedDate),
  recordIndex = -1
) {

  const existing =
    recordIndex >= 0
      ? getSexRecords(dateKey)[recordIndex]
      : null;


  const draft = existing
    ? normalizeSexRecordForEditor(
        JSON.parse(
          JSON.stringify(existing)
        )
      )
    : {
        id: createSexRecordId(),
        time: "",
        endTime: "",
        durationMinutes: null,
        count: 1,
        form: "partner",
        protection: "yes",
        protectionMethod: "condom",
        positions: [],
        customPositions: [],
        location: "",
        customLocation: "",
        initiator: "",
        orgasms: {
          keshi: 0,
          luzhen: 0
        },
        aids: [],
        customAids: [],
        comfort: "",
        satisfaction: "",
        moodBefore: [],
        moodAfter: [],
        note: ""
      };


  editingSexRecord = {
    isExisting: Boolean(existing),
    hadDetails:
      sexRecordHasDetails(existing),
    originalDate: dateKey,
    originalIndex: recordIndex,
    originalId:
      typeof existing?.id === "string"
        ? existing.id
        : "",
    draft: draft
  };


  sexEditorForm = draft.form;
  sexEditorProtection =
    draft.protection;
  sexEditorProtectionMethod =
    draft.protectionMethod;
  sexEditorPositions = [
    ...draft.positions
  ];
  sexEditorCustomPositions = [
    ...draft.customPositions
  ];
  sexEditorCustomPresets = [
    ...(calendarData
      .sexCustomPositionPresets || [])
  ];


  const firstSelectedPosition =
    window.LiminalSexData
      ?.positionPresets
      ?.find(
        (option) =>
          draft.positions.includes(
            option.id
          )
      );


  sexEditorPositionCategory =
    firstSelectedPosition?.category ||
    (
      draft.customPositions.length
        ? "other"
        : "supine"
    );


  sexEditorLocation = draft.location;
  sexEditorInitiator = draft.initiator;
  sexEditorOrgasms = {
    keshi: draft.orgasms.keshi,
    luzhen: draft.orgasms.luzhen
  };
  sexEditorAids = [...draft.aids];
  sexEditorCustomAids = [
    ...draft.customAids
  ];
  sexEditorComfort = draft.comfort;
  sexEditorSatisfaction =
    draft.satisfaction;
  sexEditorMoodBefore = [
    ...draft.moodBefore
  ];
  sexEditorMoodAfter = [
    ...draft.moodAfter
  ];


  sexDateInput.value = dateKey;
  sexTimeInput.value = draft.time;
  sexEndTimeInput.value = draft.endTime;
  sexCountInput.value =
    String(draft.count);
  sexNoteInput.value = draft.note;
  sexCustomLocationInput.value =
    draft.customLocation;
  sexCustomPositionInput.value = "";
  sexSavePositionPreset.checked = false;
  sexCustomAidInput.value = "";


  setSexDetailsExpanded(
    Boolean(existing) &&
      sexRecordHasDetails(existing)
  );


  sexDeleteRecordButton.hidden =
    !existing;


  sexEditorActions.classList.toggle(
    "editing",
    Boolean(existing)
  );


  sexManagerTitle.textContent =
    existing
      ? "编辑亲密记录"
      : "添加亲密记录";


  sexManagerListView.hidden = true;
  sexRecordEditorView.hidden = false;


  renderSexEditorControls();

}


function removeEditingSexRecord() {

  if (
    !editingSexRecord?.isExisting
  ) {
    return false;
  }


  const records = getSexRecords(
    editingSexRecord.originalDate
  );


  let index = -1;


  if (editingSexRecord.originalId) {
    index = records.findIndex(
      (record) =>
        record.id ===
          editingSexRecord.originalId
    );
  }


  if (index < 0) {
    index =
      editingSexRecord.originalIndex;
  }


  if (
    index < 0 ||
    index >= records.length
  ) {
    return false;
  }


  records.splice(index, 1);


  if (!records.length) {
    delete calendarData.sex[
      editingSexRecord.originalDate
    ];
  }


  return true;

}


recordSexCard.addEventListener(
  "click",
  openSexManager
);


manageSexButton.addEventListener(
  "click",
  function (event) {
    event.stopPropagation();
    openSexManager();
  }
);


sexManagerClose.addEventListener(
  "click",
  closeSexManager
);


sexManagerBackdrop.addEventListener(
  "click",
  function (event) {
    if (event.target === sexManagerBackdrop) {
      closeSexManager();
    }
  }
);


sexAddRecordButton.addEventListener(
  "click",
  function () {
    openSexRecordEditor();
  }
);


sexRecordBackButton.addEventListener(
  "click",
  renderSexManagerList
);


sexCancelEditButton.addEventListener(
  "click",
  renderSexManagerList
);


sexAddCustomPositionButton.addEventListener(
  "click",
  function () {

    const name =
      sexCustomPositionInput.value.trim();


    if (!name) {
      sexCustomPositionInput.focus();
      return;
    }


    if (
      !sexEditorCustomPositions.includes(name)
    ) {
      sexEditorCustomPositions.push(name);
    }


    if (
      sexSavePositionPreset.checked &&
      !sexEditorCustomPresets.includes(name)
    ) {
      sexEditorCustomPresets.push(name);
    }


    sexCustomPositionInput.value = "";
    sexSavePositionPreset.checked = false;
    renderSexPositionEditor();

  }
);


sexDetailsToggle.addEventListener(
  "click",
  function () {
    setSexDetailsExpanded(
      sexDetailsPanel.hidden
    );
  }
);


sexTimeInput.addEventListener(
  "input",
  updateSexDurationPreview
);


sexEndTimeInput.addEventListener(
  "input",
  updateSexDurationPreview
);


sexDetailsPanel.addEventListener(
  "click",
  function (event) {

    const stepButton =
      event.target.closest(
        "[data-sex-step]"
      );


    if (!stepButton) {
      return;
    }


    const stepper =
      stepButton.closest(
        "[data-sex-orgasm-owner]"
      );


    const owner =
      stepper?.dataset
        .sexOrgasmOwner;


    if (
      owner !== "keshi" &&
      owner !== "luzhen"
    ) {
      return;
    }


    const delta = Number(
      stepButton.dataset.sexStep
    );


    sexEditorOrgasms[owner] =
      Math.max(
        0,
        sexEditorOrgasms[owner] + delta
      );


    renderSexEditorControls();

  }
);


sexAddCustomAidButton.addEventListener(
  "click",
  function () {

    const name =
      sexCustomAidInput.value.trim();


    if (!name) {
      sexCustomAidInput.focus();
      return;
    }


    if (
      !sexEditorCustomAids.includes(name)
    ) {
      sexEditorCustomAids.push(name);
    }


    sexEditorAids =
      sexEditorAids.filter(
        (item) => item !== "none"
      );
    sexCustomAidInput.value = "";
    renderSexAidEditor();

  }
);


sexSaveRecordButton.addEventListener(
  "click",
  function () {

    const dateKey =
      sexDateInput.value;


    const time =
      sexTimeInput.value;


    const count = Number(
      sexCountInput.value
    );


    if (!isValidDateKey(dateKey)) {
      window.alert("请选择记录日期。");
      return;
    }


    if (
      time &&
      !isValidSexTime(time)
    ) {
      window.alert("请输入有效的时间。");
      return;
    }


    const endTime =
      sexEndTimeInput.value;


    if (
      endTime &&
      !isValidSexTime(endTime)
    ) {
      window.alert("请输入有效的结束时间。");
      return;
    }


    if (
      !Number.isInteger(count) ||
      count < 1
    ) {
      window.alert("次数必须是大于 0 的整数。");
      return;
    }


    const record = {
      ...editingSexRecord.draft,
      id: editingSexRecord.draft.id,
      time: time,
      count: count,
      form: sexEditorForm,
      protection: sexEditorProtection,
      protectionMethod:
        sexEditorProtection === "yes"
          ? sexEditorProtectionMethod
          : "",
      positions: [
        ...new Set(sexEditorPositions)
      ],
      customPositions: [
        ...new Set(
          sexEditorCustomPositions
        )
      ],
      note: sexNoteInput.value
    };


    const shouldSaveDetails =
      !sexDetailsPanel.hidden ||
      editingSexRecord.hadDetails;


    const detailKeys = [
      "endTime",
      "durationMinutes",
      "location",
      "customLocation",
      "initiator",
      "orgasms",
      "aids",
      "customAids",
      "comfort",
      "satisfaction",
      "moodBefore",
      "moodAfter"
    ];


    detailKeys.forEach(
      (key) => delete record[key]
    );


    if (shouldSaveDetails) {

      const durationMinutes =
        calculateSexDurationMinutes(
          time,
          endTime
        );


      record.endTime = endTime;


      if (durationMinutes !== null) {
        record.durationMinutes =
          durationMinutes;
      }


      record.location =
        sexEditorLocation;
      record.customLocation =
        sexEditorLocation === "other"
          ? sexCustomLocationInput.value
          : "";
      record.initiator =
        sexEditorInitiator;
      record.orgasms = {
        keshi:
          sexEditorOrgasms.keshi,
        luzhen:
          sexEditorOrgasms.luzhen
      };
      record.aids = [
        ...new Set(sexEditorAids)
      ];
      record.customAids = [
        ...new Set(
          sexEditorCustomAids
        )
      ];
      record.comfort =
        sexEditorComfort;
      record.satisfaction =
        sexEditorSatisfaction;
      record.moodBefore = [
        ...new Set(
          sexEditorMoodBefore
        )
      ];
      record.moodAfter = [
        ...new Set(
          sexEditorMoodAfter
        )
      ];

    }


    if (editingSexRecord.isExisting) {
      removeEditingSexRecord();
    }


    if (
      !Array.isArray(
        calendarData.sex[dateKey]
      )
    ) {
      calendarData.sex[dateKey] = [];
    }


    calendarData.sex[dateKey].push(
      record
    );


    calendarData
      .sexCustomPositionPresets = [
        ...new Set(
          sexEditorCustomPresets
        )
      ];


    selectedDate = dateFromKey(dateKey);
    viewYear = selectedDate.getFullYear();
    viewMonth = selectedDate.getMonth();


    saveCalendarData();
    renderSexManagerList();
    renderAll();

  }
);


sexDeleteRecordButton.addEventListener(
  "click",
  function () {

    if (
      !editingSexRecord?.isExisting ||
      !window.confirm(
        "确定删除这条亲密记录吗？"
      )
    ) {
      return;
    }


    removeEditingSexRecord();
    saveCalendarData();
    renderSexManagerList();
    renderAll();

  }
);


/* =========================
   Body / Sleep / Sex
   ========================= */

function formatBodyDiscomfort(
  value
) {

  const discomfort =
    normalizeBodyDiscomfort(
      value
    );


  const symptom =
    discomfort.symptom
      .trim();


  if (
    !symptom
  ) {

    return "";

  }


  if (
    discomfort.allDay
  ) {

    return (
      `全天 · ${symptom}`
    );

  }


  if (
    discomfort.startTime &&
    discomfort.endTime
  ) {

    return (
      `${discomfort.startTime}–` +
      `${discomfort.endTime} · ` +
      symptom
    );

  }


  if (
    discomfort.startTime
  ) {

    return (
      `${discomfort.startTime} · ` +
      symptom
    );

  }


  return symptom;

}


function formatBodyRecord(
  dateKey,
  personId =
    "keshi"
) {

  const library =
    personId ===
      "luzhen"
      ? calendarData
          .bodyLuzhen
      : calendarData
          .body;


  const record =
    library
      ?.[dateKey];


  const cycleLines =
    personId === "keshi"
      ? getCycleDayLines(dateKey)
      : [];


  if (
    !record
  ) {

    return cycleLines.length
      ? cycleLines.join("\n")
      : "暂无记录";

  }


  const lines =
    [];


  const discomfortLines =
    (
      Array.isArray(
        record.discomforts
      )
        ? record.discomforts
        : []
    )
      .map(
        formatBodyDiscomfort
      )
      .filter(Boolean);


  const legacyPain =
    typeof record.pain ===
      "string"
      ? record.pain.trim()
      : "";


  if (
    record.energy
  ) {

    lines.push(
      `精力 ${record.energy}`
    );

  }


  if (
    record.appetite
  ) {

    lines.push(
      `食欲 ${record.appetite}`
    );

  }


  const visibleLegacyPain =
    legacyPain &&
    !(
      discomfortLines.length &&
      legacyPain ===
        "无"
    )
      ? legacyPain
      : "";


  if (
    visibleLegacyPain ||
    discomfortLines.length
  ) {

    if (
      lines.length
    ) {

      lines.push(
        ""
      );

    }


    lines.push(
      "身体不适"
    );


    if (
      visibleLegacyPain
    ) {

      lines.push(
        visibleLegacyPain
      );

    }


    lines.push(
      ...discomfortLines
    );

  }


  if (cycleLines.length) {

    if (lines.length) {
      lines.push("");
    }


    lines.push(...cycleLines);

  }


  if (
    record.note
  ) {

    if (
      lines.length
    ) {

      lines.push(
        ""
      );

    }


    lines.push(
      "备注",
      record.note
    );

  }


  return (
    lines.length
      ? lines.join(
          "\n"
        )
      : "暂无记录"
  );

}


function formatSleepRecord(
  dateKey,
  personId =
    "keshi"
) {

  const library =
    personId ===
      "luzhen"
      ? calendarData
          .sleepLuzhen
      : calendarData
          .sleep;


  const record =
    library
      ?.[dateKey];


  if (
    !record
  ) {

    return "暂无记录";

  }


  const lines =
    [];


  if (
    record.start ||
    record.end
  ) {

    lines.push(
      `${record.start || "—"} – ${record.end || "—"}`
    );

  }


  const duration =
    record.duration ||
    calculateSleepDuration(
      record.start,
      record.end
    );


  const meta =
    [
      duration,
      record.quality
    ]
      .filter(Boolean)
      .join(" · ");


  if (
    meta
  ) {

    lines.push(
      meta
    );

  }


  if (
    record.nap
  ) {

    lines.push(
      record.nap
    );

  }


  return (
    lines.length
      ? lines.join(
          "\n"
        )
      : "暂无记录"
  );

}



function formatSexRecord(
  dateKey
) {

  const entries =
    getSortedSexEntries(dateKey);


  if (
    !entries.length
  ) {

    return "暂无记录";

  }


  return entries
    .map(
      function (
        entry,
        index
      ) {

        const record =
          entry.record;


        const protection =
          getSexProtectionLabel(
            record.protection
          );


        const protectionMethod =
          (
            resolveSexOptionId(
              window.LiminalSexData
                ?.protectionOptions || [],
              record.protection,
              "na"
            ) === "yes"
          )
            ? getSexProtectionMethodLabel(
                record.protectionMethod
              )
            : "";


        const positions = [
          ...(
            Array.isArray(record.positions)
              ? record.positions
                  .map(getSexPositionLabel)
                  .filter(Boolean)
              : []
          ),
          ...(
            Array.isArray(
              record.customPositions
            )
              ? record.customPositions
                  .filter(
                    (item) =>
                      typeof item === "string" &&
                      item.trim()
                  )
              : []
          )
        ];

        return [

          `${index + 1}. ${
            formatSexTimeRange(record)
          }`,

          `形式：${
            getSexFormLabel(
              record.form
            )
          }`,

          `次数：${
            getSexCount(record)
          }`,

          (
            `保护：${
              protection
            }${
              protectionMethod
                ? ` · ${protectionMethod}`
                : ""
            }`
          ),

          (
            `体位：${
              positions.length
                ? positions.join(" / ")
                : "未记录"
            }`
          ),

          ...(
            getSexLocationLabel(record)
              ? [
                  `地点：${
                    getSexLocationLabel(record)
                  }`
                ]
              : []
          )

        ].join(
          "\n"
        );

      }
    )
    .join(
      "\n\n"
    );

}


function formatSexCard(
  dateKey
) {

  const entries =
    getSortedSexEntries(dateKey);


  if (!entries.length) {
    return "暂无记录";
  }


  return [
    `共 ${getSexTotalCount(dateKey)} 次`,
    "",
    ...entries.map(
      function (entry) {
        const record = entry.record;
        const lines = [
          `${formatSexTimeRange(record)} · ` +
            getSexFormLabel(record.form)
        ];


        const positions =
          getSexDisplayPositions(record);


        if (positions.length) {
          lines.push(
            positions.join(" / ")
          );
        }


        const location =
          getSexLocationLabel(record);


        if (location) {
          lines.push(location);
        }


        return lines.join("\n");
      }
    )
  ].join("\n");

}



/* =========================
   当天传讯
   ========================= */

function renderSelectedDayTransmissions() {

  const dateKey =
    toDateKey(
      selectedDate
    );


  const records =
    Array.isArray(
      calendarData.transmissions
    )
      ? calendarData
          .transmissions
          .filter(
            function (
              record
            ) {

              return (
                record.date ===
                dateKey
              );

            }
          )
          .slice()

      : [];


  /*
    同一天内：
    按时间从早到晚。
  */

  records.sort(
    function (
      a,
      b
    ) {

      return (
        (
          a.time ||
          "00:00"
        ).localeCompare(
          b.time ||
          "00:00"
        )
      );

    }
  );


  sheetTransmissionTimeline
    .innerHTML =
      "";


  if (
    !records.length
  ) {

    sheetTransmissionTimeline
      .appendChild(

        make(
          "div",
          "transmission-empty",
          "当天暂无传讯"
        )

      );


    return;

  }


  const typeNames = {

    tarot:
      "塔罗",

    mediumship:
      "通灵",

    other:
      "其他"

  };


  records.forEach(
    function (
      record
    ) {

      const item =
        make(
          "article",
          "transmission-item"
        );


      const track =
        make(
          "div",
          "transmission-track"
        );


      track.appendChild(

        make(
          "span",
          "transmission-dot"
        )

      );


      const content =
        make(
          "div",
          "transmission-content"
        );


      const meta =
        make(
          "div",
          "transmission-meta"
        );


      meta.append(

        make(
          "span",
          "transmission-date",
          record.time ||
            "未记录时间"
        ),

        make(
          "span",
          "transmission-type",
          typeNames[
            record.type
          ] ||
            "其他"
        )

      );


      content.append(

        meta,

        make(
          "strong",
          "",
          record.title ||
            "未命名传讯"
        )

      );


      if (
        record.summary
      ) {

        content.appendChild(

          make(
            "p",
            "transmission-summary",
            record.summary
          )

        );

      }


      if (
        record.source
      ) {

        content.appendChild(

          make(
            "span",
            "transmission-source",
            `来源 · ${record.source}`
          )

        );

      }


      item.append(
        track,
        content
      );


      sheetTransmissionTimeline
        .appendChild(
          item
        );

    }
  );

}



/* =========================
   首页日期总览
   ========================= */

function renderSingleOverviewValue(
  container,
  text
) {

  container.classList.remove(
    "dual-person-value"
  );


  container.innerHTML =
    "";


  container.textContent =
    text;

}



function renderDualOverviewValue(
  container,
  keshiText,
  luzhenText
) {

  container.classList.add(
    "dual-person-value"
  );


  container.innerHTML =
    "";


  const people = [

    {
      name:
        "Keshi",

      text:
        keshiText
    },


    {
      name:
        "榛榛",

      text:
        luzhenText
    }

  ];


  people.forEach(
    function (
      person
    ) {

      const card =
        make(
          "article",
          "dual-person-card"
        );


      card.append(

        make(
          "strong",
          "",
          person.name
        ),

        make(
          "p",
          "",
          person.text
        )

      );


      container.appendChild(
        card
      );

    }
  );

}



function renderDayOverview() {

  const dateKey =
    toDateKey(
      selectedDate
    );


  sheetDateTitle.textContent =
    formatDateTitle(
      selectedDate
    );



  /*
    大事：

    我的：
    看 Keshi 与共同大事

    我们：
    看两个人的全部大事
  */

  const allMilestones =
    calendarData.milestones
      ?.[dateKey] ||
    [];


  const visibleMilestones =
    dayOverviewMode ===
      "both"

      ? allMilestones

      : allMilestones.filter(
          function (
            item
          ) {

            return milestoneOwnerIncludes(
              item.owner,
              "keshi"
            );

          }
        );


  sheetMilestone.textContent =
    visibleMilestones.length

      ? visibleMilestones
          .map(
            function (
              item
            ) {

              return item.title;

            }
          )
          .join(
            "\n"
          )

      : "—";



  /*
    当天传讯
  */

  renderSelectedDayTransmissions();



  /*
    Body / Sleep
  */

  if (
    dayOverviewMode ===
      "mine"
  ) {

    renderSingleOverviewValue(

      sheetBody,

      formatBodyRecord(
        dateKey,
        "keshi"
      )

    );


    renderSingleOverviewValue(

      sheetSleep,

      formatSleepRecord(
        dateKey,
        "keshi"
      )

    );

  } else {

    renderDualOverviewValue(

      sheetBody,

      formatBodyRecord(
        dateKey,
        "keshi"
      ),

      formatBodyRecord(
        dateKey,
        "luzhen"
      )

    );


    renderDualOverviewValue(

      sheetSleep,

      formatSleepRecord(
        dateKey,
        "keshi"
      ),

      formatSleepRecord(
        dateKey,
        "luzhen"
      )

    );

  }



  sheetCycle.textContent =
    getCycleText(
      dateKey
    );


  sheetSex.textContent =
    formatSexRecord(
      dateKey
    );

}



function setDayOverviewMode(
  mode
) {

  dayOverviewMode =
    mode ===
      "both"
      ? "both"
      : "mine";


  dayViewButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.dayView ===
          dayOverviewMode
      );

    }
  );


  renderDayOverview();

}



dayViewButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setDayOverviewMode(
          button.dataset.dayView
        );

      }
    );

  }
);



/* =========================
   第四页记录
   ========================= */

function renderRecords() {

  const dateKey =
    toDateKey(
      selectedDate
    );


  recordDateTitle.textContent =
    formatDateTitle(
      selectedDate
    );


  if (
    recordViewMode ===
      "both"
  ) {

    recordBody.textContent =
      (
        "Keshi\n" +
        formatBodyRecord(
          dateKey,
          "keshi"
        ) +
        "\n\n榛榛\n" +
        formatBodyRecord(
          dateKey,
          "luzhen"
        )
      );


    recordSleep.textContent =
      (
        "Keshi\n" +
        formatSleepRecord(
          dateKey,
          "keshi"
        ) +
        "\n\n榛榛\n" +
        formatSleepRecord(
          dateKey,
          "luzhen"
        )
      );


    editBodyButton.textContent =
      "管理";

      editSleepButton.textContent =
  "管理";

  } else {

    recordBody.textContent =
      formatBodyRecord(
        dateKey,
        "keshi"
      );


    recordSleep.textContent =
      formatSleepRecord(
        dateKey,
        "keshi"
      );


    editBodyButton.textContent =
      getBodyRecord(
        dateKey,
        "keshi"
      )
        ? "编辑"
        : "添加";

        editSleepButton.textContent =
  getSleepRecord(
    dateKey,
    "keshi"
  )
    ? "编辑"
    : "添加";

  }


  recordCycle.textContent =
    getCycleText(
      dateKey
    );


  recordSex.textContent =
    formatSexCard(
      dateKey
    );


  manageSexButton.textContent =
    getSexRecords(dateKey).length
      ? "管理"
      : "添加";

}


function setRecordViewMode(
  mode
) {

  recordViewMode =
    mode ===
      "both"
      ? "both"
      : "mine";


  recordViewButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.recordView ===
          recordViewMode
      );

    }
  );


  renderRecords();

}


recordViewButtons.forEach(
  function (
    button
  ) {

    button.addEventListener(
      "click",
      function () {

        setRecordViewMode(
          button.dataset.recordView
        );

      }
    );

  }
);


/* =========================
   月份切换
   ========================= */

previousMonthButton.addEventListener(
  "click",
  function () {

    viewMonth -=
      1;


    if (
      viewMonth <
        0
    ) {

      viewMonth =
        11;


      viewYear -=
        1;

    }


    renderMonth();

  }
);



nextMonthButton.addEventListener(
  "click",
  function () {

    viewMonth +=
      1;


    if (
      viewMonth >
        11
    ) {

      viewMonth =
        0;


      viewYear +=
        1;

    }


    renderMonth();

  }
);



calendarTodayButton.addEventListener(
  "click",
  function () {

    selectedDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );


    viewYear =
      today.getFullYear();


    viewMonth =
      today.getMonth();


    renderAll();

  }
);



/* =========================
   日程日期切换
   ========================= */

function moveSelectedDay(
  offset
) {

  selectedDate =
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() +
        offset
    );


  viewYear =
    selectedDate.getFullYear();


  viewMonth =
    selectedDate.getMonth();


  renderAll();

}



previousScheduleDay.addEventListener(
  "click",
  function () {

    moveSelectedDay(
      -1
    );

  }
);



nextScheduleDay.addEventListener(
  "click",
  function () {

    moveSelectedDay(
      1
    );

  }
);



/* =========================
   Render All
   ========================= */

function renderAll() {

  /*
    榛榛生活模拟。

    第一次打开某个日期时：

    1. 生成榛榛日程
    2. 根据日程生成睡眠
    3. 根据睡眠 + 日程负荷生成身体状态
    4. 保存

    已经生成过的日期不会再次覆盖。
  */

  const dateKey =
    toDateKey(
      selectedDate
    );


  if (
    window.LiminalLuzhenSimulation &&
    typeof window
      .LiminalLuzhenSimulation
      .ensureDate ===
        "function"
  ) {

    const changed =
      window
        .LiminalLuzhenSimulation
        .ensureDate(
          calendarData,
          dateKey
        );


    if (
      changed
    ) {

      saveCalendarData();

    }

  }


  renderMonth();

  renderDayOverview();

  renderSchedule();

  renderTimeline();

  renderTransmissionTimeline();

  renderRecords();

}



/* =========================
   Init
   ========================= */

renderAll();
