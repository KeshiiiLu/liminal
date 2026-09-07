/* =========================================
   Liminal Chat Selection
   + → 收藏 → 新增收藏 / 查看收藏
   ========================================= */

const selectionHeader =
  document.querySelector(
    ".chat-header"
  );

const selectionBottom =
  document.querySelector(
    ".chat-bottom"
  );

let selectionMode =
  false;

let selectedMessageIds =
  new Set();


/* =========================================
   样式
   ========================================= */

const selectionStyle =
  document.createElement(
    "style"
  );


selectionStyle.textContent = `

  /* =========================
     收藏入口弹窗
     ========================= */

  .favorite-entry-mask {
    position: fixed;
    inset: 0;
    z-index: 12000;

    display: none;
    align-items: flex-end;
    justify-content: center;

    padding: 18px;

    background: rgba(28, 28, 26, .22);
    backdrop-filter: blur(3px);
  }

  .favorite-entry-mask.open {
    display: flex;
  }


  .favorite-entry-panel {
    width: min(420px, 100%);

    padding: 10px;

    border-radius: 20px;

    background: rgba(250, 250, 248, .98);

    box-shadow:
      0 18px 50px
      rgba(30, 30, 28, .16);
  }


  .favorite-entry-title {
    padding: 8px 10px 11px;

    color: #8a877f;

    font-size: 10px;
    letter-spacing: .08em;
  }


  .favorite-entry-button {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 14px 12px;

    border: 0;
    border-radius: 14px;

    background: transparent;

    text-align: left;

    cursor: pointer;
  }


  .favorite-entry-button:hover {
    background: rgba(70, 68, 62, .05);
  }


  .favorite-entry-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }


  .favorite-entry-text strong {
    color: #55524c;

    font-size: 13px;
    font-weight: 600;
  }


  .favorite-entry-text span {
    color: #9a978f;

    font-size: 10px;
  }


  .favorite-entry-arrow {
    color: #aaa79f;
    font-size: 20px;
  }


  /* =========================
     顶部多选栏
     ========================= */

  .chat-selection-header {
    display: none;

    flex: 1;
    align-items: center;
    justify-content: space-between;

    min-width: 0;

    margin-left: 8px;
  }


  .chat-selection-count {
    color: #4f4d48;

    font-size: 14px;
    font-weight: 600;
  }


  .chat-selection-cancel {
    padding: 8px 4px 8px 12px;

    border: 0;

    background: transparent;

    color: #77746d;

    font-size: 13px;

    cursor: pointer;
  }


  body.chat-selection-mode
  .chat-person,

  body.chat-selection-mode
  .chat-settings {

    display: none;

  }


  body.chat-selection-mode
  .chat-selection-header {

    display: flex;

  }


  /* =========================
     消息选择圆圈
     ========================= */

  .message-row {
    position: relative;
  }


  .chat-select-circle {
    position: absolute;

    left: 8px;
    top: 50%;

    width: 21px;
    height: 21px;

    padding: 0;

    display: none;
    align-items: center;
    justify-content: center;

    border:
      1.5px solid #c9c6bf;

    border-radius: 50%;

    background: #ffffff;

    color: #ffffff;

    font-size: 13px;

    transform:
      translateY(-50%);

    z-index: 5;

    pointer-events: none;
  }


  body.chat-selection-mode
  .chat-select-circle {

    display: flex;

  }


  body.chat-selection-mode
  .message-row {

    padding-left: 38px;

    cursor: pointer;

    user-select: none;
    -webkit-user-select: none;

  }


  .chat-select-circle.selected {

    background: #74716a;
    border-color: #74716a;

  }


  .chat-select-circle.selected::after {

    content: "✓";

  }


  body.chat-selection-mode
  .message-row.is-selected {

    background:
      rgba(80, 78, 72, .035);

  }


  /* =========================
     底部收藏按钮
     ========================= */

  .chat-selection-bottom {

    display: none;

    align-items: center;
    justify-content: center;

    min-height: 58px;

    padding: 8px 14px;

  }


  body.chat-selection-mode
  .chat-selection-bottom {

    display: flex;

  }


  body.chat-selection-mode
  .chat-input-bar {

    display: none;

  }


  body.chat-selection-mode
  .more-panel {

    display: none !important;

  }


  .chat-selection-save {

    width:
      min(320px, 90%);

    padding: 12px 18px;

    border: 0;
    border-radius: 15px;

    background: #5f5c56;

    color: #ffffff;

    font-size: 13px;
    font-weight: 600;

    cursor: pointer;

  }


  .chat-selection-save:disabled {

    opacity: .32;

    cursor: default;

  }


  /* =========================
     小提示
     ========================= */

  .chat-selection-toast {

    position: fixed;

    left: 50%;
    bottom: 88px;

    z-index: 15000;

    max-width:
      calc(100vw - 40px);

    padding: 9px 14px;

    border-radius: 12px;

    background:
      rgba(55, 53, 49, .9);

    color: #ffffff;

    font-size: 11px;

    transform:
      translateX(-50%);

    opacity: 0;

    pointer-events: none;

    transition:
      opacity .2s ease;

  }


  .chat-selection-toast.show {

    opacity: 1;

  }

`;


