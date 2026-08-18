const CHAT_PEOPLE = {

  luzhen: {
    name: "榛榛",
    avatar: "L"
  },

  jasper: {
    name: "Jasper",
    avatar: "J"
  }

};


const params =
  new URLSearchParams(
    window.location.search
  );


const personId =
  params.get("person") ||
  "luzhen";


const person =
  CHAT_PEOPLE[personId] ||
  CHAT_PEOPLE.luzhen;


document.getElementById(
  "settingsPersonName"
).textContent =
  `${person.name} · 设置`;


document.getElementById(
  "settingsPersonTitle"
).textContent =
  person.name;


document.getElementById(
  "settingsPersonAvatar"
).textContent =
  person.avatar;


document.title =
  `${person.name} · 聊天设置 · Liminal`;


/* 返回对应聊天 */

document.getElementById(
  "settingsBack"
).addEventListener(
  "click",
  function () {

    window.location.href =
      `chat.html?person=${encodeURIComponent(
        personId
      )}`;

  }
);