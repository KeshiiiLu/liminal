/* =========================
   Liminal · Electronic Cards
   01 基础定义

   id   = 永久内部身份
   name = 手机端显示名称

   以后允许修改 name，
   尽量不要修改已经使用过的 id。
   ========================= */


/* =========================
   创建分区
   ========================= */

function createCardSection(
  name,
  items
) {

  return {

    name:
      name,

    /*
      01 数量直接由实际条目计算，
      不再手写 38 / 23 / 27。
    */

    count:
      items.length,

    /*
      完整字卡树尚未导入，
      所以真实叶子卡数量暂时为空。
    */

    cardCount:
      null,

    /*
      正式的稳定定义。

      新功能以后优先读取这里。
    */

    items:
      items,

    /*
      兼容现有 cards.js /
      chat-corpus.js。

      它们目前仍然读取字符串数组，
      所以这里自动生成旧格式。
    */

    categories:
      items.map(
        function (item) {

          return item.name;

        }
      )

  };

}



/* =========================
   三大字卡分区
   ========================= */

const CARD_SECTIONS = {


  /* =========================
     日常
     ========================= */

  normal:
    createCardSection(
      "日常",
      [

        {
          id: "connection_channel_status",
          name: "连接与通道状态"
        },

        {
          id: "affirmation_negation",
          name: "肯定与否定"
        },

        {
          id: "certainty_uncertainty",
          name: "确定与不确定"
        },

        {
          id: "degree",
          name: "程度"
        },

        {
          id: "percentage",
          name: "百分比"
        },

        {
          id: "possibility",
          name: "可能性"
        },

        {
          id: "choice_tradeoff",
          name: "选择与取舍"
        },

        {
          id: "liking_degree",
          name: "喜欢程度"
        },

        {
          id: "acceptance_rejection",
          name: "接受与拒绝"
        },

        {
          id: "willingness",
          name: "意愿"
        },

        {
          id: "needs",
          name: "需求"
        },

        {
          id: "cognition_thinking",
          name: "认知与思考"
        },

        {
          id: "memory",
          name: "记忆"
        },

        {
          id: "viewpoint_position",
          name: "观点立场"
        },

        {
          id: "decision_advice",
          name: "决策与建议"
        },

        {
          id: "communication_willingness",
          name: "沟通意愿"
        },

        {
          id: "communication_action",
          name: "沟通动作"
        },

        {
          id: "information_sharing",
          name: "信息分享"
        },

        {
          id: "emotion",
          name: "情绪"
        },

        {
          id: "current_feeling",
          name: "当下感受"
        },

        {
          id: "energy_mental_state",
          name: "精力与精神状态"
        },

        {
          id: "overall_body_state",
          name: "身体整体状态"
        },

        {
          id: "body_part",
          name: "身体部位"
        },

        {
          id: "body_sensation_symptom",
          name: "身体感觉与症状"
        },

        {
          id: "current_activity",
          name: "当前活动"
        },

        {
          id: "location_space",
          name: "地点与空间"
        },

        {
          id: "time",
          name: "时间"
        },

        {
          id: "environment_scene",
          name: "环境与场景"
        },

        {
          id: "plan",
          name: "计划"
        },

        {
          id: "action_timing",
          name: "行动时机"
        },

        {
          id: "daily_care",
          name: "日常照顾"
        },

        {
          id: "reminder_requirement",
          name: "提醒与要求"
        },

        {
          id: "personal_preference",
          name: "个人偏好"
        },

        {
          id: "values_principles",
          name: "价值观与原则"
        },

        {
          id: "self_understanding",
          name: "自我认识"
        },

        {
          id: "third_party_person",
          name: "第三方人物"
        },

        {
          id: "external_event",
          name: "外界事件"
        },

        {
          id: "memory_experience",
          name: "回忆与经历"
        }

      ]
    ),



  /* =========================
     亲密
     ========================= */

  intimate:
    createCardSection(
      "亲密",
      [

        {
          id: "love",
          name: "爱意"
        },

        {
          id: "missing",
          name: "思念"
        },

        {
          id: "attachment",
          name: "依恋"
        },

        {
          id: "relationship_state",
          name: "关系状态"
        },

        {
          id: "relationship_security",
          name: "关系安全感"
        },

        {
          id: "relationship_confirmation",
          name: "关系确认"
        },

        {
          id: "intimacy_experience_feeling",
          name: "亲密体验与感受"
        },

        {
          id: "heartache_concern",
          name: "心疼与担心"
        },

        {
          id: "protectiveness",
          name: "保护欲"
        },

        {
          id: "possessiveness",
          name: "占有欲"
        },

        {
          id: "jealousy",
          name: "吃醋"
        },

        {
          id: "intimacy_need",
          name: "亲密需求"
        },

        {
          id: "intimacy_action",
          name: "亲密动作"
        },

        {
          id: "comfort_emotional_support",
          name: "安慰与情绪支持"
        },

        {
          id: "praise_appreciation",
          name: "夸奖与欣赏"
        },

        {
          id: "coquetry",
          name: "撒娇"
        },

        {
          id: "teasing_play",
          name: "调侃与玩闹"
        },

        {
          id: "grievance_hurt",
          name: "委屈与受伤"
        },

        {
          id: "intimacy_conflict",
          name: "亲密冲突"
        },

        {
          id: "apology_repair",
          name: "道歉与修复"
        },

        {
          id: "intimate_address",
          name: "亲密称呼"
        },

        {
          id: "shared_life",
          name: "共同生活"
        },

        {
          id: "shared_future",
          name: "共同未来"
        }

      ]
    ),



  /* =========================
     情欲
     ========================= */

  adult:
    createCardSection(
      "情欲",
      [

        {
          id: "sex_willingness",
          name: "sex意愿"
        },

        {
          id: "initiation",
          name: "发起与主动"
        },

        {
          id: "participation_form",
          name: "参与形式"
        },

        {
          id: "masturbation_state_tendency",
          name: "自慰状态与倾向"
        },

        {
          id: "sexual_attraction",
          name: "性吸引"
        },

        {
          id: "desire_intensity",
          name: "欲望强度"
        },

        {
          id: "sexual_emotion_feeling",
          name: "情绪与感受"
        },

        {
          id: "sexual_context_atmosphere",
          name: "情欲情境与氛围"
        },

        {
          id: "sex_location",
          name: "sex地点"
        },

        {
          id: "clothing_state",
          name: "穿着状态"
        },

        {
          id: "interaction_style",
          name: "互动风格"
        },

        {
          id: "dominance_relation",
          name: "主导关系"
        },

        {
          id: "voice_expression",
          name: "声音与表达"
        },

        {
          id: "sex_stage",
          name: "sex互动阶段"
        },

        {
          id: "sexual_body_part",
          name: "身体部位"
        },

        {
          id: "body_response",
          name: "身体反应"
        },

        {
          id: "sexual_action",
          name: "动作"
        },

        {
          id: "position",
          name: "姿势"
        },

        {
          id: "rhythm",
          name: "节奏"
        },

        {
          id: "force",
          name: "力度"
        },

        {
          id: "depth",
          name: "深度"
        },

        {
          id: "sex_request",
          name: "sex中请求"
        },

        {
          id: "duration",
          name: "持续时间"
        },

        {
          id: "frequency_count",
          name: "次数"
        },

        {
          id: "orgasm_goal_tendency",
          name: "高潮目标与倾向"
        },

        {
          id: "after_state",
          name: "事后状态"
        },

        {
          id: "aftercare",
          name: "事后照顾"
        }

      ]
    )

};