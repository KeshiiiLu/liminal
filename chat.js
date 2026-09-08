const moreButton =
  document.getElementById("moreButton");

const continueSayButton =
  document.getElementById(
    "continueSayButton"
  );

const pokeButton =
  document.getElementById(
    "pokeButton"
  );


const pokeActionPanel =
  document.getElementById(
    "pokeActionPanel"
  );


const pokeActionClose =
  document.getElementById(
    "pokeActionClose"
  );

const pokeCustomInput =
  document.getElementById(
    "pokeCustomInput"
  );


const pokeCustomSend =
  document.getElementById(
    "pokeCustomSend"
  );

const morePanel =
  document.getElementById("morePanel");

const morePages =
  document.getElementById("morePages");

const chatGiftButton =
  document.getElementById("chatGiftButton");

const pageDots =
  document.querySelectorAll(".page-dot");

const chatInput =
  document.querySelector(".chat-input");

const chatMessages =
  document.getElementById("chatMessages");

  const newMessageNotice =
  document.getElementById(
    "newMessageNotice"
  );


const newMessageNoticeText =
  document.getElementById(
    "newMessageNoticeText"
  );

  const chatTransientNotice =
  document.getElementById(
    "chatTransientNotice"
  );


let chatTransientNoticeTimer =
  null;

/* =========================
 电话界面元素
 ========================= */

const videoCallButton =
  document.getElementById(
    "videoCallButton"
  );


const incomingCallPanel =
  document.getElementById(
    "incomingCallPanel"
  );


const incomingCallAvatar =
  document.getElementById(
    "incomingCallAvatar"
  );


const incomingCallName =
  document.getElementById(
    "incomingCallName"
  );


const rejectCallButton =
  document.getElementById(
    "rejectCallButton"
  );


const answerCallButton =
  document.getElementById(
    "answerCallButton"
  );


const activeCallPanel =
  document.getElementById(
    "activeCallPanel"
  );


const activeCallDuration =
  document.getElementById(
    "activeCallDuration"
  );

const localCallVideo =
  document.getElementById(
    "localCallVideo"
  );


const activeCallCameraOff =
  document.getElementById(
    "activeCallCameraOff"
  );


const callCameraButton =
  document.getElementById(
    "callCameraButton"
  );


const switchCameraButton =
  document.getElementById(
    "switchCameraButton"
  );

  const callMicButton =
  document.getElementById(
    "callMicButton"
  );


const callSpeakerButton =
  document.getElementById(
    "callSpeakerButton"
  );

const activeCallRemoteAvatar =
  document.getElementById(
    "activeCallRemoteAvatar"
  );


const activeCallRemoteName =
  document.getElementById(
    "activeCallRemoteName"
  );


const minimizeCallButton =
  document.getElementById(
    "minimizeCallButton"
  );


const hangupCallButton =
  document.getElementById(
    "hangupCallButton"
  );


const callMiniWindow =
  document.getElementById(
    "callMiniWindow"
  );


const callMiniDuration =
  document.getElementById(
    "callMiniDuration"
  );

const outgoingCallPanel =
  document.getElementById(
    "outgoingCallPanel"
  );


const outgoingCallAvatar =
  document.getElementById(
    "outgoingCallAvatar"
  );


const outgoingCallName =
  document.getElementById(
    "outgoingCallName"
  );


const outgoingCallStatus =
  document.getElementById(
    "outgoingCallStatus"
  );


const cancelOutgoingCallButton =
  document.getElementById(
    "cancelOutgoingCallButton"
  );

/*
  聊天页不让浏览器自己恢复旧滚动位置。
  每次进入都由 Liminal 决定停在哪里。
*/

if (
  "scrollRestoration" in history
) {

  history.scrollRestoration =
    "manual";

}

/* =========================
   当前聊天人物
   ========================= */

const CHAT_PEOPLE = {

  luzhen: {
    id: "luzhen",
    name: "榛榛",
    actionName: "榛榛",
    avatar: "L",
    storageKey: "liminal_chat_luzhen"
  },

  jasper: {
    id: "jasper",
    name: "Jasper",
    actionName: "Jasper",
    avatar: "J",
    storageKey: "liminal_chat_jasper"
  }

};


const chatParams =
  new URLSearchParams(
    window.location.search
  );


const requestedPersonId =
  chatParams.get("person");


const currentPerson =
  CHAT_PEOPLE[requestedPersonId] ||
  CHAT_PEOPLE.luzhen;


function renderChatAvatar(
  element,
  personId,
  fallbackText
) {

  window.LiminalAvatars.render(
    element,
    personId,
    fallbackText
  );

}


const CHAT_STORAGE_KEY =
  currentPerson.storageKey;

const POKE_STATE_KEY =
  `liminal_chat_poke_state_${currentPerson.id}`;

const ACTIVE_MESSAGE_STATE_KEY =
  `liminal_chat_active_message_state_${currentPerson.id}`;

const ACTIVE_CALL_STATE_KEY =
  `liminal_chat_active_call_state_${currentPerson.id}`;

  const LIVE_CALL_SESSION_KEY =
  "liminal_live_call_session_v1";

  const GLOBAL_PENDING_ANSWER_KEY =
  "liminal_global_answered_call_v1";

const MALL_ORDERS_KEY =
  "liminal_mall_orders_v1";

const WORLD_RULES_KEY =
  "liminal_world_rules_v2";


const TODAY_ODDS_KEY =
  "liminal_today_odds_v2";

const chatPersonName =
  document.getElementById(
    "chatPersonName"
  );

const chatPersonStatus =
  document.getElementById(
    "chatPersonStatus"
  );

const personStateEngine =
  window.LiminalChatPersonState ||
  null;


const personRuntimeState = {

  presence:
    "online",

  activity:
    null,

  mood:
    null,

  transient:
    null

};


function getCurrentPersonState(
  now = new Date()
) {

  if (!personStateEngine) {

    return {
      personId:
        currentPerson.id,
      calculatedAt:
        now.toISOString(),
      presence: {
        code:
          "online",
        displayText:
          "在线",
        source:
          "fallback"
      },
      activity:
        null,
      mood:
        null,
      transient:
        null
    };

  }


  return personStateEngine
    .getCurrentPersonState(
      currentPerson.id,
      {
        now,
        runtime:
          personRuntimeState
      }
    );

}


function resolveDisplayedStatus(
  state
) {

  if (
    personStateEngine &&
    typeof personStateEngine
      .resolveDisplayedStatus ===
      "function"
  ) {

    return personStateEngine
      .resolveDisplayedStatus(
        state
      );

  }


  return (
    state.transient ||
    state.activity ||
    state.mood ||
    state.presence ||
    {
      code:
        "offline",
      displayText:
        "离线"
    }
  );

}


function renderPersonStatus() {

  const state =
    getCurrentPersonState();


  const displayed =
    resolveDisplayedStatus(
      state
    );


  chatPersonStatus.textContent =
    displayed.displayText ||
    "在线";


  chatPersonStatus.dataset.statusCode =
    displayed.code ||
    "online";


  chatPersonStatus.dataset.statusLayer =
    displayed.layer ||
    "presence";


  chatPersonStatus.dataset.statusSource =
    displayed.source ||
    "default";


  return {
    state,
    displayed
  };

}


function setPersonStateLayer(
  layer,
  value
) {

  if (
    !Object.prototype.hasOwnProperty.call(
      personRuntimeState,
      layer
    )
  ) {

    return null;

  }


  personRuntimeState[layer] =
    value || null;


  return renderPersonStatus();

}


function setPersonTransientStatus(
  value
) {

  return setPersonStateLayer(
    "transient",
    value
  );

}


function clearPersonTransientStatus(
  expectedCode = null
) {

  const current =
    personRuntimeState.transient;


  const currentCode =
    typeof current === "string"
      ? current
      : current?.code;


  if (
    expectedCode &&
    currentCode !== expectedCode
  ) {

    return renderPersonStatus();

  }


  personRuntimeState.transient =
    null;


  return renderPersonStatus();

}


chatPersonName.textContent =
  currentPerson.name;

renderPersonStatus();

document.title =
  `${currentPerson.name} · Liminal`;


let chatHistory =
  loadStoredChatHistory();

let lastMessageTime =
  null;


window.LiminalChatStatus =
  Object.freeze({
    getCurrentPersonState,
    resolveDisplayedStatus,
    renderPersonStatus,
    setPresence:
      value =>
        setPersonStateLayer(
          "presence",
          value
        ),
    setActivity:
      value =>
        setPersonStateLayer(
          "activity",
          value
        ),
    setMood:
      value =>
        setPersonStateLayer(
          "mood",
          value
        ),
    setTransient:
      setPersonTransientStatus,
    clearTransient:
      clearPersonTransientStatus
  });

/* =========================
   读取当前人物的回复规则
   ========================= */

function getCurrentReplyRule() {

  try {

    const worldData =
      JSON.parse(
        localStorage.getItem(
          WORLD_RULES_KEY
        )
      );


    return (
      worldData
        ?.people
        ?.[currentPerson.id]
        ?.domains
        ?.chat
        ?.rules
        ?.reply ||
      null
    );

  } catch (error) {

    console.warn(
      "读取回复规则失败",
      error
    );


    return null;

  }

}

/* =========================
   读取当前人物的主动发消息规则
   ========================= */

function getCurrentActiveMessageRule() {

  try {

    const worldData =
      JSON.parse(
        localStorage.getItem(
          WORLD_RULES_KEY
        )
      );


    return (
      worldData
        ?.people
        ?.[currentPerson.id]
        ?.domains
        ?.chat
        ?.rules
        ?.message ||
      null
    );

  } catch (error) {

    console.warn(
      "读取主动发消息规则失败",
      error
    );


    return null;

  }

}

/* =========================
   读取当前人物的主动拨打规则
   ========================= */

function getCurrentCallRule() {

  try {

    const worldData =
      JSON.parse(
        localStorage.getItem(
          WORLD_RULES_KEY
        )
      );


    return (
      worldData
        ?.people
        ?.[currentPerson.id]
        ?.domains
        ?.chat
        ?.rules
        ?.call ||
      null
    );

  } catch (error) {

    console.warn(
      "读取主动拨打规则失败",
      error
    );


    return null;

  }

}

/* =========================
   读取当前人物的接听规则
   ========================= */

function getCurrentAnswerCallRule() {

  try {

    const worldData =
      JSON.parse(
        localStorage.getItem(
          WORLD_RULES_KEY
        )
      );


    return (
      worldData
        ?.people
        ?.[currentPerson.id]
        ?.domains
        ?.chat
        ?.rules
        ?.answerCall ||
      null
    );

  } catch (error) {

    console.warn(
      "读取接听规则失败",
      error
    );


    return null;

  }

}

/* =========================
   读取当前人物的继续说规则
   ========================= */

function getCurrentContinueRule() {

  try {

    const worldData =
      JSON.parse(
        localStorage.getItem(
          WORLD_RULES_KEY
        )
      );


    return (
      worldData
        ?.people
        ?.[currentPerson.id]
        ?.domains
        ?.chat
        ?.rules
        ?.continue ||
      null
    );

  } catch (error) {

    console.warn(
      "读取继续说规则失败",
      error
    );


    return null;

  }

}

/* =========================
   读取当前人物的撤回消息规则
   ========================= */

function getCurrentRecallRule() {

  try {

    const worldData =
      JSON.parse(
        localStorage.getItem(
          WORLD_RULES_KEY
        )
      );


    return (
      worldData
        ?.people
        ?.[currentPerson.id]
        ?.domains
        ?.chat
        ?.rules
        ?.recall ||
      null
    );

  } catch (error) {

    console.warn(
      "读取撤回消息规则失败",
      error
    );


    return null;

  }

}

/* =========================
   读取当前人物的拍一拍规则
   ========================= */

function getCurrentPokeRule() {

  try {

    const worldData =
      JSON.parse(
        localStorage.getItem(
          WORLD_RULES_KEY
        )
      );


    return (
      worldData
        ?.people
        ?.[currentPerson.id]
        ?.domains
        ?.chat
        ?.rules
        ?.poke ||
      null
    );

  } catch (error) {

    console.warn(
      "读取拍一拍规则失败",
      error
    );


    return null;

  }

}

