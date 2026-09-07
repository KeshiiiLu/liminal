(function () {
  "use strict";

  if (window.LiminalInteraction) {
    return;
  }

  const PRESS_HOLD_MS = 90;
  const NAVIGATION_LOCK_MS = 850;
  const ACTION_LOCK_MS = 800;
  const LOADING_DELAY_MS = 190;

  const CONTROL_SELECTOR = [
    "button",
    "a[href]",
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    'input[type="checkbox"]',
    'input[type="radio"]',
    "select",
    "summary",
    "label[for]",
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="menuitem"]',
    "[data-liminal-interactive]",
    "[data-liminal-nav]",
    "[data-liminal-action-lock]",
    "[data-liminal-isolate]",
    "[onclick]"
  ].join(",");

  const NATIVE_KEYBOARD_CONTROL_SELECTOR = [
    "button",
    "a[href]",
    "input",
    "select",
    "summary"
  ].join(",");

  const ACTION_WORDS_ZH = /(?:保存|新增|添加|创建|删除|发送|转账|购买|买入|结算|确认|提交|恢复|导入|导出|支付|下单|抽牌|重新抽取|完成|领取|兑换|设为默认)/;
  const ACTION_WORDS_EN = /\b(?:save|add|create|delete|remove|send|transfer|buy|purchase|checkout|confirm|submit|restore|import|export|pay|place order)\b/i;

  const pointerPresses = new Map();
  const keyboardPresses = new Map();
  const navigationLocks = new WeakMap();
  const actionLocks = new WeakMap();
  const formLocks = new WeakMap();
  const activeControls = new Set();
  const navigationControls = new Set();
  const pendingControls = new Set();
  const busyAttributes = new WeakMap();

  let navigationTimer = 0;
  let navigationFeedback = null;

  function isElement(value) {
    return value instanceof Element;
  }

  function isUsable(control) {
    if (!isElement(control)) {
      return false;
    }

    if (control.closest("[inert]")) {
      return false;
    }

    if (control.matches(":disabled, [aria-disabled=\"true\"]")) {
      return false;
    }

    return true;
  }

  function eventElements(event) {
    if (typeof event.composedPath === "function") {
      return event.composedPath().filter(isElement);
    }

    const elements = [];
    let current = event.target;

    while (isElement(current)) {
      elements.push(current);
      current = current.parentElement;
    }

    return elements;
  }

  function findControl(event) {
    const path = eventElements(event);

    for (const element of path) {
      if (element.matches(CONTROL_SELECTOR) || typeof element.onclick === "function") {
        return isUsable(element) ? element : null;
      }
    }

    let pointerControl = null;

    for (const element of path) {
      if (element === document.body || element === document.documentElement) {
        break;
      }

      if (window.getComputedStyle(element).cursor === "pointer") {
        pointerControl = element;
        continue;
      }

      if (pointerControl) {
        break;
      }
    }

    return isUsable(pointerControl) ? pointerControl : null;
  }

  function markInteractive(control) {
    if (!control) {
      return null;
    }

    control.classList.add("liminal-interactive");
    return control;
  }

  function setPressed(control) {
    markInteractive(control);
    activeControls.add(control);
    control.classList.add("is-pressed");
  }

  function releasePressed(control, pressedAt, immediate) {
    if (!control) {
      return;
    }

    const elapsed = performance.now() - pressedAt;
    const delay = immediate ? 0 : Math.max(0, PRESS_HOLD_MS - elapsed);

    window.setTimeout(function () {
      control.classList.remove("is-pressed");
      activeControls.delete(control);
    }, delay);
  }

  function releasePointer(pointerId, immediate) {
    const press = pointerPresses.get(pointerId);

    if (!press) {
      return;
    }

    pointerPresses.delete(pointerId);
    releasePressed(press.control, press.startedAt, immediate);
  }

  function handlePointerDown(event) {
    if (typeof event.button === "number" && event.button !== 0) {
      return;
    }

    const control = findControl(event);

    if (!control) {
      return;
    }

    const pointerId = typeof event.pointerId === "number" ? event.pointerId : "primary";
    releasePointer(pointerId, true);
    setPressed(control);
    pointerPresses.set(pointerId, {
      control: control,
      startedAt: performance.now()
    });
  }

  function handlePointerRelease(event, immediate) {
    const pointerId = typeof event.pointerId === "number" ? event.pointerId : "primary";
    releasePointer(pointerId, immediate);
  }

  function isActivationKey(event) {
    return event.key === "Enter" || event.key === " " || event.key === "Spacebar";
  }

  function handleKeyDown(event) {
    if (!isActivationKey(event) || event.repeat) {
      return;
    }

    const control = findControl(event);

    if (!control) {
      return;
    }

    if (
      event.key !== "Enter" &&
      !control.matches(NATIVE_KEYBOARD_CONTROL_SELECTOR) &&
      control.matches('[role="button"], [role="tab"], [role="menuitem"]')
    ) {
      event.preventDefault();
    }

    setPressed(control);
    keyboardPresses.set(event.key, {
      control: control,
      startedAt: performance.now()
    });
  }

  function handleKeyUp(event) {
    if (!isActivationKey(event)) {
      return;
    }

    const press = keyboardPresses.get(event.key);

    if (!press) {
      return;
    }

    keyboardPresses.delete(event.key);
    releasePressed(press.control, press.startedAt, false);

    if (
      !press.control.matches(NATIVE_KEYBOARD_CONTROL_SELECTOR) &&
      press.control.matches('[role="button"], [role="tab"], [role="menuitem"]')
    ) {
      press.control.click();
    }
  }

  function isPlainPrimaryClick(event) {
    return (
      (typeof event.button !== "number" || event.button === 0) &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    );
  }

  function isNavigationControl(control) {
    if (!control) {
      return false;
    }

    if (control.matches("a[href]")) {
      const rawHref = control.getAttribute("href") || "";

      if (
        control.hasAttribute("download") ||
        rawHref === "" ||
        rawHref.startsWith("#") ||
        /^(?:javascript:|mailto:|tel:)/i.test(rawHref)
      ) {
        return false;
      }

      return true;
    }

    if (control.hasAttribute("data-liminal-nav")) {
      return true;
    }

    const inlineHandler = control.getAttribute("onclick") || "";
    return /(?:window\.)?location(?:\.href)?\s*=|history\.(?:back|go)\s*\(/.test(inlineHandler);
  }

  function shouldShowNavigationLoading(control) {
    if (!control.matches("a[href]")) {
      return true;
    }

    const target = (control.getAttribute("target") || "_self").toLowerCase();
    return target === "_self";
  }

  function ensureNavigationFeedback() {
    if (navigationFeedback && navigationFeedback.isConnected) {
      return navigationFeedback;
    }

    const feedback = document.createElement("div");
    feedback.className = "liminal-navigation-feedback";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    feedback.setAttribute("aria-atomic", "true");
    feedback.setAttribute("aria-hidden", "true");
    feedback.innerHTML = [
      '<span class="liminal-navigation-feedback__label">opening</span>',
      '<span class="liminal-navigation-feedback__dots" aria-hidden="true">',
      '<span class="liminal-navigation-feedback__dot"></span>',
      '<span class="liminal-navigation-feedback__dot"></span>',
      '<span class="liminal-navigation-feedback__dot"></span>',
      "</span>"
    ].join("");

    document.body.appendChild(feedback);
    navigationFeedback = feedback;
    return feedback;
  }

  function hideNavigationFeedback() {
    window.clearTimeout(navigationTimer);
    navigationTimer = 0;

    if (!navigationFeedback) {
      return;
    }

    navigationFeedback.classList.remove("is-visible");
    navigationFeedback.setAttribute("aria-hidden", "true");
  }

  function setBusy(control) {
    if (!control || busyAttributes.has(control)) {
      return;
    }

    busyAttributes.set(control, {
      existed: control.hasAttribute("aria-busy"),
      value: control.getAttribute("aria-busy")
    });
    control.setAttribute("aria-busy", "true");
  }

  function restoreBusy(control) {
    if (!control || !busyAttributes.has(control)) {
      return;
    }

    const previous = busyAttributes.get(control);
    busyAttributes.delete(control);

    if (previous.existed) {
      control.setAttribute("aria-busy", previous.value || "");
    } else {
      control.removeAttribute("aria-busy");
    }
  }

  function showNavigationFeedbackAfterDelay() {
    window.clearTimeout(navigationTimer);
    navigationTimer = window.setTimeout(function () {
      if (document.visibilityState === "hidden") {
        return;
      }

      const feedback = ensureNavigationFeedback();
      feedback.classList.add("is-visible");
      feedback.setAttribute("aria-hidden", "false");
    }, LOADING_DELAY_MS);
  }

  function clearNavigationControl(control) {
    if (!control) {
      return;
    }

    control.classList.remove("is-navigating");
    restoreBusy(control);
    navigationControls.delete(control);
  }

  function beginNavigation(control, options) {
    const settings = options || {};
    markInteractive(control);
    navigationControls.add(control);
    control.classList.add("is-navigating");
    setBusy(control);

    if (settings.showLoading !== false) {
      showNavigationFeedbackAfterDelay();
    }

    window.setTimeout(function () {
      clearNavigationControl(control);
      hideNavigationFeedback();
    }, NAVIGATION_LOCK_MS + 350);
  }

  function pulseExistingPress(control) {
    setPressed(control);
    releasePressed(control, performance.now(), false);
  }

  function handleNavigationClick(event, control) {
    if (!isPlainPrimaryClick(event)) {
      return false;
    }

    const now = performance.now();
    const lockedUntil = navigationLocks.get(control) || 0;

    if (lockedUntil > now) {
      event.preventDefault();
      event.stopImmediatePropagation();
      pulseExistingPress(control);
      return true;
    }

    navigationLocks.set(control, now + NAVIGATION_LOCK_MS);
    beginNavigation(control, {
      showLoading: shouldShowNavigationLoading(control)
    });

    window.setTimeout(function () {
      if (event.defaultPrevented) {
        navigationLocks.delete(control);
        clearNavigationControl(control);
        hideNavigationFeedback();
      }
    }, 0);

    window.setTimeout(function () {
      navigationLocks.delete(control);
    }, NAVIGATION_LOCK_MS);

    return false;
  }

  function actionLabel(control) {
    return [
      control.textContent || "",
      control.getAttribute("aria-label") || "",
      control.id || "",
      typeof control.className === "string" ? control.className : ""
    ].join(" ").replace(/\s+/g, " ").trim();
  }

  function isMutationControl(control) {
    if (!control || control.hasAttribute("data-liminal-allow-repeat")) {
      return false;
    }

    if (control.hasAttribute("data-liminal-action-lock")) {
      return true;
    }

    if (control.matches('button[type="submit"], input[type="submit"]')) {
      return true;
    }

    const label = actionLabel(control);
    return ACTION_WORDS_ZH.test(label) || ACTION_WORDS_EN.test(label);
  }

  function clearActionControl(control) {
    if (!control) {
      return;
    }

    control.classList.remove("is-action-pending");
    restoreBusy(control);
    pendingControls.delete(control);
    actionLocks.delete(control);
  }

  function handleMutationClick(event, control) {
    if (!isPlainPrimaryClick(event) || !isMutationControl(control)) {
      return false;
    }

    const now = performance.now();
    const lockedUntil = actionLocks.get(control) || 0;

    if (lockedUntil > now) {
      event.preventDefault();
      event.stopImmediatePropagation();
      pulseExistingPress(control);
      return true;
    }

    actionLocks.set(control, now + ACTION_LOCK_MS);
    pendingControls.add(control);
    control.classList.add("is-action-pending");
    setBusy(control);

    window.setTimeout(function () {
      clearActionControl(control);
    }, ACTION_LOCK_MS);

    return false;
  }

  function isolateNestedControl(event, control) {
    if (!control || !control.hasAttribute("data-liminal-isolate")) {
      return;
    }

    const path = eventElements(event);
    const controlIndex = path.indexOf(control);
    const parentControl = path.slice(controlIndex + 1).find(function (element) {
      return element.matches(CONTROL_SELECTOR) || typeof element.onclick === "function";
    });

    if (!parentControl) {
      return;
    }

    if (parentControl.matches("a[href]")) {
      event.preventDefault();
    }

    control.addEventListener("click", function stopParentActivation(innerEvent) {
      innerEvent.stopPropagation();
    }, { once: true });
  }

  function handleClick(event) {
    const control = findControl(event);

    if (!control) {
      return;
    }

    markInteractive(control);
    isolateNestedControl(event, control);

    if (isNavigationControl(control)) {
      handleNavigationClick(event, control);
      return;
    }

    handleMutationClick(event, control);
  }

  function handleSubmit(event) {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const now = performance.now();
    const lockedUntil = formLocks.get(form) || 0;
    const submitter = event.submitter || form.querySelector('button[type="submit"], input[type="submit"]');

    if (lockedUntil > now) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (submitter) {
        pulseExistingPress(submitter);
      }

      return;
    }

    formLocks.set(form, now + ACTION_LOCK_MS);

    window.setTimeout(function () {
      formLocks.delete(form);
      clearActionControl(submitter);
    }, ACTION_LOCK_MS);
  }

  function clearTransientState() {
    pointerPresses.forEach(function (press) {
      releasePressed(press.control, press.startedAt, true);
    });
    pointerPresses.clear();

    keyboardPresses.forEach(function (press) {
      releasePressed(press.control, press.startedAt, true);
    });
    keyboardPresses.clear();

    activeControls.forEach(function (control) {
      control.classList.remove("is-pressed");
    });
    activeControls.clear();

    navigationControls.forEach(clearNavigationControl);
    pendingControls.forEach(clearActionControl);
    hideNavigationFeedback();
  }

  function decorateKnownControls(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(CONTROL_SELECTOR).forEach(function (control) {
      if (isUsable(control)) {
        markInteractive(control);
      }
    });
  }

  document.addEventListener("pointerdown", handlePointerDown, {
    capture: true,
    passive: true
  });
  document.addEventListener("pointerup", function (event) {
    handlePointerRelease(event, false);
  }, true);
  document.addEventListener("pointercancel", function (event) {
    handlePointerRelease(event, true);
  }, true);
  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("keyup", handleKeyUp, true);
  document.addEventListener("click", handleClick, true);
  document.addEventListener("submit", handleSubmit, true);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      clearTransientState();
    }
  });

  window.addEventListener("blur", clearTransientState);
  window.addEventListener("pagehide", clearTransientState);
  window.addEventListener("pageshow", clearTransientState);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      decorateKnownControls(document);
    }, { once: true });
  } else {
    decorateKnownControls(document);
  }

  window.LiminalInteraction = Object.freeze({
    decorate: decorateKnownControls,
    beginNavigation: function (control) {
      if (isUsable(control)) {
        beginNavigation(control, { showLoading: true });
      }
    },
    releaseAction: clearActionControl
  });
})();