document.head.appendChild(
  selectionStyle
);


/* =========================================
   找到 + 面板里的“收藏”
   ========================================= */

const favoriteMoreButton =
  Array.from(
    document.querySelectorAll(
      ".more-item"
    )
  )
  .find(
    function (button) {

      const label =
        button.querySelector(
          "small"
        );


      return (
        label &&
        label.textContent.trim() ===
          "收藏"
      );

    }
  );


/* =========================================
   收藏入口弹窗
   ========================================= */

const favoriteEntryMask =
  document.createElement(
    "div"
  );


favoriteEntryMask.className =
  "favorite-entry-mask";


favoriteEntryMask.innerHTML = `

  <div class="favorite-entry-panel">

    <div class="favorite-entry-title">
      收藏
    </div>


    <button
      class="favorite-entry-button"
      type="button"
      data-favorite-action="new"
    >

      <span class="favorite-entry-text">

        <strong>
          新增收藏
        </strong>

        <span>
          从当前聊天中选择多条消息
        </span>

      </span>

      <span class="favorite-entry-arrow">
        ›
      </span>

    </button>


    <button
      class="favorite-entry-button"
      type="button"
      data-favorite-action="view"
      data-liminal-nav
    >

      <span class="favorite-entry-text">

        <strong>
          查看收藏
        </strong>

        <span>
          查看已经保存的聊天片段
        </span>

      </span>

      <span class="favorite-entry-arrow">
        ›
      </span>

    </button>

  </div>

`;


document.body.appendChild(
  favoriteEntryMask
);


function openFavoriteEntry() {

  if (
    typeof closeMorePanel ===
      "function"
  ) {

    closeMorePanel();

  }


  chatInput.blur();


  favoriteEntryMask.classList.add(
    "open"
  );

}


function closeFavoriteEntry() {

  favoriteEntryMask.classList.remove(
    "open"
  );

}


/* 点背景关闭 */

favoriteEntryMask.addEventListener(
  "pointerdown",
  function (event) {

    if (
      event.target ===
      favoriteEntryMask
    ) {

      closeFavoriteEntry();

    }

  }
);


/* + → 收藏
   用 pointerdown 抢在更多面板的拖动逻辑之前响应
*/

if (favoriteMoreButton) {

  favoriteMoreButton.addEventListener(
    "pointerdown",
    function (event) {

      event.preventDefault();

      event.stopPropagation();


      openFavoriteEntry();

    },
    true
  );

}


/* =========================================
   顶部：
   已选择 X 条 / 取消
   ========================================= */

const selectionHeaderBar =
  document.createElement(
    "div"
  );


selectionHeaderBar.className =
  "chat-selection-header";


selectionHeaderBar.innerHTML = `

  <span class="chat-selection-count">
    已选择 0 条
  </span>


  <button
    class="chat-selection-cancel"
    type="button"
  >
    取消
  </button>

`;


selectionHeader.appendChild(
  selectionHeaderBar
);


const selectionCount =
  selectionHeaderBar.querySelector(
    ".chat-selection-count"
  );


const selectionCancel =
  selectionHeaderBar.querySelector(
    ".chat-selection-cancel"
  );


/* =========================================
   底部收藏按钮
   ========================================= */

const selectionBottomBar =
  document.createElement(
    "div"
  );


selectionBottomBar.className =
  "chat-selection-bottom";


selectionBottomBar.innerHTML = `

  <button
    class="chat-selection-save"
    type="button"
    disabled
  >
    收藏
  </button>

`;


selectionBottom.appendChild(
  selectionBottomBar
);


const selectionSave =
  selectionBottomBar.querySelector(
    ".chat-selection-save"
  );


/* =========================================
   Toast
   ========================================= */

const selectionToast =
  document.createElement(
    "div"
  );


selectionToast.className =
  "chat-selection-toast";


document.body.appendChild(
  selectionToast
);


let selectionToastTimer =
  null;


function showSelectionToast(
  text
) {

  selectionToast.textContent =
    text;


  selectionToast.classList.add(
    "show"
  );


  clearTimeout(
    selectionToastTimer
  );


  selectionToastTimer =
    setTimeout(
      function () {

        selectionToast.classList.remove(
          "show"
        );

      },
      1800
    );

}


