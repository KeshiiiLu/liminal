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


const recordSex =
  $("recordSex");


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



function getCycleText(
  dateKey
) {

  if (
    dateHasFlag(
      calendarData.cycle
        ?.actualPeriod,
      dateKey
    )
  ) {

    return "实际经期";

  }


  if (
    dateHasFlag(
      calendarData.cycle
        ?.predictedPeriod,
      dateKey
    )
  ) {

    return "预计经期";

  }


  if (
    dateHasFlag(
      calendarData.cycle
        ?.ovulation,
      dateKey
    )
  ) {

    return "预计排卵日";

  }


  if (
    dateHasFlag(
      calendarData.cycle
        ?.fertile,
      dateKey
    )
  ) {

    return "预计易孕期";

  }


  return "无特别周期标记";

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

              const count =
                Number(
                  record.count
                );


              return (
                total +
                (
                  Number.isFinite(
                    count
                  ) &&
                  count > 0
                    ? count
                    : 1
                )
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

function renderTimeline() {

  const events =
    [];


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
              item.owner ||
              "keshi"

          });

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
        )
      );

    }
  );


  const keshiEvents =
    events.filter(
      function (
        event
      ) {

        return (
          event.owner ===
          "keshi"
        );

      }
    );


  const luzhenEvents =
    events.filter(
      function (
        event
      ) {

        return (
          event.owner ===
          "luzhen"
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


  const leftLane =
    make(
      "div",
      "timeline-lane left"
    );


  const rightLane =
    make(
      "div",
      "timeline-lane right"
    );



  function renderLane(
    lane,
    laneEvents,
    side
  ) {

    if (
      !laneEvents.length
    ) {

      lane.appendChild(

        make(
          "div",
          "timeline-lane-empty",
          "暂无大事"
        )

      );


      return;

    }


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


        lane.appendChild(
          item
        );

      }
    );

  }


  renderLane(
    leftLane,
    keshiEvents,
    "left"
  );


  renderLane(
    rightLane,
    luzhenEvents,
    "right"
  );


  grid.append(
    leftLane,
    rightLane
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
    owner;


  milestoneOwnerButtons.forEach(
    function (
      button
    ) {

      button.classList.toggle(
        "active",

        button.dataset.owner ===
          owner
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
      event.owner ||
      "keshi"
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

          (
            item.owner ||
            "keshi"
          ) ===
            event.owner
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
          button.dataset.owner
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

                (
                  item.owner ||
                  "keshi"
                ) ===
                  editingMilestone.owner
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
          milestoneEditorOwner

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


    if (
      !dateKey
    ) {

      return;

    }


    if (
      !bodyEditorEnergy &&
      !appetite &&
      !pain &&
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


    library[
      dateKey
    ] = {

      energy:
        bodyEditorEnergy
          ? `${bodyEditorEnergy} / 5`
          : "",

      appetite:
        appetite,

      pain:
        pain,

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
   Body / Sleep / Sex
   ========================= */

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


  if (
    !record
  ) {

    return "暂无记录";

  }


  const lines =
    [];


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


  if (
    record.pain
  ) {

    lines.push(
      `疼痛 ${record.pain}`
    );

  }


  if (
    record.note
  ) {

    lines.push(
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

  const records =
    calendarData.sex
      ?.[dateKey] ||
    [];


  if (
    !records.length
  ) {

    return "暂无记录";

  }


  return records
    .map(
      function (
        record,
        index
      ) {

        return [

          `${index + 1}. ${
            record.time ||
            "未记录时间"
          }`,

          `形式：${
            record.form ||
            "未记录"
          }`,

          `次数：${
            record.count ||
            1
          }`,

          (
            `保护：${
              record.protection ||
              "未记录"
            }${
              record.protectionMethod
                ? ` · ${record.protectionMethod}`
                : ""
            }`
          ),

          (
            `姿势：${
              Array.isArray(
                record.positions
              ) &&
              record.positions.length
                ? record.positions.join(
                    " / "
                  )
                : "未记录"
            }`
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
    只看 Keshi

    我们：
    两个人都看
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

            return (
              (
                item.owner ||
                "keshi"
              ) ===
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
    formatSexRecord(
      dateKey
    );

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