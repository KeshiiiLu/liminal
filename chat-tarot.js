/* Liminal Chat · one-card quick Tarot */

(function () {
  "use strict";

  const trigger = document.getElementById("chatTarotButton");
  const panel = document.getElementById("chatTarotPanel");
  const closeButton = document.getElementById("chatTarotClose");
  const drawButton = document.getElementById("chatTarotDraw");
  const questionInput = document.getElementById("chatTarotQuestion");
  const result = document.getElementById("chatTarotResult");
  const cardElement = document.getElementById("chatTarotCard");
  const numberElement = document.getElementById("chatTarotNumber");
  const symbolElement = document.getElementById("chatTarotSymbol");
  const nameElement = document.getElementById("chatTarotCardName");
  const nameEnElement = document.getElementById("chatTarotCardNameEn");
  const orientationElement = document.getElementById("chatTarotOrientation");
  const keywordsElement = document.getElementById("chatTarotKeywords");
  const summaryElement = document.getElementById("chatTarotSummary");
  const studyLink = document.getElementById("chatTarotStudyLink");
  const errorElement = document.getElementById("chatTarotError");

  if (
    !trigger ||
    !panel ||
    !closeButton ||
    !drawButton ||
    !questionInput ||
    !result ||
    !cardElement ||
    !studyLink ||
    !errorElement
  ) {
    return;
  }

  const tarotData = window.LiminalTarotData;
  const studyData = window.TAROT_STUDY;
  const studyValidation = window.LiminalTarotStudyValidation;
  const historyStore = window.LiminalTarotHistory;
  const deck = tarotData && Array.isArray(tarotData.cards)
    ? tarotData.cards
    : [];

  const dataReady = Boolean(
    deck.length === 78 &&
    studyData &&
    studyValidation &&
    studyValidation.complete
  );

  let lastFocusedElement = null;

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

  function setError(message) {
    errorElement.textContent = message || "";
    errorElement.hidden = !message;
  }

  function openPanel() {
    if (typeof closeMorePanel === "function") {
      closeMorePanel();
    }

    lastFocusedElement = document.activeElement;
    setError(dataReady ? "" : "塔罗牌库暂时无法载入，请稍后重试。");
    panel.hidden = false;
    document.body.classList.add("chat-tarot-open");

    window.setTimeout(function () {
      if (dataReady) {
        questionInput.focus();
      } else {
        closeButton.focus();
      }
    }, 60);
  }

  function closePanel() {
    panel.hidden = true;
    document.body.classList.remove("chat-tarot-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function createKeyword(value) {
    const keyword = document.createElement("span");
    keyword.textContent = value;
    return keyword;
  }

  function saveReading(card, reversed) {
    if (!historyStore || typeof historyStore.add !== "function") {
      return;
    }

    const person = typeof currentPerson !== "undefined" ? currentPerson : null;
    const saved = historyStore.add({
      modeId: "chat_quick_tarot",
      modeName: "聊天快捷塔罗",
      source: "chat_quick_tarot",
      question: questionInput.value.trim(),
      personId: person && typeof person.id === "string" ? person.id : null,
      personName: person && typeof person.name === "string" ? person.name : null,
      cards: [
        {
          cardId: card.id,
          nameZh: card.nameZh,
          nameEn: card.nameEn,
          orientation: reversed ? "reversed" : "upright",
          positionId: "chat_response",
          positionName: "回应"
        }
      ],
      createdAt: new Date().toISOString(),
      userNote: ""
    });

    if (!saved) {
      setError("牌已经抽出，但这次牌局未能写入历史。");
    }
  }

  function drawCard() {
    if (!dataReady) {
      setError("塔罗牌库暂时无法载入，请稍后重试。");
      return;
    }

    setError("");

    const card = deck[randomInteger(deck.length)];
    const reversed = randomInteger(2) === 1;
    const study = studyData[card.id];
    const keywords = reversed && study.reversedKeywords.length
      ? study.reversedKeywords
      : study.coreKeywords;
    const summary = reversed
      ? study.reversedSummary
      : study.uprightSummary;

    numberElement.textContent = card.number;
    symbolElement.textContent = card.symbol;
    nameElement.textContent = card.nameZh;
    nameEnElement.textContent = card.nameEn;
    orientationElement.textContent = reversed ? "逆位" : "正位";
    keywordsElement.replaceChildren(
      ...keywords.slice(0, 4).map(createKeyword)
    );
    summaryElement.textContent = summary;
    cardElement.classList.toggle("is-reversed", reversed);
    result.hidden = false;
    drawButton.textContent = "再抽一张";
    studyLink.href = "tarot-study.html?card=" + encodeURIComponent(card.id);
    studyLink.hidden = false;

    saveReading(card, reversed);

    if (window.LiminalInteraction && typeof window.LiminalInteraction.decorate === "function") {
      window.LiminalInteraction.decorate(panel);
    }
  }

  trigger.addEventListener("click", openPanel);
  closeButton.addEventListener("click", closePanel);
  drawButton.addEventListener("click", drawCard);

  panel.addEventListener("click", function (event) {
    if (event.target === panel) {
      closePanel();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      closePanel();
    }
  });
})();
