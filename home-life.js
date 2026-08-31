/* =========================
   Liminal · Home Life
   ========================= */


/* =========================
   Storage
   ========================= */

const HOME_LIFE_STATE_KEY =
  "liminal_home_life_state_v1";


const HOME_LIFE_HISTORY_KEY =
  "liminal_home_life_history_v1";



/* =========================
   DOM
   ========================= */

const refreshHomeState =
  document.getElementById(
    "refreshHomeState"
  );


const drawNowButton =
  document.getElementById(
    "drawNowButton"
  );


const homeUpdatedText =
  document.getElementById(
    "homeUpdatedText"
  );


const luzhenActivity =
  document.getElementById(
    "luzhenActivity"
  );


const luzhenLocation =
  document.getElementById(
    "luzhenLocation"
  );


const petName =
  document.getElementById(
    "petName"
  );


const petActivity =
  document.getElementById(
    "petActivity"
  );


const petLocation =
  document.getElementById(
    "petLocation"
  );


const petStateText =
  document.getElementById(
    "petStateText"
  );


const petDetailLocation =
  document.getElementById(
    "petDetailLocation"
  );


const petDetailActivity =
  document.getElementById(
    "petDetailActivity"
  );


const roomGrid =
  document.getElementById(
    "roomGrid"
  );


const activityList =
  document.getElementById(
    "activityList"
  );



/* =========================
   Data
   ========================= */

const homeLifeData =
  window.HOME_LIFE_DATA;



/* =========================
   Random
   ========================= */

function randomItem(
  list
) {

  if (
    !Array.isArray(
      list
    ) ||
    !list.length
  ) {

    return null;

  }


  return list[
    Math.floor(
      Math.random() *
      list.length
    )
  ];

}



/* =========================
   Room helpers
   ========================= */

function getRoomById(
  roomId
) {

  return (
    homeLifeData.rooms.find(
      function (
        room
      ) {

        return (
          room.id ===
          roomId
        );

      }
    ) ||
    null
  );

}



function drawRoom() {

  return randomItem(
    homeLifeData.rooms
  );

}



/* =========================
   陆榛状态
   ========================= */

function drawLuzhenState() {

  const room =
    drawRoom();


  if (!room) {

    return null;

  }


  const activity =
    randomItem(
      homeLifeData
        .luzhen
        .activitiesByRoom[
          room.id
        ]
    );


  return {

    roomId:
      room.id,

    roomName:
      room.name,

    activity:
      activity ||
      "正在家里待着"

  };

}



/* =========================
   Pet 状态
   ========================= */

function drawPetState() {

  const room =
    drawRoom();


  if (!room) {

    return null;

  }


  const activity =
    randomItem(
      homeLifeData
        .pet
        .activitiesByRoom[
          room.id
        ]
    );


  const state =
    randomItem(
      homeLifeData
        .pet
        .states
    );


  return {

    roomId:
      room.id,

    roomName:
      room.name,

    state:
      state ||
      "安静",

    activity:
      activity ||
      "正在家里待着"

  };

}



/* =========================
   时间
   ========================= */

function padNumber(
  number
) {

  return String(
    number
  ).padStart(
    2,
    "0"
  );

}



function formatClock(
  date
) {

  return (
    `${padNumber(
      date.getHours()
    )}:` +
    `${padNumber(
      date.getMinutes()
    )}`
  );

}



function formatUpdatedText(
  isoTime
) {

  const date =
    new Date(
      isoTime
    );


  return (
    `${formatClock(
      date
    )} 更新`
  );

}



/* =========================
   History
   ========================= */

function loadHistory() {

  try {

    const parsed =
      JSON.parse(
        localStorage.getItem(
          HOME_LIFE_HISTORY_KEY
        )
      );


    return Array.isArray(
      parsed
    )
      ? parsed
      : [];

  } catch {

    return [];

  }

}



function saveHistory(
  history
) {

  localStorage.setItem(
    HOME_LIFE_HISTORY_KEY,
    JSON.stringify(
      history
    )
  );

}



function addSnapshotToHistory(
  snapshot
) {

  const history =
    loadHistory();


  history.unshift(

    {
      id:
        `home_${Date.now()}_luzhen`,

      time:
        snapshot.updatedAt,

      actor:
        "luzhen",

      text:
        `榛榛 · ${snapshot.luzhen.roomName} · ${snapshot.luzhen.activity}`
    },


    {
      id:
        `home_${Date.now()}_pet`,

      time:
        snapshot.updatedAt,

      actor:
        "pet",

      text:
        `${homeLifeData.pet.name} · ${snapshot.pet.roomName} · ${snapshot.pet.activity}`
    }

  );


  /*
    初版只保留最近 20 条。
  */

  const trimmed =
    history.slice(
      0,
      20
    );


  saveHistory(
    trimmed
  );

}



/* =========================
   State
   ========================= */

function createHomeSnapshot() {

  return {

    version:
      1,

    updatedAt:
      new Date()
        .toISOString(),

    luzhen:
      drawLuzhenState(),

    pet:
      drawPetState()

  };

}



function saveSnapshot(
  snapshot
) {

  localStorage.setItem(
    HOME_LIFE_STATE_KEY,
    JSON.stringify(
      snapshot
    )
  );

}



