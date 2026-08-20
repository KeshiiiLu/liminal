/* =========================
   Liminal · Electronic Cards Editor
   ========================= */


/* =========================
   DOM
   ========================= */

const connectCorpusButton =
  document.getElementById(
    "connectCorpusButton"
  );


const saveCorpusButton =
  document.getElementById(
    "saveCorpusButton"
  );


const corpusFileStatus =
  document.getElementById(
    "corpusFileStatus"
  );


const corpusSaveState =
  document.getElementById(
    "corpusSaveState"
  );


const sectionTabs =
  Array.from(
    document.querySelectorAll(
      ".section-tab"
    )
  );


const categoryList =
  document.getElementById(
    "categoryList"
  );


const currentSectionTitle =
  document.getElementById(
    "currentSectionTitle"
  );


const addCategoryButton =
  document.getElementById(
    "addCategoryButton"
  );

const categoryOverviewPanel =
  document.getElementById(
    "categoryOverviewPanel"
  );


const categoryContentPanel =
  document.getElementById(
    "categoryContentPanel"
  );


const categoryContentBack =
  document.getElementById(
    "categoryContentBack"
  );


const categoryContentTitle =
  document.getElementById(
    "categoryContentTitle"
  );


const categoryContentMeta =
  document.getElementById(
    "categoryContentMeta"
  );


const addTreeCardButton =
  document.getElementById(
    "addTreeCardButton"
  );

const addTreeGroupButton =
  document.getElementById(
    "addTreeGroupButton"
  );


const treeBreadcrumbs =
  document.getElementById(
    "treeBreadcrumbs"
  );


const treeGroupDialog =
  document.getElementById(
    "treeGroupDialog"
  );


const treeGroupDialogTitle =
  document.getElementById(
    "treeGroupDialogTitle"
  );


const treeGroupInput =
  document.getElementById(
    "treeGroupInput"
  );


const treeGroupCancelButton =
  document.getElementById(
    "treeGroupCancelButton"
  );


const treeGroupConfirmButton =
  document.getElementById(
    "treeGroupConfirmButton"
  );


const treeCardList =
  document.getElementById(
    "treeCardList"
  );


const treeCardDialog =
  document.getElementById(
    "treeCardDialog"
  );


const treeCardDialogTitle =
  document.getElementById(
    "treeCardDialogTitle"
  );


const treeCardInput =
  document.getElementById(
    "treeCardInput"
  );


const treeCardCancelButton =
  document.getElementById(
    "treeCardCancelButton"
  );


const treeCardConfirmButton =
  document.getElementById(
    "treeCardConfirmButton"
  );


const normalCount =
  document.getElementById(
    "normalCount"
  );


const intimateCount =
  document.getElementById(
    "intimateCount"
  );


const adultCount =
  document.getElementById(
    "adultCount"
  );


const renameDialog =
  document.getElementById(
    "renameDialog"
  );


const renameInput =
  document.getElementById(
    "renameInput"
  );

const renameIdInput =
  document.getElementById(
    "renameIdInput"
  );


const renameCancelButton =
  document.getElementById(
    "renameCancelButton"
  );


const renameConfirmButton =
  document.getElementById(
    "renameConfirmButton"
  );


const deleteDialog =
  document.getElementById(
    "deleteDialog"
  );


const deleteDialogText =
  document.getElementById(
    "deleteDialogText"
  );


const deleteCancelButton =
  document.getElementById(
    "deleteCancelButton"
  );


const deleteConfirmButton =
  document.getElementById(
    "deleteConfirmButton"
  );



/* =========================
   编辑状态
   ========================= */

let currentSectionId =
  "normal";


let corpusFileHandle =
  null;

  /*
  安全锁：

  只有当前页面已经真正从
  cards-corpus-data.js
  读取过数据以后，

  才允许保存回文件。
*/

let hasLoadedRealCorpusFile =
  false;

/*
  记住上一次连接的字卡数据文件。

  IndexedDB 只保存“文件句柄”，
  不保存电子字卡内容本身。
*/

const CORPUS_HANDLE_DB_NAME =
  "liminal_cards_editor_v1";


const CORPUS_HANDLE_STORE_NAME =
  "file_handles";


const CORPUS_HANDLE_KEY =
  "cards_corpus_data";


let corpusConnectionNeedsPermission =
  false;

let hasUnsavedChanges =
  false;

/*
  当前正在编辑哪一个 01 的 tree。
*/

let editingTreeSectionId =
  null;


let editingTreeCategoryId =
  null;


/*
  null = 新建字卡
  数字 = 正在编辑 tree 中的这个位置
*/

let editingTreeCardIndex =
  null;

/*
  当前位于 tree 的哪一层。

  例如：
  []
  = 01 根层

  [1]
  = 根层第 2 个分组内部

  [1, 2]
  = 再进入那个分组里的第 3 个分组
*/

let currentTreePath =
  [];


let editingTreeGroupIndex =
  null;

let draggedTreeIndex =
  null;

/*
记录拖拽开始时所在的 tree 路径。

以后即使继续扩展跨层移动，
也知道这个节点原本来自哪里。
*/

let draggedTreeSourcePath =
  null;

let editingCategoryId =
  null;

let creatingNewCategory =
  false;

let deletingCategoryId =
  null;


let draggedCategoryId =
  null;



/* =========================
   从旧 cards-data.js
   初始化当前 88 个 01
   ========================= */

/* =========================
   创建安全空壳

   仅用于：
   真正字卡库尚未读取时的页面占位。

   绝不从旧 cards-data.js
   自动生成 01。
   ========================= */

