(function () {
  "use strict";

  const tarotData = window.LiminalTarotData;
  const studyData = window.TAROT_STUDY;
  const validation = window.LiminalTarotStudyValidation;
  const deck = tarotData && Array.isArray(tarotData.cards) ? tarotData.cards : [];
  const cardById = new Map(deck.map(function (card) { return [card.id, card]; }));

  const ARRAY_FIELDS = [
    "coreKeywords", "coreImage", "visualNotes", "person", "emotion", "action",
    "relationship", "reality", "shadow", "reversedKeywords", "reversedHints"
  ];
  const SECTION_DEFINITIONS = [
    ["coreKeywords", "核心关键词", "keywords"],
    ["coreImage", "核心意象", "list"],
    ["visualNotes", "牌面观察", "list"],
    ["person", "人物侧", "list"],
    ["emotion", "情感侧", "list"],
    ["action", "行动侧", "list"],
    ["relationship", "关系侧", "list"],
    ["reality", "现实侧", "list"],
    ["shadow", "阴影面", "list"],
    ["reversedHints", "逆位提示", "list"]
  ];
  const FILTERS = [
    { id: "all", label: "全部", note: "78 张牌共同组成一套相互关联的象征语言。" },
    { id: "major", label: "大阿卡纳", note: "人生主题 · 原型 · 阶段变化 · 深层结构" },
    { id: "wands", label: "权杖", note: "行动 · 动力 · 创造 · 欲望" },
    { id: "cups", label: "圣杯", note: "情绪 · 关系 · 感受 · 连接" },
    { id: "swords", label: "宝剑", note: "思维 · 判断 · 沟通 · 冲突" },
    { id: "pentacles", label: "星币", note: "现实 · 资源 · 身体 · 工作" }
  ];
  const SUIT_LABELS = { wands: "权杖", cups: "圣杯", swords: "宝剑", pentacles: "星币" };
  const RANK_LABELS = {
    ace: "Ace", two: "数字 2", three: "数字 3", four: "数字 4", five: "数字 5",
    six: "数字 6", seven: "数字 7", eight: "数字 8", nine: "数字 9", ten: "数字 10",
    page: "侍从", knight: "骑士", queen: "皇后", king: "国王"
  };
  const COURT_RANKS = new Set(["page", "knight", "queen", "king"]);

  const dataReady = Boolean(
    tarotData && studyData && validation && validation.complete && deck.length === 78
  );

  function normalizeSearch(value) {
    return String(value || "").trim().toLocaleLowerCase();
  }

  function getCardRankId(card) {
    if (!card || card.arcana !== "minor") return "";
    return card.id.slice(card.suit.length + 1);
  }

  function getStructureParts(card) {
    if (card.arcana === "major") {
      return ["大阿卡纳", card.number];
    }
    const rankId = getCardRankId(card);
    const parts = ["小阿卡纳", SUIT_LABELS[card.suit] || card.suit];
    if (COURT_RANKS.has(rankId)) parts.push("宫廷牌");
    parts.push(RANK_LABELS[rankId] || card.number);
    return parts;
  }

  function getSearchText(card) {
    const entry = studyData[card.id];
    const fields = [
      card.nameZh,
      card.nameEn,
      card.arcana === "major" ? "大阿卡纳 major arcana" : "小阿卡纳 minor arcana",
      SUIT_LABELS[card.suit] || "",
      card.suit || "",
      getStructureParts(card).join(" "),
      entry.uprightSummary,
      entry.reversedSummary
    ];
    ARRAY_FIELDS.forEach(function (field) {
      fields.push(entry[field].join(" "));
    });
    return normalizeSearch(fields.join(" "));
  }

  function matchesFilter(card, filterId) {
    if (filterId === "all") return true;
    if (filterId === "major") return card.arcana === "major";
    return card.suit === filterId;
  }

  function findCards(query, filterId) {
    const needle = normalizeSearch(query);
    return deck.filter(function (card) {
      return matchesFilter(card, filterId || "all") && (!needle || getSearchText(card).includes(needle));
    });
  }

  function createFaceArt(card, className) {
    const visual = document.createElement("div");
    visual.className = className || "study-card-visual";
    visual.setAttribute("aria-hidden", "true");
    const art = document.createElement("span");
    art.className = "tarot-face-art";
    const number = document.createElement("span");
    number.className = "face-number";
    number.textContent = card.number;
    const symbol = document.createElement("span");
    symbol.className = "face-symbol";
    symbol.textContent = card.symbol;
    const nameZh = document.createElement("span");
    nameZh.className = "face-name-zh";
    nameZh.textContent = card.nameZh;
    const nameEn = document.createElement("span");
    nameEn.className = "face-name-en";
    nameEn.textContent = card.nameEn;
    art.append(number, symbol, nameZh, nameEn);
    visual.appendChild(art);
    return visual;
  }

  function createStudyListCard(card) {
    const entry = studyData[card.id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "study-card-item";
    button.dataset.studyCardId = card.id;
    button.dataset.studySource = "library";
    button.setAttribute("aria-label", "学习" + card.nameZh + "，" + card.nameEn);

    const visual = createFaceArt(card);
    const text = document.createElement("span");
    text.className = "study-card-text";
    const zh = document.createElement("strong");
    zh.textContent = card.nameZh;
    const en = document.createElement("span");
    en.className = "study-card-en";
    en.textContent = card.nameEn;
    const structure = document.createElement("span");
    structure.className = "study-card-structure";
    structure.textContent = getStructureParts(card).slice(1).join(" · ");
    const keywords = document.createElement("span");
    keywords.className = "study-card-keywords";
    keywords.textContent = entry.coreKeywords.slice(0, 3).join(" · ");
    text.append(zh, en, structure, keywords);
    button.append(visual, text);
    return button;
  }

  function createDetailSection(field, label, displayType, values) {
    if (!Array.isArray(values) || values.length === 0) return null;
    const section = document.createElement("section");
    section.className = "study-meaning-section study-meaning-" + field;
    const heading = document.createElement("h3");
    heading.textContent = label;
    section.appendChild(heading);

    if (displayType === "keywords") {
      const list = document.createElement("div");
      list.className = "study-keyword-list";
      values.forEach(function (value) {
        const item = document.createElement("span");
        item.textContent = value;
        list.appendChild(item);
      });
      section.appendChild(list);
      return section;
    }

    const list = document.createElement("ul");
    values.forEach(function (value) {
      const item = document.createElement("li");
      item.textContent = value;
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }

  function createStudyDetail(cardId) {
    const card = cardById.get(cardId);
    const entry = studyData && studyData[cardId];
    if (!card || !entry) return null;

    const fragment = document.createDocumentFragment();
    const hero = document.createElement("section");
    hero.className = "study-detail-hero";
    hero.appendChild(createFaceArt(card, "study-detail-visual"));

    const identity = document.createElement("div");
    identity.className = "study-detail-identity";
    const kicker = document.createElement("p");
    kicker.className = "study-detail-arcana";
    kicker.textContent = getStructureParts(card).join(" · ");
    const title = document.createElement("h2");
    title.textContent = card.nameZh;
    const english = document.createElement("p");
    english.className = "study-detail-en";
    english.textContent = card.nameEn;
    const summary = document.createElement("p");
    summary.className = "study-detail-summary";
    summary.textContent = entry.uprightSummary;
    identity.append(kicker, title, english, summary);
    hero.appendChild(identity);
    fragment.appendChild(hero);

    const meanings = document.createElement("div");
    meanings.className = "study-meaning-space";
    SECTION_DEFINITIONS.forEach(function (definition) {
      const section = createDetailSection(definition[0], definition[1], definition[2], entry[definition[0]]);
      if (section) meanings.appendChild(section);
    });

    if (entry.reversedSummary || entry.reversedKeywords.length) {
      const reversed = document.createElement("section");
      reversed.className = "study-reversed-summary";
      const label = document.createElement("p");
      label.textContent = "失衡 / 受阻时";
      if (entry.reversedKeywords.length) {
        const keywords = document.createElement("div");
        keywords.className = "study-keyword-list";
        entry.reversedKeywords.forEach(function (value) {
          const item = document.createElement("span");
          item.textContent = value;
          keywords.appendChild(item);
        });
        reversed.append(label, keywords);
      } else {
        reversed.appendChild(label);
      }
      if (entry.reversedSummary) {
        const text = document.createElement("p");
        text.className = "study-reversed-copy";
        text.textContent = entry.reversedSummary;
        reversed.appendChild(text);
      }
      meanings.appendChild(reversed);
    }

    const contextNote = document.createElement("aside");
    contextNote.className = "study-context-note";
    contextNote.textContent = "这些方向不是固定事件结论。请结合问题、牌位、周围其他牌、正逆位与实际语境理解。";
    meanings.appendChild(contextNote);
    fragment.appendChild(meanings);
    return fragment;
  }

  function decorate(root) {
    if (window.LiminalInteraction && typeof window.LiminalInteraction.decorate === "function") {
      window.LiminalInteraction.decorate(root);
    }
  }

  const standaloneApp = document.getElementById("tarotStudyApp");
  const libraryView = document.getElementById("tarotStudyLibraryView");
  const detailView = document.getElementById("tarotStudyDetailView");
  const detailContainer = document.getElementById("tarotStudyDetail");
  const detailTitle = document.getElementById("tarotStudyDetailTitle");
  const searchInput = document.getElementById("tarotStudySearch");
  const filtersContainer = document.getElementById("tarotStudyFilters");
  const suitNote = document.getElementById("tarotStudySuitNote");
  const countLabel = document.getElementById("tarotStudyCount");
  const grid = document.getElementById("tarotStudyGrid");
  const empty = document.getElementById("tarotStudyEmpty");
  const loadError = document.getElementById("tarotStudyError");
  let activeFilter = "all";

  function renderFilters() {
    if (!filtersContainer) return;
    const fragment = document.createDocumentFragment();
    FILTERS.forEach(function (filter) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "study-filter";
      button.dataset.studyFilter = filter.id;
      button.textContent = filter.label;
      button.classList.toggle("is-active", filter.id === activeFilter);
      button.setAttribute("aria-pressed", filter.id === activeFilter ? "true" : "false");
      fragment.appendChild(button);
    });
    filtersContainer.replaceChildren(fragment);
    decorate(filtersContainer);
  }

  function renderLibrary() {
    if (!grid) return;
    const query = searchInput ? searchInput.value : "";
    const matches = findCards(query, activeFilter);
    const fragment = document.createDocumentFragment();
    matches.forEach(function (card) { fragment.appendChild(createStudyListCard(card)); });
    grid.replaceChildren(fragment);
    countLabel.textContent = matches.length + " 张牌";
    empty.hidden = matches.length !== 0;
    const currentFilter = FILTERS.find(function (filter) { return filter.id === activeFilter; });
    suitNote.textContent = currentFilter ? currentFilter.note : "";
    decorate(grid);
  }

  function updateStandaloneUrl(cardId, method) {
    const url = new URL(window.location.href);
    if (cardId) url.searchParams.set("card", cardId);
    else url.searchParams.delete("card");
    window.history[method || "pushState"]({ tarotStudyCardId: cardId || null }, "", url.pathname + url.search + url.hash);
  }

  function showStandaloneDetail(cardId, options) {
    const card = cardById.get(cardId);
    const content = createStudyDetail(cardId);
    if (!card || !content || !libraryView || !detailView || !detailContainer) return false;
    detailContainer.replaceChildren(content);
    detailTitle.textContent = card.nameZh;
    libraryView.hidden = true;
    detailView.hidden = false;
    document.title = card.nameZh + " · 塔罗学习 · Liminal";
    window.scrollTo({ top: 0, behavior: options && options.instant ? "auto" : "smooth" });
    if (!options || options.updateUrl !== false) updateStandaloneUrl(cardId, "pushState");
    decorate(detailView);
    return true;
  }

  function showStandaloneLibrary(options) {
    if (!libraryView || !detailView) return;
    detailView.hidden = true;
    libraryView.hidden = false;
    document.title = "塔罗学习 · Liminal";
    if (!options || options.updateUrl !== false) updateStandaloneUrl(null, "pushState");
    if (!options || options.scroll !== false) window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (standaloneApp) {
    if (!dataReady) {
      if (libraryView) libraryView.hidden = true;
      if (detailView) detailView.hidden = true;
      if (loadError) loadError.hidden = false;
      console.error("[Liminal Tarot Study] Complete 78-card study data is required.", validation);
    } else {
      renderFilters();
      renderLibrary();
      if (searchInput) {
        searchInput.addEventListener("input", renderLibrary);
      }
      const initialCardId = new URL(window.location.href).searchParams.get("card");
      if (initialCardId && cardById.has(initialCardId)) {
        showStandaloneDetail(initialCardId, { updateUrl: false, instant: true });
        window.history.replaceState({ tarotStudyCardId: initialCardId }, "", window.location.href);
      } else {
        window.history.replaceState({ tarotStudyCardId: null }, "", window.location.href);
      }
      window.addEventListener("popstate", function () {
        const cardId = new URL(window.location.href).searchParams.get("card");
        if (cardId && cardById.has(cardId)) showStandaloneDetail(cardId, { updateUrl: false, instant: true });
        else showStandaloneLibrary({ updateUrl: false });
      });
    }
  }

  const overlay = document.querySelector("[data-tarot-study-overlay]");
  const overlayDetail = overlay && overlay.querySelector("[data-study-overlay-detail]");
  const overlayTitle = overlay && overlay.querySelector("[data-study-overlay-title]");

  function openOverlay(cardId) {
    if (!dataReady || !overlay || !overlayDetail) return false;
    const card = cardById.get(cardId);
    const content = createStudyDetail(cardId);
    if (!card || !content) return false;
    overlayDetail.replaceChildren(content);
    if (overlayTitle) overlayTitle.textContent = card.nameZh;
    overlay.hidden = false;
    document.body.classList.add("is-study-open");
    overlay.querySelector(".tarot-study-overlay-panel").scrollTop = 0;
    const closeButton = overlay.querySelector('[data-study-action="close-overlay"]');
    if (closeButton) closeButton.focus({ preventScroll: true });
    decorate(overlay);
    return true;
  }

  function closeOverlay() {
    if (!overlay || overlay.hidden) return;
    const source = overlay.dataset.returnFocusId;
    overlay.hidden = true;
    document.body.classList.remove("is-study-open");
    overlayDetail.replaceChildren();
    if (source) {
      const control = document.querySelector('[data-study-focus-id="' + source + '"]');
      if (control) control.focus({ preventScroll: true });
    }
    delete overlay.dataset.returnFocusId;
  }

  document.addEventListener("click", function (event) {
    const filterButton = event.target.closest("[data-study-filter]");
    if (filterButton && filtersContainer && filtersContainer.contains(filterButton)) {
      activeFilter = filterButton.dataset.studyFilter;
      renderFilters();
      renderLibrary();
      return;
    }

    const action = event.target.closest("[data-study-action]");
    if (action) {
      if (action.dataset.studyAction === "back-library") {
        showStandaloneLibrary();
      } else if (action.dataset.studyAction === "close-overlay") {
        closeOverlay();
      }
      return;
    }

    const cardControl = event.target.closest("[data-study-card-id]");
    if (!cardControl) return;
    const cardId = cardControl.dataset.studyCardId;
    if (cardControl.dataset.studySource === "library" && standaloneApp) {
      showStandaloneDetail(cardId);
      return;
    }
    if (overlay) {
      const focusId = cardControl.dataset.studyFocusId || ("study-focus-" + Date.now());
      cardControl.dataset.studyFocusId = focusId;
      overlay.dataset.returnFocusId = focusId;
      openOverlay(cardId);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && overlay && !overlay.hidden) closeOverlay();
  });

  window.LiminalTarotStudy = Object.freeze({
    validation: validation || null,
    getCard: function (cardId) {
      const card = cardById.get(cardId);
      return card && studyData[cardId] ? { card: card, study: studyData[cardId] } : null;
    },
    search: function (query, filterId) { return findCards(query, filterId).slice(); },
    open: openOverlay,
    close: closeOverlay
  });
})();
