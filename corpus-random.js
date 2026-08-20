/* =========================
   Liminal · Corpus Random Engine

   真正的语料池随机引擎。

   原则：
   1. 先从当前可用的一级入口中等概率抽取
   2. 再在该入口内部随机抽取具体内容
   3. 分类本身不产生额外权重
   4. 没有正式内容的电子字卡 01 暂时跳过
   ========================= */


/* =========================
   默认运行状态
   ========================= */

function createCorpusRandomDefaultState() {

  const sections = {};


  Object.entries(
    CARD_SECTIONS
  ).forEach(
    function (
      [sectionId, section]
    ) {

      sections[
        sectionId
      ] = {};


      section.items.forEach(
        function (item) {

          sections[
            sectionId
          ][
            item.id
          ] =
            false;

        }
      );

    }
  );


  return {

    version:
      2,

    sections:
      sections,

    phrases:
      true,

    codes:
      false

  };

}



/* =========================
   读取当前人物语料池状态
   ========================= */

function readCorpusRandomState(
  personId
) {

  const state =
    createCorpusRandomDefaultState();


  const storageKey =
    `liminal_corpus_pool_${personId}_v1`;


  let saved = null;


  try {

    saved =
      JSON.parse(
        localStorage.getItem(
          storageKey
        )
      );

  } catch (error) {

    console.warn(
      "读取语料池状态失败",
      error
    );

  }


  if (
    !saved ||
    typeof saved !==
      "object"
  ) {

    return state;

  }


  /*
    兼容：
    - 新版永久 id
    - 旧版中文名称 key
  */

  Object.entries(
    CARD_SECTIONS
  ).forEach(
    function (
      [sectionId, section]
    ) {

      section.items.forEach(
        function (item) {

          const valueById =
            saved
              ?.sections
              ?.[sectionId]
              ?.[item.id];


          const valueByOldName =
            saved
              ?.sections
              ?.[sectionId]
              ?.[item.name];


          if (
            typeof valueById ===
            "boolean"
          ) {

            state.sections[
              sectionId
            ][
              item.id
            ] =
              valueById;


            return;

          }


          if (
            typeof valueByOldName ===
            "boolean"
          ) {

            state.sections[
              sectionId
            ][
              item.id
            ] =
              valueByOldName;

          }

        }
      );

    }
  );


  if (
    typeof saved.phrases ===
    "boolean"
  ) {

    state.phrases =
      saved.phrases;

  }


  if (
    typeof saved.codes ===
    "boolean"
  ) {

    state.codes =
      saved.codes;

  }


  return state;

}



/* =========================
   随机数组成员
   ========================= */

function randomCorpusItem(
  array
) {

  if (
    !Array.isArray(array) ||
    array.length === 0
  ) {

    return null;

  }


  const index =
    Math.floor(
      Math.random() *
      array.length
    );


  return (
    array[index] ||
    null
  );

}



/* =========================
   提取语料文字
   ========================= */

function getCorpusEntryText(
  entry
) {

  if (
    typeof entry ===
    "string"
  ) {

    return entry.trim();

  }


  if (
    !entry ||
    typeof entry !==
      "object"
  ) {

    return "";

  }


  const text =
    entry.text ??
    entry.phrase ??
    entry.content ??
    "";


  return String(
    text
  ).trim();

}



/* =========================
   快捷用语
   ========================= */

function collectCorpusPhraseEntries(
  personId
) {

  if (
    typeof PHRASE_LIBRARY ===
    "undefined"
  ) {

    return [];

  }


  const person =
    PHRASE_LIBRARY[
      personId
    ];


  if (!person) {

    return [];

  }


  const results = [];


  (
    person.categories ||
    []
  ).forEach(
    function (category) {

      (
        category.phrases ||
        []
      ).forEach(
        function (
          entry,
          index
        ) {

          const text =
            getCorpusEntryText(
              entry
            );


          if (!text) {

            return;

          }


          results.push({

            text:
              text,

            categoryId:
              category.id ||
              "",

            categoryName:
              category.name ||
              "",

            index:
              index

          });

        }
      );

    }
  );


  return results;

}



/* =========================
   暗号
   ========================= */