function createEmptyCorpusShell() {

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
   当前内存里的字卡库
   ========================= */

let corpusData =
  (
    window.CARD_CORPUS &&
    typeof window.CARD_CORPUS ===
      "object"
  )
    ? structuredClone(
        window.CARD_CORPUS
      )
    : createEmptyCorpusShell();



/* =========================
   数据保险
   ========================= */

function normalizeCorpusData(
  data
) {

  const sectionDefaults = {

    normal:
      "日常",

    intimate:
      "亲密",

    adult:
      "情欲"

  };


  Object.entries(
    sectionDefaults
  ).forEach(
    function (
      [sectionId, sectionName]
    ) {

      if (
        !data[
        sectionId
        ] ||
        typeof data[
        sectionId
        ] !==
        "object"
      ) {

        data[
          sectionId
        ] = {};

      }


      data[
        sectionId
      ].id =
        sectionId;


      if (
        !data[
          sectionId
        ].name
      ) {

        data[
          sectionId
        ].name =
          sectionName;

      }


      if (
        !Array.isArray(
          data[
            sectionId
          ].items
        )
      ) {

        data[
          sectionId
        ].items =
          [];

      }


      data[
        sectionId
      ].items.forEach(
        function (item) {

          if (
            !Array.isArray(
              item.tree
            )
          ) {

            item.tree =
              [];

          }

        }
      );

    }
  );


  return data;

}


corpusData =
  normalizeCorpusData(
    corpusData
  );



/* =========================
   工具
   ========================= */

function getCurrentSection() {

  return (
    corpusData[
    currentSectionId
    ]
  );

}

/* =========================
   当前正在编辑的 01
   ========================= */

function getEditingTreeCategory() {

  if (
    !editingTreeSectionId ||
    !editingTreeCategoryId
  ) {

    return null;

  }


  const section =
    corpusData[
    editingTreeSectionId
    ];


  if (!section) {

    return null;

  }


  return (
    section.items.find(
      function (item) {

        return (
          item.id ===
          editingTreeCategoryId
        );

      }
    ) ||
    null
  );

}

/* =========================
   根据任意路径取得 tree 数组
   ========================= */

function getTreeArrayByPath(
  path
) {

  const category =
    getEditingTreeCategory();


  if (!category) {

    return null;

  }


  let current =
    category.tree;


  for (
    let depth = 0;
    depth < path.length;
    depth += 1
  ) {

    const index =
      path[
        depth
      ];


    const node =
      current[
        index
      ];


    if (
      !node ||
      typeof node !==
        "object" ||
      !Array.isArray(
        node.children
      )
    ) {

      return null;

    }


    current =
      node.children;

  }


  return current;

}


/* =========================
   当前正在看的这一层
   ========================= */

function getCurrentTreeArray() {

  return (
    getTreeArrayByPath(
      currentTreePath
    )
  );

}



/* =========================
   取得路径上的分组
   ========================= */

function getTreePathGroups() {

  const category =
    getEditingTreeCategory();


  if (!category) {

    return [];

  }


  const groups =
    [];


  let current =
    category.tree;


  currentTreePath.forEach(
    function (
      index
    ) {

      const node =
        current[
        index
        ];


      if (
        !node ||
        typeof node !==
        "object" ||
        !Array.isArray(
          node.children
        )
      ) {

        return;

      }


      groups.push(
        node
      );


      current =
        node.children;

    }
  );


  return groups;

}



/* =========================
   分组节点判断
   ========================= */

function isTreeGroup(
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


function findCategoryById(
  categoryId
) {

  return (
    getCurrentSection()
      .items
      .find(
        function (item) {

          return (
            item.id ===
            categoryId
          );

        }
      ) ||
    null
  );

}


function generateCategoryId() {

  const randomPart =
    Math.random()
      .toString(36)
      .slice(2, 8);


  return (
    `card_${Date.now().toString(36)}_${randomPart}`
  );

}



/* =========================
   修改状态
   ========================= */

function markUnsaved() {

  hasUnsavedChanges =
    true;


  corpusSaveState.textContent =
    "有未保存修改";


  corpusSaveState.classList.remove(
    "saved"
  );


  corpusSaveState.classList.add(
    "unsaved"
  );


  saveCorpusButton.disabled =
    !corpusFileHandle;

}


function markSaved() {

  hasUnsavedChanges =
    false;


  corpusSaveState.textContent =
    "已保存";


  corpusSaveState.classList.remove(
    "unsaved"
  );


  corpusSaveState.classList.add(
    "saved"
  );


  saveCorpusButton.disabled =
    !corpusFileHandle;

}



/* =========================
   数量
   ========================= */

function renderCounts() {

  normalCount.textContent =
    corpusData.normal.items.length;


  intimateCount.textContent =
    corpusData.intimate.items.length;


  adultCount.textContent =
    corpusData.adult.items.length;

}



/* =========================
   渲染 01
   ========================= */

function renderCategories() {

  const section =
    getCurrentSection();


  currentSectionTitle.textContent =
    section.name;


  categoryList.innerHTML =
    "";


  section.items.forEach(
    function (item) {

      const element =
        document.createElement(
          "article"
        );


      element.className =
        "category-item";


      element.dataset.id =
        item.id;


      element.draggable =
        true;


      element.innerHTML = `

        <div
          class="category-drag"
          title="拖拽排序"
        >
          ☰
        </div>


        <div class="category-main">

          <span class="category-name">
          </span>

          <span class="category-id">
          </span>

        </div>


        <div class="category-actions">

          <button
            class="category-action rename"
            type="button"
          >
            改名
          </button>

          <button
            class="category-action delete"
            type="button"
          >
            删除
          </button>

        </div>

      `;


      /*
        显示 01 名称
      */

      element
        .querySelector(
          ".category-name"
        )
        .textContent =
          item.name;


      /*
        显示稳定 ID
      */

      element
        .querySelector(
          ".category-id"
        )
        .textContent =
          item.id;


      /*
        点击名称区域，
        进入这个 01 的具体字卡内容。
      */

      element
        .querySelector(
          ".category-main"
        )
        .addEventListener(
          "click",
          function () {

            openCategoryContent(
              item.id
            );

          }
        );


      /*
        改名
      */

      element
        .querySelector(
          ".rename"
        )
        .addEventListener(
          "click",
          function (event) {

            event.stopPropagation();


            openRenameDialog(
              item.id
            );

          }
        );


      /*
        删除
      */

      element
        .querySelector(
          ".delete"
        )
        .addEventListener(
          "click",
          function (event) {

            event.stopPropagation();


            openDeleteDialog(
              item.id
            );

          }
        );


      /*
        01 拖拽排序
      */

      bindCategoryDragEvents(
        element
      );


      categoryList.appendChild(
        element
      );

    }
  );


  renderCounts();

}



/* =========================
   Tabs
   ========================= */

sectionTabs.forEach(
  function (tab) {

    tab.addEventListener(
      "click",
      function () {

        /*
          如果当前正在某个 01 内部，
          切换日常 / 亲密 / 情欲以前
          先正常退出内容页。
        */

        if (
          !categoryContentPanel.hidden
        ) {

          closeCategoryContent();

        }


        currentSectionId =
          tab.dataset.section;


        sectionTabs.forEach(
          function (item) {

            item.classList.toggle(
              "active",
              item === tab
            );

          }
        );


        renderCategories();

      }
    );

  }
);


/* =========================
   检查 01 ID 是否重复
   ========================= */

function isCategoryIdTaken(
  categoryId
) {

  return (
    Object.values(
      corpusData
    ).some(
      function (section) {

        return (
          section.items.some(
            function (item) {

              return (
                item.id ===
                categoryId
              );

            }
          )
        );

      }
    )
  );

}

/* =========================
   打开一个 01 的具体字卡
   ========================= */

function openCategoryContent(
  categoryId
) {

  editingTreeSectionId =
    currentSectionId;


  editingTreeCategoryId =
    categoryId;


  currentTreePath =
    [];


  categoryOverviewPanel.hidden =
    true;


  categoryContentPanel.hidden =
    false;


  renderCategoryContent();


  window.scrollTo({
    top:
      0,

    behavior:
      "auto"
  });

}



/* =========================
   返回 01 列表
   ========================= */

function closeCategoryContent() {

  categoryContentPanel.hidden =
    true;


  categoryOverviewPanel.hidden =
    false;


  editingTreeSectionId =
    null;


  editingTreeCategoryId =
    null;


  editingTreeCardIndex =
    null;

  currentTreePath =
    [];


  editingTreeGroupIndex =
    null;

  renderCategories();

}


categoryContentBack.addEventListener(
  "click",
  closeCategoryContent
);



/* =========================
   渲染具体 tree
   ========================= */

function renderCategoryContent() {

  const category =
    getEditingTreeCategory();


  if (!category) {

    closeCategoryContent();

    return;

  }


  if (
    !Array.isArray(
      category.tree
    )
  ) {

    category.tree =
      [];

  }


  const tree =
    getCurrentTreeArray();


  if (!tree) {

    /*
      路径坏掉时回到根层，
      不让编辑器直接死掉。
    */

    currentTreePath =
      [];


    renderCategoryContent();


    return;

  }


  categoryContentTitle.textContent =
    category.name;


  categoryContentMeta.textContent =
    `${tree.length} 个直属节点`;


  renderTreeBreadcrumbs();


  treeCardList.innerHTML =
    "";


  if (
    tree.length ===
    0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "tree-empty";


    empty.textContent =
      "这一层还没有字卡或分组";


    treeCardList.appendChild(
      empty
    );


    return;

  }


  tree.forEach(
    function (
      node,
      index
    ) {

      const isLeaf =
        typeof node ===
        "string";


      const isGroup =
        isTreeGroup(
          node
        );


      /*
        既不是字符串，
        也不是标准 group，
        仍然显示出来，
        避免你手敲数据时
        被编辑器偷偷吞掉。
      */

      const element =
        document.createElement(
          "article"
        );


      element.dataset.index =
        String(index);


      element.draggable =
        true;


      if (isLeaf) {

        element.className =
          "tree-item";


        element.innerHTML = `

          <div
            class="tree-drag"
            title="拖拽排序"
          >
            ☰
          </div>


          <div class="tree-main">

            <div class="tree-text">
            </div>

            <span class="tree-type">
              CARD
            </span>

          </div>


          <div class="tree-actions">

            <button
              class="tree-action edit"
              type="button"
            >
              编辑
            </button>

            <button
              class="tree-action delete"
              type="button"
            >
              删除
            </button>

          </div>

        `;


        element
          .querySelector(
            ".tree-text"
          )
          .textContent =
          node;


        element
          .querySelector(
            ".edit"
          )
          .addEventListener(
            "click",
            function () {

              openTreeCardDialog(
                index
              );

            }
          );


        element
          .querySelector(
            ".delete"
          )
          .addEventListener(
            "click",
            function () {

              deleteTreeCard(
                index
              );

            }
          );

      } else if (
        isGroup
      ) {

        element.className =
          "tree-item group";


        element.innerHTML = `

          <div
            class="tree-drag"
            title="拖拽排序"
          >
            ☰
          </div>


          <div class="tree-main">

            <div class="tree-text">
            </div>

            <span class="tree-type">
            </span>

          </div>


          <div class="tree-actions">

            <button
              class="tree-action edit"
              type="button"
            >
              改名
            </button>

            <button
              class="tree-action delete"
              type="button"
            >
              删除
            </button>

            <span class="tree-group-arrow">
              ›
            </span>

          </div>

        `;


        element
          .querySelector(
            ".tree-text"
          )
          .textContent =
          node.name ||
          "未命名分组";


        element
          .querySelector(
            ".tree-type"
          )
          .textContent =
          `GROUP · ${node.children.length} 个直属节点`;

/*
  分组主体同时作为拖入区域。

  把同层的字卡或分组拖到
  分组文字区域上，
  就会进入它的 children。
*/

const groupDropArea =
  element.querySelector(
    ".tree-main"
  );


groupDropArea.addEventListener(
  "dragover",
  function (event) {

    event.preventDefault();

    event.stopPropagation();


    if (
      draggedTreeIndex ===
        null ||
      !draggedTreeSourcePath
    ) {

      return;

    }


    /*
      不能把节点拖进自己。
    */

    if (
      pathsAreEqual(
        draggedTreeSourcePath,
        currentTreePath
      ) &&
      draggedTreeIndex ===
        index
    ) {

      return;

    }


    element.classList.remove(
      "drag-over"
    );


    element.classList.add(
      "drag-into"
    );

  }
);


groupDropArea.addEventListener(
  "dragleave",
  function (event) {

    event.stopPropagation();


    element.classList.remove(
      "drag-into"
    );

  }
);


groupDropArea.addEventListener(
  "drop",
  function (event) {

    event.preventDefault();

    event.stopPropagation();


    element.classList.remove(
      "drag-into",
      "drag-over"
    );


    if (
      draggedTreeIndex ===
        null ||
      !draggedTreeSourcePath
    ) {

      return;

    }


    moveTreeNodeIntoGroup(

      draggedTreeSourcePath,

      draggedTreeIndex,

      [
        ...currentTreePath
      ],

      index

    );

  }
);

        /*
          点击主体进入下一层。
        */

        element
          .querySelector(
            ".tree-main"
          )
          .addEventListener(
            "click",
            function () {

              enterTreeGroup(
                index
              );

            }
          );


        element
          .querySelector(
            ".tree-group-arrow"
          )
          .addEventListener(
            "click",
            function () {

              enterTreeGroup(
                index
              );

            }
          );


        element
          .querySelector(
            ".edit"
          )
          .addEventListener(
            "click",
            function () {

              openTreeGroupDialog(
                index
              );

            }
          );


        element
          .querySelector(
            ".delete"
          )
          .addEventListener(
            "click",
            function () {

              deleteTreeGroup(
                index
              );

            }
          );

      } else {

        element.className =
          "tree-item group-preview";


        element.innerHTML = `

          <div class="tree-drag">
            !
          </div>


          <div class="tree-main">

            <div class="tree-text">
              无法识别的节点格式
            </div>

            <span class="tree-type">
              UNKNOWN
            </span>

          </div>

        `;

      }


      bindTreeDragEvents(
        element
      );


      treeCardList.appendChild(
        element
      );

    }
  );

}



/* =========================
   新增 / 编辑具体字卡
   ========================= */

/* =========================
面包屑
========================= */

function renderTreeBreadcrumbs() {

  const category =
    getEditingTreeCategory();


  if (!category) {

    return;

  }


  const groups =
    getTreePathGroups();


  treeBreadcrumbs.innerHTML =
    "";


/* =========================
   给面包屑绑定拖放
   ========================= */

  function bindBreadcrumbDrop(
    button,
    targetPath
  ) {

    /*
      当前所在层不是“拖出去”的目标，
      所以不绑定。
    */

    if (
      pathsAreEqual(
        targetPath,
        currentTreePath
      )
    ) {

      return;

    }


    button.addEventListener(
      "dragover",
      function (event) {

        event.preventDefault();

        event.stopPropagation();


        if (
          draggedTreeIndex ===
            null ||
          !draggedTreeSourcePath
        ) {

          return;

        }


        button.classList.add(
          "drag-target"
        );

      }
    );


    button.addEventListener(
      "dragleave",
      function () {

        button.classList.remove(
          "drag-target"
        );

      }
    );


    button.addEventListener(
      "drop",
      function (event) {

        event.preventDefault();

        event.stopPropagation();


        button.classList.remove(
          "drag-target"
        );


        if (
          draggedTreeIndex ===
            null ||
          !draggedTreeSourcePath
        ) {

          return;

        }


        moveTreeNodeToPath(

          [
            ...draggedTreeSourcePath
          ],

          draggedTreeIndex,

          [
            ...targetPath
          ]

        );

      }
    );

  }


/* =========================
   根层
   ========================= */

  const rootButton =
    document.createElement(
      "button"
    );


  rootButton.type =
    "button";


  rootButton.className =
    currentTreePath.length ===
      0
      ? "tree-breadcrumb-button current"
      : "tree-breadcrumb-button";


  rootButton.textContent =
    category.name;


  if (
    currentTreePath.length >
    0
  ) {

    rootButton.addEventListener(
      "click",
      function () {

        currentTreePath =
          [];


        renderCategoryContent();

      }
    );


    /*
      拖到根层名称
      = 移回 01 根层。
    */

    bindBreadcrumbDrop(
      rootButton,
      []
    );

  }


  treeBreadcrumbs.appendChild(
    rootButton
  );


/* =========================
   各级分组
   ========================= */

  groups.forEach(
    function (
      group,
      depth
    ) {

      const separator =
        document.createElement(
          "span"
        );


      separator.className =
        "tree-breadcrumb-separator";


      separator.textContent =
        ">";


      treeBreadcrumbs.appendChild(
        separator
      );


      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      const isCurrent =
        depth ===
        groups.length - 1;


      button.className =
        isCurrent
          ? "tree-breadcrumb-button current"
          : "tree-breadcrumb-button";


      button.textContent =
        group.name ||
        "未命名分组";


      /*
        这个分组对应的路径。

        depth 0
        → [根层第一个分组]

        depth 1
        → [根层分组, 子分组]

        以此类推。
      */

      const targetPath =
        currentTreePath.slice(
          0,
          depth + 1
        );


      if (!isCurrent) {

        /*
          点击：
          正常返回这一层。
        */

        button.addEventListener(
          "click",
          function () {

            currentTreePath =
              [
                ...targetPath
              ];


            renderCategoryContent();

          }
        );


        /*
          拖到这里：
          把当前节点移回这一层。
        */

        bindBreadcrumbDrop(
          button,
          targetPath
        );

      }


      treeBreadcrumbs.appendChild(
        button
      );

    }
  );

}

/* =========================
   把一个节点拖进分组
   ========================= */

function moveTreeNodeIntoGroup(
  sourcePath,
  sourceIndex,
  targetPath,
  targetGroupIndex
) {

  const sourceTree =
    getTreeArrayByPath(
      sourcePath
    );


  const targetTree =
    getTreeArrayByPath(
      targetPath
    );


  if (
    !sourceTree ||
    !targetTree
  ) {

    return;

  }


  if (
    sourceIndex < 0 ||
    sourceIndex >=
    sourceTree.length
  ) {

    return;

  }


  /*
    如果来源和目标就在同一层，
    删除来源以后，
    后面的 index 会向前移动一位。
  */

  const sameTree =
    sourceTree ===
    targetTree;


  let adjustedTargetIndex =
    targetGroupIndex;


  if (
    sameTree &&
    sourceIndex <
    targetGroupIndex
  ) {

    adjustedTargetIndex -=
      1;

  }


  const [
    movingNode
  ] =
    sourceTree.splice(
      sourceIndex,
      1
    );


  const targetGroup =
    targetTree[
    adjustedTargetIndex
    ];


  /*
    理论上 target 必须是分组。

    如果不是，
    为避免数据丢失，
    立即把原节点放回去。
  */

  if (
    !isTreeGroup(
      targetGroup
    )
  ) {

    sourceTree.splice(
      sourceIndex,
      0,
      movingNode
    );


    return;

  }


  targetGroup.children.push(
    movingNode
  );


  markUnsaved();


  renderCategoryContent();

}

/* =========================
   进入分组
   ========================= */

function enterTreeGroup(
  index
) {

  const tree =
    getCurrentTreeArray();


  if (!tree) {

    return;

  }


  const node =
    tree[index];


  if (
    !isTreeGroup(node)
  ) {

    return;

  }


  currentTreePath.push(
    index
  );


  renderCategoryContent();

}


/* =========================
   打开新增 / 改名分组弹窗
   ========================= */

function openTreeGroupDialog(
  index = null
) {

  const tree =
    getCurrentTreeArray();


  if (!tree) {

    return;

  }


  editingTreeGroupIndex =
    index;


  if (
    index === null
  ) {

    treeGroupDialogTitle.textContent =
      "新增分组";


    treeGroupInput.value =
      "";

  } else {

    const node =
      tree[index];


    if (
      !isTreeGroup(node)
    ) {

      return;

    }


    treeGroupDialogTitle.textContent =
      "修改分组名称";


    treeGroupInput.value =
      node.name || "";

  }


  treeGroupDialog.hidden =
    false;


  requestAnimationFrame(
    function () {

      treeGroupInput.focus();


      if (
        index !== null
      ) {

        treeGroupInput.select();

      }

    }
  );

}


/* =========================
   关闭分组弹窗
   ========================= */

function closeTreeGroupDialog() {

  treeGroupDialog.hidden =
    true;


  editingTreeGroupIndex =
    null;

}


/* =========================
   保存分组
   ========================= */

function saveTreeGroup() {

  const tree =
    getCurrentTreeArray();


  if (!tree) {

    closeTreeGroupDialog();

    return;

  }


  const name =
    treeGroupInput
      .value
      .trim();


  if (!name) {

    treeGroupInput.focus();

    return;

  }


  /*
    新建
  */

  if (
    editingTreeGroupIndex === null
  ) {

    tree.push({

      name:
        name,

      children:
        []

    });

  } else {

    /*
      改名
    */

    const node =
      tree[
      editingTreeGroupIndex
      ];


    if (
      !isTreeGroup(node)
    ) {

      return;

    }


    node.name =
      name;

  }


  markUnsaved();


  closeTreeGroupDialog();


  renderCategoryContent();

}


/* =========================
   新增分组按钮
   ========================= */

addTreeGroupButton.addEventListener(
  "click",
  function () {

    openTreeGroupDialog(
      null
    );

  }
);


/* =========================
   分组弹窗按钮
   ========================= */

treeGroupCancelButton.addEventListener(
  "click",
  closeTreeGroupDialog
);


treeGroupConfirmButton.addEventListener(
  "click",
  saveTreeGroup
);


treeGroupInput.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      saveTreeGroup();

    }


    if (
      event.key === "Escape"
    ) {

      closeTreeGroupDialog();

    }

  }
);