/* =========================
   拍一拍运行状态
   ========================= */

/*
  当前轮次间隔规则的“签名”。

  如果你后来修改了轮次间隔，
  旧的剩余轮数就自动失效。
*/

function getPokeRuleSignature() {

  const pokeRule =
    getCurrentPokeRule();


  const min =
    Math.max(
      0,
      Math.round(
        Number(
          pokeRule
            ?.roundGap
            ?.min ??
          2
        )
      )
    );


  const max =
    Math.max(
      min,
      Math.round(
        Number(
          pokeRule
            ?.roundGap
            ?.max ??
          6
        )
      )
    );


  return (
    `${min}-${max}`
  );

}


function getPokeState() {

  const currentRuleSignature =
    getPokeRuleSignature();


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          POKE_STATE_KEY
        )
      );


    if (
      saved &&
      saved.ruleSignature ===
      currentRuleSignature &&
      Number.isFinite(
        Number(
          saved.remainingRounds
        )
      )
    ) {

      return {

        remainingRounds:
          Math.max(
            0,
            Math.round(
              Number(
                saved.remainingRounds
              )
            )
          ),

        ruleSignature:
          currentRuleSignature

      };

    }

  } catch (error) {

    console.warn(
      "读取拍一拍状态失败",
      error
    );

  }


  /*
    没有旧状态，
    或轮次间隔规则已经修改：
    从 0 轮重新开始。
  */

  return {

    remainingRounds: 0,

    ruleSignature:
      currentRuleSignature

  };

}


function savePokeState(
  state
) {

  const nextState = {

    remainingRounds:
      Math.max(
        0,
        Math.round(
          Number(
            state
              ?.remainingRounds
          ) ||
          0
        )
      ),

    ruleSignature:
      getPokeRuleSignature()

  };


  localStorage.setItem(
    POKE_STATE_KEY,
    JSON.stringify(
      nextState
    )
  );

}

/* =========================
   主动发消息等待状态
   ========================= */

let activeMessageTimer =
  null;


/*
  当前等待时间规则的“签名”。

  如果以后修改了等待分钟范围，
  旧的等待时间自动失效，
  重新抽一个新的。
*/

function getActiveMessageRuleSignature() {

  const rule =
    getCurrentActiveMessageRule();


  const min =
    Math.max(
      0,
      Math.round(
        Number(
          rule
            ?.waitMinutes
            ?.min ??
          30
        )
      )
    );


  const max =
    Math.max(
      min,
      Math.round(
        Number(
          rule
            ?.waitMinutes
            ?.max ??
          180
        )
      )
    );


  return (
    `${min}-${max}`
  );

}


/* 读取已经保存的下一次机会 */

function getActiveMessageState() {

  const currentRuleSignature =
    getActiveMessageRuleSignature();


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          ACTIVE_MESSAGE_STATE_KEY
        )
      );


    if (
      saved &&
      saved.ruleSignature ===
      currentRuleSignature &&
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
          currentRuleSignature

      };

    }

  } catch (error) {

    console.warn(
      "读取主动发消息等待状态失败",
      error
    );

  }


  return null;

}


/* 保存下一次机会 */

function saveActiveMessageState(
  state
) {

  localStorage.setItem(
    ACTIVE_MESSAGE_STATE_KEY,
    JSON.stringify({

      nextOpportunityAt:
        Number(
          state.nextOpportunityAt
        ),

      ruleSignature:
        getActiveMessageRuleSignature()

    })
  );

}


/* 清除当前网页里的倒计时 */

function clearActiveMessageTimer() {

  if (
    activeMessageTimer !==
    null
  ) {

    clearTimeout(
      activeMessageTimer
    );


    activeMessageTimer =
      null;

  }

}


/* =========================
   到达一次主动发消息机会
   ========================= */

function handleActiveMessageOpportunity() {

  activeMessageTimer =
    null;


  /*
    旧的这个机会已经到点，
    先从保存状态里清掉。
  */

  localStorage.removeItem(
    ACTIVE_MESSAGE_STATE_KEY
  );


  const activeProbability =
    getCurrentTodayActiveMessageProbability();


  if (
    activeProbability === null
  ) {

    console.warn(
      "没有读取到今日主动发消息概率"
    );


    scheduleNextActiveMessageOpportunity();

    return;

  }


  const roll =
    Math.random() * 100;


  const shouldSend =
    roll <
    activeProbability;


  /*
    这一次机会判定失败：
    什么都不发，
    重新等待下一次机会。
  */

  if (!shouldSend) {

    console.log(
      "主动发消息判定失败"
    );


    scheduleNextActiveMessageOpportunity();

    return;

  }

  /*
    概率判定成功，
    但当前没有任何真实可抽语料时，
    不生成假回复。
  */

  if (
    !hasDrawableCorpusPool(
      currentPerson.id
    )
  ) {

    console.warn(
      "当前语料池没有可抽取内容"
    );


    scheduleNextActiveMessageOpportunity();

    return;

  }

  const activeRule =
    getCurrentActiveMessageRule();


  const messageCount =
    randomIntegerBetween(
      activeRule
        ?.messageCount
        ?.min ??
      1,

      activeRule
        ?.messageCount
        ?.max ??
      4
    );


  const intervalMin =
    activeRule
      ?.messageIntervalSeconds
      ?.min ??
    2;


  const intervalMax =
    activeRule
      ?.messageIntervalSeconds
      ?.max ??
    12;


  /*
    开始主动发这一轮消息。
  */

  function sendActiveMessage(
    index
  ) {

        const text =
      drawCorpusText(
        currentPerson.id
      );


    if (!text) {

      console.warn(
        "主动消息抽取失败：当前没有可用语料"
      );


      scheduleNextActiveMessageOpportunity();

      return;

    }


    addIncomingMessage(
      text,
      new Date()
    );


    /*
      这一轮主动消息全部发完。
  */

    if (
      index >=
      messageCount - 1
    ) {

      /*
        对方完成一轮消息后，
        也照常判定动作浮窗。
      */

      triggerPokeAfterRound();


      /*
        整轮结束以后，
        再开始等待下一次主动消息机会。
      */

      scheduleNextActiveMessageOpportunity();


      return;

    }


    /*
      下一条消息之间，
      每次重新随机间隔。
    */

    const intervalSeconds =
      randomIntegerBetween(
        intervalMin,
        intervalMax
      );


    setTimeout(
      function () {

        sendActiveMessage(
          index + 1
        );

      },
      intervalSeconds * 1000
    );

  }


  /*
    到达机会并判定成功后，
    第一条直接发出。
  */

  sendActiveMessage(
    0
  );

}


/* =========================
   按保存的时间继续等待
   ========================= */

function startActiveMessageTimer() {

  clearActiveMessageTimer();


  const state =
    getActiveMessageState();


  if (!state) {

    scheduleNextActiveMessageOpportunity();

    return;

  }


  const remainingMilliseconds =
    state.nextOpportunityAt -
    Date.now();


  /*
    如果关闭网页期间，
    这个时间已经到了，
    重新打开时立刻处理。
  */

  if (
    remainingMilliseconds <= 0
  ) {

    handleActiveMessageOpportunity();

    return;

  }


  activeMessageTimer =
    setTimeout(
      function () {

        handleActiveMessageOpportunity();

      },
      remainingMilliseconds
    );

}


/* =========================
   随机安排下一次主动发消息机会
   ========================= */

function scheduleNextActiveMessageOpportunity() {

  clearActiveMessageTimer();


  const rule =
    getCurrentActiveMessageRule();


  const waitMinutes =
    randomIntegerBetween(
      rule
        ?.waitMinutes
        ?.min ??
      30,

      rule
        ?.waitMinutes
        ?.max ??
      180
    );


  const nextOpportunityAt =
    Date.now() +
    waitMinutes *
    60 *
    1000;


  saveActiveMessageState({

    nextOpportunityAt:
      nextOpportunityAt

  });


  activeMessageTimer =
    setTimeout(
      function () {

        handleActiveMessageOpportunity();

      },
      waitMinutes *
      60 *
      1000
    );

}

/* =========================
   主动拨打电话等待状态
   ========================= */

let activeCallTimer =
  null;


/*
  当前主动拨打等待规则的“签名”。

  如果以后修改等待小时范围，
  旧的等待时间自动失效，
  重新抽一个新的。
*/

