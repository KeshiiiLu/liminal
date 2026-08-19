/* =========================================
   Liminal · 全局通话

   负责：
   1. 离开 Chat 后继续显示
      “正在通话 + 已通话时长”

   2. 在 Liminal 其他页面继续运行
      对方主动拨打电话的独立时钟

   3. 主动来电命中以后，
      在当前页面直接显示全屏来电
   ========================================= */


const GLOBAL_LIVE_CALL_SESSION_KEY =
  "liminal_live_call_session_v1";


const GLOBAL_PENDING_ANSWER_KEY =
  "liminal_global_answered_call_v1";


const GLOBAL_WORLD_RULES_KEY =
  "liminal_world_rules_v2";


const GLOBAL_TODAY_ODDS_KEY =
  "liminal_today_odds_v2";


const GLOBAL_RING_TIMEOUT =
  30000;


/* =========================================
   人物显示
   ========================================= */

const GLOBAL_CALL_PEOPLE = {

  luzhen: {
    id: "luzhen",
    name: "榛榛",
    avatar: "L"
  },

  jasper: {
    id: "jasper",
    name: "Jasper",
    avatar: "J"
  }

};


/* =========================================
   当前正在响铃的人
   ========================================= */

let globalIncomingCallPersonId =
  null;


let globalIncomingCallTimer =
  null;


/*
  每个人自己的主动拨打倒计时。
*/

const globalActiveCallTimers =
  new Map();


/* =========================================
   通用工具
   ========================================= */

function globalPadNumber(
  number
) {

  return String(
    number
  ).padStart(
    2,
    "0"
  );

}


function globalRandomIntegerBetween(
  min,
  max
) {

  min =
    Math.max(
      0,
      Math.round(
        Number(min) || 0
      )
    );


  max =
    Math.max(
      min,
      Math.round(
        Number(max) || min
      )
    );


  return (
    Math.floor(
      Math.random() *
      (
        max - min + 1
      )
    ) +
    min
  );

}


function globalNormalizeProbability(
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

    number =
      0;

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


function globalRandomProbabilityBetween(
  min,
  max
) {

  min =
    globalNormalizeProbability(
      min
    );


  max =
    globalNormalizeProbability(
      max
    );


  if (
    min > max
  ) {

    const temporary =
      min;

    min =
      max;

    max =
      temporary;

  }


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


/* =========================================
   读取 World Rules
   ========================================= */

function globalReadWorldRules() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          GLOBAL_WORLD_RULES_KEY
        )
      );


    if (
      saved &&
      saved.people
    ) {

      return saved;

    }

  } catch (error) {

    console.warn(
      "读取 World Rules 失败",
      error
    );

  }


  return null;

}


/* =========================================
   今日日期
   ========================================= */

function globalGetTodayKey() {

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


/* =========================================
   生成今天的概率
   ========================================= */

function globalGenerateTodayOdds(
  worldData
) {

  const people = {};


  Object.entries(
    worldData.people || {}
  ).forEach(
    function (
      [personId, person]
    ) {

      const personOdds = {

        id:
          person.id ||
          personId,

        name:
          person.name ||
          "",

        domains: {}

      };


      Object.entries(
        person.domains || {}
      ).forEach(
        function (
          [domainId, domain]
        ) {

          const domainOdds = {

            id:
              domain.id ||
              domainId,

            label:
              domain.label ||
              domainId,

            rules: {}

          };


          Object.entries(
            domain.rules || {}
          ).forEach(
            function (
              [ruleId, rule]
            ) {

              if (
                rule?.type !==
                  "probability"
              ) {

                return;

              }


              domainOdds.rules[
                ruleId
              ] = {

                id:
                  rule.id ||
                  ruleId,

                label:
                  rule.label ||
                  ruleId,

                type:
                  "probability",

                min:
                  globalNormalizeProbability(
                    rule.min
                  ),

                max:
                  globalNormalizeProbability(
                    rule.max
                  ),

                today:
                  globalRandomProbabilityBetween(
                    rule.min,
                    rule.max
                  )

              };

            }
          );


          personOdds.domains[
            domainId
          ] =
            domainOdds;

        }
      );


      people[
        personId
      ] =
        personOdds;

    }
  );


  const todayData = {

    version: 2,

    date:
      globalGetTodayKey(),

    generatedAt:
      Date.now(),

    rulesUpdatedAt:
      worldData.updatedAt ||
      0,

    people:
      people

  };


  localStorage.setItem(
    GLOBAL_TODAY_ODDS_KEY,
    JSON.stringify(
      todayData
    )
  );


  return todayData;

}


/* =========================================
   读取有效今日概率
   ========================================= */

function globalGetValidTodayOdds() {

  const worldData =
    globalReadWorldRules();


  if (!worldData) {

    return null;

  }


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          GLOBAL_TODAY_ODDS_KEY
        )
      );


    if (
      saved &&
      saved.version === 2 &&
      saved.date ===
        globalGetTodayKey() &&
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
    globalGenerateTodayOdds(
      worldData
    )
  );

}