function collectCorpusCodeEntries(
  personId
) {

  if (
    typeof CODE_LIBRARY ===
    "undefined"
  ) {

    return [];

  }


  const person =
    CODE_LIBRARY[
      personId
    ];


  if (!person) {

    return [];

  }


  const results = [];


  (
    person.categories ||
    []
  ).forEach(
    function (category) {

      (
        category.codes ||
        []
      ).forEach(
        function (
          entry,
          index
        ) {

          const text =
            getCorpusEntryText(
              entry
            );


          if (!text) {

            return;

          }


          results.push({

            text:
              text,

            categoryId:
              category.id ||
              "",

            categoryName:
              category.name ||
              "",

            index:
              index

          });

        }
      );

    }
  );


  return results;

}



/* =========================
   电子字卡正式叶子
   ========================= */

function collectElectronicCardEntries(
  personId,
  sectionId,
  itemId
) {

  /*
    当前完整电子字卡树
    尚未正式导入。

    所以这里明确返回空数组。

    不读取 cards.js 里的 TREE_PREVIEWS，
    因为那些只是 UI demo，
    不能混进正式随机结果。

    等完整字卡树导入以后，
    我们只需要升级这个函数。
  */

  return [];

}



/* =========================
   构建当前真正可抽的一级入口
   ========================= */

function buildDrawableCorpusPools(
  personId
) {

  const state =
    readCorpusRandomState(
      personId
    );


  const pools = [];


/* ---------- 电子字卡 01 ---------- */

  Object.entries(
    CARD_SECTIONS
  ).forEach(
    function (
      [sectionId, section]
    ) {

      section.items.forEach(
        function (item) {

          const enabled =
            state
              .sections[
                sectionId
              ][
                item.id
              ] ===
            true;


          if (!enabled) {

            return;

          }


          const entries =
            collectElectronicCardEntries(
              personId,
              sectionId,
              item.id
            );


          /*
            没有正式叶子内容：
            本次随机池中直接跳过。
          */

          if (
            entries.length ===
            0
          ) {

            return;

          }


          pools.push({

            type:
              "card",

            id:
              item.id,

            name:
              item.name,

            sectionId:
              sectionId,

            sectionName:
              section.name,

            entries:
              entries

          });

        }
      );

    }
  );


/* ---------- 快捷用语 ---------- */

  if (
    state.phrases
  ) {

    const phraseEntries =
      collectCorpusPhraseEntries(
        personId
      );


    if (
      phraseEntries.length >
      0
    ) {

      pools.push({

        type:
          "phrases",

        id:
          "phrases",

        name:
          "快捷用语",

        entries:
          phraseEntries

      });

    }

  }


/* ---------- 暗号 ---------- */

  if (
    state.codes
  ) {

    const codeEntries =
      collectCorpusCodeEntries(
        personId
      );


    if (
      codeEntries.length >
      0
    ) {

      pools.push({

        type:
          "codes",

        id:
          "codes",

        name:
          "暗号",

        entries:
          codeEntries

      });

    }

  }


  return pools;

}



/* =========================
   当前是否存在可抽内容
   ========================= */

function hasDrawableCorpusPool(
  personId
) {

  return (
    buildDrawableCorpusPools(
      personId
    ).length >
    0
  );

}



/* =========================
   真正抽取一次
   ========================= */

function drawCorpusMessage(
  personId
) {

  const pools =
    buildDrawableCorpusPools(
      personId
    );


  const selectedPool =
    randomCorpusItem(
      pools
    );


  if (!selectedPool) {

    return null;

  }


  const selectedEntry =
    randomCorpusItem(
      selectedPool.entries
    );


  if (!selectedEntry) {

    return null;

  }


  return {

    text:
      selectedEntry.text,

    sourceType:
      selectedPool.type,

    sourceId:
      selectedPool.id,

    sourceName:
      selectedPool.name,

    sectionId:
      selectedPool.sectionId ||
      null,

    sectionName:
      selectedPool.sectionName ||
      null,

    categoryId:
      selectedEntry.categoryId ||
      null,

    categoryName:
      selectedEntry.categoryName ||
      null

  };

}



/* =========================
   聊天只需要文字时
   ========================= */

function drawCorpusText(
  personId
) {

  const result =
    drawCorpusMessage(
      personId
    );


  return (
    result
      ?.text ||
    null
  );

}