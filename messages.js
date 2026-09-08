(function () {
  "use strict";

  const PERSON_ID = "keshi";
  const BIO_PLACEHOLDER = "点击添加个人简介";
  const COVER_WIDTH = 1200;
  const COVER_ASPECT_RATIO = 520 / 250;
  const COVER_JPEG_QUALITY = 0.84;
  const profileStore = window.LiminalAvatars;

  const elements = {
    avatarButton: document.getElementById("profileAvatarButton"),
    bioButton: document.getElementById("profileBioButton"),
    coverAction: document.getElementById("profileCoverAction"),
    coverImage: document.getElementById("profileCoverImage"),
    bioEditor: document.getElementById("bioEditor"),
    bioForm: document.getElementById("bioEditorForm"),
    bioInput: document.getElementById("profileBioInput"),
    coverEditor: document.getElementById("coverEditor"),
    coverPreview: document.getElementById("profileCoverPreview"),
    coverFile: document.getElementById("profileCoverFile"),
    coverStatus: document.getElementById("profileCoverStatus"),
    coverSave: document.getElementById("profileCoverSave"),
    coverCancel: document.getElementById("profileCoverCancel"),
    coverReset: document.getElementById("profileCoverReset")
  };

  let activeEditor = null;
  let openingControl = null;
  let bodyOverflowBeforeEditor = "";
  let pendingCover = "";
  let imageProcessToken = 0;

  function renderBio() {
    const bio = profileStore.getBio(PERSON_ID);
    elements.bioButton.textContent = bio || BIO_PLACEHOLDER;
    elements.bioButton.classList.toggle("is-empty", !bio);
  }

  function renderCover() {
    const cover = profileStore.getCustomCover(PERSON_ID);
    if (cover) {
      elements.coverImage.src = cover;
      elements.coverImage.hidden = false;
      return;
    }
    elements.coverImage.removeAttribute("src");
    elements.coverImage.hidden = true;
  }

  function renderCoverPreview(dataUrl) {
    elements.coverPreview.replaceChildren();
    if (!dataUrl) return;
    const image = document.createElement("img");
    image.src = dataUrl;
    image.alt = "个人主页背景预览";
    image.decoding = "async";
    elements.coverPreview.appendChild(image);
  }

  function setCoverStatus(message, isError) {
    elements.coverStatus.textContent = message || "";
    elements.coverStatus.classList.toggle("is-error", Boolean(isError));
  }

  function openEditor(editor, sourceControl) {
    activeEditor = editor;
    openingControl = sourceControl;
    bodyOverflowBeforeEditor = document.body.style.overflow;
    editor.hidden = false;
    editor.inert = false;
    editor.setAttribute("aria-hidden", "false");
    editor.classList.add("is-open");
    document.body.classList.add("profile-editor-open");
    document.body.style.overflow = "hidden";
  }

  function closeProfileEditor() {
    if (!activeEditor) return;
    const editor = activeEditor;
    const focusTarget = openingControl;
    imageProcessToken += 1;
    editor.classList.remove("is-open");
    editor.setAttribute("aria-hidden", "true");
    editor.inert = true;
    editor.hidden = true;
    document.body.classList.remove("profile-editor-open");
    document.body.style.overflow = bodyOverflowBeforeEditor;
    elements.coverFile.value = "";
    pendingCover = "";
    elements.coverSave.disabled = true;
    setCoverStatus("", false);
    activeEditor = null;
    openingControl = null;
    if (focusTarget && focusTarget.isConnected) {
      window.requestAnimationFrame(function () {
        focusTarget.focus({ preventScroll: true });
      });
    }
  }

  function openBioEditor(event) {
    event.stopPropagation();
    elements.bioInput.value = profileStore.getBio(PERSON_ID);
    openEditor(elements.bioEditor, elements.bioButton);
    window.setTimeout(function () {
      elements.bioInput.focus({ preventScroll: true });
      elements.bioInput.setSelectionRange(elements.bioInput.value.length, elements.bioInput.value.length);
    }, 40);
  }

  function openCoverEditor(event) {
    event.stopPropagation();
    imageProcessToken += 1;
    pendingCover = "";
    elements.coverFile.value = "";
    const currentCover = profileStore.getCustomCover(PERSON_ID);
    renderCoverPreview(currentCover);
    elements.coverSave.disabled = true;
    elements.coverReset.disabled = !currentCover;
    setCoverStatus("选择图片后会先显示预览，不会立即覆盖。", false);
    openEditor(elements.coverEditor, elements.coverAction);
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("无法读取这张图片。")); };
      image.src = url;
    });
  }

  async function compressCover(file) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("请选择有效的图片文件。");
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(objectUrl);
      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;
      if (!sourceWidth || !sourceHeight) throw new Error("图片尺寸无效。");

      let cropWidth = sourceWidth;
      let cropHeight = cropWidth / COVER_ASPECT_RATIO;
      if (cropHeight > sourceHeight) {
        cropHeight = sourceHeight;
        cropWidth = cropHeight * COVER_ASPECT_RATIO;
      }
      const sourceX = Math.max(0, (sourceWidth - cropWidth) / 2);
      const sourceY = Math.max(0, (sourceHeight - cropHeight) / 2);
      const outputWidth = Math.max(1, Math.min(COVER_WIDTH, Math.floor(cropWidth)));
      const outputHeight = Math.max(1, Math.round(outputWidth / COVER_ASPECT_RATIO));
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("当前浏览器无法处理图片。");
      context.fillStyle = "#c7c8c5";
      context.fillRect(0, 0, outputWidth, outputHeight);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );
      return {
        dataUrl: canvas.toDataURL("image/jpeg", COVER_JPEG_QUALITY),
        width: outputWidth,
        height: outputHeight
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  elements.bioButton.addEventListener("click", openBioEditor);
  elements.bioForm.addEventListener("submit", function (event) {
    event.preventDefault();
    try {
      profileStore.setBio(PERSON_ID, elements.bioInput.value);
      renderBio();
      closeProfileEditor();
    } catch (error) {
      window.alert("个人简介保存失败，浏览器本地空间可能不足。");
    }
  });

  elements.coverAction.addEventListener("click", openCoverEditor);
  elements.avatarButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = "chat-settings.html?person=luzhen&avatar=keshi#userAvatarSetting";
  });

  elements.coverFile.addEventListener("change", async function () {
    const file = elements.coverFile.files && elements.coverFile.files[0];
    if (!file || activeEditor !== elements.coverEditor) return;
    const processToken = ++imageProcessToken;
    elements.coverSave.disabled = true;
    setCoverStatus("正在裁切和压缩…", false);
    try {
      const result = await compressCover(file);
      if (processToken !== imageProcessToken || activeEditor !== elements.coverEditor) return;
      pendingCover = result.dataUrl;
      renderCoverPreview(pendingCover);
      elements.coverSave.disabled = false;
      const approximateKilobytes = Math.round((pendingCover.length * 0.75) / 1024);
      setCoverStatus(
        result.width + " × " + result.height + " · JPEG · 约 " + approximateKilobytes + " KB",
        false
      );
    } catch (error) {
      if (processToken !== imageProcessToken || activeEditor !== elements.coverEditor) return;
      pendingCover = "";
      elements.coverFile.value = "";
      elements.coverSave.disabled = true;
      renderCoverPreview(profileStore.getCustomCover(PERSON_ID));
      setCoverStatus(error.message || "图片处理失败，请换一张重试。", true);
    }
  });

  elements.coverSave.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (!pendingCover) {
      setCoverStatus("请先选择一张有效图片。", true);
      return;
    }
    const coverToSave = pendingCover;
    elements.coverSave.disabled = true;
    try {
      profileStore.setCustomCover(PERSON_ID, coverToSave);
      if (profileStore.getCustomCover(PERSON_ID) !== coverToSave) {
        throw new Error("Cover persistence verification failed.");
      }
      renderCover();
      closeProfileEditor();
    } catch (error) {
      elements.coverSave.disabled = false;
      setCoverStatus("保存失败，浏览器本地空间可能不足。原背景没有被覆盖。", true);
    }
  });

  elements.coverReset.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (!profileStore.hasCustomCover(PERSON_ID)) return;
    if (!window.confirm("确定恢复默认背景吗？")) return;
    try {
      profileStore.clearCustomCover(PERSON_ID);
      renderCover();
      closeProfileEditor();
    } catch (error) {
      setCoverStatus("恢复失败，请稍后重试。", true);
    }
  });

  elements.coverCancel.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeProfileEditor();
  });

  document.querySelectorAll("[data-profile-editor-close]").forEach(function (control) {
    control.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      closeProfileEditor();
    });
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && activeEditor) closeProfileEditor();
  });

  window.addEventListener("pagehide", function () {
    if (activeEditor) closeProfileEditor();
  });

  window.addEventListener("liminal:profilechange", function (event) {
    if (event.detail && event.detail.personId === PERSON_ID) {
      renderBio();
      renderCover();
    }
  });

  renderBio();
  renderCover();

  window.LiminalMessagesProfile = Object.freeze({
    renderBio: renderBio,
    renderCover: renderCover,
    closeEditor: closeProfileEditor
  });
})();
