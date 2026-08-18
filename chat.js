const moreButton =
  document.getElementById("moreButton");

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
    avatar: "L",
    storageKey: "liminal_chat_luzhen"
  },

  jasper: {
    id: "jasper",
    name: "Jasper",
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


const MALL_ORDERS_KEY =
  "liminal_mall_orders_v1";


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


/* 随机抽一张测试回复 */

function createTestReply() {

  showTypingStatus();


  const delay =
    1500 +
    Math.random() * 2000;


  setTimeout(
    function () {

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


      hideTypingStatus();

    },
    delay
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