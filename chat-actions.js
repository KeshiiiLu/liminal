/* Liminal Chat Actions · 回复 / 复制 / 删除 */

let actionReplyTarget = null;
let actionReplyForNextOutgoing = null;
let actionSelectedId = null;


/* 样式直接放这里，不需要改 style.css */

const actionStyle = document.createElement("style");

actionStyle.textContent = `
.chat-reply-preview{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin:0 10px 8px;
  padding:9px 11px;
  border:1px solid rgba(50,50,46,.07);
  border-radius:13px;
  background:rgba(255,255,255,.92)
}

.chat-reply-preview[hidden]{
  display:none
}

.chat-reply-preview-text{
  min-width:0;
  display:grid;
  grid-template-columns:auto auto 1fr;
  align-items:baseline;
  gap:5px
}

.chat-reply-preview-label,
.chat-reply-preview-summary{
  color:#99968f;
  font-size:9px
}

.chat-reply-preview-sender{
  color:#65625c;
  font-size:10px;
  font-weight:600
}

.chat-reply-preview-summary{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap
}

.chat-reply-preview-close{
  width:24px;
  height:24px;
  padding:0;
  border:0;
  border-radius:50%;
  background:rgba(70,68,62,.055);
  color:#88857e;
  font-size:17px;
  cursor:pointer
}

.message-reply-quote{
  display:flex;
  flex-direction:column;
  width:100%;
  margin:0 0 7px;
  padding:7px 8px;
  border:0;
  border-left:2px solid rgba(70,68,62,.18);
  border-radius:7px;
  background:rgba(70,68,62,.055);
  text-align:left;
  cursor:pointer
}

.message-reply-quote span{
  margin-bottom:2px;
  color:#78756e;
  font-size:8px;
  font-weight:600
}

.message-reply-quote strong{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#8e8b84;
  font-size:9px;
  font-weight:400
}

.message-text{
  white-space:pre-wrap;
  word-break:break-word
}

.message-action-menu{
  position:fixed;
  z-index:9999;
  display:none;
  grid-template-columns:repeat(3,1fr);
  min-width:150px;
  padding:5px;
  border:1px solid rgba(45,43,39,.08);
  border-radius:14px;
  background:rgba(255,255,255,.97);
  box-shadow:0 10px 30px rgba(30,30,28,.12);
  backdrop-filter:blur(18px)
}

.message-action-menu.open{
  display:grid
}

.message-action-menu button{
  padding:9px 11px;
  border:0;
  border-radius:10px;
  background:transparent;
  color:#5f5c56;
  font-size:10px;
  cursor:pointer
}

.message-action-menu button:hover{
  background:rgba(70,68,62,.055)
}

.message-action-menu .danger{
  color:#a76767
}

.message-row{
  transition:filter .2s ease
}

.message-row.message-highlight{
  filter:brightness(.92)
}

/* 撤回消息 */

.recalled-message-row {
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 5px 14px;
}

.recalled-message-notice {
  color: #aaa79f;

  font-size: 10px;

  line-height: 1.5;

  text-align: center;
}

`;

document.head.appendChild(
  actionStyle
);


/* =========================
   消息 ID
   ========================= */

function actionCreateId() {

  return (
    window.crypto?.randomUUID?.() ||
    `msg_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`
  );

}


function actionEnsureIds() {

  let changed = false;


  chatHistory.forEach(
    function (message) {

      if (!message.id) {

        message.id =
          actionCreateId();

        changed = true;

      }

    }
  );


  if (changed) {

    saveChatHistory();

  }

}


/* =========================
   消息摘要
   ========================= */

function actionSummary(
  message
) {

  if (
    message?.type === "gift"
  ) {

    return (
      `🎁 ${message.gift?.productName ||
      "礼物"
      }`
    );

  }


  const text =
    String(
      message?.text || ""
    )
      .replace(/\s+/g, " ")
      .trim();


  return (
    text.length > 60
      ? `${text.slice(0, 60)}…`
      : (text || "消息")
  );

}


function actionSender(
  message
) {

  return (
    message.direction === "incoming"
      ? currentPerson.name
      : "你"
  );

}


/* =========================
   回复预览
   ========================= */

const actionBottom =
  document.querySelector(
    ".chat-bottom"
  );

const actionInputBar =
  document.querySelector(
    ".chat-input-bar"
  );


const actionPreview =
  document.createElement(
    "div"
  );


actionPreview.className =
  "chat-reply-preview";

actionPreview.hidden =
  true;


