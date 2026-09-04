(function () {
  "use strict";


  function getElement(id) {
    return document.getElementById(id);
  }


  function getVersionText(version) {
    return `v${version}`;
  }


  function getDisplayDate(dateValue) {
    return dateValue.replace(/-/g, ".");
  }


  function setText(id, value) {

    const element =
      getElement(id);


    if (element) {
      element.textContent = value;
    }

  }


  function renderSettingsVersion(versionData) {

    const versionText =
      getVersionText(
        versionData.current
      );


    setText(
      "settingsVersionLabel",
      versionText
    );

    setText(
      "settingsVersionFooter",
      `Liminal · ${versionText}`
    );

  }


  function createVersionGroup(group) {

    const section =
      document.createElement("section");

    const heading =
      document.createElement("h4");

    const list =
      document.createElement("ul");


    section.className =
      "version-group";

    heading.textContent =
      group.title;


    group.items.forEach(function (item) {

      const listItem =
        document.createElement("li");


      listItem.textContent = item;
      list.appendChild(listItem);

    });


    section.appendChild(heading);
    section.appendChild(list);


    return section;

  }


  function createVersionEntry(release, index) {

    const article =
      document.createElement("article");

    const marker =
      document.createElement("span");

    const content =
      document.createElement("div");

    const header =
      document.createElement("header");

    const titleWrap =
      document.createElement("div");

    const kicker =
      document.createElement("span");

    const title =
      document.createElement("h3");

    const date =
      document.createElement("time");

    const label =
      document.createElement("p");

    const groups =
      document.createElement("div");


    article.className =
      "version-entry";

    marker.className =
      "version-marker";

    content.className =
      "version-entry-content";

    header.className =
      "version-entry-header";

    kicker.className =
      "version-entry-kicker";

    date.className =
      "version-entry-date";

    label.className =
      "version-entry-label";

    groups.className =
      "version-groups";


    kicker.textContent =
      index === 0
        ? "LATEST RELEASE"
        : "RELEASE";

    title.textContent =
      getVersionText(release.version);

    date.dateTime =
      release.releasedAt;

    date.textContent =
      getDisplayDate(
        release.releasedAt
      );

    label.textContent =
      release.label;


    if (index === 0) {
      article.classList.add("is-current");
    }


    release.groups.forEach(function (group) {
      groups.appendChild(
        createVersionGroup(group)
      );
    });


    titleWrap.appendChild(kicker);
    titleWrap.appendChild(title);

    header.appendChild(titleWrap);
    header.appendChild(date);

    content.appendChild(header);
    content.appendChild(label);
    content.appendChild(groups);

    article.appendChild(marker);
    article.appendChild(content);


    return article;

  }


  function renderChangelog(versionData) {

    const timeline =
      getElement("versionTimeline");


    if (!timeline) {
      return;
    }


    setText(
      "currentVersionNumber",
      getVersionText(
        versionData.current
      )
    );

    setText(
      "currentVersionLabel",
      versionData.label
    );


    const currentDate =
      getElement("currentVersionDate");


    if (currentDate) {

      currentDate.dateTime =
        versionData.releasedAt;

      currentDate.textContent =
        getDisplayDate(
          versionData.releasedAt
        );

    }


    const fragment =
      document.createDocumentFragment();


    versionData.history.forEach(
      function (release, index) {
        fragment.appendChild(
          createVersionEntry(
            release,
            index
          )
        );
      }
    );


    while (timeline.firstChild) {
      timeline.removeChild(
        timeline.firstChild
      );
    }


    timeline.appendChild(fragment);

  }


  function initializeVersionUI() {

    const versionData =
      window.LiminalVersion;


    if (
      !versionData ||
      !versionData.current ||
      !Array.isArray(versionData.history)
    ) {

      console.error(
        "Liminal version data is unavailable."
      );

      return;

    }


    renderSettingsVersion(versionData);
    renderChangelog(versionData);

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initializeVersionUI,
      { once: true }
    );

  } else {
    initializeVersionUI();
  }

})();