/* =========================================
   主动拨打规则
   ========================================= */

function globalGetCallRule(
  personId
) {

  const worldData =
    globalReadWorldRules();


  return (
    worldData
      ?.people
      ?.[personId]
      ?.domains
      ?.chat
      ?.rules
      ?.call ||
    null
  );

}


function globalGetTodayCallProbability(
  personId
) {

  const todayData =
    globalGetValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[personId]
      ?.domains
      ?.chat
      ?.rules
      ?.call
      ?.today ??
    null
  );

}


/* =========================================
   正在进行中的通话
   ========================================= */

function globalReadLiveCallSession() {

  try {

    const saved =
  JSON.parse(
    sessionStorage.getItem(
      GLOBAL_LIVE_CALL_SESSION_KEY
    )
  );


    if (
      saved &&
      saved.active === true &&
      saved.personId &&
      Number.isFinite(
        Number(
          saved.startedAt
        )
      )
    ) {

      return saved;

    }

  } catch (error) {

    console.warn(
      "读取正在进行的通话失败",
      error
    );

  }


  return null;

}


/* =========================================
   通话时长
   ========================================= */

function globalFormatCallDuration(
  totalSeconds
) {

  const seconds =
    Math.max(
      0,
      Math.floor(
        totalSeconds
      )
    );


  const hours =
    Math.floor(
      seconds / 3600
    );


  const minutes =
    Math.floor(
      (
        seconds % 3600
      ) / 60
    );


  const remainingSeconds =
    seconds % 60;


  if (
    hours > 0
  ) {

    return (
      `${globalPadNumber(hours)}:${globalPadNumber(minutes)}:${globalPadNumber(remainingSeconds)}`
    );

  }


  return (
    `${globalPadNumber(minutes)}:${globalPadNumber(remainingSeconds)}`
  );

}


/* =========================================
   主动拨打等待状态
   ========================================= */

function globalGetActiveCallStateKey(
  personId
) {

  return (
    `liminal_chat_active_call_state_${personId}`
  );

}


function globalGetActiveCallRuleSignature(
  personId
) {

  const rule =
    globalGetCallRule(
      personId
    );


  if (!rule) {

    return null;

  }


  const min =
    Math.max(
      0,
      Math.round(
        Number(
          rule
            ?.waitHours
            ?.min ??
          3
        )
      )
    );


  const max =
    Math.max(
      min,
      Math.round(
        Number(
          rule
            ?.waitHours
            ?.max ??
          12
        )
      )
    );


  return (
    `${min}-${max}`
  );

}


function globalGetActiveCallState(
  personId
) {

  const signature =
    globalGetActiveCallRuleSignature(
      personId
    );


  if (!signature) {

    return null;

  }


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          globalGetActiveCallStateKey(
            personId
          )
        )
      );


    if (
      saved &&
      saved.ruleSignature ===
        signature &&
      Number.isFinite(
        Number(
          saved.nextOpportunityAt
        )
      )
    ) {

      return {

        nextOpportunityAt:
          Number(
            saved.nextOpportunityAt
          ),

        ruleSignature:
          signature

      };

    }

  } catch (error) {

    console.warn(
      "读取主动拨打等待状态失败",
      error
    );

  }


  return null;

}


function globalSaveActiveCallState(
  personId,
  nextOpportunityAt
) {

  localStorage.setItem(
    globalGetActiveCallStateKey(
      personId
    ),
    JSON.stringify({

      nextOpportunityAt:
        Number(
          nextOpportunityAt
        ),

      ruleSignature:
        globalGetActiveCallRuleSignature(
          personId
        )

    })
  );

}


