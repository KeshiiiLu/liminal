const moreButton = document.getElementById("moreButton");
const morePanel = document.getElementById("morePanel");
const morePages = document.getElementById("morePages");
const pageDots = document.querySelectorAll(".page-dot");

const chatInput = document.querySelector(".chat-input");

function openMorePanel() {
  chatInput.blur();

  morePanel.classList.add("open");
  document.body.classList.add("more-panel-open");
}

function closeMorePanel() {
  morePanel.classList.remove("open");
  document.body.classList.remove("more-panel-open");
}

moreButton.addEventListener("click", function (event) {
  event.stopPropagation();

  if (morePanel.classList.contains("open")) {
    closeMorePanel();

    setTimeout(function () {
      chatInput.focus();
    }, 50);
  } else {
    openMorePanel();
  }
});

chatInput.addEventListener("focus", function () {
  closeMorePanel();
});

document.addEventListener("pointerdown", function (event) {
  if (!morePanel.classList.contains("open")) {
    return;
  }

  const clickedInsidePanel = morePanel.contains(event.target);
  const clickedMoreButton = moreButton.contains(event.target);

  if (!clickedInsidePanel && !clickedMoreButton) {
    closeMorePanel();
  }
});

morePages.addEventListener("scroll", function () {
  const pageWidth = morePages.clientWidth;
  const currentPage = Math.round(morePages.scrollLeft / pageWidth);

  pageDots.forEach(function (dot, index) {
    dot.classList.toggle("active", index === currentPage);
  });
});

let isDragging = false;
let startX = 0;
let startScrollLeft = 0;

morePages.addEventListener("pointerdown", function (event) {
  isDragging = true;
  startX = event.clientX;
  startScrollLeft = morePages.scrollLeft;
  morePages.setPointerCapture(event.pointerId);
});

morePages.addEventListener("pointermove", function (event) {
  if (!isDragging) return;

  const distance = event.clientX - startX;
  morePages.scrollLeft = startScrollLeft - distance;
});

morePages.addEventListener("pointerup", function () {
  isDragging = false;
});

morePages.addEventListener("pointercancel", function () {
  isDragging = false;
});

const chatMessages = document.getElementById("chatMessages");

let lastMessageTime = null;


/* 把数字补成两位：8 → 08 */
function padNumber(number) {
  return String(number).padStart(2, "0");
}


/* 每条气泡下面的小时间：精确到秒 */
function formatMessageTime(date) {
  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  const seconds = padNumber(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
}


/* 消息流中间的大时间 */
function formatDividerTime(date) {
  const now = new Date();

  const sameYear =
    date.getFullYear() === now.getFullYear();

  const sameDay =
    sameYear &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());

  const time = `${hours}:${minutes}`;

  if (sameDay) {
    return time;
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (sameYear) {
    return `${month}月${day}日 ${time}`;
  }

  return `${date.getFullYear()}年${month}月${day}日 ${time}`;
}


/* 判断这一条前面要不要出现大时间 */
function shouldShowTimeDivider(currentTime) {
  if (lastMessageTime === null) {
    return true;
  }

  const difference = currentTime - lastMessageTime;

  return difference >= 5 * 60 * 1000;
}


/* 插入中央时间 */
function addTimeDivider(date) {
  const divider = document.createElement("div");

  divider.className = "time-divider";
  divider.textContent = formatDividerTime(date);

  chatMessages.appendChild(divider);
}


/* 插入你自己发出的消息 */
function addOutgoingMessage(text, date) {
  if (shouldShowTimeDivider(date)) {
    addTimeDivider(date);
  }

  const row = document.createElement("div");
  row.className = "message-row outgoing";

  row.innerHTML = `
    <div class="message-content">

      <div class="message-bubble"></div>

      <div class="message-time">
        ${formatMessageTime(date)}
      </div>

    </div>

    <div class="message-avatar">
      K
    </div>
  `;

  row.querySelector(".message-bubble").textContent = text;

  chatMessages.appendChild(row);

  lastMessageTime = date;

  chatMessages.scrollTop = chatMessages.scrollHeight;
}


/* 发送输入框中的文字 */
function sendMessage() {
  const text = chatInput.value.trim();

  if (text === "") {
    return;
  }

  const now = new Date();

  addOutgoingMessage(text, now);

  chatInput.value = "";
  chatInput.focus();
  
  createTestReply();
}


/* 按回车发送 */
chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

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

const chatPersonName = document.getElementById("chatPersonName");
const originalPersonName = chatPersonName.textContent;


/* 显示“对方正在输入…” */
function showTypingStatus() {
  chatPersonName.textContent = "对方正在输入…";
}


/* 恢复人物备注名 */
function hideTypingStatus() {
  chatPersonName.textContent = originalPersonName;
}


/* 插入对方消息 */
function addIncomingMessage(text, date) {
  if (shouldShowTimeDivider(date)) {
    addTimeDivider(date);
  }

  const row = document.createElement("div");
  row.className = "message-row incoming";

  row.innerHTML = `
    <div class="message-avatar">
      L
    </div>

    <div class="message-content">

      <div class="message-bubble"></div>

      <div class="message-time">
        ${formatMessageTime(date)}
      </div>

    </div>
  `;

  row.querySelector(".message-bubble").textContent = text;

  chatMessages.appendChild(row);

  lastMessageTime = date;

  chatMessages.scrollTop = chatMessages.scrollHeight;
}


/* 随机抽一张测试卡并回复 */
function createTestReply() {
  showTypingStatus();

  const delay = 1500 + Math.random() * 2000;

  setTimeout(function () {
    const randomIndex = Math.floor(
      Math.random() * testReplyCards.length
    );

    const reply = testReplyCards[randomIndex];

    addIncomingMessage(reply, new Date());

    hideTypingStatus();
  }, delay);
}