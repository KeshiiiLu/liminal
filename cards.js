/* =========================
   Liminal · Electronic Cards
   电子字卡只读浏览

   唯一数据来源：
   cards-corpus-data.js
   ========================= */



/* =========================
   电子字卡唯一来源
   ========================= */

function getCardSections() {

  if (
    window.CARD_CORPUS &&
    typeof window.CARD_CORPUS ===
      "object"
  ) {

    return window.CARD_CORPUS;

  }


  console.warn(
    "未读取到 cards-corpus-data.js"
  );


  return {

    normal: {
      id:
        "normal",

      name:
        "日常",

      items:
        []
    },

    intimate: {
      id:
        "intimate",

      name:
        "亲密",

      items:
        []
    },

    adult: {
      id:
        "adult",

      name:
        "情欲",

      items:
        []
    }

  };

}


const CARD_BROWSER_SECTIONS =
  getCardSections();



/* =========================
   搜索标准化
   简体 / 繁体 / 英文大小写
   ========================= */

const traditionalToSimplified =
  typeof OpenCC !==
    "undefined"
    ? OpenCC.Converter({
        from:
          "t",

        to:
          "cn"
      })
    : function (text) {

        return String(
          text
        );

      };


function normalizeForSearch(
  text
) {

  return traditionalToSimplified(
    String(
      text
    )
  )
    .normalize(
      "NFKC"
    )
    .toLowerCase();

}



/* =========================
   DOM
   ========================= */

const cardsList =
  document.getElementById(
    "cardsList"
  );


const cardsEmpty =
  document.getElementById(
    "cardsEmpty"
  );


const cardsSearch =
  document.getElementById(
    "cardsSearch"
  );


const searchClear =
  document.getElementById(
    "searchClear"
  );


const resultCount =
  document.getElementById(
    "resultCount"
  );


const summaryTitle =
  document.getElementById(
    "summaryTitle"
  );


const summaryText =
  document.getElementById(
    "summaryText"
  );


const summaryCardText =
  document.getElementById(
    "summaryCardText"
  );


const summaryNumber =
  document.getElementById(
    "summaryNumber"
  );


const sectionCardCount =
  document.getElementById(
    "sectionCardCount"
  );


const sectionTabs =
  document.querySelectorAll(
    ".section-tab"
  );


const detailBackdrop =
  document.getElementById(
    "detailBackdrop"
  );


const detailSheet =
  document.getElementById(
    "detailSheet"
  );


const detailClose =
  document.getElementById(
    "detailClose"
  );


const detailPath =
  document.getElementById(
    "detailPath"
  );


const detailTitle =
  document.getElementById(
    "detailTitle"
  );


const detailType =
  document.getElementById(
    "detailType"
  );


const treePreview =
  document.getElementById(
    "treePreview"
  );



/* =========================
   State
   ========================= */

let currentSection =
  "normal";


let searchKeyword =
  "";



/* =========================
   Helpers
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



function getCurrentCardSection() {

  return (
    CARD_BROWSER_SECTIONS[
      currentSection
    ] ||
    {
      id:
        currentSection,

      name:
        "",

      items:
        []
    }
  );

}



/* =========================
   判断分组
   ========================= */

function isCardTreeGroup(
  node
) {

  return (
    node &&
    typeof node ===
      "object" &&
    Array.isArray(
      node.children
    )
  );

}



/* =========================
   统计真正叶子数量
   ========================= */

function countTreeLeaves(
  tree
) {

  if (
    !Array.isArray(
      tree
    )
  ) {

    return 0;

  }


  let count =
    0;


  tree.forEach(
    function (node) {

      if (
        typeof node ===
        "string"
      ) {

        if (
          node.trim()
        ) {

          count +=
            1;

        }


        return;

      }


      if (
        isCardTreeGroup(
          node
        )
      ) {

        count +=
          countTreeLeaves(
            node.children
          );

      }

    }
  );


  return count;

}



/* =========================
   统计整个分区字卡数量
   ========================= */