/* =========================
   删除分组
   ========================= */

function deleteTreeGroup(
  index
) {

  const tree =
    getCurrentTreeArray();


  if (!tree) {

    return;

  }


  const node =
    tree[index];


  if (
    !isTreeGroup(node)
  ) {

    return;

  }


  const descendantCount =
    countTreeDescendants(
      node.children
    );


  const detail =
    descendantCount > 0
      ? `\n\n这个分组下面还有 ${descendantCount} 个后代节点，也会一起删除。`
      : "";


  const confirmed =
    window.confirm(
      `删除分组“${node.name || "未命名分组"}”？${detail}`
    );


  if (!confirmed) {

    return;

  }


  tree.splice(
    index,
    1
  );


  markUnsaved();


  renderCategoryContent();

}


/* =========================
   统计分组全部后代节点
   ========================= */

function countTreeDescendants(
  children
) {

  if (
    !Array.isArray(children)
  ) {

    return 0;

  }


  let count =
    0;


  children.forEach(
    function (node) {

      count += 1;


      if (
        isTreeGroup(node)
      ) {

        count +=
          countTreeDescendants(
            node.children
          );

      }

    }
  );


  return count;

}

function openTreeCardDialog(
  index = null
) {

  const tree =
    getCurrentTreeArray();


  if (!tree) {

    return;

  }


  editingTreeCardIndex =
    index;


  if (
    index === null
  ) {

    treeCardDialogTitle.textContent =
      "新增字卡";


    treeCardInput.value =
      "";

  } else {

    const node =
      tree[
      index
      ];


    if (
      typeof node !==
      "string"
    ) {

      return;

    }


    treeCardDialogTitle.textContent =
      "编辑字卡";


    treeCardInput.value =
      node;

  }


  treeCardDialog.hidden =
    false;


  requestAnimationFrame(
    function () {

      treeCardInput.focus();


      if (
        index !==
        null
      ) {

        treeCardInput.select();

      }

    }
  );

}