function globalClearActiveCallTimer(
  personId
) {

  const timer =
    globalActiveCallTimers.get(
      personId
    );


  if (timer) {

    clearTimeout(
      timer
    );

  }


  globalActiveCallTimers.delete(
    personId
  );

}


/* =========================================
   安排下一次主动拨打机会
   ========================================= */

function globalScheduleNextActiveCallOpportunity(
  personId
) {

  globalClearActiveCallTimer(
    personId
  );


  const rule =
    globalGetCallRule(
      personId
    );


  if (!rule) {

    return;

  }


  const waitHours =
    globalRandomIntegerBetween(
      rule
        ?.waitHours
        ?.min ??
        3,

      rule
        ?.waitHours
        ?.max ??
        12
    );


  const nextOpportunityAt =
    Date.now() +
    waitHours *
    60 *
    60 *
    1000;


  globalSaveActiveCallState(
    personId,
    nextOpportunityAt
  );


  const timer =
    setTimeout(
      function () {

        globalHandleActiveCallOpportunity(
          personId
        );

      },
      waitHours *
      60 *
      60 *
      1000
    );


  globalActiveCallTimers.set(
    personId,
    timer
  );

}


/* =========================================
   按原来的时间继续等待
   ========================================= */

function globalStartActiveCallTimer(
  personId
) {

  globalClearActiveCallTimer(
    personId
  );


  const state =
    globalGetActiveCallState(
      personId
    );


  /*
    没有旧的等待时间：
    正常安排一个未来机会。
  */

  if (!state) {

    globalScheduleNextActiveCallOpportunity(
      personId
    );


    return;

  }


  const remainingMilliseconds =
    state.nextOpportunityAt -
    Date.now();


  /*
    重要：

    如果切页面以后发现
    原来的电话时间已经过去，

    不准因为“打开这个页面”
    而立即触发电话。

    旧机会直接作废，
    重新安排未来时间。
  */

  if (
    remainingMilliseconds <= 0
  ) {

    localStorage.removeItem(
      globalGetActiveCallStateKey(
        personId
      )
    );


    globalScheduleNextActiveCallOpportunity(
      personId
    );


    return;

  }


  /*
    时间还没到：
    继续守着原来那一个时间。
  */

  const timer =
    setTimeout(
      function () {

        globalHandleActiveCallOpportunity(
          personId
        );

      },
      remainingMilliseconds
    );


  globalActiveCallTimers.set(
    personId,
    timer
  );

}


/* =========================================
   保存未接 / 拒绝记录
   ========================================= */

function globalSaveCallRecord(
  personId,
  text,
  status
) {

  const storageKey =
    `liminal_chat_${personId}`;


  let history = [];


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          storageKey
        )
      );


    if (
      Array.isArray(
        saved
      )
    ) {

      history =
        saved;

    }

  } catch (error) {

    console.warn(
      "读取聊天记录失败",
      error
    );

  }


  history.push({

    type:
      "call",

    direction:
      "incoming",

    callType:
      "video",

    status:
      status,

    durationSeconds:
      0,

    text:
      text,

    time:
      new Date()
        .toISOString()

  });


  localStorage.setItem(
    storageKey,
    JSON.stringify(
      history
    )
  );

}


/* =========================================
   清除全局来电
   ========================================= */

function globalClearIncomingCall() {

  if (
    globalIncomingCallTimer !==
    null
  ) {

    clearTimeout(
      globalIncomingCallTimer
    );


    globalIncomingCallTimer =
      null;

  }


  const panel =
    document.getElementById(
      "globalIncomingCallPanel"
    );


  if (panel) {

    panel.remove();

  }


  globalIncomingCallPersonId =
    null;

}


/* =========================================
   显示全屏来电
   ========================================= */

