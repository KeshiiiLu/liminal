(function () {
  "use strict";

  const CHAT_PEOPLE = {
    luzhen: { id: "luzhen", name: "榛榛", avatar: "L" },
    jasper: { id: "jasper", name: "Jasper", avatar: "J" }
  };
  const USER_PROFILE = { id: "keshi", name: "Keshi", avatar: "K" };
  const avatarStore = window.LiminalAvatars;
  const params = new URLSearchParams(window.location.search);
  const personId = params.get("person") || "luzhen";
  const person = CHAT_PEOPLE[personId] || CHAT_PEOPLE.luzhen;

  const settingsPersonAvatar = document.getElementById("settingsPersonAvatar");
  const partnerAvatarPreview = document.getElementById("partnerAvatarPreview");
  const userAvatarPreview = document.getElementById("userAvatarPreview");
  const partnerAvatarSetting = document.getElementById("partnerAvatarSetting");
  const userAvatarSetting = document.getElementById("userAvatarSetting");
  const editor = document.getElementById("avatarEditor");
  const editorPreview = document.getElementById("avatarEditorPreview");
  const editorTitle = document.getElementById("avatarEditorTitle");
  const fileInput = document.getElementById("avatarFileInput");
  const status = document.getElementById("avatarEditorStatus");
  const saveButton = document.getElementById("avatarEditorSave");
  const resetButton = document.getElementById("avatarResetButton");

  let editingProfile = null;
  let pendingAvatar = "";
  let openingControl = null;
  let imageProcessToken = 0;
  let bodyOverflowBeforeEditor = "";

  document.getElementById("settingsPersonName").textContent = person.name + " · 设置";
  document.getElementById("settingsPersonTitle").textContent = person.name;
  document.getElementById("partnerAvatarLabel").textContent = "更换" + person.name + "头像";
  document.title = person.name + " · 聊天设置 · Liminal";

  function renderSharedAvatar(element, profile) {
    element.dataset.avatarPerson = profile.id;
    element.dataset.avatarFallback = profile.avatar;
    avatarStore.render(element, profile.id, profile.avatar);
  }

  renderSharedAvatar(settingsPersonAvatar, person);
  renderSharedAvatar(partnerAvatarPreview, person);
  renderSharedAvatar(userAvatarPreview, USER_PROFILE);

  document.getElementById("settingsBack").addEventListener("click", function () {
    window.location.href = "chat.html?person=" + encodeURIComponent(person.id);
  });

  function setEditorStatus(message, isError) {
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function renderEditorPreview(dataUrl, fallbackText) {
    if (dataUrl) {
      const image = document.createElement("img");
      image.src = dataUrl;
      image.alt = "头像预览";
      editorPreview.replaceChildren(image);
      return;
    }
    editorPreview.textContent = fallbackText;
  }

  function openEditor(profile, sourceControl) {
    imageProcessToken += 1;
    editingProfile = profile;
    openingControl = sourceControl;
    pendingAvatar = "";
    fileInput.value = "";
    editorTitle.textContent = "更换" + profile.name + "头像";
    renderEditorPreview(avatarStore.getCustomAvatar(profile.id), profile.avatar);
    saveButton.disabled = true;
    resetButton.disabled = !avatarStore.hasCustomAvatar(profile.id);
    setEditorStatus("选择图片后会先显示预览，不会立即覆盖。", false);
    bodyOverflowBeforeEditor = document.body.style.overflow;
    editor.hidden = false;
    editor.inert = false;
    editor.setAttribute("aria-hidden", "false");
    editor.classList.add("is-open");
    document.body.classList.add("avatar-editor-open");
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(function () {
      document.getElementById("avatarEditorClose").focus({ preventScroll: true });
    });
  }

  function closeAvatarEditor() {
    const focusTarget = openingControl;

    imageProcessToken += 1;
    editor.classList.remove("is-open");
    editor.setAttribute("aria-hidden", "true");
    editor.inert = true;
    editor.hidden = true;
    document.body.classList.remove("avatar-editor-open");
    document.body.style.overflow = bodyOverflowBeforeEditor;
    fileInput.value = "";
    pendingAvatar = "";
    editingProfile = null;
    saveButton.disabled = true;
    setEditorStatus("", false);
    openingControl = null;

    if (focusTarget && focusTarget.isConnected) {
      window.requestAnimationFrame(function () {
        focusTarget.focus({ preventScroll: true });
      });
    }
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("无法读取这张图片。")); };
      image.src = url;
    });
  }

  async function compressAvatar(file) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("请选择有效的图片文件。");
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(objectUrl);
      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;
      if (!sourceWidth || !sourceHeight) throw new Error("图片尺寸无效。");

      const cropSize = Math.min(sourceWidth, sourceHeight);
      const sourceX = Math.max(0, (sourceWidth - cropSize) / 2);
      const sourceY = Math.max(0, (sourceHeight - cropSize) / 2);
      const outputSize = Math.max(1, Math.min(512, Math.floor(cropSize)));
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("当前浏览器无法处理图片。");
      context.fillStyle = "#e5e3dd";
      context.fillRect(0, 0, outputSize, outputSize);
      context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, outputSize, outputSize);
      return {
        dataUrl: canvas.toDataURL("image/jpeg", 0.86),
        width: outputSize,
        height: outputSize
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  partnerAvatarSetting.addEventListener("click", function () {
    openEditor(person, partnerAvatarSetting);
  });

  userAvatarSetting.addEventListener("click", function () {
    openEditor(USER_PROFILE, userAvatarSetting);
  });

  fileInput.addEventListener("change", async function () {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !editingProfile) return;
    const profile = editingProfile;
    const processToken = ++imageProcessToken;
    saveButton.disabled = true;
    setEditorStatus("正在裁切和压缩…", false);
    try {
      const result = await compressAvatar(file);

      if (
        processToken !== imageProcessToken ||
        editor.hidden ||
        editingProfile !== profile
      ) {
        return;
      }

      pendingAvatar = result.dataUrl;
      renderEditorPreview(pendingAvatar, profile.avatar);
      saveButton.disabled = false;
      const approximateKilobytes = Math.round((pendingAvatar.length * 0.75) / 1024);
      setEditorStatus(result.width + " × " + result.height + " · JPEG · 约 " + approximateKilobytes + " KB", false);
    } catch (error) {
      if (
        processToken !== imageProcessToken ||
        editor.hidden ||
        editingProfile !== profile
      ) {
        return;
      }

      pendingAvatar = "";
      fileInput.value = "";
      renderEditorPreview(avatarStore.getCustomAvatar(profile.id), profile.avatar);
      setEditorStatus(error.message || "图片处理失败，请换一张重试。", true);
    }
  });

  saveButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (!editingProfile || !pendingAvatar) {
      setEditorStatus("请先选择一张有效图片。", true);
      return;
    }

    const profile = editingProfile;
    const avatarToSave = pendingAvatar;
    saveButton.disabled = true;

    try {
      avatarStore.setCustomAvatar(profile.id, avatarToSave);

      if (avatarStore.getCustomAvatar(profile.id) !== avatarToSave) {
        throw new Error("Avatar persistence verification failed.");
      }

      avatarStore.refresh(profile.id);
      closeAvatarEditor();
    } catch (error) {
      setEditorStatus("保存失败，浏览器本地空间可能不足。原头像没有被覆盖。", true);
      saveButton.disabled = false;
    }
  });

  resetButton.addEventListener("click", function () {
    if (!editingProfile || !avatarStore.hasCustomAvatar(editingProfile.id)) return;
    if (!window.confirm("确定恢复" + editingProfile.name + "的默认头像吗？")) return;
    try {
      avatarStore.clearCustomAvatar(editingProfile.id);
      pendingAvatar = "";
      renderEditorPreview("", editingProfile.avatar);
      saveButton.disabled = true;
      resetButton.disabled = true;
      setEditorStatus("已恢复默认头像。", false);
    } catch (error) {
      setEditorStatus("恢复失败，请稍后重试。", true);
    }
  });

  function handleEditorCancel(event) {
    event.preventDefault();
    event.stopPropagation();
    closeAvatarEditor();
  }

  document.getElementById("avatarEditorClose").addEventListener("click", handleEditorCancel);
  document.getElementById("avatarEditorCancel").addEventListener("click", handleEditorCancel);
  document.getElementById("avatarEditorBackdrop").addEventListener("click", handleEditorCancel);
  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !editor.hidden) closeAvatarEditor();
  });

  window.addEventListener("pagehide", function () {
    if (!editor.hidden) closeAvatarEditor();
  });
})();