function closeTreeCardDialog() {

  treeCardDialog.hidden =
    true;


  editingTreeCardIndex =
    null;

}



function saveTreeCard() {

  const tree =
    getCurrentTreeArray();


  if (!tree) {

    closeTreeCardDialog();

    return;

  }


  const text =
    treeCardInput
      .value
      .trim();


  if (!text) {

    treeCardInput.focus();

    return;

  }


  if (
    editingTreeCardIndex ===
    null
  ) {

    tree.push(
      text
    );

  } else {

    if (
      typeof tree[
      editingTreeCardIndex
      ] !==
      "string"
    ) {

      return;

    }


    tree[
      editingTreeCardIndex
    ] =
      text;

  }


  markUnsaved();


  closeTreeCardDialog();


  renderCategoryContent();

}



addTreeCardButton.addEventListener(
  "click",
  function () {

    openTreeCardDialog(
      null
    );

  }
);


treeCardCancelButton.addEventListener(
  "click",
  closeTreeCardDialog
);


treeCardConfirmButton.addEventListener(
  "click",
  saveTreeCard
);



treeCardInput.addEventListener(
  "keydown",
  function (event) {

    /*
      Ctrl + Enter
      可以直接保存较长字卡。
    */

    if (
      (
        event.ctrlKey ||
        event.metaKey
      ) &&
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      saveTreeCard();

    }


    if (
      event.key ===
      "Escape"
    ) {

      closeTreeCardDialog();

    }

  }
);



