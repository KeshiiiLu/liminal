/* Liminal Sleep · static configuration. */

(function (global) {
  "use strict";

  const CONFIG = Object.freeze({
    schemaVersion: 1,
    defaultDelayMinutes: 10,
    lateDelayMinutes: 5,
    delayExtensionMinutes: 5,
    maxDelayExtensions: 2,
    windingDownMinutes: 2,
    soothingQuietMinutes: 5,
    directQuietSeconds: 45,
    retryQuietMinutes: 4,
    phoneDownMinutes: 1,
    configurableSleepEstimateMinutes: 15,
    targetSleepMinutes: 450,
    sleepStartWindowLeadMinutes: 30,
    classPreWakeBeforeMinutes: 50,
    classIdealWakeBeforeMinutes: 40,
    classMustWakeBeforeMinutes: 30,
    classHardLimitBeforeMinutes: 25,
    classLeaveBeforeMinutes: 10,
    relaxedPreWakeTime: "08:15",
    relaxedIdealWakeTime: "08:30",
    relaxedMustWakeTime: "09:00",
    relaxedHardWakeTime: "09:20",
    wakePhaseMinutes: Object.freeze({
      scheduled: Object.freeze({ soft_wake: 2, cuddle_buffer: 4, gentle_wake: 4 }),
      relaxed: Object.freeze({ soft_wake: 3, cuddle_buffer: 10, gentle_wake: 4 })
    }),
    automaticSessionCloseAfterHardWakeMinutes: 90
  });

  global.LiminalSleepData = Object.freeze({ CONFIG });
})(window);
