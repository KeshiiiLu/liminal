/* =========================
   Liminal · Chat Corpus Pool
   ========================= */

/* =========================
   电子字卡唯一内容来源
   ========================= */

/*
  Chat 的电子字卡 01：

  - 名称
  - ID
  - 顺序
  - 所属分区

  全部只认 cards-corpus-data.js。

  cards-data.js 不再负责
  Chat 语料池里的 01 定义。
*/

const CORPUS_CORPUS_CARD_SECTIONS =
  (
    window.CARD_CORPUS &&
    typeof window.CARD_CORPUS ===
      "object"
  )
    ? window.CARD_CORPUS
    : {

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


if (
  !window.CARD_CORPUS ||
  typeof window.CARD_CORPUS !==
    "object"
) {

  console.warn(
    "Chat 未读取到 cards-corpus-data.js，电子字卡 01 将暂时显示为空。"
  );

}
const corpusPoolButton =
  document.getElementById(
    "corpusPoolButton"
  );


const corpusKeyboardPanel =
  document.getElementById(
    "corpusKeyboardPanel"
  );


const corpusKeyboardClose =
  document.getElementById(
    "corpusKeyboardClose"
  );


const corpusKeyboardPages =
  document.getElementById(
    "corpusKeyboardPages"
  );


const corpusPageDots =
  document.getElementById(
    "corpusPageDots"
  );


const corpusPageLabel =
  document.getElementById(
    "corpusPageLabel"
  );


const corpusKeyboardPerson =
  document.getElementById(
    "corpusKeyboardPerson"
  );


const corpusOpenSummary =
  document.getElementById(
    "corpusOpenSummary"
  );


const corpusExtraSummary =
  document.getElementById(
    "corpusExtraSummary"
  );


const corpusPresetList =
  document.getElementById(
    "corpusPresetList"
  );

const corpusFixedPresetList =
  document.getElementById(
    "corpusFixedPresetList"
  );

const corpusNormalList =
  document.getElementById(
    "corpusNormalList"
  );


const corpusIntimateList =
  document.getElementById(
    "corpusIntimateList"
  );


const corpusAdultList =
  document.getElementById(
    "corpusAdultList"
  );


const corpusPhraseControl =
  document.getElementById(
    "corpusPhraseControl"
  );


const corpusCodeControl =
  document.getElementById(
    "corpusCodeControl"
  );



/* =========================
   Storage
   ========================= */

const CORPUS_POOL_STATE_KEY =
  `liminal_corpus_pool_${currentPerson.id}_v1`;



/* =========================
   页面定义
   ========================= */

const CORPUS_PAGE_LABELS = [

  "预设",
  "日常",
  "亲密",
  "情欲",
  "快捷用语",
  "暗号"

];



/* =========================
   默认状态
   ========================= */

function createDefaultCorpusState() {

  const sections = {};


  Object.entries(
    CORPUS_CORPUS_CARD_SECTIONS
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
   修复 / 合并旧状态
   ========================= */

function normalizeCorpusState(
  saved
) {

  const state =
    createDefaultCorpusState();


  if (
    !saved ||
    typeof saved !==
      "object"
  ) {

    return state;

  }


  Object.entries(
    CORPUS_CORPUS_CARD_SECTIONS
  ).forEach(
    function (
      [sectionId, section]
    ) {

      section.items.forEach(
        function (item) {

          /*
            新格式：
            用永久 id 保存。
          */

          const valueById =
            saved
              ?.sections
              ?.[sectionId]
              ?.[item.id];


          /*
            旧格式兼容：
            以前用中文名称当 key。

            第一次加载新版以后，
            会自动迁移到 id。
          */

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
   Load
   ========================= */

function loadCorpusState() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          CORPUS_POOL_STATE_KEY
        )
      );


    return (
      normalizeCorpusState(
        saved
      )
    );

  } catch {

    return (
      createDefaultCorpusState()
    );

  }

}



let corpusState =
  loadCorpusState();


/*
  每次进入时把旧的“中文名称 key”
  自动整理成新的稳定 id 格式。
*/

saveCorpusState();



/* =========================
   Save
   ========================= */

function saveCorpusState() {

  localStorage.setItem(
    CORPUS_POOL_STATE_KEY,
    JSON.stringify(
      corpusState
    )
  );

}



/* =========================
   Helpers
   ========================= */

function padCorpusNumber(
  number
) {

  return String(
    number
  ).padStart(
    2,
    "0"
  );

}


function isSectionFullyEnabled(
  sectionId
) {

  const section =
    CORPUS_CORPUS_CARD_SECTIONS[
      sectionId
    ];


  return (
    section.items.length >
      0 &&
    section.items.every(
      function (item) {

        return (
          corpusState
            .sections[
              sectionId
            ][
              item.id
            ] ===
          true
        );

      }
    )
  );

}


function areAllCardSectionsEnabled() {

  return (
    ["normal", "intimate", "adult"]
      .every(
        isSectionFullyEnabled
      )
  );

}


function countEnabled01() {

  let count =
    0;


  Object.entries(
    CORPUS_CORPUS_CARD_SECTIONS
  ).forEach(
    function (
      [sectionId, section]
    ) {

      section.items.forEach(
        function (item) {

          if (
            corpusState
              .sections[
                sectionId
              ][
                item.id
              ]
          ) {

            count +=
              1;

          }

        }
      );

    }
  );


  return count;

}


function getTotal01Count() {

  return (
    Object.values(
      CORPUS_CORPUS_CARD_SECTIONS
    )
      .reduce(
        function (
          total,
          section
        ) {

          return (
            total +
            section.items.length
          );

        },
        0
      )
  );

}



/* =========================
   人物语料数量
   ========================= */

function countPersonEntries(
  library,
  key
) {

  const person =
    library
      ?.[currentPerson.id];


  if (!person) {

    return 0;

  }


  let total =
    0;


  (
    person.categories ||
    []
  ).forEach(
    function (category) {

      const entries =
        category[
          key
        ];


      if (
        Array.isArray(
          entries
        )
      ) {

        total +=
          entries.length;

      }

    }
  );


  return total;

}



function getPhraseCount() {

  return (
    typeof PHRASE_LIBRARY !==
      "undefined"
      ? countPersonEntries(
          PHRASE_LIBRARY,
          "phrases"
        )
      : 0
  );

}


function getCodeCount() {

  return (
    typeof CODE_LIBRARY !==
      "undefined"
      ? countPersonEntries(
          CODE_LIBRARY,
          "codes"
        )
      : 0
  );

}



/* =========================
   总览
   ========================= */

function renderCorpusSummary() {

  const enabled =
    countEnabled01();


  const total =
    getTotal01Count();


  corpusOpenSummary.textContent =
    `已开放 ${enabled} / ${total} 个 01`;


  corpusExtraSummary.textContent =
    `快捷用语 ${
      corpusState.phrases
        ? "ON"
        : "OFF"
    } · 暗号 ${
      corpusState.codes
        ? "ON"
        : "OFF"
    }`;

}



/* =========================
   01 列表
   ========================= */

function renderSectionList(
  sectionId,
  container
) {

  const section =
    CORPUS_CORPUS_CARD_SECTIONS[
      sectionId
    ];


  container.innerHTML =
    "";


  section.items.forEach(
    function (
      item,
      index
    ) {

      const enabled =
        corpusState
          .sections[
            sectionId
          ][
            item.id
          ];


      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "corpus-toggle-item";


      button.classList.toggle(
        "is-on",
        enabled
      );


      button.innerHTML = `

        <span class="corpus-toggle-number">
          ${padCorpusNumber(index + 1)}
        </span>

        <span class="corpus-toggle-copy">

          <strong>
          </strong>

          <small>
            ${section.name} · 01
          </small>

        </span>

        <span class="corpus-toggle-state">
          ${enabled ? "ON" : "OFF"}
        </span>

      `;


      button
        .querySelector(
          "strong"
        )
        .textContent =
          item.name;


      button.addEventListener(
        "click",
        function () {

          corpusState
            .sections[
              sectionId
            ][
              item.id
            ] =
              !corpusState
                .sections[
                  sectionId
                ][
                  item.id
                ];


          saveCorpusState();

          renderCorpusKeyboard();

        }
      );


      container.appendChild(
        button
      );

    }
  );

}



/* =========================
   预设
   ========================= */

function createPresetButton(
  symbol,
  title,
  description,
  enabled,
  onClick
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "corpus-preset-item";


  button.classList.toggle(
    "is-on",
    enabled
  );


  button.innerHTML = `

    <span class="corpus-preset-symbol">
      ${symbol}
    </span>

    <span class="corpus-preset-copy">

      <strong>
      </strong>

      <small>
      </small>

    </span>

    <span class="corpus-toggle-state">
      ${enabled ? "ON" : "OFF"}
    </span>

  `;


  button
    .querySelector(
      "strong"
    )
    .textContent =
      title;


  button
    .querySelector(
      "small"
    )
    .textContent =
      description;


  button.addEventListener(
    "click",
    onClick
  );


  return button;

}



function toggleWholeSection(
  sectionId
) {

  const section =
    CORPUS_CORPUS_CARD_SECTIONS[
      sectionId
    ];


  const nextValue =
    !isSectionFullyEnabled(
      sectionId
    );


  section.items.forEach(
    function (item) {

      corpusState
        .sections[
          sectionId
        ][
          item.id
        ] =
          nextValue;

    }
  );


  saveCorpusState();

  renderCorpusKeyboard();

}



function toggleAllSections() {

  const nextValue =
    !areAllCardSectionsEnabled();


  Object.entries(
    CORPUS_CORPUS_CARD_SECTIONS
  ).forEach(
    function (
      [sectionId, section]
    ) {

      section.items.forEach(
        function (item) {

          corpusState
            .sections[
              sectionId
            ][
              item.id
            ] =
              nextValue;

        }
      );

    }
  );


  /*
    全部开放仍然只控制电子字卡。

    快捷用语与暗号
    继续保持独立状态。
  */


  saveCorpusState();

  renderCorpusKeyboard();

}



function renderPresets() {

  corpusPresetList.innerHTML =
    "";


  corpusPresetList.appendChild(
    createPresetButton(
      "日",
      "日常预设",
      "控制日常全部 01",
      isSectionFullyEnabled(
        "normal"
      ),
      function () {

        toggleWholeSection(
          "normal"
        );

      }
    )
  );


  corpusPresetList.appendChild(
    createPresetButton(
      "亲",
      "亲密预设",
      "控制亲密全部 01",
      isSectionFullyEnabled(
        "intimate"
      ),
      function () {

        toggleWholeSection(
          "intimate"
        );

      }
    )
  );


  corpusPresetList.appendChild(
    createPresetButton(
      "欲",
      "情欲预设",
      "控制情欲全部 01",
      isSectionFullyEnabled(
        "adult"
      ),
      function () {

        toggleWholeSection(
          "adult"
        );

      }
    )
  );


  corpusPresetList.appendChild(
    createPresetButton(
      "全",
      "全部开放",
      "日常 + 亲密 + 情欲全部 01",
      areAllCardSectionsEnabled(),
      toggleAllSections
    )
  );

}

/* =========================
   固定自定义预设
   电脑端定义 · 手机端只应用
   ========================= */


/* =========================
   统计预设实际包含多少个 01
   ========================= */

function countFixedPreset01(
  preset
) {

  let count =
    0;


  Object.entries(
    CORPUS_CORPUS_CARD_SECTIONS
  ).forEach(
    function (
      [sectionId, section]
    ) {

      const requestedIds =
        Array.isArray(
          preset
            ?.sections
            ?.[sectionId]
        )
          ? preset.sections[
              sectionId
            ]
          : [];


      const requestedSet =
        new Set(
          requestedIds
        );


      section.items.forEach(
        function (item) {

          if (
            requestedSet.has(
              item.id
            )
          ) {

            count +=
              1;

          }

        }
      );

    }
  );


  return count;

}



/* =========================
   当前状态是否等于这个预设
   ========================= */

function isFixedPresetActive(
  preset
) {

  return (
    Object.entries(
      CORPUS_CARD_SECTIONS
    ).every(
      function (
        [sectionId, section]
      ) {

        const requestedIds =
          Array.isArray(
            preset
              ?.sections
              ?.[sectionId]
          )
            ? preset.sections[
                sectionId
              ]
            : [];


        const requestedSet =
          new Set(
            requestedIds
          );


        return (
          section.items.every(
            function (item) {

              const shouldBeOn =
                requestedSet.has(
                  item.id
                );


              const currentlyOn =
                Boolean(
                  corpusState
                    .sections[
                      sectionId
                    ][
                      item.id
                    ]
                );


              return (
                shouldBeOn ===
                currentlyOn
              );

            }
          )
        );

      }
    )
  );

}



/* =========================
   应用固定预设
   ========================= */

function applyFixedCorpusPreset(
  preset
) {

  if (!preset) {

    return;

  }


  Object.entries(
    CORPUS_CARD_SECTIONS
  ).forEach(
    function (
      [sectionId, section]
    ) {

      const requestedIds =
        Array.isArray(
          preset
            ?.sections
            ?.[sectionId]
        )
          ? preset.sections[
              sectionId
            ]
          : [];


      const requestedSet =
        new Set(
          requestedIds
        );


      section.items.forEach(
        function (item) {

          corpusState
            .sections[
              sectionId
            ][
              item.id
            ] =
              requestedSet.has(
                item.id
              );

        }
      );

    }
  );


  /*
    这里只改变电子字卡 01。

    快捷用语和暗号
    继续保持当前状态。
  */

  saveCorpusState();


  renderCorpusKeyboard();

}



/* =========================
   渲染固定预设
   ========================= */

function renderFixedCorpusPresets() {

  corpusFixedPresetList.innerHTML =
    "";


  if (
    typeof CORPUS_PRESETS ===
      "undefined" ||
    !Array.isArray(
      CORPUS_PRESETS
    ) ||
    CORPUS_PRESETS.length ===
      0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "corpus-fixed-empty";


    empty.textContent =
      "暂无自定义预设";


    corpusFixedPresetList
      .appendChild(
        empty
      );


    return;

  }


  CORPUS_PRESETS.forEach(
    function (preset) {

      const active =
        isFixedPresetActive(
          preset
        );


      const count =
        countFixedPreset01(
          preset
        );


      const button =
        createPresetButton(

          "自",

          preset.name ||
            "未命名预设",

          `${
            count
          } 个 01 · ${
            active
              ? "当前"
              : "点击应用"
          }`,

          active,

          function () {

            applyFixedCorpusPreset(
              preset
            );

          }

        );


      corpusFixedPresetList
        .appendChild(
          button
        );

    }
  );

}

/* =========================
   快捷用语 / 暗号
   ========================= */

function createExtraButton(
  symbol,
  title,
  description,
  enabled,
  onClick
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "corpus-extra-item";


  button.classList.toggle(
    "is-on",
    enabled
  );


  button.innerHTML = `

    <span class="corpus-extra-symbol">
      ${symbol}
    </span>

    <span class="corpus-extra-copy">

      <strong>
      </strong>

      <small>
      </small>

    </span>

    <span class="corpus-toggle-state">
      ${enabled ? "ON" : "OFF"}
    </span>

  `;


  button
    .querySelector(
      "strong"
    )
    .textContent =
      title;


  button
    .querySelector(
      "small"
    )
    .textContent =
      description;


  button.addEventListener(
    "click",
    onClick
  );


  return button;

}



function renderExtraControls() {

  corpusPhraseControl.innerHTML =
    "";


  corpusCodeControl.innerHTML =
    "";


  corpusPhraseControl.appendChild(
    createExtraButton(
      "句",
      "快捷用语",
      `${getPhraseCount()} 句 · 人物专属`,
      corpusState.phrases,
      function () {

        corpusState.phrases =
          !corpusState.phrases;


        saveCorpusState();

        renderCorpusKeyboard();

      }
    )
  );


  corpusCodeControl.appendChild(
    createExtraButton(
      "号",
      "暗号",
      `${getCodeCount()} 条 · 人物专属`,
      corpusState.codes,
      function () {

        corpusState.codes =
          !corpusState.codes;


        saveCorpusState();

        renderCorpusKeyboard();

      }
    )
  );

}



/* =========================
   完整渲染
   ========================= */

function renderCorpusKeyboard() {

  corpusKeyboardPerson.textContent =
    currentPerson.name;


  renderCorpusSummary();


  renderPresets();

renderFixedCorpusPresets();

  renderSectionList(
    "normal",
    corpusNormalList
  );


  renderSectionList(
    "intimate",
    corpusIntimateList
  );


  renderSectionList(
    "adult",
    corpusAdultList
  );


  renderExtraControls();


  /*
    如果无限循环已经建立，
    更新两端复制页，
    避免复制页显示旧的 ON / OFF 状态。
  */

  syncCorpusLoopClones();

}



/* =========================
   开关面板
   ========================= */

function openCorpusKeyboard() {

  closeMorePanel();


  chatInput.blur();


  corpusKeyboardPanel.hidden =
    false;


  renderCorpusKeyboard();


  /*
    第一次真正打开时，
    HTML 此时才有可计算的宽度。

    所以在这里把位置放到
    第一张“真实页”。
  */

  requestAnimationFrame(
    function () {

      requestAnimationFrame(
        function () {

          ensureCorpusLoopPosition();

          updateCorpusPagePosition();

        }
      );

    }
  );

}


function closeCorpusKeyboard() {

  /*
    如果刚好停在循环复制页，
    关闭之前先无动画归位。
  */

  settleCorpusLoopPosition();


  corpusKeyboardPanel.hidden =
    true;

}



/* =========================
   无限循环
   ========================= */

/*
  实际 DOM 会变成：

  [暗号复制页]
  [预设]
  [日常]
  [亲密]
  [情欲]
  [快捷用语]
  [暗号]
  [预设复制页]

  用户视觉上仍然只有六页。
*/

const CORPUS_REAL_PAGE_COUNT =
  CORPUS_PAGE_LABELS.length;


let corpusLoopReady =
  false;


let corpusLoopHasPosition =
  false;


let corpusLoopScrollTimer =
  null;



/* =========================
   取得六张真实页面
   ========================= */

function getCorpusRealPages() {

  return Array.from(
    corpusKeyboardPages
      .querySelectorAll(
        ".corpus-keyboard-page:not(.corpus-loop-clone)"
      )
  );

}



/* =========================
   制作循环复制页
   ========================= */

function createCorpusLoopClone(
  page
) {

  const clone =
    page.cloneNode(
      true
    );


  clone.classList.add(
    "corpus-loop-clone"
  );


  clone.setAttribute(
    "aria-hidden",
    "true"
  );


  /*
    复制页不能保留原来的 id，
    否则一个页面里会出现重复 id。
  */

  clone
    .querySelectorAll(
      "[id]"
    )
    .forEach(
      function (element) {

        element.removeAttribute(
          "id"
        );

      }
    );


  return clone;

}



/* =========================
   建立首尾循环
   ========================= */

function buildCorpusInfiniteLoop() {

  /*
    先删掉旧复制页。
  */

  corpusKeyboardPages
    .querySelectorAll(
      ".corpus-loop-clone"
    )
    .forEach(
      function (clone) {

        clone.remove();

      }
    );


  const pages =
    getCorpusRealPages();


  if (
    pages.length !==
    CORPUS_REAL_PAGE_COUNT
  ) {

    return;

  }


  const firstPage =
    pages[0];


  const lastPage =
    pages[
      pages.length - 1
    ];


  const lastClone =
    createCorpusLoopClone(
      lastPage
    );


  const firstClone =
    createCorpusLoopClone(
      firstPage
    );


  corpusKeyboardPages.prepend(
    lastClone
  );


  corpusKeyboardPages.appendChild(
    firstClone
  );


  corpusLoopReady =
    true;

}



/* =========================
   当前逻辑页码
   0 = 预设
   5 = 暗号
   ========================= */

function getCorpusLogicalPageIndex() {

  const width =
    corpusKeyboardPages
      .clientWidth;


  if (!width) {

    return 0;

  }


  /*
    无限循环建立以后，
    物理页码会比逻辑页码多 1。
  */

  if (corpusLoopReady) {

    const physicalIndex =
      Math.round(
        corpusKeyboardPages
          .scrollLeft /
        width
      );


    /*
      最左边复制的是“暗号”。
    */

    if (
      physicalIndex ===
      0
    ) {

      return (
        CORPUS_REAL_PAGE_COUNT -
        1
      );

    }


    /*
      最右边复制的是“预设”。
    */

    if (
      physicalIndex ===
      CORPUS_REAL_PAGE_COUNT +
      1
    ) {

      return 0;

    }


    return Math.max(
      0,
      Math.min(
        CORPUS_REAL_PAGE_COUNT -
          1,

        physicalIndex -
          1
      )
    );

  }


  /*
    尚未建立循环时，
    按普通六页计算。
  */

  return Math.max(
    0,
    Math.min(
      CORPUS_REAL_PAGE_COUNT -
        1,

      Math.round(
        corpusKeyboardPages
          .scrollLeft /
        width
      )
    )
  );

}



/* =========================
   更新循环两端复制页
   ========================= */

function syncCorpusLoopClones() {

  if (!corpusLoopReady) {

    return;

  }


  /*
    记住用户当前在哪一页。
  */

  const logicalIndex =
    getCorpusLogicalPageIndex();


  corpusKeyboardPages
    .querySelectorAll(
      ".corpus-loop-clone"
    )
    .forEach(
      function (clone) {

        clone.remove();

      }
    );


  const pages =
    getCorpusRealPages();


  if (
    pages.length !==
    CORPUS_REAL_PAGE_COUNT
  ) {

    return;

  }


  corpusKeyboardPages.prepend(
    createCorpusLoopClone(
      pages[
        pages.length - 1
      ]
    )
  );


  corpusKeyboardPages.appendChild(
    createCorpusLoopClone(
      pages[0]
    )
  );


  const width =
    corpusKeyboardPages
      .clientWidth;


  if (width) {

    corpusKeyboardPages.scrollTo({

      left:
        (
          logicalIndex +
          1
        ) *
        width,

      behavior:
        "auto"

    });

  }

}



/* =========================
   第一次打开定位
   ========================= */

function ensureCorpusLoopPosition() {

  if (
    !corpusLoopReady
  ) {

    return;

  }


  const width =
    corpusKeyboardPages
      .clientWidth;


  if (!width) {

    return;

  }


  /*
    第一次打开：
    从最左复制页跳到
    第一张真实“预设”页。
  */

  if (
    !corpusLoopHasPosition
  ) {

    corpusKeyboardPages.scrollTo({

      left:
        width,

      behavior:
        "auto"

    });


    corpusLoopHasPosition =
      true;

  }

}



/* =========================
   到达复制页后无缝归位
   ========================= */

function settleCorpusLoopPosition() {

  if (
    !corpusLoopReady
  ) {

    return;

  }


  const width =
    corpusKeyboardPages
      .clientWidth;


  if (!width) {

    return;

  }


  const physicalIndex =
    Math.round(
      corpusKeyboardPages
        .scrollLeft /
      width
    );


  /*
    左端复制页：
    实际显示的是暗号。

    无动画跳到真正的暗号页。
  */

  if (
    physicalIndex ===
    0
  ) {

    corpusKeyboardPages.scrollTo({

      left:
        CORPUS_REAL_PAGE_COUNT *
        width,

      behavior:
        "auto"

    });


    return;

  }


  /*
    右端复制页：
    实际显示的是预设。

    无动画跳到真正的预设页。
  */

  if (
    physicalIndex ===
    CORPUS_REAL_PAGE_COUNT +
    1
  ) {

    corpusKeyboardPages.scrollTo({

      left:
        width,

      behavior:
        "auto"

    });

  }

}



/* =========================
   分页圆点
   ========================= */

function buildCorpusPageDots() {

  corpusPageDots.innerHTML =
    "";


  CORPUS_PAGE_LABELS.forEach(
    function (
      label,
      index
    ) {

      const dot =
        document.createElement(
          "button"
        );


      dot.type =
        "button";


      dot.className =
        "corpus-page-dot";


      if (
        index ===
        0
      ) {

        dot.classList.add(
          "active"
        );

      }


      dot.setAttribute(
        "aria-label",
        label
      );


      /*
        点击圆点：
        无限循环模式下，
        第一张真实页从物理页 1 开始。
      */

      dot.addEventListener(
        "click",
        function () {

          const width =
            corpusKeyboardPages
              .clientWidth;


          if (!width) {

            return;

          }


          corpusKeyboardPages.scrollTo({

            left:
              width *
              (
                index +
                (
                  corpusLoopReady
                    ? 1
                    : 0
                )
              ),

            behavior:
              "smooth"

          });

        }
      );


      corpusPageDots.appendChild(
        dot
      );

    }
  );

}



/* =========================
   更新圆点与文字
   ========================= */

function updateCorpusPagePosition() {

  const pageIndex =
    getCorpusLogicalPageIndex();


  corpusPageDots
    .querySelectorAll(
      ".corpus-page-dot"
    )
    .forEach(
      function (
        dot,
        index
      ) {

        dot.classList.toggle(
          "active",
          index ===
            pageIndex
        );

      }
    );


  corpusPageLabel.textContent =
    `${pageIndex + 1} / ${
      CORPUS_PAGE_LABELS.length
    } · ${
      CORPUS_PAGE_LABELS[
        pageIndex
      ]
    }`;

}



/* =========================
   滑动处理
   ========================= */

function handleCorpusPageScroll() {

  updateCorpusPagePosition();


  /*
    用户还在滑时不跳。

    停下来一小会儿以后，
    如果位于复制页，
    再悄悄切回真正页面。
  */

  if (
    corpusLoopScrollTimer !==
    null
  ) {

    clearTimeout(
      corpusLoopScrollTimer
    );

  }


  corpusLoopScrollTimer =
    setTimeout(
      function () {

        corpusLoopScrollTimer =
          null;


        settleCorpusLoopPosition();

        updateCorpusPagePosition();

      },
      90
    );

}



/* =========================
   Events
   ========================= */


corpusPoolButton.addEventListener(
  "pointerdown",
  function (event) {

    event.preventDefault();

    event.stopPropagation();


    openCorpusKeyboard();

  },
  true
);


corpusKeyboardClose.addEventListener(
  "click",
  closeCorpusKeyboard
);


corpusKeyboardPanel.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      corpusKeyboardPanel
    ) {

      closeCorpusKeyboard();

    }

  }
);


corpusKeyboardPages.addEventListener(
  "scroll",
  handleCorpusPageScroll
);


document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
        "Escape" &&
      !corpusKeyboardPanel.hidden
    ) {

      closeCorpusKeyboard();

    }

  }
);



/* =========================
   Init
   ========================= */

buildCorpusPageDots();


renderCorpusKeyboard();


buildCorpusInfiniteLoop();


updateCorpusPagePosition();