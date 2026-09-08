/* Liminal Sleep · persistence, scheduling and state machine. */

(function (global) {
  "use strict";

  const DATA = global.LiminalSleepData;
  if (!DATA) throw new Error("LiminalSleepData must load before sleep-core.js");
  const CORPUS = global.LiminalSleepCorpus;
  if (!CORPUS) throw new Error("LiminalSleepCorpus must load before sleep-core.js");

  const CONFIG = DATA.CONFIG;
  const KEYS = Object.freeze({
    state: "liminal_sleep_state_v1",
    history: "liminal_sleep_history_v1",
    corpusHistory: "liminal_sleep_corpus_history_v1",
    calendar: "liminal_calendar_preview_v1"
  });
  const NIGHT_CUTOFF_HOUR = 6;
  const HARD_EVENT_TYPES = new Set([
    "class", "course", "clinical", "internship", "exam",
    "appointment", "transport", "flight", "train", "work"
  ]);

  function safeParse(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed === null ? fallback : parsed;
    } catch (error) {
      console.warn("Sleep 数据读取失败，已保留原始存储。", error);
      return fallback;
    }
  }

  function readJSON(key, fallback) {
    const raw = global.localStorage.getItem(key);
    return raw === null ? fallback : safeParse(raw, fallback);
  }

  function writeJSON(key, value) {
    global.localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function todayKey(value = new Date()) {
    if (global.LiminalTime?.todayKey) return global.LiminalTime.todayKey(value);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(value);
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${map.year}-${map.month}-${map.day}`;
  }

  function addDays(dateKey, amount) {
    if (global.LiminalTime?.addDays) return global.LiminalTime.addDays(dateKey, amount);
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + amount));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }

  function localHour(value = new Date()) {
    return Number(new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Shanghai", hour: "2-digit", hourCycle: "h23"
    }).format(value));
  }

  function nightDateKey(value = new Date()) {
    const dateKey = todayKey(value);
    return localHour(value) < NIGHT_CUTOFF_HOUR ? addDays(dateKey, -1) : dateKey;
  }

  function atTime(dateKey, time) {
    if (!/^\d{2}:\d{2}$/.test(String(time || ""))) return null;
    const date = new Date(`${dateKey}T${time}:00+08:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function addMinutes(value, amount) {
    const date = value instanceof Date ? value : new Date(value);
    return new Date(date.getTime() + amount * 60000);
  }

  function iso(value) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function timeLabel(value) {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).format(date);
  }

  function minutesUntil(then, from = new Date()) {
    if (!then) return null;
    return Math.round((new Date(then).getTime() - new Date(from).getTime()) / 60000);
  }

  function normalizeExplicitType(value) {
    const type = String(value || "").trim().toLowerCase();
    if (!type) return "";
    if (/见习|实习|clinic|clinical|intern/.test(type)) return "clinical";
    if (/考试|exam|test/.test(type)) return "exam";
    if (/课程|上课|class|course|lecture/.test(type)) return "course";
    if (/预约|appointment|meeting|门诊|接诊/.test(type)) return "appointment";
    if (/航班|flight|高铁|火车|动车|train|transport|赶车/.test(type)) return "transport";
    if (/工作|work/.test(type)) return "work";
    return type;
  }

  function inferHardType(title, explicitType, tags = []) {
    const normalized = normalizeExplicitType(explicitType);
    if (HARD_EVENT_TYPES.has(normalized)) return normalized;
    const tagText = Array.isArray(tags) ? tags.join(" ") : String(tags || "");
    const source = `${title || ""} ${tagText}`;
    if (/见习|实习|临床|接诊|门诊/.test(source)) return "clinical";
    if (/考试|考核|面试|答辩/.test(source)) return "exam";
    if (/上课|课程|早八|考研课|内科学|神经|讲座|课堂/.test(source)) return "course";
    if (/预约|约诊|会议|准时到|复诊/.test(source)) return "appointment";
    if (/航班|机场|高铁|火车|动车|车次|赶车|出发/.test(source)) return "transport";
    return "";
  }

  function readCalendar() {
    const calendar = readJSON(KEYS.calendar, null);
    return calendar && typeof calendar === "object" && !Array.isArray(calendar) ? calendar : null;
  }

  function calendarSkeleton() {
    return {
      milestones: {}, body: {}, bodyLuzhen: {}, sleep: {}, sleepLuzhen: {},
      cycle: { periods: [], customSymptomPresets: [], actualPeriod: [] },
      sexCustomPositionPresets: [], sex: {}, transmissions: [], schedule: {}
    };
  }

  function extractScheduleEvents(calendar, dateKey, personId = "keshi") {
    const rows = calendar?.schedule?.[dateKey];
    if (!Array.isArray(rows)) return [];
    const result = [];

    rows.forEach((row, rowIndex) => {
      if (!row || typeof row !== "object") return;

      if (row.startTime && row.title) {
        const owner = row.owner || "luzhen";
        if (owner === personId || owner === "both") {
          result.push({
            id: row.id || row.simulationId || `${dateKey}-${rowIndex}-${personId}`,
            dateKey,
            time: row.startTime,
            title: row.title,
            explicitType: row.eventType,
            tags: row.tags || [],
            owner: personId
          });
        }
      }

      const isLuzhen = personId === "luzhen";
      const title = isLuzhen ? row.luzhen : row.keshi;
      const time = isLuzhen ? row.luzhenTime : row.keshiTime;
      if (!title || !time) return;
      result.push({
        id: row.id || row.simulationId || `${dateKey}-${rowIndex}-${personId}`,
        dateKey,
        time,
        title,
        explicitType: isLuzhen ? row.luzhenEventType : row.keshiEventType,
        tags: (isLuzhen ? row.luzhenTags : row.keshiTags) || [],
        owner: personId
      });
    });

    return result;
  }

  function getNextHardEvent(calendar, dateKey, personId = "keshi") {
    return extractScheduleEvents(calendar, dateKey, personId)
      .map((event) => ({ ...event, eventType: inferHardType(event.title, event.explicitType, event.tags) }))
      .filter((event) => event.eventType && atTime(dateKey, event.time))
      .sort((left, right) => left.time.localeCompare(right.time))[0] || null;
  }

  function buildWakePlan(calendar, dateKey, personId = "keshi", now = new Date()) {
    const event = getNextHardEvent(calendar, dateKey, personId);
    let preWake;
    let idealWake;
    let mustWake;
    let hardWake;
    let leave;
    let eventStart = null;

    if (event) {
      eventStart = atTime(dateKey, event.time);
      preWake = addMinutes(eventStart, -CONFIG.classPreWakeBeforeMinutes);
      idealWake = addMinutes(eventStart, -CONFIG.classIdealWakeBeforeMinutes);
      mustWake = addMinutes(eventStart, -CONFIG.classMustWakeBeforeMinutes);
      hardWake = addMinutes(eventStart, -CONFIG.classHardLimitBeforeMinutes);
      leave = addMinutes(eventStart, -CONFIG.classLeaveBeforeMinutes);
    } else {
      preWake = atTime(dateKey, CONFIG.relaxedPreWakeTime);
      idealWake = atTime(dateKey, CONFIG.relaxedIdealWakeTime);
      mustWake = atTime(dateKey, CONFIG.relaxedMustWakeTime);
      hardWake = atTime(dateKey, CONFIG.relaxedHardWakeTime);
    }

    const recommendedBedtime = addMinutes(idealWake, -CONFIG.targetSleepMinutes);
    const windowStart = addMinutes(recommendedBedtime, -CONFIG.sleepStartWindowLeadMinutes);
    const isEarly = Boolean(event && Number(event.time.slice(0, 2)) < 10);

    return {
      dateKey,
      personId,
      preWakeAt: iso(preWake),
      idealWakeAt: iso(idealWake),
      mustWakeAt: iso(mustWake),
      hardWakeAt: iso(hardWake),
      leaveAt: iso(leave),
      eventStartAt: iso(eventStart),
      eventId: event?.id || null,
      eventType: event?.eventType || null,
      eventTitle: event?.title || null,
      recommendedBedtime: iso(recommendedBedtime),
      recommendedSleepStartWindow: { start: iso(windowStart), end: iso(recommendedBedtime) },
      minutesUntilRecommendedWake: minutesUntil(idealWake, now),
      isEarlyMorningEvent: isEarly,
      nextHardEvent: event ? { ...event, startAt: iso(eventStart) } : null
    };
  }

  function hash(text) {
    let value = 2166136261;
    for (const character of String(text || "")) {
      value ^= character.charCodeAt(0);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function deterministicOffset(seed, values) {
    return values[hash(seed) % values.length];
  }

  function createLuzhenPlan(session, calendar) {
    const ownPlan = buildWakePlan(calendar, session.wakePlan.dateKey, "luzhen", new Date(session.startedAt));
    const sleepOffset = deterministicOffset(`${session.sessionId}:sleep`, [-4, 2, 7, 12, 18]);
    const wakeOffset = deterministicOffset(`${session.sessionId}:wake`, [-22, -14, -8, -3, 4]);
    const estimatedSleepAt = addMinutes(session.estimatedSleepAt, sleepOffset);
    const wakeAt = ownPlan.nextHardEvent
      ? new Date(ownPlan.idealWakeAt)
      : addMinutes(session.wakePlan.idealWakeAt, wakeOffset);
    return {
      estimatedSleepAt: iso(estimatedSleepAt),
      wakeAt: iso(wakeAt),
      basedOnOwnCalendar: Boolean(ownPlan.nextHardEvent),
      nextHardEvent: ownPlan.nextHardEvent
    };
  }

  function phaseEndAt(phase, startedAt, session) {
    const start = new Date(startedAt);
    if (phase === "delay") return iso(addMinutes(start, session.effectiveDelayMinutes));
    if (phase === "winding_down") return iso(addMinutes(start, CONFIG.windingDownMinutes));
    if (phase === "soothing") return iso(addMinutes(start, CONFIG.soothingQuietMinutes));
    if (phase === "direct") return iso(new Date(start.getTime() + CONFIG.directQuietSeconds * 1000));
    if (phase === "sleep_retry" || phase === "night_wake") return iso(addMinutes(start, CONFIG.retryQuietMinutes));
    if (phase === "phone_down") return iso(addMinutes(start, CONFIG.phoneDownMinutes));
    return null;
  }

  function createSession(location, entryMode, now = new Date(), calendar = readCalendar()) {
    const startedAt = iso(now);
    const date = nightDateKey(now);
    const wakeDate = addDays(date, 1);
    const wakePlan = buildWakePlan(calendar, wakeDate, "keshi", now);
    const isLate = wakePlan.isEarlyMorningEvent && now >= new Date(wakePlan.recommendedSleepStartWindow.start);
    const effectiveDelayMinutes = isLate ? CONFIG.lateDelayMinutes : CONFIG.defaultDelayMinutes;
    const phase = entryMode === "delay" ? "delay" : entryMode === "direct" ? "direct" : "soothing";
    const session = {
      schemaVersion: 1,
      sessionId: `sleep_${Date.now()}_${hash(startedAt).toString(36)}`,
      status: "active",
      date,
      endDate: wakeDate,
      location: location === "main_world" ? "main_world" : "loft",
      worldContext: {
        location: location === "main_world" ? "main_world" : "loft",
        canPhysicallyInteract: location === "loft" ? true : null,
        source: location === "loft" ? "sleep-location" : "reserved-world-context"
      },
      entryMode,
      phase,
      startedAt,
      createdAt: startedAt,
      updatedAt: startedAt,
      phaseStartedAt: startedAt,
      lastInteractionAt: startedAt,
      lastMeaningfulInteractionAt: startedAt,
      delayExtensionCount: 0,
      effectiveDelayMinutes,
      delayFinishedAt: null,
      soothingStartedAt: phase === "soothing" ? startedAt : null,
      estimatedSleepAt: iso(addMinutes(now, CONFIG.configurableSleepEstimateMinutes)),
      nightWakeEvents: [],
      wakePlan,
      nextHardEvent: wakePlan.nextHardEvent,
      behaviorContext: analyzeSleepHistory(),
      sleepContext: {
        nextEventStart: wakePlan.eventStartAt,
        nextEventType: wakePlan.eventType,
        recommendedWakeTime: wakePlan.idealWakeAt,
        hardWakeLimit: wakePlan.hardWakeAt,
        leaveTime: wakePlan.leaveAt,
        minutesUntilRecommendedWake: wakePlan.minutesUntilRecommendedWake,
        isEarlyMorningEvent: wakePlan.isEarlyMorningEvent
      },
      wakeStartedAt: null,
      wakeConfirmedAt: null,
      calendarSource: "liminal-sleep-v1"
    };
    session.phaseEndsAt = phaseEndAt(phase, startedAt, session);
    session.luzhenSleep = createLuzhenPlan(session, calendar);
    return session;
  }

  function loadState() {
    const state = readJSON(KEYS.state, null);
    return state && typeof state === "object" && !Array.isArray(state) ? state : null;
  }

  function loadHistory() {
    const history = readJSON(KEYS.history, []);
    return Array.isArray(history) ? history : [];
  }

  function loadCorpusHistory() {
    const history = readJSON(KEYS.corpusHistory, null);
    if (!history || typeof history !== "object" || !Array.isArray(history.selections)) {
      return { schemaVersion: 1, selections: [], updatedAt: null };
    }
    return {
      schemaVersion: 1,
      selections: history.selections.slice(-180),
      updatedAt: history.updatedAt || null
    };
  }

  function minutesOfDay(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return Number(values.hour) * 60 + Number(values.minute);
  }

  function analyzeSleepHistory() {
    const recent = loadHistory().filter((item) => item && typeof item === "object").slice(0, 7);
    let consecutiveLateNights = 0;
    for (const session of recent) {
      const time = minutesOfDay(session.estimatedSleepAt);
      const isLate = time !== null && time >= 45 && time < 360;
      if (!isLate) break;
      consecutiveLateNights += 1;
    }
    const recentDirectSleepCount = recent.filter((item) => item.entryMode === "direct").length;
    const recentDelayCount = recent.filter((item) => item.entryMode === "delay").length;
    const lastNightSleepTime = recent[0]?.estimatedSleepAt || null;
    const lastNightMinutes = minutesOfDay(lastNightSleepTime);
    const tags = [];
    if (consecutiveLateNights >= 2) tags.push("consecutive_late_nights");
    if (recentDirectSleepCount >= 1) tags.push("recent_direct");
    if (recentDirectSleepCount >= 3) tags.push("repeated_direct");
    if (recentDelayCount >= 2) tags.push("recent_delay");
    if (lastNightMinutes !== null && lastNightMinutes >= 45 && lastNightMinutes < 360) tags.push("last_night_late");
    return { consecutiveLateNights, recentDirectSleepCount, recentDelayCount, lastNightSleepTime, tags };
  }

  function saveState(session, sync = true) {
    session.updatedAt = new Date().toISOString();
    writeJSON(KEYS.state, session);
    if (sync) syncCalendar(session);
    return session;
  }

  function archiveSession(session) {
    const history = loadHistory();
    const index = history.findIndex((item) => item?.sessionId === session.sessionId);
    if (index >= 0) history[index] = session;
    else history.unshift(session);
    writeJSON(KEYS.history, history);
    return history;
  }

  function setPhase(session, phase, at = new Date(), meaningful = false) {
    const timestamp = iso(at);
    session.phase = phase;
    session.phaseStartedAt = timestamp;
    if (meaningful) {
      session.lastInteractionAt = timestamp;
      session.lastMeaningfulInteractionAt = timestamp;
      session.estimatedSleepAt = iso(addMinutes(at, CONFIG.configurableSleepEstimateMinutes));
    }
    if (phase === "soothing" && !session.soothingStartedAt) session.soothingStartedAt = timestamp;
    session.phaseEndsAt = phaseEndAt(phase, timestamp, session);
    session.luzhenSleep = createLuzhenPlan(session, readCalendar());
    return session;
  }

  function nextEveningPhase(session, at) {
    if (session.phase === "delay") {
      session.delayFinishedAt = iso(at);
      return setPhase(session, "winding_down", at, false);
    }
    if (session.phase === "winding_down") return setPhase(session, "soothing", at, false);
    if (["soothing", "direct", "sleep_retry", "night_wake"].includes(session.phase)) {
      return setPhase(session, "phone_down", at, false);
    }
    if (session.phase === "phone_down") return setPhase(session, "quiet_sleep", at, false);
    return session;
  }

  function deriveWakePhase(session, now = new Date()) {
    if (!session?.wakeStartedAt) return session?.phase;
    const hardAt = session.wakePlan?.hardWakeAt ? new Date(session.wakePlan.hardWakeAt) : null;
    if (hardAt && now >= hardAt) return "hard_wake";
    const profile = session.wakePlan?.nextHardEvent
      ? CONFIG.wakePhaseMinutes.scheduled
      : CONFIG.wakePhaseMinutes.relaxed;
    const elapsed = (now.getTime() - new Date(session.wakeStartedAt).getTime()) / 60000;
    if (elapsed < profile.soft_wake) return "soft_wake";
    if (elapsed < profile.soft_wake + profile.cuddle_buffer) return "cuddle_buffer";
    if (elapsed < profile.soft_wake + profile.cuddle_buffer + profile.gentle_wake) return "gentle_wake";
    return "getting_up";
  }

  function reconcile(session, now = new Date()) {
    if (!session || session.status !== "active") return { session, changed: false };
    let changed = false;
    let guard = 0;

    if (session.wakeStartedAt) {
      const wakePhase = deriveWakePhase(session, now);
      if (wakePhase !== session.phase) {
        session.phase = wakePhase;
        session.phaseStartedAt = iso(now);
        changed = true;
      }
      const hard = session.wakePlan?.hardWakeAt ? new Date(session.wakePlan.hardWakeAt) : null;
      if (hard && now >= addMinutes(hard, CONFIG.automaticSessionCloseAfterHardWakeMinutes)) {
        session.status = "completed";
        session.endedAt = iso(now);
        changed = true;
        archiveSession(session);
      }
    } else {
      while (session.phaseEndsAt && now >= new Date(session.phaseEndsAt) && guard < 8) {
        nextEveningPhase(session, new Date(session.phaseEndsAt));
        changed = true;
        guard += 1;
      }
    }

    if (changed) saveState(session);
    return { session, changed };
  }

  function extendDelay(session, now = new Date()) {
    if (session.phase !== "delay" || session.delayExtensionCount >= CONFIG.maxDelayExtensions) return session;
    session.delayExtensionCount += 1;
    session.phaseStartedAt = iso(now);
    session.phaseEndsAt = iso(addMinutes(now, CONFIG.delayExtensionMinutes));
    session.lastInteractionAt = iso(now);
    session.lastMeaningfulInteractionAt = iso(now);
    session.estimatedSleepAt = iso(addMinutes(now, CONFIG.configurableSleepEstimateMinutes));
    session.luzhenSleep = createLuzhenPlan(session, readCalendar());
    return saveState(session);
  }

  function beginSoothing(session, now = new Date()) {
    if (session.phase === "delay") session.delayFinishedAt = iso(now);
    setPhase(session, "soothing", now, true);
    return saveState(session);
  }

  function startRetry(session, type, now = new Date()) {
    const phase = type === "night_wake" ? "night_wake" : "sleep_retry";
    if (phase === "night_wake") {
      session.nightWakeEvents = Array.isArray(session.nightWakeEvents) ? session.nightWakeEvents : [];
      session.nightWakeEvents.push({ at: iso(now), type: "night_wake" });
    }
    setPhase(session, phase, now, true);
    return saveState(session);
  }

  function isWakeWindow(session, now = new Date()) {
    if (!session?.wakePlan?.preWakeAt || session.status !== "active") return false;
    return now >= new Date(session.wakePlan.preWakeAt);
  }

  function beginWake(session, now = new Date()) {
    if (!session.wakeStartedAt) session.wakeStartedAt = iso(now);
    session.phase = deriveWakePhase(session, now) || "soft_wake";
    if (!session.phase.endsWith("wake") && session.phase !== "cuddle_buffer" && session.phase !== "getting_up") {
      session.phase = "soft_wake";
    }
    session.phaseStartedAt = iso(now);
    session.lastInteractionAt = iso(now);
    return saveState(session);
  }

  function confirmWake(session, now = new Date()) {
    session.wakeConfirmedAt = iso(now);
    session.status = "completed";
    session.endedAt = iso(now);
    saveState(session);
    archiveSession(session);
    return session;
  }

  function formatDateSpan(start, end) {
    const startParts = start.split("-").map(Number);
    const endParts = end.split("-").map(Number);
    return `🌙 ${startParts[1]}月${startParts[2]}日 → ${endParts[1]}月${endParts[2]}日`;
  }

  function normalizeCorpusEventType(value, hasHardEvent) {
    const type = String(value || "").toLowerCase();
    if (!hasHardEvent) return "none";
    if (["class", "course"].includes(type)) return "class";
    if (["clinical", "internship"].includes(type)) return "clinical";
    if (type === "exam") return "exam";
    if (type === "appointment") return "appointment";
    if (["transport", "flight", "train", "travel"].includes(type)) return "travel";
    return "other_hard_event";
  }

  function corpusTimeRange(now) {
    const hour = localHour(now);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "day";
    if (hour >= 18 && hour < 23) return "evening";
    if (hour >= 23 || hour < 2) return "late_night";
    return "night";
  }

  function actionFamily(action) {
    if (String(action || "").startsWith("kiss_")) return "kiss";
    if (["hug", "hold", "pull_closer"].includes(action)) return "hold";
    return action || "none";
  }

  function ensureSessionCorpus(session) {
    if (!session.corpus || typeof session.corpus !== "object") {
      session.corpus = { current: null, selections: [], phaseCounts: {} };
    }
    if (!Array.isArray(session.corpus.selections)) session.corpus.selections = [];
    if (!session.corpus.phaseCounts || typeof session.corpus.phaseCounts !== "object") session.corpus.phaseCounts = {};
    return session.corpus;
  }

  function corpusIntervalSeconds(session, phase, count, item) {
    const ranges = {
      delay: [190, 330], winding_down: [75, 130], soothing: count <= 1 ? [75, 115] : [145, 220],
      direct: [22, 30], phone_down: [55, 75], sleep_retry: [135, 220], night_wake: [175, 270],
      soft_wake: [50, 85], cuddle_buffer: [70, 120], gentle_wake: [48, 78],
      getting_up: [34, 58], hard_wake: [24, 42]
    };
    const range = ranges[phase];
    if (!range || phase === "quiet_sleep") return null;
    if (phase === "direct" && count >= 2) return null;
    const spread = range[1] - range[0] + 1;
    return range[0] + (hash(`${session.sessionId}:${phase}:${count}:${item.id}`) % spread);
  }

  function itemMatchesContext(item, context, trigger) {
    if (item.phase !== context.phase) return false;
    if (item.location !== "any" && item.location !== context.location) return false;
    if (item.requiresPhysicalPresence && !context.physicalPresence) return false;
    if (item.trigger !== "any" && item.trigger !== trigger) return false;
    if (item.timeRange !== "any" && item.timeRange !== context.timeRange) return false;
    if (item.nextEventType !== "any" && item.nextEventType !== context.nextEventType) return false;
    if (item.isEarlyMorning !== null && item.isEarlyMorning !== context.isEarlyMorning) return false;
    if (item.userBehavior !== "any" && !context.userBehavior.tags.includes(item.userBehavior)) return false;
    if (item.luzhenState !== "any" && item.luzhenState !== context.luzhenState) return false;
    if (context.tone && item.tone !== context.tone) return false;
    if (context.intensity && item.intensity !== context.intensity) return false;
    return true;
  }

  function chooseWeighted(candidates, context, sessionHistory, globalHistory) {
    const recent = globalHistory.length ? globalHistory.slice(-48) : sessionHistory.slice(-48);
    const usedThisSession = new Set(sessionHistory.map((entry) => entry.id));
    const lastGroups = new Set(recent.slice(-7).map((entry) => entry.directRepeatGroup).filter(Boolean));
    const lastTwo = recent.slice(-2);
    let pool = candidates.filter((item) => !usedThisSession.has(item.id));
    if (pool.length < 5) pool = candidates.slice();
    const outsideCooldown = pool.filter((item) => {
      const reverseIndex = [...recent].reverse().findIndex((entry) => entry.id === item.id);
      return reverseIndex < 0 || reverseIndex >= item.cooldown;
    });
    if (outsideCooldown.length >= 3) pool = outsideCooldown;
    const outsideGroup = pool.filter((item) => !lastGroups.has(item.directRepeatGroup));
    if (outsideGroup.length >= 3) pool = outsideGroup;

    const weighted = pool.map((item) => {
      let score = Math.max(0.05, Number(item.weight) || 1);
      if (lastTwo.length === 2 && lastTwo.every((entry) => entry.tone === item.tone)) score *= 0.18;
      const family = actionFamily(item.physicalAction);
      if (family !== "none" && lastTwo.length === 2 && lastTwo.every((entry) => actionFamily(entry.physicalAction) === family)) score *= 0.12;
      if (context.userBehavior.recentDirectSleepCount >= 3 && item.directRepeatGroup === "direct-praise") score *= 0.25;
      if (context.phase === "soothing" && context.phaseSelectionCount >= 1) {
        if (["quiet", "sleepy", "soft"].includes(item.tone)) score *= 1.7;
        if (["playful", "clingy", "teasing"].includes(item.tone)) score *= 0.38;
        if ((item.text || "").length > 18) score *= 0.65;
      }
      if (item.userBehavior !== "any") score *= 0.55;
      if (item.nextEventType !== "any") score *= 0.62;
      return { item, score };
    });
    const total = weighted.reduce((sum, entry) => sum + entry.score, 0);
    if (!weighted.length || total <= 0) return candidates[0] || null;
    let cursor = (hash(`${context.seed}:${recent.length}`) / 4294967296) * total;
    for (const entry of weighted) {
      cursor -= entry.score;
      if (cursor <= 0) return entry.item;
    }
    return weighted[weighted.length - 1].item;
  }

  function persistCorpusSelection(session, item, now, phaseToken) {
    const corpusState = ensureSessionCorpus(session);
    const count = (corpusState.phaseCounts[phaseToken] || 0) + 1;
    corpusState.phaseCounts[phaseToken] = count;
    const record = {
      id: item.id,
      sessionId: session.sessionId,
      phase: item.phase,
      tone: item.tone,
      physicalAction: item.physicalAction,
      directRepeatGroup: item.directRepeatGroup,
      selectedAt: iso(now)
    };
    corpusState.selections.push(record);
    corpusState.selections = corpusState.selections.slice(-80);
    const interval = corpusIntervalSeconds(session, item.phase, count, item);
    corpusState.current = {
      id: item.id,
      phaseToken,
      selectedAt: record.selectedAt,
      nextDueAt: interval === null ? null : iso(new Date(now.getTime() + interval * 1000))
    };

    const globalHistory = loadCorpusHistory();
    globalHistory.selections.push(record);
    globalHistory.selections = globalHistory.selections.slice(-180);
    globalHistory.updatedAt = record.selectedAt;
    writeJSON(KEYS.corpusHistory, globalHistory);

    const saved = loadState();
    if (saved?.sessionId === session.sessionId) {
      session.updatedAt = record.selectedAt;
      writeJSON(KEYS.state, session);
    }
    return item;
  }

  function pickCorpus(session, phase = session?.phase, options = {}) {
    if (!session) return null;
    const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
    const corpusState = ensureSessionCorpus(session);
    const phaseToken = `${phase}:${session.phaseStartedAt || "legacy"}`;
    const current = corpusState.current;
    const currentItem = current ? CORPUS.items.find((item) => item.id === current.id) : null;
    const due = current?.nextDueAt && now >= new Date(current.nextDueAt);
    const rotationAllowed = phase !== "quiet_sleep" && !(phase === "direct" && (corpusState.phaseCounts[phaseToken] || 0) >= 2);
    if (current?.phaseToken === phaseToken && currentItem) {
      if (!rotationAllowed) return currentItem;
      if (!options.force && !due) return currentItem;
    }

    const behavior = session.behaviorContext && typeof session.behaviorContext === "object"
      ? session.behaviorContext
      : analyzeSleepHistory();
    const nextEventType = normalizeCorpusEventType(session.wakePlan?.eventType, Boolean(session.wakePlan?.nextHardEvent));
    const context = {
      phase,
      location: session.location || "any",
      physicalPresence: session.worldContext?.canPhysicallyInteract === true,
      tone: options.tone || null,
      intensity: options.intensity || null,
      timeRange: corpusTimeRange(now),
      nextEventType,
      isEarlyMorning: Boolean(session.wakePlan?.isEarlyMorningEvent),
      userBehavior: behavior,
      luzhenState: options.luzhenState || (phase === "night_wake"
        ? "half-asleep"
        : ["soothing", "phone_down", "quiet_sleep", "sleep_retry"].includes(phase) ? "sleepy" : "any"),
      phaseSelectionCount: corpusState.phaseCounts[phaseToken] || 0,
      seed: `${session.sessionId}:${phaseToken}:${corpusState.selections.length}:${options.trigger || (due ? "timer" : "enter")}`
    };
    const trigger = options.trigger || (due ? "timer" : "enter");
    let candidates = CORPUS.items.filter((item) => itemMatchesContext(item, context, trigger));
    if (!candidates.length) {
      candidates = CORPUS.items.filter((item) => item.phase === phase)
        .filter((item) => item.location === "any" || item.location === context.location)
        .filter((item) => !item.requiresPhysicalPresence || context.physicalPresence)
        .filter((item) => item.trigger === "any" || item.trigger === trigger);
    }
    if (!candidates.length) return null;
    const item = chooseWeighted(candidates, context, corpusState.selections, loadCorpusHistory().selections);
    return item ? persistCorpusSelection(session, item, now, phaseToken) : null;
  }

  function getNextCorpusAt(session) {
    return ensureSessionCorpus(session).current?.nextDueAt || null;
  }

  function formatCorpusItem(item) {
    if (!item) return "";
    const action = item.showAction === false ? "" : item.actionText || CORPUS.actionLabels[item.physicalAction] || "";
    return [action ? `［${action}］` : "", item.text].filter(Boolean).join("\n");
  }

  function getWakePlan() {
    return loadState()?.wakePlan || null;
  }

  function syncCalendar(session) {
    const calendar = readCalendar() || calendarSkeleton();
    if (!calendar.sleep || typeof calendar.sleep !== "object") calendar.sleep = {};
    if (!calendar.sleepLuzhen || typeof calendar.sleepLuzhen !== "object") calendar.sleepLuzhen = {};
    const shared = {
      schemaVersion: 1,
      sessionId: session.sessionId,
      dateStart: session.date,
      dateEnd: session.endDate,
      dateSpanLabel: formatDateSpan(session.date, session.endDate),
      location: session.location,
      entryMode: session.entryMode,
      sleepSessionStartedAt: session.startedAt,
      delayFinishedAt: session.delayFinishedAt,
      soothingStartedAt: session.soothingStartedAt,
      lastInteractionAt: session.lastInteractionAt,
      estimatedSleepAt: session.estimatedSleepAt,
      nightWakeEvents: session.nightWakeEvents || [],
      wakeStartedAt: session.wakeStartedAt,
      wakeConfirmedAt: session.wakeConfirmedAt,
      luzhenEstimatedSleepAt: session.luzhenSleep?.estimatedSleepAt || null,
      luzhenWakeAt: session.luzhenSleep?.wakeAt || null,
      calendarSource: session.calendarSource,
      wakePlan: session.wakePlan
    };
    const keshiExisting = calendar.sleep[session.date];
    calendar.sleep[session.date] = {
      ...(keshiExisting && typeof keshiExisting === "object" ? keshiExisting : {}),
      liminalSleep: { ...shared, personId: "keshi" }
    };
    const luzhenExisting = calendar.sleepLuzhen[session.date];
    calendar.sleepLuzhen[session.date] = {
      ...(luzhenExisting && typeof luzhenExisting === "object" ? luzhenExisting : {}),
      liminalSleep: {
        ...shared,
        personId: "luzhen",
        estimatedSleepAt: session.luzhenSleep?.estimatedSleepAt || null,
        wakeAt: session.luzhenSleep?.wakeAt || null,
        luzhenEstimatedSleepAt: session.luzhenSleep?.estimatedSleepAt || null,
        luzhenWakeAt: session.luzhenSleep?.wakeAt || null,
        basedOnOwnCalendar: Boolean(session.luzhenSleep?.basedOnOwnCalendar)
      }
    };
    const next = JSON.stringify(calendar);
    if (global.localStorage.getItem(KEYS.calendar) !== next) global.localStorage.setItem(KEYS.calendar, next);
    return calendar;
  }

  global.LiminalSleepCore = Object.freeze({
    CONFIG,
    KEYS,
    todayKey,
    addDays,
    nightDateKey,
    localHour,
    atTime,
    addMinutes,
    timeLabel,
    minutesUntil,
    readCalendar,
    extractScheduleEvents,
    getNextHardEvent,
    buildWakePlan,
    createSession,
    loadState,
    loadHistory,
    loadCorpusHistory,
    analyzeSleepHistory,
    saveState,
    reconcile,
    extendDelay,
    beginSoothing,
    startRetry,
    isWakeWindow,
    beginWake,
    confirmWake,
    deriveWakePhase,
    syncCalendar,
    pickCorpus,
    getNextCorpusAt,
    formatCorpusItem,
    getWakePlan
  });
})(window);