/* =========================
   删除具体字卡
   ========================= */

function deleteTreeCard(
  index
) {

  const tree =
    getCurrentTreeArray();


  if (!tree) {

    return;

  }


  const node =
    tree[
    index
    ];


  if (
    typeof node !==
    "string"
  ) {

    return;

  }


  const confirmed =
    window.confirm(
      `删除这张字卡？\n\n${node}`
    );


  if (!confirmed) {

    return;

  }


  tree.splice(
    index,
    1
  );


  markUnsaved();


  renderCategoryContent();

}



/* =========================
   具体字卡拖拽
   ========================= */

function bindTreeDragEvents(
  element
) {

  element.addEventListener(
    "dragstart",
    function () {

      draggedTreeIndex =
        Number(
          element.dataset.index
        );


      draggedTreeSourcePath =
        [
          ...currentTreePath
        ];


      element.classList.add(
        "dragging"
      );

    }
  );


  element.addEventListener(
    "dragend",
    function () {

      draggedTreeIndex =
        null;


      draggedTreeSourcePath =
        null;


      treeCardList
        .querySelectorAll(
          ".tree-item"
        )
        .forEach(
          function (item) {

            item.classList.remove(
              "dragging",
              "drag-over",
              "drag-into"
            );

          }
        );

    }
  );


  /*
    普通拖到一行上：
    仍然代表同层排序。
  */

  element.addEventListener(
    "dragover",
    function (event) {

      event.preventDefault();


      const targetIndex =
        Number(
          element.dataset.index
        );


      if (
        draggedTreeIndex ===
        null ||
        (
          draggedTreeSourcePath &&
          pathsAreEqual(
            draggedTreeSourcePath,
            currentTreePath
          ) &&
          draggedTreeIndex ===
          targetIndex
        )
      ) {

        return;

      }


      element.classList.add(
        "drag-over"
      );

    }
  );


  element.addEventListener(
    "dragleave",
    function () {

      element.classList.remove(
        "drag-over"
      );

    }
  );


  element.addEventListener(
    "drop",
    function (event) {

      event.preventDefault();


      element.classList.remove(
        "drag-over"
      );


      const targetIndex =
        Number(
          element.dataset.index
        );


      /*
        普通 drop：
        同层重新排序。
      */

      if (
        draggedTreeSourcePath &&
        pathsAreEqual(
          draggedTreeSourcePath,
          currentTreePath
        )
      ) {

        moveTreeNodeBefore(
          draggedTreeIndex,
          targetIndex
        );

      }

    }
  );

}

/* =========================
   把节点移动到指定层级
   ========================= */

function moveTreeNodeToPath(
  sourcePath,
  sourceIndex,
  targetPath
) {

  if (
    !Array.isArray(
      sourcePath
    ) ||
    !Array.isArray(
      targetPath
    )
  ) {

    return;

  }


  /*
    如果目标就是当前所在层，
    不需要做跨层移动。
  */

  if (
    pathsAreEqual(
      sourcePath,
      targetPath
    )
  ) {

    return;

  }


  const sourceTree =
    getTreeArrayByPath(
      sourcePath
    );


  if (!sourceTree) {

    return;

  }


  if (
    sourceIndex < 0 ||
    sourceIndex >=
      sourceTree.length
  ) {

    return;

  }


  /*
    先拿出要移动的节点。
  */

  const [
    movingNode
  ] =
    sourceTree.splice(
      sourceIndex,
      1
    );


  /*
    再寻找目标层级。

    对我们现在的用途来说，
    targetPath 都是当前路径的祖先，
    所以移动以后路径不会失效。
  */

  const targetTree =
    getTreeArrayByPath(
      targetPath
    );


  /*
    万一目标路径异常，
    为了不丢数据，
    把节点重新放回原处。
  */

  if (!targetTree) {

    sourceTree.splice(
      sourceIndex,
      0,
      movingNode
    );


    return;

  }


  /*
    放到目标层最后。
  */

  targetTree.push(
    movingNode
  );


  markUnsaved();


  /*
    移动以后，
    当前浏览位置保持不变。

    所以你能直接看到：
    这张卡已经从当前层消失。
  */

  renderCategoryContent();

}

