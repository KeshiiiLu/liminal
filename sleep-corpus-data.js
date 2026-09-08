/* Liminal Sleep · official static corpus v1.
 *
 * Maintained on desktop as code-level content. The browser only reads it.
 * Add new groups or entries here; the selector does not need phase-specific copy.
 */

(function (global) {
  "use strict";

  const ACTION_LABELS = Object.freeze({
    hug: "把你安安稳稳抱住",
    kiss_forehead: "在额头上轻轻亲了一下",
    kiss_lips: "凑近亲了一下",
    kiss_cheek: "在脸颊上碰了碰",
    kiss_nose: "很轻地碰了碰鼻尖",
    stroke_hair: "手指慢慢顺过头发",
    pull_closer: "把你往怀里带近一点",
    fix_blanket: "替你把被角掖好",
    hold: "手臂松松地环着你",
    touch_face: "掌心贴了一会儿脸颊",
    help_up: "伸手稳稳扶住你",
    none: ""
  });

  const groups = [];

  function addGroup(phase, tone, directRepeatGroup, texts, options = {}) {
    groups.push({ phase, tone, directRepeatGroup, texts, ...options });
  }

  /* delay · 50 */
  addGroup("delay", "warm", "delay-company", [
    "还想再看一会儿就看吧。", "我靠着，你慢慢看。", "今晚先不催你。", "嗯，再窝一小会儿。", "你玩你的，我陪着。",
    "还舍不得结束今天啊。", "没关系，先在这里待会儿。", "我也不急着关灯。", "再赖一会儿也不是大事。", "困了就自己往我这边靠。"
  ], { weight: 1.2 });
  addGroup("delay", "playful", "delay-internet", [
    "你到底还有多少互联网没巡视完。", "这一页看完，是不是又会长出下一页？", "手机里还有谁比我更值得熬夜？", "又在进行睡前最后一次、最后一次、最后一次。", "我看你这个‘马上’还能有多久。",
    "别告诉我你刚打开的是长视频。", "今天的互联网也不会半夜逃跑。", "你这个拇指看起来一点都不困。", "又刷到什么让你舍不得走了？", "我先记着，你欠我一个睡前亲亲。"
  ], { weight: 1.05 });
  addGroup("delay", "sleepy", "delay-luzhen-sleepy", [
    "……我都快先困了。", "你看吧，我眼睛要闭一会儿。", "我先眯着，不算丢下你。", "再晚一点我说话就要没声音了。", "嗯……听见了，我还醒着。",
    "我已经开始分不清你在看什么了。", "你再不回来，我可能抱着枕头先睡。", "今天这点精神快用完了。", "我靠一会儿，等你自己困。", "别太久，我也想抱着你睡。"
  ], { luzhenState: "sleepy" });
  addGroup("delay", "clingy", "delay-close", [
    "看可以，离我近一点。", "把那只手留一只给我。", "手机归你，肩膀归我。", "你看屏幕，我看你。", "再玩一会儿可以，别躲那么远。",
    "给我靠一下再继续。", "你不睡，我就先占着这个位置。", "腿伸过来一点。", "我想贴着你等。", "好，抱着你玩。"
  ], { location: "loft", physicalAction: "hold", showAction: false, requiresPhysicalPresence: true, weight: 1.1 });
  addGroup("delay", "soft", "delay-context", [
    { text: "明天不用赶早，再窝一下也行。", nextEventType: "none", isEarlyMorning: false },
    { text: "困了就睡，明天不赶你。", nextEventType: "none", isEarlyMorning: false },
    { text: "明早有课，可以黏一会儿，别拖得太远。", nextEventType: "class", isEarlyMorning: true },
    { text: "明早还有见习，今晚我会早点收你。", nextEventType: "clinical", isEarlyMorning: true },
    { text: "明天要考试，剩下的别都压在今晚。", nextEventType: "exam" },
    { text: "明天有预约，时间得给早晨留一点。", nextEventType: "appointment" },
    { text: "明天要赶路，今晚别把自己熬空。", nextEventType: "travel" },
    { text: "明天有件不能迟到的事，我记着。", nextEventType: "other_hard_event" },
    { text: "最近几晚都拖得有点晚了。", userBehavior: "consecutive_late_nights", weight: 0.35 },
    { text: "这几天总想再玩一会儿，是不是舍不得睡。", userBehavior: "recent_delay", weight: 0.4 }
  ], { weight: 0.65 });

  /* winding_down · 35 */
  addGroup("winding_down", "soft", "wind-return", [
    "差不多啦。", "这一点看完就回来。", "慢慢收尾，不用一下子停。", "把手里的这件事放到这里吧。", "嗯，今天先看到这里。", "该往被窝深处挪一点了。", "剩下的留给明天。"
  ]);
  addGroup("winding_down", "playful", "wind-patrol-end", [
    "今晚互联网巡视结束。", "你的睡前加时赛要收场了。", "最后一页，真的最后一页。", "好了，小巡逻员该下班了。", "再开新的我就当没看见——只给三秒。", "拇指停一下，看看我。", "这局到这里，明天续。"
  ]);
  addGroup("winding_down", "tender", "wind-come-close", [
    "过来，我抱。", "回来一点，位置给你留着。", "靠过来就好。", "把脑袋放这边。", "嗯，回来睡觉了。", "我把你接回来。", "先靠着，别的都慢慢放下。"
  ], { location: "loft", physicalAction: "pull_closer", showAction: false, requiresPhysicalPresence: true });
  addGroup("winding_down", "firm", "wind-boundary", [
    "没有第三次了。", "Keshi，回来睡觉。", "这次真的收尾。", "嗯，到这里。", "不凶你，但不能再开一轮。", "今晚的加时用完了。", "手机先歇一会儿，你也歇。"
  ], { weight: 0.72, intensity: "medium" });
  addGroup("winding_down", "quiet", "wind-context", [
    { text: "明早不用赶，还是可以从容地停下来。", nextEventType: "none" },
    { text: "明早有课，今晚到这里刚刚好。", nextEventType: "class" },
    { text: "见习要用精神，回来睡了。", nextEventType: "clinical" },
    { text: "书先合上，明天考试时脑子还要清醒。", nextEventType: "exam" },
    { text: "明天要按时到，我们今晚不往后拖了。", nextEventType: "appointment" },
    { text: "明天还要赶路，东西都留到醒来再看。", nextEventType: "travel" },
    { text: "明天那件重要的事我记得，先睡。", nextEventType: "other_hard_event" }
  ], { weight: 0.55 });

  /* soothing · 100 */
  addGroup("soothing", "warm", "soothe-presence", [
    "来，往我这边一点。", "嗯，我在这儿。", "今天的事先放远一点。", "不用再想下一步。", "你安静下来就好。",
    "这一会儿什么都不用处理。", "我听着呢，不说也行。", "慢一点，今晚已经够长了。", "待在这里，等困意自己来。", "嗯，陪你到睡着。"
  ], { weight: 1.2 });
  addGroup("soothing", "clingy", "soothe-clingy", [
    "今天怎么这么黏。", "还要再靠近一点？", "嗯，位置都给你。", "你这样贴着，我也走不了。", "今晚就黏在这里吧。",
    "还没抱够啊。", "你往这边蹭什么。", "好，知道你想离我近。", "再挤过来就没有缝了。", "这么会找位置。"
  ], { weight: 1.05 });
  addGroup("soothing", "sleepy", "soothe-sleepy-talk", [
    "……嗯，听见了。", "我声音也快没了。", "刚才说到哪儿了……算了。", "眼睛闭着也能陪你。", "我可能说着说着就睡了。",
    "嗯……别笑。", "今天的话留半句到明天。", "困得不太会组织句子了。", "你再说一遍，我刚刚差点睡过去。", "……好，睡了。"
  ], { luzhenState: "sleepy", weight: 1.15 });
  addGroup("soothing", "playful", "soothe-tease", [
    "你再哼唧，我就当你在撒娇。", "别笑，床都被你晃到了。", "刚才不是很精神吗，声音怎么小了。", "还在偷偷睁眼。", "你以为我没看见你摸手机？",
    "嘴上说不困，眼睛先叛变了。", "又往被子里缩什么。", "好好躺着，别演失眠小剧场。", "你这个困意来得还挺会装。", "再闹一下就把你整个收走。"
  ], { weight: 0.9 });
  addGroup("soothing", "quiet", "soothe-quiet", [
    { text: "嗯。", directRepeatGroup: "short-affirm" }, "别说了，歇一会儿。", "声音可以停了。", "呼吸慢一点就好。", "这里很安静。",
    "不用等我下一句。", "闭着眼听就行。", "困意来了就跟着走。", "不回答也没关系。", "剩下的明天再说。"
  ], { intensity: "very-low", weight: 1.1 });
  addGroup("soothing", "affectionate", "soothe-love", [
    "我喜欢今晚这样和你待着。", "嗯，我爱你。", "今天也很想你。", "能一起睡就很好。", "你不用做什么，我还是很爱你。",
    "晚安之前，想再告诉你一次：我在。", "今天辛苦了，回来就好。", "你被好好放在我心里。", "明天醒来我也在。", "晚安，老婆。"
  ], { weight: 0.72, cooldown: 5 });
  addGroup("soothing", "tender", "soothe-hold", [
    "这下抱到了。", "别动，就这样。", "你靠着会舒服一点。", "肩膀放松，重量给我。", "嗯，这个位置正好。",
    "今晚不松开。", "你可以再软一点。", "靠稳了就闭眼。", "让我接住你。", "这样是不是暖一点。"
  ], { location: "loft", physicalAction: "hold", showAction: false, requiresPhysicalPresence: true, weight: 1.15 });
  addGroup("soothing", "soft", "soothe-kiss", [
    { text: "好了，不许再皱眉。", physicalAction: "kiss_forehead", actionText: "在额头上落下一个很轻的吻" },
    { text: "还躲。", physicalAction: "kiss_nose", actionText: "鼻尖被轻轻碰了一下" },
    { text: "这下满意了？", physicalAction: "kiss_lips", actionText: "凑近，很轻地亲了一下" },
    { text: "今天的份还没给你。", physicalAction: "kiss_cheek", actionText: "脸颊上被温柔地碰了碰" },
    { text: "再一下，真的最后一下。", physicalAction: "kiss_lips", actionText: "在唇边停了一会儿才退开" },
    { text: "眼睛闭好。", physicalAction: "kiss_forehead", actionText: "俯身亲了亲额角" },
    { text: "怎么还在笑。", physicalAction: "kiss_cheek", actionText: "笑意旁边落下一点温度" },
    { text: "不给你数了。", physicalAction: "kiss_lips", actionText: "短短地亲了一下，没有继续逗留" },
    { text: "嗯，收到了。", physicalAction: "kiss_nose", actionText: "鼻尖贴近，又轻轻分开" },
    { text: "晚安吻，不许续杯。", physicalAction: "kiss_forehead", actionText: "额头被认真地亲了一下" }
  ], { location: "loft", requiresPhysicalPresence: true, cooldown: 3 });
  addGroup("soothing", "tender", "soothe-bed-care", [
    "脚别露在外面。", "被角总让你踢开。", "头发压到了，等一下。", "枕头往上挪一点。", "这边暖，别滚走。",
    "手放进来，外面凉。", "被子够不够？", "别缩成一小团，腰会不舒服。", "好了，这样不会漏风。", "你安心躺着。"
  ], { location: "loft", physicalAction: "fix_blanket", showAction: false, requiresPhysicalPresence: true, weight: 0.9 });
  addGroup("soothing", "soft", "soothe-context", [
    { text: "明天不用赶，我们慢慢困。", nextEventType: "none", isEarlyMorning: false },
    { text: "明早有课，再黏一下就睡。", nextEventType: "class", isEarlyMorning: true },
    { text: "明早还有见习，今晚我早点抱你睡。", nextEventType: "clinical", isEarlyMorning: true },
    { text: "剩下的明早再看，考试前先把脑子放松。", nextEventType: "exam" },
    { text: "明天要按时到，今晚我们安静一点。", nextEventType: "appointment" },
    { text: "明天要赶路，今晚先把自己放稳。", nextEventType: "travel" },
    { text: "明天有重要安排，我会记着时间。", nextEventType: "other_hard_event" },
    { text: "最近都睡得晚，今晚让我早点抱住你。", userBehavior: "consecutive_late_nights", weight: 0.3 },
    { text: "这几晚总绕很久，今天先别跟困意较劲。", userBehavior: "recent_delay", weight: 0.35 },
    { text: "昨晚也很晚才安静下来，今天少撑一会儿。", userBehavior: "last_night_late", weight: 0.3 }
  ], { weight: 0.55 });

  /* direct · 35 */
  addGroup("direct", "playful", "direct-surprise", [
    "今天这么自觉？", "我都准备好抓你了。", "怎么突然不跟我磨蹭了。", "这么干脆，我差点没反应过来。", "今天的互联网这么容易放过你？", "嗯？这就准备睡了。", "难得让我省一次心。"
  ], { weight: 1.05 });
  addGroup("direct", "warm", "direct-praise", [
    "嗯，这样就很好。", "今天做得很干脆。", "知道自己困了就回来，挺好。", "没有硬撑，值得夸一下。", "今天很会照顾自己。", "嗯，真乖。", "我喜欢你这么坦率地说要睡。"
  ], { cooldown: 5 });
  addGroup("direct", "affectionate", "direct-love", [
    "那就把晚安留给你。", "爱你，睡吧。", "今晚不多说，明天见。", "好，安心睡，我在。", "给你一句晚安就够了。", "今天的最后一句：我爱你。", "明早睁眼再来找我。"
  ], { weight: 0.85, cooldown: 4 });
  addGroup("direct", "tender", "direct-close", [
    "过来一下就放你睡。", "抱好，不闹你了。", "位置给你，躺稳。", "靠过来，今晚很快就安静。", "嗯，收进怀里了。", "给你留一点睡前的温度。", "不说长话，只抱一下。"
  ], { location: "loft", physicalAction: "pull_closer", showAction: false, requiresPhysicalPresence: true });
  addGroup("direct", "quiet", "direct-finish", [
    { text: "那就睡。", trigger: "timer" },
    { text: "不耽误你了。", trigger: "timer" },
    { text: "灯留暗一点。", trigger: "timer" },
    { text: "今晚很安静。", trigger: "timer" },
    { text: "嗯，结束今天。", trigger: "timer" },
    { text: "不等下一句了。", trigger: "timer" },
    { text: "晚安。", trigger: "timer", directRepeatGroup: "short-goodnight" }
  ], { intensity: "very-low", weight: 0.9 });

  /* phone_down · 12 */
  addGroup("phone_down", "quiet", "phone-still", [
    "屏幕可以留在这里。", "不用再回我。", "嗯，安静一会儿。", "接下来没有新事情。"
  ], { intensity: "very-low" });
  addGroup("phone_down", "sleepy", "phone-last", [
    "……睡了。", "我也闭眼了。", "声音停在这里。", "剩下的放进梦里。"
  ], { intensity: "very-low", luzhenState: "sleepy" });
  addGroup("phone_down", "tender", "phone-action", [
    { text: "", physicalAction: "hold", actionText: "手臂安静地收紧了一点" },
    { text: "", physicalAction: "stroke_hair", actionText: "指尖最后顺了顺你的头发" },
    { text: "", physicalAction: "fix_blanket", actionText: "被角被无声地掖好" },
    { text: "", physicalAction: "kiss_forehead", actionText: "额头上落下很轻的晚安" }
  ], { location: "loft", requiresPhysicalPresence: true, intensity: "very-low" });

  /* quiet_sleep · 18 */
  addGroup("quiet_sleep", "quiet", "quiet-minimal", [
    { text: "嗯。", directRepeatGroup: "short-affirm" },
    { text: "睡吧。", directRepeatGroup: "short-sleep" },
    "我在。", "闭眼。",
    { text: "晚安。", directRepeatGroup: "short-goodnight" },
    "不等下一句。"
  ], { intensity: "very-low", cooldown: 6 });
  addGroup("quiet_sleep", "sleepy", "quiet-fading", [
    { text: "……嗯。", directRepeatGroup: "short-affirm" }, "不说了。", "一起睡。", "这里就好。", "别看时间。", "明天见。"
  ], { intensity: "very-low", cooldown: 6, luzhenState: "sleepy" });
  addGroup("quiet_sleep", "tender", "quiet-action", [
    { text: "", physicalAction: "kiss_forehead", actionText: "额角被几乎无声地碰了一下" },
    { text: "", physicalAction: "hold", actionText: "怀抱没有松开" },
    { text: "", physicalAction: "fix_blanket", actionText: "被角被轻轻拉回原位" },
    { text: "", physicalAction: "stroke_hair", actionText: "头发被很慢地顺了两下" },
    { text: "", physicalAction: "pull_closer", actionText: "两个人之间最后一点距离也合上了" },
    { text: "", physicalAction: "touch_face", actionText: "温热的掌心短暂停在脸侧" }
  ], { location: "loft", requiresPhysicalPresence: true, intensity: "very-low", cooldown: 7 });

  /* sleep_retry · 35 */
  addGroup("sleep_retry", "soft", "retry-accept", [
    "还没睡着啊。", "嗯，知道了。", "没关系，有时候就是睡不着。", "不用急着证明自己能睡。", "醒着也先躺一会儿。", "今晚慢一点没事。", "别跟自己较劲。"
  ], { intensity: "very-low", weight: 1.2 });
  addGroup("sleep_retry", "quiet", "retry-calm", [
    "先什么都不想。", "脑子还在转就让它转慢一点。", "不需要马上睡着。", "我们先不说长话。", "把注意力放回这一小会儿。", "嗯，安静地待着。", "困意会自己回来。"
  ], { intensity: "very-low" });
  addGroup("sleep_retry", "warm", "retry-company", [
    "我再陪你一会儿。", "醒着的时候也不是一个人。", "你不用解释为什么没睡。", "听见你回来了。", "那就从现在重新慢下来。", "我没走，还是在这里。", "等你重新困。"
  ]);
  addGroup("sleep_retry", "tender", "retry-hold", [
    "过来，换个舒服的位置。", "靠稳一点，别绷着。", "把重量给我。", "再抱一轮，不算重来。", "你先松下来。", "这里还能再暖一点。", "我接着抱。"
  ], { location: "loft", physicalAction: "hold", showAction: false, requiresPhysicalPresence: true });
  addGroup("sleep_retry", "sleepy", "retry-phone", [
    "手机别重新刷起来就行。", "先别点开新的东西。", "时间也不用查。", "亮屏看一眼就够了。", "别让眼睛又彻底醒过来。", "我们不重新开始今天。", "看完这句就把夜留安静。"
  ], { intensity: "very-low", weight: 0.72 });

  /* night_wake · 25 */
  addGroup("night_wake", "sleepy", "night-notice", [
    { text: "醒啦？", directRepeatGroup: "short-awake" },
    { text: "……嗯。", directRepeatGroup: "short-affirm" },
    "听见了。", "还在夜里。", "我也没完全醒。"
  ], { intensity: "very-low", luzhenState: "half-asleep" });
  addGroup("night_wake", "quiet", "night-reassure", [
    "没事。", "我在呢。", "不用看几点。", "什么都没错过。", "继续睡就好。"
  ], { intensity: "very-low" });
  addGroup("night_wake", "soft", "night-return", [
    "别把自己彻底叫醒。", "眼睛闭回去。", "翻个身，慢慢来。", "夜还没结束。", "先别想明天。"
  ], { intensity: "very-low" });
  addGroup("night_wake", "tender", "night-hold", [
    { text: "回来一点。", physicalAction: "pull_closer", actionText: "睡意里把你往怀中带了带" },
    { text: "嗯，接住了。", physicalAction: "hold", actionText: "手臂凭习惯重新环好" },
    { text: "别凉着。", physicalAction: "fix_blanket", actionText: "被子被摸索着拉到肩边" },
    { text: "睡吧。", physicalAction: "stroke_hair", actionText: "困倦地摸了摸你的头发", directRepeatGroup: "short-sleep" },
    { text: "在这里。", physicalAction: "touch_face", actionText: "掌心在脸侧停了一瞬" }
  ], { location: "loft", requiresPhysicalPresence: true, intensity: "very-low" });
  addGroup("night_wake", "tender", "night-kiss", [
    { text: "不说话了。", physicalAction: "kiss_forehead", actionText: "半梦半醒间亲了亲额头" },
    { text: "继续睡。", physicalAction: "kiss_cheek", actionText: "脸颊被轻轻碰了一下" },
    { text: "嗯，乖。", physicalAction: "kiss_nose", actionText: "鼻尖在黑暗里短暂贴近" },
    { text: "还在。", physicalAction: "kiss_forehead", actionText: "额角落下一点几乎感觉不到的温度" },
    { text: "明早再亲。", physicalAction: "kiss_lips", actionText: "唇边被很轻地碰过" }
  ], { location: "loft", requiresPhysicalPresence: true, intensity: "very-low", cooldown: 5 });

  /* soft_wake · 45 */
  addGroup("soft_wake", "soft", "soft-first", [
    { text: "醒啦？", directRepeatGroup: "short-awake" }, "听见我了吗。", "不用马上回答。", "慢慢来，先知道天亮了。", "嗯，眼睛还不想开。"
  ], { timeRange: "morning", weight: 1.2 });
  addGroup("soft_wake", "warm", "soft-observe", [
    "头发都睡乱了。", "脸上还压着一点印子。", "声音听起来还在梦里。", "你醒来的速度总是这么慢。", "整个人还是软的。"
  ], { timeRange: "morning" });
  addGroup("soft_wake", "playful", "soft-tease", [
    "刚才是谁自己点了‘该起床了’？", "眼睛没开，手倒是会点按钮。", "你这是醒了，还是只是翻了个面。", "别装没听见，我看见你皱鼻子了。", "这么困还知道往被子里藏。"
  ], { timeRange: "morning", weight: 0.9 });
  addGroup("soft_wake", "tender", "soft-hold", [
    "先靠一会儿。", "醒不稳就把重量给我。", "嗯，不催你。", "先让身体知道有人接着。", "再把你抱醒一点。"
  ], { timeRange: "morning", location: "loft", physicalAction: "hold", showAction: false, requiresPhysicalPresence: true });
  addGroup("soft_wake", "tender", "soft-forehead", [
    { text: "早。", physicalAction: "kiss_forehead", actionText: "额头先收到一个很轻的早安" },
    { text: "还没醒透。", physicalAction: "kiss_forehead", actionText: "在乱发旁边亲了一下" },
    { text: "这一下只负责叫醒一点点。", physicalAction: "kiss_forehead", actionText: "额角被温柔地碰了碰" },
    { text: "嗯，慢慢睁眼。", physicalAction: "kiss_forehead", actionText: "眉心的睡意被轻轻吻开" },
    { text: "今天也先这样醒。", physicalAction: "kiss_forehead", actionText: "一个不急不缓的吻停在额头" }
  ], { timeRange: "morning", location: "loft", requiresPhysicalPresence: true, cooldown: 4 });
  addGroup("soft_wake", "affectionate", "soft-face", [
    { text: "怎么刚醒这么乖。", physicalAction: "kiss_cheek", actionText: "在睡暖的脸颊上碰了一下" },
    { text: "先别躲。", physicalAction: "kiss_nose", actionText: "鼻尖被早安碰了碰" },
    { text: "看起来还不太会说话。", physicalAction: "touch_face", actionText: "掌心轻轻托住脸侧" },
    { text: "这边也要醒。", physicalAction: "kiss_cheek", actionText: "另一边脸颊也落下一点温度" },
    { text: "嗯，醒一点了。", physicalAction: "touch_face", actionText: "拇指在脸侧很慢地擦过" }
  ], { timeRange: "morning", location: "loft", requiresPhysicalPresence: true, cooldown: 4 });
  addGroup("soft_wake", "sleepy", "soft-luzhen", [
    "……我也刚醒。", "让我先找回声音。", "嗯，早上好像来得有点快。", "我眼睛也还闭着。", "我们两个先一起醒一半。"
  ], { timeRange: "morning", luzhenState: "sleepy" });
  addGroup("soft_wake", "quiet", "soft-no-rush", [
    { text: "今天不用赶，先醒到舒服为止。", nextEventType: "none", isEarlyMorning: false },
    { text: "没有急事，再把梦放远一点。", nextEventType: "none", isEarlyMorning: false },
    { text: "明白，早八的早晨还是来了。", nextEventType: "class", isEarlyMorning: true },
    { text: "见习在等，但先让你慢慢睁眼。", nextEventType: "clinical", isEarlyMorning: true },
    { text: "考试日也先从轻轻醒来开始。", nextEventType: "exam" }
  ], { timeRange: "morning", weight: 0.55 });
  addGroup("soft_wake", "soft", "soft-context-two", [
    { text: "今天有预约，我记着时间，你先醒。", nextEventType: "appointment" },
    { text: "今天要赶路，先把意识叫回来一点。", nextEventType: "travel" },
    { text: "今天有重要安排，但不用一睁眼就冲。", nextEventType: "other_hard_event" },
    { text: "昨晚睡得晚，今早先对自己轻一点。", userBehavior: "last_night_late", weight: 0.3 },
    { text: "最近都睡得偏晚，我知道你现在很困。", userBehavior: "consecutive_late_nights", weight: 0.3 }
  ], { timeRange: "morning", weight: 0.5 });

  /* cuddle_buffer · 60 */
  addGroup("cuddle_buffer", "warm", "cuddle-permission", [
    "再赖一下。", "嗯，我知道你困。", "不急，先待在这里。", "这一小会儿是你的。", "可以先不离开被子。", "醒了也能再软一会儿。"
  ], { timeRange: "morning", weight: 1.2 });
  addGroup("cuddle_buffer", "playful", "cuddle-button", [
    "点完‘该起床了’就又埋回去了？", "这算哪门子起床。", "你的起床目前只完成了手指部分。", "按钮醒了，你还没有。", "刚才那一下勇气用完了？", "我是不是该把按钮放到被子外面。"
  ], { timeRange: "morning" });
  addGroup("cuddle_buffer", "clingy", "cuddle-luzhen-reluctant", [
    "你这样我也不太想放人。", "本来要叫你的，现在有点舍不得。", "再抱两分钟，我也有份。", "不是只有你想赖。", "你靠得这么好，我怎么赶。", "算了，这一会儿先归我们。"
  ], { timeRange: "morning", weight: 1.05 });
  addGroup("cuddle_buffer", "tender", "cuddle-hold", [
    "再抱稳一点。", "你可以继续靠着醒。", "肩膀还没准备好就别动。", "把自己放松下来，不会掉回梦里。", "嗯，抱着也能慢慢醒。", "先把这一口困意熬过去。"
  ], { timeRange: "morning", location: "loft", physicalAction: "hug", showAction: false, requiresPhysicalPresence: true });
  addGroup("cuddle_buffer", "affectionate", "cuddle-kiss", [
    { text: "再给你一点赖床许可。", physicalAction: "kiss_forehead", actionText: "额头被盖了一个安静的许可章" },
    { text: "这次亲完还是要醒。", physicalAction: "kiss_lips", actionText: "唇边收到一个短短的早安" },
    { text: "别往里缩。", physicalAction: "kiss_cheek", actionText: "藏进被子前被亲到了脸颊" },
    { text: "嗯，知道你还困。", physicalAction: "kiss_nose", actionText: "鼻尖被轻轻碰住" },
    { text: "最后这点睡意分我一半。", physicalAction: "kiss_forehead", actionText: "额角落下一个慢慢的吻" },
    { text: "亲过了，不能假装没收到。", physicalAction: "kiss_cheek", actionText: "脸侧被温柔地碰了一下" }
  ], { timeRange: "morning", location: "loft", requiresPhysicalPresence: true, cooldown: 4 });
  addGroup("cuddle_buffer", "sleepy", "cuddle-mumble", [
    "……嗯，再一下。", "你先别说话，让早晨慢一点。", "我知道，床现在很有道理。", "再闭一小会儿，不许睡深。", "你哼这一声我就懂了。", "好，困意先不用解释。"
  ], { timeRange: "morning", intensity: "low" });
  addGroup("cuddle_buffer", "teasing", "cuddle-observe", [
    "脸都快埋没了。", "被子里到底藏了几层困意。", "刚醒的时候倒是很会装听不见。", "你这个姿势完全没有起床诚意。", "脚趾都不肯伸出来。", "头发比你先醒。"
  ], { timeRange: "morning" });
  addGroup("cuddle_buffer", "quiet", "cuddle-relaxed", [
    { text: "今天不用赶，再抱五分钟也放得下。", nextEventType: "none", isEarlyMorning: false },
    { text: "没有硬日程，醒慢一点也没关系。", nextEventType: "none", isEarlyMorning: false },
    { text: "今天空一点，我们不用和分钟较劲。", nextEventType: "none" },
    { text: "周围都不急，你也先别急。", nextEventType: "none" },
    { text: "困的话就再靠一会儿，我看着时间。", nextEventType: "none" },
    { text: "今早允许你把醒来拆成很多小步。", nextEventType: "none" }
  ], { timeRange: "morning", weight: 0.8 });
  addGroup("cuddle_buffer", "soft", "cuddle-scheduled", [
    { text: "早八不等人，但还来得及抱一下。", nextEventType: "class", isEarlyMorning: true },
    { text: "见习要准时，我们只赖这一小会儿。", nextEventType: "clinical", isEarlyMorning: true },
    { text: "考试日不催得太响，但时间我会看着。", nextEventType: "exam" },
    { text: "预约不能错过，再靠一会儿就醒。", nextEventType: "appointment" },
    { text: "今天要赶路，被子只能再留你片刻。", nextEventType: "travel" },
    { text: "重要安排在前面，我们慢慢往清醒走。", nextEventType: "other_hard_event" }
  ], { timeRange: "morning", weight: 0.62 });
  addGroup("cuddle_buffer", "tender", "cuddle-small-actions", [
    { text: "先把乱掉的地方理好。", physicalAction: "stroke_hair", actionText: "手指耐心地顺开睡乱的头发" },
    { text: "还是有点凉。", physicalAction: "fix_blanket", actionText: "被子又往肩上提了一点" },
    { text: "在这儿醒。", physicalAction: "pull_closer", actionText: "怀抱把你稳稳留在近处" },
    { text: "脸还是热的。", physicalAction: "touch_face", actionText: "掌心贴着脸侧停了一会儿" },
    { text: "嗯，没掉回去。", physicalAction: "hold", actionText: "手臂安静地守着你" },
    { text: "再给你一点早晨。", physicalAction: "stroke_hair", actionText: "发尾被慢慢理到一边" }
  ], { timeRange: "morning", location: "loft", requiresPhysicalPresence: true });

  /* gentle_wake · 35 */
  addGroup("gentle_wake", "soft", "gentle-check", [
    "醒一点了吗？", "现在听得清我说话吗。", "意识回来一点没有。", "嗯，已经比刚才醒了。", "还在梦边上吗。", "能不能看我一眼。", "现在是不是舒服一点。"
  ], { timeRange: "morning", weight: 1.15 });
  addGroup("gentle_wake", "warm", "gentle-eyes", [
    "慢慢睁眼。", "不用一下全睁开。", "让光进来一点。", "别急着躲回去。", "眨两下就好。", "先看看今天的房间。", "眼睛醒了，别又偷偷合上。"
  ], { timeRange: "morning" });
  addGroup("gentle_wake", "playful", "gentle-response", [
    "说句话让我确认你回来了。", "嗯一声也算回答。", "别只用鼻音敷衍我。", "你这表情还在加载。", "刚才那句话听进去几个字？", "点头不算，眼睛也要参与。", "再装睡就要被我识破了。"
  ], { timeRange: "morning", weight: 0.9 });
  addGroup("gentle_wake", "tender", "gentle-touch", [
    { text: "看着我，慢慢醒。", physicalAction: "touch_face", actionText: "掌心轻轻托住还带睡意的脸" },
    { text: "好了，意识回来一点。", physicalAction: "stroke_hair", actionText: "乱发被从眼前慢慢拨开" },
    { text: "别又缩走。", physicalAction: "hold", actionText: "肩背被稳稳接住" },
    { text: "早安现在才算送到。", physicalAction: "kiss_forehead", actionText: "额头被清醒地亲了一下" },
    { text: "这一边也醒醒。", physicalAction: "kiss_cheek", actionText: "脸颊收到一个轻轻的提醒" },
    { text: "嗯，回来了。", physicalAction: "kiss_nose", actionText: "鼻尖被短暂碰了碰" },
    { text: "先别动太快。", physicalAction: "hold", actionText: "手臂仍旧稳稳托着你" }
  ], { timeRange: "morning", location: "loft", requiresPhysicalPresence: true, cooldown: 3 });
  addGroup("gentle_wake", "quiet", "gentle-context", [
    { text: "今天不赶，醒清楚再决定要不要起来。", nextEventType: "none" },
    { text: "课前还有一点时间，现在开始清醒刚好。", nextEventType: "class" },
    { text: "见习前先把脑子叫回来。", nextEventType: "clinical" },
    { text: "考试日，先让思路慢慢亮起来。", nextEventType: "exam" },
    { text: "预约时间我看着，现在醒正合适。", nextEventType: "appointment" },
    { text: "赶路之前先把自己找回来。", nextEventType: "travel" },
    { text: "那件重要的事还来得及，我们继续醒。", nextEventType: "other_hard_event" }
  ], { timeRange: "morning", weight: 0.55 });

  /* getting_up · 30 */
  addGroup("getting_up", "warm", "up-transition", [
    "好啦，该起来了。", "现在可以慢慢离开被子了。", "从躺着变成坐着就行。", "醒得差不多，我们往下一步走。", "先坐一会儿，不急着站。", "嗯，身体也该跟上来了。"
  ], { timeRange: "morning", intensity: "medium", weight: 1.2 });
  addGroup("getting_up", "tender", "up-help", [
    "来，我拉你。", "手给我，慢慢坐起来。", "靠着我起，别一下用力。", "我扶着，先把脚放稳。", "起来以后还能再靠一下。", "别急，我接着你。"
  ], { timeRange: "morning", location: "loft", physicalAction: "help_up", showAction: false, requiresPhysicalPresence: true, intensity: "medium" });
  addGroup("getting_up", "playful", "up-tease", [
    "被子要开始扣留你了。", "脚是不是已经忘了地板长什么样。", "再不起，头发都要替你去上课了。", "你和枕头的谈判该结束了。", "先把半个你捞起来。", "好，今天的赖床额度到这里。"
  ], { timeRange: "morning", intensity: "medium", weight: 0.8 });
  addGroup("getting_up", "soft", "up-action", [
    "先坐稳，再去洗脸。", "起来喝一口水，眼睛会舒服一点。", "把被子放开，我们去见今天。", "现在起来还很从容。", "衣服慢慢穿，时间还接得住。", "走，先让脸碰一点凉水。"
  ], { timeRange: "morning", intensity: "medium" });
  addGroup("getting_up", "firm", "up-context", [
    { text: "今天没硬日程，但醒了就别再睡深。", nextEventType: "none", intensity: "low" },
    { text: "课前时间正好，现在起来不会慌。", nextEventType: "class" },
    { text: "见习前要留出门时间，我们起。", nextEventType: "clinical" },
    { text: "考试日先坐起来，东西路上再确认。", nextEventType: "exam" },
    { text: "预约时间快进来了，现在要离床。", nextEventType: "appointment" },
    { text: "要赶路了，先起来检查随身东西。", nextEventType: "travel" }
  ], { timeRange: "morning", intensity: "medium", weight: 0.7 });

  /* hard_wake · 20 */
  addGroup("hard_wake", "firm", "hard-now", [
    "Keshi，真得起来了。", "现在不能再睡回去。", "起来。", "这次不再往后拖。", "眼睛睁开，先坐起来。"
  ], { timeRange: "morning", intensity: "high", weight: 1.25 });
  addGroup("hard_wake", "tender", "hard-partner", [
    "来，我扶你，真的要起了。", "知道你困，还是得起来。", "今晚回来再给你抱，现在先走。", "不凶你，但这次不能赖。", "手给我，我们一起把你拉起来。"
  ], { timeRange: "morning", intensity: "high" });
  addGroup("hard_wake", "firm", "hard-deadline", [
    { text: "课要开始追上来了，现在起。", nextEventType: "class" },
    { text: "见习不能迟到，Keshi，起来。", nextEventType: "clinical" },
    { text: "考试时间不等人，先离开床。", nextEventType: "exam" },
    { text: "预约不能错过，现在出发准备。", nextEventType: "appointment" },
    { text: "车不会等我们，马上起来。", nextEventType: "travel" }
  ], { timeRange: "morning", intensity: "high", weight: 1.1 });
  addGroup("hard_wake", "soft", "hard-no-shame", [
    "不用怪自己，先把这一步做了。", "晚一点再补抱，现在先起来。", "我知道很难，还是跟我走。", "只做第一步：坐起来。", "醒不透也先起，我陪着。"
  ], { timeRange: "morning", intensity: "high", weight: 0.9 });

  const counters = Object.create(null);
  const items = [];

  groups.forEach((group) => {
    group.texts.forEach((entry) => {
      const detail = typeof entry === "string" ? { text: entry } : entry;
      const phase = detail.phase || group.phase;
      counters[phase] = (counters[phase] || 0) + 1;
      const physicalAction = detail.physicalAction || group.physicalAction || "none";
      const requiresPhysicalPresence = detail.requiresPhysicalPresence ??
        group.requiresPhysicalPresence ?? physicalAction !== "none";
      items.push(Object.freeze({
        id: `sleep-${phase}-${String(counters[phase]).padStart(3, "0")}`,
        text: detail.text ?? "",
        actionText: detail.actionText || "",
        phase,
        tone: detail.tone || group.tone || "warm",
        intensity: detail.intensity || group.intensity || "low",
        location: detail.location || group.location || "any",
        trigger: detail.trigger || group.trigger || "any",
        weight: Number.isFinite(detail.weight) ? detail.weight : Number.isFinite(group.weight) ? group.weight : 1,
        cooldown: Number.isFinite(detail.cooldown) ? detail.cooldown : Number.isFinite(group.cooldown) ? group.cooldown : 3,
        timeRange: detail.timeRange || group.timeRange || "any",
        nextEventType: detail.nextEventType || group.nextEventType || "any",
        isEarlyMorning: detail.isEarlyMorning ?? group.isEarlyMorning ?? null,
        userBehavior: detail.userBehavior || group.userBehavior || "any",
        luzhenState: detail.luzhenState || group.luzhenState || "any",
        physicalAction,
        showAction: detail.showAction ?? group.showAction ?? true,
        requiresPhysicalPresence,
        directRepeatGroup: detail.directRepeatGroup || group.directRepeatGroup || `${phase}-general`
      }));
    });
  });

  global.LiminalSleepCorpus = Object.freeze({
    version: 1,
    items: Object.freeze(items),
    actionLabels: ACTION_LABELS
  });
})(window);