function countSectionLeaves(
  section
) {

  return (
    (
      section.items ||
      []
    ).reduce(
      function (
        total,
        item
      ) {

        return (
          total +
          countTreeLeaves(
            item.tree
          )
        );

      },
      0
    )
  );

}



/* =========================
   tree 中是否存在分组
   ========================= */

function treeContainsGroup(
  tree
) {

  if (
    !Array.isArray(
      tree
    )
  ) {

    return false;

  }


  return (
    tree.some(
      function (node) {

        if (
          isCardTreeGroup(
            node
          )
        ) {

          return true;

        }


        return false;

      }
    )
  );

}



/* =========================
   Render list
   ========================= */

function renderCards() {

  const section =
    getCurrentCardSection();


  const items =
    Array.isArray(
      section.items
    )
      ? section.items
      : [];


  const filtered =
    items
      .map(
        function (
          item,
          index
        ) {

          return {

            item:
              item,

            index:
              index

          };

        }
      )
      .filter(
        function (entry) {

          if (
            !searchKeyword
          ) {

            return true;

          }


          return (
            normalizeForSearch(
              entry.item.name ||
              ""
            )
              .includes(
                searchKeyword
              )
          );

        }
      );


  cardsList.innerHTML =
    "";


  filtered.forEach(
    function (entry) {

      const item =
        entry.item;


      const index =
        entry.index;


      const leafCount =
        countTreeLeaves(
          item.tree
        );


      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "card-category";


      button.innerHTML = `

        <div class="category-index">
          ${padNumber(index + 1)}
        </div>


        <div class="category-copy">

          <strong>
          </strong>

          <span>
          </span>

        </div>


        <div class="category-arrow">
          ›
        </div>

      `;


      button
        .querySelector(
          "strong"
        )
        .textContent =
          item.name ||
          "未命名 01";


      button
        .querySelector(
          ".category-copy span"
        )
        .textContent =
          leafCount > 0
            ? `${leafCount} 枚字卡`
            : "子系尚未载入";


      button.addEventListener(
        "click",
        function () {

          openDetail(
            item,
            index
          );

        }
      );


      cardsList.appendChild(
        button
      );

    }
  );


  resultCount.textContent =
    filtered.length +
    " 项";


  cardsList.hidden =
    filtered.length ===
    0;


  cardsEmpty.hidden =
    filtered.length !==
    0;

}



/* =========================
   Summary
   ========================= */

function renderSummary() {

  const section =
    getCurrentCardSection();


  const itemCount =
    Array.isArray(
      section.items
    )
      ? section.items.length
      : 0;


  const cardCount =
    countSectionLeaves(
      section
    );


  summaryTitle.textContent =
    section.name ||
    "";


  summaryText.textContent =
    itemCount +
    "个层级";


  summaryNumber.textContent =
    itemCount;


  summaryCardText.textContent =
    cardCount +
    "枚字卡";


  sectionCardCount.textContent =
    cardCount;

}



/* =========================
   Tabs
   ========================= */

sectionTabs.forEach(
  function (tab) {

    tab.addEventListener(
      "click",
      function () {

        currentSection =
          tab.dataset.section;


        sectionTabs.forEach(
          function (
            otherTab
          ) {

            otherTab.classList.toggle(
              "active",
              otherTab ===
                tab
            );

          }
        );


        cardsSearch.value =
          "";


        searchKeyword =
          "";


        searchClear.hidden =
          true;


        renderSummary();


        renderCards();

      }
    );

  }
);



/* =========================
   Search
   ========================= */

cardsSearch.addEventListener(
  "input",
  function () {

    searchKeyword =
      normalizeForSearch(
        cardsSearch.value
          .trim()
      );


    searchClear.hidden =
      searchKeyword.length ===
      0;


    renderCards();

  }
);


searchClear.addEventListener(
  "click",
  function () {

    cardsSearch.value =
      "";


    searchKeyword =
      "";


    searchClear.hidden =
      true;


    cardsSearch.focus();


    renderCards();

  }
);



