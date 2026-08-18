/* =========================================
   Liminal Chat Favorites Save
   多选消息 → 标题 / 备注 → 保存聊天片段
   ========================================= */

const FAVORITES_STORAGE_KEY =
  "liminal_chat_favorites_v1";


/* =========================================
   样式
   ========================================= */

const favoriteSaveStyle =
  document.createElement(
    "style"
  );


favoriteSaveStyle.textContent = `

  .favorite-save-mask {
    position: fixed;
    inset: 0;

    z-index: 20000;

    display: none;
    align-items: flex-end;
    justify-content: center;

    padding: 18px;

    background:
      rgba(28, 28, 26, .24);

    backdrop-filter:
      blur(4px);
  }


  .favorite-save-mask.open {
    display: flex;
  }


  .favorite-save-panel {
    width:
      min(430px, 100%);

    padding:
      18px;

    border-radius:
      22px;

    background:
      #fafaf8;

    box-shadow:
      0 20px 60px
      rgba(25, 25, 23, .18);
  }


  .favorite-save-header {
    margin-bottom:
      16px;
  }


  .favorite-save-header strong {
    display: block;

    margin-bottom:
      4px;

    color:
      #4f4d48;

    font-size:
      15px;
  }


  .favorite-save-header span {
    color:
      #99968f;

    font-size:
      10px;
  }


  .favorite-save-field {
    display: flex;
    flex-direction: column;

    gap: 6px;

    margin-bottom:
      13px;
  }


  .favorite-save-field label {
    color:
      #77746d;

    font-size:
      10px;
  }


  .favorite-save-field input,

  .favorite-save-field textarea {
    width: 100%;

    box-sizing:
      border-box;

    border:
      1px solid
      rgba(60, 58, 53, .09);

    border-radius:
      13px;

    background:
      #ffffff;

    color:
      #55524c;

    font: inherit;

    font-size:
      12px;

    outline: none;
  }


  .favorite-save-field input {
    height:
      42px;

    padding:
      0 12px;
  }


  .favorite-save-field textarea {
    min-height:
      82px;

    padding:
      11px 12px;

    resize:
      none;
  }


  .favorite-save-field input:focus,

  .favorite-save-field textarea:focus {
    border-color:
      rgba(70, 68, 62, .24);
  }


  .favorite-save-actions {
    display: grid;

    grid-template-columns:
      1fr 1fr;

    gap:
      9px;

    margin-top:
      16px;
  }


  .favorite-save-actions button {
    height:
      42px;

    border:
      0;

    border-radius:
      14px;

    font-size:
      12px;

    cursor:
      pointer;
  }


  .favorite-save-cancel {
    background:
      rgba(70, 68, 62, .06);

    color:
      #77746d;
  }


  .favorite-save-confirm {
    background:
      #5f5c56;

    color:
      #ffffff;
  }

`;


document.head.appendChild(
  favoriteSaveStyle
);


/* =========================================
   浮窗
   ========================================= */

const favoriteSaveMask =
  document.createElement(
    "div"
  );


favoriteSaveMask.className =
  "favorite-save-mask";


favoriteSaveMask.innerHTML = `

  <div class="favorite-save-panel">

    <div class="favorite-save-header">

      <strong>
        收藏聊天片段
      </strong>

      <span
        id="favoriteSaveCount"
      >
      </span>

    </div>


    <div class="favorite-save-field">

      <label>
        标题 · 可选
      </label>

      <input
        id="favoriteSaveTitle"
        type="text"
        maxlength="80"
      >

    </div>


    <div class="favorite-save-field">

      <label>
        备注 · 可选
      </label>

      <textarea
        id="favoriteSaveNote"
        maxlength="500"
        placeholder="想记住什么，可以写在这里"
      ></textarea>

    </div>


    <div class="favorite-save-actions">

      <button
        class="favorite-save-cancel"
        type="button"
      >
        取消
      </button>

      <button
        class="favorite-save-confirm"
        type="button"
      >
        保存收藏
      </button>

    </div>

  </div>

`;


document.body.appendChild(
  favoriteSaveMask
);


const favoriteSaveCount =
  favoriteSaveMask.querySelector(
    "#favoriteSaveCount"
  );


