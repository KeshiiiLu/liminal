(function () {
  "use strict";

  const tarotData = window.LiminalTarotData;
  const studyData = window.TAROT_STUDY;
  const studyValidation = window.LiminalTarotStudyValidation;
  const historyStore = window.LiminalTarotHistory;
  const app = document.getElementById("tarotApp");

  if (
    !app ||
    !tarotData ||
    !Array.isArray(tarotData.cards) ||
    tarotData.cards.length !== 78 ||
    !studyData ||
    !studyValidation ||
    !studyValidation.complete ||
    !historyStore
  ) {
    if (app) {
      app.innerHTML = '<section class="tarot-stage is-active"><p>Tarot 所需数据未能完整加载。</p></section>';
    }
    console.error("[Liminal Tarot] A complete deck, study library, and history store are required.");
    return;
  }

  const TAROT_PEOPLE = Object.freeze({
    luzhen: Object.freeze({
      id: "luzhen",
      name: "陆榛",
      alias: "榛榛"
    }),
    jasper: Object.freeze({
      id: "jasper",
      name: "Jasper",
      alias: ""
    })
  });

  const TAROT_MODES = Object.freeze({
    daily_guidance: Object.freeze({
      modeId: "daily_guidance",
      modeName: "今日指引",
      cardCount: 1,
      summary: "今日指引",
      positions: Object.freeze([
        Object.freeze({ id: "daily_guidance", name: "今日指引" })
      ])
    }),
    daily_reading: Object.freeze({
      modeId: "daily_reading",
      modeName: "今日运势",
      cardCount: 3,
      summary: "基调 · 留意 · 可以利用",
      positions: Object.freeze([
        Object.freeze({ id: "daily_tone", name: "今日基调" }),
        Object.freeze({ id: "daily_attention", name: "值得留意" }),
        Object.freeze({ id: "daily_resource", name: "可以利用" })
      ])
    }),
    weekly_reading: Object.freeze({
      modeId: "weekly_reading",
      modeName: "本周运势",
      cardCount: 5,
      summary: "主线 · 内在 · 行动 · 关系 · 留意",
      positions: Object.freeze([
        Object.freeze({ id: "weekly_theme", name: "本周主线" }),
        Object.freeze({ id: "weekly_inner", name: "情绪与内在" }),
        Object.freeze({ id: "weekly_action", name: "现实与行动" }),
        Object.freeze({ id: "weekly_relationship", name: "关系与互动" }),
        Object.freeze({ id: "weekly_attention", name: "值得留意" })
      ])
    }),
    person_state: Object.freeze({
      modeId: "person_state",
      modeName: "Ta 的状态",
      cardCount: 3,
      summary: "表层 · 内在 · 关注点",
      positions: Object.freeze([
        Object.freeze({ id: "surface_state", name: "表层状态" }),
        Object.freeze({ id: "inner_state", name: "内在状态" }),
        Object.freeze({ id: "current_focus", name: "当前关注点" })
      ])
    }),
    self_state: Object.freeze({
      modeId: "self_state",
      modeName: "我的状态",
      cardCount: 3,
      summary: "表层 · 内在 · 关注点",
      positions: Object.freeze([
        Object.freeze({ id: "surface_state", name: "表层状态" }),
        Object.freeze({ id: "inner_state", name: "内在状态" }),
        Object.freeze({ id: "current_focus", name: "当前关注点" })
      ])
    }),
    love_guidance: Object.freeze({
      modeId: "love_guidance",
      modeName: "爱情指引",
      cardCount: 5,
      summary: "我 · 对方 · 关系 · 阻碍 · 建议",
      positions: Object.freeze([
        Object.freeze({ id: "self", name: "我" }),
        Object.freeze({ id: "other", name: "对方" }),
        Object.freeze({ id: "relationship", name: "关系" }),
        Object.freeze({ id: "obstacle", name: "阻碍" }),
        Object.freeze({ id: "advice", name: "建议" })
      ])
    }),
    single_response: Object.freeze({
      modeId: "single_response",
      modeName: "单张回应",
      cardCount: 1,
      summary: "回应牌",
      positions: Object.freeze([
        Object.freeze({ id: "response", name: "回应牌" })
      ])
    }),
    triple_supplement: Object.freeze({
      modeId: "triple_supplement",
      modeName: "三张补充",
      cardCount: 3,
      summary: "补充 1 · 补充 2 · 补充 3",
      positions: Object.freeze([
        Object.freeze({ id: "supplement_1", name: "补充 1" }),
        Object.freeze({ id: "supplement_2", name: "补充 2" }),
        Object.freeze({ id: "supplement_3", name: "补充 3" })
      ])
    })
  });

  const TAROT_MODE_GROUPS = Object.freeze([
    Object.freeze({ label: "TODAY", modes: Object.freeze(["daily_guidance", "daily_reading", "weekly_reading"]) }),
    Object.freeze({ label: "STATE", modes: Object.freeze(["person_state", "self_state"]) }),
    Object.freeze({ label: "RELATIONSHIP", modes: Object.freeze(["love_guidance"]) }),
    Object.freeze({ label: "QUESTION", modes: Object.freeze(["single_response", "triple_supplement"]) })
  ]);

  const SOURCE_LABELS = Object.freeze({
    tarot_app: "完整 Tarot",
    chat_quick_tarot: "聊天快捷抽牌"
  });

  window.LiminalTarotModes = TAROT_MODES;

  const stages = new Map(
    Array.from(document.querySelectorAll("[data-stage]")).map(function (element) {
      return [element.dataset.stage, element];
    })
  );

  const dom = {
    frequencyStage: stages.get("frequency"),
    frequencyButton: document.getElementById("frequencyButton"),
    frequencyStatus: document.getElementById("frequencyStatus"),
    modeSections: document.getElementById("tarotModeSections"),
    questionTitle: document.getElementById("questionTitle"),
    questionInput: document.getElementById("tarotQuestion"),
    questionHistoryButton: document.getElementById("questionHistoryButton"),
    personField: document.getElementById("tarotPersonField"),
    personSelect: document.getElementById("tarotPerson"),
    startShuffleButton: document.getElementById("startShuffleButton"),
    shuffleTitle: document.getElementById("shuffleTitle"),
    shuffleTable: document.getElementById("shuffleTable"),
    scatterDeck: document.getElementById("scatterDeck"),
    scatterButton: document.getElementById("scatterButton"),
    rotateButton: document.getElementById("rotateButton"),
    shuffleWhisper: document.getElementById("shuffleWhisper"),
    readyButton: document.getElementById("readyButton"),
    selectTitle: document.getElementById("selectTitle"),
    selectionCount: document.getElementById("selectionCount"),
    fanArea: document.getElementById("fanArea"),
    fanDeck: document.getElementById("fanDeck"),
    drawStatus: document.getElementById("drawStatus"),
    drawnPreview: document.getElementById("drawnPreview"),
    resultTitle: document.getElementById("resultTitle"),
    resultInstruction: document.getElementById("resultInstruction"),
    resultCards: document.getElementById("resultCards"),
    restartButton: document.getElementById("restartButton"),
    historyTitle: document.getElementById("historyTitle"),
    historyFilters: document.getElementById("historyFilters"),
    historyList: document.getElementById("historyList"),
    historyEmpty: document.getElementById("historyEmpty"),
    historyDetailTitle: document.getElementById("historyDetailTitle"),
    historyDetail: document.getElementById("historyDetail"),
    deleteConfirm: document.getElementById("tarotDeleteConfirm"),
    confirmDeleteButton: document.getElementById("confirmDeleteButton")
  };

  // Correct two historical/alternative IDs without making the DOM depend on them.
  dom.readyButton = document.getElementById("readyButton") || document.getElementById("shuffleReadyButton") || document.getElementById("washReadyButton") || document.getElementById("finishShuffleButton");
  dom.restartButton = document.getElementById("restartButton") || document.getElementById("restartDrawButton") || document.getElementById("restartReadingButton");

  const state = {
    stage: "frequency",
    frequencyReady: false,
    mode: null,
    requiredCount: 1,
    question: "",
    personId: null,
    personName: null,
    deck: [],
    drawCursor: 0,
    draws: [],
    drawLocked: false,
    scatterCount: 0,
    rotationCount: 0,
    gameSerial: 0,
    savedReadingId: null,
    historyScopeModeId: null,
    historyFilter: "all",
    historyReturnStage: "home",
    selectedHistoryId: null,
    pendingDeleteId: null
  };

  const timers = new Set();
  let scatterFrame = 0;
  let rotateTimer = 0;
  let resizeFrame = 0;

  function schedule(callback, delay) {
    const timer = window.setTimeout(function () {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  }

  function clearTimers() {
    timers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    timers.clear();
    if (scatterFrame) {
      window.cancelAnimationFrame(scatterFrame);
      scatterFrame = 0;
    }
    if (rotateTimer) {
      window.clearTimeout(rotateTimer);
      rotateTimer = 0;
    }
  }

  function randomInteger(maxExclusive) {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new RangeError("maxExclusive must be a positive integer");
    }

    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const range = 0x100000000;
      const limit = Math.floor(range / maxExclusive) * maxExclusive;
      const buffer = new Uint32Array(1);
      let value;
      do {
        window.crypto.getRandomValues(buffer);
        value = buffer[0];
      } while (value >= limit);
      return value % maxExclusive;
    }

    return Math.floor(Math.random() * maxExclusive);
  }

  function shuffledCopy(items) {
    const shuffled = items.slice();
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = randomInteger(index + 1);
      const current = shuffled[index];
      shuffled[index] = shuffled[target];
      shuffled[target] = current;
    }
    return shuffled;
  }

  function buildFreshDeck() {
    const deck = tarotData.cards.map(function (card) {
      return Object.freeze({
        card: card,
        reversed: randomInteger(2) === 1
      });
    });
    return shuffledCopy(deck);
  }

  function getMode(modeId) {
    return TAROT_MODES[modeId] || null;
  }

  function getCurrentMode() {
    return getMode(state.mode);
  }

  function getPerson(personId) {
    return TAROT_PEOPLE[personId] || null;
  }

  function cardCountLabel(count) {
    const labels = {
      1: "一张牌",
      3: "三张牌",
      5: "五张牌"
    };
    return labels[count] || String(count) + " 张牌";
  }

  function renderModeHome() {
    const sections = document.createDocumentFragment();

    TAROT_MODE_GROUPS.forEach(function (group, groupIndex) {
      const section = document.createElement("section");
      section.className = "mode-group";
      const labelId = "tarotModeGroup" + String(groupIndex + 1);
      section.setAttribute("aria-labelledby", labelId);

      const label = document.createElement("p");
      label.className = "mode-group-label";
      label.id = labelId;
      label.textContent = group.label;

      const grid = document.createElement("div");
      grid.className = "mode-grid";

      group.modes.forEach(function (modeId, modeIndex) {
        const mode = getMode(modeId);
        if (!mode) {
          return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "mode-card";
        if (groupIndex === 0 && modeIndex === 0) {
          button.classList.add("mode-card-primary");
        }
        button.dataset.mode = mode.modeId;

        const index = document.createElement("span");
        index.className = "mode-index";
        index.textContent = cardCountLabel(mode.cardCount);

        const title = document.createElement("span");
        title.className = "mode-title";
        title.textContent = mode.modeName;

        const copy = document.createElement("span");
        copy.className = "mode-copy";
        copy.textContent = mode.summary;

        const arrow = document.createElement("span");
        arrow.className = "mode-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";

        button.append(index, title, copy, arrow);
        grid.appendChild(button);
      });

      section.append(label, grid);
      sections.appendChild(section);
    });

    dom.modeSections.replaceChildren(sections);
  }

  function decorateDynamicControls(root) {
    if (
      window.LiminalInteraction &&
      typeof window.LiminalInteraction.decorate === "function"
    ) {
      window.LiminalInteraction.decorate(root);
    }
  }

  function setStage(nextStage) {
    const nextElement = stages.get(nextStage);
    if (!nextElement || nextStage === state.stage && nextElement.classList.contains("is-active")) {
      return;
    }

    clearTimers();
    stages.forEach(function (element, name) {
      element.classList.remove("is-active");
      element.hidden = name !== nextStage;
    });

    state.stage = nextStage;
    document.body.dataset.tarotStage = nextStage;
    nextElement.hidden = false;
    void nextElement.offsetWidth;
    nextElement.classList.add("is-active");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function resetReadingState() {
    state.deck = [];
    state.drawCursor = 0;
    state.draws = [];
    state.drawLocked = false;
    state.scatterCount = 0;
    state.rotationCount = 0;
    state.savedReadingId = null;
    dom.fanDeck.replaceChildren();
    dom.drawnPreview.replaceChildren();
    dom.resultCards.replaceChildren();
  }

  function beginFrequencySequence() {
    if (state.frequencyReady) {
      setStage("home");
      return;
    }

    dom.frequencyButton.disabled = true;
    dom.frequencyStage.classList.add("is-tuning");
    dom.frequencyStatus.textContent = "调整中";

    schedule(function () {
      dom.frequencyStatus.textContent = "正在集中";
    }, 760);

    schedule(function () {
      dom.frequencyStatus.textContent = "准备好了";
      dom.frequencyStage.classList.remove("is-tuning");
      dom.frequencyStage.classList.add("is-ready");
    }, 1640);

    schedule(function () {
      state.frequencyReady = true;
      dom.frequencyButton.textContent = "进入 Tarot";
      dom.frequencyButton.disabled = false;
    }, 2280);
  }

  function selectMode(mode) {
    const modeConfig = getMode(mode);
    if (!modeConfig) {
      return;
    }
    state.mode = modeConfig.modeId;
    state.requiredCount = modeConfig.cardCount;
    state.personId = modeConfig.modeId === "person_state" ? "luzhen" : null;
    state.personName = modeConfig.modeId === "person_state" ? TAROT_PEOPLE.luzhen.name : null;
    dom.questionTitle.textContent = modeConfig.modeName;
    dom.questionInput.value = "";
    dom.personField.hidden = modeConfig.modeId !== "person_state";
    if (modeConfig.modeId === "person_state") {
      dom.personSelect.value = state.personId;
    }
    dom.questionHistoryButton.setAttribute("aria-label", "查看" + modeConfig.modeName + "历史");
    setStage("question");
    schedule(function () {
      dom.questionInput.focus({ preventScroll: true });
    }, 420);
  }

  function beginNewDeck(options) {
    const settings = options || {};
    const mode = getCurrentMode();
    if (!mode) {
      return;
    }
    resetReadingState();
    state.deck = buildFreshDeck();
    state.gameSerial += 1;
    state.question = settings.keepQuestion ? state.question : dom.questionInput.value.trim();
    if (mode.modeId === "person_state") {
      const person = getPerson(dom.personSelect.value) || TAROT_PEOPLE.luzhen;
      state.personId = person.id;
      state.personName = person.name;
    } else {
      state.personId = null;
      state.personName = null;
    }
    dom.shuffleTitle.textContent = mode.cardCount === 1
      ? "让牌慢慢散开"
      : "让" + cardCountLabel(mode.cardCount) + "慢慢散开";
    dom.shuffleWhisper.textContent = "按照自己的节奏，直到你觉得可以了";
    setStage("shuffle");
    ensureScatterCards();
    scatterCards(false);
  }

  function ensureScatterCards() {
    const count = 28;
    if (dom.scatterDeck.children.length === count) {
      return;
    }
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const card = document.createElement("span");
      card.className = "scatter-card tarot-card-back-design";
      fragment.appendChild(card);
    }
    dom.scatterDeck.replaceChildren(fragment);
  }

  function visualRandom(min, max) {
    return min + Math.random() * (max - min);
  }

  function applyScatterPositions() {
    const width = Math.max(240, dom.scatterDeck.clientWidth);
    const height = Math.max(250, dom.scatterDeck.clientHeight);
    const xRange = Math.min(width * 0.41, 330);
    const yRange = Math.min(height * 0.36, 150);

    Array.from(dom.scatterDeck.children).forEach(function (card, index) {
      const distanceBias = index < 5 ? 0.38 : 1;
      const x = visualRandom(-xRange, xRange) * distanceBias;
      const y = visualRandom(-yRange, yRange) * distanceBias;
      card.style.setProperty("--scatter-x", x.toFixed(1) + "px");
      card.style.setProperty("--scatter-y", y.toFixed(1) + "px");
      card.style.setProperty("--scatter-rotate", visualRandom(-27, 27).toFixed(1) + "deg");
      card.style.zIndex = String(index + 1);
    });
  }

  function scatterCards(animate) {
    ensureScatterCards();
    if (scatterFrame) {
      window.cancelAnimationFrame(scatterFrame);
    }
    dom.scatterDeck.classList.remove("is-rotating");
    if (animate !== false) {
      dom.scatterDeck.classList.add("is-gathering");
      void dom.scatterDeck.offsetWidth;
    }
    applyScatterPositions();
    scatterFrame = window.requestAnimationFrame(function () {
      scatterFrame = window.requestAnimationFrame(function () {
        dom.scatterDeck.classList.remove("is-gathering");
        scatterFrame = 0;
      });
    });
    state.scatterCount += 1;
    if (animate !== false) {
      dom.shuffleWhisper.textContent = "牌群重新散开了";
    }
  }

  function rotateCards() {
    if (rotateTimer) {
      window.clearTimeout(rotateTimer);
    }
    dom.scatterDeck.classList.remove("is-gathering", "is-rotating");
    void dom.scatterDeck.offsetWidth;
    applyScatterPositions();
    dom.scatterDeck.classList.add("is-rotating");
    dom.shuffleWhisper.textContent = "让牌群再转动一次";
    state.rotationCount += 1;
    rotateTimer = window.setTimeout(function () {
      dom.scatterDeck.classList.remove("is-rotating");
      rotateTimer = 0;
    }, 840);
  }

  function enterSelection() {
    const mode = getCurrentMode();
    if (!mode) {
      return;
    }
    state.drawCursor = 0;
    state.draws = [];
    state.drawLocked = false;
    dom.drawnPreview.replaceChildren();
    dom.selectTitle.textContent = mode.cardCount === 1
      ? "选择一张牌"
      : "依次选择" + cardCountLabel(mode.cardCount);
    updateSelectionCopy();
    renderFan();
    setStage("select");
    layoutFan();
  }

  function renderFan() {
    const visibleCardCount = 42;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < visibleCardCount; index += 1) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "fan-card tarot-card-back-design";
      card.dataset.visualIndex = String(index);
      card.setAttribute("aria-label", "选择牌堆中的第 " + (index + 1) + " 个位置");
      fragment.appendChild(card);
    }
    dom.fanDeck.replaceChildren(fragment);
  }

  function layoutFan() {
    if (state.stage !== "select") {
      return;
    }
    const cards = Array.from(dom.fanDeck.children);
    const availableWidth = Math.max(250, dom.fanArea.clientWidth - 70);
    const spread = Math.min(650, availableWidth);
    const lastIndex = Math.max(1, cards.length - 1);

    cards.forEach(function (card, index) {
      const normalized = index / lastIndex * 2 - 1;
      const x = normalized * spread * 0.5;
      const rotation = normalized * 27;
      const y = Math.abs(normalized) * 31;
      card.style.setProperty("--fan-x", x.toFixed(2) + "px");
      card.style.setProperty("--fan-y", y.toFixed(2) + "px");
      card.style.setProperty("--fan-rotate", rotation.toFixed(2) + "deg");
      card.style.zIndex = String(index + 1);
    });
  }

  function updateSelectionCopy() {
    dom.selectionCount.textContent = "已选择 " + state.draws.length + " / " + state.requiredCount;
  }

  function setFanDisabled(disabled) {
    Array.from(dom.fanDeck.children).forEach(function (card) {
      card.disabled = disabled || card.classList.contains("is-picked");
    });
  }

  function drawFromPosition(visualCard) {
    if (
      state.stage !== "select" ||
      state.drawLocked ||
      state.draws.length >= state.requiredCount ||
      visualCard.classList.contains("is-picked")
    ) {
      return;
    }

    const drawnCard = state.deck[state.drawCursor];
    if (!drawnCard) {
      console.error("[Liminal Tarot] The current deck has no remaining cards.");
      return;
    }

    state.drawLocked = true;
    state.drawCursor += 1;
    visualCard.classList.add("is-picked");
    setFanDisabled(true);
    dom.drawStatus.textContent = "正在抽取……";

    schedule(function () {
      state.draws.push(drawnCard);
      appendPreviewCard();
      updateSelectionCopy();

      if (state.draws.length >= state.requiredCount) {
        dom.drawStatus.textContent = "已经选好了";
        schedule(showResults, 720);
        return;
      }

      schedule(function () {
        state.drawLocked = false;
        setFanDisabled(false);
        dom.drawStatus.textContent = "继续选择下一张";
      }, 270);
    }, 430);
  }

  function appendPreviewCard() {
    const preview = document.createElement("span");
    preview.className = "preview-card tarot-card-back-design";
    preview.setAttribute("aria-hidden", "true");
    dom.drawnPreview.appendChild(preview);
  }

  function getPositionLabel(index) {
    const mode = getCurrentMode();
    const position = mode && mode.positions[index];
    return position ? position.name : "牌位 " + String(index + 1);
  }

  function getInterpretation(draw) {
    const saved = studyData[draw.card.id];
    const reversedKeywords = saved.reversedKeywords.length ? saved.reversedKeywords : saved.reversedHints;
    return {
      keywords: (draw.reversed ? reversedKeywords : saved.coreKeywords).slice(0, 5),
      hint: draw.reversed ? saved.reversedSummary : saved.uprightSummary
    };
  }

  function createResultCard(draw, index) {
    const interpretation = getInterpretation(draw);
    const wrapper = document.createElement("article");
    wrapper.className = "result-card-wrap";

    const position = document.createElement("p");
    position.className = "result-position";
    position.textContent = getPositionLabel(index);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "result-card" + (draw.reversed ? " is-reversed" : "");
    button.dataset.resultIndex = String(index);
    button.dataset.view = "back";
    button.setAttribute("aria-label", getPositionLabel(index) + "，牌背，点击翻牌");

    const inner = document.createElement("span");
    inner.className = "result-card-inner";

    const back = document.createElement("span");
    back.className = "result-card-panel result-card-back tarot-card-back-design";
    back.setAttribute("aria-hidden", "true");

    const face = document.createElement("span");
    face.className = "result-card-panel result-card-face";
    face.setAttribute("aria-hidden", "true");
    const art = document.createElement("span");
    art.className = "tarot-face-art";
    const number = document.createElement("span");
    number.className = "face-number";
    number.textContent = draw.card.number;
    const symbol = document.createElement("span");
    symbol.className = "face-symbol";
    symbol.textContent = draw.card.symbol;
    const nameZh = document.createElement("span");
    nameZh.className = "face-name-zh";
    nameZh.textContent = draw.card.nameZh;
    const nameEn = document.createElement("span");
    nameEn.className = "face-name-en";
    nameEn.textContent = draw.card.nameEn;
    art.append(number, symbol, nameZh, nameEn);
    face.appendChild(art);
    if (draw.reversed) {
      const orientation = document.createElement("span");
      orientation.className = "orientation-label";
      orientation.textContent = "逆位";
      face.appendChild(orientation);
    }

    const meaning = document.createElement("span");
    meaning.className = "result-card-panel result-card-meaning";
    meaning.setAttribute("aria-hidden", "true");
    const meaningName = document.createElement("strong");
    meaningName.className = "meaning-name";
    meaningName.textContent = draw.card.nameZh;
    const meaningOrientation = document.createElement("span");
    meaningOrientation.className = "meaning-orientation";
    meaningOrientation.textContent = draw.reversed ? "逆位" : "正位";
    const keywordLabel = document.createElement("span");
    keywordLabel.className = "meaning-label";
    keywordLabel.textContent = "核心关键词";
    const keywords = document.createElement("span");
    keywords.className = "meaning-keywords";
    keywords.textContent = interpretation.keywords.join(" · ");
    const hint = document.createElement("span");
    hint.className = "meaning-hint";
    hint.textContent = "提示：" + interpretation.hint;
    meaning.append(meaningName, meaningOrientation, keywordLabel, keywords, hint);

    const studyButton = document.createElement("button");
    studyButton.type = "button";
    studyButton.className = "result-study-button";
    studyButton.dataset.studyCardId = draw.card.id;
    studyButton.dataset.studySource = "reading";
    studyButton.textContent = "查看完整牌义 →";
    studyButton.setAttribute("aria-label", "查看" + draw.card.nameZh + "的完整牌义");

    inner.append(back, face, meaning);
    button.appendChild(inner);
    wrapper.append(position, button, studyButton);
    return wrapper;
  }

  function createReadingSnapshot() {
    const mode = getCurrentMode();
    if (!mode || state.draws.length !== mode.cardCount) {
      return null;
    }

    return {
      modeId: mode.modeId,
      modeName: mode.modeName,
      source: "tarot_app",
      question: state.question,
      personId: mode.modeId === "person_state" ? state.personId : null,
      personName: mode.modeId === "person_state" ? state.personName : null,
      cards: state.draws.map(function (draw, index) {
        const position = mode.positions[index];
        return {
          cardId: draw.card.id,
          nameZh: draw.card.nameZh,
          nameEn: draw.card.nameEn,
          orientation: draw.reversed ? "reversed" : "upright",
          positionId: position.id,
          positionName: position.name
        };
      }),
      createdAt: new Date().toISOString(),
      userNote: ""
    };
  }

  function saveCompletedReading() {
    if (state.savedReadingId) {
      return historyStore.get(state.savedReadingId);
    }
    const snapshot = createReadingSnapshot();
    if (!snapshot) {
      return null;
    }
    const saved = historyStore.add(snapshot);
    if (saved) {
      state.savedReadingId = saved.id;
    }
    return saved;
  }

  function showResults() {
    if (state.stage !== "select" || state.draws.length !== state.requiredCount) {
      return;
    }
    state.drawLocked = false;
    const fragment = document.createDocumentFragment();
    state.draws.forEach(function (draw, index) {
      fragment.appendChild(createResultCard(draw, index));
    });
    dom.resultCards.replaceChildren(fragment);
    dom.resultCards.classList.toggle("is-multiple", state.draws.length > 1);
    dom.resultCards.dataset.cardCount = String(state.draws.length);
    const mode = getCurrentMode();
    dom.resultTitle.textContent = mode ? mode.modeName : "这一次的牌";
    dom.resultInstruction.textContent = "点击牌背查看牌面";
    setStage("result");
    saveCompletedReading();
  }

  function cycleResultCard(cardButton) {
    const index = Number(cardButton.dataset.resultIndex);
    const draw = state.draws[index];
    if (!draw) {
      return;
    }
    const current = cardButton.dataset.view;
    const next = current === "back" ? "face" : current === "face" ? "meaning" : "face";
    cardButton.dataset.view = next;

    if (next === "face") {
      cardButton.setAttribute("aria-label", getPositionLabel(index) + "，" + draw.card.nameZh + "，" + (draw.reversed ? "逆位" : "正位") + "，点击查看释义");
      dom.resultInstruction.textContent = "再次点击牌面查看简短释义";
    } else {
      cardButton.setAttribute("aria-label", getPositionLabel(index) + "，" + draw.card.nameZh + "释义，点击返回牌面");
      dom.resultInstruction.textContent = "点击释义可以回到牌面";
    }
  }

  function formatLocalDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "时间未知";
    }
    function pad(number) {
      return String(number).padStart(2, "0");
    }
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join(".") + " · " + pad(date.getHours()) + ":" + pad(date.getMinutes());
  }

  function getSourceLabel(source) {
    return SOURCE_LABELS[source] || "其他来源";
  }

  function getHistoryReadings() {
    let readings = historyStore.list();
    if (state.historyScopeModeId) {
      readings = readings.filter(function (reading) {
        return reading.modeId === state.historyScopeModeId;
      });
    } else if (state.historyFilter !== "all") {
      readings = readings.filter(function (reading) {
        return reading.modeId === state.historyFilter;
      });
    }
    return readings;
  }

  function renderHistoryFilters() {
    dom.historyFilters.replaceChildren();
    dom.historyFilters.hidden = Boolean(state.historyScopeModeId);
    if (state.historyScopeModeId) {
      return;
    }

    const filters = [
      { id: "all", name: "全部" }
    ].concat(Object.keys(TAROT_MODES).map(function (modeId) {
      return {
        id: modeId,
        name: TAROT_MODES[modeId].modeName
      };
    }));

    const fragment = document.createDocumentFragment();
    filters.forEach(function (filter) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-filter";
      button.classList.toggle("is-active", filter.id === state.historyFilter);
      button.dataset.historyFilter = filter.id;
      button.textContent = filter.name;
      button.setAttribute("aria-pressed", filter.id === state.historyFilter ? "true" : "false");
      fragment.appendChild(button);
    });
    dom.historyFilters.appendChild(fragment);
    decorateDynamicControls(dom.historyFilters);
  }

  function createHistoryRecord(reading) {
    const article = document.createElement("article");
    article.className = "history-record";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "history-record-open";
    openButton.dataset.historyId = reading.id;

    const title = document.createElement("strong");
    title.className = "history-record-title";
    title.textContent = reading.modeName || "Tarot 牌局";

    const time = document.createElement("span");
    time.className = "history-record-time";
    time.textContent = formatLocalDateTime(reading.createdAt);

    const summary = document.createElement("span");
    summary.className = "history-record-summary";
    const summaryParts = [];
    if (reading.personName) {
      summaryParts.push(reading.personName);
    }
    if (reading.question) {
      summaryParts.push("“" + reading.question + "”");
    }
    summary.textContent = summaryParts.length ? summaryParts.join(" · ") : "未填写问题";

    const meta = document.createElement("span");
    meta.className = "history-record-meta";
    const cardCount = Array.isArray(reading.cards) ? reading.cards.length : 0;
    meta.textContent = cardCount + " 张牌 · " + getSourceLabel(reading.source);

    openButton.append(title, time, summary, meta);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "history-record-delete";
    deleteButton.dataset.deleteHistory = reading.id;
    deleteButton.textContent = "删除";
    deleteButton.setAttribute("aria-label", "删除这次" + (reading.modeName || "Tarot") + "牌局");

    article.append(openButton, deleteButton);
    return article;
  }

  function renderHistoryList() {
    const readings = getHistoryReadings();
    const fragment = document.createDocumentFragment();
    readings.forEach(function (reading) {
      fragment.appendChild(createHistoryRecord(reading));
    });
    dom.historyList.replaceChildren(fragment);
    dom.historyEmpty.hidden = readings.length !== 0;
    decorateDynamicControls(dom.historyList);
  }

  function openHistory(options) {
    const settings = options || {};
    const scopedMode = getMode(settings.modeId);
    state.historyScopeModeId = scopedMode ? scopedMode.modeId : null;
    state.historyFilter = scopedMode ? scopedMode.modeId : "all";
    state.historyReturnStage = settings.returnStage === "question" ? "question" : "home";
    state.selectedHistoryId = null;
    dom.historyTitle.textContent = scopedMode ? scopedMode.modeName + "历史" : "全部牌局";
    renderHistoryFilters();
    renderHistoryList();
    setStage("history");
  }

  function closeHistory() {
    if (state.historyReturnStage === "question" && getCurrentMode()) {
      setStage("question");
      return;
    }
    setStage("home");
  }

  function createHistoryCard(cardSnapshot) {
    const currentCard = tarotData.cards.find(function (card) {
      return card.id === cardSnapshot.cardId;
    });
    const isReversed = cardSnapshot.orientation === "reversed";

    const article = document.createElement("article");
    article.className = "history-card";

    const position = document.createElement("p");
    position.className = "history-card-position";
    position.textContent = cardSnapshot.positionName || "牌位";

    const visual = document.createElement("div");
    visual.className = "history-card-visual" + (isReversed ? " is-reversed" : "");
    visual.setAttribute("aria-label", (cardSnapshot.nameZh || "未知牌") + "，" + (isReversed ? "逆位" : "正位"));

    const art = document.createElement("span");
    art.className = "tarot-face-art";
    const number = document.createElement("span");
    number.className = "face-number";
    number.textContent = currentCard ? currentCard.number : "";
    const symbol = document.createElement("span");
    symbol.className = "face-symbol";
    symbol.textContent = currentCard ? currentCard.symbol : "✦";
    const nameZh = document.createElement("span");
    nameZh.className = "face-name-zh";
    nameZh.textContent = cardSnapshot.nameZh || (currentCard && currentCard.nameZh) || "未知牌";
    const nameEn = document.createElement("span");
    nameEn.className = "face-name-en";
    nameEn.textContent = cardSnapshot.nameEn || (currentCard && currentCard.nameEn) || "";
    art.append(number, symbol, nameZh, nameEn);
    visual.appendChild(art);

    const name = document.createElement("p");
    name.className = "history-card-name";
    name.textContent = cardSnapshot.nameZh || (currentCard && currentCard.nameZh) || "未知牌";
    const orientation = document.createElement("span");
    orientation.className = "history-card-orientation";
    orientation.textContent = isReversed ? "逆位" : "正位";

    const studyButton = document.createElement("button");
    studyButton.type = "button";
    studyButton.className = "history-card-study-button";
    studyButton.dataset.studyCardId = cardSnapshot.cardId;
    studyButton.dataset.studySource = "history";
    studyButton.textContent = "查看牌义";
    studyButton.setAttribute("aria-label", "查看" + (cardSnapshot.nameZh || (currentCard && currentCard.nameZh) || "这张牌") + "的牌义");

    article.append(position, visual, name, orientation, studyButton);
    return article;
  }

  function renderHistoryDetail(reading) {
    dom.historyDetailTitle.textContent = reading.modeName || "牌局详情";

    const summary = document.createElement("section");
    summary.className = "history-detail-summary";
    const title = document.createElement("h2");
    title.textContent = reading.modeName || "Tarot 牌局";
    const time = document.createElement("p");
    time.className = "history-detail-time";
    time.textContent = formatLocalDateTime(reading.createdAt);
    const source = document.createElement("p");
    source.className = "history-detail-source";
    source.textContent = getSourceLabel(reading.source);
    summary.append(title, time, source);

    const fields = document.createElement("div");
    fields.className = "history-detail-fields";
    if (reading.personName) {
      const personField = document.createElement("div");
      personField.className = "history-detail-field";
      const label = document.createElement("span");
      label.textContent = "人物";
      const value = document.createElement("p");
      value.textContent = reading.personName;
      personField.append(label, value);
      fields.appendChild(personField);
    }
    if (reading.question) {
      const questionField = document.createElement("div");
      questionField.className = "history-detail-field";
      const label = document.createElement("span");
      label.textContent = "问题";
      const value = document.createElement("p");
      value.textContent = reading.question;
      questionField.append(label, value);
      fields.appendChild(questionField);
    }
    if (fields.childElementCount) {
      summary.appendChild(fields);
    }

    const cards = document.createElement("section");
    cards.className = "history-detail-cards";
    (Array.isArray(reading.cards) ? reading.cards : []).forEach(function (card) {
      cards.appendChild(createHistoryCard(card));
    });

    dom.historyDetail.replaceChildren(summary, cards);
  }

  function openHistoryDetail(id) {
    const reading = historyStore.get(id);
    if (!reading) {
      renderHistoryList();
      setStage("history");
      return;
    }
    state.selectedHistoryId = reading.id;
    renderHistoryDetail(reading);
    setStage("historyDetail");
  }

  function requestHistoryDelete(id) {
    if (!historyStore.get(id)) {
      return;
    }
    state.pendingDeleteId = id;
    dom.deleteConfirm.hidden = false;
    document.body.classList.add("is-modal-open");
    dom.confirmDeleteButton.focus({ preventScroll: true });
  }

  function cancelHistoryDelete() {
    state.pendingDeleteId = null;
    dom.deleteConfirm.hidden = true;
    document.body.classList.remove("is-modal-open");
  }

  function confirmHistoryDelete() {
    const id = state.pendingDeleteId;
    if (!id) {
      cancelHistoryDelete();
      return;
    }
    const deletingCurrentDetail = state.stage === "historyDetail" && state.selectedHistoryId === id;
    const removed = historyStore.remove(id);
    cancelHistoryDelete();
    if (!removed) {
      return;
    }
    if (deletingCurrentDetail) {
      state.selectedHistoryId = null;
      renderHistoryList();
      setStage("history");
      return;
    }
    renderHistoryList();
  }

  function returnHome() {
    resetReadingState();
    state.mode = null;
    state.requiredCount = 1;
    state.question = "";
    state.personId = null;
    state.personName = null;
    dom.personField.hidden = true;
    setStage("home");
  }

  renderModeHome();

  dom.frequencyButton.addEventListener("click", beginFrequencySequence);

  app.addEventListener("click", function (event) {
    if (event.target.closest("[data-study-card-id]")) {
      return;
    }

    const deleteHistoryButton = event.target.closest("[data-delete-history]");
    if (deleteHistoryButton) {
      requestHistoryDelete(deleteHistoryButton.dataset.deleteHistory);
      return;
    }

    const historyFilterButton = event.target.closest("[data-history-filter]");
    if (historyFilterButton && !state.historyScopeModeId) {
      state.historyFilter = historyFilterButton.dataset.historyFilter;
      renderHistoryFilters();
      renderHistoryList();
      return;
    }

    const historyRecordButton = event.target.closest("[data-history-id]");
    if (historyRecordButton) {
      openHistoryDetail(historyRecordButton.dataset.historyId);
      return;
    }

    const modeButton = event.target.closest("[data-mode]");
    if (modeButton) {
      selectMode(modeButton.dataset.mode);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const action = actionButton.dataset.action;
      if (action === "back-home" || action === "return-home") {
        returnHome();
      } else if (action === "open-all-history") {
        openHistory({ returnStage: "home" });
      } else if (action === "open-mode-history") {
        const mode = getCurrentMode();
        if (mode) {
          openHistory({ modeId: mode.modeId, returnStage: "question" });
        }
      } else if (action === "close-history") {
        closeHistory();
      } else if (action === "back-history-list") {
        renderHistoryList();
        setStage("history");
      } else if (action === "delete-current-history") {
        if (state.selectedHistoryId) {
          requestHistoryDelete(state.selectedHistoryId);
        }
      } else if (action === "back-question") {
        resetReadingState();
        setStage("question");
      } else if (action === "back-shuffle") {
        state.drawCursor = 0;
        state.draws = [];
        state.drawLocked = false;
        dom.drawnPreview.replaceChildren();
        setStage("shuffle");
        ensureScatterCards();
        scatterCards(false);
      }
      return;
    }

    const fanCard = event.target.closest(".fan-card");
    if (fanCard) {
      drawFromPosition(fanCard);
      return;
    }

    const resultCard = event.target.closest(".result-card");
    if (resultCard) {
      cycleResultCard(resultCard);
    }
  });

  dom.startShuffleButton.addEventListener("click", function () {
    beginNewDeck({ keepQuestion: false });
  });
  dom.scatterButton.addEventListener("click", function () {
    scatterCards(true);
  });
  dom.rotateButton.addEventListener("click", rotateCards);
  dom.readyButton.addEventListener("click", enterSelection);
  dom.restartButton.addEventListener("click", function () {
    beginNewDeck({ keepQuestion: true });
  });
  dom.personSelect.addEventListener("change", function () {
    const person = getPerson(dom.personSelect.value) || TAROT_PEOPLE.luzhen;
    state.personId = person.id;
    state.personName = person.name;
  });
  dom.deleteConfirm.addEventListener("click", function (event) {
    const cancelButton = event.target.closest('[data-action="cancel-delete"]');
    if (cancelButton) {
      cancelHistoryDelete();
    }
  });
  dom.confirmDeleteButton.addEventListener("click", confirmHistoryDelete);

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !dom.deleteConfirm.hidden) {
      cancelHistoryDelete();
    }
  });

  window.addEventListener("resize", function () {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }
    resizeFrame = window.requestAnimationFrame(function () {
      resizeFrame = 0;
      layoutFan();
    });
  });

  window.addEventListener("pagehide", clearTimers);

  // Read-only diagnostics for local verification.
  window.LiminalTarot = Object.freeze({
    getState: function () {
      return {
        stage: state.stage,
        mode: state.mode,
        requiredCount: state.requiredCount,
        deckSize: state.deck.length,
        drawCursor: state.drawCursor,
        drawCount: state.draws.length,
        drawnIds: state.draws.map(function (draw) { return draw.card.id; }),
        orientations: state.draws.map(function (draw) { return draw.reversed ? "reversed" : "upright"; }),
        personId: state.personId,
        savedReadingId: state.savedReadingId,
        historyCount: historyStore.list().length,
        scatterCount: state.scatterCount,
        rotationCount: state.rotationCount,
        gameSerial: state.gameSerial
      };
    },
    validateDeck: function () {
      const ids = tarotData.cards.map(function (card) { return card.id; });
      return {
        count: ids.length,
        uniqueCount: new Set(ids).size,
        complete: ids.length === 78 && new Set(ids).size === 78
      };
    },
    validateModes: function () {
      return Object.keys(TAROT_MODES).map(function (modeId) {
        const mode = TAROT_MODES[modeId];
        return {
          modeId: mode.modeId,
          modeName: mode.modeName,
          cardCount: mode.cardCount,
          positionCount: mode.positions.length,
          valid: mode.cardCount === mode.positions.length
        };
      });
    },
    validateFreshDeck: function () {
      const freshDeck = buildFreshDeck();
      const ids = freshDeck.map(function (draw) { return draw.card.id; });
      return {
        count: ids.length,
        uniqueCount: new Set(ids).size,
        complete: ids.length === 78 && new Set(ids).size === 78
      };
    }
  });
})();