/* =========================
   Detail
   ========================= */

function openDetail(
  item,
  index
) {

  const section =
    getCurrentCardSection();


  const number =
    padNumber(
      index + 1
    );


  detailPath.textContent =
    section.name +
    " / " +
    number;


  detailTitle.textContent =
    item.name ||
    "未命名 01";


  renderTree(
    item.tree
  );


  detailBackdrop.hidden =
    false;


  requestAnimationFrame(
    function () {

      detailSheet.classList.add(
        "open"
      );

    }
  );


  detailSheet.setAttribute(
    "aria-hidden",
    "false"
  );

}



/* =========================
   Close detail
   ========================= */

function closeDetail() {

  detailSheet.classList.remove(
    "open"
  );


  detailSheet.setAttribute(
    "aria-hidden",
    "true"
  );


  setTimeout(
    function () {

      detailBackdrop.hidden =
        true;

    },
    240
  );

}



/* =========================
   Tree render
   ========================= */

function renderTree(
  tree
) {

  treePreview.innerHTML =
    "";


  if (
    !Array.isArray(
      tree
    ) ||
    tree.length ===
      0
  ) {

    detailType.textContent =
      "结构待导入";


    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "tree-empty";


    empty.textContent =
      "这个 01 当前还没有具体字卡内容。";


    treePreview.appendChild(
      empty
    );


    return;

  }


  detailType.textContent =
    treeContainsGroup(
      tree
    )
      ? "分层树"
      : "平铺叶子";


  tree.forEach(
    function (item) {

      treePreview.appendChild(
        createTreeNode(
          item
        )
      );

    }
  );

}



/* =========================
   Create tree node
   ========================= */

function createTreeNode(
  item
) {

  const node =
    document.createElement(
      "div"
    );


  node.className =
    "tree-node";


/* ---------- 字符串叶子 ---------- */

  if (
    typeof item ===
    "string"
  ) {

    const itemElement =
      document.createElement(
        "div"
      );


    itemElement.className =
      "tree-item";


    const dot =
      document.createElement(
        "span"
      );


    dot.className =
      "tree-dot";


    const label =
      document.createElement(
        "span"
      );


    label.className =
      "tree-label";


    label.textContent =
      item;


    itemElement.appendChild(
      dot
    );


    itemElement.appendChild(
      label
    );


    node.appendChild(
      itemElement
    );


    return node;

  }


/* ---------- 分组 ---------- */

  if (
    isCardTreeGroup(
      item
    )
  ) {

    const itemElement =
      document.createElement(
        "div"
      );


    itemElement.className =
      "tree-item group";


    const dot =
      document.createElement(
        "span"
      );


    dot.className =
      "tree-dot";


    const label =
      document.createElement(
        "span"
      );


    label.className =
      "tree-label";


    label.textContent =
      item.name ||
      "未命名分组";


    itemElement.appendChild(
      dot
    );


    itemElement.appendChild(
      label
    );


    node.appendChild(
      itemElement
    );


    if (
      item.children.length >
      0
    ) {

      const children =
        document.createElement(
          "div"
        );


      children.className =
        "tree-children";


      item.children.forEach(
        function (child) {

          children.appendChild(
            createTreeNode(
              child
            )
          );

        }
      );


      node.appendChild(
        children
      );

    }


    return node;

  }


/* ---------- 异常节点 ---------- */

  const unknown =
    document.createElement(
      "div"
    );


  unknown.className =
    "tree-item";


  unknown.textContent =
    "无法识别的字卡节点";


  node.appendChild(
    unknown
  );


  return node;

}



/* =========================
   Events
   ========================= */

detailClose.addEventListener(
  "click",
  closeDetail
);


detailBackdrop.addEventListener(
  "click",
  closeDetail
);


document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Escape"
    ) {

      closeDetail();

    }

  }
);



/* =========================
   Init
   ========================= */

renderSummary();


renderCards();