function globalShowIncomingCall(
  personId
) {

  if (
    globalIncomingCallPersonId ||
    globalReadLiveCallSession()
  ) {

    globalScheduleNextActiveCallOpportunity(
      personId
    );

    return;

  }


  const person =
    GLOBAL_CALL_PEOPLE[
      personId
    ] || {

      id:
        personId,

      name:
        personId,

      avatar:
        "?"

    };


  globalIncomingCallPersonId =
    personId;


  const panel =
    document.createElement(
      "div"
    );


  panel.id =
    "globalIncomingCallPanel";

  panel.className =
    "global-incoming-call-panel";


  panel.innerHTML = `

    <div class="global-incoming-call-content">

      <div class="global-incoming-call-avatar">
      </div>

      <strong class="global-incoming-call-name">
      </strong>

      <span class="global-incoming-call-status">
        邀请你进行视频通话
      </span>


      <div class="global-incoming-call-actions">

        <button
          class="global-incoming-call-button reject"
          type="button"
          data-call-action="reject"
        >
          <span>×</span>
          <small>拒绝</small>
        </button>


        <button
          class="global-incoming-call-button answer"
          type="button"
          data-call-action="answer"
        >
          <span>☎</span>
          <small>接听</small>
        </button>

      </div>

    </div>

  `;


  panel
    .querySelector(
      ".global-incoming-call-avatar"
    )
    .textContent =
      person.avatar;


  panel
    .querySelector(
      ".global-incoming-call-name"
    )
    .textContent =
      person.name;


  document.body.appendChild(
    panel
  );


  /*
    接听 / 拒绝
  */

  panel.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          "[data-call-action]"
        );


      if (!button) {

        return;

      }


      const action =
        button.dataset.callAction;


      /*
        拒绝
      */

      if (
        action === "reject"
      ) {

        globalClearIncomingCall();


        globalSaveCallRecord(
          personId,
          "视频通话 · 已拒绝",
          "rejected"
        );


        globalScheduleNextActiveCallOpportunity(
          personId
        );


        return;

      }


      /*
        接听
      */

      if (
        action === "answer"
      ) {

        if (
          globalIncomingCallTimer !==
          null
        ) {

          clearTimeout(
            globalIncomingCallTimer
          );

          globalIncomingCallTimer =
            null;

        }


        sessionStorage.setItem(
  GLOBAL_PENDING_ANSWER_KEY,
          JSON.stringify({

            version: 1,

            personId:
              personId,

            direction:
              "incoming",

            answeredAt:
              Date.now()

          })
        );


        window.location.href =
          `chat.html?person=${encodeURIComponent(
            personId
          )}&globalAnswer=1`;

      }

    }
  );


  /*
    30 秒没有接：
    自动记成未接听。
  */

  globalIncomingCallTimer =
    setTimeout(
      function () {

        globalIncomingCallTimer =
          null;


        if (
          globalIncomingCallPersonId !==
            personId
        ) {

          return;

        }


        globalClearIncomingCall();


        globalSaveCallRecord(
          personId,
          "视频通话 · 未接听",
          "unanswered"
        );


        globalScheduleNextActiveCallOpportunity(
          personId
        );

      },
      GLOBAL_RING_TIMEOUT
    );

}


/* =========================================
   主动拨打机会到达
   ========================================= */

function globalHandleActiveCallOpportunity(
  personId
) {

  globalClearActiveCallTimer(
    personId
  );


  localStorage.removeItem(
    globalGetActiveCallStateKey(
      personId
    )
  );


  /*
    已经有电话正在进行，
    或已有另一通正在响铃：
    本次不打扰，重新排下一次。
  */

  if (
    globalReadLiveCallSession() ||
    globalIncomingCallPersonId
  ) {

    globalScheduleNextActiveCallOpportunity(
      personId
    );

    return;

  }


  const probability =
    globalGetTodayCallProbability(
      personId
    );


  if (
    probability === null
  ) {

    globalScheduleNextActiveCallOpportunity(
      personId
    );

    return;

  }


  const roll =
    Math.random() * 100;


  if (
    roll >= probability
  ) {

    globalScheduleNextActiveCallOpportunity(
      personId
    );

    return;

  }


  /*
    判定成功：
    当前页面直接全屏来电。
  */

  globalShowIncomingCall(
    personId
  );

}


/* =========================================
   启动所有人物的主动拨打时钟
   ========================================= */