function getActiveCallRuleSignature() {

  const rule =
    getCurrentCallRule();


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


/* 读取已经保存的下一次电话机会 */

function getActiveCallState() {

  const currentRuleSignature =
    getActiveCallRuleSignature();


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          ACTIVE_CALL_STATE_KEY
        )
      );


    if (
      saved &&
      saved.ruleSignature ===
      currentRuleSignature &&
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
          currentRuleSignature

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


/* 保存下一次电话机会 */

function saveActiveCallState(
  state
) {

  localStorage.setItem(
    ACTIVE_CALL_STATE_KEY,
    JSON.stringify({

      nextOpportunityAt:
        Number(
          state.nextOpportunityAt
        ),

      ruleSignature:
        getActiveCallRuleSignature()

    })
  );

}


/* 清除当前网页里的电话倒计时 */

function clearActiveCallTimer() {

  if (
    activeCallTimer !==
    null
  ) {

    clearTimeout(
      activeCallTimer
    );


    activeCallTimer =
      null;

  }

}


/* =========================
   到达一次主动拨打机会
   ========================= */

function handleActiveCallOpportunity() {

  activeCallTimer =
    null;


  /*
    这个已经到点的机会用完了。
  */

  localStorage.removeItem(
    ACTIVE_CALL_STATE_KEY
  );


  const callProbability =
    getCurrentTodayCallProbability();


  if (
    callProbability === null
  ) {

    console.warn(
      "没有读取到今日主动拨打概率"
    );


    scheduleNextActiveCallOpportunity();

    return;

  }


  const roll =
    Math.random() * 100;


  const shouldCall =
    roll <
    callProbability;


  /*
    这一次没有决定打电话：
    安静地重新等下一次机会。
  */

  if (!shouldCall) {

    console.log(
      "主动拨打电话判定失败"
    );


    scheduleNextActiveCallOpportunity();

    return;

  }


  /*
    判定成功：
    真正显示来电。

    这里暂时不安排下一次电话，
    等这通电话结束以后再重新计时。
  */

  showIncomingCall();

}


/* =========================
   按保存的时间继续等待
   ========================= */

function startActiveCallTimer() {

  clearActiveCallTimer();


  const state =
    getActiveCallState();


  /*
    从来没有安排过下一次电话：
    现在正常抽一个未来时间。
  */

  if (!state) {

    scheduleNextActiveCallOpportunity();

    return;

  }


  const remainingMilliseconds =
    state.nextOpportunityAt -
    Date.now();


  /*
    重要：
    如果这个时间是在关闭页面、
    切换页面期间错过的，

    不补打一通电话。

    直接把旧机会作废，
    重新安排未来的下一次机会。

    这样“进入 Chat”本身
    永远不会触发来电。
  */

  if (
    remainingMilliseconds <= 0
  ) {

    localStorage.removeItem(
      ACTIVE_CALL_STATE_KEY
    );


    scheduleNextActiveCallOpportunity();


    return;

  }


  /*
    原来的时间还没到：
    继续等待同一个时间。
  */

  activeCallTimer =
    setTimeout(
      function () {

        handleActiveCallOpportunity();

      },
      remainingMilliseconds
    );

}


/* =========================
   随机安排下一次主动拨打机会
   ========================= */

function scheduleNextActiveCallOpportunity() {

  clearActiveCallTimer();


  const rule =
    getCurrentCallRule();


  const waitHours =
    randomIntegerBetween(
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


  saveActiveCallState({

    nextOpportunityAt:
      nextOpportunityAt

  });


  activeCallTimer =
    setTimeout(
      function () {

        handleActiveCallOpportunity();

      },
      waitHours *
      60 *
      60 *
      1000
    );

}

/* =========================
   聊天活动后重新计算主动消息等待
   ========================= */

function resetActiveMessageWait() {

  localStorage.removeItem(
    ACTIVE_MESSAGE_STATE_KEY
  );


  scheduleNextActiveMessageOpportunity();

}

/* =========================
   拍一拍判定
   ========================= */

function shouldTriggerPokeAfterRound() {

  const pokeState =
    getPokeState();


  /*
    还处在轮次间隔里：
    本轮直接跳过，并减少 1 轮
  */

  if (
    pokeState.remainingRounds > 0
  ) {

    pokeState.remainingRounds -=
      1;


    savePokeState(
      pokeState
    );


    return false;

  }


  /*
    轮次间隔结束：
    用今天的拍一拍概率判定
  */

  const pokeProbability =
    getCurrentTodayPokeProbability();


  if (
    pokeProbability === null
  ) {

    console.warn(
      "没有读取到今日拍一拍概率"
    );

    return false;

  }


  const roll =
    Math.random() * 100;


  const shouldPoke =
    roll <
    pokeProbability;


  if (!shouldPoke) {

    return false;

  }


  /*
    本次拍一拍成功：
    随机生成下一次需要跳过的轮数
  */

  const pokeRule =
    getCurrentPokeRule();


  const nextRoundGap =
    randomIntegerBetween(
      pokeRule
        ?.roundGap
        ?.min ??
      2,

      pokeRule
        ?.roundGap
        ?.max ??
      6
    );


  savePokeState({

    remainingRounds:
      nextRoundGap

  });


  return true;

}

/* =========================
   执行拍一拍 / 动作浮窗
   ========================= */

function triggerPokeAfterRound() {

  const shouldPoke =
    shouldTriggerPokeAfterRound();


  if (!shouldPoke) {

    return;

  }


  const result =
    drawPokeAction(
      currentPerson.id,
      currentPerson.name
    );


  /*
    当前人物没有正式动作语料时，
    不拿其他人物或测试语料代替。
  */

  if (!result) {

    console.warn(
      `${currentPerson.name}目前没有可用的拍一拍语料`
    );

    return;

  }


  addPokeMessage(
    result.text,
    new Date()
  );

}

/* =========================
   读取今天固定的回复概率
   ========================= */

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
   今日概率工具
   ========================= */

function normalizeWorldProbability(
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


/* 在概率范围内随机到 0.1% */

function randomWorldProbabilityBetween(
  min,
  max
) {

  min =
    normalizeWorldProbability(
      min
    );


  max =
    normalizeWorldProbability(
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


/* 根据 World Rules 生成今天全部概率 */

function generateWorldTodayOdds(
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
                  normalizeWorldProbability(
                    rule.min
                  ),

                max:
                  normalizeWorldProbability(
                    rule.max
                  ),

                today:
                  randomWorldProbabilityBetween(
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
      getTodayKey(),

    generatedAt:
      Date.now(),

    rulesUpdatedAt:
      worldData.updatedAt ||
      0,

    people:
      people

  };


  localStorage.setItem(
    TODAY_ODDS_KEY,
    JSON.stringify(
      todayData
    )
  );


  return todayData;

}


/* 读取有效的今日概率，没有就自动生成 */

function getValidTodayOdds() {

  let worldData;


  try {

    worldData =
      JSON.parse(
        localStorage.getItem(
          WORLD_RULES_KEY
        )
      );

  } catch (error) {

    console.warn(
      "读取 World Rules 失败",
      error
    );


    return null;

  }


  if (
    !worldData ||
    !worldData.people
  ) {

    return null;

  }


  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          TODAY_ODDS_KEY
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
    generateWorldTodayOdds(
      worldData
    )
  );

}


/* 读取当前人物今天的回复概率 */

function getCurrentTodayReplyProbability() {

  const todayData =
    getValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.chat
      ?.rules
      ?.reply
      ?.today ??
    null
  );

}

/* 读取当前人物今天的主动发消息概率 */

function getCurrentTodayActiveMessageProbability() {

  const todayData =
    getValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.chat
      ?.rules
      ?.message
      ?.today ??
    null
  );

}

/* 读取当前人物今天的主动拨打概率 */

function getCurrentTodayCallProbability() {

  const todayData =
    getValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.chat
      ?.rules
      ?.call
      ?.today ??
    null
  );

}

/* 读取当前人物今天的接听概率 */

function getCurrentTodayAnswerCallProbability() {

  const todayData =
    getValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.chat
      ?.rules
      ?.answerCall
      ?.today ??
    null
  );

}

/* 读取当前人物今天的拒接概率 */

function getCurrentTodayRejectCallProbability() {

  const todayData =
    getValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.chat
      ?.rules
      ?.rejectCall
      ?.today ??
    null
  );

}

/* 读取当前人物今天的继续说概率 */

function getCurrentTodayContinueProbability() {

  const todayData =
    getValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.chat
      ?.rules
      ?.continue
      ?.today ??
    null
  );

}

/* 读取当前人物今天的拍一拍概率 */

function getCurrentTodayPokeProbability() {

  const todayData =
    getValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.chat
      ?.rules
      ?.poke
      ?.today ??
    null
  );

}

/* 读取当前人物今天的撤回消息概率 */

function getCurrentTodayRecallProbability() {

  const todayData =
    getValidTodayOdds();


  return (
    todayData
      ?.people
      ?.[currentPerson.id]
      ?.domains
      ?.chat
      ?.rules
      ?.recall
      ?.today ??
    null
  );

}

/* =========================
   视频通话 · 设备开关状态
   ========================= */

const CALL_DEVICE_STATE_KEY =
  "liminal_call_device_state_v1";


/*
  保存的是：
  “这一通电话里，我希望设备开还是关”。

  它和真实摄像头有没有正在取景
  是两回事。

  所以最小化时释放摄像头，
  不会被当成“手动关闭摄像头”。
*/

function saveCallDeviceState() {

  sessionStorage.setItem(
    CALL_DEVICE_STATE_KEY,
    JSON.stringify({

      cameraEnabled:
        localCameraEnabled,

      microphoneEnabled:
        localMicrophoneEnabled

    })
  );

}


function resetCallDeviceState() {

  localCameraEnabled =
    true;

  localMicrophoneEnabled =
    true;


  saveCallDeviceState();

}


function restoreCallDeviceState() {

  let saved = null;


  try {

    saved =
      JSON.parse(
        sessionStorage.getItem(
          CALL_DEVICE_STATE_KEY
        )
      );

  } catch (error) {

    console.warn(
      "读取通话设备状态失败",
      error
    );

  }


  localCameraEnabled =
    saved?.cameraEnabled !==
    false;


  localMicrophoneEnabled =
    saved?.microphoneEnabled !==
    false;


  /*
    恢复按钮显示。
  */

  activeCallCameraOff.hidden =
    localCameraEnabled;


  if (
    !localCameraEnabled
  ) {

    activeCallCameraOff.textContent =
      "摄像头已关闭";

  }


  callCameraButton
    .querySelector("small")
    .textContent =
      localCameraEnabled
        ? "摄像头已开"
        : "摄像头已关";


  callCameraButton.classList.toggle(
    "is-off",
    !localCameraEnabled
  );


  callMicButton
    .querySelector("small")
    .textContent =
      localMicrophoneEnabled
        ? "麦克风已开"
        : "麦克风已关";


  callMicButton.classList.toggle(
    "is-off",
    !localMicrophoneEnabled
  );


  return {

    cameraEnabled:
      localCameraEnabled,

    microphoneEnabled:
      localMicrophoneEnabled

  };

}


function clearCallDeviceState() {

  sessionStorage.removeItem(
    CALL_DEVICE_STATE_KEY
  );

}


/* =========================
   视频通话 · 本地摄像头
   ========================= */

let localCallStream =
  null;


let currentCameraFacingMode =
  "user";


let localCameraEnabled =
  true;


/* 打开真实摄像头 */

async function startLocalCallCamera() {

  stopLocalCallCamera();


  try {

    const stream =
      await navigator.mediaDevices
        .getUserMedia({

          video: {

            facingMode: {

              ideal:
                currentCameraFacingMode

            }

          },

          audio:
            false

        });


    localCallStream =
      stream;


    localCallVideo.srcObject =
      stream;


    localCameraEnabled =
      true;


    activeCallCameraOff.hidden =
      true;


    callCameraButton
      .querySelector("small")
      .textContent =
        "摄像头已开";


    callCameraButton.classList.remove(
      "is-off"
    );

  } catch (error) {

    console.warn(
      "无法打开摄像头",
      error
    );


    localCallStream =
      null;


    /*
      这里只表示这一次真实取景失败。

      不去覆盖 sessionStorage 里
      用户原本的设备偏好。
    */

    localCameraEnabled =
      false;


    activeCallCameraOff.hidden =
      false;

    activeCallCameraOff.textContent =
      "摄像头不可用";


    callCameraButton
      .querySelector("small")
      .textContent =
        "摄像头已关";


    callCameraButton.classList.add(
      "is-off"
    );

  }

}


/*
  停止真实摄像头取景。

  注意：
  不修改 localCameraEnabled。

  所以最小化调用它时，
  不等于用户手动关闭摄像头。
*/

function stopLocalCallCamera() {

  if (
    localCallStream
  ) {

    localCallStream
      .getTracks()
      .forEach(
        function (track) {

          track.stop();

        }
      );

  }


  localCallStream =
    null;


  if (
    localCallVideo
  ) {

    localCallVideo.srcObject =
      null;

  }

}


/* 用户主动开关摄像头 */

function toggleLocalCallCamera() {

  /*
    当前没有真实摄像头流：
    说明现在要主动打开。
  */

  if (
    !localCallStream
  ) {

    localCameraEnabled =
      true;


    saveCallDeviceState();


    startLocalCallCamera();


    return;

  }


  const videoTrack =
    localCallStream
      .getVideoTracks()[0];


  if (!videoTrack) {

    return;

  }


  localCameraEnabled =
    !localCameraEnabled;


  videoTrack.enabled =
    localCameraEnabled;


  saveCallDeviceState();


  activeCallCameraOff.hidden =
    localCameraEnabled;


  if (
    !localCameraEnabled
  ) {

    activeCallCameraOff.textContent =
      "摄像头已关闭";

  }


  callCameraButton
    .querySelector("small")
    .textContent =
      localCameraEnabled
        ? "摄像头已开"
        : "摄像头已关";


  callCameraButton.classList.toggle(
    "is-off",
    !localCameraEnabled
  );

}


/* 前后摄像头切换 */

async function switchLocalCallCamera() {

  currentCameraFacingMode =
    currentCameraFacingMode ===
      "user"
      ? "environment"
      : "user";


  /*
    摄像头本来就开着：
    立即切换真实摄像头。
  */

  if (
    localCameraEnabled
  ) {

    await startLocalCallCamera();

    return;

  }


  /*
    摄像头本来被用户关闭：
    只记住前 / 后摄选择，
    不擅自把摄像头打开。

    同时释放旧的真实视频流。
  */

  stopLocalCallCamera();

}


/* =========================
   视频通话 · 本地麦克风
   ========================= */

let localMicStream =
  null;


let localMicrophoneEnabled =
  true;


/* 打开麦克风 */

async function startLocalCallMicrophone() {

  stopLocalCallMicrophone();


  try {

    const stream =
      await navigator.mediaDevices
        .getUserMedia({

          audio:
            true,

          video:
            false

        });


    localMicStream =
      stream;


    localMicrophoneEnabled =
      true;


    callMicButton
      .querySelector("small")
      .textContent =
        "麦克风已开";


    callMicButton.classList.remove(
      "is-off"
    );

  } catch (error) {

    console.warn(
      "无法打开麦克风",
      error
    );


    localMicStream =
      null;


    localMicrophoneEnabled =
      false;


    callMicButton
      .querySelector("small")
      .textContent =
        "麦克风不可用";


    callMicButton.classList.add(
      "is-off"
    );

  }

}


/* 彻底停止真实麦克风 */