actionPreview.innerHTML = `

  <div class="chat-reply-preview-text">

    <span class="chat-reply-preview-label">
      回复
    </span>

    <strong class="chat-reply-preview-sender">
    </strong>

    <span class="chat-reply-preview-summary">
    </span>

  </div>

  <button
    class="chat-reply-preview-close"
    type="button"
  >
    ×
  </button>

`;


if (
  actionBottom &&
  actionInputBar
) {

  actionBottom.insertBefore(
    actionPreview,
    actionInputBar
  );

}


const actionPreviewSender =
  actionPreview.querySelector(
    ".chat-reply-preview-sender"
  );

const actionPreviewSummary =
  actionPreview.querySelector(
    ".chat-reply-preview-summary"
  );


function actionClearReply() {

  actionReplyTarget =
    null;

  actionPreview.hidden =
    true;

  actionPreviewSender.textContent =
    "";

  actionPreviewSummary.textContent =
    "";

}


actionPreview
  .querySelector(
    ".chat-reply-preview-close"
  )
  .addEventListener(
    "click",
    actionClearReply
  );


function actionSetReply(
  message
) {

  actionReplyTarget = {

    messageId:
      message.id,

    senderName:
      actionSender(
        message
      ),

    type:
      message.type ||
      "text",

    summary:
      actionSummary(
        message
      )

  };


  actionPreviewSender.textContent =
    actionReplyTarget.senderName;

  actionPreviewSummary.textContent =
    actionReplyTarget.summary;

  actionPreview.hidden =
    false;


  actionCloseMenu();

  closeMorePanel();

  chatInput.focus();

}


/* =========================
   消息菜单
   ========================= */

const actionMenu =
  document.createElement(
    "div"
  );


actionMenu.className =
  "message-action-menu";


actionMenu.innerHTML = `

  <button
    type="button"
    data-action="reply"
  >
    回复
  </button>

  <button
    type="button"
    data-action="copy"
  >
    复制
  </button>

  <button
    type="button"
    data-action="delete"
    class="danger"
  >
    删除
  </button>

  <button
    type="button"
    data-action="recall"
    class="message-action-recall"
  >
    撤回
  </button>

`;

const actionRecallButton =
  actionMenu.querySelector(
    ".message-action-recall"
  );


document.body.appendChild(
  actionMenu
);


function actionCloseMenu() {

  actionMenu.classList.remove(
    "open"
  );

  actionSelectedId =
    null;

}


function actionFindMessage(
  id
) {

  return chatHistory.find(
    function (message) {

      return (
        message.id === id
      );

    }
  );

}


function actionOpenMenu(
  id,
  x,
  y
) {

  const message =
    actionFindMessage(
      id
    );


  if (
    !message ||
    message.recalled
  ) {

    return;

  }


  actionSelectedId =
    id;


  /*
    只有自己发出的消息，
    才允许手动撤回。
  */

  const canRecall =
    message.direction ===
    "outgoing";


  actionRecallButton.hidden =
    !canRecall;


  actionMenu.style.gridTemplateColumns =
    canRecall
      ? "repeat(4, 1fr)"
      : "repeat(3, 1fr)";


  closeMorePanel();


  actionMenu.classList.add(
    "open"
  );


  actionMenu.style.left =
    `${x}px`;

  actionMenu.style.top =
    `${y}px`;


  requestAnimationFrame(
    function () {

      const rect =
        actionMenu
          .getBoundingClientRect();

      const margin =
        10;


      const left =
        Math.min(
          Math.max(
            margin,
            x
          ),
          window.innerWidth -
          rect.width -
          margin
        );


      const top =
        Math.min(
          Math.max(
            margin,
            y
          ),
          window.innerHeight -
          rect.height -
          margin
        );


      actionMenu.style.left =
        `${left}px`;

      actionMenu.style.top =
        `${top}px`;

    }
  );

}


document.addEventListener(
  "pointerdown",
  function (event) {

    if (
      actionMenu.classList.contains(
        "open"
      ) &&
      !actionMenu.contains(
        event.target
      )
    ) {

      actionCloseMenu();

    }

  }
);


/* =========================
   复制
   ========================= */

async function actionCopy(
  message
) {

  const text =
    message.type === "gift"
      ? actionSummary(
        message
      )
      : String(
        message.text || ""
      );


  try {

    await navigator.clipboard
      .writeText(
        text
      );

  } catch {

    const area =
      document.createElement(
        "textarea"
      );


    area.value =
      text;

    area.style.cssText =
      "position:fixed;opacity:0";


    document.body.appendChild(
      area
    );


    area.select();

    document.execCommand(
      "copy"
    );

    area.remove();

  }

}


/* =========================
   删除
   ========================= */

