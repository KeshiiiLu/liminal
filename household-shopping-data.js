/* =========================
   Liminal · Household Shopping Data
   静态规则、商户和轻库存定义；不直接写入 Wallet。
   ========================= */

(function () {
  "use strict";

  const stockKeys = [
    "chicken",
    "beef",
    "otherProtein",
    "vegetables",
    "fruit",
    "eggs",
    "dairy",
    "bread",
    "wontons",
    "noodles",
    "colaZero",
    "coffeeBeans",
    "snacks",
    "householdSupplies"
  ];

  const initialInventory = Object.fromEntries(
    stockKeys.map((key) => [key, "ok"])
  );

  const missions = {
    dinner_today: { label: "今晚做饭", baseWeight: 1.1, stockKeys: ["chicken", "beef", "otherProtein", "vegetables"] },
    weekly_restock: { label: "家庭补货", baseWeight: 0.85, stockKeys },
    big_restock: { label: "家庭囤货", baseWeight: 0.18, stockKeys: ["beef", "otherProtein", "dairy", "colaZero", "snacks", "householdSupplies"] },
    breakfast_restock: { label: "早餐补货", baseWeight: 0.5, stockKeys: ["eggs", "dairy", "bread", "coffeeBeans"] },
    fruit_restock: { label: "水果补货", baseWeight: 0.45, stockKeys: ["fruit"] },
    protein_restock: { label: "肉类补货", baseWeight: 0.48, stockKeys: ["chicken", "beef", "otherProtein"] },
    drinks_restock: { label: "饮料补货", baseWeight: 0.38, stockKeys: ["colaZero", "coffeeBeans"] },
    quick_meal_restock: { label: "快手食物补货", baseWeight: 0.44, stockKeys: ["wontons", "noodles"] },
    snack_restock: { label: "零食补货", baseWeight: 0.28, stockKeys: ["snacks"] },
    dairy_restock: { label: "奶制品补货", baseWeight: 0.3, stockKeys: ["dairy"] },
    household_restock: { label: "日用品补货", baseWeight: 0.32, stockKeys: ["householdSupplies"] }
  };

  const merchants = {
    hema: {
      label: "盒马",
      baseWeight: 1.45,
      missions: {
        dinner_today: 1.8,
        weekly_restock: 1.25,
        fruit_restock: 1.55,
        protein_restock: 1.5,
        quick_meal_restock: 1.1
      }
    },
    sams: {
      label: "山姆会员商店",
      baseWeight: 0.34,
      missions: {
        big_restock: 3.5,
        weekly_restock: 0.9,
        drinks_restock: 1.7,
        dairy_restock: 1.35,
        household_restock: 1.45,
        dinner_today: 0.12
      }
    },
    walmart: {
      label: "沃尔玛",
      baseWeight: 0.72,
      missions: {
        weekly_restock: 1.35,
        household_restock: 1.3,
        breakfast_restock: 1.05
      }
    },
    instant_fresh: {
      label: "即时生鲜",
      baseWeight: 0.72,
      missions: {
        dinner_today: 1.5,
        fruit_restock: 1.25,
        protein_restock: 1.15,
        quick_meal_restock: 1.25,
        big_restock: 0.05
      }
    },
    jd: {
      label: "京东",
      baseWeight: 0.5,
      missions: {
        drinks_restock: 1.8,
        quick_meal_restock: 1.35,
        snack_restock: 1.2,
        household_restock: 1.7,
        dinner_today: 0.08,
        fruit_restock: 0.08
      }
    },
    freshmart: {
      label: "久光超市 FreshMart",
      baseWeight: 0.48,
      missions: {
        dinner_today: 1.6,
        weekly_restock: 0.85,
        breakfast_restock: 0.9,
        protein_restock: 1.35,
        quick_meal_restock: 1.25,
        snack_restock: 0.85,
        dairy_restock: 0.9,
        fruit_restock: 0.85,
        big_restock: 0.06,
        household_restock: 0.08
      }
    }
  };

  const products = [
    { id: "chicken_thigh", name: "鸡腿肉", stockKey: "chicken", price: [28, 48], merchants: ["hema", "walmart", "instant_fresh"] },
    { id: "chicken_breast", name: "鸡胸 / 鸡里脊", stockKey: "chicken", price: [24, 42], merchants: ["hema", "walmart", "instant_fresh"] },
    { id: "steak", name: "牛排", stockKey: "beef", price: [68, 158], merchants: ["hema", "sams", "freshmart"] },
    { id: "beef_brisket", name: "牛腩", stockKey: "beef", price: [48, 88], merchants: ["hema", "walmart", "sams"] },
    { id: "beef_slices", name: "牛肉片", stockKey: "beef", price: [42, 78], merchants: ["hema", "walmart", "instant_fresh"] },
    { id: "lamb", name: "羊肉", stockKey: "otherProtein", price: [55, 108], merchants: ["hema", "sams"] },
    { id: "fish", name: "海鱼", stockKey: "otherProtein", price: [45, 118], merchants: ["hema", "instant_fresh", "freshmart"] },
    { id: "shrimp", name: "虾", stockKey: "otherProtein", price: [42, 96], merchants: ["hema", "instant_fresh", "freshmart"] },
    { id: "sashimi", name: "刺身拼盘", stockKey: "otherProtein", price: [128, 298], merchants: ["freshmart"] },
    { id: "salmon", name: "三文鱼刺身", stockKey: "otherProtein", price: [78, 188], merchants: ["freshmart", "hema"] },
    { id: "tuna", name: "金枪鱼", stockKey: "otherProtein", price: [88, 198], merchants: ["freshmart"] },
    { id: "sweet_shrimp", name: "甜虾 / 北极贝", stockKey: "otherProtein", price: [68, 168], merchants: ["freshmart"] },
    { id: "sushi", name: "寿司拼盘", stockKey: "otherProtein", price: [68, 188], merchants: ["freshmart"] },
    { id: "japanese_bento", name: "日式便当 / 熟食", stockKey: "noodles", price: [38, 88], merchants: ["freshmart"] },
    { id: "broccoli", name: "西兰花", stockKey: "vegetables", price: [9, 18], merchants: ["hema", "walmart", "instant_fresh"] },
    { id: "mushrooms", name: "菌菇", stockKey: "vegetables", price: [12, 28], merchants: ["hema", "walmart", "instant_fresh", "freshmart"] },
    { id: "asparagus", name: "芦笋", stockKey: "vegetables", price: [18, 36], merchants: ["hema", "instant_fresh", "freshmart"] },
    { id: "potato", name: "土豆", stockKey: "vegetables", price: [8, 16], merchants: ["hema", "walmart", "instant_fresh"] },
    { id: "cucumber", name: "黄瓜", stockKey: "vegetables", price: [7, 14], merchants: ["hema", "walmart", "instant_fresh"] },
    { id: "baby_cabbage", name: "娃娃菜 / 玉米", stockKey: "vegetables", price: [12, 24], merchants: ["hema", "walmart", "instant_fresh"] },
    { id: "blueberry", name: "蓝莓", stockKey: "fruit", price: [24, 48], merchants: ["hema", "sams", "freshmart"] },
    { id: "crisp_apple", name: "脆苹果", stockKey: "fruit", price: [18, 42], merchants: ["hema", "walmart", "sams"] },
    { id: "seasonal_fruit", name: "桃子 / 草莓 / 橙子", stockKey: "fruit", price: [22, 58], merchants: ["hema", "walmart", "instant_fresh", "freshmart"] },
    { id: "grapefruit", name: "柚子 / 葡萄柚", stockKey: "fruit", price: [16, 36], merchants: ["hema", "instant_fresh", "freshmart"] },
    { id: "apple_banana", name: "苹果蕉", stockKey: "fruit", price: [15, 32], merchants: ["hema", "walmart"] },
    { id: "eggs", name: "鸡蛋", stockKey: "eggs", price: [18, 36], merchants: ["hema", "walmart", "sams"] },
    { id: "raw_eggs", name: "可生食鸡蛋", stockKey: "eggs", price: [28, 58], merchants: ["freshmart"] },
    { id: "yogurt", name: "原味酸奶", stockKey: "dairy", price: [16, 38], merchants: ["hema", "walmart", "sams", "freshmart"] },
    { id: "cheese", name: "奶酪", stockKey: "dairy", price: [28, 68], merchants: ["sams", "freshmart"] },
    { id: "bread", name: "面包", stockKey: "bread", price: [16, 36], merchants: ["hema", "walmart", "sams"] },
    { id: "wontons", name: "速冻小馄饨", stockKey: "wontons", price: [22, 45], merchants: ["hema", "walmart", "jd"] },
    { id: "udon", name: "乌冬面", stockKey: "noodles", price: [16, 38], merchants: ["hema", "walmart", "jd", "freshmart"] },
    { id: "noodles", name: "面条 / 速冻饺子", stockKey: "noodles", price: [18, 42], merchants: ["hema", "walmart", "jd"] },
    { id: "tofu", name: "豆腐 / 日式小菜", stockKey: "vegetables", price: [12, 32], merchants: ["freshmart"] },
    { id: "japanese_seasoning", name: "味噌 / 日式酱油 / 海苔", stockKey: "householdSupplies", price: [18, 58], merchants: ["freshmart"] },
    { id: "cola_zero", name: "无糖可口可乐", stockKey: "colaZero", price: [28, 68], merchants: ["hema", "walmart", "sams", "jd"] },
    { id: "sparkling_water", name: "气泡水", stockKey: "colaZero", price: [22, 58], merchants: ["hema", "walmart", "sams", "jd"] },
    { id: "coffee", name: "咖啡豆 / 茶", stockKey: "coffeeBeans", price: [48, 138], merchants: ["hema", "sams", "jd", "freshmart"] },
    { id: "chocolate", name: "榛子 / 抹茶 / 高可可巧克力", stockKey: "snacks", price: [22, 68], merchants: ["hema", "walmart", "sams", "freshmart"] },
    { id: "snacks", name: "原味薯片 / 杨桃味果冻 / 坚果", stockKey: "snacks", price: [18, 58], merchants: ["hema", "walmart", "sams", "jd"] },
    { id: "household", name: "家庭日用品 / 纸品", stockKey: "householdSupplies", price: [28, 118], merchants: ["walmart", "sams", "jd"] },
    { id: "sake", name: "清酒 / 日本啤酒", stockKey: "snacks", price: [58, 168], merchants: ["freshmart"], rare: true }
  ];

  window.LIMINAL_HOUSEHOLD_SHOPPING_DATA = {
    version: 1,
    stockLevels: ["empty", "low", "ok", "full"],
    stockKeys,
    initialInventory,
    missions,
    merchants,
    products,
    bigRestockCooldownDays: 7,
    autoShoppingProbability: {
      weekday: 0.24,
      friday: 0.42,
      weekend: 0.38,
      highIntensity: 0.34
    }
  };
})();