/* =========================
   比较两个 tree 路径
   ========================= */

function pathsAreEqual(
  pathA,
  pathB
) {

  if (
    !Array.isArray(pathA) ||
    !Array.isArray(pathB) ||
    pathA.length !==
    pathB.length
  ) {

    return false;

  }


  return (
    pathA.every(
      function (
        value,
        index
      ) {

        return (
          value ===
          pathB[index]
        );

      }
    )
  );

}



/* =========================
   调整 tree 根级顺序
   ========================= */

function moveTreeNodeBefore(
  sourceIndex,
  targetIndex
) {

  const tree =
    getCurrentTreeArray();


  if (!tree) {

    return;

  }


  if (
    sourceIndex ===
    null ||
    targetIndex ===
    null ||
    sourceIndex ===
    targetIndex
  ) {

    return;

  }


  if (
    sourceIndex < 0 ||
    targetIndex < 0 ||
    sourceIndex >=
    tree.length ||
    targetIndex >=
    tree.length
  ) {

    return;

  }


  const [
    movingNode
  ] =
    tree.splice(
      sourceIndex,
      1
    );


  let insertIndex =
    targetIndex;


  if (
    sourceIndex <
    targetIndex
  ) {

    insertIndex -=
      1;

  }


  tree.splice(
    insertIndex,
    0,
    movingNode
  );


  markUnsaved();


  renderCategoryContent();

}

/* =========================
   新增 01
   ========================= */

addCategoryButton.addEventListener(
  "click",
  function () {

    creatingNewCategory =
      true;


    editingCategoryId =
      null;


    renameInput.value =
      "";


    renameIdInput.value =
      "";


    renameIdInput.readOnly =
      false;


    renameDialog.hidden =
      false;


    requestAnimationFrame(
      function () {

        renameInput.focus();

      }
    );

  }
);



/* =========================
   改名
   ========================= */

function openRenameDialog(
  categoryId
) {

  const category =
    findCategoryById(
      categoryId
    );


  if (!category) {

    return;

  }


  creatingNewCategory =
    false;


  editingCategoryId =
    categoryId;


  renameInput.value =
    category.name;


  renameIdInput.value =
    category.id;


  /*
    已有 01 的稳定 ID
    不允许在普通改名操作里修改。
  */

  renameIdInput.readOnly =
    true;


  renameDialog.hidden =
    false;


  requestAnimationFrame(
    function () {

      renameInput.focus();

      renameInput.select();

    }
  );

}



function closeRenameDialog() {

  renameDialog.hidden =
    true;


  editingCategoryId =
    null;


  creatingNewCategory =
    false;

}



/* =========================
   保存新建 / 改名
   ========================= */

function saveCategoryRename() {

  const nextName =
    renameInput.value.trim();


  if (!nextName) {

    renameInput.focus();

    return;

  }


  /*
    新建 01
  */

  if (
    creatingNewCategory
  ) {

    const nextId =
      renameIdInput
        .value
        .trim();


    if (!nextId) {

      alert(
        "请给这个 01 填写一个 ID。"
      );


      renameIdInput.focus();

      return;

    }


    /*
      ID 格式：

      weather
      food_preference
      dream_state
      abc123

      不允许中文、空格、横杠等。
    */

    const validId =
      /^[a-z][a-z0-9_]*$/.test(
        nextId
      );


    if (!validId) {

      alert(
        "ID 请使用小写英文字母、数字和下划线，并以英文字母开头。\n例如：weather 或 food_preference"
      );


      renameIdInput.focus();

      return;

    }


    if (
      isCategoryIdTaken(
        nextId
      )
    ) {

      alert(
        `ID “${nextId}” 已经存在，请换一个。`
      );


      renameIdInput.focus();

      return;

    }


    getCurrentSection()
      .items
      .push({

        id:
          nextId,

        name:
          nextName,

        tree:
          []

      });


    markUnsaved();

    renderCategories();

    closeRenameDialog();


    return;

  }


  /*
    修改已有 01 名称
  */

  const category =
    findCategoryById(
      editingCategoryId
    );


  if (!category) {

    closeRenameDialog();

    return;

  }


  if (
    category.name !==
    nextName
  ) {

    category.name =
      nextName;


    markUnsaved();

    renderCategories();

  }


  closeRenameDialog();

}



renameCancelButton.addEventListener(
  "click",
  closeRenameDialog
);


renameConfirmButton.addEventListener(
  "click",
  saveCategoryRename
);



renameInput.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      saveCategoryRename();

    }


    if (
      event.key ===
      "Escape"
    ) {

      closeRenameDialog();

    }

  }
);



renameIdInput.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      saveCategoryRename();

    }


    if (
      event.key ===
      "Escape"
    ) {

      closeRenameDialog();

    }

  }
);


/* =========================
   删除
   ========================= */

function openDeleteDialog(
  categoryId
) {

  const category =
    findCategoryById(
      categoryId
    );


  if (!category) {

    return;

  }


  deletingCategoryId =
    categoryId;


  deleteDialogText.textContent =
    `“${category.name}” 将从电子字卡库中删除。`;


  deleteDialog.hidden =
    false;

}


function closeDeleteDialog() {

  deleteDialog.hidden =
    true;

  deletingCategoryId =
    null;

}


deleteCancelButton.addEventListener(
  "click",
  closeDeleteDialog
);


deleteConfirmButton.addEventListener(
  "click",
  function () {

    const section =
      getCurrentSection();


    const index =
      section.items.findIndex(
        function (item) {

          return (
            item.id ===
            deletingCategoryId
          );

        }
      );


    if (
      index !==
      -1
    ) {

      section.items.splice(
        index,
        1
      );


      markUnsaved();

      renderCategories();

    }


    closeDeleteDialog();

  }
);



/* =========================
   拖拽排序
   ========================= */

function bindCategoryDragEvents(
  element
) {

  element.addEventListener(
    "dragstart",
    function () {

      draggedCategoryId =
        element.dataset.id;


      element.classList.add(
        "dragging"
      );

    }
  );


  element.addEventListener(
    "dragend",
    function () {

      draggedCategoryId =
        null;


      document
        .querySelectorAll(
          ".category-item"
        )
        .forEach(
          function (item) {

            item.classList.remove(
              "dragging",
              "drag-over"
            );

          }
        );

    }
  );


  element.addEventListener(
    "dragover",
    function (event) {

      event.preventDefault();


      if (
        !draggedCategoryId ||
        draggedCategoryId ===
        element.dataset.id
      ) {

        return;

      }


      element.classList.add(
        "drag-over"
      );

    }
  );


  element.addEventListener(
    "dragleave",
    function () {

      element.classList.remove(
        "drag-over"
      );

    }
  );


  element.addEventListener(
    "drop",
    function (event) {

      event.preventDefault();


      element.classList.remove(
        "drag-over"
      );


      const targetId =
        element.dataset.id;


      moveCategoryBefore(
        draggedCategoryId,
        targetId
      );

    }
  );

}