function actionDelete(
  message
) {

  const prompt =
    message.type === "gift"
      ? "从聊天中删除这张礼物卡？Mall 订单不会被删除。"
      : "删除这条消息？";


  if (
    !window.confirm(
      prompt
    )
  ) {

    return;

  }


  chatHistory =
    chatHistory.filter(
      function (item) {

        return (
          item.id !==
          message.id
        );

      }
    );


  if (
    actionReplyTarget?.messageId ===
    message.id
  ) {

    actionClearReply();

  }


  saveChatHistory();

  loadChatHistory();


  requestAnimationFrame(
    actionSyncRows
  );

}


/* =========================
   撤回
   ========================= */

function actionRecall(
  message
) {

  /*
    用户只能主动撤回
    自己发出的消息。
  */

  if (
    message.direction !==
      "outgoing" ||
    message.recalled
  ) {

    return;

  }


  const confirmed =
    window.confirm(
      "撤回这条消息？"
    );


  if (!confirmed) {

    return;

  }


  message.recalled =
    true;

  message.recalledAt =
    new Date().toISOString();

  message.recalledBy =
    "user";


  if (
    actionReplyTarget?.messageId ===
    message.id
  ) {

    actionClearReply();

  }


  saveChatHistory();

  loadChatHistory();


  requestAnimationFrame(
    actionSyncRows
  );

}

actionMenu.addEventListener(
  "click",
  async function (event) {

    const button =
      event.target.closest(
        "button[data-action]"
      );


    if (
      !button ||
      !actionSelectedId
    ) {

      return;

    }


    const message =
      actionFindMessage(
        actionSelectedId
      );


    if (!message) {

      actionCloseMenu();

      return;

    }


    if (
      button.dataset.action ===
      "reply"
    ) {

      actionSetReply(
        message
      );

      return;

    }


    if (
      button.dataset.action ===
      "copy"
    ) {

      await actionCopy(
        message
      );

      actionCloseMenu();

      return;

    }


    if (
      button.dataset.action ===
      "delete"
    ) {

      actionCloseMenu();

      actionDelete(
        message
      );

    }

    if (
      button.dataset.action ===
      "recall"
    ) {

      actionCloseMenu();

      actionRecall(
        message
      );

    }

  }
);

/* =========================
   已撤回消息
   ========================= */

function actionRenderRecalledRow(
  row,
  message
) {

  row.className =
    "message-row recalled-message-row";


  const actorName =
    message.direction ===
      "incoming"
      ? currentPerson.name
      : "你";


  row.innerHTML = `

    <div class="recalled-message-notice">
    </div>

  `;


  row
    .querySelector(
      ".recalled-message-notice"
    )
    .textContent =
      `${actorName}撤回了一条消息`;

}

/* =========================
   气泡里的引用
   ========================= */

function actionAddQuote(
  row,
  message
) {

  if (
    !message.replyTo ||
    message.type === "gift"
  ) {

    return;

  }


  const bubble =
    row.querySelector(
      ".message-bubble"
    );


  if (
    !bubble ||
    bubble.querySelector(
      ".message-reply-quote"
    )
  ) {

    return;

  }


  bubble.textContent =
    "";


  const quote =
    document.createElement(
      "button"
    );


  quote.type =
    "button";

  quote.className =
    "message-reply-quote";


  quote.innerHTML = `

    <span></span>
    <strong></strong>

  `;


  quote
    .querySelector("span")
    .textContent =
    message.replyTo.senderName ||
    "消息";


  quote
    .querySelector("strong")
    .textContent =
    message.replyTo.summary ||
    "消息";


  quote.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


      const id =
        message.replyTo.messageId;


      const target =
        Array.from(
          chatMessages.querySelectorAll(
            ".message-row"
          )
        )
          .find(
            function (item) {

              return (
                item.dataset.messageId ===
                id
              );

            }
          );


      if (!target) {

        return;

      }


      target.scrollIntoView({

        behavior:
          "smooth",

        block:
          "center"

      });


      target.classList.add(
        "message-highlight"
      );


      setTimeout(
        function () {

          target.classList.remove(
            "message-highlight"
          );

        },
        900
      );

    }
  );


  const text =
    document.createElement(
      "div"
    );


  text.className =
    "message-text";

  text.textContent =
    message.text || "";


  bubble.appendChild(
    quote
  );

  bubble.appendChild(
    text
  );

}


/* =========================
   长按 / 右键
   ========================= */

