/* =========================
   Liminal · Poke Actions
   Read-only browser
   ========================= */


/* =========================
   DOM
   ========================= */

const personTabs =
  document.getElementById(
    "personTabs"
  );

const summaryName =
  document.getElementById(
    "summaryName"
  );

const summaryMeta =
  document.getElementById(
    "summaryMeta"
  );

const summaryCount =
  document.getElementById(
    "summaryCount"
  );

const pokeSearch =
  document.getElementById(
    "pokeSearch"
  );

const searchClear =
  document.getElementById(
    "searchClear"
  );

const listEyebrow =
  document.getElementById(
    "listEyebrow"
  );

const listTitle =
  document.getElementById(
    "listTitle"
  );

const listCount =
  document.getElementById(
    "listCount"
  );

const pokeList =
  document.getElementById(
    "pokeList"
  );

const pokeEmpty =
  document.getElementById(
    "pokeEmpty"
  );

const emptyText =
  document.getElementById(
    "emptyText"
  );


const pokeBackdrop =
  document.getElementById(
    "pokeBackdrop"
  );

const pokeSheet =
  document.getElementById(
    "pokeSheet"
  );

const sheetClose =
  document.getElementById(
    "sheetClose"
  );

const sheetPath =
  document.getElementById(
    "sheetPath"
  );

const sheetTitle =
  document.getElementById(
    "sheetTitle"
  );

const sheetCount =
  document.getElementById(
    "sheetCount"
  );

const sheetActions =
  document.getElementById(
    "sheetActions"
  );


/* =========================
   State
   ========================= */

let currentPerson =
  "luzhen";

let searchKeyword =
  "";


/* =========================
   Search normalization
   大小写 + 简繁互搜
   ========================= */

const traditionalToSimplified =
  OpenCC.Converter({
    from: "t",
    to: "cn"
  });


function normalizeForSearch(
  text
) {

  return traditionalToSimplified(
    String(text)
  )
    .normalize("NFKC")
    .toLowerCase();

}


/* =========================
   Helpers
   ========================= */

function getCurrentData() {

  return POKE_LIBRARY[
    currentPerson
  ];

}


function getActionCount(
  personData
) {

  return personData.categories.reduce(
    function (
      total,
      category
    ) {

      return (
        total +
        category.actions.length
      );

    },
    0
  );

}


/* =========================
   Person tabs
   ========================= */

function renderPersonTabs() {

  personTabs.innerHTML =
    "";


  Object.entries(
    POKE_LIBRARY
  ).forEach(
    function (
      [
        personId,
        personData
      ]
    ) {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";

      button.className =
        "person-tab";


      if (
        personId ===
        currentPerson
      ) {

        button.classList.add(
          "active"
        );

      }


      button.textContent =
        personData.name;


      button.addEventListener(
        "click",
        function () {

          if (
            personId ===
            currentPerson
          ) {

            return;

          }


          currentPerson =
            personId;


          searchKeyword =
            "";

          pokeSearch.value =
            "";

          searchClear.hidden =
            true;


          renderAll();

        }
      );


      personTabs.appendChild(
        button
      );

    }
  );

}


/* =========================
   Summary
   ========================= */

function renderSummary() {

  const data =
    getCurrentData();


  const actionCount =
    getActionCount(
      data
    );


  summaryName.textContent =
    data.name;


  summaryMeta.textContent =
    data.categories.length +
    " 个分类 · " +
    actionCount +
    " 个动作";


  summaryCount.textContent =
    actionCount;

}


/* =========================
   Categories
   ========================= */

function renderCategories() {

  const data =
    getCurrentData();


  pokeList.innerHTML =
    "";


  listEyebrow.textContent =
    "CATEGORIES";

  listTitle.textContent =
    "分类";

  listCount.textContent =
    data.categories.length +
    " 项";


  data.categories.forEach(
    function (category) {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";

      button.className =
        "category-row";


      button.innerHTML = `
        <div class="category-index">
          ${category.id}
        </div>

        <div class="category-copy">

          <strong>
            ${category.name}
          </strong>

          <span>
            ${category.actions.length} 个动作
          </span>

        </div>

        <div class="category-arrow">
          ›
        </div>
      `;


      button.addEventListener(
        "click",
        function () {

          openCategory(
            category
          );

        }
      );


      pokeList.appendChild(
        button
      );

    }
  );


  pokeList.hidden =
    data.categories.length ===
    0;


  pokeEmpty.hidden =
    data.categories.length !==
    0;


  if (
    data.categories.length ===
    0
  ) {

    emptyText.textContent =
      "当前人物还没有拍一拍动作";

  }

}