function loadSnapshot() {

  try {

    const parsed =
      JSON.parse(
        localStorage.getItem(
          HOME_LIFE_STATE_KEY
        )
      );


    if (
      parsed &&
      parsed.version === 1 &&
      parsed.luzhen &&
      parsed.pet
    ) {

      return parsed;

    }

  } catch {

    /*
      读取失败直接重建。
    */

  }


  const snapshot =
    createHomeSnapshot();


  saveSnapshot(
    snapshot
  );


  addSnapshotToHistory(
    snapshot
  );


  return snapshot;

}



let homeSnapshot =
  loadSnapshot();



/* =========================
   Render NOW
   ========================= */

function renderNow() {

  homeUpdatedText.textContent =
    formatUpdatedText(
      homeSnapshot.updatedAt
    );


  luzhenLocation.textContent =
    homeSnapshot
      .luzhen
      .roomName;


  luzhenActivity.textContent =
    homeSnapshot
      .luzhen
      .activity;


  petName.textContent =
    homeLifeData
      .pet
      .name;


  petLocation.textContent =
    homeSnapshot
      .pet
      .roomName;


  petActivity.textContent =
    homeSnapshot
      .pet
      .activity;


  petStateText.textContent =
    homeSnapshot
      .pet
      .state;


  petDetailLocation.textContent =
    homeSnapshot
      .pet
      .roomName;


  petDetailActivity.textContent =
    homeSnapshot
      .pet
      .activity;

}



/* =========================
   Render Rooms
   ========================= */

function renderRooms() {

  roomGrid.innerHTML =
    "";


  homeLifeData.rooms.forEach(
    function (
      room
    ) {

      const people = [];


      if (
        homeSnapshot
          .luzhen
          .roomId ===
        room.id
      ) {

        people.push(
          "榛榛"
        );

      }


      if (
        homeSnapshot
          .pet
          .roomId ===
        room.id
      ) {

        people.push(
          homeLifeData
            .pet
            .name
        );

      }


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "room-card";


      card.innerHTML = `

        <div class="room-symbol">
          ${room.symbol}
        </div>

        <span>
          ${room.name}
        </span>

        <strong>
          ${
            people.length
              ? people.join(" · ")
              : room.defaultState
          }
        </strong>

      `;


      roomGrid.appendChild(
        card
      );

    }
  );

}



/* =========================
   Render History
   ========================= */

function renderHistory() {

  const history =
    loadHistory();


  activityList.innerHTML =
    "";


  if (
    !history.length
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "activity-empty";


    empty.textContent =
      "还没有生活记录。";


    activityList.appendChild(
      empty
    );


    return;

  }


  /*
    History 当前的保存方式：

    每次刷新状态会写入两条：
    - 榛榛
    - Pet

    两条拥有完全相同的 time。

    所以这里按 time
    把它们重新组合成同一行。
  */

  const groupedMap =
    new Map();


  history.forEach(
    function (
      item
    ) {

      const key =
        item.time;


      if (
        !groupedMap.has(
          key
        )
      ) {

        groupedMap.set(
          key,
          {
            time:
              item.time,

            luzhen:
              null,

            pet:
              null
          }
        );

      }


      const group =
        groupedMap.get(
          key
        );


      if (
        item.actor ===
        "luzhen"
      ) {

        group.luzhen =
          item;

      }


      if (
        item.actor ===
        "pet"
      ) {

        group.pet =
          item;

      }

    }
  );


  /*
    当前 history 是：

    最新
    ↓
    最旧

    页面要反过来：

    最旧
    ↓
    最新

    所以 reverse。

    这里只显示最近 8 轮生活状态。
  */

  const groups =
    Array.from(
      groupedMap.values()
    )
      .slice(
        0,
        8
      )
      .reverse();


  groups.forEach(
    function (
      group
    ) {

      const row =
        document.createElement(
          "article"
        );


      row.className =
        "activity-row";


      const date =
        new Date(
          group.time
        );


      const luzhenText =
        group.luzhen
          ?.text
          ?.replace(
            /^榛榛 · /,
            ""
          ) ||
        "—";


      const petText =
        group.pet
          ?.text
          ?.replace(
            /^.*? · /,
            ""
          ) ||
        "—";


      row.innerHTML = `

        <div class="activity-time">
          ${formatClock(date)}
        </div>


        <div class="activity-event activity-event-luzhen">

          <p>
            ${luzhenText}
          </p>

        </div>


        <div class="activity-event activity-event-pet">

          <p>
            ${petText}
          </p>

        </div>

      `;


      activityList.appendChild(
        row
      );

    }
  );


  /*
    最新活动始终在最下面。

    页面刷新活动区以后，
    将活动流滚到最底。
  */

  requestAnimationFrame(
    function () {

      activityList.scrollTop =
        activityList.scrollHeight;

    }
  );

}



/* =========================
   Render all
   ========================= */

function renderAll() {

  renderNow();

  renderRooms();

  renderHistory();

}



/* =========================
   Draw new state
   ========================= */

function drawNewHomeState() {

  homeSnapshot =
    createHomeSnapshot();


  saveSnapshot(
    homeSnapshot
  );


  addSnapshotToHistory(
    homeSnapshot
  );


  renderAll();

}



/* =========================
   Events
   ========================= */

refreshHomeState.addEventListener(
  "click",
  drawNewHomeState
);


drawNowButton.addEventListener(
  "click",
  drawNewHomeState
);



/* =========================
   Start
   ========================= */

renderAll();