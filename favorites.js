const FAVORITES_STORAGE_KEY =
  "liminal_chat_favorites_v1";


const favoritesList =
  document.getElementById(
    "favoritesList"
  );


const favoritesEmpty =
  document.getElementById(
    "favoritesEmpty"
  );


const favoritesCount =
  document.getElementById(
    "favoritesCount"
  );


const favoritesBack =
  document.getElementById(
    "favoritesBack"
  );


/* =========================
   URL
   ========================= */

const favoriteParams =
  new URLSearchParams(
    window.location.search
  );


const returnPerson =
  favoriteParams.get(
    "person"
  );


/* =========================
   返回聊天
   ========================= */

favoritesBack.addEventListener(
  "click",
  function () {

    if (returnPerson) {

      window.location.href =
        `chat.html?person=${encodeURIComponent(
          returnPerson
        )}`;

      return;

    }


    window.location.href =
      "messages.html";

  }
);


/* =========================
   读取收藏
   ========================= */

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
      JSON.parse(
        saved
      );


    return (
      Array.isArray(parsed)
        ? parsed
        : []
    );

  } catch {

    return [];

  }

}


/* =========================
   保存收藏
   ========================= */

function saveFavorites(
  favorites
) {

  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(
      favorites
    )
  );

}


/* =========================
   时间
   ========================= */

function padFavoriteNumber(
  number
) {

  return String(
    number
  ).padStart(
    2,
    "0"
  );

}


function formatFavoriteCreatedAt(
  value
) {

  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return (
    `${date.getFullYear()}.` +
    `${padFavoriteNumber(
      date.getMonth() + 1
    )}.` +
    `${padFavoriteNumber(
      date.getDate()
    )}`
  );

}


function formatFavoriteMessageTime(
  value
) {

  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return (
    `${padFavoriteNumber(
      date.getHours()
    )}:` +
    `${padFavoriteNumber(
      date.getMinutes()
    )}:` +
    `${padFavoriteNumber(
      date.getSeconds()
    )}`
  );

}


/* =========================
   单条消息
   ========================= */