const favoriteSaveTitle =
  favoriteSaveMask.querySelector(
    "#favoriteSaveTitle"
  );


const favoriteSaveNote =
  favoriteSaveMask.querySelector(
    "#favoriteSaveNote"
  );


const favoriteSaveCancel =
  favoriteSaveMask.querySelector(
    ".favorite-save-cancel"
  );


const favoriteSaveConfirm =
  favoriteSaveMask.querySelector(
    ".favorite-save-confirm"
  );


/* =========================================
   默认标题
   ========================================= */

function createDefaultFavoriteTitle() {

  const now =
    new Date();


  return (
    `与${currentPerson.name}的聊天片段 · ` +
    `${now.getMonth() + 1}月${now.getDate()}日`
  );

}


/* =========================================
   打开 / 关闭
   ========================================= */

function openFavoriteSave() {

  const count =
    selectedMessageIds.size;


  if (
    count === 0
  ) {

    return;

  }


  favoriteSaveCount.textContent =
    `已选择 ${count} 条消息`;


  favoriteSaveTitle.value =
    createDefaultFavoriteTitle();


  favoriteSaveNote.value =
    "";


  favoriteSaveMask.classList.add(
    "open"
  );


  setTimeout(
    function () {

      favoriteSaveTitle.focus();

      favoriteSaveTitle.select();

    },
    60
  );

}


function closeFavoriteSave() {

  favoriteSaveMask.classList.remove(
    "open"
  );

}


/* =========================================
   读取收藏
   ========================================= */

function loadFavorites() {

  const saved =
    localStorage.getItem(
      FAVORITES_STORAGE_KEY
    );


  if (!saved) {

    return [];

  }


  try {

    const parsed =
      JSON.parse(saved);


    return (
      Array.isArray(parsed)
        ? parsed
        : []
    );

  } catch {

    return [];

  }

}


/* =========================================
   收藏 ID
   ========================================= */

function createFavoriteId() {

  return (
    window.crypto?.randomUUID?.() ||
    `fav_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`
  );

}


/* =========================================
   真正保存
   ========================================= */

function saveSelectedFavorite() {

  const selectedMessages =
    chatHistory.filter(
      function (message) {

        return (
          selectedMessageIds.has(
            message.id
          )
        );

      }
    );


  if (
    selectedMessages.length === 0
  ) {

    return;

  }


  /*
    深拷贝消息。

    以后原聊天删除、修改，
    收藏里的这一份仍然存在。
  */

  const messageSnapshots =
    JSON.parse(
      JSON.stringify(
        selectedMessages
      )
    );


  const title =
    favoriteSaveTitle.value.trim() ||
    createDefaultFavoriteTitle();


  const note =
    favoriteSaveNote.value.trim();


  const favorite = {

    id:
      createFavoriteId(),

    type:
      "chat-fragment",

    title:
      title,

    note:
      note,

    createdAt:
      new Date().toISOString(),

    personId:
      currentPerson.id,

    personName:
      currentPerson.name,

    personAvatar:
      currentPerson.avatar,

    messageCount:
      messageSnapshots.length,

    messages:
      messageSnapshots

  };


  const favorites =
    loadFavorites();


  favorites.unshift(
    favorite
  );


  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(
      favorites
    )
  );


  closeFavoriteSave();


  exitSelectionMode();


  if (
    typeof showSelectionToast ===
      "function"
  ) {

    showSelectionToast(
      `已收藏 ${messageSnapshots.length} 条消息`
    );

  }

}


/* =========================================
   接管原来的“收藏 · X”
   ========================================= */

selectionSave.addEventListener(
  "click",
  function (event) {

    /*
      chat-selection.js 原本还有一个
      测试用的 click。

      这里直接拦住它，
      改为打开真正的收藏浮窗。
    */

    event.preventDefault();

    event.stopImmediatePropagation();


    openFavoriteSave();

  },
  true
);


/* =========================================
   浮窗按钮
   ========================================= */

favoriteSaveCancel.addEventListener(
  "click",
  closeFavoriteSave
);


favoriteSaveConfirm.addEventListener(
  "click",
  saveSelectedFavorite
);


/* 点灰色背景关闭 */

favoriteSaveMask.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      favoriteSaveMask
    ) {

      closeFavoriteSave();

    }

  }
);