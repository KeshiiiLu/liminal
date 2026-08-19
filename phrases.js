/* =========================
   Liminal · Quick Phrases
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

const phrasesSearch =
  document.getElementById(
    "phrasesSearch"
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

const phrasesList =
  document.getElementById(
    "phrasesList"
  );

const phrasesEmpty =
  document.getElementById(
    "phrasesEmpty"
  );

const emptyText =
  document.getElementById(
    "emptyText"
  );


const phraseBackdrop =
  document.getElementById(
    "phraseBackdrop"
  );

const phraseSheet =
  document.getElementById(
    "phraseSheet"
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

const sheetPhrases =
  document.getElementById(
    "sheetPhrases"
  );


/* =========================
   State
   ========================= */

let currentPerson =
  "luzhen";

let searchKeyword =
  "";


/* =========================
   Helpers
   ========================= */

   /* =========================
   Search normalization
   英文大小写 + 简繁互搜
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

function getCurrentData() {

  return PHRASE_LIBRARY[
    currentPerson
  ];

}


function getPhraseCount(
  personData
) {

  return personData.categories.reduce(
    function (
      total,
      category
    ) {

      return (
        total +
        category.phrases.length
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
    PHRASE_LIBRARY
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
            currentPerson ===
            personId
          ) {

            return;

          }


          currentPerson =
            personId;


          searchKeyword =
            "";

          phrasesSearch.value =
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


  const phraseCount =
    getPhraseCount(
      data
    );


  summaryName.textContent =
    data.name;


  summaryMeta.textContent =
    data.categories.length +
    " 个分类 · " +
    phraseCount +
    " 条用语";


  summaryCount.textContent =
    phraseCount;

}


/* =========================
   Category list
   ========================= */

function renderCategories() {

  const data =
    getCurrentData();


  phrasesList.innerHTML =
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
            ${category.phrases.length} 条用语
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


      phrasesList.appendChild(
        button
      );

    }
  );


  phrasesList.hidden =
    data.categories.length === 0;


  phrasesEmpty.hidden =
    data.categories.length !== 0;


  if (
    data.categories.length === 0
  ) {

    emptyText.textContent =
      "当前人物还没有快捷用语分类";

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

      category.phrases.forEach(
        function (phrase) {

          if (
  normalizeForSearch(
    phrase
  ).includes(
    searchKeyword
  )
) {

            results.push({
              category,
              phrase
            });

          }

        }
      );

    }
  );


  phrasesList.innerHTML =
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

          <span>
            ${result.category.id}
          </span>

          <span>
            ${result.category.name}
          </span>

        </div>

        <p>
          ${result.phrase}
        </p>
      `;


      phrasesList.appendChild(
        item
      );

    }
  );


  phrasesList.hidden =
    results.length === 0;


  phrasesEmpty.hidden =
    results.length !== 0;


  if (
    results.length === 0
  ) {

    emptyText.textContent =
      "当前人物没有匹配的快捷用语";

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
    category.phrases.length +
    " 条";


  sheetPhrases.innerHTML =
    "";


  if (
    category.phrases.length ===
    0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "sheet-empty";


    empty.textContent =
      "当前分类尚未载入具体语料";


    sheetPhrases.appendChild(
      empty
    );

  } else {

    category.phrases.forEach(
      function (phrase) {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "phrase-item";


        item.textContent =
          phrase;


        sheetPhrases.appendChild(
          item
        );

      }
    );

  }


  phraseBackdrop.hidden =
    false;


  requestAnimationFrame(
    function () {

      phraseSheet.classList.add(
        "open"
      );

    }
  );


  phraseSheet.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeCategory() {

  phraseSheet.classList.remove(
    "open"
  );


  phraseSheet.setAttribute(
    "aria-hidden",
    "true"
  );


  setTimeout(
    function () {

      phraseBackdrop.hidden =
        true;

    },
    240
  );

}


/* =========================
   Search events
   ========================= */

phrasesSearch.addEventListener(
  "input",
  function () {

    searchKeyword =
      normalizeForSearch(
        phrasesSearch.value
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

    phrasesSearch.value =
      "";

    searchKeyword =
      "";

    searchClear.hidden =
      true;


    phrasesSearch.focus();


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


phraseBackdrop.addEventListener(
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