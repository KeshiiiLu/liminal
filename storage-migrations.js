/* Liminal unified localStorage schema migrations, current schema v1. */

(function (global) {

  "use strict";


  const LIMINAL_STORAGE_PREFIX =
    "liminal_";


  const STORAGE_SCHEMA_KEY =
    "liminal_storage_schema_version";


  const CURRENT_STORAGE_SCHEMA_VERSION =
    1;


  const BACKUP_FORMAT_VERSION =
    1;


  function hasOwn(
    target,
    property
  ) {

    return (
      Object.prototype
        .hasOwnProperty
        .call(
          target,
          property
        )
    );

  }


  function isPlainObject(
    value
  ) {

    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );

  }


  function isLiminalStorageKey(
    key
  ) {

    return (
      typeof key === "string" &&
      key.startsWith(
        LIMINAL_STORAGE_PREFIX
      )
    );

  }


  function collectLiminalLocalStorage(
    storage = global.localStorage
  ) {

    const snapshot = {};


    for (
      let index = 0;
      index < storage.length;
      index += 1
    ) {

      const key =
        storage.key(index);


      if (
        !isLiminalStorageKey(key)
      ) {

        continue;

      }


      const value =
        storage.getItem(key);


      if (
        typeof value === "string"
      ) {

        snapshot[key] =
          value;

      }

    }


    return snapshot;

  }


  function normalizeSnapshot(
    snapshot
  ) {

    if (
      !isPlainObject(snapshot)
    ) {

      throw new Error(
        "Liminal 存储数据必须是对象。"
      );

    }


    const normalized = {};


    Object.keys(snapshot)
      .forEach(
        function (key) {

          if (
            !isLiminalStorageKey(key)
          ) {

            throw new Error(
              `备份包含非 Liminal key：${key}`
            );

          }


          if (
            typeof snapshot[key] !==
              "string"
          ) {

            throw new Error(
              `备份 key ${key} 的 value 不是原始字符串。`
            );

          }


          normalized[key] =
            snapshot[key];

        }
      );


    return normalized;

  }


  function parseSchemaVersion(
    value,
    label = "storage schema version"
  ) {

    if (
      value === null ||
      typeof value === "undefined"
    ) {

      return 0;

    }


    const text =
      String(value).trim();


    if (
      !/^\d+$/.test(text)
    ) {

      throw new Error(
        `${label} 无效：${text || "空值"}`
      );

    }


    const version =
      Number(text);


    if (
      !Number.isSafeInteger(version) ||
      version < 0
    ) {

      throw new Error(
        `${label} 不是安全的非负整数。`
      );

    }


    return version;

  }


  /*
    统一迁移链。

    每次只追加相邻版本迁移：
    0 → 1、1 → 2、2 → 3……

    schema 0 代表统一迁移系统建立前的 legacy 数据。
    0 → 1 不改写任何业务 value，只建立统一版本标记。
  */

  const MIGRATIONS = [

    {
      fromVersion: 0,
      toVersion: 1,

      migrate(
        storageData
      ) {

        return storageData;

      }
    }

  ];


  function snapshotsEqual(
    left,
    right
  ) {

    const leftKeys =
      Object.keys(left).sort();


    const rightKeys =
      Object.keys(right).sort();


    if (
      leftKeys.length !==
        rightKeys.length
    ) {

      return false;

    }


    return leftKeys.every(
      function (
        key,
        index
      ) {

        return (
          key === rightKeys[index] &&
          left[key] === right[key]
        );

      }
    );

  }


  function migrateSnapshot(
    snapshot,
    options = {}
  ) {

    const original =
      normalizeSnapshot(snapshot);


    let working = {
      ...original
    };


    const warnings = [];


    const sourceVersion =
      hasOwn(
        options,
        "sourceVersion"
      )
        ? parseSchemaVersion(
            options.sourceVersion,
            "备份 storageSchemaVersion"
          )
        : parseSchemaVersion(
            hasOwn(
              working,
              STORAGE_SCHEMA_KEY
            )
              ? working[
                  STORAGE_SCHEMA_KEY
                ]
              : null
          );


    if (
      sourceVersion >
        CURRENT_STORAGE_SCHEMA_VERSION
    ) {

      throw new Error(
        `存档 schema v${sourceVersion} 高于当前支持的 v${CURRENT_STORAGE_SCHEMA_VERSION}，请先更新 Liminal。`
      );

    }


    let version =
      sourceVersion;


    while (
      version <
        CURRENT_STORAGE_SCHEMA_VERSION
    ) {

      const migration =
        MIGRATIONS.find(
          function (candidate) {

            return (
              candidate.fromVersion ===
                version &&
              candidate.toVersion ===
                version + 1
            );

          }
        );


      if (!migration) {

        throw new Error(
          `缺少 storage schema v${version} → v${version + 1} 的迁移。`
        );

      }


      const migrated =
        migration.migrate(
          working,
          {
            warnings
          }
        );


      working =
        normalizeSnapshot(
          migrated
        );


      version =
        migration.toVersion;

    }


    working[STORAGE_SCHEMA_KEY] =
      String(
        CURRENT_STORAGE_SCHEMA_VERSION
      );


    return {
      fromVersion:
        sourceVersion,

      toVersion:
        CURRENT_STORAGE_SCHEMA_VERSION,

      changed:
        !snapshotsEqual(
          original,
          working
        ),

      warnings,
      localStorage: working
    };

  }


  function writeEntriesWithRollback(
    storage,
    entries,
    before
  ) {

    const writtenKeys = [];


    try {

      entries.forEach(
        function (
          [key, value]
        ) {

          storage.setItem(
            key,
            value
          );


          writtenKeys.push(key);

        }
      );

    } catch (error) {

      writtenKeys
        .reverse()
        .forEach(
          function (key) {

            try {

              if (
                hasOwn(before, key)
              ) {

                storage.setItem(
                  key,
                  before[key]
                );

              } else {

                storage.removeItem(key);

              }

            } catch (
              rollbackError
            ) {

              console.error(
                "Liminal migration rollback failed",
                key,
                rollbackError
              );

            }

          }
        );


      throw error;

    }

  }


  function commitStartupMigration(
    storage,
    before,
    after
  ) {

    const businessEntries =
      Object.entries(after)
        .filter(
          function (
            [key, value]
          ) {

            return (
              key !== STORAGE_SCHEMA_KEY &&
              before[key] !== value
            );

          }
        );


    const entries = [
      ...businessEntries,
      [
        STORAGE_SCHEMA_KEY,
        after[STORAGE_SCHEMA_KEY]
      ]
    ];


    writeEntriesWithRollback(
      storage,
      entries,
      before
    );

  }


  function runStartupMigrations(
    storage = global.localStorage
  ) {

    const before =
      collectLiminalLocalStorage(
        storage
      );


    const result =
      migrateSnapshot(before);


    if (result.changed) {

      commitStartupMigration(
        storage,
        before,
        result.localStorage
      );

    }


    result.warnings.forEach(
      function (warning) {

        console.warn(
          "Liminal storage migration warning:",
          warning
        );

      }
    );


    return result;

  }


  function createBackup(
    storage = global.localStorage,
    exportedAt = new Date()
  ) {

    const localStorageData =
      collectLiminalLocalStorage(
        storage
      );


    let storageSchemaVersion = 0;


    try {

      storageSchemaVersion =
        parseSchemaVersion(
          hasOwn(
            localStorageData,
            STORAGE_SCHEMA_KEY
          )
            ? localStorageData[
                STORAGE_SCHEMA_KEY
              ]
            : null
        );

    } catch (error) {

      console.warn(
        "导出时发现无效的 storage schema version；备份按 legacy v0 标记。",
        error
      );

    }


    return {
      backupFormatVersion:
        BACKUP_FORMAT_VERSION,

      storageSchemaVersion,

      app:
        "Liminal",

      exportedAt:
        exportedAt.toISOString(),

      data: {
        localStorage:
          localStorageData
      }
    };

  }


  function validateBackup(
    backup
  ) {

    if (
      !isPlainObject(backup)
    ) {

      throw new Error(
        "备份根内容必须是 JSON 对象。"
      );

    }


    if (
      backup.app !== "Liminal"
    ) {

      throw new Error(
        "这不是 Liminal 备份文件。"
      );

    }


    if (
      backup.backupFormatVersion !==
        BACKUP_FORMAT_VERSION
    ) {

      throw new Error(
        `不支持 backupFormatVersion ${String(backup.backupFormatVersion)}。`
      );

    }


    const storageSchemaVersion =
      parseSchemaVersion(
        backup.storageSchemaVersion,
        "备份 storageSchemaVersion"
      );


    if (
      typeof backup.exportedAt !==
        "string" ||
      !Number.isFinite(
        Date.parse(
          backup.exportedAt
        )
      )
    ) {

      throw new Error(
        "备份 exportedAt 无效。"
      );

    }


    if (
      !isPlainObject(backup.data) ||
      !isPlainObject(
        backup.data.localStorage
      )
    ) {

      throw new Error(
        "备份缺少 data.localStorage。"
      );

    }


    const localStorageData =
      normalizeSnapshot(
        backup.data.localStorage
      );


    const warnings = [];


    if (
      hasOwn(
        localStorageData,
        STORAGE_SCHEMA_KEY
      )
    ) {

      let embeddedVersion;


      try {

        embeddedVersion =
          parseSchemaVersion(
            localStorageData[
              STORAGE_SCHEMA_KEY
            ],
            "备份内嵌 storage schema version"
          );

      } catch (error) {

        if (
          storageSchemaVersion !== 0
        ) {

          throw error;

        }


        warnings.push(
          "legacy 备份包含无效的 schema 标记；业务数据将保留，标记会在内存迁移成功后重建。"
        );

      }


      if (
        typeof embeddedVersion ===
          "number" &&
        embeddedVersion !==
          storageSchemaVersion
      ) {

        throw new Error(
          "备份的 storageSchemaVersion 与内嵌版本标记不一致。"
        );

      }

    }


    return {
      backup,
      storageSchemaVersion,
      localStorage:
        localStorageData,
      warnings,
      entryCount:
        Object.keys(
          localStorageData
        ).length
    };

  }


  function parseBackupText(
    text
  ) {

    let backup;


    try {

      backup =
        JSON.parse(
          String(text)
            .replace(
              /^\uFEFF/,
              ""
            )
        );

    } catch (error) {

      throw new Error(
        `JSON 文件损坏或格式错误：${error.message}`
      );

    }


    return validateBackup(backup);

  }


  function prepareBackupImport(
    backup,
    storage = global.localStorage
  ) {

    const validated =
      typeof backup === "string"
        ? parseBackupText(backup)
        : validateBackup(backup);


    const migration =
      migrateSnapshot(
        validated.localStorage,
        {
          sourceVersion:
            validated.storageSchemaVersion
        }
      );


    migration.warnings.unshift(
      ...validated.warnings
    );


    return {
      backup:
        validated.backup,

      backupEntryCount:
        validated.entryCount,

      currentEntryCount:
        Object.keys(
          collectLiminalLocalStorage(
            storage
          )
        ).length,

      migration,

      localStorage:
        migration.localStorage
    };

  }


  function restorePreparedSnapshot(
    preparedSnapshot,
    storage = global.localStorage
  ) {

    const target =
      normalizeSnapshot(
        preparedSnapshot
      );


    const targetVersion =
      parseSchemaVersion(
        target[STORAGE_SCHEMA_KEY]
      );


    if (
      targetVersion !==
        CURRENT_STORAGE_SCHEMA_VERSION
    ) {

      throw new Error(
        "恢复数据尚未成功迁移到当前 schema version。"
      );

    }


    const before =
      collectLiminalLocalStorage(
        storage
      );


    try {

      Object.keys(before)
        .forEach(
          function (key) {

            storage.removeItem(key);

          }
        );


      const entries =
        Object.entries(target)
          .filter(
            function ([key]) {

              return (
                key !==
                  STORAGE_SCHEMA_KEY
              );

            }
          );


      entries.push([
        STORAGE_SCHEMA_KEY,
        target[STORAGE_SCHEMA_KEY]
      ]);


      entries.forEach(
        function (
          [key, value]
        ) {

          storage.setItem(
            key,
            value
          );

        }
      );

    } catch (error) {

      try {

        const partial =
          collectLiminalLocalStorage(
            storage
          );


        Object.keys(partial)
          .forEach(
            function (key) {

              storage.removeItem(key);

            }
          );


        Object.entries(before)
          .forEach(
            function (
              [key, value]
            ) {

              storage.setItem(
                key,
                value
              );

            }
          );

      } catch (rollbackError) {

        console.error(
          "Liminal restore rollback failed",
          rollbackError
        );

      }


      throw new Error(
        `恢复写入失败，已尝试回滚当前存档：${error.message}`
      );

    }


    return {
      restoredEntryCount:
        Object.keys(target).length,
      previousEntryCount:
        Object.keys(before).length
    };

  }


  const api = {
    BACKUP_FORMAT_VERSION,
    CURRENT_STORAGE_SCHEMA_VERSION,
    LIMINAL_STORAGE_PREFIX,
    STORAGE_SCHEMA_KEY,
    migrations: MIGRATIONS,
    collectLiminalLocalStorage,
    createBackup,
    isLiminalStorageKey,
    migrateSnapshot,
    parseBackupText,
    prepareBackupImport,
    restorePreparedSnapshot,
    runStartupMigrations,
    validateBackup
  };


  global.LiminalStorage =
    api;


  if (
    !global
      .__LIMINAL_DISABLE_AUTO_MIGRATION__
  ) {

    try {

      api.startupResult =
        runStartupMigrations();

    } catch (error) {

      api.startupError =
        error;


      console.error(
        "Liminal storage migration failed; schema version was not updated and existing data was preserved.",
        error
      );

    }

  }

}(window));