function stopLocalCallMicrophone() {

  if (
    localMicStream
  ) {

    localMicStream
      .getTracks()
      .forEach(
        function (track) {

          track.stop();

        }
      );

  }


  localMicStream =
    null;

}


/* 用户主动开关麦克风 */

function toggleLocalCallMicrophone() {

  if (
    !localMicStream
  ) {

    localMicrophoneEnabled =
      true;


    saveCallDeviceState();


    startLocalCallMicrophone();


    return;

  }


  const audioTrack =
    localMicStream
      .getAudioTracks()[0];


  if (!audioTrack) {

    return;

  }


  localMicrophoneEnabled =
    !localMicrophoneEnabled;


  audioTrack.enabled =
    localMicrophoneEnabled;


  saveCallDeviceState();


  callMicButton
    .querySelector("small")
    .textContent =
      localMicrophoneEnabled
        ? "麦克风已开"
        : "麦克风已关";


  callMicButton.classList.toggle(
    "is-off",
    !localMicrophoneEnabled
  );

}


/* =========================
   新接通一通电话时
   默认摄像头、麦克风都打开
   ========================= */

function startDefaultCallDevices() {

  resetCallDeviceState();


  startLocalCallCamera();

  startLocalCallMicrophone();

}


/* =========================
   恢复已有电话时
   按之前手动设置恢复
   ========================= */

function restoreSavedCallDevices() {

  const state =
    restoreCallDeviceState();


  if (
    state.cameraEnabled
  ) {

    startLocalCallCamera();

  }


  if (
    state.microphoneEnabled
  ) {

    startLocalCallMicrophone();

  }

}

/* =========================
   视频通话 · 扬声器状态
   ========================= */

let callSpeakerEnabled =
  true;


function toggleCallSpeaker() {

  callSpeakerEnabled =
    !callSpeakerEnabled;


  callSpeakerButton
    .querySelector("small")
    .textContent =
      callSpeakerEnabled
        ? "扬声器已开"
        : "扬声器已关";


  callSpeakerButton.classList.toggle(
    "is-off",
    !callSpeakerEnabled
  );

}

/* =========================
   正在进行中的通话
   ========================= */

function saveLiveCallSession() {

  if (!callStartedAt) {

    return;

  }


  sessionStorage.setItem(
    LIVE_CALL_SESSION_KEY,
    JSON.stringify({

      version: 1,

      active: true,

      personId:
        currentPerson.id,

      direction:
        currentCallDirection,

      startedAt:
        callStartedAt,

      updatedAt:
        Date.now()

    })
  );

}

function clearLiveCallSession() {

  sessionStorage.removeItem(
    LIVE_CALL_SESSION_KEY
  );

}


/* =========================
   恢复跨页面中的通话
   ========================= */

   /* =========================
   接住其他 Liminal 页面
   已经接听的来电
   ========================= */

function resumeGlobalAnsweredCall() {

  let pending;


  try {

    pending =
      JSON.parse(
        sessionStorage.getItem(
  GLOBAL_PENDING_ANSWER_KEY
)
      );

  } catch (error) {

    console.warn(
      "读取全局接听状态失败",
      error
    );

    return;

  }


  if (
    !pending ||
    pending.personId !==
      currentPerson.id
  ) {

    return;

  }


  /*
    这个待接通状态只用一次。
  */

  sessionStorage.removeItem(
  GLOBAL_PENDING_ANSWER_KEY
);


  /*
    进入 Chat 后，
    停掉刚刚可能重新启动的主动来电时钟。
  */

  clearActiveCallTimer();

  localStorage.removeItem(
    ACTIVE_CALL_STATE_KEY
  );


  currentCallDirection =
    "incoming";


  incomingCallPanel.hidden =
    true;

  outgoingCallPanel.hidden =
    true;

  callMiniWindow.hidden =
    true;


  renderChatAvatar(
    activeCallRemoteAvatar,
    currentPerson.id,
    currentPerson.avatar
  );

  activeCallRemoteName.textContent =
    currentPerson.name;


  activeCallPanel.hidden =
    false;


  /*
    从你在其他页面点“接听”的那一刻
    开始计算通话时长。
  */

  startCallDurationTimer(
    pending.answeredAt ||
    Date.now()
  );


  saveLiveCallSession();


  startDefaultCallDevices();

}

function restoreLiveCallSession() {

    let session;


  try {

    session =
  JSON.parse(
    sessionStorage.getItem(
      LIVE_CALL_SESSION_KEY
    )
  );

  } catch (error) {

    console.warn(
      "读取正在进行的通话失败",
      error
    );

    return;

  }


  if (
    !session ||
    session.active !== true ||
    session.personId !==
      currentPerson.id ||
    !Number.isFinite(
      Number(
        session.startedAt
      )
    )
  ) {

    return;

  }


  /*
    恢复这通电话原本的信息。
  */

  currentCallDirection =
    session.direction ||
    "incoming";


  incomingCallPanel.hidden =
    true;

  outgoingCallPanel.hidden =
    true;

  callMiniWindow.hidden =
    true;


  renderChatAvatar(
    activeCallRemoteAvatar,
    currentPerson.id,
    currentPerson.avatar
  );

  activeCallRemoteName.textContent =
    currentPerson.name;


  activeCallPanel.hidden =
    false;


  /*
    用真正的原始接通时间继续计时，
    不从 00:00 重新开始。
  */

  startCallDurationTimer(
    session.startedAt
  );


  /*
    跨页面期间摄像头和麦克风已经停掉，
    回到通话页后重新打开。
  */

  restoreSavedCallDevices();

}

/* =========================
   视频通话状态与计时
   ========================= */

let callStartedAt =
  null;

let callDurationTimer =
  null;


/*
  当前这通电话是谁发起的。
*/

let currentCallDirection =
  "incoming";


/*
  来电响铃最多等待 30 秒。
*/

const CALL_RING_TIMEOUT_SECONDS =
  30;

let incomingCallTimeoutTimer =
  null;

let outgoingCallAnswerTimer =
  null;

let outgoingCallTimeoutTimer =
  null;


function clearOutgoingCallTimers() {

  if (
    outgoingCallAnswerTimer !==
    null
  ) {

    clearTimeout(
      outgoingCallAnswerTimer
    );

    outgoingCallAnswerTimer =
      null;

  }


  if (
    outgoingCallTimeoutTimer !==
    null
  ) {

    clearTimeout(
      outgoingCallTimeoutTimer
    );

    outgoingCallTimeoutTimer =
      null;

  }

}


function clearIncomingCallTimeout() {

  if (
    incomingCallTimeoutTimer !==
    null
  ) {

    clearTimeout(
      incomingCallTimeoutTimer
    );


    incomingCallTimeoutTimer =
      null;

  }

}


/* 把秒数显示成 00:00 / 01:25:08 */

function formatCallDuration(
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
      `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(remainingSeconds)}`
    );

  }


  return (
    `${padNumber(minutes)}:${padNumber(remainingSeconds)}`
  );

}


/* 刷新通话时长 */

function updateCallDuration() {

  if (!callStartedAt) {

    return;

  }


  const elapsedSeconds =
    Math.floor(
      (
        Date.now() -
        callStartedAt
      ) / 1000
    );


  const text =
    formatCallDuration(
      elapsedSeconds
    );


  activeCallDuration.textContent =
    text;

  callMiniDuration.textContent =
    text;

}


/* 开始计时 */

function startCallDurationTimer(
  startedAt = null
) {

  if (
    callDurationTimer !==
    null
  ) {

    clearInterval(
      callDurationTimer
    );

  }


  callStartedAt =
    startedAt !== null
      ? Number(startedAt)
      : Date.now();


  setPersonTransientStatus(
    "calling"
  );


  updateCallDuration();


  callDurationTimer =
    setInterval(
      updateCallDuration,
      1000
    );

}


/* 停止计时 */

function stopCallDurationTimer() {

  if (
    callDurationTimer !==
    null
  ) {

    clearInterval(
      callDurationTimer
    );


    callDurationTimer =
      null;

  }

}


/* =========================
   显示模拟来电
   ========================= */

/* =========================
你主动拨打视频通话
========================= */

function startOutgoingCall() {

  closeMorePanel();


  /*
    你主动开始拨号以后，
    暂停对方主动来电的独立时钟。
  */

  clearActiveCallTimer();

  localStorage.removeItem(
    ACTIVE_CALL_STATE_KEY
  );


  clearIncomingCallTimeout();

  clearOutgoingCallTimers();


  currentCallDirection =
    "outgoing";


  renderChatAvatar(
    outgoingCallAvatar,
    currentPerson.id,
    currentPerson.avatar
  );

  outgoingCallName.textContent =
    currentPerson.name;

  outgoingCallStatus.textContent =
    "正在呼叫…";


  outgoingCallPanel.hidden =
    false;

  incomingCallPanel.hidden =
    true;

  activeCallPanel.hidden =
    true;

  callMiniWindow.hidden =
    true;


  const answerProbability =
    getCurrentTodayAnswerCallProbability();


  const rejectProbability =
    getCurrentTodayRejectCallProbability();


  /*
    先决定：
    对方会不会接。
  */

  let shouldAnswer =
    false;


  if (
    answerProbability !== null
  ) {

    shouldAnswer =
      Math.random() * 100 <
      answerProbability;

  } else {

    console.warn(
      "没有读取到今日接听概率"
    );

  }


  /*
    只有“不接”的情况下，
    才继续判断是否明确拒接。
  */

  let shouldReject =
    false;


  if (
    !shouldAnswer &&
    rejectProbability !== null
  ) {

    shouldReject =
      Math.random() * 100 <
      rejectProbability;

  }


  /*
    如果会接听或会拒接，
    都使用“接听时间”范围，
    表示几秒后对这通电话作出反应。
  */

  if (
    shouldAnswer ||
    shouldReject
  ) {

    const answerRule =
      getCurrentAnswerCallRule();


    const responseDelaySeconds =
      randomIntegerBetween(
        answerRule
          ?.delaySeconds
          ?.min ??
        3,

        answerRule
          ?.delaySeconds
          ?.max ??
        30
      );


    outgoingCallAnswerTimer =
      setTimeout(
        function () {

          outgoingCallAnswerTimer =
            null;


          if (
            outgoingCallPanel.hidden
          ) {

            return;

          }


          /*
            会接听
          */

          if (shouldAnswer) {

            clearOutgoingCallTimers();


            outgoingCallPanel.hidden =
              true;


            renderChatAvatar(
              activeCallRemoteAvatar,
              currentPerson.id,
              currentPerson.avatar
            );

            activeCallRemoteName.textContent =
              currentPerson.name;


            activeCallPanel.hidden =
              false;

            callMiniWindow.hidden =
              true;


            startCallDurationTimer();

saveLiveCallSession();

startDefaultCallDevices();


            return;

          }


          /*
            不接，但明确拒接
          */

          if (shouldReject) {

            clearOutgoingCallTimers();


            outgoingCallPanel.hidden =
              true;


            addCallMessage(
              "视频通话 · 对方已拒绝",
              new Date(),
              "outgoing",
              0,
              "rejected",
              true
            );


            scheduleNextActiveCallOpportunity();

          }

        },
        responseDelaySeconds *
        1000
      );

  }


  /*
    无论如何，
    最长只等待 30 秒。

    如果前面既没有接听，
    也没有明确拒接，
    30 秒后就是“对方无应答”。
  */

  outgoingCallTimeoutTimer =
    setTimeout(
      function () {

        outgoingCallTimeoutTimer =
          null;


        if (
          outgoingCallPanel.hidden
        ) {

          return;

        }


        clearOutgoingCallTimers();


        outgoingCallPanel.hidden =
          true;


        addCallMessage(
          "视频通话 · 对方无应答",
          new Date(),
          "outgoing",
          0,
          "unanswered",
          true
        );


        scheduleNextActiveCallOpportunity();

      },
      30000
    );

}

/* =========================
   你取消正在拨出的电话
   ========================= */

