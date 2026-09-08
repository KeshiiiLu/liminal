/*
 * Liminal Tarot static deck definition.
 *
 * This file contains card identity data only. It deliberately does not contain
 * reading history, user questions, drawing state, or probability adjustments.
 */
(function () {
  "use strict";

  const majorArcana = [
    ["愚者", "THE FOOL", "0", "✦"],
    ["魔术师", "THE MAGICIAN", "I", "∞"],
    ["女祭司", "THE HIGH PRIESTESS", "II", "☾"],
    ["皇后", "THE EMPRESS", "III", "❦"],
    ["皇帝", "THE EMPEROR", "IV", "♜"],
    ["教皇", "THE HIEROPHANT", "V", "⌘"],
    ["恋人", "THE LOVERS", "VI", "♡"],
    ["战车", "THE CHARIOT", "VII", "✧"],
    ["力量", "STRENGTH", "VIII", "∞"],
    ["隐者", "THE HERMIT", "IX", "◇"],
    ["命运之轮", "WHEEL OF FORTUNE", "X", "⊙"],
    ["正义", "JUSTICE", "XI", "⚖"],
    ["倒吊人", "THE HANGED MAN", "XII", "▽"],
    ["死神", "DEATH", "XIII", "✣"],
    ["节制", "TEMPERANCE", "XIV", "≈"],
    ["恶魔", "THE DEVIL", "XV", "♄"],
    ["高塔", "THE TOWER", "XVI", "ϟ"],
    ["星星", "THE STAR", "XVII", "✶"],
    ["月亮", "THE MOON", "XVIII", "☽"],
    ["太阳", "THE SUN", "XIX", "☼"],
    ["审判", "JUDGEMENT", "XX", "◌"],
    ["世界", "THE WORLD", "XXI", "◎"]
  ];

  const suits = [
    { id: "wands", zh: "权杖", en: "WANDS", symbol: "♧" },
    { id: "cups", zh: "圣杯", en: "CUPS", symbol: "♢" },
    { id: "swords", zh: "宝剑", en: "SWORDS", symbol: "†" },
    { id: "pentacles", zh: "星币", en: "PENTACLES", symbol: "○" }
  ];

  const ranks = [
    { id: "ace", zh: "一", en: "ACE", mark: "A" },
    { id: "two", zh: "二", en: "TWO", mark: "2" },
    { id: "three", zh: "三", en: "THREE", mark: "3" },
    { id: "four", zh: "四", en: "FOUR", mark: "4" },
    { id: "five", zh: "五", en: "FIVE", mark: "5" },
    { id: "six", zh: "六", en: "SIX", mark: "6" },
    { id: "seven", zh: "七", en: "SEVEN", mark: "7" },
    { id: "eight", zh: "八", en: "EIGHT", mark: "8" },
    { id: "nine", zh: "九", en: "NINE", mark: "9" },
    { id: "ten", zh: "十", en: "TEN", mark: "10" },
    { id: "page", zh: "侍从", en: "PAGE", mark: "P" },
    { id: "knight", zh: "骑士", en: "KNIGHT", mark: "Kn" },
    { id: "queen", zh: "皇后", en: "QUEEN", mark: "Q" },
    { id: "king", zh: "国王", en: "KING", mark: "K" }
  ];

  const cards = majorArcana.map(function (card, index) {
    return Object.freeze({
      id: "major-" + String(index).padStart(2, "0"),
      arcana: "major",
      suit: null,
      rank: index,
      nameZh: card[0],
      nameEn: card[1],
      number: card[2],
      symbol: card[3]
    });
  });

  suits.forEach(function (suit) {
    ranks.forEach(function (rank, index) {
      cards.push(Object.freeze({
        id: suit.id + "-" + rank.id,
        arcana: "minor",
        suit: suit.id,
        rank: index + 1,
        nameZh: suit.zh + rank.zh,
        nameEn: rank.en + " OF " + suit.en,
        number: rank.mark,
        symbol: suit.symbol
      }));
    });
  });

  const interpretations = Object.freeze({
    "major-00": {
      upright: ["开始", "开放", "尝试", "信任脚步"],
      reversed: ["迟疑", "冒进", "重新确认", "留意边界"],
      hint: "眼前像是一段尚未被定义的路，可以先留意自己愿意怎样迈出第一步。"
    },
    "major-02": {
      upright: ["直觉", "静观", "内在知晓", "等待"],
      reversed: ["杂音", "回避直觉", "信息未明", "沉淀"],
      hint: "答案也许不急于出现，先为尚未说清的感受留出安静的位置。"
    },
    "major-06": {
      upright: ["选择", "联结", "价值一致", "靠近"],
      reversed: ["分歧", "失衡", "选择压力", "重新对齐"],
      hint: "这张牌邀请你看见关系与选择之间，哪些价值对自己真正重要。"
    },
    "cups-knight": {
      upright: ["情感表达", "浪漫", "邀约", "主动靠近"],
      reversed: ["情绪摇摆", "理想化", "表达受阻", "放慢"],
      hint: "情感正在寻找一种表达或行动方式，可以观察它准备如何靠近现实。"
    },
    "major-17": {
      upright: ["希望", "修复", "坦然", "重新连接"],
      reversed: ["信心微弱", "恢复缓慢", "暂时失焦", "照顾自己"],
      hint: "微小但持续的照顾，可能比急着得到结论更接近此刻需要的方向。"
    }
  });

  window.LiminalTarotData = Object.freeze({
    cards: Object.freeze(cards.slice()),
    cardCount: cards.length,
    interpretations: interpretations
  });
})();
