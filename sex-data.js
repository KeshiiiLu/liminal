/*
  Liminal · Sex static definitions

  These presets are code-level definitions. User records and custom position
  presets remain in the existing Calendar localStorage document.
*/

window.LiminalSexData = {
  formOptions: [
    { id: "partner", label: "双人" },
    { id: "solo", label: "自慰" },
    { id: "other", label: "其他" }
  ],

  protectionOptions: [
    { id: "yes", label: "有" },
    { id: "no", label: "无" },
    { id: "na", label: "不适用" }
  ],

  protectionMethods: [
    { id: "condom", label: "避孕套" },
    { id: "other", label: "其他" }
  ],

  positionCategories: [
    { id: "supine", label: "仰卧 / 面对面", shortLabel: "仰卧" },
    { id: "side", label: "侧卧" },
    { id: "top", label: "上位" },
    { id: "rear", label: "后入" },
    { id: "seated", label: "坐姿" },
    { id: "standing", label: "站姿" },
    { id: "other", label: "其他" }
  ],

  positionPresets: [
    { id: "missionary", label: "传教士", category: "supine" },
    { id: "legs_up", label: "抬腿式", category: "supine" },
    { id: "edge", label: "床沿式", category: "supine" },
    { id: "face_to_face_side", label: "面对面侧卧", category: "side" },
    { id: "spooning", label: "勺子式", category: "side" },
    { id: "side", label: "侧卧", category: "side" },
    { id: "cowgirl", label: "女上", category: "top" },
    { id: "reverse_cowgirl", label: "反向女上", category: "top" },
    { id: "kneeling_rear", label: "跪姿后入", category: "rear" },
    { id: "prone_rear", label: "俯卧后入", category: "rear" },
    { id: "rear", label: "后入", category: "rear" },
    { id: "seated_face_to_face", label: "面对面坐姿", category: "seated" },
    { id: "lap", label: "骑坐", category: "seated" },
    { id: "seated", label: "坐姿", category: "seated" },
    { id: "standing_face_to_face", label: "面对面站立", category: "standing" },
    { id: "standing_rear", label: "背后站立", category: "standing" }
  ],

  locationOptions: [
    { id: "bedroom", label: "主卧" },
    { id: "living_room", label: "客厅" },
    { id: "bathroom", label: "浴室" },
    { id: "hotel", label: "酒店" },
    { id: "other", label: "其他" }
  ],

  initiatorOptions: [
    { id: "keshi", label: "Keshi" },
    { id: "luzhen", label: "榛榛" },
    { id: "both", label: "两个人差不多" }
  ],

  aidPresets: [
    { id: "none", label: "无" },
    { id: "suction", label: "吮吸类" },
    { id: "vibration", label: "振动类" },
    { id: "lubricant", label: "润滑剂" },
    { id: "other", label: "其他" }
  ],

  moodBeforePresets: [
    { id: "relaxed", label: "放松" },
    { id: "tired", label: "累" },
    { id: "clingy", label: "撒娇 / 想黏" },
    { id: "low", label: "情绪低" },
    { id: "excited", label: "兴奋" },
    { id: "stressed", label: "有压力" },
    { id: "sleepy", label: "困" }
  ],

  moodAfterPresets: [
    { id: "relaxed", label: "放松" },
    { id: "sleepy", label: "困" },
    { id: "close", label: "亲近 / 黏人" },
    { id: "satisfied", label: "满足" },
    { id: "tired", label: "累" },
    { id: "calm", label: "平静" }
  ]
};