/* =========================
   Search
   ========================= */

function renderSearchResults() {

  const data =
    getCurrentData();


  const results =
    [];


  data.categories.forEach(
    function (category) {

      const categoryMatches =
        normalizeForSearch(
          category.name
        ).includes(
          searchKeyword
        );


      category.actions.forEach(
        function (action) {

          const actionMatches =
            normalizeForSearch(
              action
            ).includes(
              searchKeyword
            );


          if (
            categoryMatches ||
            actionMatches
          ) {

            results.push({
              category,
              action
            });

          }

        }
      );

    }
  );


  pokeList.innerHTML =
    "";


  listEyebrow.textContent =
    "SEARCH RESULT";

  listTitle.textContent =
    "搜索结果";

  listCount.textContent =
    results.length +
    " 条";


  results.forEach(
    function (result) {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "search-result";


      item.innerHTML = `
        <div class="search-result-meta">

          <strong>
            ${result.category.id}
          </strong>

          <span>
            ${result.category.name}
          </span>

        </div>

        <p>
          ${result.action}
        </p>
      `;


      pokeList.appendChild(
        item
      );

    }
  );


  pokeList.hidden =
    results.length ===
    0;


  pokeEmpty.hidden =
    results.length !==
    0;


  if (
    results.length ===
    0
  ) {

    emptyText.textContent =
      "当前人物没有匹配的拍一拍动作";

  }

}


/* =========================
   Category sheet
   ========================= */

function openCategory(
  category
) {

  const data =
    getCurrentData();


  sheetPath.textContent =
    data.name +
    " / " +
    category.id;


  sheetTitle.textContent =
    category.name;


  sheetCount.textContent =
    category.actions.length +
    " 个动作";


  sheetActions.innerHTML =
    "";


  if (
    category.actions.length ===
    0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "sheet-empty";


    empty.textContent =
      "当前分类暂时没有动作";


    sheetActions.appendChild(
      empty
    );

  } else {

    category.actions.forEach(
      function (action) {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "action-item";


        item.textContent =
          action;


        sheetActions.appendChild(
          item
        );

      }
    );

  }


  pokeBackdrop.hidden =
    false;


  requestAnimationFrame(
    function () {

      pokeSheet.classList.add(
        "open"
      );

    }
  );


  pokeSheet.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeCategory() {

  pokeSheet.classList.remove(
    "open"
  );


  pokeSheet.setAttribute(
    "aria-hidden",
    "true"
  );


  setTimeout(
    function () {

      pokeBackdrop.hidden =
        true;

    },
    240
  );

}


/* =========================
   Search events
   ========================= */

pokeSearch.addEventListener(
  "input",
  function () {

    searchKeyword =
      normalizeForSearch(
        pokeSearch.value
          .trim()
      );


    searchClear.hidden =
      searchKeyword.length ===
      0;


    renderContent();

  }
);


searchClear.addEventListener(
  "click",
  function () {

    pokeSearch.value =
      "";

    searchKeyword =
      "";

    searchClear.hidden =
      true;


    pokeSearch.focus();


    renderContent();

  }
);


/* =========================
   Sheet events
   ========================= */

sheetClose.addEventListener(
  "click",
  closeCategory
);


pokeBackdrop.addEventListener(
  "click",
  closeCategory
);


document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Escape"
    ) {

      closeCategory();

    }

  }
);


/* =========================
   Render
   ========================= */

function renderContent() {

  if (
    searchKeyword
  ) {

    renderSearchResults();

  } else {

    renderCategories();

  }

}


function renderAll() {

  renderPersonTabs();

  renderSummary();

  renderContent();

}


/* =========================
   Init
   ========================= */

renderAll();