function globalStartAllActiveCallTimers() {

  const worldData =
    globalReadWorldRules();


  if (
    !worldData?.people
  ) {

    return;

  }


  /*
    如果当前就在某个人的 Chat：

    当前人物自己的主动来电钟
    已经由 chat.js 管理。

    call-global.js 只负责其他人物，
    避免同一个人同时拥有两只计时器。
  */

  let currentChatPersonId =
    null;


  const currentPage =
    window.location.pathname
      .split("/")
      .pop();


  if (
    currentPage ===
    "chat.html"
  ) {

    const params =
      new URLSearchParams(
        window.location.search
      );


    currentChatPersonId =
      params.get("person") ||
      "luzhen";

  }


  Object.keys(
    worldData.people
  ).forEach(
    function (personId) {

      /*
        当前聊天对象交给 chat.js，
        这里跳过。
      */

      if (
        personId ===
        currentChatPersonId
      ) {

        return;

      }


      const callRule =
        worldData
          ?.people
          ?.[personId]
          ?.domains
          ?.chat
          ?.rules
          ?.call;


      if (!callRule) {

        return;

      }


      globalStartActiveCallTimer(
        personId
      );

    }
  );

}


/* =========================================
   样式
   ========================================= */

const globalCallStyle =
  document.createElement(
    "style"
  );


globalCallStyle.textContent = `

  /* =========================
     通话最小化小窗
     ========================= */

  .global-call-mini-window {
    position: fixed;

    z-index: 50000;

    top: 110px;
    right: 12px;

    width: 72px;
    height: 72px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 4px;

    border-radius: 15px;

    background:
      rgba(42,42,42,.94);

    box-shadow:
      0 7px 24px
      rgba(20,20,20,.18);

    color: white;

    cursor: pointer;

    user-select: none;

    touch-action: none;

    backdrop-filter:
      blur(16px);

    transition:
      left .18s ease,
      top .18s ease;
  }


  .global-call-mini-window.dragging {
    transition: none;
  }


  .global-call-mini-icon {
    font-size: 18px;
    line-height: 1;
  }


  .global-call-mini-duration {
    font-size: 11px;

    font-variant-numeric:
      tabular-nums;
  }


  /* =========================
     全局来电
     ========================= */

  .global-incoming-call-panel {
    position: fixed;
    inset: 0;

    z-index: 60000;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    background:
      linear-gradient(
        180deg,
        #d9d5ce 0%,
        #b9b5af 100%
      );
  }


  .global-incoming-call-content {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    box-sizing: border-box;

    padding:
      calc(
        70px +
        env(safe-area-inset-top)
      )
      24px
      calc(
        48px +
        env(safe-area-inset-bottom)
      );
  }


  .global-incoming-call-avatar {
    width: 92px;
    height: 92px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 18px;

    border-radius: 50%;

    background:
      rgba(255,255,255,.45);

    color: #55524d;

    font-size: 30px;
    font-weight: 500;

    box-shadow:
      0 8px 30px
      rgba(40,40,36,.08);
  }


  .global-incoming-call-name {
    margin-bottom: 8px;

    color: #3e3c38;

    font-size: 22px;
    font-weight: 500;
  }


  .global-incoming-call-status {
    color:
      rgba(62,60,56,.62);

    font-size: 12px;
  }


  .global-incoming-call-actions {
    position: absolute;

    left: 0;
    right: 0;

    bottom:
      calc(
        48px +
        env(safe-area-inset-bottom)
      );

    display: flex;
    justify-content: center;

    gap: 76px;
  }


  .global-incoming-call-button {
    width: 72px;

    padding: 0;

    border: 0;

    background: transparent;

    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 9px;

    cursor: pointer;
  }


  .global-incoming-call-button span {
    width: 62px;
    height: 62px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    color: white;

    font-size: 27px;

    box-shadow:
      0 6px 18px
      rgba(30,30,28,.12);
  }


  .global-incoming-call-button small {
    color: #4f4c47;

    font-size: 11px;
  }


  .global-incoming-call-button.reject span {
    background: #e66562;
  }


  .global-incoming-call-button.answer span {
    background: #69b96f;
  }

`;


document.head.appendChild(
  globalCallStyle
);


/* =========================================
   创建正在通话的小窗
   ========================================= */

