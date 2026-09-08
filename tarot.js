(function () {
  "use strict";

  const tarotData = window.LiminalTarotData;
  const app = document.getElementById("tarotApp");

  if (!app || !tarotData || !Array.isArray(tarotData.cards) || tarotData.cards.length !== 78) {
    if (app) {
      app.innerHTML = '<section class="tarot-stage is-active"><p>Tarot 牌组未能完整加载。</p></section>';
    }
    console.error("[Liminal Tarot] A complete 78-card deck is required.");
    return;
  }

  const stages = new Map(
    Array.from(document.querySelectorAll("[data-stage]")).map(function (element) {
      return [element.dataset.stage, element];
    })
  );

  const dom = {
    frequencyStage: stages.get("frequency"),
    frequencyButton: document.getElementById("frequencyButton"),
    frequencyStatus: document.getElementById("frequencyStatus"),
    questionTitle: document.getElementById("questionTitle"),
    questionInput: document.getElementById("tarotQuestion"),
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
    restartButton: document.getElementById("restartButton")
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
    deck: [],
    drawCursor: 0,
    draws: [],
    drawLocked: false,
    scatterCount: 0,
    rotationCount: 0,
    gameSerial: 0
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
    if (mode !== "single" && mode !== "triple") {
      return;
    }
    state.mode = mode;
    state.requiredCount = mode === "triple" ? 3 : 1;
    const title = mode === "triple" ? "三张补充" : "单张回应";
    dom.questionTitle.textContent = title;
    dom.questionInput.value = "";
    setStage("question");
    schedule(function () {
      dom.questionInput.focus({ preventScroll: true });
    }, 420);
  }

  function beginNewDeck(options) {
    const settings = options || {};
    resetReadingState();
    state.deck = buildFreshDeck();
    state.gameSerial += 1;
    state.question = settings.keepQuestion ? state.question : dom.questionInput.value.trim();
    dom.shuffleTitle.textContent = state.mode === "triple" ? "让三张牌慢慢散开" : "让牌慢慢散开";
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
    state.drawCursor = 0;
    state.draws = [];
    state.drawLocked = false;
    dom.drawnPreview.replaceChildren();
    dom.selectTitle.textContent = state.mode === "triple" ? "依次选择三张牌" : "选择一张牌";
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
    if (state.mode === "triple") {
      return "补充 " + (index + 1);
    }
    return "回应牌";
  }

  function getInterpretation(draw) {
    const saved = tarotData.interpretations[draw.card.id];
    if (saved) {
      return {
        keywords: draw.reversed ? saved.reversed : saved.upright,
        hint: saved.hint
      };
    }
    return {
      keywords: ["观察", "感受", "保持开放"],
      hint: "详细学习内容将在后续补充。"
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

    inner.append(back, face, meaning);
    button.appendChild(inner);
    wrapper.append(position, button);
    return wrapper;
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
    dom.resultTitle.textContent = state.mode === "triple" ? "三张补充" : "这一次的回应";
    dom.resultInstruction.textContent = "点击牌背查看牌面";
    setStage("result");
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

  function returnHome() {
    resetReadingState();
    state.mode = null;
    state.requiredCount = 1;
    state.question = "";
    setStage("home");
  }

  dom.frequencyButton.addEventListener("click", beginFrequencySequence);

  app.addEventListener("click", function (event) {
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

  // Read-only diagnostics for local verification. No reading state is persisted.
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
    }
  });
})();