function cancelOutgoingCall() {

  clearOutgoingCallTimers();


  outgoingCallPanel.hidden =
    true;


  addCallMessage(
    "视频通话 · 已取消",
    new Date(),
    "outgoing",
    0,
    "cancelled",
    true
  );


  scheduleNextActiveCallOpportunity();

}

function showIncomingCall() {

  closeMorePanel();


  currentCallDirection =
    "incoming";


  renderChatAvatar(
    incomingCallAvatar,
    currentPerson.id,
    currentPerson.avatar
  );

  incomingCallName.textContent =
    currentPerson.name;


  incomingCallPanel.hidden =
    false;

  activeCallPanel.hidden =
    true;

  callMiniWindow.hidden =
    true;


  /*
    先清掉上一通电话可能残留的计时。
  */

  clearIncomingCallTimeout();


  /*
    30 秒没有接听或拒绝，
    自动判定为未接听。
  */

  incomingCallTimeoutTimer =
    setTimeout(
      function () {

        incomingCallTimeoutTimer =
          null;


        /*
          如果来电页面已经被关掉，
          说明已经接听或拒绝，
          不再处理。
        */

        if (
          incomingCallPanel.hidden
        ) {

          return;

        }


        /*
          30 秒到了：
          自动关闭来电。
        */

        incomingCallPanel.hidden =
          true;


        /*
          留下未接听记录。
        */

        addCallMessage(
          "视频通话 · 未接听",
          new Date(),
          "incoming",
          0,
          "unanswered",
          true
        );


        /*
          这通电话已经结束，
          电话独立等待重新开始。
        */

        scheduleNextActiveCallOpportunity();

      },
      30000
    );

}


/* =========================
   接听
   ========================= */

function answerCurrentCall() {

  /*
    已经接了，
    取消 30 秒未接倒计时。
  */

  clearIncomingCallTimeout();


  incomingCallPanel.hidden =
    true;


  renderChatAvatar(
    activeCallRemoteAvatar,
    currentPerson.id,
    currentPerson.avatar
  );

  activeCallRemoteName.textContent =
    currentPerson.name;


  activeCallPanel.hidden =
    false;

  callMiniWindow.hidden =
    true;


  startCallDurationTimer();

saveLiveCallSession();

startDefaultCallDevices();

}


/* =========================
   拒绝
   ========================= */

function rejectCurrentCall() {

  /*
    先取消 30 秒未接倒计时，
    不然拒绝以后过 30 秒还会再来一条“未接听”。
  */

  clearIncomingCallTimeout();


  /*
    关闭来电界面。
  */

  incomingCallPanel.hidden =
    true;


  /*
    在聊天里留下拒接记录。
  */

  addCallMessage(
    "视频通话 · 已拒绝",
    new Date(),
    "incoming",
    0,
    "rejected",
    true
  );


  /*
    这通电话已经结束，
    下一次主动来电重新开始独立等待。
  */

  scheduleNextActiveCallOpportunity();

}


/* =========================
   最小化
   ========================= */

function minimizeCurrentCall() {

  if (!callStartedAt) {

    return;

  }


  /*
    最小化以后停止真实摄像头取景。

    注意：
    这里不修改 localCameraEnabled，
    所以它不是“手动关闭摄像头”。

    摄像头按钮状态不会因此变成带斜杠。
  */

  stopLocalCallCamera();


  /*
    麦克风不停止。

    所以只要还在当前 Chat 页面，
    最小化以后麦克风仍然保持开启。
  */


  activeCallPanel.hidden =
    true;

  callMiniWindow.hidden =
    false;


  updateCallDuration();

}


/* =========================
   从小窗恢复全屏
   ========================= */

function restoreCurrentCall() {

  if (!callStartedAt) {

    return;

  }


  callMiniWindow.hidden =
    true;

  activeCallPanel.hidden =
    false;


  updateCallDuration();


  /*
    如果最小化以前摄像头本来是开的，
    恢复全屏时重新开始真实取景。

    如果之前是你自己手动关掉的，
    localCameraEnabled 会是 false，
    这里不会擅自重新打开。
  */

  if (localCameraEnabled) {

    startLocalCallCamera();

  }

}

/* =========================
   挂断
   ========================= */

function hangupCurrentCall() {

  /*
    清掉所有还可能残留的电话计时。
  */

  clearIncomingCallTimeout();

  clearOutgoingCallTimers();


  /*
    如果此时还显示着“正在呼叫”，
    一并关闭。
  */

  outgoingCallPanel.hidden =
    true;


  /*
    挂断以后彻底停止摄像头。
  */

  stopLocalCallCamera();

  stopLocalCallMicrophone();


  /*
    挂断前先算出真正通话了多久。
  */

  let durationSeconds =
    0;


  if (callStartedAt) {

    durationSeconds =
      Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            callStartedAt
          ) / 1000
        )
      );

  }


  const durationText =
    formatCallDuration(
      durationSeconds
    );


  /*
    关闭所有电话界面。
  */

  activeCallPanel.hidden =
    true;

  callMiniWindow.hidden =
    true;

  incomingCallPanel.hidden =
    true;


  stopCallDurationTimer();


  /*
    已经真正接通过，
    才留下通话记录。
  */

  if (callStartedAt) {

    addCallMessage(
      `视频通话时长 ${durationText}`,
      new Date(),
      currentCallDirection,
      durationSeconds,
      "completed"
    );

  }

clearLiveCallSession();

clearCallDeviceState();

callStartedAt =
  null;

clearPersonTransientStatus(
  "calling"
);


  /*
    通话结束以后，
    电话自己的独立时钟重新开始。
  */

  scheduleNextActiveCallOpportunity();

}


/* =========================
   电话按钮
   ========================= */

/*
  点击“视频通话”，
  向当前聊天对象主动发起视频通话。
*/

videoCallButton.addEventListener(
  "pointerdown",
  function (event) {

    event.preventDefault();

    event.stopPropagation();


    startOutgoingCall();

  },
  true
);

cancelOutgoingCallButton.addEventListener(
  "click",
  function () {

    cancelOutgoingCall();

  }
);

answerCallButton.addEventListener(
  "click",
  function () {

    answerCurrentCall();

  }
);


rejectCallButton.addEventListener(
  "click",
  function () {

    rejectCurrentCall();

  }
);


minimizeCallButton.addEventListener(
  "click",
  function () {

    minimizeCurrentCall();

  }
);


/* =========================
   通话小窗 · 拖动与自动吸边
   ========================= */

let miniCallDragging =
  false;

let miniCallMoved =
  false;

let miniCallStartX =
  0;

let miniCallStartY =
  0;

let miniCallStartLeft =
  0;

let miniCallStartTop =
  0;


/* 按住小窗 */

callMiniWindow.addEventListener(
  "pointerdown",
  function (event) {

    miniCallDragging =
      true;

    miniCallMoved =
      false;


    const rect =
      callMiniWindow
        .getBoundingClientRect();


    miniCallStartX =
      event.clientX;

    miniCallStartY =
      event.clientY;

    miniCallStartLeft =
      rect.left;

    miniCallStartTop =
      rect.top;


    /*
      从 right 定位切换成 left 定位，
      方便后面拖动。
    */

    callMiniWindow.style.right =
      "auto";

    callMiniWindow.style.left =
      `${rect.left}px`;

    callMiniWindow.style.top =
      `${rect.top}px`;


    callMiniWindow.classList.add(
      "dragging"
    );


    callMiniWindow
      .setPointerCapture(
        event.pointerId
      );

  }
);


/* 拖动过程中 */

callMiniWindow.addEventListener(
  "pointermove",
  function (event) {

    if (!miniCallDragging) {

      return;

    }


    const moveX =
      event.clientX -
      miniCallStartX;

    const moveY =
      event.clientY -
      miniCallStartY;


    if (
      Math.abs(moveX) > 5 ||
      Math.abs(moveY) > 5
    ) {

      miniCallMoved =
        true;

    }


    const rect =
      callMiniWindow
        .getBoundingClientRect();


    const margin =
      8;


    const maxLeft =
      window.innerWidth -
      rect.width -
      margin;

    const maxTop =
      window.innerHeight -
      rect.height -
      margin;


    const nextLeft =
      Math.min(
        Math.max(
          margin,
          miniCallStartLeft +
          moveX
        ),
        maxLeft
      );


    const nextTop =
      Math.min(
        Math.max(
          margin,
          miniCallStartTop +
          moveY
        ),
        maxTop
      );


    callMiniWindow.style.left =
      `${nextLeft}px`;

    callMiniWindow.style.top =
      `${nextTop}px`;

  }
);


/* 松手 */

callMiniWindow.addEventListener(
  "pointerup",
  function (event) {

    if (!miniCallDragging) {

      return;

    }


    miniCallDragging =
      false;


    callMiniWindow.classList.remove(
      "dragging"
    );


    callMiniWindow
      .releasePointerCapture(
        event.pointerId
      );


    /*
      没有真正拖动：
      当作点击，恢复全屏。
    */

    if (!miniCallMoved) {

      restoreCurrentCall();

      return;

    }


    /*
      真正拖动过：
      判断离左边还是右边更近，
      自动吸过去。
    */

    const rect =
      callMiniWindow
        .getBoundingClientRect();


    const margin =
      12;


    const centerX =
      rect.left +
      rect.width / 2;


    const snapLeft =
      centerX <
      window.innerWidth / 2;


    const targetLeft =
      snapLeft
        ? margin
        : (
          window.innerWidth -
          rect.width -
          margin
        );


    callMiniWindow.style.left =
      `${targetLeft}px`;

  }
);


callMiniWindow.addEventListener(
  "pointercancel",
  function () {

    miniCallDragging =
      false;

    miniCallMoved =
      false;


    callMiniWindow.classList.remove(
      "dragging"
    );

  }
);

callCameraButton.addEventListener(
  "click",
  function () {

    toggleLocalCallCamera();

  }
);


switchCameraButton.addEventListener(
  "click",
  function () {

    switchLocalCallCamera();

  }
);

callMicButton.addEventListener(
  "click",
  function () {

    toggleLocalCallMicrophone();

  }
);


callSpeakerButton.addEventListener(
  "click",
  function () {

    toggleCallSpeaker();

  }
);

hangupCallButton.addEventListener(
  "click",
  function () {

    hangupCurrentCall();

  }
);

/* =========================
   更多功能面板
   ========================= */

function openMorePanel() {

  chatInput.blur();

  const previousScrollBehavior =
    morePages.style.scrollBehavior;

  morePages.style.scrollBehavior =
    "auto";

  morePages.scrollLeft =
    0;

  morePages.style.scrollBehavior =
    previousScrollBehavior;

  pageDots.forEach(
    function (dot, index) {

      dot.classList.toggle(
        "active",
        index === 0
      );

    }
  );

  morePanel.classList.add("open");

  document.body.classList.add(
    "more-panel-open"
  );

}


function closeMorePanel() {

  morePanel.classList.remove("open");

  document.body.classList.remove(
    "more-panel-open"
  );

}

/* =========================
   拍一拍动作面板
   ========================= */

function openPokeActionPanel() {

  closeMorePanel();

  pokeActionPanel.hidden =
    false;

}


function closePokeActionPanel() {

  pokeActionPanel.hidden =
    true;

}

/* =========================
   我的快捷动作
   ========================= */

document
  .querySelectorAll(
    ".poke-quick-item"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const action =
            button.dataset.action ||
            "";


          if (!action) {

            return;

          }


          const targetName =
            currentPerson.actionName ||
            currentPerson.name;


          const text =
            `你${action.replaceAll(
              "{target}",
              targetName
            )}`;


          addPokeMessage(
            text,
            new Date(),
            "outgoing"
          );


          closePokeActionPanel();

        }
      );

    }
  );


/* =========================
   我的自定义动作
   ========================= */

pokeCustomSend.addEventListener(
  "click",
  function () {

    const text =
      pokeCustomInput.value.trim();


    if (!text) {

      return;

    }


    addPokeMessage(
      text,
      new Date(),
      "outgoing"
    );


    pokeCustomInput.value =
      "";


    closePokeActionPanel();

  }
);


/* =========================
   打开拍一拍面板
   ========================= */

