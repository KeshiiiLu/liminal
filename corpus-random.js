/* =========================
   Liminal · Corpus Random Engine

   真正的语料池随机引擎。

   原则：

   1. 电子字卡只读取
      cards-corpus-data.js

   2. 当前开启且“确实有可抽叶子”的
      每个 01 都是一个一级随机入口

   3. 快捷用语、暗号
      也分别作为一个一级随机入口

   4. 一级入口之间等概率

   5. 进入电子字卡 tree 后，
      每一层只在“直属可抽节点”之间等概率

   6. 抽到字符串：
      结束

   7. 抽到分组：
      进入 children 再随机

   8. tree 没有固定深度限制

   9. 不把整棵树的叶子摊平
   ========================= */


/* =========================
   电子字卡唯一来源
   ========================= */

function getCorpusCardSections() {

  if (
    window.CARD_CORPUS &&
    typeof window.CARD_CORPUS ===
      "object"
  ) {

    return window.CARD_CORPUS;

  }


  /*
    真源没有加载时，
    宁愿返回空库，
    也绝不偷偷退回旧 CARD_SECTIONS。
  */

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



/* =========================
   默认运行状态
   ========================= */

function createCorpusRandomDefaultState() {

  const sections =
    {};


  const cardSections =
    getCorpusCardSections();


  Object.entries(
    cardSections
  ).forEach(
    function (
      [sectionId, section]
    ) {

      sections[
        sectionId
      ] =
        {};


      (
        section.items ||
        []
      ).forEach(
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
      3,

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


  let saved =
    null;


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


  const cardSections =
    getCorpusCardSections();


  /*
    兼容：

    - 新版永久 id
    - 旧版中文名称 key
  */

  Object.entries(
    cardSections
  ).forEach(
    function (
      [sectionId, section]
    ) {

      (
        section.items ||
        []
      ).forEach(
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
    !Array.isArray(
      array
    ) ||
    array.length ===
      0
  ) {

    return null;

  }


  const index =
    Math.floor(
      Math.random() *
      array.length
    );


  return (
    array[
      index
    ] ??
    null
  );

}



/* =========================
   提取普通语料文字
   ========================= */

function getCorpusEntryText(
  entry
) {

  if (
    typeof entry ===
      "string"
  ) {

    return (
      entry.trim()
    );

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


  const results =
    [];


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


  const results =
    [];


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
   tree 节点判断
   ========================= */

function isCorpusTreeGroup(
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
   一个节点里面是否存在
   最终可抽取字符串
   ========================= */

function isDrawableCorpusTreeNode(
  node
) {

  /*
    字符串叶子：
    非空即可。
  */

  if (
    typeof node ===
      "string"
  ) {

    return (
      node.trim().length >
      0
    );

  }


  /*
    分组：
    至少有一个后代
    最终能够走到字符串叶子。
  */

  if (
    isCorpusTreeGroup(
      node
    )
  ) {

    return (
      node.children.some(
        isDrawableCorpusTreeNode
      )
    );

  }


  return false;

}



/* =========================
   整棵 tree 是否可抽
   ========================= */

function corpusTreeHasDrawableLeaf(
  tree
) {

  return (
    Array.isArray(
      tree
    ) &&
    tree.some(
      isDrawableCorpusTreeNode
    )
  );

}



/* =========================
   取得当前层真正可参与骰子的
   直属节点
   ========================= */

function getDrawableCorpusTreeChildren(
  tree
) {

  if (
    !Array.isArray(
      tree
    )
  ) {

    return [];

  }


  return (
    tree.filter(
      isDrawableCorpusTreeNode
    )
  );

}



/* =========================
   递归抽电子字卡 tree

   重要：

   不摊平叶子。

   每次只抽当前层直属节点。

   例如：

   [
     "A",
     "B",
     {
       name: "C",
       children: [
         "C1",
         "C2"
       ]
     }
   ]

   第一层：

   A = 1/3
   B = 1/3
   C = 1/3

   如果抽到 C：

   C1 = 1/2
   C2 = 1/2

   所以最终：

   C1 = 1/6
   C2 = 1/6
   ========================= */

function drawElectronicCardTree(
  tree,
  groupPath = []
) {

  const drawableNodes =
    getDrawableCorpusTreeChildren(
      tree
    );


  const selectedNode =
    randomCorpusItem(
      drawableNodes
    );


  if (
    selectedNode ===
      null
  ) {

    return null;

  }


  /*
    字符串：
    已经抵达最终字卡。
  */

  if (
    typeof selectedNode ===
      "string"
  ) {

    const text =
      selectedNode.trim();


    if (!text) {

      return null;

    }


    return {

      text:
        text,

      path:
        [
          ...groupPath
        ]

    };

  }


  /*
    分组：
    进入下一层继续掷骰子。
  */

  if (
    isCorpusTreeGroup(
      selectedNode
    )
  ) {

    const nextPath =
      selectedNode.name
        ? [
            ...groupPath,
            selectedNode.name
          ]
        : [
            ...groupPath
          ];


    return (
      drawElectronicCardTree(
        selectedNode.children,
        nextPath
      )
    );

  }


  return null;

}



/* =========================
   找一个具体电子字卡 01
   ========================= */

function getElectronicCardItem(
  sectionId,
  itemId
) {

  const cardSections =
    getCorpusCardSections();


  const section =
    cardSections[
      sectionId
    ];


  if (!section) {

    return null;

  }


  return (
    (
      section.items ||
      []
    ).find(
      function (item) {

        return (
          item.id ===
          itemId
        );

      }
    ) ||
    null
  );

}



/* =========================
   电子字卡正式内容检查

   保留这个原函数名，
   避免以后其他地方引用时断掉。

   注意：

   这里不把所有叶子摊平。

   返回值只表示：
   这个 01 是否存在一棵正式可抽 tree。
   ========================= */

function collectElectronicCardEntries(
  personId,
  sectionId,
  itemId
) {

  const item =
    getElectronicCardItem(
      sectionId,
      itemId
    );


  if (
    !item ||
    !corpusTreeHasDrawableLeaf(
      item.tree
    )
  ) {

    return [];

  }


  return [
    {
      tree:
        item.tree
    }
  ];

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


  const pools =
    [];


  const cardSections =
    getCorpusCardSections();


/* ---------- 电子字卡 01 ---------- */

  Object.entries(
    cardSections
  ).forEach(
    function (
      [sectionId, section]
    ) {

      (
        section.items ||
        []
      ).forEach(
        function (item) {

          const enabled =
            state
              ?.sections
              ?.[sectionId]
              ?.[item.id] ===
            true;


          if (!enabled) {

            return;

          }


          /*
            开了开关，
            但 tree 里面目前没有任何
            真正字符串叶子：

            不进入本次随机池。
          */

          if (
            !corpusTreeHasDrawableLeaf(
              item.tree
            )
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

            tree:
              item.tree

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


  /*
    第一次骰子：

    所有当前可用一级入口
    等概率。
  */

  const selectedPool =
    randomCorpusItem(
      pools
    );


  if (!selectedPool) {

    return null;

  }


/* =========================
   电子字卡
   ========================= */

  if (
    selectedPool.type ===
      "card"
  ) {

    const result =
      drawElectronicCardTree(
        selectedPool.tree
      );


    if (!result) {

      return null;

    }


    return {

      text:
        result.text,

      sourceType:
        "card",

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
        selectedPool.id,

      categoryName:
        selectedPool.name,

      treePath:
        result.path

    };

  }


/* =========================
   快捷用语 / 暗号
   ========================= */

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
      null,

    sectionName:
      null,

    categoryId:
      selectedEntry.categoryId ||
      null,

    categoryName:
      selectedEntry.categoryName ||
      null,

    treePath:
      []

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