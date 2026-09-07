/* Liminal · unified reality date utilities (Asia/Shanghai, UTC+8). */

(function () {
  "use strict";

  const TIME_ZONE = "Asia/Shanghai";
  const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function isDateKey(value) {
    if (!DATE_KEY_PATTERN.test(String(value || ""))) return false;
    const [year, month, day] = String(value).split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;
  }

  function todayKey(value = new Date()) {
    if (typeof value === "string" && isDateKey(value)) return value;
    const date = value instanceof Date ? value : new Date(value);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(safeDate);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function dateFromKey(dateKey) {
    if (!isDateKey(dateKey)) throw new Error(`Invalid date key: ${dateKey}`);
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  function toDateKey(date) {
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }

  function addDays(dateKey, amount) {
    const date = dateFromKey(dateKey);
    date.setUTCDate(date.getUTCDate() + Number(amount || 0));
    return toDateKey(date);
  }

  function addMonths(period, amount) {
    if (!/^\d{4}-\d{2}$/.test(String(period || ""))) {
      throw new Error(`Invalid month key: ${period}`);
    }
    const [year, month] = period.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1 + Number(amount || 0), 1));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
  }

  function enumerateDateKeys(start, end) {
    if (!isDateKey(start) || !isDateKey(end) || start > end) return [];
    const result = [];
    for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
      result.push(cursor);
    }
    return result;
  }

  function mondayWeekRange(dateKey) {
    const date = dateFromKey(dateKey);
    const weekday = date.getUTCDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const start = addDays(dateKey, mondayOffset);
    return { start, end: addDays(start, 6) };
  }

  function monthKey(dateKey) {
    if (!isDateKey(dateKey)) return "";
    return dateKey.slice(0, 7);
  }

  window.LiminalTime = {
    TIME_ZONE,
    isDateKey,
    todayKey,
    dateFromKey,
    toDateKey,
    addDays,
    addMonths,
    enumerateDateKeys,
    mondayWeekRange,
    monthKey
  };
})();