pokeButton.addEventListener(
  "pointerdown",
  function (event) {

    event.preventDefault();

    event.stopPropagation();


    openPokeActionPanel();

  },
  true
);


/* 关闭按钮 */

pokeActionClose.addEventListener(
  "click",
  function () {

    closePokeActionPanel();

  }
);


/* 点击灰色背景关闭 */

pokeActionPanel.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      pokeActionPanel
    ) {

      closePokeActionPanel();

    }

  }
);

moreButton.addEventListener(
  "click",
  function (event) {

    event.stopPropagation();


    if (
      morePanel.classList.contains(
        "open"
      )
    ) {

      closeMorePanel();


      setTimeout(
        function () {

          chatInput.focus();

        },
        50
      );

    } else {

      openMorePanel();

    }

  }
);


chatInput.addEventListener(
  "focus",
  function () {

    closeMorePanel();

  }
);


document.addEventListener(
  "pointerdown",
  function (event) {

    if (
      !morePanel.classList.contains(
        "open"
      )
    ) {

      return;

    }


    const clickedInsidePanel =
      morePanel.contains(
        event.target
      );

    const clickedMoreButton =
      moreButton.contains(
        event.target
      );


    if (
      !clickedInsidePanel &&
      !clickedMoreButton
    ) {

      closeMorePanel();

    }

  }
);


/* =========================
   更多功能分页
   ========================= */

morePages.addEventListener(
  "scroll",
  function () {

    const pageWidth =
      morePages.clientWidth;

    const currentPage =
      Math.round(
        morePages.scrollLeft /
        pageWidth
      );


    pageDots.forEach(
      function (dot, index) {

        dot.classList.toggle(
          "active",
          index === currentPage
        );

      }
    );

  }
);

/* 点击圆点切换更多功能页面 */

pageDots.forEach(
  function (dot, index) {

    dot.setAttribute(
      "role",
      "button"
    );

    dot.setAttribute(
      "tabindex",
      "0"
    );


    function goToPage() {

      const pageWidth =
        morePages.clientWidth;


      morePages.scrollTo({
        left:
          pageWidth * index,

        behavior:
          "smooth"
      });

    }


    dot.addEventListener(
      "click",
      goToPage
    );


    dot.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          goToPage();

        }

      }
    );

  }
);


/* =========================
   更多面板鼠标拖动
   ========================= */

let isDragging =
  false;

let startX =
  0;

let startScrollLeft =
  0;


morePages.addEventListener(
  "pointerdown",
  function (event) {

    isDragging =
      true;

    startX =
      event.clientX;

    startScrollLeft =
      morePages.scrollLeft;


    morePages.setPointerCapture(
      event.pointerId
    );

  }
);


morePages.addEventListener(
  "pointermove",
  function (event) {

    if (!isDragging) {

      return;

    }


    const distance =
      event.clientX - startX;


    morePages.scrollLeft =
      startScrollLeft -
      distance;

  }
);


morePages.addEventListener(
  "pointerup",
  function () {

    isDragging =
      false;

  }
);


morePages.addEventListener(
  "pointercancel",
  function () {

    isDragging =
      false;

  }
);


/* =========================
   聊天记录读取
   ========================= */

