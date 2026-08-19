/* =========================
   Liminal · Private Codes
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

const codesSearch =
  document.getElementById(
    "codesSearch"
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

const codesList =
  document.getElementById(
    "codesList"
  );

const codesEmpty =
  document.getElementById(
    "codesEmpty"
  );

const emptyText =
  document.getElementById(
    "emptyText"
  );


const codeBackdrop =
  document.getElementById(
    "codeBackdrop"
  );

const codeSheet =
  document.getElementById(
    "codeSheet"
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

const sheetStatus =
  document.getElementById(
    "sheetStatus"
  );

const sheetCount =
  document.getElementById(
    "sheetCount"
  );

const sheetCodes =
  document.getElementById(
    "sheetCodes"
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

  return CODE_LIBRARY[
    currentPerson
  ];

}


function normalizeCode(
  code
) {

  if (
    typeof code ===
    "string"
  ) {

    return {
      text:
        code,

      meaning:
        ""
    };

  }


  return {
    text:
      code.text || "",

    meaning:
      code.meaning || ""
  };

}


function getStatusName(
  status
) {

  return (
    status ===
    "confirmed"
      ? "已约定"
      : "候选"
  );

}


function getCounts(
  personData
) {

  let confirmed =
    0;

  let candidate =
    0;


  personData.categories.forEach(
    function (category) {

      const count =
        category.codes.length;


      if (
        category.status ===
        "confirmed"
      ) {

        confirmed +=
          count;

      } else {

        candidate +=
          count;

      }

    }
  );


  return {
    confirmed,
    candidate,
    total:
      confirmed +
      candidate
  };

}


/* =========================
   Person tabs
   ========================= */

function renderPersonTabs() {

  personTabs.innerHTML =
    "";


  Object.entries(
    CODE_LIBRARY
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

          codesSearch.value =
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


  const counts =
    getCounts(
      data
    );


  summaryName.textContent =
    data.name;


  summaryMeta.textContent =
    counts.confirmed +
    " 已约定 · " +
    counts.candidate +
    " 候选";


  summaryCount.textContent =
    counts.total;

}


/* =========================
   Categories
   ========================= */

function renderCategories() {

  const data =
    getCurrentData();


  codesList.innerHTML =
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


      const statusName =
        getStatusName(
          category.status
        );


      button.innerHTML = `
        <div class="category-index">
          ${category.id}
        </div>

        <div class="category-copy">

          <strong>
            ${category.name}
          </strong>

          <div class="category-meta">

            <span
              class="
                category-status
                ${category.status}
              "
            >
              ${statusName}
            </span>

            <span>
              ${category.codes.length} 条
            </span>

          </div>

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


      codesList.appendChild(
        button
      );

    }
  );


  codesList.hidden =
    data.categories.length ===
    0;


  codesEmpty.hidden =
    data.categories.length !==
    0;


  if (
    data.categories.length ===
    0
  ) {

    emptyText.textContent =
      "当前人物还没有暗号分类";

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

      category.codes.forEach(
        function (rawCode) {

          const code =
            normalizeCode(
              rawCode
            );


          const searchableText =
            normalizeForSearch(
              [
                category.name,
                code.text,
                code.meaning
              ].join(" ")
            );


          if (
            searchableText.includes(
              searchKeyword
            )
          ) {

            results.push({
              category,
              code
            });

          }

        }
      );

    }
  );


  codesList.innerHTML =
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


      const statusName =
        getStatusName(
          result.category.status
        );


      item.innerHTML = `
        <div class="search-result-meta">

          <strong>
            ${result.category.id}
          </strong>

          <span>
            ${result.category.name}
          </span>

          <span
            class="
              search-result-status
              ${result.category.status}
            "
          >
            ${statusName}
          </span>

        </div>

        <p>
          ${result.code.text}
        </p>

        ${
          result.code.meaning
            ? `
              <small>
                ${result.code.meaning}
              </small>
            `
            : ""
        }
      `;


      codesList.appendChild(
        item
      );

    }
  );


  codesList.hidden =
    results.length ===
    0;


  codesEmpty.hidden =
    results.length !==
    0;


  if (
    results.length ===
    0
  ) {

    emptyText.textContent =
      "当前人物没有匹配的暗号";

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
    category.codes.length +
    " 条";


  sheetStatus.textContent =
    getStatusName(
      category.status
    );


  sheetStatus.classList.toggle(
    "candidate",
    category.status ===
      "candidate"
  );


  sheetCodes.innerHTML =
    "";


  if (
    category.codes.length ===
    0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "sheet-empty";


    empty.textContent =
      category.status ===
      "candidate"
        ? "当前分类暂时没有候选暗号"
        : "当前分类暂时没有暗号";


    sheetCodes.appendChild(
      empty
    );

  } else {

    category.codes.forEach(
      function (rawCode) {

        const code =
          normalizeCode(
            rawCode
          );


        const item =
          document.createElement(
            "div"
          );


        item.className =
          "code-item";


        const title =
          document.createElement(
            "strong"
          );


        title.textContent =
          code.text;


        item.appendChild(
          title
        );


        if (
          code.meaning
        ) {

          const meaning =
            document.createElement(
              "p"
            );


          meaning.textContent =
            code.meaning;


          item.appendChild(
            meaning
          );

        }


        sheetCodes.appendChild(
          item
        );

      }
    );

  }


  codeBackdrop.hidden =
    false;


  requestAnimationFrame(
    function () {

      codeSheet.classList.add(
        "open"
      );

    }
  );


  codeSheet.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeCategory() {

  codeSheet.classList.remove(
    "open"
  );


  codeSheet.setAttribute(
    "aria-hidden",
    "true"
  );


  setTimeout(
    function () {

      codeBackdrop.hidden =
        true;

    },
    240
  );

}


/* =========================
   Search events
   ========================= */

codesSearch.addEventListener(
  "input",
  function () {

    searchKeyword =
      normalizeForSearch(
        codesSearch.value
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

    codesSearch.value =
      "";

    searchKeyword =
      "";

    searchClear.hidden =
      true;


    codesSearch.focus();


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


codeBackdrop.addEventListener(
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