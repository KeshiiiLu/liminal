(function () {
  "use strict";

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
    const result = Array.isArray(items) ? items.slice() : [];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = randomInteger(index + 1);
      const current = result[index];
      result[index] = result[target];
      result[target] = current;
    }

    return result;
  }

  function buildDeck(cards) {
    const deck = (Array.isArray(cards) ? cards : []).map(function (card) {
      return Object.freeze({
        card: card,
        reversed: randomInteger(2) === 1
      });
    });

    return shuffledCopy(deck);
  }

  function draw(cards, count) {
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError("count must be a positive integer");
    }
    if (!Array.isArray(cards) || cards.length < count) {
      throw new RangeError("The Tarot deck does not contain enough cards");
    }

    return buildDeck(cards).slice(0, count);
  }

  window.LiminalTarotRandom = Object.freeze({
    randomInteger: randomInteger,
    shuffledCopy: shuffledCopy,
    buildDeck: buildDeck,
    draw: draw
  });
})();
