/* Liminal data export and restore controller, backup format v1. */

(function () {

  "use strict";


  const storageApi =
    window.LiminalStorage;


  const schemaVersion =
    document.getElementById(
      "schemaVersion"
    );


  const storageEntryCount =
    document.getElementById(
      "storageEntryCount"
    );


  const exportDataButton =
    document.getElementById(
      "exportDataButton"
    );


  const lastExportTime =
    document.getElementById(
      "lastExportTime"
    );


  const backupFileInput =
    document.getElementById(
      "backupFileInput"
    );


  const selectedFileName =
    document.getElementById(
      "selectedFileName"
    );


  const restorePreview =
    document.getElementById(
      "restorePreview"
    );


  const backupExportedAt =
    document.getElementById(
      "backupExportedAt"
    );


  const backupEntryCount =
    document.getElementById(
      "backupEntryCount"
    );


  const currentEntryCount =
    document.getElementById(
      "currentEntryCount"
    );


  const migrationPath =
    document.getElementById(
      "migrationPath"
    );


  const migrationWarnings =
    document.getElementById(
      "migrationWarnings"
    );


  const restoreDataButton =
    document.getElementById(
      "restoreDataButton"
    );


  const dataStatus =
    document.getElementById(
      "dataStatus"
    );


  const reloadLiminalButton =
    document.getElementById(
      "reloadLiminalButton"
    );


  const LAST_EXPORT_SESSION_KEY =
    "liminal_backup_last_export_at_v1";


  let pendingImport =
    null;


  function setStatus(
    message,
    type = ""
  ) {

    dataStatus.textContent =
      message;


    if (type) {

      dataStatus.dataset.type =
        type;

    } else {

      delete dataStatus.dataset.type;

    }

  }


  function formatDisplayDate(
    value
  ) {

    const date =
      new Date(value);


    if (
      !Number.isFinite(
        date.getTime()
      )
    ) {

      return "未知";

    }


    return date.toLocaleString(
      "zh-CN",
      {
        hour12: false
      }
    );

  }


  function pad(
    value
  ) {

    return String(value)
      .padStart(2, "0");

  }


  function formatFilenameTime(
    date
  ) {

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("-") +
      "-" +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds());

  }


  function downloadBackup(
    backup,
    filename
  ) {

    const json =
      JSON.stringify(
        backup,
        null,
        2
      );


    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json;charset=utf-8"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const anchor =
      document.createElement("a");


    anchor.href =
      url;


    anchor.download =
      filename;


    anchor.rel =
      "noopener";


    document.body.appendChild(
      anchor
    );


    anchor.click();


    anchor.remove();


    window.setTimeout(
      function () {

        URL.revokeObjectURL(url);

      },
      60000
    );

  }


  function readFileAsText(
    file
  ) {

    return new Promise(
      function (
        resolve,
        reject
      ) {

        const reader =
          new FileReader();


        reader.onload =
          function () {

            resolve(
              String(
                reader.result || ""
              )
            );

          };


        reader.onerror =
          function () {

            reject(
              reader.error ||
              new Error(
                "无法读取备份文件。"
              )
            );

          };


        reader.readAsText(
          file,
          "UTF-8"
        );

      }
    );

  }


  function refreshStorageSummary() {

    const snapshot =
      storageApi
        .collectLiminalLocalStorage();


    const storedVersion =
      snapshot[
        storageApi.STORAGE_SCHEMA_KEY
      ];


    schemaVersion.textContent =
      typeof storedVersion === "string"
        ? `v${storedVersion}`
        : "legacy v0";


    storageEntryCount.textContent =
      String(
        Object.keys(snapshot).length
      );

  }


  function loadLastExportTime() {

    try {

      const value =
        sessionStorage.getItem(
          LAST_EXPORT_SESSION_KEY
        );


      if (value) {

        lastExportTime.textContent =
          formatDisplayDate(value);

      }

    } catch (error) {

      console.warn(
        "无法读取本次会话导出时间",
        error
      );

    }

  }


  function rememberLastExportTime(
    value
  ) {

    try {

      sessionStorage.setItem(
        LAST_EXPORT_SESSION_KEY,
        value
      );

    } catch (error) {

      console.warn(
        "无法记录本次会话导出时间",
        error
      );

    }


    lastExportTime.textContent =
      formatDisplayDate(value);

  }


  function resetRestorePreview() {

    pendingImport =
      null;


    restorePreview.hidden =
      true;


    migrationWarnings.hidden =
      true;


    migrationWarnings.textContent =
      "";


    restoreDataButton.disabled =
      false;

  }


  if (!storageApi) {

    exportDataButton.disabled =
      true;


    backupFileInput.disabled =
      true;


    setStatus(
      "存储迁移模块未能加载。当前数据没有被修改。",
      "error"
    );


    return;

  }


  if (storageApi.startupError) {

    setStatus(
      `启动迁移失败：${storageApi.startupError.message}`,
      "error"
    );

  }


  exportDataButton.addEventListener(
    "click",
    function () {

      try {

        const now =
          new Date();


        const backup =
          storageApi.createBackup(
            localStorage,
            now
          );


        downloadBackup(
          backup,
          `liminal-backup-${formatFilenameTime(now)}.json`
        );


        rememberLastExportTime(
          backup.exportedAt
        );


        setStatus(
          `已生成 ${Object.keys(backup.data.localStorage).length} 条 Liminal 数据的 UTF-8 JSON 备份。`,
          "success"
        );

      } catch (error) {

        setStatus(
          `导出失败：${error.message}`,
          "error"
        );

      }

    }
  );


  backupFileInput.addEventListener(
    "change",
    async function () {

      resetRestorePreview();


      const file =
        backupFileInput.files &&
        backupFileInput.files[0];


      if (!file) {

        selectedFileName.textContent =
          "尚未选择文件";


        return;

      }


      selectedFileName.textContent =
        file.name;


      setStatus(
        "正在校验备份……"
      );


      try {

        const text =
          await readFileAsText(file);


        pendingImport =
          storageApi
            .prepareBackupImport(
              text
            );


        backupExportedAt.textContent =
          formatDisplayDate(
            pendingImport
              .backup
              .exportedAt
          );


        backupEntryCount.textContent =
          String(
            pendingImport
              .backupEntryCount
          );


        currentEntryCount.textContent =
          String(
            pendingImport
              .currentEntryCount
          );


        migrationPath.textContent =
          `v${pendingImport.migration.fromVersion} → v${pendingImport.migration.toVersion}`;


        if (
          pendingImport
            .migration
            .warnings
            .length > 0
        ) {

          migrationWarnings.textContent =
            `迁移提示：${pendingImport.migration.warnings.join("；")}`;


          migrationWarnings.hidden =
            false;

        }


        restorePreview.hidden =
          false;


        setStatus(
          "备份校验和内存迁移成功。请核对信息后再确认恢复。",
          "success"
        );

      } catch (error) {

        pendingImport =
          null;


        restorePreview.hidden =
          true;


        setStatus(
          `无法使用此备份：${error.message}`,
          "error"
        );

      }

    }
  );


  restoreDataButton.addEventListener(
    "click",
    function () {

      if (!pendingImport) {

        setStatus(
          "请先选择并校验备份文件。",
          "error"
        );


        return;

      }


      const confirmed =
        window.confirm(
          "确认完整恢复 Liminal 数据吗？\n\n当前设备所有 liminal_* 数据将被备份后替换；其他网站数据不会受影响。"
        );


      if (!confirmed) {

        setStatus(
          "已取消恢复，当前数据未修改。"
        );


        return;

      }


      restoreDataButton.disabled =
        true;


      try {

        const now =
          new Date();


        const safetyBackup =
          storageApi.createBackup(
            localStorage,
            now
          );


        downloadBackup(
          safetyBackup,
          `liminal-before-restore-${formatFilenameTime(now)}.json`
        );


        const result =
          storageApi
            .restorePreparedSnapshot(
              pendingImport
                .localStorage
            );


        refreshStorageSummary();


        backupFileInput.disabled =
          true;


        exportDataButton.disabled =
          true;


        reloadLiminalButton.hidden =
          false;


        setStatus(
          `恢复完成：已写入 ${result.restoredEntryCount} 条 Liminal 数据。请重新加载 Liminal。`,
          "success"
        );

      } catch (error) {

        restoreDataButton.disabled =
          false;


        setStatus(
          `恢复失败：${error.message}`,
          "error"
        );

      }

    }
  );


  reloadLiminalButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "index.html";

    }
  );


  refreshStorageSummary();

  loadLastExportTime();

}());
