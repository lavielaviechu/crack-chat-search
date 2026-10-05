// ==UserScript==
// @name         크랙 채팅방 내부 검색
// @namespace    https://github.com/mynameislovesong
// @version      1.4.3
// @description  과거 로그 범위 불러오기와 본문 검색을 제공하며, 검색 버튼은 전송 버튼 옆의 빈자리에 자동 배치됩니다.
// @match        https://crack.wrtn.ai/stories/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

GM_addStyle(String.raw`#crack-story-search-loader-root {
  position: fixed;
  top: 72px;
  right: 20px;
  z-index: 2147483647;
  width: min(590px, calc(100vw - 40px));
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.97);
  color: #111;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
  font-family:
    Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

#crack-story-search-loader-root[hidden] {
  display: none !important;
}

.crack-story-search-row,
.crack-story-search-action-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.crack-story-search-action-row {
  margin-top: 8px;
}

.crack-story-search-input,
.crack-story-search-select,
.crack-story-search-custom-turn {
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 10px;
  outline: none;
  background: #fff;
  color: inherit;
  font: inherit;
}

.crack-story-search-input {
  min-width: 0;
  flex: 1;
  height: 38px;
  padding: 0 12px;
}

.crack-story-search-select {
  min-width: 0;
  flex: 1;
  height: 34px;
  padding: 0 10px;
  cursor: pointer;
}

.crack-story-search-custom-turn {
  flex: 0 0 88px;
  width: 88px;
  height: 34px;
  padding: 0 9px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.crack-story-search-custom-turn[hidden] {
  display: none !important;
}

.crack-story-search-start-option {
  box-sizing: border-box;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 5px;
  border-radius: 9px;
  color: #555;
  font-size: 12px;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
}

.crack-story-search-start-option:hover {
  background: rgba(255, 91, 74, 0.08);
}

.crack-story-search-start-checkbox {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: #ff5b4a;
  cursor: pointer;
}

.crack-story-search-input:focus,
.crack-story-search-select:focus,
.crack-story-search-custom-turn:focus {
  border-color: #ff5b4a;
  box-shadow: 0 0 0 3px rgba(255, 91, 74, 0.12);
}

.crack-story-search-select:disabled {
  cursor: default;
  opacity: 0.55;
}

.crack-story-search-count {
  min-width: 52px;
  color: #777;
  text-align: center;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.crack-story-search-button {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  background: rgba(255, 91, 74, 0.12);
  color: #b5362b;
  font: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.crack-story-search-button:hover:not(:disabled) {
  background: rgba(255, 91, 74, 0.20);
}

.crack-story-search-button:disabled {
  cursor: default;
  opacity: 0.45;
}

.crack-story-search-load {
  min-width: 88px;
  font-weight: 700;
}

.crack-story-search-status {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

::highlight(crack-story-search-loader-all) {
  background-color: #ffe066;
  color: #111;
}

::highlight(crack-story-search-loader-current) {
  background-color: #ff922b;
  color: #111;
  text-decoration: underline 2px #111;
}

#crack-story-search-launcher {
  position: relative;
  z-index: auto;
  display: inline-grid;
  place-items: center;
  flex: 0 0 28px;
  align-self: center;
  width: 28px;
  height: 28px;
  margin: 0 8px 0 auto;
  padding: 0;
  border-radius: 50%;
  box-shadow: none;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease,
    color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
}

#crack-story-search-launcher svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

#crack-story-search-launcher.crack-story-search-launcher-fallback {
  position: fixed;
  z-index: 2147483647;
  left: auto !important;
  top: auto !important;
  right: 20px;
  bottom: 24px;
  width: 40px;
  height: 40px;
}

#crack-story-search-launcher:hover {
  transform: translateY(-1px);
  box-shadow: none;
}

#crack-story-search-launcher:focus-visible {
  outline: 2px solid #8ab4f8;
  outline-offset: 2px;
}

#crack-story-search-launcher[hidden] {
  display: none !important;
}
`);

