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


const params =
  new URLSearchParams(
    window.location.search
  );


const requestedPersonId =
  params.get("person");


const currentPerson =
  CHAT_PEOPLE[requestedPersonId] ||
  CHAT_PEOPLE.luzhen;


const chatSearchInput =
  document.getElementById(
    "chatSearchInput"
  );


const clearSearchButton =
  document.getElementById(
    "clearSearchButton"
  );


const searchResults =
  document.getElementById(
    "searchResults"
  );


const searchEmpty =
  document.getElementById(
    "searchEmpty"
  );


const searchSummary =
  document.getElementById(
    "searchSummary"
  );


const searchFilters =
  document.querySelectorAll(
    ".search-filter"
  );


let currentFilter =
  "all";


/* =========================
   页面人物
   ========================= */

document.getElementById(
  "searchPersonName"
).textContent =
  `搜索 · ${currentPerson.name}`;


document.title =
  `搜索 ${currentPerson.name} · Liminal`;


/* =========================
   返回设置页
   ========================= */

document.getElementById(
  "searchBack"
).addEventListener(
  "click",
  function () {

    window.location.href =
      `chat-settings.html?person=${encodeURIComponent(
        currentPerson.id
      )}`;

  }
);


/* =========================
   读取聊天
   ========================= */

function loadChatHistory() {

  const saved =
    localStorage.getItem(
      currentPerson.storageKey
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
   时间
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


function formatSearchTime(
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


  const time =
    `${padNumber(
      date.getHours()
    )}:${padNumber(
      date.getMinutes()
    )}`;


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
    `${date.getFullYear()}年` +
    `${month}月${day}日 ${time}`
  );

}


/* =========================
   消息类型
   ========================= */

function getMessageType(
  message
) {

  if (
    message.type === "gift"
  ) {

    return "gift";

  }


  return "text";

}


/* =========================
   搜索内容
   ========================= */

function getSearchableText(
  message
) {

  if (
    message.recalled
  ) {

    return "";

  }


  if (
    message.type === "gift"
  ) {

    return [

      message.gift?.productName,

      message.gift?.productCategory,

      message.gift?.message

    ]
      .filter(Boolean)
      .join(" ");

  }


  return String(
    message.text || ""
  );

}


/* =========================
   创建结果
   ========================= */

function createSearchResult(
  message
) {

  const item =
    document.createElement(
      "article"
    );


  item.className =
    "search-result";

item.dataset.messageId =
  message.id || "";


if (message.id) {

  item.setAttribute(
    "role",
    "button"
  );

  item.setAttribute(
    "tabindex",
    "0"
  );


  function openOriginalMessage() {

    window.location.href =
      `chat.html?person=${encodeURIComponent(
        currentPerson.id
      )}&message=${encodeURIComponent(
        message.id
      )}`;

  }


  item.addEventListener(
    "click",
    openOriginalMessage
  );


  item.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openOriginalMessage();

      }

    }
  );

}

  const incoming =
    message.direction ===
      "incoming";


  const senderName =
    incoming
      ? currentPerson.name
      : "你";


  const avatarText =
    incoming
      ? currentPerson.avatar
      : "K";


  const type =
    getMessageType(
      message
    );


  item.innerHTML = `

    <div class="result-avatar">
    </div>

    <div class="result-main">

      <div class="result-top">

        <strong class="result-sender">
        </strong>

        <span class="result-time">
        </span>

      </div>

      <span class="result-type">
      </span>

      <div class="result-body">
      </div>

    </div>

  `;


  item
    .querySelector(
      ".result-avatar"
    )
    .textContent =
      avatarText;


  item
    .querySelector(
      ".result-sender"
    )
    .textContent =
      senderName;


  item
    .querySelector(
      ".result-time"
    )
    .textContent =
      formatSearchTime(
        message.time
      );


  const typeLabel =
    item.querySelector(
      ".result-type"
    );


  const body =
    item.querySelector(
      ".result-body"
    );


  if (
    type === "gift"
  ) {

    typeLabel.textContent =
      "礼物";


    const gift =
      document.createElement(
        "div"
      );


    gift.className =
      "result-gift";


    gift.innerHTML = `

      <strong></strong>
      <span></span>

    `;


    gift
      .querySelector(
        "strong"
      )
      .textContent =
        message.gift?.productName ||
        "礼物";


    gift
      .querySelector(
        "span"
      )
      .textContent =
        message.gift?.message ||
        "Liminal Mall";


    body.appendChild(
      gift
    );

  } else {

    typeLabel.textContent =
      "文字";


    const text =
      document.createElement(
        "div"
      );


    text.className =
      "result-text";


    text.textContent =
      message.text || "";


    body.appendChild(
      text
    );

  }


  return item;

}


/* =========================
   筛选并渲染
   ========================= */

function renderSearchResults() {

  const keyword =
    chatSearchInput.value
      .trim()
      .toLowerCase();


  clearSearchButton.hidden =
    keyword === "";


  const history =
    loadChatHistory();


  const results =
    history
      .filter(
        function (message) {

          /*
            撤回消息不显示原内容
          */

          if (
            message.recalled
          ) {

            return false;

          }


          const type =
            getMessageType(
              message
            );


          if (
            currentFilter !==
              "all" &&
            type !==
              currentFilter
          ) {

            return false;

          }


          if (
            keyword === ""
          ) {

            return true;

          }


          return (
            getSearchableText(
              message
            )
              .toLowerCase()
              .includes(
                keyword
              )
          );

        }
      )
      .reverse();


  searchResults.innerHTML =
    "";


  searchSummary.textContent =
    `${results.length} 条消息`;


  searchEmpty.hidden =
    results.length !== 0;


  results.forEach(
    function (message) {

      searchResults.appendChild(
        createSearchResult(
          message
        )
      );

    }
  );

}


/* =========================
   输入搜索
   ========================= */

chatSearchInput.addEventListener(
  "input",
  renderSearchResults
);


/* =========================
   清空搜索
   ========================= */

clearSearchButton.addEventListener(
  "click",
  function () {

    chatSearchInput.value =
      "";

    chatSearchInput.focus();

    renderSearchResults();

  }
);


/* =========================
   类型切换
   ========================= */

searchFilters.forEach(
  function (button) {

    button.addEventListener(
      "click",
      function () {

        currentFilter =
          button.dataset.filter;


        searchFilters.forEach(
          function (item) {

            item.classList.toggle(
              "active",
              item === button
            );

          }
        );


        renderSearchResults();

      }
    );

  }
);


/* =========================
   初始化
   ========================= */

renderSearchResults();