function moveCategoryBefore(
  sourceId,
  targetId
) {

  if (
    !sourceId ||
    !targetId ||
    sourceId === targetId
  ) {

    return;

  }


  const items =
    getCurrentSection()
      .items;


  const sourceIndex =
    items.findIndex(
      function (item) {

        return (
          item.id ===
          sourceId
        );

      }
    );


  if (
    sourceIndex ===
    -1
  ) {

    return;

  }


  const [
    movingItem
  ] =
    items.splice(
      sourceIndex,
      1
    );


  const targetIndex =
    items.findIndex(
      function (item) {

        return (
          item.id ===
          targetId
        );

      }
    );


  if (
    targetIndex ===
    -1
  ) {

    items.push(
      movingItem
    );

  } else {

    items.splice(
      targetIndex,
      0,
      movingItem
    );

  }


  markUnsaved();

  renderCategories();

}



/* =========================
   生成数据文件内容
   ========================= */

function serializeCorpusFile() {

  return (
    `/* =========================
   Liminal · Electronic Cards Corpus

   电子字卡唯一内容数据源。

   这个文件由 cards-editor.html 维护。
   ========================= */


window.CARD_CORPUS =
${JSON.stringify(
      corpusData,
      null,
      2
    )};
`
  );

}



/* =========================
   从文件文字读取 CARD_CORPUS
   ========================= */

function parseCorpusFileText(
  text
) {

  const assignmentIndex =
    text.indexOf(
      "window.CARD_CORPUS"
    );


  if (
    assignmentIndex ===
    -1
  ) {

    throw new Error(
      "没有找到 window.CARD_CORPUS"
    );

  }


  const equalsIndex =
    text.indexOf(
      "=",
      assignmentIndex
    );


  const semicolonIndex =
    text.lastIndexOf(
      ";"
    );


  if (
    equalsIndex ===
      -1 ||
    semicolonIndex ===
      -1 ||
    semicolonIndex <=
      equalsIndex
  ) {

    throw new Error(
      "字卡数据文件格式无法识别"
    );

  }


  const dataText =
    text
      .slice(
        equalsIndex + 1,
        semicolonIndex
      )
      .trim();


  /*
    这里故意不用 JSON.parse。

    cards-corpus-data.js 本身就是
    JavaScript 数据文件，所以允许：

    - 尾随逗号
    - 单引号
    - 未加引号的属性名
    - 注释

    这样直接在 VS Code 手写数据
    才不会被严格 JSON 格式卡住。
  */

  const parsed =
    Function(
      `"use strict";
       return (${dataText});`
    )();


  if (
    !parsed ||
    typeof parsed !==
      "object"
  ) {

    throw new Error(
      "CARD_CORPUS 不是有效的数据对象"
    );

  }


  return (
    normalizeCorpusData(
      parsed
    )
  );

}

/* =========================
   记住本地字卡文件句柄
   ========================= */

function openCorpusHandleDatabase() {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      const request =
        indexedDB.open(
          CORPUS_HANDLE_DB_NAME,
          1
        );


      request.onupgradeneeded =
        function () {

          const database =
            request.result;


          if (
            !database
              .objectStoreNames
              .contains(
                CORPUS_HANDLE_STORE_NAME
              )
          ) {

            database
              .createObjectStore(
                CORPUS_HANDLE_STORE_NAME
              );

          }

        };


      request.onsuccess =
        function () {

          resolve(
            request.result
          );

        };


      request.onerror =
        function () {

          reject(
            request.error
          );

        };

    }
  );

}



/* 保存文件句柄 */

async function rememberCorpusFileHandle(
  handle
) {

  if (
    !(
      "indexedDB" in
      window
    )
  ) {

    return;

  }


  try {

    const database =
      await openCorpusHandleDatabase();


    await new Promise(
      function (
        resolve,
        reject
      ) {

        const transaction =
          database.transaction(
            CORPUS_HANDLE_STORE_NAME,
            "readwrite"
          );


        const store =
          transaction.objectStore(
            CORPUS_HANDLE_STORE_NAME
          );


        store.put(
          handle,
          CORPUS_HANDLE_KEY
        );


        transaction.oncomplete =
          function () {

            resolve();

          };


        transaction.onerror =
          function () {

            reject(
              transaction.error
            );

          };

      }
    );


    database.close();

  } catch (error) {

    console.warn(
      "无法记住字卡库文件句柄",
      error
    );

  }

}



/* 读取上一次文件句柄 */

async function loadRememberedCorpusFileHandle() {

  if (
    !(
      "indexedDB" in
      window
    )
  ) {

    return null;

  }


  try {

    const database =
      await openCorpusHandleDatabase();


    const handle =
      await new Promise(
        function (
          resolve,
          reject
        ) {

          const transaction =
            database.transaction(
              CORPUS_HANDLE_STORE_NAME,
              "readonly"
            );


          const store =
            transaction.objectStore(
              CORPUS_HANDLE_STORE_NAME
            );


          const request =
            store.get(
              CORPUS_HANDLE_KEY
            );


          request.onsuccess =
            function () {

              resolve(
                request.result ||
                null
              );

            };


          request.onerror =
            function () {

              reject(
                request.error
              );

            };

        }
      );


    database.close();


    return handle;

  } catch (error) {

    console.warn(
      "读取上一次字卡库连接失败",
      error
    );


    return null;

  }

}



/* =========================
   文件权限
   ========================= */

async function queryCorpusFilePermission(
  handle
) {

  if (
    !handle
  ) {

    return "denied";

  }


  if (
    typeof handle.queryPermission !==
    "function"
  ) {

    return "granted";

  }


  try {

    return (
      await handle.queryPermission({
        mode:
          "readwrite"
      })
    );

  } catch (error) {

    console.warn(
      "查询字卡库权限失败",
      error
    );


    return "denied";

  }

}



async function requestCorpusFilePermission(
  handle
) {

  if (
    !handle
  ) {

    return false;

  }


  if (
    typeof handle.requestPermission !==
    "function"
  ) {

    return true;

  }


  try {

    const result =
      await handle.requestPermission({
        mode:
          "readwrite"
      });


    return (
      result ===
      "granted"
    );

  } catch (error) {

    console.warn(
      "恢复字卡库权限失败",
      error
    );


    return false;

  }

}



/* =========================
   页面打开时恢复上次连接
   ========================= */