function createFavoriteMessage(
  message,
  favorite
) {

  /*
    收藏保存的是快照。

    即使原聊天后来删除，
    这里仍然显示收藏时的内容。
  */


  if (
    message.recalled
  ) {

    const recalled =
      document.createElement(
        "div"
      );


    recalled.className =
      "favorite-recalled";


    const actor =
      message.direction ===
        "incoming"
        ? favorite.personName
        : "你";


    recalled.textContent =
      `${actor}撤回了一条消息`;


    return recalled;

  }


  const row =
    document.createElement(
      "div"
    );


  const direction =
    message.direction ===
      "incoming"
      ? "incoming"
      : "outgoing";


  row.className =
    `favorite-message-row ${direction}`;


  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "favorite-message-avatar";


  avatar.textContent =
    direction === "incoming"
      ? (
          favorite.personAvatar ||
          favorite.personName?.charAt(0) ||
          "?"
        )
      : "K";


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "favorite-message-content";


  /*
    礼物消息
  */

  if (
    message.type === "gift"
  ) {

    const gift =
      document.createElement(
        "div"
      );


    gift.className =
      "favorite-gift";


    gift.innerHTML = `

      <span>
        LIMINAL MALL · GIFT
      </span>

      <strong>
      </strong>

    `;


    gift
      .querySelector(
        "strong"
      )
      .textContent =
        message.gift?.productName ||
        "礼物";


    content.appendChild(
      gift
    );

  } else {

    /*
      普通文字
    */

    const bubble =
      document.createElement(
        "div"
      );


    bubble.className =
      "favorite-message-bubble";


    /*
      引用
    */

    if (
      message.replyTo
    ) {

      const quote =
        document.createElement(
          "div"
        );


      quote.className =
        "favorite-message-quote";


      quote.innerHTML = `

        <span></span>
        <strong></strong>

      `;


      quote
        .querySelector(
          "span"
        )
        .textContent =
          message.replyTo.senderName ||
          "消息";


      quote
        .querySelector(
          "strong"
        )
        .textContent =
          message.replyTo.summary ||
          "消息";


      bubble.appendChild(
        quote
      );

    }


    const text =
      document.createElement(
        "div"
      );


    text.textContent =
      message.text || "";


    bubble.appendChild(
      text
    );


    content.appendChild(
      bubble
    );

  }


  const time =
    document.createElement(
      "div"
    );


  time.className =
    "favorite-message-time";


  time.textContent =
    formatFavoriteMessageTime(
      message.time
    );


  content.appendChild(
    time
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


  return row;

}


/* =========================
   创建收藏卡
   ========================= */

function createFavoriteCard(
  favorite
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "favorite-card";


  const main =
    document.createElement(
      "button"
    );


  main.type =
    "button";

  main.className =
    "favorite-card-main";


  main.innerHTML = `

    <div class="favorite-card-top">

      <div class="favorite-person-avatar">
      </div>


      <div class="favorite-card-title-area">

        <strong class="favorite-card-title">
        </strong>

        <span class="favorite-card-meta">
        </span>

      </div>


      <span class="favorite-card-arrow">
        ›
      </span>

    </div>

  `;


  main
    .querySelector(
      ".favorite-person-avatar"
    )
    .textContent =
      favorite.personAvatar ||
      favorite.personName?.charAt(0) ||
      "?";


  main
    .querySelector(
      ".favorite-card-title"
    )
    .textContent =
      favorite.title ||
      `与${favorite.personName || "对方"}的聊天片段`;


  main
    .querySelector(
      ".favorite-card-meta"
    )
    .textContent =
      `${favorite.personName || "未知人物"} · ` +
      `${formatFavoriteCreatedAt(
        favorite.createdAt
      )} · ` +
      `${favorite.messageCount || favorite.messages?.length || 0} 条消息`;


  /*
    备注
  */

  if (
    favorite.note
  ) {

    const note =
      document.createElement(
        "p"
      );


    note.className =
      "favorite-note";


    note.textContent =
      favorite.note;


    main.appendChild(
      note
    );

  }


  /*
    展开内容
  */

  const detail =
    document.createElement(
      "div"
    );


  detail.className =
    "favorite-detail";


  const messages =
    document.createElement(
      "div"
    );


  messages.className =
    "favorite-messages";


  const snapshots =
    Array.isArray(
      favorite.messages
    )
      ? favorite.messages
      : [];


  snapshots.forEach(
    function (message) {

      messages.appendChild(
        createFavoriteMessage(
          message,
          favorite
        )
      );

    }
  );


  detail.appendChild(
    messages
  );


  /*
    删除按钮
  */

  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "favorite-actions";


  const deleteButton =
    document.createElement(
      "button"
    );


  deleteButton.type =
    "button";

  deleteButton.className =
    "favorite-delete";

  deleteButton.textContent =
    "删除收藏";


  actions.appendChild(
    deleteButton
  );


  detail.appendChild(
    actions
  );


  /*
    展开 / 收起
  */

  main.addEventListener(
    "click",
    function () {

      card.classList.toggle(
        "open"
      );

    }
  );


  /*
    删除整个收藏
  */

  deleteButton.addEventListener(
    "click",
    function () {

      const confirmed =
        window.confirm(
          "删除这个收藏的聊天片段？原聊天不会受到影响。"
        );


      if (!confirmed) {

        return;

      }


      const favorites =
        loadFavorites()
          .filter(
            function (item) {

              return (
                item.id !==
                favorite.id
              );

            }
          );


      saveFavorites(
        favorites
      );


      renderFavorites();

    }
  );


  card.appendChild(
    main
  );

  card.appendChild(
    detail
  );


  return card;

}


/* =========================
   渲染
   ========================= */

function renderFavorites() {

  const favorites =
    loadFavorites();


  favoritesList.innerHTML =
    "";


  favoritesCount.textContent =
    `${favorites.length} 个收藏`;


  favoritesEmpty.hidden =
    favorites.length !== 0;


  if (
    favorites.length === 0
  ) {

    return;

  }


  favorites.forEach(
    function (favorite) {

      favoritesList.appendChild(
        createFavoriteCard(
          favorite
        )
      );

    }
  );

}


/* =========================
   初始化
   ========================= */

renderFavorites();