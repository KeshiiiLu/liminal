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

const pageDots =
  document.querySelectorAll(".page-dot");

const chatInput =
  document.querySelector(".chat-input");

const chatMessages =
  document.getElementById("chatMessages");


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


const CHAT_STORAGE_KEY =
  currentPerson.storageKey;

const POKE_STATE_KEY =
  `liminal_chat_poke_state_${currentPerson.id}`;

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


chatPersonName.textContent =
  currentPerson.name;

chatPersonStatus.textContent =
  "在线";

document.title =
  `${currentPerson.name} · Liminal`;


let chatHistory =
  loadStoredChatHistory();

let lastMessageTime =
  null;

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


  const randomIndex =
    Math.floor(
      Math.random() *
      testPokeCards.length
    );


  const text =
  testPokeCards[
    randomIndex
  ];


addPokeMessage(
  text,
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

/* =========================
   更多功能面板
   ========================= */

function openMorePanel() {

  chatInput.blur();

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


/* =========================
   保存普通文字消息
   ========================= */

function saveMessage(
  direction,
  text,
  date
) {

  chatHistory.push({

    type:
      "text",

    direction:
      direction,

    text:
      text,

    time:
      date.toISOString()

  });


  saveChatHistory();

}


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
   普通文字消息
   ========================= */

/* 自己发出的消息 */

function addOutgoingMessage(
  text,
  date,
  shouldSave = true
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
        ${formatMessageTime(date)}
      </div>

    </div>

    <div class="message-avatar">
      K
    </div>

  `;


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
      "outgoing",
      text,
      date
    );

  }


  scrollToBottom();

}


/* 对方发来的消息 */

function addIncomingMessage(
  text,
  date,
  shouldSave = true
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


  scrollToBottom();

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

  }


  scrollToBottom();

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

  avatar.textContent =
    direction === "incoming"
      ? currentPerson.avatar
      : "K";


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


  createTestReply();

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
   测试随机回复
   ========================= */

const testReplyCards = [
  "是",
  "不是",
  "不完全是",
  "我不知道",
  "嗯"
];

/* 拍一拍测试语料 */

const testPokeCards = [
  "榛榛摸了摸你的腰际",
  "榛榛吻了吻你的耳垂",
  "榛榛戳了戳你的脸",
  "榛榛看着你叹了口气"
];

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

    const randomIndex =
      Math.floor(
        Math.random() *
        testReplyCards.length
      );


    const reply =
      testReplyCards[
        randomIndex
      ];


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


    createTestContinue();

  },
  true
);

const originalPersonName =
  currentPerson.name;


/* 显示正在输入 */

function showTypingStatus() {

  chatPersonName.textContent =
    "对方正在输入…";

}


/* 恢复人物备注名 */

function hideTypingStatus() {

  chatPersonName.textContent =
    originalPersonName;

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

    const randomIndex =
      Math.floor(
        Math.random() *
        testReplyCards.length
      );


    const reply =
      testReplyCards[
        randomIndex
      ];


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
          false
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

  chatMessages.scrollTop =
    chatMessages.scrollHeight;

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


/* =========================
   初始化
   ========================= */

loadChatHistory();