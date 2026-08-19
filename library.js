/* =========================
   Liminal · Corpus Library
   语料库首页
   ========================= */


/* =========================
   页面入口
   ========================= */

const CORPUS_PAGES = {

  cards:
    "cards.html",

  phrases:
    "phrases.html",

  codes:
    "codes.html",

  poke:
    "poke.html"

};


document
  .querySelectorAll(
    "[data-corpus]"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const targetPage =
            CORPUS_PAGES[
              button.dataset.corpus
            ];


          if (!targetPage) {

            return;

          }


          window.location.href =
            targetPage;

        }
      );

    }
  );



/* =========================
   通用统计
   ========================= */

/*
  在整个数据对象中寻找指定名称的数组，
  把这些数组里的条目数量全部相加。

  快捷用语：
  phrases

  暗号：
  codes

  拍一拍：
  actions
*/

function countLibraryEntries(
  data,
  targetKey
) {

  let total =
    0;


  function walk(
    value,
    currentKey = ""
  ) {

    /* ---------- 数组 ---------- */

    if (
      Array.isArray(
        value
      )
    ) {

      /*
        如果当前数组正是我们要统计的类型，
        直接统计里面有多少条。
      */

      if (
        currentKey ===
        targetKey
      ) {

        total +=
          value.length;

        return;

      }


      /*
        普通数组继续向下寻找。
      */

      value.forEach(
        function (item) {

          walk(
            item
          );

        }
      );


      return;

    }


    /* ---------- 对象 ---------- */

    if (
      value &&
      typeof value ===
        "object"
    ) {

      Object.entries(
        value
      ).forEach(
        function (
          [key, child]
        ) {

          walk(
            child,
            key
          );

        }
      );

    }

  }


  walk(
    data
  );


  return total;

}



/* =========================
   榛榛 · 快捷用语统计
   ========================= */

const phraseCount =
  typeof PHRASE_LIBRARY !==
    "undefined" &&
  PHRASE_LIBRARY.luzhen

    ? countLibraryEntries(
        PHRASE_LIBRARY.luzhen,
        "phrases"
      )

    : null;


/* =========================
   榛榛 · 暗号统计
   ========================= */

const codeCount =
  typeof CODE_LIBRARY !==
    "undefined" &&
  CODE_LIBRARY.luzhen

    ? countLibraryEntries(
        CODE_LIBRARY.luzhen,
        "codes"
      )

    : null;


/* =========================
   榛榛 · 拍一拍统计
   ========================= */

const pokeCount =
  typeof POKE_LIBRARY !==
    "undefined" &&
  POKE_LIBRARY.luzhen

    ? countLibraryEntries(
        POKE_LIBRARY.luzhen,
        "actions"
      )

    : null;



/* =========================
   首页数字写入
   ========================= */

function setLibraryCount(
  elementId,
  count
) {

  const element =
    document.getElementById(
      elementId
    );


  if (!element) {

    return;

  }


  if (
    Number.isFinite(
      count
    )
  ) {

    element.textContent =
      count;

    return;

  }


  element.textContent =
    "—";

}



/* 快捷用语 */

setLibraryCount(
  "phrasesTotal",
  phraseCount
);


/* 暗号 */

setLibraryCount(
  "codesTotal",
  codeCount
);


/* 拍一拍 */

setLibraryCount(
  "pokeTotal",
  pokeCount
);


/*
  电子字卡完整分类树目前还没有正式导入。

  所以暂时不统计 demo TREE_PREVIEWS，
  避免把测试数据误当成真实字卡库存。
*/

setLibraryCount(
  "cardsTotal",
  null
);