function globalCreateLiveCallMiniWindow(
  globalCallSession
) {

  const miniWindow =
    document.createElement(
      "div"
    );


  miniWindow.className =
    "global-call-mini-window";


  miniWindow.innerHTML = `

    <div class="global-call-mini-icon">
      ☎
    </div>

    <div class="global-call-mini-duration">
      00:00
    </div>

  `;


  document.body.appendChild(
    miniWindow
  );


  const durationElement =
    miniWindow.querySelector(
      ".global-call-mini-duration"
    );


  function updateGlobalCallDuration() {

    const elapsedSeconds =
      Math.floor(
        (
          Date.now() -
          Number(
            globalCallSession.startedAt
          )
        ) / 1000
      );


    durationElement.textContent =
      globalFormatCallDuration(
        elapsedSeconds
      );

  }


  updateGlobalCallDuration();


  setInterval(
    updateGlobalCallDuration,
    1000
  );


  /* =========================
     拖动 + 自动吸边
     ========================= */

  let dragging =
    false;

  let moved =
    false;

  let startX =
    0;

  let startY =
    0;

  let startLeft =
    0;

  let startTop =
    0;


  miniWindow.addEventListener(
    "pointerdown",
    function (event) {

      dragging =
        true;

      moved =
        false;


      const rect =
        miniWindow
          .getBoundingClientRect();


      startX =
        event.clientX;

      startY =
        event.clientY;

      startLeft =
        rect.left;

      startTop =
        rect.top;


      miniWindow.style.right =
        "auto";

      miniWindow.style.left =
        `${rect.left}px`;

      miniWindow.style.top =
        `${rect.top}px`;


      miniWindow.classList.add(
        "dragging"
      );


      miniWindow
        .setPointerCapture(
          event.pointerId
        );

    }
  );


  miniWindow.addEventListener(
    "pointermove",
    function (event) {

      if (!dragging) {

        return;

      }


      const moveX =
        event.clientX -
        startX;

      const moveY =
        event.clientY -
        startY;


      if (
        Math.abs(moveX) > 5 ||
        Math.abs(moveY) > 5
      ) {

        moved =
          true;

      }


      const margin =
        8;


      const nextLeft =
        Math.min(
          Math.max(
            margin,
            startLeft +
            moveX
          ),
          window.innerWidth -
          miniWindow.offsetWidth -
          margin
        );


      const nextTop =
        Math.min(
          Math.max(
            margin,
            startTop +
            moveY
          ),
          window.innerHeight -
          miniWindow.offsetHeight -
          margin
        );


      miniWindow.style.left =
        `${nextLeft}px`;

      miniWindow.style.top =
        `${nextTop}px`;

    }
  );


  miniWindow.addEventListener(
    "pointerup",
    function (event) {

      if (!dragging) {

        return;

      }


      dragging =
        false;


      miniWindow.classList.remove(
        "dragging"
      );


      miniWindow
        .releasePointerCapture(
          event.pointerId
        );


      /*
        没有拖动：
        点击小窗回到对应聊天。
      */

      if (!moved) {

        window.location.href =
          `chat.html?person=${encodeURIComponent(
            globalCallSession.personId
          )}&resumeCall=1`;


        return;

      }


      /*
        拖过：
        自动吸左 / 右边。
      */

      const rect =
        miniWindow
          .getBoundingClientRect();


      const margin =
        12;


      const centerX =
        rect.left +
        rect.width / 2;


      const targetLeft =
        centerX <
          window.innerWidth / 2
          ? margin
          : (
            window.innerWidth -
            rect.width -
            margin
          );


      miniWindow.style.left =
        `${targetLeft}px`;

    }
  );


  miniWindow.addEventListener(
    "pointercancel",
    function () {

      dragging =
        false;

      moved =
        false;


      miniWindow.classList.remove(
        "dragging"
      );

    }
  );

}


/* =========================================
   初始化
   ========================================= */

const globalCallSession =
  globalReadLiveCallSession();


const globalCurrentPage =
  window.location.pathname
    .split("/")
    .pop();


const globalIsChatPage =
  globalCurrentPage ===
  "chat.html";


if (globalCallSession) {

  /*
    已经正在通话。

    普通 Liminal 页面：
    显示全局小窗。

    Chat 页面：
    不创建全局小窗，
    因为 chat.js 自己已经负责
    全屏通话和 Chat 内的小窗。
  */

  if (!globalIsChatPage) {

    globalCreateLiveCallMiniWindow(
      globalCallSession
    );

  }

} else {

  /*
    没有正在通话：
    继续主动来电时钟。

    如果当前是 Chat，
    globalStartAllActiveCallTimers()
    会自动跳过当前聊天人物，
    只管理其他人物。
  */

  globalStartAllActiveCallTimers();

}