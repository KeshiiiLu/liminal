/*
  Liminal 采用语义化版本：
  Patch：0.1.0 → 0.1.1，用于小修复、样式优化和轻微行为修正。
  Minor：0.1.x → 0.2.0，用于新功能或明显功能扩展。
  Major：0.x → 1.0.0，待 Liminal 达到较完整、稳定状态后使用。

  history 始终按最新版本在前的顺序维护；页面只从这里读取版本信息。
*/

(function () {
  "use strict";


  const history = [
    {
      version: "0.1.0",
      label: "Mobile Beta",
      releasedAt: "2026-09-04",
      groups: [
        {
          title: "Mobile",
          items: [
            "完成 iPhone 13 Pro 第一阶段移动端适配",
            "增加 safe area 与动态 viewport 支持",
            "优化聊天、Calendar、Wallet、Mall 等主要页面的触控体验",
            "增加 PWA 与 iPhone 主屏幕 Web App 支持"
          ]
        },
        {
          title: "Data",
          items: [
            "新增完整 Liminal 数据导出与恢复",
            "新增统一 storage schema migration 系统",
            "当前 storage schema version 为 1",
            "保留合法旧数据与 0–0 等用户设置"
          ]
        },
        {
          title: "Chat",
          items: [
            "统一互动频率默认配置来源",
            "陆榛与 Jasper 使用统一的 world rules 配置结构"
          ]
        },
        {
          title: "Navigation",
          items: [
            "修复首页 Calendar 入口",
            "首页“导出·备份”接入数据管理",
            "优化 Settings 与主要页面导航"
          ]
        },
        {
          title: "Calendar",
          items: [
            "首页 Calendar Widget 改为根据设备现实日期动态显示"
          ]
        },
        {
          title: "Infrastructure",
          items: [
            "正式项目统一为 D:\\GitHub\\liminal",
            "建立 GitHub Pages 发布流程"
          ]
        }
      ]
    }
  ];


  history.forEach(function (release) {

    release.groups.forEach(function (group) {
      Object.freeze(group.items);
      Object.freeze(group);
    });

    Object.freeze(release.groups);
    Object.freeze(release);

  });


  Object.freeze(history);


  const latestRelease =
    history[0];


  window.LiminalVersion =
    Object.freeze({
      current: latestRelease.version,
      label: latestRelease.label,
      releasedAt: latestRelease.releasedAt,
      history: history
    });

})();
