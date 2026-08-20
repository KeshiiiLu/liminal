/* =========================
   Liminal · Poke Random

   拍一拍 / 动作随机。

   固定动作来自：
   poke-data.js

   手机端只负责抽取，
   不负责新增、修改、删除动作。
   ========================= */


/* =========================
   取得动作文字
   ========================= */

function getPokeActionText(
  entry
) {

  if (
    typeof entry ===
    "string"
  ) {

    return entry.trim();

  }


  if (
    !entry ||
    typeof entry !==
      "object"
  ) {

    return "";

  }


  return String(
    entry.text ??
    entry.action ??
    entry.content ??
    ""
  ).trim();

}



/* =========================
   汇总人物全部动作
   ========================= */

function collectPokeActions(
  personId
) {

  if (
    typeof POKE_LIBRARY ===
    "undefined"
  ) {

    return [];

  }


  const person =
    POKE_LIBRARY[
      personId
    ];


  if (!person) {

    return [];

  }


  const results =
    [];


  (
    person.categories ||
    []
  ).forEach(
    function (category) {

      (
        category.actions ||
        []
      ).forEach(
        function (
          entry,
          index
        ) {

          const text =
            getPokeActionText(
              entry
            );


          if (!text) {

            return;

          }


          results.push({

            text:
              text,

            categoryId:
              category.id ||
              "",

            categoryName:
              category.name ||
              "",

            index:
              index

          });

        }
      );

    }
  );


  return results;

}



/* =========================
   抽一个动作
   ========================= */

function drawPokeAction(
  personId,
  personName = ""
) {

  const actions =
    collectPokeActions(
      personId
    );


  if (
    actions.length ===
    0
  ) {

    return null;

  }


  const action =
    actions[
      Math.floor(
        Math.random() *
        actions.length
      )
    ];


  let text =
    action.text;


  /*
    支持以后在数据里写：
    {actor}抱了抱你
  */

  text =
    text
      .replaceAll(
        "{actor}",
        personName
      )
      .replaceAll(
        "{name}",
        personName
      );


  /*
    如果动作本身已经写了人物名，
    就直接使用。

    如果只是：
    “摸了摸你的头”
    则自动变成：
    “榛榛摸了摸你的头”
  */

  if (
    personName &&
    !text.startsWith(
      personName
    ) &&
    !text.startsWith(
      "你"
    )
  ) {

    text =
      `${personName}${text}`;

  }


  return {

    text:
      text,

    categoryId:
      action.categoryId,

    categoryName:
      action.categoryName

  };

}