async function restoreRememberedCorpusConnection() {

  const handle =
    await loadRememberedCorpusFileHandle();


  if (!handle) {

    return;

  }


  corpusFileHandle =
    handle;


  corpusFileStatus.textContent =
    handle.name;


  const permission =
    await queryCorpusFilePermission(
      handle
    );


  /*
    浏览器仍然保留权限：

    重点：
    不能只恢复文件句柄，
    必须重新读取磁盘上的真实字卡库。
  */

  if (
    permission ===
    "granted"
  ) {

    corpusConnectionNeedsPermission =
      false;


    const loaded =
      await loadCorpusFromFileHandle(
        handle
      );


    if (!loaded) {

      connectCorpusButton.textContent =
        "重新连接";


      saveCorpusButton.disabled =
        true;


      return;

    }


    connectCorpusButton.textContent =
      "重新连接";


    saveCorpusButton.disabled =
      false;


    return;

  }


  /*
    记得是哪个文件，
    但本次浏览器要求重新授权。

    此时绝对不允许保存。
  */

  corpusConnectionNeedsPermission =
    true;


  hasLoadedRealCorpusFile =
    false;


  connectCorpusButton.textContent =
    "恢复连接";


  saveCorpusButton.disabled =
    true;


  corpusSaveState.textContent =
    "等待授权";


  corpusSaveState.classList.remove(
    "saved",
    "unsaved"
  );

}

/* =========================
   从真实文件重新加载字卡库
   ========================= */

async function loadCorpusFromFileHandle(
  handle
) {

  if (!handle) {

    return false;

  }


  try {

    const file =
      await handle.getFile();


    const text =
      await file.text();


    const isInitialEmptyCorpus =
      text.includes(
        "window.CARD_CORPUS = null"
      );


    if (
  isInitialEmptyCorpus
) {

  /*
    以前这里会从 cards-data.js
    自动生成 88 个空 01。

    现在禁止这种 fallback。

    如果真实文件还是 null，
    就直接拒绝载入，
    防止空壳覆盖正式数据库。
  */

  throw new Error(
    "cards-corpus-data.js 当前仍是空字卡库，已停止载入以保护数据。"
  );

} else {

      /*
        正常情况：
        必须读取磁盘上的真实数据库。
      */

      corpusData =
        parseCorpusFileText(
          text
        );


      hasLoadedRealCorpusFile =
        true;


      markSaved();

    }


    renderCategories();


    return true;

  } catch (error) {

    hasLoadedRealCorpusFile =
      false;


    saveCorpusButton.disabled =
      true;


    console.error(
      "读取真实字卡库失败",
      error
    );


    alert(
      `字卡库读取失败：${error.message}`
    );


    return false;

  }

}

/* =========================
   连接本地真实文件
   ========================= */


async function connectCorpusFile() {

  if (
    !(
      "showOpenFilePicker" in
      window
    )
  ) {

    alert(
      "当前浏览器不支持直接读写本地文件。请在电脑 Chrome 或 Edge 中打开这个编辑器。"
    );

    return;

  }


  try {

    const [
      handle
    ] =
      await window.showOpenFilePicker({

        multiple:
          false,

        types: [

          {
            description:
              "Liminal Electronic Cards Data",

            accept: {

              "text/javascript": [
                ".js"
              ]

            }

          }

        ]

      });


    if (!handle) {

      return;

    }


    /*
      先保存新的文件句柄。
    */

    corpusFileHandle =
      handle;


    corpusConnectionNeedsPermission =
      false;


    hasLoadedRealCorpusFile =
      false;


    corpusFileStatus.textContent =
      handle.name;


    /*
      记住这个文件，
      方便以后刷新自动恢复。
    */

    await rememberCorpusFileHandle(
      handle
    );


    /*
      最重要：

      手动连接以后，
      也统一通过安全函数
      真正读取磁盘数据。
    */

    const loaded =
      await loadCorpusFromFileHandle(
        handle
      );


    if (!loaded) {

      connectCorpusButton.textContent =
        "重新连接";


      saveCorpusButton.disabled =
        true;


      return;

    }


    connectCorpusButton.textContent =
      "重新连接";


    saveCorpusButton.disabled =
      false;

  } catch (error) {

    hasLoadedRealCorpusFile =
      false;


    saveCorpusButton.disabled =
      true;


    if (
      error?.name ===
      "AbortError"
    ) {

      return;

    }


    console.error(
      "连接字卡库失败",
      error
    );


    alert(
      `连接失败：${error.message}`
    );

  }

}



/* =========================
   保存到真实文件
   ========================= */

async function saveCorpusFile() {

  /*
    没有真实文件句柄：
    禁止保存。
  */

  if (!corpusFileHandle) {

    alert(
      "尚未连接 cards-corpus-data.js，不能保存。"
    );

    return;

  }


  /*
    最重要的保险：

    当前页面如果没有明确读取过
    真实 cards-corpus-data.js，

    即使手里碰巧有文件句柄，
    也绝对禁止覆盖文件。
  */

  if (
    !hasLoadedRealCorpusFile
  ) {

    alert(
      "当前页面尚未成功读取真实字卡库，因此禁止保存。\n\n请先重新连接字卡库。"
    );


    saveCorpusButton.disabled =
      true;


    return;

  }


  try {

    const writable =
      await corpusFileHandle
        .createWritable();


    await writable.write(
      serializeCorpusFile()
    );


    await writable.close();


    markSaved();

  } catch (error) {

    console.error(
      "保存字卡库失败",
      error
    );


    alert(
      `保存失败：${error.message}`
    );

  }

}



/* =========================
   文件按钮
   ========================= */

async function handleCorpusConnectButton() {

  /*
    已经记得文件，
    只是这次需要重新授权。
  */

  if (
    corpusConnectionNeedsPermission &&
    corpusFileHandle
  ) {

    const granted =
      await requestCorpusFilePermission(
        corpusFileHandle
      );


    if (!granted) {

      return;

    }


    /*
      授权成功以后，
      仍然必须重新读取真实文件。

      不能直接 markSaved()，
      否则又会出现：
      “看起来连上了，
      实际内存里还是空树”的事故。
    */

    const loaded =
      await loadCorpusFromFileHandle(
        corpusFileHandle
      );


    if (!loaded) {

      return;

    }


    corpusConnectionNeedsPermission =
      false;


    connectCorpusButton.textContent =
      "重新连接";


    saveCorpusButton.disabled =
      false;


    return;

  }


  /*
    没有记住文件，
    或者你主动要重新选择文件。
  */

  await connectCorpusFile();

}



connectCorpusButton.addEventListener(
  "click",
  handleCorpusConnectButton
);


saveCorpusButton.addEventListener(
  "click",
  saveCorpusFile
);



/* =========================
   Ctrl + S
   ========================= */

document.addEventListener(
  "keydown",
  function (event) {

    const isSaveShortcut =
      (
        event.ctrlKey ||
        event.metaKey
      ) &&
      event.key.toLowerCase() ===
      "s";


    if (!isSaveShortcut) {

      return;

    }


    event.preventDefault();


    if (!corpusFileHandle) {

      alert(
        "请先点击“连接字卡库”，选择 cards-corpus-data.js。"
      );

      return;

    }


    saveCorpusFile();

  }
);



/* =========================
   离开前提醒未保存
   ========================= */

window.addEventListener(
  "beforeunload",
  function (event) {

    if (!hasUnsavedChanges) {

      return;

    }


    event.preventDefault();

    event.returnValue =
      "";

  }
);



/* =========================
   初始化
   ========================= */

renderCategories();


restoreRememberedCorpusConnection();