/* =========================================
   更新多选 UI
   ========================================= */

function updateSelectionUI() {

  const count =
    selectedMessageIds.size;


  selectionCount.textContent =
    `已选择 ${count} 条`;


  selectionSave.disabled =
    count === 0;


  selectionSave.textContent =
    count === 0
      ? "收藏"
      : `收藏 · ${count}`;

}


/* =========================================
   给消息补选择圆圈
   ========================================= */

function syncSelectionRows() {

  if (
    typeof actionSyncRows ===
      "function"
  ) {

    actionSyncRows();

  }


  const rows =
    Array.from(
      chatMessages.querySelectorAll(
        ".message-row"
      )
    );


  rows.forEach(
    function (row) {

      const id =
        row.dataset.messageId;


      if (!id) {

        return;

      }


      let circle =
        row.querySelector(
          ".chat-select-circle"
        );


      if (!circle) {

        circle =
          document.createElement(
            "span"
          );


        circle.className =
          "chat-select-circle";


        row.appendChild(
          circle
        );

      }


      const selected =
        selectedMessageIds.has(
          id
        );


      circle.classList.toggle(
        "selected",
        selected
      );


      row.classList.toggle(
        "is-selected",
        selected
      );

    }
  );

}


/* =========================================
   进入多选
   ========================================= */

function enterSelectionMode() {

  selectionMode =
    true;


  selectedMessageIds.clear();


  if (
    typeof actionCloseMenu ===
      "function"
  ) {

    actionCloseMenu();

  }


  if (
    typeof closeMorePanel ===
      "function"
  ) {

    closeMorePanel();

  }


  closeFavoriteEntry();


  chatInput.blur();


  document.body.classList.add(
    "chat-selection-mode"
  );


  syncSelectionRows();

  updateSelectionUI();

}


/* =========================================
   退出多选
   ========================================= */

function exitSelectionMode() {

  selectionMode =
    false;


  selectedMessageIds.clear();


  document.body.classList.remove(
    "chat-selection-mode"
  );


  syncSelectionRows();

  updateSelectionUI();

}


/* =========================================
   选择 / 取消一条消息
   ========================================= */

function toggleSelectedMessage(
  row
) {

  const id =
    row.dataset.messageId;


  if (!id) {

    return;

  }


  if (
    selectedMessageIds.has(
      id
    )
  ) {

    selectedMessageIds.delete(
      id
    );

  } else {

    selectedMessageIds.add(
      id
    );

  }


  syncSelectionRows();

  updateSelectionUI();

}


/* =========================================
   点击消息 = 勾选
   ========================================= */

chatMessages.addEventListener(
  "click",
  function (event) {

    if (
      !selectionMode
    ) {

      return;

    }


    const row =
      event.target.closest(
        ".message-row"
      );


    if (!row) {

      return;

    }


    event.preventDefault();

    event.stopPropagation();


    toggleSelectedMessage(
      row
    );

  },
  true
);


/* =========================================
   多选时不允许弹出
   回复 / 复制 / 删除
   ========================================= */

chatMessages.addEventListener(
  "contextmenu",
  function (event) {

    if (
      !selectionMode
    ) {

      return;

    }


    if (
      event.target.closest(
        ".message-row"
      )
    ) {

      event.preventDefault();

      event.stopPropagation();

    }

  },
  true
);


/* =========================================
   取消
   ========================================= */

selectionCancel.addEventListener(
  "click",
  exitSelectionMode
);


/* =========================================
   收藏入口：
   新增 / 查看
   ========================================= */

favoriteEntryMask.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        "[data-favorite-action]"
      );


    if (!button) {

      return;

    }


    const action =
      button.dataset.favoriteAction;


    if (
      action === "new"
    ) {

      enterSelectionMode();

      return;

    }


    if (
  action === "view"
) {

  closeFavoriteEntry();


  window.location.href =
    `favorites.html?person=${encodeURIComponent(
      currentPerson.id
    )}`;

}

  }
);


/* =========================================
   当前阶段：
   收藏按钮先只验证多选
   下一步再真正保存快照
   ========================================= */

selectionSave.addEventListener(
  "click",
  function () {

    const count =
      selectedMessageIds.size;


    if (
      count === 0
    ) {

      return;

    }


    showSelectionToast(
      `已选择 ${count} 条消息`
    );

  }
);


/* =========================================
   聊天重新渲染时同步
   ========================================= */

const selectionObserver =
  new MutationObserver(
    function () {

      requestAnimationFrame(
        syncSelectionRows
      );

    }
  );


selectionObserver.observe(
  chatMessages,
  {
    childList:
      true
  }
);


/* =========================================
   初始化
   ========================================= */

syncSelectionRows();

updateSelectionUI();
