/* Liminal Chat · in-chat quick Tarot */

(function () {
  "use strict";

  const trigger = document.getElementById("chatTarotButton");
  const panel = document.getElementById("chatTarotPanel");
  const closeButton = document.getElementById("chatTarotClose");
  const historyButton = document.getElementById("chatTarotHistoryButton");
  const historyBackButton = document.getElementById("chatTarotHistoryBack");
  const mainView = document.getElementById("chatTarotMain");
  const historyView = document.getElementById("chatTarotHistory");
  const historyList = document.getElementById("chatTarotHistoryList");
  const historyEmpty = document.getElementById("chatTarotHistoryEmpty");
  const questionInput = document.getElementById("chatTarotQuestion");
  const modePages = document.getElementById("chatTarotModePages");
  const pageDots = Array.from(document.querySelectorAll("[data-quick-tarot-page]"));
  const modeSections = Array.from(document.querySelectorAll("[data-quick-tarot-mode]"));
  const errorElement = document.getElementById("chatTarotError");

  if (
    !trigger || !panel || !closeButton || !historyButton || !historyBackButton ||
    !mainView || !historyView || !historyList || !historyEmpty || !questionInput ||
    !modePages || modeSections.length !== 2 || !errorElement
  ) {
    console.error("[Liminal Chat Tarot] The quick Tarot interface is incomplete.");
    return;
  }

  const tarotData = window.LiminalTarotData;
  const studyData = window.TAROT_STUDY;
  const studyValidation = window.LiminalTarotStudyValidation;
  const historyStore = window.LiminalTarotHistory;
  const tarotRandom = window.LiminalTarotRandom;
  const deck = tarotData && Array.isArray(tarotData.cards) ? tarotData.cards : [];
  const dataReady = Boolean(
    deck.length === 78 && studyData && studyValidation && studyValidation.complete &&
    historyStore && tarotRandom && typeof tarotRandom.draw === "function"
  );

  const MODES = Object.freeze({
    single_response: Object.freeze({
      modeId: "single_response",
      modeName: "一张回应牌",
      count: 1,
      positions: Object.freeze([
        Object.freeze({ id: "response", name: "回应" })
      ])
    }),
    triple_supplement: Object.freeze({
      modeId: "triple_supplement",
      modeName: "三张补充牌",
      count: 3,
      positions: Object.freeze([
        Object.freeze({ id: "supplement_1", name: "补充1" }),
        Object.freeze({ id: "supplement_2", name: "补充2" }),
        Object.freeze({ id: "supplement_3", name: "补充3" })
      ])
    })
  });

  const modeState = new Map();
  let activePage = 0;
  let lastFocusedElement = null;
  let scrollFrame = 0;
  let pageFallbackTimer = 0;

  modeSections.forEach(function (section) {
    modeState.set(section.dataset.quickTarotMode, {
      section: section,
      cards: section.querySelector("[data-quick-tarot-cards]"),
      status: section.querySelector("[data-quick-tarot-status]"),
      drawButton: section.querySelector("[data-quick-tarot-draw]"),
      timers: [],
      drawing: false,
      generation: 0
    });
  });

  function getPerson() {
    if (typeof currentPerson !== "undefined" && currentPerson) return currentPerson;
    return null;
  }

  function setError(message) {
    errorElement.textContent = message || "";
    errorElement.hidden = !message;
  }

  function setActivePage(index, shouldScroll) {
    activePage = Math.max(0, Math.min(modeSections.length - 1, Number(index) || 0));
    pageDots.forEach(function (dot, dotIndex) {
      const selected = dotIndex === activePage;
      dot.classList.toggle("is-active", selected);
      dot.setAttribute("aria-current", selected ? "true" : "false");
    });

    if (shouldScroll) {
      const targetLeft = activePage * modePages.clientWidth;
      modePages.scrollTo({ left: targetLeft, behavior: "smooth" });
      window.clearTimeout(pageFallbackTimer);
      pageFallbackTimer = window.setTimeout(function () {
        if (Math.abs(modePages.scrollLeft - targetLeft) > 2) {
          const previousBehavior = modePages.style.scrollBehavior;
          modePages.style.scrollBehavior = "auto";
          modePages.scrollLeft = targetLeft;
          window.requestAnimationFrame(function () {
            modePages.style.scrollBehavior = previousBehavior;
          });
        }
      }, 180);
    }
  }

  function showMainView() {
    historyView.hidden = true;
    mainView.hidden = false;
    historyButton.hidden = false;
  }

  function openPanel() {
    if (typeof closeMorePanel === "function") closeMorePanel();

    lastFocusedElement = document.activeElement;
    showMainView();
    setError(dataReady ? "" : "塔罗牌库暂时无法载入，请稍后重试。");
    panel.hidden = false;
    document.body.classList.add("chat-tarot-open");

    const previousBehavior = modePages.style.scrollBehavior;
    modePages.style.scrollBehavior = "auto";
    modePages.scrollLeft = 0;
    modePages.style.scrollBehavior = previousBehavior;
    setActivePage(0, false);
    window.setTimeout(function () { closeButton.focus({ preventScroll: true }); }, 40);
  }

  function cancelPendingDraws() {
    modeState.forEach(function (state) {
      state.generation += 1;
      state.timers.forEach(function (timer) { window.clearTimeout(timer); });
      state.timers = [];
      if (state.drawing) {
        state.drawing = false;
        state.cards.replaceChildren();
        state.drawButton.disabled = false;
        state.status.textContent = "抽取已暂停，可以重新开始。";
      }
    });
  }

  function closePanel() {
    cancelPendingDraws();
    panel.hidden = true;
    document.body.classList.remove("chat-tarot-open");
    showMainView();
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function keywordElements(values) {
    return values.slice(0, 4).map(function (value) {
      const item = document.createElement("span");
      item.textContent = value;
      return item;
    });
  }

  function createCardResult(drawn, position, index) {
    const card = drawn.card;
    const reversed = drawn.reversed;
    const study = studyData[card.id];
    const keywords = reversed && study.reversedKeywords.length
      ? study.reversedKeywords
      : study.coreKeywords;

    const wrapper = document.createElement("article");
    wrapper.className = "chat-quick-card-result";
    wrapper.dataset.cardId = card.id;
    wrapper.dataset.orientation = reversed ? "reversed" : "upright";

    const positionLabel = document.createElement("span");
    positionLabel.className = "chat-quick-card-position";
    positionLabel.textContent = position.name;

    const cardButton = document.createElement("button");
    cardButton.type = "button";
    cardButton.className = "chat-quick-card";
    cardButton.dataset.view = "back";
    cardButton.setAttribute("aria-label", position.name + "，点击翻牌");

    const inner = document.createElement("span");
    inner.className = "chat-quick-card-inner";

    const back = document.createElement("span");
    back.className = "chat-quick-card-side chat-quick-card-back";
    back.innerHTML = '<span class="chat-quick-card-back-mark">◇</span><span>LIMINAL</span>';

    const face = document.createElement("span");
    face.className = "chat-quick-card-side chat-quick-card-face";
    const faceArt = document.createElement("span");
    faceArt.className = "chat-quick-card-face-art";
    faceArt.classList.toggle("is-reversed", reversed);
    const number = document.createElement("small");
    number.textContent = card.number;
    const symbol = document.createElement("b");
    symbol.textContent = card.symbol || "◇";
    const zh = document.createElement("strong");
    zh.textContent = card.nameZh;
    const en = document.createElement("em");
    en.textContent = card.nameEn;
    const orientation = document.createElement("span");
    orientation.textContent = reversed ? "逆位" : "正位";
    faceArt.append(number, symbol, zh, en, orientation);
    face.appendChild(faceArt);

    const meaning = document.createElement("span");
    meaning.className = "chat-quick-card-side chat-quick-card-meaning";
    const meaningName = document.createElement("strong");
    meaningName.textContent = card.nameZh;
    const meaningOrientation = document.createElement("small");
    meaningOrientation.textContent = reversed ? "逆位" : "正位";
    const meaningKeywords = document.createElement("span");
    meaningKeywords.className = "chat-quick-card-keywords";
    meaningKeywords.replaceChildren.apply(meaningKeywords, keywordElements(keywords));
    const meaningSummary = document.createElement("span");
    meaningSummary.className = "chat-quick-card-summary";
    meaningSummary.textContent = reversed ? study.reversedSummary : study.uprightSummary;
    meaning.append(meaningName, meaningOrientation, meaningKeywords, meaningSummary);

    inner.append(back, face, meaning);
    cardButton.appendChild(inner);

    const studyButton = document.createElement("button");
    studyButton.type = "button";
    studyButton.className = "chat-quick-study-button";
    studyButton.dataset.studyCardId = card.id;
    studyButton.dataset.studySource = "chat-quick-tarot";
    studyButton.textContent = "查看完整牌义 →";
    studyButton.hidden = true;

    cardButton.addEventListener("click", function () {
      const currentView = cardButton.dataset.view;
      const nextView = currentView === "back" ? "face" : currentView === "face" ? "meaning" : "face";
      cardButton.dataset.view = nextView;
      studyButton.hidden = nextView !== "meaning";
      cardButton.setAttribute(
        "aria-label",
        card.nameZh + " " + (reversed ? "逆位" : "正位") + "，点击" +
          (nextView === "face" ? "查看释义" : "返回牌面")
      );
    });

    wrapper.style.setProperty("--reveal-order", String(index));
    wrapper.append(positionLabel, cardButton, studyButton);
    return wrapper;
  }

  function makeHistoryCards(draws, mode) {
    return draws.map(function (drawn, index) {
      const position = mode.positions[index];
      return {
        cardId: drawn.card.id,
        nameZh: drawn.card.nameZh,
        nameEn: drawn.card.nameEn,
        orientation: drawn.reversed ? "reversed" : "upright",
        positionId: position.id,
        positionName: position.name
      };
    });
  }

  function saveReading(draws, mode) {
    const person = getPerson();
    const saved = historyStore.add({
      modeId: mode.modeId,
      modeName: mode.modeName,
      source: "chat_quick_tarot",
      question: questionInput.value.trim(),
      personId: person && typeof person.id === "string" ? person.id : null,
      personName: person && typeof person.name === "string" ? person.name : null,
      cards: makeHistoryCards(draws, mode),
      createdAt: new Date().toISOString(),
      userNote: ""
    });

    if (!saved) setError("牌已经抽出，但这次牌局未能写入历史。");
  }

  function drawMode(modeId) {
    const mode = MODES[modeId];
    const state = modeState.get(modeId);
    if (!dataReady || !mode || !state || state.drawing) {
      if (!dataReady) setError("塔罗牌库暂时无法载入，请稍后重试。");
      return;
    }

    setError("");
    state.generation += 1;
    const generation = state.generation;
    state.timers.forEach(function (timer) { window.clearTimeout(timer); });
    state.timers = [];
    state.drawing = true;
    state.cards.replaceChildren();
    state.drawButton.disabled = true;
    state.status.textContent = "正在抽取……";

    let draws;
    try {
      draws = tarotRandom.draw(deck, mode.count);
    } catch (error) {
      state.drawing = false;
      state.drawButton.disabled = false;
      setError("这次抽取没有完成，请再试一次。");
      console.error("[Liminal Chat Tarot] Draw failed.", error);
      return;
    }

    draws.forEach(function (drawn, index) {
      const timer = window.setTimeout(function () {
        if (generation !== state.generation) return;
        state.cards.appendChild(createCardResult(drawn, mode.positions[index], index));

        if (index === draws.length - 1) {
          state.drawing = false;
          state.timers = [];
          state.drawButton.disabled = false;
          state.drawButton.textContent = mode.count === 1 ? "再抽一张回应牌" : "再抽三张补充牌";
          state.status.textContent = "点击牌背查看牌面，再点击查看释义。";
          saveReading(draws, mode);
          if (window.LiminalInteraction && typeof window.LiminalInteraction.decorate === "function") {
            window.LiminalInteraction.decorate(state.section);
          }
        }
      }, 650 + index * 720);
      state.timers.push(timer);
    });
  }

  function formatHistoryDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).format(date);
  }

  function createHistoryItem(reading) {
    const item = document.createElement("article");
    item.className = "chat-tarot-history-item";

    const summary = document.createElement("div");
    summary.className = "chat-tarot-history-summary";
    const title = document.createElement("strong");
    title.textContent = reading.modeName;
    const meta = document.createElement("span");
    meta.textContent = [reading.personName, formatHistoryDate(reading.createdAt)].filter(Boolean).join(" · ");
    const question = document.createElement("p");
    question.textContent = reading.question || "未填写问题";
    summary.append(title, meta, question);

    const actions = document.createElement("div");
    actions.className = "chat-tarot-history-actions";
    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.textContent = "查看";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "删除";

    const detail = document.createElement("div");
    detail.className = "chat-tarot-history-detail";
    detail.hidden = true;
    reading.cards.forEach(function (snapshot) {
      const row = document.createElement("div");
      const label = document.createElement("span");
      label.textContent = snapshot.positionName;
      const value = document.createElement("strong");
      value.textContent = snapshot.nameZh + " · " + (snapshot.orientation === "reversed" ? "逆位" : "正位");
      const studyButton = document.createElement("button");
      studyButton.type = "button";
      studyButton.dataset.studyCardId = snapshot.cardId;
      studyButton.dataset.studySource = "chat-quick-history";
      studyButton.textContent = "查看牌义";
      row.append(label, value, studyButton);
      detail.appendChild(row);
    });

    viewButton.addEventListener("click", function () {
      detail.hidden = !detail.hidden;
      viewButton.textContent = detail.hidden ? "查看" : "收起";
    });
    deleteButton.addEventListener("click", function () {
      if (!window.confirm("确定删除这条快捷塔罗记录吗？")) return;
      if (!historyStore.remove(reading.id)) {
        setError("这条记录暂时无法删除，请稍后重试。");
        return;
      }
      renderHistory();
    });

    actions.append(viewButton, deleteButton);
    item.append(summary, actions, detail);
    return item;
  }

  function getQuickHistory() {
    const person = getPerson();
    return historyStore.list()
      .filter(function (reading) { return reading.source === "chat_quick_tarot"; })
      .sort(function (first, second) {
        const firstPriority = person && first.personId === person.id ? 0 : 1;
        const secondPriority = person && second.personId === person.id ? 0 : 1;
        if (firstPriority !== secondPriority) return firstPriority - secondPriority;
        return (Date.parse(second.createdAt) || 0) - (Date.parse(first.createdAt) || 0);
      });
  }

  function renderHistory() {
    const readings = getQuickHistory();
    historyList.replaceChildren.apply(historyList, readings.map(createHistoryItem));
    historyEmpty.hidden = readings.length !== 0;
    if (window.LiminalInteraction && typeof window.LiminalInteraction.decorate === "function") {
      window.LiminalInteraction.decorate(historyView);
    }
  }

  function showHistory() {
    cancelPendingDraws();
    renderHistory();
    mainView.hidden = true;
    historyView.hidden = false;
    historyButton.hidden = true;
    historyBackButton.focus({ preventScroll: true });
  }

  modeState.forEach(function (state, modeId) {
    state.drawButton.addEventListener("click", function () { drawMode(modeId); });
  });

  pageDots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setActivePage(Number(dot.dataset.quickTarotPage), true);
    });
  });

  modePages.addEventListener("scroll", function () {
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(function () {
      const width = modePages.clientWidth || 1;
      setActivePage(Math.round(modePages.scrollLeft / width), false);
    });
  }, { passive: true });

  trigger.addEventListener("pointerdown", function (event) {
    if (event.isPrimary === false) return;
    event.preventDefault();
    event.stopPropagation();
    openPanel();
  }, true);
  trigger.addEventListener("click", function () {
    if (panel.hidden) openPanel();
  });

  closeButton.addEventListener("click", closePanel);
  historyButton.addEventListener("click", showHistory);
  historyBackButton.addEventListener("click", function () {
    showMainView();
    historyButton.focus({ preventScroll: true });
  });

  panel.addEventListener("click", function (event) {
    if (event.target === panel) closePanel();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      if (!historyView.hidden) showMainView();
      else closePanel();
    }
  });
})();
