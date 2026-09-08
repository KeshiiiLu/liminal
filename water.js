(function () {
  "use strict";

  const STORAGE_KEY = "liminal_water_v1";
  const SCHEMA_VERSION = 1;
  const DEFAULT_GOAL_ML = 2000;
  const MIN_GOAL_ML = 100;
  const MAX_GOAL_ML = 10000;
  const MAX_ENTRY_ML = 5000;
  const TIME_ZONE = window.LiminalTime?.TIME_ZONE || "Asia/Shanghai";

  const feedbackPools = {
    normal: [
      "嗯，记上了。",
      "喝了就好。",
      "这杯算你的。",
      "慢点喝，别灌。",
      "不错，继续。",
      "我看见了。",
      "今天比昨天自觉。",
      "又一杯。",
      "乖。"
    ],
    low: [
      "今天喝得有点少。",
      "Keshi，水。",
      "别等口渴了才想起来。",
      "你是不是又忘了。",
      "先喝一点。"
    ],
    near: [
      "快到了。",
      "还差一点。",
      "今天还算自觉。",
      "差最后一点，晚上补上。"
    ],
    reached: [
      "够了，今天合格。",
      "嗯，达标。",
      "今天不用我催了。",
      "很好。剩下的正常喝就行。",
      "记住这个感觉，明天继续。"
    ],
    high: [
      "不用为了数字硬喝。",
      "够了，按口渴正常喝。",
      "别把这个当任务刷。"
    ]
  };

  const elements = {
    todayView: document.getElementById("waterTodayView"),
    historyView: document.getElementById("waterHistoryView"),
    viewToggle: document.getElementById("waterViewToggle"),
    todayDate: document.getElementById("waterTodayDate"),
    todayTotal: document.getElementById("waterTodayTotal"),
    goalLabel: document.getElementById("waterGoalLabel"),
    goalButton: document.getElementById("waterGoalButton"),
    progressTrack: document.getElementById("waterProgressTrack"),
    progressFill: document.getElementById("waterProgressFill"),
    progressLabel: document.getElementById("waterProgressLabel"),
    completeMark: document.getElementById("waterCompleteMark"),
    quickButtons: [...document.querySelectorAll("[data-water-amount]")],
    customToggle: document.getElementById("waterCustomToggle"),
    customForm: document.getElementById("waterCustomForm"),
    customAmount: document.getElementById("waterCustomAmount"),
    customTime: document.getElementById("waterCustomTime"),
    customError: document.getElementById("waterCustomError"),
    recordCount: document.getElementById("waterRecordCount"),
    recordList: document.getElementById("waterRecordList"),
    historyList: document.getElementById("waterHistoryList"),
    goalBackdrop: document.getElementById("waterGoalBackdrop"),
    goalClose: document.getElementById("waterGoalClose"),
    goalCancel: document.getElementById("waterGoalCancel"),
    goalForm: document.getElementById("waterGoalForm"),
    goalInput: document.getElementById("waterGoalInput"),
    goalError: document.getElementById("waterGoalError"),
    editBackdrop: document.getElementById("waterEditBackdrop"),
    editClose: document.getElementById("waterEditClose"),
    editCancel: document.getElementById("waterEditCancel"),
    editForm: document.getElementById("waterEditForm"),
    editAmount: document.getElementById("waterEditAmount"),
    editTime: document.getElementById("waterEditTime"),
    editError: document.getElementById("waterEditError"),
    toast: document.getElementById("waterToast")
  };

  let activeDateKey = getTodayKey();
  let state = loadState();
  let currentView = "today";
  let recordingLocked = false;
  let toastTimer = null;
  let lastFeedback = "";
  let editingRecordId = null;

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function hasOwn(target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
  }

  function isDateKey(value) {
    return window.LiminalTime?.isDateKey?.(value) || /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  }

  function getTodayKey() {
    if (window.LiminalTime?.todayKey) return window.LiminalTime.todayKey();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function getCurrentTime() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.hour}:${values.minute}`;
  }

  function getCurrentHour() {
    return Number(getCurrentTime().slice(0, 2));
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `water_${window.crypto.randomUUID()}`;
    }
    return `water_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function validPositiveInteger(value, maximum = Number.MAX_SAFE_INTEGER) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 && number <= maximum;
  }

  function isValidTime(value) {
    return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));
  }

  function isTodayTimeAllowed(value) {
    return isValidTime(value) && value <= getCurrentTime();
  }

  function createEmptyState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      settings: {
        dailyGoalMl: DEFAULT_GOAL_ML
      },
      days: {},
      updatedAt: null
    };
  }

  function normalizeRecord(record, dateKey, index) {
    if (!isPlainObject(record) || !validPositiveInteger(record.amountMl, MAX_ENTRY_ML)) return null;
    const time = isValidTime(record.time)
      ? String(record.time)
      : "";
    return {
      ...record,
      id: typeof record.id === "string" && record.id
        ? record.id
        : `water_legacy_${dateKey}_${index}_${time || "unknown"}_${record.amountMl}`,
      time,
      amountMl: Number(record.amountMl),
      createdAt: typeof record.createdAt === "string" ? record.createdAt : `${dateKey}T${time || "00:00"}:00+08:00`
    };
  }

  function normalizeState(parsed) {
    if (!isPlainObject(parsed)) return createEmptyState();
    const sourceSettings = isPlainObject(parsed.settings) ? parsed.settings : {};
    const dailyGoalMl = validPositiveInteger(sourceSettings.dailyGoalMl, MAX_GOAL_ML)
      ? Number(sourceSettings.dailyGoalMl)
      : DEFAULT_GOAL_ML;
    const sourceDays = isPlainObject(parsed.days) ? parsed.days : {};
    const days = {};

    Object.entries(sourceDays).forEach(([dateKey, day], dayIndex) => {
      if (!isDateKey(dateKey) || !isPlainObject(day)) return;
      const records = Array.isArray(day.records)
        ? day.records.map((record, index) => normalizeRecord(record, dateKey, index + dayIndex)).filter(Boolean)
        : [];
      days[dateKey] = {
        ...day,
        date: dateKey,
        goalMl: validPositiveInteger(day.goalMl, MAX_GOAL_ML) ? Number(day.goalMl) : dailyGoalMl,
        records
      };
    });

    return {
      ...parsed,
      schemaVersion: SCHEMA_VERSION,
      settings: {
        ...sourceSettings,
        dailyGoalMl
      },
      days,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
    };
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    try {
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      console.error("喝水记录无法解析；页面已使用空白安全状态，原始 localStorage 尚未删除。", error);
      return createEmptyState();
    }
  }

  function saveState() {
    try {
      state.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("喝水记录保存失败。", error);
      showToast("这次没有存进去，再试一下。", "warning");
      return false;
    }
  }

  function currentGoal() {
    const dayGoal = state.days[activeDateKey]?.goalMl;
    return validPositiveInteger(dayGoal, MAX_GOAL_ML)
      ? Number(dayGoal)
      : Number(state.settings.dailyGoalMl) || DEFAULT_GOAL_ML;
  }

  function ensureDay(dateKey) {
    if (!isPlainObject(state.days[dateKey])) {
      state.days[dateKey] = {
        date: dateKey,
        goalMl: Number(state.settings.dailyGoalMl) || DEFAULT_GOAL_ML,
        records: []
      };
    }
    if (!Array.isArray(state.days[dateKey].records)) state.days[dateKey].records = [];
    return state.days[dateKey];
  }

  function totalForDay(day) {
    if (!isPlainObject(day) || !Array.isArray(day.records)) return 0;
    return day.records.reduce((total, record) => total + (Number(record.amountMl) || 0), 0);
  }

  function formatDate(dateKey, includeWeekday = true) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "UTC",
      month: "long",
      day: "numeric",
      ...(includeWeekday ? { weekday: "short" } : {})
    }).format(date);
  }

  function make(tag, className = "", text = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function chooseFeedback(poolName) {
    const pool = feedbackPools[poolName] || feedbackPools.normal;
    const candidates = pool.length > 1 ? pool.filter((line) => line !== lastFeedback) : pool;
    const line = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
    lastFeedback = line;
    return line;
  }

  function feedbackFor(previousTotal, nextTotal, goal) {
    const ratio = goal > 0 ? nextTotal / goal : 0;
    if (ratio >= 1.5) return chooseFeedback("high");
    if (previousTotal < goal && nextTotal >= goal) return chooseFeedback("reached");
    if (ratio >= 1) return chooseFeedback("normal");
    if (ratio >= 0.82) return chooseFeedback("near");
    if (getCurrentHour() >= 14 && ratio < 0.35) return chooseFeedback("low");
    return chooseFeedback("normal");
  }

  function showToast(message, kind = "") {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    if (kind) elements.toast.dataset.kind = kind;
    else delete elements.toast.dataset.kind;
    elements.toast.classList.add("visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("visible"), 2200);
  }

  function renderToday() {
    const day = state.days[activeDateKey];
    const records = Array.isArray(day?.records) ? day.records : [];
    const total = totalForDay(day);
    const goal = currentGoal();
    const percent = goal > 0 ? Math.round((total / goal) * 100) : 0;
    const visualPercent = Math.min(100, Math.max(0, percent));

    elements.todayDate.textContent = formatDate(activeDateKey);
    elements.todayDate.dateTime = activeDateKey;
    elements.todayTotal.textContent = String(total);
    elements.goalLabel.textContent = `${goal} ml`;
    elements.progressFill.style.width = `${visualPercent}%`;
    elements.progressLabel.textContent = `${percent}%`;
    elements.progressTrack.setAttribute("aria-valuenow", String(visualPercent));
    elements.progressTrack.setAttribute("aria-valuetext", `${total} / ${goal} ml，${percent}%`);
    elements.completeMark.hidden = total < goal;
    elements.recordCount.textContent = `${records.length} 杯`;

    renderRecords(records);
  }

  function renderRecords(records) {
    elements.recordList.innerHTML = "";
    if (!records.length) {
      elements.recordList.appendChild(make("div", "water-empty", "今天还没有记录。喝的时候顺手点一下。"));
      return;
    }

    const sorted = [...records].sort((first, second) => (
      String(second.time).localeCompare(String(first.time)) ||
      String(second.createdAt).localeCompare(String(first.createdAt))
    ));

    sorted.forEach((record) => {
      const row = make("article", "water-record-item");
      row.dataset.recordId = record.id;
      const time = make("time", "", record.time || "—");
      const amount = make("strong", "", `${record.amountMl} ml`);
      const actions = make("div", "water-record-actions");
      const edit = make("button", "water-record-edit", "编辑");
      edit.type = "button";
      edit.setAttribute("aria-label", `编辑 ${record.time || "这条"} 的 ${record.amountMl} ml 记录`);
      edit.addEventListener("click", () => openEditSheet(record.id));
      const remove = make("button", "water-record-delete", "×");
      remove.type = "button";
      remove.setAttribute("aria-label", `删除 ${record.time || "这条"} 的 ${record.amountMl} ml 记录`);
      remove.addEventListener("click", () => deleteRecord(record.id));
      actions.append(edit, remove);
      row.append(time, amount, actions);
      elements.recordList.appendChild(row);
    });
  }

  function renderHistory() {
    elements.historyList.innerHTML = "";
    const days = Object.entries(state.days)
      .filter(([, day]) => Array.isArray(day?.records) && day.records.length > 0)
      .sort(([first], [second]) => second.localeCompare(first));

    if (!days.length) {
      elements.historyList.appendChild(make("div", "water-empty", "还没有以前的饮水记录。"));
      return;
    }

    days.forEach(([dateKey, day]) => {
      const total = totalForDay(day);
      const goal = validPositiveInteger(day.goalMl, MAX_GOAL_ML) ? Number(day.goalMl) : DEFAULT_GOAL_ML;
      const percent = goal > 0 ? Math.round((total / goal) * 100) : 0;
      const item = make("article", "water-history-item");
      const main = make("div", "water-history-main");
      main.append(make("strong", "", formatDate(dateKey, false)), make("span", "", `${total} / ${goal} ml`));
      const progress = make("div", "water-history-progress");
      const fill = make("span");
      fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      progress.appendChild(fill);
      const meta = make("div", "water-history-meta");
      meta.append(make("span", "", `${day.records.length} 杯`), make("span", "", `${percent}%`));
      item.append(main, progress, meta);
      elements.historyList.appendChild(item);
    });
  }

  function setRecordingLock(locked) {
    recordingLocked = locked;
    elements.quickButtons.forEach((button) => { button.disabled = locked; });
    const customSubmit = elements.customForm.querySelector("button[type='submit']");
    if (customSubmit) customSubmit.disabled = locked;
  }

  function addWater(amount, time = getCurrentTime()) {
    const safeAmount = Number(amount);
    const safeTime = String(time || getCurrentTime());
    if (
      recordingLocked ||
      !validPositiveInteger(safeAmount, MAX_ENTRY_ML) ||
      !isTodayTimeAllowed(safeTime)
    ) return false;
    checkDateRollover();
    setRecordingLock(true);

    const day = ensureDay(activeDateKey);
    const previousTotal = totalForDay(day);
    const record = {
      id: createId(),
      time: safeTime,
      amountMl: safeAmount,
      createdAt: new Date().toISOString()
    };
    day.records.push(record);

    if (!saveState()) {
      day.records.pop();
      setRecordingLock(false);
      return false;
    }

    renderToday();
    showToast(feedbackFor(previousTotal, previousTotal + safeAmount, currentGoal()));
    window.setTimeout(() => setRecordingLock(false), 360);
    return true;
  }

  function openEditSheet(recordId) {
    checkDateRollover();
    const record = state.days[activeDateKey]?.records?.find((item) => item.id === recordId);
    if (!record) return;
    editingRecordId = record.id;
    elements.editAmount.value = String(record.amountMl);
    elements.editTime.value = isValidTime(record.time) ? record.time : getCurrentTime();
    elements.editTime.max = getCurrentTime();
    elements.editError.hidden = true;
    elements.editBackdrop.hidden = false;
    window.setTimeout(() => elements.editAmount.focus(), 40);
  }

  function closeEditSheet() {
    editingRecordId = null;
    elements.editForm.reset();
    elements.editError.hidden = true;
    elements.editBackdrop.hidden = true;
  }

  function saveEditedRecord(event) {
    event.preventDefault();
    checkDateRollover();
    const amount = Number(elements.editAmount.value);
    const time = String(elements.editTime.value || "");
    if (!validPositiveInteger(amount, MAX_ENTRY_ML)) {
      elements.editError.textContent = `请输入 1–${MAX_ENTRY_ML} ml 之间的整数。`;
      elements.editError.hidden = false;
      return;
    }
    if (!isTodayTimeAllowed(time)) {
      elements.editError.textContent = "请选择今天已经发生的时间。";
      elements.editError.hidden = false;
      return;
    }

    const day = state.days[activeDateKey];
    const record = day?.records?.find((item) => item.id === editingRecordId);
    if (!record) {
      closeEditSheet();
      showToast("这条记录已经不存在了。", "warning");
      return;
    }

    const previous = { amountMl: record.amountMl, time: record.time };
    record.amountMl = amount;
    record.time = time;
    if (!saveState()) {
      record.amountMl = previous.amountMl;
      record.time = previous.time;
      return;
    }

    closeEditSheet();
    renderToday();
    showToast("已修改。");
  }

  function deleteRecord(recordId) {
    const day = state.days[activeDateKey];
    if (!Array.isArray(day?.records)) return;
    const index = day.records.findIndex((record) => record.id === recordId);
    if (index < 0 || !window.confirm("删除这条喝水记录吗？")) return;
    const [removed] = day.records.splice(index, 1);
    if (!saveState()) {
      day.records.splice(index, 0, removed);
      return;
    }
    renderToday();
    showToast("删掉了，今天的总量也改好了。");
  }

  function setView(view) {
    checkDateRollover();
    currentView = view === "history" ? "history" : "today";
    const showingHistory = currentView === "history";
    elements.todayView.hidden = showingHistory;
    elements.historyView.hidden = !showingHistory;
    elements.viewToggle.textContent = showingHistory ? "今天" : "历史";
    if (showingHistory) renderHistory();
  }

  function setCustomOpen(open) {
    elements.customForm.hidden = !open;
    elements.customToggle.setAttribute("aria-expanded", String(open));
    elements.customError.hidden = true;
    if (open) {
      elements.customTime.max = getCurrentTime();
      window.setTimeout(() => elements.customAmount.focus(), 40);
    }
  }

  function openGoalSheet() {
    checkDateRollover();
    elements.goalInput.value = String(currentGoal());
    elements.goalError.hidden = true;
    elements.goalBackdrop.hidden = false;
    window.setTimeout(() => elements.goalInput.focus(), 40);
  }

  function closeGoalSheet() {
    elements.goalBackdrop.hidden = true;
  }

  function saveGoal(event) {
    event.preventDefault();
    checkDateRollover();
    const goal = Number(elements.goalInput.value);
    if (!Number.isInteger(goal) || goal < MIN_GOAL_ML || goal > MAX_GOAL_ML) {
      elements.goalError.textContent = `请输入 ${MIN_GOAL_ML}–${MAX_GOAL_ML} ml 之间的整数。`;
      elements.goalError.hidden = false;
      return;
    }
    const previousGoal = state.settings.dailyGoalMl;
    const day = ensureDay(activeDateKey);
    const previousDayGoal = day.goalMl;
    state.settings.dailyGoalMl = goal;
    day.goalMl = goal;
    if (!saveState()) {
      state.settings.dailyGoalMl = previousGoal;
      day.goalMl = previousDayGoal;
      return;
    }
    closeGoalSheet();
    renderToday();
    showToast(`每日目标改成 ${goal} ml。`);
  }

  function checkDateRollover() {
    const nextDateKey = getTodayKey();
    if (nextDateKey === activeDateKey) return;
    activeDateKey = nextDateKey;
    setCustomOpen(false);
    closeEditSheet();
    renderToday();
    if (currentView === "history") renderHistory();
  }

  elements.quickButtons.forEach((button) => {
    button.addEventListener("click", () => addWater(Number(button.dataset.waterAmount)));
  });

  elements.customToggle.addEventListener("click", () => setCustomOpen(elements.customForm.hidden));

  elements.customForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(elements.customAmount.value);
    const chosenTime = String(elements.customTime.value || "");
    const time = chosenTime || getCurrentTime();
    if (!validPositiveInteger(amount, MAX_ENTRY_ML)) {
      elements.customError.textContent = `请输入 1–${MAX_ENTRY_ML} ml 之间的整数。`;
      elements.customError.hidden = false;
      return;
    }
    if (!isTodayTimeAllowed(time)) {
      elements.customError.textContent = "只能补记今天已经发生的时间。";
      elements.customError.hidden = false;
      return;
    }
    if (addWater(amount, time)) {
      elements.customAmount.value = "";
      elements.customTime.value = "";
      setCustomOpen(false);
    }
  });

  elements.viewToggle.addEventListener("click", () => setView(currentView === "today" ? "history" : "today"));
  elements.goalButton.addEventListener("click", openGoalSheet);
  elements.goalClose.addEventListener("click", closeGoalSheet);
  elements.goalCancel.addEventListener("click", closeGoalSheet);
  elements.goalBackdrop.addEventListener("click", (event) => {
    if (event.target === elements.goalBackdrop) closeGoalSheet();
  });
  elements.goalForm.addEventListener("submit", saveGoal);
  elements.editClose.addEventListener("click", closeEditSheet);
  elements.editCancel.addEventListener("click", closeEditSheet);
  elements.editBackdrop.addEventListener("click", (event) => {
    if (event.target === elements.editBackdrop) closeEditSheet();
  });
  elements.editForm.addEventListener("submit", saveEditedRecord);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.editBackdrop.hidden) closeEditSheet();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkDateRollover();
  });
  window.addEventListener("focus", checkDateRollover);
  window.addEventListener("pageshow", checkDateRollover);
  window.setInterval(checkDateRollover, 30000);

  renderToday();

  window.LiminalWater = {
    STORAGE_KEY,
    SCHEMA_VERSION,
    getState: () => state,
    addWater,
    totalForDate: (dateKey) => totalForDay(state.days[dateKey]),
    refreshDate: checkDateRollover
  };
})();
