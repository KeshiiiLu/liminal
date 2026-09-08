/*
 * Liminal Tarot history store.
 *
 * Reading history is deliberately separate from the card deck and random
 * selection code. Future entry points, such as chat quick Tarot, can write to
 * the same versioned store by supplying a different `source` value.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "liminal_tarot_history_v1";
  const STORAGE_VERSION = 1;

  function emptyStore() {
    return {
      version: STORAGE_VERSION,
      readings: []
    };
  }

  function isCardSnapshot(value) {
    return Boolean(
      value &&
      typeof value === "object" &&
      typeof value.cardId === "string" &&
      value.cardId &&
      typeof value.nameZh === "string" &&
      typeof value.nameEn === "string" &&
      (value.orientation === "upright" || value.orientation === "reversed") &&
      typeof value.positionId === "string" &&
      value.positionId &&
      typeof value.positionName === "string" &&
      value.positionName
    );
  }

  function isReading(value) {
    return Boolean(
      value &&
      typeof value === "object" &&
      typeof value.id === "string" &&
      value.id &&
      typeof value.modeId === "string" &&
      value.modeId &&
      typeof value.modeName === "string" &&
      value.modeName &&
      typeof value.source === "string" &&
      value.source &&
      typeof value.question === "string" &&
      (value.personId === null || typeof value.personId === "string") &&
      (value.personName === null || typeof value.personName === "string") &&
      Array.isArray(value.cards) &&
      value.cards.length > 0 &&
      value.cards.every(isCardSnapshot) &&
      typeof value.createdAt === "string" &&
      !Number.isNaN(Date.parse(value.createdAt)) &&
      typeof value.userNote === "string"
    );
  }

  function readStore() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return emptyStore();
      }

      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        parsed.version !== STORAGE_VERSION ||
        !Array.isArray(parsed.readings)
      ) {
        console.warn("[Liminal Tarot] Ignored invalid or unsupported history data.");
        return emptyStore();
      }

      return {
        version: STORAGE_VERSION,
        readings: parsed.readings.filter(isReading)
      };
    } catch (error) {
      console.warn("[Liminal Tarot] History could not be read.", error);
      return emptyStore();
    }
  }

  function writeStore(store) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      return true;
    } catch (error) {
      console.error("[Liminal Tarot] History could not be saved.", error);
      return false;
    }
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "tarot_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }

  function listReadings() {
    return readStore().readings.slice().sort(function (first, second) {
      const firstTime = Date.parse(first.createdAt) || 0;
      const secondTime = Date.parse(second.createdAt) || 0;
      return secondTime - firstTime;
    });
  }

  function addReading(reading) {
    if (!reading || typeof reading !== "object" || !Array.isArray(reading.cards)) {
      return null;
    }

    const store = readStore();
    const requestedId = typeof reading.id === "string" && reading.id ? reading.id : "";
    const idExists = store.readings.some(function (saved) {
      return saved.id === requestedId;
    });
    const savedReading = Object.assign({}, reading, {
      id: requestedId && !idExists ? requestedId : createId(),
      createdAt: typeof reading.createdAt === "string" && reading.createdAt
        ? reading.createdAt
        : new Date().toISOString(),
      question: typeof reading.question === "string" ? reading.question : "",
      userNote: typeof reading.userNote === "string" ? reading.userNote : ""
    });

    if (!isReading(savedReading)) {
      return null;
    }

    store.readings.unshift(savedReading);
    if (!writeStore(store)) {
      return null;
    }
    return savedReading;
  }

  function removeReading(id) {
    if (typeof id !== "string" || !id) {
      return false;
    }

    const store = readStore();
    const nextReadings = store.readings.filter(function (reading) {
      return reading.id !== id;
    });
    if (nextReadings.length === store.readings.length) {
      return false;
    }

    return writeStore({
      version: STORAGE_VERSION,
      readings: nextReadings
    });
  }

  function getReading(id) {
    return listReadings().find(function (reading) {
      return reading.id === id;
    }) || null;
  }

  window.LiminalTarotHistory = Object.freeze({
    storageKey: STORAGE_KEY,
    version: STORAGE_VERSION,
    read: readStore,
    list: listReadings,
    get: getReading,
    add: addReading,
    remove: removeReading
  });
})();