function actionBindRow(
  row,
  message
) {

  row.dataset.messageId =
    message.id;


  /*
    已经撤回：
    不再显示原气泡，
    也不再允许长按操作。
  */

  if (
    message.recalled
  ) {

    actionRenderRecalledRow(
      row,
      message
    );

    return;

  }


  actionAddQuote(
    row,
    message
  );


  if (
    row.dataset.actionsBound ===
    "true"
  ) {

    return;

  }


  row.dataset.actionsBound =
    "true";


  /* 电脑右键 */

  row.addEventListener(
    "contextmenu",
    function (event) {

      if (
        event.target.closest(
          ".gift-order-button"
        )
      ) {

        return;

      }


      event.preventDefault();


      actionOpenMenu(
        message.id,
        event.clientX,
        event.clientY
      );

    }
  );


  /* 手机长按 */

  let timer =
    null;

  let startX =
    0;

  let startY =
    0;


  function cancel() {

    if (
      timer !== null
    ) {

      clearTimeout(
        timer
      );

    }


    timer =
      null;

  }


  row.addEventListener(
    "pointerdown",
    function (event) {

      if (
        event.target.closest(
          ".gift-order-button"
        )
      ) {

        return;

      }


      if (
        event.pointerType ===
        "mouse" &&
        event.button !== 0
      ) {

        return;

      }


      startX =
        event.clientX;

      startY =
        event.clientY;


      cancel();


      timer =
        setTimeout(
          function () {

            actionOpenMenu(
              message.id,
              startX,
              startY
            );


            timer =
              null;

          },
          550
        );

    }
  );


  row.addEventListener(
    "pointermove",
    function (event) {

      if (
        timer === null
      ) {

        return;

      }


      if (
        Math.abs(
          event.clientX -
          startX
        ) > 12 ||
        Math.abs(
          event.clientY -
          startY
        ) > 12
      ) {

        cancel();

      }

    }
  );


  row.addEventListener(
    "pointerup",
    cancel
  );

  row.addEventListener(
    "pointercancel",
    cancel
  );

  row.addEventListener(
    "pointerleave",
    cancel
  );

}


/* =========================
   把聊天记录和气泡对应起来
   ========================= */

function actionSyncRows() {

  actionEnsureIds();


  const rows =
    Array.from(
      chatMessages.querySelectorAll(
        ".message-row"
      )
    );


  rows.forEach(
    function (
      row,
      index
    ) {

      const message =
        chatHistory[
        index
        ];


      if (message) {

        actionBindRow(
          row,
          message
        );

      }

    }
  );

}


/* =========================
   包装原来的发送函数
   ========================= */

const actionOriginalOutgoing =
  addOutgoingMessage;

const actionOriginalIncoming =
  addIncomingMessage;


addOutgoingMessage =
  function (
    text,
    date,
    shouldSave = true
  ) {

    const before =
      chatHistory.length;


    actionOriginalOutgoing(
      text,
      date,
      shouldSave
    );


    if (
      shouldSave &&
      chatHistory.length >
      before
    ) {

      const message =
        chatHistory[
        chatHistory.length -
        1
        ];


      if (!message.id) {

        message.id =
          actionCreateId();

      }


      if (
        actionReplyForNextOutgoing
      ) {

        message.replyTo = {
          ...actionReplyForNextOutgoing
        };

      }


      saveChatHistory();

    }


    actionReplyForNextOutgoing =
      null;


    requestAnimationFrame(
      actionSyncRows
    );

  };


addIncomingMessage =
  function (
    text,
    date,
    shouldSave = true
  ) {

    const before =
      chatHistory.length;


    actionOriginalIncoming(
      text,
      date,
      shouldSave
    );


    if (
      shouldSave &&
      chatHistory.length >
      before
    ) {

      const message =
        chatHistory[
        chatHistory.length -
        1
        ];


      if (!message.id) {

        message.id =
          actionCreateId();

        saveChatHistory();

      }

    }


    requestAnimationFrame(
      actionSyncRows
    );

  };


/* =========================
   覆盖发送：
   带上当前回复目标
   ========================= */

sendMessage =
  function () {

    const text =
      chatInput.value.trim();


    if (
      text === ""
    ) {

      return;

    }


    actionReplyForNextOutgoing =
      actionReplyTarget
        ? {
          ...actionReplyTarget
        }
        : null;


    addOutgoingMessage(
      text,
      new Date(),
      true
    );


    actionClearReply();


    chatInput.value =
      "";


    chatInput.focus();


    createTestReply();

  };


/* =========================
   新消息出现时自动绑定
   ========================= */

const actionObserver =
  new MutationObserver(
    function () {

      requestAnimationFrame(
        actionSyncRows
      );

    }
  );


actionObserver.observe(
  chatMessages,
  {
    childList:
      true
  }
);


actionEnsureIds();

actionSyncRows();