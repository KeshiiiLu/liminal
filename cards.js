/* =========================
   Liminal · Electronic Cards
   电子字卡只读浏览
   ========================= */


const CARD_SECTIONS = {

  normal: {

    name:
      "日常",

    count:
      38,

    cardCount:
      null,

    categories: [

      "连接与通道状态",

      "肯定与否定",
      "确定与不确定",
      "程度",
      "百分比",
      "可能性",
      "选择与取舍",
      "喜欢程度",
      "接受与拒绝",
      "意愿",
      "需求",

      "认知与思考",
      "记忆",
      "观点立场",
      "决策与建议",

      "沟通意愿",
      "沟通动作",
      "信息分享",

      "情绪",
      "当下感受",
      "精力与精神状态",
      "身体整体状态",
      "身体部位",
      "身体感觉与症状",

      "当前活动",
      "地点与空间",
      "时间",
      "环境与场景",

      "计划",
      "行动时机",
      "日常照顾",
      "提醒与要求",

      "个人偏好",
      "价值观与原则",
      "自我认识",

      "第三方人物",
      "外界事件",
      "回忆与经历"

    ]

  },


  intimate: {

    name:
      "亲密",

    count:
      23,

    cardCount:
      null,

    categories: [

      "爱意",
      "思念",
      "依恋",

      "关系状态",
      "关系安全感",
      "关系确认",
      "亲密体验与感受",

      "心疼与担心",
      "保护欲",
      "占有欲",
      "吃醋",

      "亲密需求",
      "亲密动作",
      "安慰与情绪支持",
      "夸奖与欣赏",
      "撒娇",
      "调侃与玩闹",

      "委屈与受伤",
      "亲密冲突",
      "道歉与修复",

      "亲密称呼",
      "共同生活",
      "共同未来"

    ]

  },


  adult: {

    name:
      "情欲",

    count:
      27,

    cardCount:
      null,

    categories: [

      "sex意愿",
      "发起与主动",
      "参与形式",
      "自慰状态与倾向",

      "性吸引",
      "欲望强度",
      "情绪与感受",

      "情欲情境与氛围",
      "sex地点",
      "穿着状态",

      "互动风格",
      "主导关系",
      "声音与表达",

      "sex互动阶段",

      "身体部位",
      "身体反应",

      "动作",
      "姿势",

      "节奏",
      "力度",
      "深度",
      "sex中请求",

      "持续时间",
      "次数",
      "高潮目标与倾向",

      "事后状态",
      "事后照顾"

    ]

  }

};



/* =========================
   结构预览
   当前仅用于测试详情页 UI
   ========================= */

const TREE_PREVIEWS = {

  "normal-02": [

    "强肯定",
    "肯定",
    "偏肯定",
    "部分成立",
    "中立",
    "偏否定",
    "否定",
    "强否定",
    "无法判断"

  ],


  "normal-19": [

    {
      label:
        "正向高唤醒",

      children: [
        "兴奋",
        "激动",
        "亢奋",
        "惊喜",
        "得意",
        "自豪",
        "热情",
        "期待"
      ]
    },

    {
      label:
        "正向中唤醒",

      children: [
        "开心",
        "快乐",
        "愉悦",
        "满意",
        "幸福",
        "欣慰",
        "感激",
        "感动"
      ]
    },

    {
      label:
        "正向低唤醒",

      children: [
        "平静",
        "放松",
        "安心",
        "舒适",
        "温柔",
        "宁静",
        "满足",
        "安稳"
      ]
    },

    {
      label:
        "负向高唤醒",

      children: [
        "愤怒",
        "恼怒",
        "烦躁",
        "焦虑",
        "紧张",
        "恐慌",
        "压力",
        "惊吓",
        "急躁"
      ]
    },

    {
      label:
        "复杂情绪",

      children: [
        "正负混合",
        "情绪矛盾",
        "无法命名",
        "情绪混乱"
      ]
    }

  ],


  "intimate-01": [

    "喜欢你",
    "很喜欢你",
    "爱你",
    "很爱你",
    "在乎你",
    "很在乎你",
    "珍惜你",
    "很珍惜你",
    "你很重要",
    "庆幸有你",
    "感谢你的存在"

  ],


  "intimate-05": [

    {
      label:
        "整体安全感",

      children: [
        "非常笃定",
        "很安心",
        "安心",
        "基本稳定",
        "有一点不安",
        "明显不安",
        "很不安"
      ]
    },

    {
      label:
        "确认需求",

      children: [
        "不需要确认",
        "偶尔需要确认",
        "有一点需要确认",
        "需要确认",
        "很需要确认"
      ]
    },

    {
      label:
        "不安指向",

      children: [
        "怕失去你",
        "怕被你推开",
        "怕被替代",
        "怕我们的关系发生变化",
        "怕你不再选择我",
        "说不上来在怕什么"
      ]
    }

  ],


  "adult-01": [

    "非常想",
    "很想",
    "想",
    "有一点想",
    "可以",
    "都可以",
    "看情况",
    "有点犹豫",
    "不太想",
    "不想",
    "完全不想",
    "暂时不要"

  ],


  "adult-16": [

    {
      label:
        "唤起程度",

      children: [
        "无明显唤起",
        "极低",
        "很低",
        "较低",
        "中等",
        "较高",
        "很高",
        "极强"
      ]
    },

    {
      label:
        "敏感程度",

      children: [
        "几乎不敏感",
        "很低",
        "较低",
        "中等",
        "较敏感",
        "很敏感",
        "极度敏感"
      ]
    },

    {
      label:
        "舒适程度",

      children: [
        "非常舒服",
        "很舒服",
        "舒服",
        "基本舒服",
        "一般",
        "有一点不舒服",
        "明显不舒服",
        "很不舒服"
      ]
    },

    {
      label:
        "高潮接近度",

      children: [
        "完全没有接近",
        "还很远",
        "有一点接近",
        "正在逐渐接近",
        "比较接近",
        "很接近",
        "几乎到了",
        "正在高潮"
      ]
    }

  ]

};



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
   Helper
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