function loadStoredChatHistory() {

  const saved =
    localStorage.getItem(
      CHAT_STORAGE_KEY
    );


  if (!saved) {

    return [];

  }


  try {

    const parsed =
      JSON.parse(saved);


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch {

    return [];

  }

}


/* =========================
   保存整个聊天记录
   ========================= */

function saveChatHistory() {

  localStorage.setItem(
    CHAT_STORAGE_KEY,
    JSON.stringify(
      chatHistory
    )
  );

}


if (chatGiftButton) {

  chatGiftButton.addEventListener(
    "click",
    function () {

      closeMorePanel();

      window.location.href =
        "mall.html";

    }
  );

}


function createChatMessageId(
  date = new Date()
) {

  return (
    `chat_${currentPerson.id}_` +
    `${date.getTime()}_` +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );

}


function createOutgoingDeliveryFields(
  date = new Date(),
  options = {}
) {

  const state =
    getCurrentPersonState(
      date
    );


  const readDelay =
    personStateEngine &&
    typeof personStateEngine
      .getReadDelayMilliseconds ===
      "function"
      ? personStateEngine
          .getReadDelayMilliseconds(
            state
          )
      : 8000;


  return {
    sentAt:
      date.toISOString(),
    readAt:
      null,
    readDueAt:
      new Date(
        date.getTime() +
        readDelay
      ).toISOString(),
    replyEligible:
      options.replyEligible !==
      false,
    replyEvaluatedAt:
      null
  };

}


/* =========================
   保存普通文字消息
   ========================= */

function saveMessage(
  direction,
  text,
  date,
  extra = {}
) {

  const message = {

    id:
      extra.id ||
      createChatMessageId(
        date
      ),

    type:
      "text",

    direction:
      direction,

    text:
      text,

    time:
      date.toISOString(),

    ...extra

  };


  if (
    direction === "outgoing"
  ) {

    Object.assign(
      message,
      createOutgoingDeliveryFields(
        date,
        extra
      ),
      extra
    );

  }


  chatHistory.push(
    message
  );



  saveChatHistory();


  return message;

}


const messageReadTimers =
  new Map();


function hasReadReceipt(
  message
) {

  if (!message?.readAt) {

    return false;

  }


  return !Number.isNaN(
    new Date(
      message.readAt
    ).getTime()
  );

}


function renderMessageReceipt(
  timeElement,
  message
) {

  if (!timeElement) return;


  let receipt =
    timeElement.querySelector(
      ".message-receipt"
    );


  if (!receipt) {

    receipt =
      document.createElement(
        "span"
      );


    receipt.className =
      "message-receipt";


    timeElement.appendChild(
      receipt
    );

  }


  const read =
    hasReadReceipt(
      message
    );


  receipt.textContent =
    read
      ? "✓✓"
      : "✓";


  receipt.setAttribute(
    "aria-label",
    read
      ? "已读"
      : "已发送"
  );


  receipt.title =
    read
      ? "已读"
      : "已发送";

}


function updateMessageReceipt(
  message
) {

  if (!message?.id) return;


  chatMessages
    .querySelectorAll(
      ".message-row.outgoing[data-message-id]"
    )
    .forEach(
      function (row) {

        if (
          row.dataset.messageId !==
          message.id
        ) {

          return;

        }


        renderMessageReceipt(
          row.querySelector(
            ".message-time"
          ),
          message
        );

      }
    );

}


function clearMessageReadTimer(
  messageId
) {

  const timer =
    messageReadTimers.get(
      messageId
    );


  if (timer !== undefined) {

    clearTimeout(
      timer
    );


    messageReadTimers.delete(
      messageId
    );

  }


}


function markMessageAsRead(
  messageId,
  readDate = new Date()
) {

  const message =
    chatHistory.find(
      item =>
        item?.id === messageId
    );


  if (
    !message ||
    message.direction !==
      "outgoing" ||
    hasReadReceipt(
      message
    )
  ) {

    clearMessageReadTimer(
      messageId
    );


    return message || null;

  }


  const shouldEvaluateReply =
    message.replyEligible !==
      false &&
    !message.replyEvaluatedAt;


  message.readAt =
    readDate.toISOString();


  message.readDueAt =
    null;


  if (shouldEvaluateReply) {

    message.replyEvaluatedAt =
      message.readAt;

  }


  saveChatHistory();


  clearMessageReadTimer(
    messageId
  );


  updateMessageReceipt(
    message
  );


  if (shouldEvaluateReply) {

    createTestReply();

  }


  return message;

}


function scheduleMessageRead(
  message
) {

  if (
    !message?.id ||
    message.direction !==
      "outgoing" ||
    !message.sentAt ||
    hasReadReceipt(
      message
    )
  ) {

    return;

  }


  clearMessageReadTimer(
    message.id
  );


  const sentAt =
    new Date(
      message.sentAt ||
      message.time
    );


  const dueAt =
    message.readDueAt
      ? new Date(
          message.readDueAt
        )
      : new Date(
          sentAt.getTime() +
          8000
        );


  if (
    Number.isNaN(
      dueAt.getTime()
    )
  ) {

    return;

  }


  const remaining =
    Math.max(
      0,
      dueAt.getTime() -
      Date.now()
    );


  const timer =
    setTimeout(
      function () {

        markMessageAsRead(
          message.id,
          new Date()
        );

      },
      remaining
    );


  messageReadTimers.set(
    message.id,
    timer
  );

}


window.LiminalChatDelivery =
  Object.freeze({
    createOutgoingDeliveryFields,
    hasReadReceipt,
    markMessageAsRead,
    scheduleMessageRead
  });


/* =========================
   时间工具
   ========================= */

/* 把数字补成两位：8 → 08 */

function padNumber(number) {

  return String(number)
    .padStart(2, "0");

}


/* 每条消息下面的小时间 */

function formatMessageTime(date) {

  const hours =
    padNumber(
      date.getHours()
    );

  const minutes =
    padNumber(
      date.getMinutes()
    );

  const seconds =
    padNumber(
      date.getSeconds()
    );


  return (
    `${hours}:${minutes}:${seconds}`
  );

}


/* 消息流中间的大时间 */

function formatDividerTime(date) {

  const now =
    new Date();


  const sameYear =
    date.getFullYear() ===
    now.getFullYear();


  const sameDay =
    sameYear &&
    date.getMonth() ===
    now.getMonth() &&
    date.getDate() ===
    now.getDate();


  const hours =
    padNumber(
      date.getHours()
    );

  const minutes =
    padNumber(
      date.getMinutes()
    );


  const time =
    `${hours}:${minutes}`;


  if (sameDay) {

    return time;

  }


  const month =
    date.getMonth() + 1;

  const day =
    date.getDate();


  if (sameYear) {

    return (
      `${month}月${day}日 ${time}`
    );

  }


  return (
    `${date.getFullYear()}年${month}月${day}日 ${time}`
  );

}


/* 判断是否出现中央大时间 */

function shouldShowTimeDivider(
  currentTime
) {

  if (
    lastMessageTime === null
  ) {

    return true;

  }


  const difference =
    currentTime -
    lastMessageTime;


  return (
    difference >=
    5 * 60 * 1000
  );

}


/* 插入中央时间 */

function addTimeDivider(date) {

  const divider =
    document.createElement(
      "div"
    );


  divider.className =
    "time-divider";

  divider.textContent =
    formatDividerTime(
      date
    );


  chatMessages.appendChild(
    divider
  );

}

/* =========================
   临时状态提示
   ========================= */

function showChatTransientNotice(
  text
) {

  if (!chatTransientNotice) {

    return;

  }


  if (
    chatTransientNoticeTimer !==
    null
  ) {

    clearTimeout(
      chatTransientNoticeTimer
    );

  }


  chatTransientNotice.textContent =
    text;


  chatTransientNotice.hidden =
    false;


  chatTransientNoticeTimer =
    setTimeout(
      function () {

        chatTransientNotice.hidden =
          true;


        chatTransientNoticeTimer =
          null;

      },
      2200
    );

}

/* =========================
   新消息跟随 / 阅读旧消息
   ========================= */

const CHAT_LATEST_THRESHOLD =
  90;


let unreadIncomingCount =
  0;


/* =========================
   取得最后一条聊天内容
   ========================= */

function getLatestChatElement() {

  return (
    chatMessages.querySelector(
      ".message-row:last-of-type"
    ) ||
    chatMessages.lastElementChild
  );

}


/* =========================
   判断用户是否正在看最新消息
   ========================= */

function isChatAtLatest() {

  const latestElement =
    getLatestChatElement();


  if (!latestElement) {

    return true;

  }


  const latestRect =
    latestElement
      .getBoundingClientRect();


  const chatBottom =
    document.querySelector(
      ".chat-bottom"
    );


  const visibleBottom =
    chatBottom
      ? chatBottom
          .getBoundingClientRect()
          .top
      : window.innerHeight;


  /*
    最后一条消息已经在输入框附近，
    或者只差一点点，
    都视为仍然跟随最新消息。
  */

  return (
    latestRect.bottom <=
    visibleBottom +
    CHAT_LATEST_THRESHOLD
  );

}


/* =========================
   真正移动到最新消息
   ========================= */

function goToLatestChatMessage(
  behavior = "auto"
) {

  const latestElement =
    getLatestChatElement();


  if (!latestElement) {

    return;

  }


  latestElement.scrollIntoView({

    block:
      "end",

    inline:
      "nearest",

    behavior:
      behavior

  });

}


/* =========================
   更新新消息提示
   ========================= */

function renderNewMessageNotice() {

  if (
    unreadIncomingCount <= 0
  ) {

    if (
      newMessageNotice
    ) {

      newMessageNotice.hidden =
        true;

    }


    return;

  }


  if (
    newMessageNoticeText
  ) {

    newMessageNoticeText.textContent =
      `${unreadIncomingCount} 则新讯息`;

  }


  if (
    newMessageNotice
  ) {

    newMessageNotice.hidden =
      false;

  }

}


/* =========================
   清除新消息提示
   ========================= */

function clearNewMessageNotice() {

  unreadIncomingCount =
    0;


  if (
    newMessageNotice
  ) {

    newMessageNotice.hidden =
      true;

  }

}


/* =========================
   新消息出现以后
   ========================= */

function handleIncomingMessagePosition(
  wasFollowingLatest
) {

  /*
    新消息出现以前就在最新位置：
    继续跟着往下串。
  */

  if (
    wasFollowingLatest
  ) {

    clearNewMessageNotice();


    requestAnimationFrame(
      function () {

        goToLatestChatMessage(
          "auto"
        );

      }
    );


    return;

  }


  /*
    正在翻旧聊天：
    不抢走当前位置。
  */

  unreadIncomingCount +=
    1;


  renderNewMessageNotice();

}


/* =========================
   点新消息提示
   ========================= */

if (
  newMessageNotice
) {

  newMessageNotice.addEventListener(
    "click",
    function () {

      clearNewMessageNotice();


      goToLatestChatMessage(
        "smooth"
      );

    }
  );

}


/* =========================
   用户自己滑回最新消息
   ========================= */

function checkNewMessageNoticeAfterScroll() {

  if (
    unreadIncomingCount <= 0
  ) {

    return;

  }


  if (
    isChatAtLatest()
  ) {

    clearNewMessageNotice();

  }

}


/*
  两边都监听。

  不管实际滚动宿主是：
  - 整个网页
  - chatMessages

  都可以工作。
*/

window.addEventListener(
  "scroll",
  checkNewMessageNoticeAfterScroll,
  {
    passive:
      true
  }
);


chatMessages.addEventListener(
  "scroll",
  checkNewMessageNoticeAfterScroll,
  {
    passive:
      true
  }
);

/* =========================
   普通文字消息
   ========================= */

/* 自己发出的消息 */

function addOutgoingMessage(
  text,
  date,
  shouldSave = true,
  messageRecord = null
) {

  if (
    shouldShowTimeDivider(
      date
    )
  ) {

    addTimeDivider(
      date
    );

  }


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "message-row outgoing";


  row.innerHTML = `

    <div class="message-content">

      <div class="message-bubble">
      </div>

      <div class="message-time">
        <span class="message-clock">${formatMessageTime(date)}</span>
      </div>

    </div>

    <div class="message-avatar">
      K
    </div>

  `;


  renderChatAvatar(
    row.querySelector(".message-avatar"),
    "keshi",
    "K"
  );


  row
    .querySelector(
      ".message-bubble"
    )
    .textContent =
    text;


  chatMessages.appendChild(
    row
  );


  lastMessageTime =
    date;


  let storedMessage =
    messageRecord;


  if (shouldSave) {

    storedMessage =
      saveMessage(
      "outgoing",
      text,
      date
    );


    /*
      你主动发了消息，
      说明此刻正在聊天。
    */

    resetActiveMessageWait();

  }


  if (storedMessage?.id) {

    row.dataset.messageId =
      storedMessage.id;

  }


  renderMessageReceipt(
    row.querySelector(
      ".message-time"
    ),
    storedMessage ||
    {
      direction:
        "outgoing",
      time:
        date.toISOString()
    }
  );


  if (storedMessage) {

    scheduleMessageRead(
      storedMessage
    );

  }


  scrollToBottom();


  return storedMessage;

}


/* 对方发来的消息 */

function addIncomingMessage(
  text,
  date,
  shouldSave = true
) {

    const wasFollowingLatest =
    shouldSave
      ? isChatAtLatest()
      : false;

  if (
    shouldShowTimeDivider(
      date
    )
  ) {

    addTimeDivider(
      date
    );

  }


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "message-row incoming";


  row.innerHTML = `

    <div class="message-avatar">
      ${currentPerson.avatar}
</div>

    <div class="message-content">

      <div class="message-bubble">
      </div>

      <div class="message-time">
        ${formatMessageTime(date)}
      </div>

    </div>

  `;


  renderChatAvatar(
    row.querySelector(".message-avatar"),
    currentPerson.id,
    currentPerson.avatar
  );


  row
    .querySelector(
      ".message-bubble"
    )
    .textContent =
    text;


  chatMessages.appendChild(
    row
  );


  lastMessageTime =
    date;


  if (shouldSave) {

    saveMessage(
      "incoming",
      text,
      date
    );

  }


    if (
    shouldSave
  ) {

    handleIncomingMessagePosition(
      wasFollowingLatest
    );

  }

}

/* =========================
   视频通话记录消息
   ========================= */

function addCallMessage(
  text,
  date,
  direction = "incoming",
  durationSeconds = 0,
  status = "completed",
  shouldSave = true
) {

  const wasFollowingLatest =
    (
      direction ===
        "incoming" &&
      shouldSave
    )
      ? isChatAtLatest()
      : false;


  if (
    shouldShowTimeDivider(
      date
    )
  ) {

    addTimeDivider(
      date
    );

  }


  const row =
    document.createElement(
      "div"
    );


  row.className =
    `message-row ${direction}`;


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "message-content";


  const bubble =
    document.createElement(
      "div"
    );


  bubble.className =
    "message-bubble";

  bubble.textContent =
    `▣ ${text}`;


  const time =
    document.createElement(
      "div"
    );


  time.className =
    "message-time";

  time.textContent =
    formatMessageTime(
      date
    );


  content.appendChild(
    bubble
  );

  content.appendChild(
    time
  );


  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "message-avatar";

  renderChatAvatar(
    avatar,
    direction === "incoming"
      ? currentPerson.id
      : "keshi",
    direction === "incoming"
      ? currentPerson.avatar
      : "K"
  );


  if (
    direction === "incoming"
  ) {

    row.appendChild(
      avatar
    );

    row.appendChild(
      content
    );

  } else {

    row.appendChild(
      content
    );

    row.appendChild(
      avatar
    );

  }


  chatMessages.appendChild(
    row
  );


  lastMessageTime =
    date;


  if (shouldSave) {

    chatHistory.push({

      type:
        "call",

      direction:
        direction,

      callType:
        "video",

      status:
        status,

      durationSeconds:
        durationSeconds,

      text:
        text,

      time:
        date.toISOString()

    });


    saveChatHistory();

  }


  if (
    direction ===
      "incoming" &&
    shouldSave
  ) {

    handleIncomingMessagePosition(
      wasFollowingLatest
    );

  } else if (
    direction ===
      "outgoing" &&
    shouldSave
  ) {

    requestAnimationFrame(
      function () {

        goToLatestChatMessage(
          "auto"
        );

      }
    );

  }

}

/* =========================
   拍一拍 / 动作浮窗消息
   ========================= */

function addPokeMessage(
  text,
  date,
  direction = "incoming",
  shouldSave = true
) {

    const wasFollowingLatest =
    (
      direction ===
        "incoming" &&
      shouldSave
    )
      ? isChatAtLatest()
      : false;

  if (
    shouldShowTimeDivider(
      date
    )
  ) {

    addTimeDivider(
      date
    );

  }


  const row =
    document.createElement(
      "div"
    );


  row.className =
    `message-row poke-message-row ${direction}`;


  const notice =
    document.createElement(
      "div"
    );


  notice.className =
    "poke-message-notice";

  notice.textContent =
    text;


  row.appendChild(
    notice
  );


  chatMessages.appendChild(
    row
  );


  lastMessageTime =
    date;


  if (shouldSave) {

    chatHistory.push({

      type:
        "poke",

      direction:
        direction,

      text:
        text,

      time:
        date.toISOString()

    });


    saveChatHistory();


    /*
      只有你主动发出的动作，
      才重新开始主动消息等待。
    */

    if (
      direction ===
      "outgoing"
    ) {

      resetActiveMessageWait();

    }

  }


    if (
    direction ===
      "incoming" &&
    shouldSave
  ) {

    handleIncomingMessagePosition(
      wasFollowingLatest
    );

  } else if (
    direction ===
      "outgoing"
  ) {

    scrollToBottom();

  }

}

/* =========================
   礼物卡消息
   ========================= */

function addGiftMessage(
  gift,
  direction,
  date
) {

  if (
    shouldShowTimeDivider(
      date
    )
  ) {

    addTimeDivider(
      date
    );

  }


  const row =
    document.createElement(
      "div"
    );


  row.className =
    `message-row ${direction}`;


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "message-content";


  const giftCard =
    createGiftCard(
      gift,
      direction
    );


  const time =
    document.createElement(
      "div"
    );


  time.className =
    "message-time";

  time.textContent =
    formatMessageTime(
      date
    );


  content.appendChild(
    giftCard
  );

  content.appendChild(
    time
  );


  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "message-avatar";

  renderChatAvatar(
    avatar,
    direction === "incoming"
      ? currentPerson.id
      : "keshi",
    direction === "incoming"
      ? currentPerson.avatar
      : "K"
  );


  if (
    direction === "incoming"
  ) {

    row.appendChild(
      avatar
    );

    row.appendChild(
      content
    );

  } else {

    row.appendChild(
      content
    );

    row.appendChild(
      avatar
    );

  }


  chatMessages.appendChild(
    row
  );


  lastMessageTime =
    date;


  scrollToBottom();

}


/* 创建礼物卡 */

function createGiftCard(
  gift,
  direction
) {

  const card =
    document.createElement(
      "div"
    );


  card.className =
    "gift-message-card";


  card.innerHTML = `

    <div class="gift-card-header">

      <span class="gift-card-brand">
        LIMINAL MALL
      </span>

      <span class="gift-card-status">
      </span>

    </div>


    <div class="gift-card-relation">
    </div>


    <div class="gift-card-product">

      <div class="gift-product-image">
        <span></span>
      </div>


      <div class="gift-product-info">

        <strong class="gift-product-name">
        </strong>

        <span class="gift-product-options">
        </span>

        <b class="gift-product-price">
        </b>

      </div>

    </div>


    <div
      class="gift-card-message"
      hidden
    >
    </div>


    <button class="gift-order-button">
      查看订单
      <span>›</span>
    </button>

  `;


  /*
    当前物流状态从 Mall 的订单数据里读取，
    所以后面物流变化，重新打开聊天时
    礼物卡也会显示新的状态。
  */

  card
    .querySelector(
      ".gift-card-status"
    )
    .textContent =
    getOrderStatusText(
      gift.orderId
    );


  const relation =
    card.querySelector(
      ".gift-card-relation"
    );


  relation.textContent =
    direction === "incoming"
      ? `${currentPerson.name}送给你的礼物`
      : `你送给${currentPerson.name}的礼物`;


  card
    .querySelector(
      ".gift-product-image span"
    )
    .textContent =
    gift.productCategory ||
    "GIFT";


  card
    .querySelector(
      ".gift-product-name"
    )
    .textContent =
    gift.productName ||
    "礼物";


  card
    .querySelector(
      ".gift-product-options"
    )
    .textContent =
    createGiftOptionText(
      gift
    );


  card
    .querySelector(
      ".gift-product-price"
    )
    .textContent =
    formatMoney(
      gift.total || 0
    );


  const messageElement =
    card.querySelector(
      ".gift-card-message"
    );


  if (gift.message) {

    messageElement.hidden =
      false;

    messageElement.textContent =
      `“${gift.message}”`;

  }


  card
    .querySelector(
      ".gift-order-button"
    )
    .addEventListener(
      "click",
      function () {

        if (!gift.orderId) {

          return;

        }


        window.location.href =
          `order-detail.html?id=${encodeURIComponent(
            gift.orderId
          )}`;

      }
    );


  return card;

}


/* 礼物规格 */

function createGiftOptionText(
  gift
) {

  const parts =
    [];


  if (gift.size) {

    parts.push(
      gift.size
    );

  }


  if (gift.style) {

    parts.push(
      gift.style
    );

  }


  if (
    Number(gift.quantity) > 1
  ) {

    parts.push(
      `× ${gift.quantity}`
    );

  }


  return parts.length
    ? parts.join(" · ")
    : "默认规格";

}


/* =========================
   礼物卡读取订单状态
   ========================= */

function getOrderStatusText(
  orderId
) {

  if (!orderId) {

    return "礼物";

  }


  const saved =
    localStorage.getItem(
      MALL_ORDERS_KEY
    );


  if (!saved) {

    return "已购买";

  }


  try {

    const orders =
      JSON.parse(saved);


    if (
      !Array.isArray(orders)
    ) {

      return "已购买";

    }


    const order =
      orders.find(
        function (item) {

          return (
            item.id === orderId
          );

        }
      );


    if (!order) {

      return "已购买";

    }


    const stage =
      order.logisticsStage;


    if (
      stage === "delivered" ||
      order.status === "completed"
    ) {

      return "已签收";

    }


    if (
      stage === "outForDelivery"
    ) {

      return "派送中";

    }


    if (
      stage === "transit"
    ) {

      return "运输中";

    }


    if (
      stage === "shipped"
    ) {

      return "已发货";

    }


    if (
      order.status === "shipping"
    ) {

      return "配送中";

    }


    return "待发货";

  } catch {

    return "已购买";

  }

}


/* =========================
   金额格式
   ========================= */

function formatMoney(
  amount
) {

  return new Intl.NumberFormat(
    "zh-CN",
    {
      style:
        "currency",

      currency:
        "CNY",

      minimumFractionDigits:
        2
    }
  ).format(
    Number(amount)
  );

}


/* =========================
   发送输入框文字
   ========================= */

function sendMessage() {

  const text =
    chatInput.value.trim();


  if (text === "") {

    return;

  }


  const now =
    new Date();


  addOutgoingMessage(
    text,
    now
  );


  chatInput.value =
    "";

  chatInput.focus();

}


/* 按回车发送 */

chatInput.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      sendMessage();

    }

  }
);


