(function () {
  "use strict";

  const STORAGE_KEY = "liminal_chat_profiles_v1";
  const STORAGE_VERSION = 1;
  const DEFAULT_INITIALS = Object.freeze({
    keshi: "K",
    luzhen: "L",
    jasper: "J"
  });
  let cachedRaw = null;
  let cachedProfiles = null;

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function emptyProfiles() {
    return { version: STORAGE_VERSION, customAvatars: {}, profiles: {} };
  }

  function readProfiles() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (cachedProfiles && raw === cachedRaw) return cachedProfiles;
    if (!raw) {
      cachedRaw = null;
      cachedProfiles = emptyProfiles();
      return cachedProfiles;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!isPlainObject(parsed)) {
        return emptyProfiles();
      }
      cachedRaw = raw;
      cachedProfiles = Object.assign({}, parsed, {
        version: Number.isInteger(parsed.version) ? parsed.version : STORAGE_VERSION,
        customAvatars: isPlainObject(parsed.customAvatars)
          ? Object.assign({}, parsed.customAvatars)
          : {},
        profiles: isPlainObject(parsed.profiles)
          ? Object.assign({}, parsed.profiles)
          : {}
      });
      return cachedProfiles;
    } catch (error) {
      console.warn("[Liminal Avatar] Existing profile data could not be parsed; it was left untouched.", error);
      cachedRaw = raw;
      cachedProfiles = emptyProfiles();
      return cachedProfiles;
    }
  }

  function writeProfiles(profiles) {
    const raw = JSON.stringify(profiles);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedProfiles = profiles;
  }

  function normalizePersonId(personId) {
    return Object.prototype.hasOwnProperty.call(DEFAULT_INITIALS, personId)
      ? personId
      : "";
  }

  function getCustomAvatar(personId) {
    const id = normalizePersonId(personId);
    if (!id) return "";
    const value = readProfiles().customAvatars[id];
    return typeof value === "string" && /^data:image\/(?:jpeg|png|webp);base64,/i.test(value)
      ? value
      : "";
  }

  function getProfile(personId) {
    const id = normalizePersonId(personId);
    if (!id) return {};
    const value = readProfiles().profiles[id];
    return isPlainObject(value) ? Object.assign({}, value) : {};
  }

  function updateProfile(personId, changes) {
    const id = normalizePersonId(personId);
    if (!id) throw new Error("Unknown profile personId.");
    if (!isPlainObject(changes)) throw new Error("Profile changes must be an object.");
    const currentProfiles = readProfiles();
    const profiles = Object.assign({}, currentProfiles, {
      profiles: Object.assign({}, currentProfiles.profiles)
    });
    profiles.version = STORAGE_VERSION;
    profiles.profiles[id] = Object.assign({}, getProfile(id), changes);
    writeProfiles(profiles);
    window.dispatchEvent(new CustomEvent("liminal:profilechange", {
      detail: { personId: id, fields: Object.keys(changes) }
    }));
  }

  function getBio(personId) {
    const value = getProfile(personId).bio;
    return typeof value === "string" ? value : "";
  }

  function setBio(personId, value) {
    updateProfile(personId, { bio: typeof value === "string" ? value : "" });
  }

  function getCustomCover(personId) {
    const value = getProfile(personId).cover;
    return typeof value === "string" && /^data:image\/(?:jpeg|png|webp);base64,/i.test(value)
      ? value
      : "";
  }

  function setCustomCover(personId, dataUrl) {
    if (typeof dataUrl !== "string" || !/^data:image\/(?:jpeg|png|webp);base64,/i.test(dataUrl)) {
      throw new Error("Cover must be a supported image data URL.");
    }
    updateProfile(personId, { cover: dataUrl });
  }

  function clearCustomCover(personId) {
    const id = normalizePersonId(personId);
    if (!id) throw new Error("Unknown profile personId.");
    const currentProfiles = readProfiles();
    const currentPersonProfile = getProfile(id);
    if (!Object.prototype.hasOwnProperty.call(currentPersonProfile, "cover")) return;
    const nextPersonProfile = Object.assign({}, currentPersonProfile);
    delete nextPersonProfile.cover;
    const profiles = Object.assign({}, currentProfiles, {
      profiles: Object.assign({}, currentProfiles.profiles)
    });
    profiles.profiles[id] = nextPersonProfile;
    profiles.version = STORAGE_VERSION;
    writeProfiles(profiles);
    window.dispatchEvent(new CustomEvent("liminal:profilechange", {
      detail: { personId: id, fields: ["cover"] }
    }));
  }

  function render(element, personId, fallbackText) {
    if (!element) return;
    const id = normalizePersonId(personId);
    if (!id) return;
    const customAvatar = getCustomAvatar(id);
    element.dataset.avatarPerson = id;

    if (customAvatar) {
      const image = document.createElement("img");
      image.className = "liminal-avatar-image";
      image.src = customAvatar;
      image.alt = "";
      image.decoding = "async";
      element.replaceChildren(image);
      element.classList.add("has-custom-avatar");
      return;
    }

    element.classList.remove("has-custom-avatar");
    element.textContent = fallbackText || DEFAULT_INITIALS[id];
  }

  function refresh(personId) {
    const id = normalizePersonId(personId);
    const elements = document.querySelectorAll("[data-avatar-person]");
    elements.forEach(function (element) {
      const elementId = normalizePersonId(element.dataset.avatarPerson);
      if (elementId && (!id || elementId === id)) {
        render(element, elementId, element.dataset.avatarFallback || DEFAULT_INITIALS[elementId]);
      }
    });
  }

  function setCustomAvatar(personId, dataUrl) {
    const id = normalizePersonId(personId);
    if (!id) throw new Error("Unknown avatar personId.");
    if (typeof dataUrl !== "string" || !/^data:image\/(?:jpeg|png|webp);base64,/i.test(dataUrl)) {
      throw new Error("Avatar must be a supported image data URL.");
    }
    const currentProfiles = readProfiles();
    const profiles = Object.assign({}, currentProfiles, {
      customAvatars: Object.assign({}, currentProfiles.customAvatars)
    });
    profiles.version = STORAGE_VERSION;
    profiles.customAvatars[id] = dataUrl;
    writeProfiles(profiles);
    refresh(id);
    window.dispatchEvent(new CustomEvent("liminal:avatarchange", { detail: { personId: id } }));
  }

  function clearCustomAvatar(personId) {
    const id = normalizePersonId(personId);
    if (!id) throw new Error("Unknown avatar personId.");
    const currentProfiles = readProfiles();
    const profiles = Object.assign({}, currentProfiles, {
      customAvatars: Object.assign({}, currentProfiles.customAvatars)
    });
    if (Object.prototype.hasOwnProperty.call(profiles.customAvatars, id)) {
      delete profiles.customAvatars[id];
      profiles.version = STORAGE_VERSION;
      writeProfiles(profiles);
    }
    refresh(id);
    window.dispatchEvent(new CustomEvent("liminal:avatarchange", { detail: { personId: id } }));
  }

  function initializePage() {
    refresh();
  }

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
      cachedRaw = null;
      cachedProfiles = null;
      refresh();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, { once: true });
  } else {
    initializePage();
  }

  window.LiminalAvatars = Object.freeze({
    storageKey: STORAGE_KEY,
    storageVersion: STORAGE_VERSION,
    getProfile: getProfile,
    getBio: getBio,
    setBio: setBio,
    getCustomCover: getCustomCover,
    hasCustomCover: function (personId) { return Boolean(getCustomCover(personId)); },
    setCustomCover: setCustomCover,
    clearCustomCover: clearCustomCover,
    getCustomAvatar: getCustomAvatar,
    hasCustomAvatar: function (personId) { return Boolean(getCustomAvatar(personId)); },
    render: render,
    refresh: refresh,
    setCustomAvatar: setCustomAvatar,
    clearCustomAvatar: clearCustomAvatar
  });
})();