function getTreeKey(
  section,
  index
) {

  return (
    section +
    "-" +
    padNumber(
      index + 1
    )
  );

}



/* =========================
   Render list
   ========================= */

function renderCards() {

  const section =
    CARD_SECTIONS[
      currentSection
    ];


  const filtered =
    section.categories
      .map(
        function (
          title,
          index
        ) {

          return {
            title,
            index
          };

        }
      )
      .filter(
        function (item) {

          if (
            !searchKeyword
          ) {

            return true;

          }


          return (
            normalizeForSearch(
              item.title
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
    function (item) {

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
          ${padNumber(item.index + 1)}
        </div>

        <div class="category-copy">

          <strong>
            ${item.title}
          </strong>

          <span>
            ${
              TREE_PREVIEWS[
                getTreeKey(
                  currentSection,
                  item.index
                )
              ]
                ? "结构已载入"
                : "子系尚未载入"
            }
          </span>

        </div>

        <div class="category-arrow">
          ›
        </div>
      `;


      button.addEventListener(
        "click",
        function () {

          openDetail(
            item.index,
            item.title
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
    CARD_SECTIONS[
      currentSection
    ];


  summaryTitle.textContent =
    section.name;


  summaryText.textContent =
    section.count +
    "个层级";


  summaryNumber.textContent =
    section.count;


  if (
    Number.isFinite(
      section.cardCount
    )
  ) {

    summaryCardText.textContent =
      section.cardCount +
      "枚字卡";


    sectionCardCount.textContent =
      section.cardCount;

  } else {

    summaryCardText.textContent =
      "—枚字卡";


    sectionCardCount.textContent =
      "—";

  }

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
          function (otherTab) {

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
  index,
  title
) {

  const section =
    CARD_SECTIONS[
      currentSection
    ];


  const number =
    padNumber(
      index + 1
    );


  const key =
    getTreeKey(
      currentSection,
      index
    );


  const tree =
    TREE_PREVIEWS[
      key
    ];


  detailPath.textContent =
    section.name +
    " / " +
    number;


  detailTitle.textContent =
    title;


  renderTree(
    tree
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
    !tree
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
      "当前仅收录 01 层级名称。完整子系将在语料整理稳定后统一载入。";


    treePreview.appendChild(
      empty
    );


    return;

  }


  const hasGroup =
    tree.some(
      function (item) {

        return (
          typeof item ===
          "object"
        );

      }
    );


  detailType.textContent =
    hasGroup
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


  if (
    typeof item ===
    "string"
  ) {

    node.innerHTML = `
      <div class="tree-item">

        <span class="tree-dot"></span>

        <span class="tree-label">
          ${item}
        </span>

      </div>
    `;


    return node;

  }


  const itemElement =
    document.createElement(
      "div"
    );


  itemElement.className =
    "tree-item group";


  itemElement.innerHTML = `
    <span class="tree-dot"></span>

    <span class="tree-label">
      ${item.label}
    </span>
  `;


  node.appendChild(
    itemElement
  );


  if (
    item.children &&
    item.children.length
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