/* =========================
   聊天随机回复
   ========================= */


/* =========================
   继续说测试
   ========================= */

function createTestContinue() {

  const continueProbability =
    getCurrentTodayContinueProbability();


  if (
    continueProbability === null
  ) {

    console.warn(
      "没有读取到今日继续说概率"
    );

    return;

  }


  const roll =
    Math.random() * 100;


  const shouldContinue =
    roll <
    continueProbability;


  if (!shouldContinue) {

    console.log(
      "继续说判定失败"
    );

    return;

  }

  if (
  !hasDrawableCorpusPool(
    currentPerson.id
  )
) {

  console.warn(
    "继续说失败：当前语料池没有可抽取内容"
  );


  showChatTransientNotice(
    "当前没有可抽取语料"
  );


  return;

}

  const continueRule =
    getCurrentContinueRule();


  const messageCount =
    randomIntegerBetween(
      continueRule
        ?.messageCount
        ?.min ??
      1,

      continueRule
        ?.messageCount
        ?.max ??
      4
    );


  const intervalMin =
    continueRule
      ?.messageIntervalSeconds
      ?.min ??
    2;


  const intervalMax =
    continueRule
      ?.messageIntervalSeconds
      ?.max ??
    12;


  function sendContinueMessage(
    index
  ) {

        const reply =
      drawCorpusText(
        currentPerson.id
      );


    if (!reply) {

      console.warn(
        "继续说抽取失败：当前没有可用语料"
      );

      return;

    }


    addIncomingMessage(
      reply,
      new Date()
    );


    /*
      这一轮继续说已经全部发完
    */

    if (
      index >=
      messageCount - 1
    ) {

      /*
        继续说这一轮结束后，
        判定是否触发拍一拍 / 动作浮窗
      */

      triggerPokeAfterRound();


      return;

    }

    /*
      下一条重新随机消息间隔
    */

    const intervalSeconds =
      randomIntegerBetween(
        intervalMin,
        intervalMax
      );


    setTimeout(
      function () {

        sendContinueMessage(
          index + 1
        );

      },
      intervalSeconds * 1000
    );

  }


  /*
    第一条立即出现
  */

  sendContinueMessage(
    0
  );

}

continueSayButton.addEventListener(
  "pointerdown",
  function (event) {

    event.preventDefault();

    event.stopPropagation();


    closeMorePanel();


    /*
      你主动要求继续说，
      也属于当前正在聊天。
    */

    resetActiveMessageWait();


    createTestContinue();

  },
  true
);

/* 显示正在输入 */

function showTypingStatus() {

  setPersonTransientStatus(
    "typing"
  );

}


/* 恢复人物备注名 */

function hideTypingStatus() {

  if (
    typeof callStartedAt !==
      "undefined" &&
    callStartedAt
  ) {

    setPersonTransientStatus(
      "calling"
    );


    return;

  }


  clearPersonTransientStatus(
    "typing"
  );

}

/* 随机整数范围 */

function randomIntegerBetween(
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


/* 随机抽测试回复 */

function createTestReply() {

  const replyProbability =
    getCurrentTodayReplyProbability();


  if (
    replyProbability === null
  ) {

    console.warn(
      "没有读取到今日回复概率"
    );

    return;

  }


  const roll =
    Math.random() * 100;


  const shouldReply =
    roll <
    replyProbability;


  if (!shouldReply) {

    return;

  }

  /*
    回复概率通过，
    但没有任何真实可抽语料，
    就安静结束。
  */

  if (
  !hasDrawableCorpusPool(
    currentPerson.id
  )
) {

  console.warn(
    "回复失败：当前语料池没有可抽取内容"
  );


  showChatTransientNotice(
    "当前没有可抽取语料"
  );


  return;

}

  const replyRule =
    getCurrentReplyRule();


  const delaySeconds =
    randomIntegerBetween(
      replyRule
        ?.delaySeconds
        ?.min ??
      5,

      replyRule
        ?.delaySeconds
        ?.max ??
      60
    );


  const messageCount =
    randomIntegerBetween(
      replyRule
        ?.messageCount
        ?.min ??
      1,

      replyRule
        ?.messageCount
        ?.max ??
      3
    );


  const intervalMin =
    replyRule
      ?.messageIntervalSeconds
      ?.min ??
    2;


  const intervalMax =
    replyRule
      ?.messageIntervalSeconds
      ?.max ??
    12;


  showTypingStatus();


  function sendReply(
    index
  ) {

       const reply =
      drawCorpusText(
        currentPerson.id
      );


    if (!reply) {

      hideTypingStatus();


      console.warn(
        "回复抽取失败：当前没有可用语料"
      );

      return;

    }


    addIncomingMessage(
      reply,
      new Date()
    );


    /*
      这一轮已经全部发完
    */

    if (
      index >=
      messageCount - 1
    ) {

      hideTypingStatus();


      /*
        普通回复这一轮结束后，
        判定是否触发拍一拍 / 动作浮窗
      */

      triggerPokeAfterRound();


      return;

    }


    /*
      下一条重新随机消息间隔
    */

    const intervalSeconds =
      randomIntegerBetween(
        intervalMin,
        intervalMax
      );


    setTimeout(
      function () {

        sendReply(
          index + 1
        );

      },
      intervalSeconds * 1000
    );

  }


  /*
    第一条按照回复时间出现
  */

  setTimeout(
    function () {

      sendReply(
        0
      );

    },
    delaySeconds * 1000
  );

}


/* =========================
   加载历史聊天
   ========================= */

function loadChatHistory() {

  chatMessages.innerHTML =
    "";

  lastMessageTime =
    null;


  chatHistory.forEach(
    function (message) {

      const date =
        new Date(
          message.time
        );

      /*
视频通话记录
*/

      if (
        message.type ===
        "call"
      ) {

        addCallMessage(
          message.text ||
          "视频通话",
          date,
          message.direction ||
          "incoming",
          message.durationSeconds ||
          0,
          message.status ||
          "completed",
          false
        );

        return;

      }

      /*
        拍一拍 / 动作浮窗
      */

      if (
        message.type ===
        "poke"
      ) {

        addPokeMessage(
          message.text || "",
          date,
          message.direction ||
          "incoming",
          false
        );

        return;

      }

      /*
        新增的礼物卡消息
      */

      if (
        message.type === "gift" &&
        message.gift
      ) {

        addGiftMessage(
          message.gift,
          message.direction,
          date
        );

        return;

      }


      /*
        旧聊天记录没有 type，
        自动继续当普通文字处理。
      */

      if (
        message.direction ===
        "outgoing"
      ) {

        addOutgoingMessage(
          message.text || "",
          date,
          false,
          message
        );

      } else {

        addIncomingMessage(
          message.text || "",
          date,
          false
        );

      }

    }
  );

}


/* =========================
   滚到底部
   ========================= */

function scrollToBottom() {

  goToLatestChatMessage(
    "auto"
  );

}


/* =========================
   如果其他页面修改了聊天记录
   ========================= */

window.addEventListener(
  "storage",
  function (event) {

    if (
      event.key !==
      CHAT_STORAGE_KEY
    ) {

      return;

    }


    chatHistory =
      loadStoredChatHistory();


    loadChatHistory();

  }
);


window.addEventListener(
  "storage",
  function (event) {

    if (
      !personStateEngine ||
      ![
        personStateEngine
          .CALENDAR_STORAGE_KEY,
        personStateEngine
          .HOME_LIFE_STORAGE_KEY
      ].includes(
        event.key
      )
    ) {

      return;

    }


    renderPersonStatus();

  }
);


setInterval(
  renderPersonStatus,
  30000
);


document.addEventListener(
  "visibilitychange",
  function () {

    if (!document.hidden) {

      renderPersonStatus();

    }

  }
);


/* =========================
   初始化
   ========================= */

loadChatHistory();

startActiveMessageTimer();

restoreLiveCallSession();

resumeGlobalAnsweredCall();


if (!callStartedAt) {

  startActiveCallTimer();

}

/* =========================
   每次进入聊天都停在最新消息
   ========================= */

function openChatAtLatestMessage() {

  /*
    如果是从搜索结果专门跳到某条消息，
    就不要强制跑到最底下。
  */

  const params =
    new URLSearchParams(
      window.location.search
    );


  if (
    params.get("message")
  ) {

    return;

  }


  function goToLatest() {

    const lastMessage =
      chatMessages.querySelector(
        ".message-row:last-of-type"
      ) ||
      chatMessages.lastElementChild;


    if (!lastMessage) {

      return;

    }


    lastMessage.scrollIntoView({

      block:
        "end",

      inline:
        "nearest",

      behavior:
        "auto"

    });

  }


  /*
    马上尝试一次。
  */

  goToLatest();


  /*
    等浏览器把聊天内容摆完以后，
    再补几次。
  */

  requestAnimationFrame(
    function () {

      goToLatest();


      requestAnimationFrame(
        function () {

          goToLatest();

        }
      );

    }
  );


  setTimeout(
    goToLatest,
    100
  );


  setTimeout(
    goToLatest,
    300
  );

}


/*
  第一次正常打开聊天页
*/

openChatAtLatestMessage();


/*
  从联系人页进入、
  从右上角其他页面返回、
  浏览器前进/后退回来，
  都再次定位到最新消息。
*/

window.addEventListener(
  "pageshow",
  function () {

    renderPersonStatus();


    openChatAtLatestMessage();

  }
);