(() => {
  if (window.__crackStorySearchLoaderInstalled) return;
  window.__crackStorySearchLoaderInstalled = true;

  const ROOT_ID = "crack-story-search-loader-root";
  const ALL_HIGHLIGHT = "crack-story-search-loader-all";
  const CURRENT_HIGHLIGHT = "crack-story-search-loader-current";
  const START_FROM_FIRST_KEY = "crack-story-search-start-from-first";

  let root;
  let input;
  let countLabel;
  let statusLabel;
  let rangeSelect;
  let customTurnInput;
  let startFromFirstCheckbox;
  let loadButton;
  let stopButton;
  let launcherButton;
  let launcherObserver = null;
  let launcherPlacementFrame = null;

  let matches = [];
  let currentIndex = -1;
  let activeJob = 0;
  let lastQuery = "";
  let loadingHistory = false;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function readStartFromFirstPreference() {
    try {
      return localStorage.getItem(START_FROM_FIRST_KEY) === "true";
    } catch {
      return false;
    }
  }

  function saveStartFromFirstPreference(value) {
    try {
      localStorage.setItem(START_FROM_FIRST_KEY, String(value));
    } catch {
      // 사이트 저장소를 사용할 수 없어도 검색 기능은 계속 작동함
    }
  }

  function isEpisodePage() {
    return /\/stories\/[^/]+\/episodes\/[^/]+/.test(location.pathname);
  }

  function supportsHighlight() {
    return "highlights" in CSS && typeof Highlight !== "undefined";
  }

  function normalize(text) {
    return (text || "").toLocaleLowerCase("ko-KR");
  }

  function getMessageGroups() {
    return [...document.querySelectorAll("div[data-message-group-id]")];
  }

  function getMessageBlocks() {
    return [...document.querySelectorAll(
      "div[data-message-group-id] .wrtn-markdown"
    )];
  }

  function getGroupsByVisualPosition() {
    return getMessageGroups().sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      const yA = rectA.top + window.scrollY;
      const yB = rectB.top + window.scrollY;
      return yA - yB;
    });
  }

  function extractTurnNumber(group) {
    const text = (group.innerText || group.textContent || "").trim();
    if (!text) return null;

    const lines = text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 8);

    for (const line of lines) {
      const exact = line.match(/^\[?\s*T\s*(\d+)\s*(?:\]|$|[|〡·/])/i);
      if (exact) return Number(exact[1]);

      const standalone = line.match(/^T\s*(\d+)\s*$/i);
      if (standalone) return Number(standalone[1]);
    }

    return null;
  }

  function getTurnEntries() {
    return getMessageGroups()
      .map((group) => ({ group, turn: extractTurnNumber(group) }))
      .filter((entry) => Number.isFinite(entry.turn));
  }

  function getTurnBounds() {
    const entries = getTurnEntries();
    if (!entries.length) return null;

    const turns = entries.map((entry) => entry.turn);

    return {
      newest: Math.max(...turns),
      oldest: Math.min(...turns),
      entries
    };
  }

  function setStatus(text) {
    if (statusLabel) statusLabel.textContent = text;
  }

  function updateCounter() {
    if (!countLabel) return;

    countLabel.textContent = matches.length
      ? `${currentIndex + 1} / ${matches.length}`
      : "0 / 0";
  }

  function clearHighlights() {
    if (supportsHighlight()) {
      CSS.highlights.delete(ALL_HIGHLIGHT);
      CSS.highlights.delete(CURRENT_HIGHLIGHT);
    }

    matches = [];
    currentIndex = -1;
    updateCounter();
  }

  function collectTextNodes(element) {
    const nodes = [];

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    return nodes;
  }

  function scanLoadedMessages(query) {
    clearHighlights();

    const trimmed = query.trim();
    if (!trimmed) return 0;

    const needle = normalize(trimmed);
    const found = [];

    for (const block of getMessageBlocks()) {
      for (const node of collectTextNodes(block)) {
        const haystack = normalize(node.nodeValue);
        let start = 0;

        while (start < haystack.length) {
          const index = haystack.indexOf(needle, start);
          if (index < 0) break;

          const range = new Range();

          range.setStart(node, index);
          range.setEnd(node, index + trimmed.length);

          found.push(range);

          start = index + Math.max(trimmed.length, 1);
        }
      }
    }

    matches = found.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();

      const yA = rectA.top + window.scrollY;
      const yB = rectB.top + window.scrollY;

      if (Math.abs(yA - yB) > 1) {
        return yA - yB;
      }

      return rectA.left - rectB.left;
    });

    if (matches.length) {
      if (supportsHighlight()) {
        CSS.highlights.set(
          ALL_HIGHLIGHT,
          new Highlight(...matches)
        );
      }

      currentIndex = startFromFirstCheckbox?.checked
        ? 0
        : matches.length - 1;

      focusCurrent(false);
    }

    updateCounter();
    return matches.length;
  }

  function focusCurrent(shouldScroll = true) {
    if (!matches.length || currentIndex < 0) return;

    const range = matches[currentIndex];

    if (supportsHighlight()) {
      CSS.highlights.set(
        CURRENT_HIGHLIGHT,
        new Highlight(range)
      );
    }

    if (shouldScroll) {
      const target = range.startContainer.parentElement;

      target?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    updateCounter();
  }

  function goDown() {
    if (!matches.length) return;

    currentIndex = (currentIndex + 1) % matches.length;
    focusCurrent();
  }

  function goUp() {
    if (!matches.length) return;

    currentIndex =
      (currentIndex - 1 + matches.length) % matches.length;

    focusCurrent();
  }

  function findScrollContainer() {
    const sample =
      document.querySelector("div[data-message-group-id]") ||
      document.querySelector(".wrtn-markdown");

    let element = sample?.parentElement;

    while (element && element !== document.body) {
      const style = getComputedStyle(element);

      const canScroll =
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        style.overflow === "auto" ||
        style.overflow === "scroll";

      if (
        canScroll &&
        element.scrollHeight > element.clientHeight + 30
      ) {
        return element;
      }

      element = element.parentElement;
    }

    return document.scrollingElement || document.documentElement;
  }

  function isPageScroller(container) {
    return (
      container === document.scrollingElement ||
      container === document.documentElement ||
      container === document.body
    );
  }

  function getScrollTop(container) {
    if (isPageScroller(container)) {
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    }

    return container.scrollTop;
  }

  function setScrollTop(container, value) {
    if (isPageScroller(container)) {
      window.scrollTo({
        top: value,
        behavior: "auto"
      });
    } else {
      container.scrollTop = value;
    }
  }

  function getScrollHeight(container) {
    if (isPageScroller(container)) {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    }

    return container.scrollHeight;
  }

  function scrollElementIntoView(element) {
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function scrollToOldestLoaded() {
    const groups = getGroupsByVisualPosition();
    scrollElementIntoView(groups[0]);
  }

  function scrollToTurn(targetTurn) {
    const entries = getTurnEntries();

    if (!entries.length) {
      scrollToOldestLoaded();
      return null;
    }

    let best = entries[0];

    for (const entry of entries) {
      if (
        Math.abs(entry.turn - targetTurn) <
        Math.abs(best.turn - targetTurn)
      ) {
        best = entry;
      }
    }

    scrollElementIntoView(best.group);
    return best.turn;
  }

  function formatLoadStatus({
    mode,
    distance,
    currentCount,
    newestTurn,
    oldestTurn
  }) {
    if (mode === "full") {
      return `전체 로그 불러오는 중… 현재 ${currentCount}개`;
    }

    if (
      Number.isFinite(newestTurn) &&
      Number.isFinite(oldestTurn)
    ) {
      const loadedDistance = Math.max(
        0,
        newestTurn - oldestTurn
      );

      return (
        `${distance}T 이전까지 불러오는 중… ` +
        `${Math.min(loadedDistance, distance)} / ${distance}T`
      );
    }

    const loadedDistance = Math.max(
      0,
      currentCount - 1
    );

    return (
      `${distance}T 이전까지 불러오는 중… ` +
      `${Math.min(loadedDistance, distance)} / ${distance}T`
    );
  }

  async function loadHistory(mode, distance = null) {
    if (loadingHistory) return;

    const job = ++activeJob;

    loadingHistory = true;
    loadButton.disabled = true;
    rangeSelect.disabled = true;
    stopButton.disabled = false;

    const container = findScrollContainer();
    const initialBounds = getTurnBounds();
    const newestTurn = initialBounds?.newest ?? null;

    const targetTurn =
      mode === "range" && Number.isFinite(newestTurn)
        ? Math.max(1, newestTurn - distance)
        : null;

    const targetGroupCount =
      mode === "range"
        ? distance + 1
        : null;

    let stableRounds = 0;
    let rounds = 0;
    let previousCount = getMessageGroups().length;
    let previousHeight = getScrollHeight(container);
    let completed = false;

    setStatus(
      formatLoadStatus({
        mode,
        distance,
        currentCount: previousCount,
        newestTurn,
        oldestTurn: initialBounds?.oldest ?? null
      })
    );

    while (job === activeJob && rounds < 500) {
      const boundsBefore = getTurnBounds();
      const countBefore = getMessageGroups().length;

      if (mode === "range") {
        const reachedByTurn =
          Number.isFinite(targetTurn) &&
          Number.isFinite(boundsBefore?.oldest) &&
          boundsBefore.oldest <= targetTurn;

        const reachedByCount =
          !Number.isFinite(targetTurn) &&
          countBefore >= targetGroupCount;

        if (reachedByTurn || reachedByCount) {
          completed = true;
          break;
        }
      }

      rounds += 1;

      setScrollTop(container, 0);
      await sleep(850);

      const currentCount = getMessageGroups().length;
      const currentHeight = getScrollHeight(container);
      const currentTop = getScrollTop(container);
      const currentBounds = getTurnBounds();

      setStatus(
        formatLoadStatus({
          mode,
          distance,
          currentCount,
          newestTurn,
          oldestTurn: currentBounds?.oldest ?? null
        })
      );

      if (mode === "range") {
        const reachedByTurn =
          Number.isFinite(targetTurn) &&
          Number.isFinite(currentBounds?.oldest) &&
          currentBounds.oldest <= targetTurn;

        const reachedByCount =
          !Number.isFinite(targetTurn) &&
          currentCount >= targetGroupCount;

        if (reachedByTurn || reachedByCount) {
          completed = true;
          break;
        }
      }

      const nothingChanged =
        currentCount === previousCount &&
        currentHeight === previousHeight &&
        currentTop <= 2;

      if (nothingChanged) {
        stableRounds += 1;
      } else {
        stableRounds = 0;
      }

      previousCount = currentCount;
      previousHeight = currentHeight;

      if (stableRounds >= 4) {
        completed = true;
        break;
      }
    }

    if (job !== activeJob) {
      setStatus(
        `불러오기 중지 · 현재 ${getMessageGroups().length}개`
      );
    } else if (rounds >= 500 && !completed) {
      setStatus(
        `안전을 위해 중단 · 현재 ${getMessageGroups().length}개`
      );
    } else if (mode === "full") {
      const count = getMessageGroups().length;

      setStatus(
        `전체 불러오기 완료 · 메시지 묶음 ${count}개 · ` +
        `처음 위치로 이동했어요`
      );

      scrollToOldestLoaded();
    } else {
      let movedTurn = null;

      if (Number.isFinite(targetTurn)) {
        movedTurn = scrollToTurn(targetTurn);
      } else {
        scrollToOldestLoaded();
      }

      if (Number.isFinite(movedTurn)) {
        setStatus(
          `${distance}T 이전까지 불러오기 완료 · ` +
          `T${movedTurn}부터 읽으면 돼요`
        );
      } else {
        setStatus(
          `${distance}T 이전까지 불러오기 완료 · ` +
          `해당 위치로 이동했어요`
        );
      }
    }

    loadingHistory = false;
    loadButton.disabled = false;
    rangeSelect.disabled = false;
    stopButton.disabled = true;
  }

  function stopCurrentJob() {
    const wasLoading = loadingHistory;

    activeJob += 1;
    loadingHistory = false;

    if (loadButton) {
      loadButton.disabled = false;
    }

    if (rangeSelect) {
      rangeSelect.disabled = false;
    }

    if (stopButton) {
      stopButton.disabled = true;
    }

    if (wasLoading) {
      setStatus(
        `작업 중지 · 현재 ${getMessageGroups().length}개`
      );
    }
  }

  function updateCustomTurnInput() {
    if (!rangeSelect || !customTurnInput) return;

    const isCustom = rangeSelect.value === "custom";
    customTurnInput.hidden = !isCustom;

    if (isCustom) {
      setStatus(
        "원하는 턴 수를 입력한 뒤 불러오기를 누르세요"
      );

      requestAnimationFrame(() => {
        customTurnInput.focus();
        customTurnInput.select();
      });
    }
  }

  function getSelectedLoadRequest() {
    const value = rangeSelect.value;

    if (value === "full") {
      return {
        mode: "full",
        distance: null
      };
    }

    if (value === "custom") {
      const distance = Number.parseInt(
        customTurnInput.value.trim(),
        10
      );

      if (!Number.isFinite(distance) || distance < 1) {
        setStatus("1 이상의 턴 수를 입력하세요");

        customTurnInput.focus();
        customTurnInput.select();

        return null;
      }

      return {
        mode: "range",
        distance
      };
    }

    return {
      mode: "range",
      distance: Number(value)
    };
  }

  function runSelectedLoad() {
    const request = getSelectedLoadRequest();
    if (!request) return;

    loadHistory(request.mode, request.distance);
  }

  function runSearch() {
    const query = input.value.trim();

    if (!query) {
      setStatus("검색어를 입력하세요");
      return;
    }

    lastQuery = query;
    const count = scanLoadedMessages(query);

    if (count > 0) {
      setStatus(
        `불러온 본문에서 ${count}개 찾았어요`
      );

      focusCurrent();
    } else {
      setStatus(
        "불러온 본문에는 검색 결과가 없어요"
      );
    }
  }

  function createButton(text, title, handler) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "crack-story-search-button";
    button.textContent = text;
    button.title = title;

    button.addEventListener("click", handler);

    return button;
  }

  function isVisibleElement(element) {
    if (!element || !element.isConnected) return false;

    const style = getComputedStyle(element);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0
    ) {
      return false;
    }

    const rect = element.getBoundingClientRect();

    return rect.width >= 8 && rect.height >= 8;
  }

  function getButtonLabel(button) {
    return [
      button.getAttribute("aria-label"),
      button.getAttribute("title"),
      button.getAttribute("data-testid"),
      button.getAttribute("data-name"),
      button.textContent
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLocaleLowerCase("ko-KR");
  }

  function findComposerEditable() {
    const candidates = [
      ...document.querySelectorAll(
        'textarea, [contenteditable="true"], [role="textbox"]'
      )
    ]
      .filter((element) => !root?.contains(element))
      .filter(isVisibleElement)
      .map((element) => ({
        element,
        rect: element.getBoundingClientRect()
      }))
      .filter(({ rect }) =>
        rect.top > window.innerHeight * 0.42
      )
      .sort((a, b) =>
        b.rect.bottom - a.rect.bottom
      );

    return candidates[0]?.element || null;
  }

  function findComposerContainer(editable) {
    if (!editable) return null;

    let element = editable.parentElement;

    for (
      let depth = 0;
      element && depth < 7;
      depth += 1
    ) {
      const rect = element.getBoundingClientRect();

      const buttonCount = element.querySelectorAll(
        'button, [role="button"], input[type="button"], input[type="submit"]'
      ).length;

      if (
        buttonCount > 0 &&
        rect.width >= 240 &&
        rect.bottom > window.innerHeight * 0.7
      ) {
        return element;
      }

      element = element.parentElement;
    }

    return null;
  }

  function findSendButton() {
    const editable = findComposerEditable();
    const container =
      findComposerContainer(editable) || document;

    const containerRect =
      container === document
        ? null
        : container.getBoundingClientRect();

    if (container !== document) {
      const actionRows = [
        ...container.querySelectorAll(
          ".flex.items-center.justify-between"
        )
      ].filter(isVisibleElement);

      for (const actionRow of actionRows) {
        const hasLeftToolbar = [
          ...actionRow.children
        ].some((child) =>
          child.matches(
            ".flex.items-center.space-x-2"
          )
        );

        if (!hasLeftToolbar) continue;

        const directButtons = [
          ...actionRow.children
        ]
          .filter((child) =>
            child !== launcherButton
          )
          .filter((child) =>
            child.matches("button")
          )
          .filter(isVisibleElement);

        const primaryButton =
          directButtons.find(
            (button) =>
              button.classList.contains(
                "bg-primary"
              ) &&
              button.classList.contains(
                "rounded-full"
              )
          );

        if (primaryButton) {
          return primaryButton;
        }

        if (directButtons.length) {
          return directButtons[
            directButtons.length - 1
          ];
        }
      }
    }

    const candidates = [
      ...container.querySelectorAll(
        'button, [role="button"], input[type="button"], input[type="submit"]'
      )
    ]
      .filter((button) =>
        button !== launcherButton
      )
      .filter((button) =>
        !root?.contains(button)
      )
      .filter(isVisibleElement)
      .map((button) => {
        const rect =
          button.getBoundingClientRect();

        const label = getButtonLabel(button);

        let score = 0;

        if (
          /전송|보내기|메시지\s*전송|send/.test(label)
        ) {
          score += 100;
        }

        if (
          button.matches(
            'button[type="submit"], input[type="submit"]'
          )
        ) {
          score += 35;
        }

        if (
          rect.bottom >
          window.innerHeight * 0.72
        ) {
          score += 15;
        }

        if (
          rect.left >
          window.innerWidth * 0.55
        ) {
          score += 10;
        }

        if (containerRect) {
          const distanceFromRight =
            containerRect.right - rect.right;

          const distanceFromBottom =
            containerRect.bottom - rect.bottom;

          if (
            distanceFromRight >= -8 &&
            distanceFromRight <= 96
          ) {
            score += 30;
          }

          if (
            distanceFromBottom >= -8 &&
            distanceFromBottom <= 96
          ) {
            score += 30;
          }
        }

        if (editable) {
          const editableRect =
            editable.getBoundingClientRect();

          const centerY =
            rect.top + rect.height / 2;

          const editableCenterY =
            editableRect.top +
            editableRect.height / 2;

          if (
            Math.abs(
              centerY - editableCenterY
            ) < 60
          ) {
            score += 20;
          }
        }

        return {
          button,
          rect,
          score
        };
      })
      .filter(({ rect }) =>
        rect.width <= 96 &&
        rect.height <= 96
      )
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return b.rect.right - a.rect.right;
      });

    return candidates[0]?.button || null;
  }

  function findLauncherSlot(sendButton) {
    const container = sendButton.parentElement;
    if (!container) return null;

    const siblings = [
      ...container.children
    ].filter((element) =>
      element !== launcherButton
    );

    const sendIndex = siblings.indexOf(
      sendButton
    );

    let anchor = sendButton;

    for (
      let index = sendIndex - 1;
      index >= 0;
      index -= 1
    ) {
      const element = siblings[index];
      const rect =
        element.getBoundingClientRect();

      const isButtonLike =
        element.matches(
          'button, [role="button"], input[type="button"], input[type="submit"]'
        ) ||
        Boolean(
          element.querySelector(
            'button, [role="button"], input[type="button"], input[type="submit"]'
          )
        );

      if (
        !isButtonLike ||
        !isVisibleElement(element) ||
        rect.width > 72 ||
        rect.height > 72
      ) {
        break;
      }

      anchor = element;
    }

    return {
      container,
      anchor
    };
  }

  function placeLauncherBesideSendButton() {
    if (
      !launcherButton ||
      launcherButton.hidden
    ) {
      return;
    }

    const sendButton = findSendButton();

    if (!sendButton) {
      if (
        launcherButton.parentElement !==
        document.documentElement
      ) {
        document.documentElement.appendChild(
          launcherButton
        );
      }

      launcherButton.classList.add(
        "crack-story-search-launcher-fallback"
      );

      return;
    }

    const slot =
      findLauncherSlot(sendButton);

    if (!slot) return;

    launcherButton.classList.remove(
      "crack-story-search-launcher-fallback"
    );

    const slotStyle =
      getComputedStyle(slot.container);

    const slotGap =
      Number.parseFloat(
        slotStyle.columnGap ||
        slotStyle.gap
      ) || 0;

    launcherButton.style.marginRight =
      slotGap > 0 ? "0px" : "8px";

    const alreadyInRow =
      launcherButton.parentElement ===
      slot.container;

    const alreadyBeforeSend =
      alreadyInRow &&
      Boolean(
        launcherButton.compareDocumentPosition(
          slot.anchor
        ) &
        Node.DOCUMENT_POSITION_FOLLOWING
      );

    if (
      !alreadyInRow ||
      !alreadyBeforeSend
    ) {
      slot.container.insertBefore(
        launcherButton,
        slot.anchor
      );
    }
  }

  function startLauncherTracking() {
    stopLauncherTracking();
    placeLauncherBesideSendButton();

    launcherObserver = new MutationObserver(
      (mutations) => {
        if (
          launcherButton?.isConnected &&
          !launcherButton.classList.contains(
            "crack-story-search-launcher-fallback"
          )
        ) {
          const rowChanged =
            mutations.some(
              (mutation) =>
                mutation.target ===
                launcherButton.parentElement
            );

          if (!rowChanged) return;
        }

        if (
          launcherPlacementFrame !== null
        ) {
          return;
        }

        launcherPlacementFrame =
          window.requestAnimationFrame(() => {
            launcherPlacementFrame = null;
            placeLauncherBesideSendButton();
          });
      }
    );

    launcherObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );
  }

  function stopLauncherTracking() {
    if (launcherObserver) {
      launcherObserver.disconnect();
      launcherObserver = null;
    }

    if (
      launcherPlacementFrame !== null
    ) {
      window.cancelAnimationFrame(
        launcherPlacementFrame
      );

      launcherPlacementFrame = null;
    }
  }

  function createLauncher() {
    if (
      launcherButton ||
      document.getElementById(
        "crack-story-search-launcher"
      )
    ) {
      return;
    }

    launcherButton =
      document.createElement("button");

    launcherButton.id =
      "crack-story-search-launcher";

    launcherButton.type = "button";

    launcherButton.className =
      "relative inline-flex items-center justify-center rounded-full " +
      "border border-border bg-card text-line-gray-1 hover:bg-secondary " +
      "p-0 size-7 transition-colors";

    launcherButton.setAttribute(
      "aria-label",
      "채팅방 검색창 열기"
    );

    launcherButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="10.75" cy="10.75" r="6.25"></circle>
        <path d="M15.4 15.4 20 20"></path>
      </svg>
    `;

    launcherButton.title =
      "채팅방 검색창 열기";

    launcherButton.hidden = true;

    launcherButton.addEventListener(
      "click",
      () => {
        if (root) {
          stopLauncherTracking();

          root.hidden = false;
          launcherButton.hidden = true;

          input.focus();
          input.select();
        }
      }
    );

    document.documentElement.appendChild(
      launcherButton
    );
  }

  function createUI() {
    if (
      !isEpisodePage() ||
      document.getElementById(ROOT_ID)
    ) {
      return;
    }

    root =
      document.createElement("section");

    root.id = ROOT_ID;

    const searchRow =
      document.createElement("div");

    searchRow.className =
      "crack-story-search-row";

    input =
      document.createElement("input");

    input.type = "search";
    input.placeholder =
      "현재 채팅방 본문 검색";

    input.autocomplete = "off";
    input.spellcheck = false;

    input.className =
      "crack-story-search-input";

    countLabel =
      document.createElement("span");

    countLabel.className =
      "crack-story-search-count";

    countLabel.textContent = "0 / 0";

    const findButton = createButton(
      "찾기",
      "불러온 메시지 검색",
      runSearch
    );

    const prevButton = createButton(
      "↑",
      "화면 위쪽 검색 결과",
      goUp
    );

    const nextButton = createButton(
      "↓",
      "화면 아래쪽 검색 결과",
      goDown
    );

    searchRow.append(
      input,
      countLabel,
      findButton
    );

    const actionRow =
      document.createElement("div");

    actionRow.className =
      "crack-story-search-action-row";

    rangeSelect =
      document.createElement("select");

    rangeSelect.className =
      "crack-story-search-select";

    rangeSelect.title =
      "불러올 로그 범위 선택";

    const loadOptions = [
      ["full", "전체"],
      ["100", "100T 이전"],
      ["200", "200T 이전"],
      ["custom", "직접 지정…"]
    ];

    for (
      const [value, label]
      of loadOptions
    ) {
      const option =
        document.createElement("option");

      option.value = value;
      option.textContent = label;

      rangeSelect.appendChild(option);
    }

    customTurnInput =
      document.createElement("input");

    customTurnInput.type = "number";
    customTurnInput.min = "1";
    customTurnInput.step = "1";
    customTurnInput.value = "300";

    customTurnInput.placeholder =
      "턴 수";

    customTurnInput.title =
      "불러올 과거 턴 수";

    customTurnInput.className =
      "crack-story-search-custom-turn";

    customTurnInput.hidden = true;

    rangeSelect.addEventListener(
      "change",
      updateCustomTurnInput
    );

    customTurnInput.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          runSelectedLoad();
        }
      }
    );

    const startFromFirstLabel =
      document.createElement("label");

    startFromFirstLabel.className =
      "crack-story-search-start-option";

    startFromFirstLabel.title =
      "체크하면 검색 시 가장 오래된 첫 결과부터 보여줍니다";

    startFromFirstCheckbox =
      document.createElement("input");

    startFromFirstCheckbox.type =
      "checkbox";

    startFromFirstCheckbox.className =
      "crack-story-search-start-checkbox";

    startFromFirstCheckbox.checked =
      readStartFromFirstPreference();

    const startFromFirstText =
      document.createElement("span");

    startFromFirstText.textContent =
      "첫 결과부터";

    startFromFirstLabel.append(
      startFromFirstCheckbox,
      startFromFirstText
    );

    searchRow.append(
      startFromFirstLabel,
      prevButton,
      nextButton
    );

    startFromFirstCheckbox.addEventListener(
      "change",
      () => {
        saveStartFromFirstPreference(
          startFromFirstCheckbox.checked
        );

        if (matches.length) {
          currentIndex =
            startFromFirstCheckbox.checked
              ? 0
              : matches.length - 1;

          focusCurrent();

          setStatus(
            startFromFirstCheckbox.checked
              ? "첫 검색 결과로 이동했어요"
              : "최신 검색 결과로 이동했어요"
          );
        }
      }
    );

    loadButton = createButton(
      "불러오기",
      "선택한 범위까지 과거 로그를 불러옵니다",
      runSelectedLoad
    );

    loadButton.classList.add(
      "crack-story-search-load"
    );

    stopButton = createButton(
      "중지",
      "자동 불러오기 중지",
      stopCurrentJob
    );

    stopButton.disabled = true;

    const closeButton = createButton(
      "검색창 닫기",
      "검색창 숨기기",
      () => {
        stopCurrentJob();
        clearHighlights();

        root.hidden = true;

        if (launcherButton) {
          launcherButton.hidden = false;
          startLauncherTracking();
        }
      }
    );

    actionRow.append(
      rangeSelect,
      customTurnInput,
      loadButton,
      stopButton,
      closeButton
    );

    statusLabel =
      document.createElement("div");

    statusLabel.className =
      "crack-story-search-status";

    statusLabel.textContent =
      `현재 불러온 메시지 묶음 ` +
      `${getMessageGroups().length}개`;

    root.append(
      searchRow,
      actionRow,
      statusLabel
    );

    document.documentElement.appendChild(root);
    createLauncher();

    // 처음에는 검색창을 닫고 돋보기 버튼만 표시
    root.hidden = true;

    if (launcherButton) {
      launcherButton.hidden = false;
      startLauncherTracking();
    }

    input.addEventListener(
      "input",
      () => {
        lastQuery = "";
        clearHighlights();

        setStatus(
          "Enter 또는 찾기를 눌러 검색하세요"
        );
      }
    );

    input.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          if (event.shiftKey) {
            goUp();
          } else if (
            matches.length &&
            input.value.trim() === lastQuery
          ) {
            goDown();
          } else {
            runSearch();
          }
        }

        if (event.key === "Escape") {
          input.value = "";
          lastQuery = "";

          clearHighlights();

          setStatus(
            "검색어를 지웠어요"
          );
        }
      }
    );
  }

  async function installWhenReady() {
    for (
      let attempt = 0;
      attempt < 60;
      attempt += 1
    ) {
      if (!isEpisodePage()) return;

      if (
        document.querySelector(
          "div[data-message-group-id]"
        )
      ) {
        createUI();
        return;
      }

      await sleep(250);
    }
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.altKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "f"
      ) {
        event.preventDefault();

        if (!root) {
          createUI();
        }

        if (root) {
          stopLauncherTracking();

          root.hidden = false;

          if (launcherButton) {
            launcherButton.hidden = true;
          }

          input.focus();
          input.select();
        }
      }
    }
  );

  installWhenReady();
})();
