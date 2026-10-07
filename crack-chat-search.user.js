// ==UserScript==
// @name         크랙 채팅방 내부 검색
// @namespace    https://github.com/mynameislovesong
// @version      2.0.0
// @description  현재 채팅방의 전체 대화를 검색하고, 결과나 북마크를 누르면 원래 채팅창의 해당 메시지로 이동합니다. 과거 로그 범위 불러오기와 화면 본문 검색도 그대로 제공합니다.
// @match        https://crack.wrtn.ai/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(() => {
  const STYLE = String.raw`
#ccs2-root,
#ccs2-mini,
#ccs2-toast,
#ccs2-hover-bm {
  --ccs-bg: #ffffff;
  --ccs-surface: #f8f6f4;
  --ccs-hover: #f3efeb;
  --ccs-border: rgba(41, 37, 36, 0.10);
  --ccs-border-strong: rgba(41, 37, 36, 0.20);
  --ccs-text: #1c1917;
  --ccs-sub: #6f6862;
  --ccs-faint: #a29a93;
  --ccs-accent: #ff5b4a;
  --ccs-accent-soft: rgba(255, 91, 74, 0.10);
  --ccs-accent-text: #cf3e30;
  --ccs-mark: rgba(255, 190, 0, 0.36);
  --ccs-danger: #c2410c;
  --ccs-shadow: 0 10px 30px rgba(41, 37, 36, 0.12), 0 2px 6px rgba(41, 37, 36, 0.06);
  --ccs-toast-bg: #292524;
  --ccs-toast-text: #fafaf9;
  box-sizing: border-box;
  color: var(--ccs-text);
  font-family:
    Pretendard, "Apple SD Gothic Neo", -apple-system, BlinkMacSystemFont,
    "Segoe UI", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#ccs2-root[data-ccs-theme="dark"],
#ccs2-mini[data-ccs-theme="dark"],
#ccs2-toast[data-ccs-theme="dark"],
#ccs2-hover-bm[data-ccs-theme="dark"] {
  --ccs-bg: #1f1d1b;
  --ccs-surface: #282522;
  --ccs-hover: #2f2b28;
  --ccs-border: rgba(255, 255, 255, 0.10);
  --ccs-border-strong: rgba(255, 255, 255, 0.20);
  --ccs-text: #f5f5f4;
  --ccs-sub: #b4ada7;
  --ccs-faint: #827a74;
  --ccs-accent: #ff6b5b;
  --ccs-accent-soft: rgba(255, 107, 91, 0.16);
  --ccs-accent-text: #ff8b7e;
  --ccs-mark: rgba(255, 196, 64, 0.32);
  --ccs-danger: #fb923c;
  --ccs-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.30);
  --ccs-toast-bg: #f5f5f4;
  --ccs-toast-text: #1c1917;
}

#ccs2-root *,
#ccs2-mini *,
#ccs2-toast * {
  box-sizing: border-box;
}

/* 초기화 규칙은 :where()로 감싸 아래 컴포넌트 규칙보다 우선하지 않게 함 */
:where(#ccs2-root, #ccs2-mini, #ccs2-toast) button,
:where(#ccs2-hover-bm) {
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

#ccs2-root [hidden],
#ccs2-mini [hidden],
#ccs2-root[hidden],
#ccs2-mini[hidden],
#ccs2-toast[hidden],
#ccs2-hover-bm[hidden] {
  display: none !important;
}

:where(#ccs2-root, #ccs2-mini, #ccs2-hover-bm) svg {
  width: 16px;
  height: 16px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ---------- 패널 ---------- */

#ccs2-root {
  position: fixed;
  top: 112px;
  right: 20px;
  z-index: 2147483646;
  display: flex;
  flex-direction: column;
  width: min(400px, calc(100vw - 32px));
  height: min(640px, calc(100vh - 136px));
  height: min(640px, calc(100dvh - 136px));
  overflow: hidden;
  border: 1px solid var(--ccs-border);
  border-radius: 16px;
  background: var(--ccs-bg);
  box-shadow: var(--ccs-shadow);
  font-size: 14px;
  line-height: 1.45;
}

.ccs2-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px 4px 18px;
}

.ccs2-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.ccs2-icon-btn {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ccs-sub);
}

.ccs2-icon-btn:hover:not(:disabled) {
  background: var(--ccs-hover);
  color: var(--ccs-text);
}

.ccs2-icon-btn:disabled {
  cursor: default;
  opacity: 0.35;
}

.ccs2-tabs {
  display: flex;
  gap: 4px;
  padding: 0 12px;
  border-bottom: 1px solid var(--ccs-border);
}

.ccs2-tab {
  position: relative;
  padding: 9px 10px 10px;
  border: 0;
  background: transparent;
  color: var(--ccs-sub);
  font-size: 14px;
  font-weight: 600;
}

.ccs2-tab[aria-selected="true"] {
  color: var(--ccs-text);
}

.ccs2-tab[aria-selected="true"]::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--ccs-accent);
}

.ccs2-tab-count {
  margin-left: 4px;
  color: var(--ccs-faint);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.ccs2-view {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

/* ---------- 검색 ---------- */

.ccs2-searchbox {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  margin: 12px 12px 6px;
  padding: 0 6px 0 12px;
  border: 1px solid var(--ccs-border);
  border-radius: 12px;
  background: var(--ccs-surface);
  color: var(--ccs-faint);
}

.ccs2-searchbox:focus-within {
  border-color: var(--ccs-accent);
  box-shadow: 0 0 0 3px var(--ccs-accent-soft);
}

.ccs2-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ccs-text);
  font: inherit;
  font-size: 14px;
}

.ccs2-input::placeholder {
  color: var(--ccs-faint);
}

.ccs2-input::-webkit-search-cancel-button {
  display: none;
}

.ccs2-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 10px;
  min-height: 30px;
  padding: 2px 16px 8px;
  color: var(--ccs-sub);
  font-size: 12px;
}

.ccs2-status-main {
  color: var(--ccs-text);
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.ccs2-status-side {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-variant-numeric: tabular-nums;
}

.ccs2-status-side.is-error {
  color: var(--ccs-danger);
}

.ccs2-link-btn {
  padding: 2px 4px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--ccs-accent-text);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.ccs2-link-btn:hover {
  background: var(--ccs-accent-soft);
}

.ccs2-spinner {
  display: inline-block;
  flex: none;
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ccs2-spin 0.8s linear infinite;
  opacity: 0.8;
}

@keyframes ccs2-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ccs2-spinner {
    animation: none;
    border-top-color: currentColor;
    opacity: 0.45;
  }
}

.ccs2-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 6px 10px;
  border-top: 1px solid var(--ccs-border);
  -webkit-overflow-scrolling: touch;
}

.ccs2-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 44px;
  margin-top: 2px;
  padding: 9px 4px 9px 10px;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
}

.ccs2-item:hover {
  background: var(--ccs-hover);
}

.ccs2-item:focus-visible {
  box-shadow: inset 0 0 0 2px var(--ccs-accent);
}

.ccs2-item.is-selected {
  background: var(--ccs-accent-soft);
}

.ccs2-item-main {
  flex: 1;
  min-width: 0;
}

.ccs2-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 2px;
  color: var(--ccs-sub);
  font-size: 12px;
  white-space: nowrap;
}

.ccs2-turn {
  color: var(--ccs-text);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.ccs2-meta-dim {
  overflow: hidden;
  color: var(--ccs-faint);
  text-overflow: ellipsis;
}

.ccs2-snippet {
  display: -webkit-box;
  overflow: hidden;
  color: var(--ccs-text);
  font-size: 13.5px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.ccs2-snippet mark {
  padding: 0 1px;
  border-radius: 3px;
  background: var(--ccs-mark);
  color: inherit;
}

.ccs2-star {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ccs-faint);
}

.ccs2-star:hover {
  background: var(--ccs-surface);
  color: var(--ccs-text);
}

.ccs2-star.is-on {
  color: var(--ccs-accent);
}

.ccs2-star.is-on svg {
  fill: currentColor;
}

.ccs2-empty {
  padding: 44px 24px;
  color: var(--ccs-sub);
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
}

.ccs2-empty strong {
  display: block;
  margin-bottom: 4px;
  color: var(--ccs-text);
  font-size: 14px;
}

.ccs2-sentinel {
  height: 1px;
}

/* ---------- 고급 옵션 ---------- */

.ccs2-advanced {
  flex: none;
  border-top: 1px solid var(--ccs-border);
}

.ccs2-advanced > summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  color: var(--ccs-sub);
  font-size: 12.5px;
  font-weight: 600;
  list-style: none;
  cursor: pointer;
  user-select: none;
}

.ccs2-advanced > summary::-webkit-details-marker {
  display: none;
}

.ccs2-advanced > summary::after {
  content: "";
  width: 7px;
  height: 7px;
  margin-right: 4px;
  border-right: 1.6px solid currentColor;
  border-bottom: 1.6px solid currentColor;
  transform: rotate(-135deg) translate(-2px, -2px);
}

.ccs2-advanced[open] > summary::after {
  transform: rotate(45deg) translate(-2px, -2px);
}

.ccs2-adv-body {
  display: grid;
  gap: 10px;
  max-height: 260px;
  overflow-y: auto;
  padding: 0 14px 14px;
}

.ccs2-adv-label {
  margin-bottom: 5px;
  color: var(--ccs-sub);
  font-size: 12px;
  font-weight: 600;
}

.ccs2-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.ccs2-seg {
  display: inline-flex;
  padding: 2px;
  border: 1px solid var(--ccs-border);
  border-radius: 10px;
  background: var(--ccs-surface);
}

.ccs2-seg button {
  height: 28px;
  padding: 0 11px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ccs-sub);
  font-size: 12.5px;
  font-weight: 600;
}

.ccs2-seg button[aria-pressed="true"] {
  background: var(--ccs-bg);
  color: var(--ccs-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.ccs2-btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--ccs-border);
  border-radius: 10px;
  background: var(--ccs-bg);
  color: var(--ccs-text);
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}

.ccs2-btn:hover:not(:disabled) {
  background: var(--ccs-hover);
}

.ccs2-btn:disabled {
  cursor: default;
  opacity: 0.45;
}

.ccs2-btn-accent {
  border-color: transparent;
  background: var(--ccs-accent-soft);
  color: var(--ccs-accent-text);
}

.ccs2-btn-accent:hover:not(:disabled) {
  background: var(--ccs-accent-soft);
  filter: brightness(0.97);
}

.ccs2-select,
.ccs2-number,
.ccs2-field {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--ccs-border);
  border-radius: 10px;
  outline: none;
  background: var(--ccs-bg);
  color: var(--ccs-text);
  font: inherit;
  font-size: 13px;
}

.ccs2-select {
  min-width: 0;
  flex: 1;
  cursor: pointer;
}

.ccs2-number {
  width: 76px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.ccs2-select:focus,
.ccs2-number:focus,
.ccs2-field:focus {
  border-color: var(--ccs-accent);
  box-shadow: 0 0 0 3px var(--ccs-accent-soft);
}

.ccs2-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ccs-text);
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}

.ccs2-check input {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--ccs-accent);
}

.ccs2-legacy-status {
  color: var(--ccs-sub);
  font-size: 12px;
}

/* ---------- 북마크 ---------- */

.ccs2-bm-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 14px 10px 16px;
}

.ccs2-bm-count {
  flex: 1;
  min-width: 120px;
  font-size: 13px;
  font-weight: 600;
}

.ccs2-bm-toolbar .ccs2-select {
  flex: none;
  width: auto;
}

.ccs2-bm-title {
  overflow: hidden;
  color: var(--ccs-text);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ccs2-bm-sub {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 2px;
  color: var(--ccs-sub);
  font-size: 12.5px;
  overflow-wrap: anywhere;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ccs2-editor {
  display: grid;
  gap: 6px;
  margin: 2px 0;
  padding: 10px;
  border: 1px solid var(--ccs-border);
  border-radius: 12px;
  background: var(--ccs-surface);
}

.ccs2-editor .ccs2-field {
  width: 100%;
}

.ccs2-editor textarea.ccs2-field {
  height: auto;
  min-height: 64px;
  padding: 7px 8px;
  resize: vertical;
  line-height: 1.45;
}

.ccs2-editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

/* ---------- 미니바 ---------- */

#ccs2-mini {
  position: fixed;
  top: 112px;
  right: 20px;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: min(460px, calc(100vw - 32px));
  min-height: 44px;
  padding: 5px 5px 5px 12px;
  border: 1px solid var(--ccs-border);
  border-radius: 14px;
  background: var(--ccs-bg);
  box-shadow: var(--ccs-shadow);
  font-size: 13px;
  line-height: 1.35;
}

.ccs2-mini-text {
  display: grid;
  flex: 1;
  min-width: 0;
  margin-right: 4px;
}

.ccs2-mini-title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ccs2-mini-sub {
  overflow: hidden;
  color: var(--ccs-sub);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

#ccs2-mini.is-error .ccs2-mini-title {
  color: var(--ccs-danger);
}

.ccs2-mini-count {
  min-width: 48px;
  color: var(--ccs-sub);
  font-size: 12.5px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.ccs2-mini-spin {
  margin-right: 2px;
  color: var(--ccs-accent);
}

/* ---------- 토스트 ---------- */

#ccs2-toast {
  position: fixed;
  left: 50%;
  bottom: 96px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: calc(100vw - 32px);
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--ccs-toast-bg);
  box-shadow: var(--ccs-shadow);
  color: var(--ccs-toast-text);
  font-size: 13px;
  transform: translateX(-50%);
}

#ccs2-toast button {
  padding: 2px 4px;
  border: 0;
  background: transparent;
  color: var(--ccs-accent);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

/* ---------- 메시지 북마크 버튼 ---------- */

#ccs2-hover-bm {
  position: fixed;
  z-index: 2147483645;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--ccs-border);
  border-radius: 50%;
  background: var(--ccs-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10);
  color: var(--ccs-faint);
}

#ccs2-hover-bm:hover,
#ccs2-hover-bm:focus-visible {
  color: var(--ccs-text);
  outline: none;
  border-color: var(--ccs-border-strong);
}

#ccs2-hover-bm.is-on {
  color: var(--ccs-accent);
}

#ccs2-hover-bm.is-on svg {
  fill: currentColor;
}

#ccs2-flash {
  position: fixed;
  z-index: 2147483644;
  border: 2px solid rgba(255, 91, 74, 0.75);
  border-radius: 14px;
  background: rgba(255, 91, 74, 0.06);
  opacity: 1;
  pointer-events: none;
  transition: opacity 700ms ease;
}

#ccs2-flash.is-fading {
  opacity: 0;
}

#ccs2-flash[hidden] {
  display: none !important;
}

/* ---------- 모바일 ---------- */

@media (max-width: 640px) {
  #ccs2-root {
    top: auto;
    left: 8px;
    right: 8px;
    bottom: 8px;
    width: auto;
    height: min(78vh, 640px);
    height: min(78dvh, 640px);
  }

  .ccs2-input {
    font-size: 16px;
  }

  #ccs2-mini {
    top: auto;
    left: 8px;
    right: 8px;
    bottom: 12px;
    max-width: none;
  }

  #ccs2-toast {
    bottom: 76px;
  }
}

/* ---------- 기존 기능 (하이라이트 · 돋보기 버튼) ---------- */

::highlight(crack-story-search-loader-all) {
  background-color: #ffe066;
  color: #111;
}

::highlight(crack-story-search-loader-current) {
  background-color: #ff922b;
  color: #111;
  text-decoration: underline 2px #111;
}

#ccs2-launcher {
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

#ccs2-launcher svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

#ccs2-launcher.ccs2-launcher-fallback {
  position: fixed;
  z-index: 2147483647;
  left: auto !important;
  top: auto !important;
  right: 20px;
  bottom: 24px;
  width: 40px;
  height: 40px;
}

#ccs2-launcher:hover {
  transform: translateY(-1px);
  box-shadow: none;
}

#ccs2-launcher:focus-visible {
  outline: 2px solid #8ab4f8;
  outline-offset: 2px;
}

#ccs2-launcher[hidden] {
  display: none !important;
}
`;

  if (window.__crackChatSearchV2Installed) return;
  window.__crackChatSearchV2Installed = true;

  /* =========================================================
   * 상수
   * ======================================================= */

  const API_ORIGIN = "https://crack-api.wrtn.ai";
  const API_PAGE_SIZE = 200;
  const HEAD_CHECK_SIZE = 30;
  const HEAD_CHECK_INTERVAL = 15 * 1000;
  const STORE_MAX_AGE = 10 * 60 * 1000;
  const RENDER_STEP = 80;
  const SEARCH_DEBOUNCE = 450;

  const GROUP_SELECTOR = "div[data-message-group-id]";
  const ALL_HIGHLIGHT = "crack-story-search-loader-all";
  const CURRENT_HIGHLIGHT = "crack-story-search-loader-current";
  const START_FROM_FIRST_KEY = "crack-story-search-start-from-first";
  const SCOPE_KEY = "ccs2-search-scope";
  const BM_SORT_KEY = "ccs2-bookmark-sort";
  const BM_KEY_PREFIX = "ccs2.bookmarks.";

  const ID_RE = /^[A-Za-z0-9_-]{6,64}$/;
  const HEX_ID_RE = /^[0-9a-f]{24}$/;
  const TURN_LINE_RE = /^\[?\s*T\s*(\d+)\s*(?:\]|$|[|〡·/])/i;

  const ICONS = {
    search:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.75" cy="10.75" r="6.25"></circle><path d="M15.4 15.4 20 20"></path></svg>',
    close:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"></path></svg>',
    star:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"></path></svg>',
    up:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 15 6-6 6 6"></path></svg>',
    down:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>',
    list:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"></path></svg>',
    edit:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="m13.5 6.5 4 4"></path></svg>'
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* =========================================================
   * 저장소
   * ======================================================= */

  const hasGM =
    typeof GM_getValue === "function" &&
    typeof GM_setValue === "function";

  function storageGet(key, fallback) {
    try {
      if (hasGM) return GM_getValue(key, fallback);
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      if (hasGM) {
        GM_setValue(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return true;
    } catch {
      return false;
    }
  }

  function readPref(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writePref(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // 사이트 저장소를 사용할 수 없어도 기능은 계속 작동함
    }
  }

  /* =========================================================
   * 공통 도우미
   * ======================================================= */

  function getRoute() {
    const match = location.pathname.match(
      /^\/stories\/([^/]+)\/episodes\/([^/?#]+)/
    );
    return match ? { storyId: match[1], chatId: match[2] } : null;
  }

  function isEpisodePage() {
    return Boolean(getRoute());
  }

  function currentChatId() {
    return getRoute()?.chatId || null;
  }

  function supportsHighlight() {
    return "highlights" in CSS && typeof Highlight !== "undefined";
  }

  function normalize(text) {
    return (text || "").toLocaleLowerCase("ko-KR");
  }

  function normalizeQuery(text) {
    return normalize(String(text || "").replace(/\s+/g, " ").trim());
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("ko-KR");
  }

  function compareIds(a, b) {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  function isHexId(value) {
    return typeof value === "string" && HEX_ID_RE.test(value);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);

    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined || value === false) continue;

      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "icon") node.innerHTML = ICONS[value] || "";
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : String(value));
    }

    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child);
    }

    return node;
  }

  function hashString(text) {
    let hash = 0x811c9dc5;

    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString(36);
  }

  function contentSignature(content) {
    const text = String(content || "");
    return `${text.length}:${hashString(text)}`;
  }

  function isAbortError(error) {
    return error?.name === "AbortError";
  }

  /* =========================================================
   * 메시지 텍스트 처리
   * ======================================================= */

  function toPlainText(content) {
    return String(content || "")
      .replace(/^[ \t]*\[\/\/\]:\s*#\s*(?:\(.*\)|".*"|'.*')[ \t]*$/gm, "")
      .replace(/!\[[^\]\n]*\]\([^)\n]*\)/g, "")
      .replace(/\[([^\]\n]+)\]\((?:[^)\s]+)\)/g, "$1")
      .replace(/^[ \t]{0,3}(?:#{1,6}[ \t]+|>[ \t]?)/gm, "")
      .replace(/\*{1,3}|~~|`+/g, "")
      .trim();
  }

  function parseTurnNumber(text) {
    const lines = String(text || "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 20);

    for (const line of lines) {
      const match = line.match(TURN_LINE_RE);
      if (match) return Number(match[1]);
    }

    return null;
  }

  function previewFromFlat(flat, max = 140) {
    let text = String(flat || "")
      .replace(/^<([A-Za-z_][\w-]*)>[\s\S]*?<\/\1>\s*/, "")
      .replace(/^\[\s*T\s*\d+[^\]]*\]\s*/i, "")
      .trim();

    if (!text) text = String(flat || "").trim();
    return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
  }

  function defaultTitle(preview) {
    const text = String(preview || "").replace(/^…/, "").trim();
    if (!text) return "저장한 메시지";
    return text.length > 28 ? `${text.slice(0, 28).trimEnd()}…` : text;
  }

  function labelForRecord(record) {
    if (!record) return "";
    if (Number.isFinite(record.tnum)) return `T${record.tnum}`;
    if (Number.isFinite(record.seq)) {
      return record.seq === 0 ? "도입부" : `#${record.seq}`;
    }
    return "";
  }

  function labelHint(label) {
    if (label.startsWith("T")) return "메시지 본문에 적힌 턴 번호";
    if (label.startsWith("#")) return "대화 순번 (사용자 메시지 기준, 본문에 턴 번호가 없을 때)";
    return "";
  }

  function roleLabel(role) {
    if (role === "user") return "나";
    if (role === "assistant") return "캐릭터";
    return "";
  }

  /* =========================================================
   * Crack API
   * ======================================================= */

  class ApiError extends Error {
    constructor(message, status = 0, kind = "http") {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.kind = kind;
    }
  }

  function readAccessToken() {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    if (!match || !match[1]) return null;

    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }

  async function apiFetchMessages(chatId, { cursor = null, limit, signal }) {
    if (!ID_RE.test(chatId)) {
      throw new ApiError("채팅방 주소를 확인할 수 없어요", 0, "invalid");
    }

    const url = new URL(
      `/crack-gen/v3/chats/${encodeURIComponent(chatId)}/messages`,
      API_ORIGIN
    );

    url.searchParams.set("limit", String(limit));
    if (cursor) url.searchParams.set("cursor", cursor);

    let response = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      // 토큰은 요청마다 다시 읽어 Crack이 갱신한 값을 사용함
      const token = readAccessToken();

      if (!token) {
        throw new ApiError("로그인 정보를 찾을 수 없어요", 401, "auth");
      }

      try {
        response = await fetch(url.href, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          cache: "no-store",
          signal
        });
      } catch (error) {
        if (isAbortError(error)) throw error;

        if (attempt < 2) {
          await sleep(600 * (attempt + 1));
          continue;
        }

        throw new ApiError("네트워크 오류로 대화를 불러오지 못했어요", 0, "network");
      }

      const retryable =
        response.status === 429 ||
        response.status >= 500 ||
        (response.status === 401 && attempt === 0);

      if (retryable && attempt < 2) {
        await sleep(response.status === 401 ? 400 : 800 * (attempt + 1));
        continue;
      }

      break;
    }

    if (!response.ok) {
      const kind =
        response.status === 401 || response.status === 403 ? "auth" : "http";

      throw new ApiError(
        kind === "auth"
          ? "로그인이 만료됐거나 권한이 없어요"
          : `대화를 불러오지 못했어요 (${response.status})`,
        response.status,
        kind
      );
    }

    let json;

    try {
      json = await response.json();
    } catch {
      throw new ApiError("응답을 해석할 수 없어요", response.status, "format");
    }

    const data = json?.data;

    if (!data || !Array.isArray(data.messages)) {
      throw new ApiError("예상하지 못한 응답 형식이에요", response.status, "format");
    }

    return {
      // 현재 채팅방에 속한 메시지만 사용
      messages: data.messages.filter(
        (message) =>
          message &&
          typeof message._id === "string" &&
          ID_RE.test(message._id) &&
          (message.chatId === undefined || message.chatId === chatId)
      ),
      hasNext: data.hasNext === true,
      nextCursor:
        typeof data.nextCursor === "string" && data.nextCursor
          ? data.nextCursor
          : null
    };
  }

  /* =========================================================
   * 채팅방별 메시지 캐시 (세션 메모리)
   * ======================================================= */

  const stores = new Map();

  function createStore(chatId) {
    return {
      chatId,
      msgs: [],
      byId: new Map(),
      byTurnId: new Map(),
      replyByParentTurn: new Map(),
      repliesByParentTurn: new Map(),
      cursor: null,
      complete: false,
      loading: null,
      controller: null,
      error: null,
      generation: 0,
      createdAt: Date.now(),
      validatedAt: 0,
      listeners: new Set()
    };
  }

  function getStore(chatId) {
    let store = stores.get(chatId);

    if (!store) {
      store = createStore(chatId);
      stores.set(chatId, store);
    }

    return store;
  }

  function dropOtherStores(chatId) {
    for (const [id, store] of stores) {
      if (id === chatId) continue;
      store.controller?.abort();
      store.listeners.clear();
      stores.delete(id);
    }
  }

  function emitStore(store, type, payload) {
    for (const listener of [...store.listeners]) {
      try {
        listener(type, payload);
      } catch (error) {
        console.error("[크랙 채팅방 검색]", error);
      }
    }
  }

  function subscribeStore(store, listener) {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
  }

  function resetStore(store) {
    store.controller?.abort();

    Object.assign(store, {
      msgs: [],
      byId: new Map(),
      byTurnId: new Map(),
      replyByParentTurn: new Map(),
      repliesByParentTurn: new Map(),
      cursor: null,
      complete: false,
      loading: null,
      controller: null,
      error: null,
      generation: store.generation + 1,
      createdAt: Date.now(),
      validatedAt: 0
    });

    emitStore(store, "reset");
  }

  function ingestMessage(store, raw) {
    const id = raw._id;
    if (store.byId.has(id)) return null;

    const text = toPlainText(raw.content);
    const flat = text.replace(/\s+/g, " ").trim();
    const lower = normalize(flat);

    const record = {
      id,
      index: store.msgs.length,
      turnId: typeof raw.turnId === "string" ? raw.turnId : null,
      parentTurnId:
        typeof raw.parentTurnId === "string" ? raw.parentTurnId : null,
      role:
        raw.role === "user" || raw.role === "assistant" ? raw.role : null,
      reroll: raw.reroll === true,
      flat,
      lower: lower.length === flat.length ? lower : null,
      tnum: parseTurnNumber(text),
      seq: null,
      sig: contentSignature(raw.content)
    };

    store.msgs.push(record);
    store.byId.set(id, record);

    if (record.turnId) store.byTurnId.set(record.turnId, record);

    if (record.role === "assistant" && record.parentTurnId) {
      if (!store.replyByParentTurn.has(record.parentTurnId)) {
        store.replyByParentTurn.set(record.parentTurnId, record);
      }

      // 같은 사용자 메시지에 대한 응답이 여러 개면 리롤 버전이 함께 남아 있는 것
      // (Crack은 그중 하나만 화면에 표시함)
      const replies = store.repliesByParentTurn.get(record.parentTurnId) || [];
      replies.push(record);
      store.repliesByParentTurn.set(record.parentTurnId, replies);
    }

    if (
      record.role === "user" &&
      record.tnum === null &&
      record.turnId
    ) {
      const reply = store.replyByParentTurn.get(record.turnId);
      if (Number.isFinite(reply?.tnum)) record.tnum = reply.tnum;
    }

    return record;
  }

  function computeSequence(store) {
    let userCount = 0;

    for (let index = store.msgs.length - 1; index >= 0; index -= 1) {
      const record = store.msgs[index];
      if (record.role === "user") userCount += 1;
      record.seq = userCount;
    }
  }

  function loadStore(store) {
    if (store.complete) return Promise.resolve();
    if (store.loading) return store.loading;

    const controller = new AbortController();
    const generation = store.generation;

    store.controller = controller;
    store.error = null;

    store.loading = (async () => {
      try {
        while (!store.complete) {
          const previousCursor = store.cursor;

          const page = await apiFetchMessages(store.chatId, {
            cursor: store.cursor,
            limit: API_PAGE_SIZE,
            signal: controller.signal
          });

          if (generation !== store.generation) return;

          const added = [];

          for (const raw of page.messages) {
            const record = ingestMessage(store, raw);
            if (record) added.push(record);
          }

          if (!store.validatedAt) store.validatedAt = Date.now();

          const hasMore =
            page.hasNext &&
            page.nextCursor &&
            page.nextCursor !== previousCursor &&
            page.messages.length > 0;

          if (hasMore) {
            store.cursor = page.nextCursor;
          } else {
            store.cursor = null;
            store.complete = true;
            computeSequence(store);
          }

          emitStore(store, "page", added);
          if (store.complete) emitStore(store, "complete");
        }
      } catch (error) {
        if (generation !== store.generation) return;

        if (isAbortError(error)) {
          emitStore(store, "aborted");
          return;
        }

        store.error = error;
        emitStore(store, "error", error);
      } finally {
        if (store.controller === controller) {
          store.controller = null;
          store.loading = null;
        }
      }
    })();

    return store.loading;
  }

  // 수정·삭제·리롤 뒤 오래된 캐시를 쓰지 않도록 최신 메시지를 대조함
  function validateStore(store) {
    if (!store.validating) {
      store.validating = checkStoreHead(store).finally(() => {
        store.validating = null;
      });
    }

    return store.validating;
  }

  async function checkStoreHead(store) {
    if (!store.msgs.length) return "empty";

    if (Date.now() - store.createdAt > STORE_MAX_AGE) {
      resetStore(store);
      return "reset";
    }

    if (Date.now() - store.validatedAt < HEAD_CHECK_INTERVAL) return "fresh";

    const page = await apiFetchMessages(store.chatId, { limit: HEAD_CHECK_SIZE });

    const sameHead = page.messages.every((raw, index) => {
      const record = store.msgs[index];

      if (!record) return true;
      return record.id === raw._id && record.sig === contentSignature(raw.content);
    });

    const sameLength =
      page.hasNext ||
      !store.complete ||
      page.messages.length === store.msgs.length;

    if (!sameHead || !sameLength) {
      resetStore(store);
      return "reset";
    }

    store.validatedAt = Date.now();
    return "fresh";
  }

  /* =========================================================
   * 기존 DOM 도우미 (1.x 동작 유지)
   * ======================================================= */

  function getMessageGroups() {
    return [...document.querySelectorAll(GROUP_SELECTOR)];
  }

  function getGroupId(group) {
    return group?.getAttribute("data-message-group-id") || "";
  }

  function findGroupElement(id) {
    if (!id) return null;

    try {
      return document.querySelector(
        `div[data-message-group-id="${CSS.escape(id)}"]`
      );
    } catch {
      return null;
    }
  }

  function getOldestLoadedGroup(groups = getMessageGroups()) {
    let oldest = null;

    for (const group of groups) {
      const id = getGroupId(group);
      if (!isHexId(id)) continue;
      if (!oldest || compareIds(id, getGroupId(oldest)) < 0) oldest = group;
    }

    return oldest;
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
      const exact = line.match(TURN_LINE_RE);
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

  function collectTextNodes(element) {
    const nodes = [];

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    return nodes;
  }

  function findRangesInElement(element, query) {
    const trimmed = String(query || "").trim();
    if (!trimmed || !element) return [];

    const needle = normalize(trimmed);
    const ranges = [];

    for (const block of element.querySelectorAll(".wrtn-markdown")) {
      for (const node of collectTextNodes(block)) {
        const haystack = normalize(node.nodeValue);
        if (haystack.length !== node.nodeValue.length) continue;

        let start = 0;

        while (start < haystack.length) {
          const index = haystack.indexOf(needle, start);
          if (index < 0) break;

          const range = new Range();
          range.setStart(node, index);
          range.setEnd(node, index + needle.length);
          ranges.push(range);

          start = index + Math.max(needle.length, 1);
        }
      }
    }

    return ranges;
  }

  function setHighlights(allRanges, currentRange = null) {
    if (!supportsHighlight()) return;

    if (allRanges.length) {
      CSS.highlights.set(ALL_HIGHLIGHT, new Highlight(...allRanges));
    } else {
      CSS.highlights.delete(ALL_HIGHLIGHT);
    }

    if (currentRange) {
      CSS.highlights.set(CURRENT_HIGHLIGHT, new Highlight(currentRange));
    } else {
      CSS.highlights.delete(CURRENT_HIGHLIGHT);
    }
  }

  function clearHighlights() {
    setHighlights([]);
  }

  function findScrollContainer() {
    const sample =
      document.querySelector(GROUP_SELECTOR) ||
      document.querySelector(".wrtn-markdown");

    let element = sample?.parentElement;

    while (element && element !== document.body) {
      const style = getComputedStyle(element);

      const canScroll =
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        style.overflow === "auto" ||
        style.overflow === "scroll";

      if (canScroll && element.scrollHeight > element.clientHeight + 30) {
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
      window.scrollTo({ top: value, behavior: "auto" });
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

  function getViewportBox(container) {
    if (isPageScroller(container)) {
      return { top: 0, height: window.innerHeight };
    }

    const rect = container.getBoundingClientRect();
    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, window.innerHeight);

    return { top, height: Math.max(bottom - top, 1) };
  }

  function scrollElementIntoView(element) {
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function scrollToOldestLoaded() {
    const oldest = getOldestLoadedGroup() || getGroupsByVisualPosition()[0];
    scrollElementIntoView(oldest);
  }

  function scrollToTurn(targetTurn) {
    const entries = getTurnEntries();

    if (!entries.length) {
      scrollToOldestLoaded();
      return null;
    }

    let best = entries[0];

    for (const entry of entries) {
      if (Math.abs(entry.turn - targetTurn) < Math.abs(best.turn - targetTurn)) {
        best = entry;
      }
    }

    scrollElementIntoView(best.group);
    return best.turn;
  }

  /* =========================================================
   * 상태
   * ======================================================= */

  const ui = {
    ready: false,
    root: null,
    tab: "search",
    input: null,
    status: null,
    resultList: null,
    bookmarkList: null,
    bookmarkCount: null,
    bookmarkTabCount: null,
    bookmarkSort: null,
    tabs: {},
    views: {},
    scopeButtons: {},
    oldestFirst: null,
    listObserver: null,
    listScrollTop: 0,
    bookmarkScrollTop: 0,
    editingBookmarkId: null,
    mini: null,
    toast: null,
    toastTimer: null,
    hoverButton: null,
    flash: null,
    scope: readPref(SCOPE_KEY, "api") === "dom" ? "dom" : "api",
    debounceTimer: null,
    composing: false,
    renderTimer: null
  };

  const search = {
    chatId: null,
    query: "",
    needle: "",
    scope: "api",
    status: "idle",
    results: [],
    resultIds: new Set(),
    scanned: 0,
    total: null,
    error: null,
    selectedId: null,
    renderLimit: RENDER_STEP,
    store: null,
    unsubscribe: null,
    job: 0,
    sortedCache: null
  };

  const nav = {
    job: 0,
    running: false,
    context: null
  };

  /* =========================================================
   * API 검색 엔진
   * ======================================================= */

  function countMatches(haystack, needle) {
    let index = haystack.indexOf(needle);
    if (index < 0) return 0;

    let count = 0;

    while (index >= 0 && count < 999) {
      count += 1;
      index = haystack.indexOf(needle, index + needle.length);
    }

    return count;
  }

  function addResult(result) {
    if (search.resultIds.has(result.id)) return;
    search.resultIds.add(result.id);
    search.results.push(result);
    search.sortedCache = null;
  }

  function scanRecords(records) {
    const needle = search.needle;
    if (!needle) return;

    for (const record of records) {
      search.scanned += 1;

      const haystack = record.lower ?? record.flat;
      const count = countMatches(haystack, needle);

      if (count) {
        addResult({ id: record.id, source: "api", count });
      }
    }
  }

  function detachSearch() {
    if (search.unsubscribe) {
      search.unsubscribe();
      search.unsubscribe = null;
    }
  }

  function startSearch(rawQuery, { force = false } = {}) {
    const chatId = currentChatId();
    if (!chatId) return;

    const query = String(rawQuery || "").replace(/\s+/g, " ").trim();

    const unchanged =
      query === search.query &&
      search.chatId === chatId &&
      search.scope === ui.scope &&
      (search.status === "searching" || search.status === "done");

    if (!force && unchanged) return;

    clearTimeout(ui.debounceTimer);
    detachSearch();
    search.job += 1;

    if (!nav.context) clearHighlights();

    Object.assign(search, {
      chatId,
      query,
      needle: normalizeQuery(query),
      scope: ui.scope,
      status: query ? "searching" : "idle",
      results: [],
      resultIds: new Set(),
      scanned: 0,
      total: null,
      error: null,
      selectedId: null,
      renderLimit: RENDER_STEP,
      store: null,
      sortedCache: null
    });

    ui.listScrollTop = 0;
    if (ui.resultList) ui.resultList.scrollTop = 0;

    renderSearch();

    if (!query) return;

    if (search.scope === "dom") {
      runDomSearch();
    } else {
      runApiSearch(search.job, chatId);
    }
  }

  async function runApiSearch(job, chatId) {
    const store = getStore(chatId);
    search.store = store;

    try {
      await validateStore(store);
    } catch {
      // 대조 실패 시 기존 캐시를 그대로 사용하고, 불러오기 단계에서 오류를 처리함
    }

    if (job !== search.job) return;

    scanRecords(store.msgs);

    if (store.complete) {
      finishApiSearch(store);
      return;
    }

    renderSearch();

    search.unsubscribe = subscribeStore(store, (type, payload) => {
      if (job !== search.job) return;

      if (type === "page") {
        scanRecords(payload);
        scheduleRender();
      } else if (type === "complete") {
        finishApiSearch(store);
      } else if (type === "error") {
        handleApiFailure(payload);
      } else if (type === "aborted") {
        detachSearch();
        search.status = "cancelled";
        renderSearch();
      } else if (type === "reset") {
        startSearch(search.query, { force: true });
      }
    });

    loadStore(store);
  }

  function finishApiSearch(store) {
    detachSearch();
    search.status = "done";
    search.total = store.msgs.length;
    search.scanned = store.msgs.length;
    search.sortedCache = null;
    renderSearch();
    renderBookmarks();
  }

  function handleApiFailure(error) {
    detachSearch();

    search.status = "error";
    search.error =
      error instanceof ApiError
        ? error.message
        : "대화를 불러오지 못했어요";

    // API 검색 실패 시 화면에 불러온 메시지에서 찾아 결과를 보완함
    const domResults = scanDomGroups(search.query);

    for (const result of domResults) addResult(result);

    renderSearch();
  }

  function cancelSearch() {
    if (search.status !== "searching") return;

    const store = search.store;

    if (store?.controller) {
      store.controller.abort();
    } else {
      detachSearch();
      search.job += 1;
      search.status = "cancelled";
      renderSearch();
    }
  }

  /* =========================================================
   * DOM 검색 엔진 (화면에 불러온 메시지)
   * ======================================================= */

  function scanDomGroups(query) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return [];

    const needle = normalize(trimmed);
    const results = [];

    for (const group of getMessageGroups()) {
      const id = getGroupId(group);
      if (!id) continue;

      let count = 0;
      const parts = [];

      for (const block of group.querySelectorAll(".wrtn-markdown")) {
        for (const node of collectTextNodes(block)) {
          parts.push(node.nodeValue);
          count += countMatches(normalize(node.nodeValue), needle);
        }
      }

      if (!count) continue;

      const text = parts.join("\n");

      results.push({
        id,
        source: "dom",
        count,
        flat: text.replace(/\s+/g, " ").trim(),
        label: (() => {
          const turn = parseTurnNumber(text);
          return Number.isFinite(turn) ? `T${turn}` : "";
        })()
      });
    }

    return results;
  }

  function runDomSearch() {
    const results = scanDomGroups(search.query);

    for (const result of results) addResult(result);

    search.scanned = getMessageGroups().length;
    search.status = "done";

    // 1.x 처럼 불러온 본문의 모든 일치 항목을 강조함
    const ranges = [];
    for (const result of results) {
      ranges.push(...findRangesInElement(findGroupElement(result.id), search.query));
    }
    setHighlights(ranges);

    renderSearch();
  }

  /* =========================================================
   * 결과 정렬 · 조회
   * ======================================================= */

  function isOldestFirst() {
    return readPref(START_FROM_FIRST_KEY, "false") === "true";
  }

  function getSortedResults() {
    const oldestFirst = isOldestFirst();

    if (search.sortedCache && search.sortedCache.oldestFirst === oldestFirst) {
      return search.sortedCache.list;
    }

    const list = [...search.results].sort((a, b) =>
      oldestFirst ? compareIds(a.id, b.id) : compareIds(b.id, a.id)
    );

    search.sortedCache = { oldestFirst, list };
    return list;
  }

  function getRecord(id) {
    const chatId = currentChatId();
    if (!chatId) return null;
    return stores.get(chatId)?.byId.get(id) || null;
  }

  function describeResult(result) {
    const record = getRecord(result.id);

    return {
      record,
      flat: record ? record.flat : result.flat || "",
      label: record ? labelForRecord(record) : result.label || "",
      role: record ? record.role : null
    };
  }

  function buildSnippet(flat, needle) {
    const text = String(flat || "");
    const lower = normalize(text);
    const aligned = lower.length === text.length;

    let index = needle ? (aligned ? lower : text).indexOf(needle) : -1;
    if (index < 0) index = 0;

    let start = Math.max(0, index - 34);
    if (start > 0) {
      const space = text.indexOf(" ", start);
      if (space > 0 && space < index && space - start < 10) start = space + 1;
    }

    const end = Math.min(text.length, index + needle.length + 120);

    return {
      text: text.slice(start, end),
      lower: aligned ? lower.slice(start, end) : null,
      prefix: start > 0,
      suffix: end < text.length
    };
  }

  function appendHighlighted(container, snippet, needle) {
    if (snippet.prefix) container.append("…");

    const { text, lower } = snippet;

    if (!needle || !lower) {
      container.append(text);
    } else {
      let cursor = 0;
      let index = lower.indexOf(needle);

      while (index >= 0) {
        if (index > cursor) container.append(text.slice(cursor, index));
        container.append(h("mark", { text: text.slice(index, index + needle.length) }));
        cursor = index + needle.length;
        index = lower.indexOf(needle, cursor);
      }

      if (cursor < text.length) container.append(text.slice(cursor));
    }

    if (snippet.suffix) container.append("…");
  }

  /* =========================================================
   * 메시지 이동 엔진 (검색 결과 · 북마크 공용)
   * ======================================================= */

  function cancelNavigation({ silent = false } = {}) {
    const wasRunning = nav.running;

    nav.job += 1;
    nav.running = false;

    if (wasRunning && !silent) {
      showMini("info", {
        title: "이동을 취소했어요",
        sub: "현재 위치에서 계속 읽을 수 있어요"
      });
    }
  }

  function endNavigation() {
    cancelNavigation({ silent: true });
    nav.context = null;
    clearHighlights();
    hideMini();
  }

  async function waitForGroupChange(previousCount, targetId, job, timeout) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeout) {
      await sleep(100);

      if (job !== nav.job) return false;
      if (findGroupElement(targetId)) return true;

      const count = document.querySelectorAll(GROUP_SELECTOR).length;

      if (count !== previousCount) {
        await sleep(150);
        return true;
      }
    }

    return false;
  }

  async function waitUntilVisible(job) {
    while (document.hidden && job === nav.job) {
      await sleep(400);
    }
  }

  function describeLoadedRange(groups, targetRecord) {
    const oldest = getOldestLoadedGroup(groups);
    const record = oldest ? getRecord(getGroupId(oldest)) : null;

    let label = record ? labelForRecord(record) : "";

    if (!label && oldest) {
      const turn = extractTurnNumber(oldest);
      if (Number.isFinite(turn)) label = `T${turn}`;
    }

    const parts = [
      label
        ? `현재 ${label}까지 불러왔어요`
        : `현재 메시지 ${formatNumber(groups.length)}개를 불러왔어요`
    ];

    if (record && targetRecord && targetRecord.index > record.index) {
      parts.push(`목표까지 메시지 ${formatNumber(targetRecord.index - record.index)}개`);
    }

    return parts.join(" · ");
  }

  async function loadUntilFound(targetId, job, progressTitle) {
    let container = findScrollContainer();
    let stableRounds = 0;
    let rounds = 0;

    const store = stores.get(currentChatId());

    while (job === nav.job) {
      const found = findGroupElement(targetId);
      if (found) return { element: found };

      const groups = getMessageGroups();
      const oldest = getOldestLoadedGroup(groups);
      const oldestId = getGroupId(oldest);

      // ObjectId는 시간순으로 증가하므로, 더 오래된 메시지가 이미 보이는데
      // 목표가 없다면 삭제·교체된 메시지임
      if (isHexId(oldestId) && isHexId(targetId) && compareIds(oldestId, targetId) < 0) {
        return { missing: "passed" };
      }

      const firstMessage = store?.complete ? store.msgs[store.msgs.length - 1] : null;

      if (firstMessage && oldestId === firstMessage.id) {
        return { missing: "top" };
      }

      showMini("progress", {
        title: progressTitle,
        sub: describeLoadedRange(groups, store?.byId.get(targetId))
      });

      if (document.hidden) {
        showMini("progress", {
          title: progressTitle,
          sub: "탭이 화면에 보이면 이어서 불러와요"
        });

        await waitUntilVisible(job);
        continue;
      }

      if (!container.isConnected) container = findScrollContainer();

      setScrollTop(container, 0);

      const changed = await waitForGroupChange(groups.length, targetId, job, 2500);
      if (job !== nav.job) return { cancelled: true };

      if (changed) {
        stableRounds = 0;
      } else {
        stableRounds += 1;
        if (stableRounds >= 4) return { missing: "stalled" };

        // 이미 맨 위에 있으면 Crack의 불러오기가 다시 감지되도록 살짝 내렸다 올림
        setScrollTop(container, Math.min(240, getScrollHeight(container)));
        await sleep(80);
      }

      rounds += 1;
      if (rounds > 1500) return { missing: "limit" };
    }

    return { cancelled: true };
  }

  async function resolveTarget(target, job) {
    const chatId = currentChatId();
    const store = getStore(chatId);

    if (store.byId.has(target.id)) return { id: target.id };

    if (!store.complete) {
      showMini("progress", {
        title: target.progressTitle,
        sub: "메시지 위치를 확인하는 중…"
      });

      await loadStore(store);
      if (job !== nav.job) return { cancelled: true };
    }

    if (store.byId.has(target.id)) return { id: target.id };

    if (!store.complete) {
      // API를 쓸 수 없으면 메시지 ID만으로 화면 불러오기를 시도함
      return { id: target.id, unverified: true };
    }

    if (target.turnId) {
      const byTurn = store.byTurnId.get(target.turnId);

      if (byTurn && (!target.role || byTurn.role === target.role)) {
        return { id: byTurn.id, relocated: true };
      }
    }

    return { missing: "deleted" };
  }

  function missingMessage(reason) {
    if (reason === "stalled") {
      return "더 이상 과거 로그를 불러올 수 없어요. 메시지를 찾지 못했어요.";
    }

    if (reason === "limit") {
      return "안전을 위해 불러오기를 멈췄어요.";
    }

    return "삭제되었거나 리롤로 교체된 메시지 같아요.";
  }

  async function navigateTo(target) {
    const chatId = currentChatId();
    if (!chatId || !target?.id) return;

    cancelNavigation({ silent: true });
    stopCurrentJob({ silent: true });

    const job = nav.job;
    nav.running = true;
    nav.context = null;

    const progressTitle = target.label
      ? `${target.label} 위치로 이동 중…`
      : "선택한 메시지로 이동 중…";

    target.progressTitle = progressTitle;

    hidePanel();
    showMini("progress", { title: progressTitle, sub: "" });

    try {
      let id = target.id;
      let element = findGroupElement(id);
      let relocated = false;

      if (!element) {
        const resolved = await resolveTarget(target, job);
        if (job !== nav.job || resolved.cancelled) return;

        if (resolved.missing) {
          showMissing(target, resolved.missing);
          return;
        }

        id = resolved.id;
        relocated = Boolean(resolved.relocated);
        element = findGroupElement(id);

        if (!element) {
          const loaded = await loadUntilFound(id, job, progressTitle);
          if (job !== nav.job || loaded.cancelled) return;

          if (loaded.missing) {
            showMissing(target, loaded.missing);
            return;
          }

          element = loaded.element;
        }
      }

      if (relocated && target.kind === "bookmark") {
        relocateBookmark(chatId, target.id, id);
      }

      revealMessage(element, { ...target, id });
    } catch (error) {
      if (job !== nav.job) return;

      showMini("error", {
        title: "메시지로 이동하지 못했어요",
        sub: error instanceof ApiError ? error.message : "잠시 후 다시 시도해 주세요"
      });
    } finally {
      if (job === nav.job) nav.running = false;
    }
  }

  function showMissing(target, reason) {
    clearHighlights();

    const actions = [];
    const siblings = getOtherVersions(target);

    // 화면에 표시된 다른 리롤 버전이 있으면 그쪽으로 이동할 수 있게 함 (자동 이동은 하지 않음)
    const shown = siblings.find((record) => findGroupElement(record.id)) || null;
    const alternative = shown || (target.kind === "bookmark" ? siblings[0] : null);

    if (alternative) {
      actions.push({
        label: shown ? "표시된 버전 보기" : "현재 응답 보기",
        handler: () =>
          navigateTo({
            kind: "plain",
            id: alternative.id,
            label: labelForRecord(alternative)
          })
      });
    }

    showMini("error", {
      title: target.kind === "bookmark"
        ? "북마크한 메시지를 찾을 수 없어요"
        : "메시지를 찾을 수 없어요",
      sub: shown
        ? "리롤로 다른 버전이 화면에 표시되어 있어요."
        : missingMessage(reason),
      actions
    });
  }

  function getOtherVersions(target) {
    const store = stores.get(currentChatId());
    if (!store) return [];

    const record = store.byId.get(target.id);
    const parentTurnId = record?.parentTurnId || target.parentTurnId;
    if (!parentTurnId || (record && record.role !== "assistant")) return [];

    return (store.repliesByParentTurn.get(parentTurnId) || []).filter(
      (reply) => reply.id !== target.id
    );
  }

  function revealMessage(element, target) {
    const ranges = target.query ? findRangesInElement(element, target.query) : [];
    const rangeIndex = ranges.length
      ? (target.landing === "last" ? ranges.length - 1 : 0)
      : -1;

    nav.context = { ...target, ranges, rangeIndex };

    applyContextHighlight();
    scrollToContext();
    flashElement(element);
    showNavigationMini();
  }

  function refreshContextRanges() {
    const context = nav.context;
    if (!context) return;

    const stale = context.ranges.some((range) => !range.startContainer.isConnected);
    if (!stale) return;

    const element = findGroupElement(context.id);
    context.ranges = element && context.query
      ? findRangesInElement(element, context.query)
      : [];
    context.rangeIndex = context.ranges.length
      ? clamp(context.rangeIndex, 0, context.ranges.length - 1)
      : -1;
  }

  function applyContextHighlight() {
    const context = nav.context;
    if (!context) return;

    refreshContextRanges();
    setHighlights(context.ranges, context.ranges[context.rangeIndex] || null);
  }

  function scrollToContext() {
    const context = nav.context;
    if (!context) return;

    const element = findGroupElement(context.id);
    if (!element) return;

    const container = findScrollContainer();
    const box = getViewportBox(container);
    const range = context.ranges[context.rangeIndex];

    let rect = range ? range.getBoundingClientRect() : null;
    let delta;

    if (rect && (rect.width || rect.height)) {
      delta = rect.top + rect.height / 2 - (box.top + box.height / 2);
    } else {
      rect = element.getBoundingClientRect();

      delta = rect.height > box.height * 0.8
        ? rect.top - (box.top + 72)
        : rect.top + rect.height / 2 - (box.top + box.height / 2);
    }

    setScrollTop(container, getScrollTop(container) + delta);
  }

  function stepOccurrence(direction) {
    const context = nav.context;
    if (!context || nav.running) return;

    refreshContextRanges();

    const nextIndex = context.rangeIndex + direction;

    if (context.ranges.length && nextIndex >= 0 && nextIndex < context.ranges.length) {
      context.rangeIndex = nextIndex;
      applyContextHighlight();
      scrollToContext();
      showNavigationMini();
      return;
    }

    if (context.kind !== "search") return;

    // 방향 -1 = 위(더 오래된 메시지), +1 = 아래(더 최근 메시지)
    const byTime = [...search.results].sort((a, b) => compareIds(a.id, b.id));
    const position = byTime.findIndex((result) => result.id === context.id);
    const neighbor = byTime[position + direction];

    if (!neighbor) {
      showToast(direction < 0 ? "첫 번째 검색 결과예요" : "마지막 검색 결과예요");
      return;
    }

    search.selectedId = neighbor.id;
    markSelectedResult();

    const { label } = describeResult(neighbor);

    navigateTo({
      kind: "search",
      id: neighbor.id,
      label,
      query: search.query,
      landing: direction < 0 ? "last" : "first"
    });
  }

  function flashElement(element) {
    if (!ui.flash) return;

    const flash = ui.flash;
    const startedAt = Date.now();
    let frame = null;

    const place = () => {
      frame = null;
      const rect = element.getBoundingClientRect();
      const top = Math.max(rect.top - 6, 0);
      const bottom = Math.min(rect.bottom + 6, window.innerHeight);

      if (!element.isConnected || bottom <= top) {
        flash.hidden = true;
        return;
      }

      Object.assign(flash.style, {
        left: `${Math.max(rect.left - 8, 0)}px`,
        top: `${top}px`,
        width: `${Math.min(rect.width + 16, window.innerWidth)}px`,
        height: `${bottom - top}px`
      });
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(place);
    };

    clearTimeout(flash._timer);
    clearTimeout(flash._fadeTimer);
    flash._cleanup?.();

    flash.classList.remove("is-fading");
    flash.hidden = false;
    place();

    document.addEventListener("scroll", onScroll, { capture: true, passive: true });

    flash._cleanup = () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      if (frame !== null) cancelAnimationFrame(frame);
      flash._cleanup = null;
    };

    flash._fadeTimer = setTimeout(() => flash.classList.add("is-fading"), 1400);
    flash._timer = setTimeout(() => {
      flash._cleanup?.();
      flash.hidden = true;
      flash.classList.remove("is-fading");
    }, Math.max(2200 - (Date.now() - startedAt), 0));
  }

  /* =========================================================
   * 북마크
   * ======================================================= */

  function bookmarkKey(chatId) {
    return BM_KEY_PREFIX + chatId;
  }

  function cleanString(value, max) {
    return typeof value === "string" ? value.slice(0, max) : "";
  }

  function cleanTime(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
  }

  function sanitizeBookmark(raw) {
    if (!raw || typeof raw !== "object") return null;

    const chatId = cleanString(raw.chatId, 64);
    const messageId = cleanString(raw.messageId, 64);

    if (!ID_RE.test(chatId) || !ID_RE.test(messageId)) return null;

    const createdAt = cleanTime(raw.createdAt) || Date.now();

    return {
      v: 1,
      chatId,
      storyId: cleanString(raw.storyId, 64) || null,
      messageId,
      turnId: cleanString(raw.turnId, 64) || null,
      parentTurnId: cleanString(raw.parentTurnId, 64) || null,
      role: raw.role === "user" || raw.role === "assistant" ? raw.role : null,
      turnLabel: cleanString(raw.turnLabel, 24) || null,
      title: cleanString(raw.title, 120),
      memo: cleanString(raw.memo, 2000),
      preview: cleanString(raw.preview, 400),
      createdAt,
      updatedAt: cleanTime(raw.updatedAt) || createdAt
    };
  }

  function readBookmarks(chatId) {
    if (!chatId) return [];

    const raw = storageGet(bookmarkKey(chatId), []);
    if (!Array.isArray(raw)) return [];

    const seen = new Set();
    const list = [];

    for (const item of raw) {
      const bookmark = sanitizeBookmark(item);
      if (!bookmark || bookmark.chatId !== chatId || seen.has(bookmark.messageId)) continue;
      seen.add(bookmark.messageId);
      list.push(bookmark);
    }

    return list;
  }

  function writeBookmarks(chatId, list) {
    const ok = storageSet(bookmarkKey(chatId), list);
    if (!ok) showToast("북마크를 저장하지 못했어요");
    return ok;
  }

  function bookmarkedIds() {
    return new Set(readBookmarks(currentChatId()).map((bookmark) => bookmark.messageId));
  }

  function buildBookmarkInfo(id, { preview = "" } = {}) {
    const record = getRecord(id);
    const group = findGroupElement(id);

    let flat = record?.flat || "";
    let label = record ? labelForRecord(record) : "";

    if ((!flat || !label) && group) {
      const parts = [];
      for (const block of group.querySelectorAll(".wrtn-markdown")) {
        for (const node of collectTextNodes(block)) parts.push(node.nodeValue);
      }

      const text = parts.join("\n");
      if (!flat) flat = text.replace(/\s+/g, " ").trim();

      if (!label) {
        const turn = parseTurnNumber(text);
        if (Number.isFinite(turn)) label = `T${turn}`;
      }
    }

    const finalPreview = preview || previewFromFlat(flat);

    return {
      messageId: id,
      turnId: record?.turnId || null,
      parentTurnId: record?.parentTurnId || null,
      role: record?.role || null,
      turnLabel: label || null,
      preview: finalPreview,
      title: defaultTitle(finalPreview)
    };
  }

  function addBookmark(id, options = {}) {
    const route = getRoute();
    if (!route || !ID_RE.test(id)) return null;

    const list = readBookmarks(route.chatId);
    const existing = list.find((bookmark) => bookmark.messageId === id);
    if (existing) return existing;

    const now = Date.now();

    const bookmark = sanitizeBookmark({
      chatId: route.chatId,
      storyId: route.storyId,
      ...buildBookmarkInfo(id, options),
      memo: "",
      createdAt: now,
      updatedAt: now
    });

    if (!bookmark) return null;

    list.push(bookmark);
    if (!writeBookmarks(route.chatId, list)) return null;

    refreshBookmarkViews();

    // 아직 API 데이터가 없으면 불러온 뒤 턴 정보와 대체 식별자(turnId)를 채움
    if (!bookmark.turnId) {
      const store = getStore(route.chatId);
      loadStore(store).then(() => enrichBookmark(route.chatId, id));
    }

    return bookmark;
  }

  function enrichBookmark(chatId, id) {
    if (currentChatId() !== chatId) return;

    const record = stores.get(chatId)?.byId.get(id);
    if (!record) return;

    const list = readBookmarks(chatId);
    const bookmark = list.find((item) => item.messageId === id);
    if (!bookmark || bookmark.turnId) return;

    bookmark.turnId = record.turnId;
    bookmark.parentTurnId = record.parentTurnId;
    bookmark.role = record.role;
    bookmark.turnLabel = bookmark.turnLabel || labelForRecord(record) || null;

    if (writeBookmarks(chatId, list)) refreshBookmarkViews();
  }

  function removeBookmark(id) {
    const chatId = currentChatId();
    const list = readBookmarks(chatId);
    const index = list.findIndex((bookmark) => bookmark.messageId === id);
    if (index < 0) return null;

    const [removed] = list.splice(index, 1);
    if (!writeBookmarks(chatId, list)) return null;

    refreshBookmarkViews();
    return removed;
  }

  function restoreBookmark(bookmark) {
    const chatId = currentChatId();
    if (!bookmark || bookmark.chatId !== chatId) return;

    const list = readBookmarks(chatId);
    if (list.some((item) => item.messageId === bookmark.messageId)) return;

    list.push(bookmark);
    writeBookmarks(chatId, list);
    refreshBookmarkViews();
  }

  function updateBookmark(id, changes) {
    const chatId = currentChatId();
    const list = readBookmarks(chatId);
    const bookmark = list.find((item) => item.messageId === id);
    if (!bookmark) return;

    Object.assign(bookmark, changes, { updatedAt: Date.now() });

    if (writeBookmarks(chatId, list.map(sanitizeBookmark).filter(Boolean))) {
      refreshBookmarkViews();
    }
  }

  function relocateBookmark(chatId, oldId, newId) {
    const list = readBookmarks(chatId);
    const bookmark = list.find((item) => item.messageId === oldId);
    if (!bookmark || list.some((item) => item.messageId === newId)) return;

    bookmark.messageId = newId;
    bookmark.updatedAt = Date.now();

    if (writeBookmarks(chatId, list)) {
      refreshBookmarkViews();
      showToast("수정된 메시지로 북마크 위치를 갱신했어요");
    }
  }

  function toggleBookmark(id, options = {}) {
    if (bookmarkedIds().has(id)) {
      const removed = removeBookmark(id);

      if (removed) {
        showToast("북마크를 지웠어요", {
          actionLabel: "되돌리기",
          onAction: () => restoreBookmark(removed)
        });
      }

      return false;
    }

    const bookmark = addBookmark(id, options);

    if (bookmark) {
      showToast("북마크에 저장했어요", {
        actionLabel: "이름 편집",
        onAction: () => {
          ui.editingBookmarkId = bookmark.messageId;
          openPanel("bookmarks");
        }
      });
    }

    return Boolean(bookmark);
  }

  /* =========================================================
   * 테마
   * ======================================================= */

  function parseRgb(value) {
    const match = String(value || "").match(/rgba?\(([^)]+)\)/);
    if (!match) return null;

    const [r, g, b, a = 1] = match[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);

    return { r, g, b, a };
  }

  function detectTheme() {
    try {
      for (const element of [document.body, document.documentElement]) {
        const color = parseRgb(getComputedStyle(element).backgroundColor);

        if (color && color.a > 0.5) {
          const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
          return luminance < 110 ? "dark" : "light";
        }
      }

      const cookieTheme = (document.cookie.match(/(?:^|;\s*)crack-user-theme=([^;]+)/) || [])[1];
      if (cookieTheme === "dark") return "dark";

      if (cookieTheme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch {
      // 기본값 사용
    }

    return "light";
  }

  function applyTheme() {
    const theme = detectTheme();

    for (const element of [ui.root, ui.mini, ui.toast, ui.hoverButton]) {
      if (element && element.dataset.ccsTheme !== theme) {
        element.dataset.ccsTheme = theme;
      }
    }
  }

  /* =========================================================
   * UI: 패널
   * ======================================================= */

  function iconButton(icon, label, onclick, extraClass = "") {
    return h("button", {
      type: "button",
      class: `ccs2-icon-btn ${extraClass}`.trim(),
      "aria-label": label,
      title: label,
      icon,
      onclick
    });
  }

  function createPanel() {
    ui.input = h("input", {
      type: "search",
      class: "ccs2-input",
      placeholder: "대화 내용 검색",
      autocomplete: "off",
      spellcheck: "false",
      enterkeyhint: "search",
      "aria-label": "대화 내용 검색"
    });

    const clearButton = iconButton("close", "검색어 지우기", () => {
      ui.input.value = "";
      ui.input.focus();
      startSearch("");
    });

    const searchBox = h(
      "div",
      { class: "ccs2-searchbox", onclick: (event) => {
        if (event.target === searchBox) ui.input.focus();
      } },
      h("span", { icon: "search", style: "display:inline-grid" }),
      ui.input,
      clearButton
    );

    ui.status = h("div", { class: "ccs2-status", role: "status", "aria-live": "polite" });

    ui.resultList = h("div", {
      class: "ccs2-list",
      role: "listbox",
      "aria-label": "검색 결과"
    });

    ui.listObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        if (search.renderLimit >= search.results.length) return;
        search.renderLimit += RENDER_STEP;
        renderResults();
      },
      { root: ui.resultList, rootMargin: "240px" }
    );

    const searchView = h(
      "div",
      { class: "ccs2-view", "data-view": "search" },
      searchBox,
      ui.status,
      ui.resultList,
      createAdvancedOptions()
    );

    ui.bookmarkCount = h("div", { class: "ccs2-bm-count" });

    ui.bookmarkSort = h(
      "select",
      { class: "ccs2-select", "aria-label": "북마크 정렬" },
      h("option", { value: "recent", text: "최근 저장순" }),
      h("option", { value: "chat", text: "대화 순서" })
    );

    ui.bookmarkSort.value = readPref(BM_SORT_KEY, "recent") === "chat" ? "chat" : "recent";
    ui.bookmarkSort.addEventListener("change", () => {
      writePref(BM_SORT_KEY, ui.bookmarkSort.value);
      renderBookmarks();
    });

    ui.bookmarkList = h("div", {
      class: "ccs2-list",
      role: "list",
      "aria-label": "북마크 목록"
    });

    const bookmarkView = h(
      "div",
      { class: "ccs2-view", "data-view": "bookmarks", hidden: true },
      h("div", { class: "ccs2-bm-toolbar" }, ui.bookmarkCount, ui.bookmarkSort),
      ui.bookmarkList
    );

    ui.views = { search: searchView, bookmarks: bookmarkView };

    ui.bookmarkTabCount = h("span", { class: "ccs2-tab-count" });

    ui.tabs = {
      search: h("button", {
        type: "button",
        class: "ccs2-tab",
        role: "tab",
        "aria-selected": "true",
        text: "검색",
        onclick: () => switchTab("search")
      }),
      bookmarks: h(
        "button",
        {
          type: "button",
          class: "ccs2-tab",
          role: "tab",
          "aria-selected": "false",
          onclick: () => switchTab("bookmarks")
        },
        "북마크",
        ui.bookmarkTabCount
      )
    };

    ui.root = h(
      "section",
      {
        id: "ccs2-root",
        role: "dialog",
        "aria-label": "대화 탐색",
        hidden: true
      },
      h(
        "div",
        { class: "ccs2-head" },
        h("h2", { class: "ccs2-title", text: "대화 탐색" }),
        iconButton("close", "닫기", () => closePanel())
      ),
      h("div", { class: "ccs2-tabs", role: "tablist" }, ui.tabs.search, ui.tabs.bookmarks),
      searchView,
      bookmarkView
    );

    bindPanelEvents();
    document.documentElement.appendChild(ui.root);
  }

  function createAdvancedOptions() {
    ui.scopeButtons = {
      api: h("button", {
        type: "button",
        text: "전체 대화",
        title: "Crack 서버에서 현재 채팅방의 모든 메시지를 불러와 검색",
        onclick: () => setScope("api")
      }),
      dom: h("button", {
        type: "button",
        text: "불러온 대화만",
        title: "현재 화면에 불러온 메시지에서만 검색 (1.x 방식)",
        onclick: () => setScope("dom")
      })
    };

    ui.oldestFirst = h("input", { type: "checkbox" });
    ui.oldestFirst.checked = isOldestFirst();
    ui.oldestFirst.addEventListener("change", () => {
      writePref(START_FROM_FIRST_KEY, ui.oldestFirst.checked);
      search.sortedCache = null;
      renderResults();
    });

    rangeSelect = h("select", { class: "ccs2-select", title: "불러올 로그 범위 선택" });

    for (const [value, label] of [
      ["full", "전체"],
      ["100", "최근 100T"],
      ["200", "최근 200T"],
      ["custom", "직접 지정…"]
    ]) {
      rangeSelect.append(h("option", { value, text: label }));
    }

    customTurnInput = h("input", {
      type: "number",
      class: "ccs2-number",
      min: "1",
      step: "1",
      value: "300",
      placeholder: "턴 수",
      title: "불러올 과거 턴 수",
      hidden: true
    });

    rangeSelect.addEventListener("change", updateCustomTurnInput);
    customTurnInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runSelectedLoad();
      }
    });

    loadButton = h("button", {
      type: "button",
      class: "ccs2-btn ccs2-btn-accent",
      text: "불러오기",
      title: "선택한 범위까지 과거 로그를 화면에 불러옵니다",
      onclick: runSelectedLoad
    });

    stopButton = h("button", {
      type: "button",
      class: "ccs2-btn",
      text: "중지",
      title: "자동 불러오기 중지",
      disabled: true,
      onclick: () => stopCurrentJob()
    });

    statusLabel = h("div", { class: "ccs2-legacy-status" });

    const details = h(
      "details",
      { class: "ccs2-advanced" },
      h("summary", { text: "고급 옵션" }),
      h(
        "div",
        { class: "ccs2-adv-body" },
        h(
          "div",
          {},
          h("div", { class: "ccs2-adv-label", text: "검색 범위" }),
          h("div", { class: "ccs2-seg" }, ui.scopeButtons.api, ui.scopeButtons.dom)
        ),
        h(
          "label",
          { class: "ccs2-check", title: "체크하면 가장 오래된 결과부터 보여줍니다" },
          ui.oldestFirst,
          h("span", { text: "오래된 결과부터 보기" })
        ),
        h(
          "div",
          {},
          h("div", { class: "ccs2-adv-label", text: "과거 로그 화면에 불러오기" }),
          h("div", { class: "ccs2-row" }, rangeSelect, customTurnInput, loadButton, stopButton)
        ),
        statusLabel,
        h(
          "div",
          { class: "ccs2-row" },
          h("button", {
            type: "button",
            class: "ccs2-btn",
            text: "대화 데이터 새로 고침",
            title: "검색용으로 불러온 대화 캐시를 지우고 다시 불러옵니다",
            onclick: () => {
              const chatId = currentChatId();
              if (!chatId) return;
              resetStore(getStore(chatId));
              if (search.query) startSearch(search.query, { force: true });
              showToast("검색용 대화 데이터를 다시 불러와요");
            }
          })
        )
      )
    );

    details.addEventListener("toggle", () => {
      if (details.open) setStatus(`현재 불러온 메시지 묶음 ${getMessageGroups().length}개`);
    });

    renderScopeButtons();
    return details;
  }

  function setScope(scope) {
    if (ui.scope === scope) return;

    ui.scope = scope;
    writePref(SCOPE_KEY, scope);
    renderScopeButtons();

    if (search.query) startSearch(search.query, { force: true });
    else renderSearch();
  }

  function renderScopeButtons() {
    for (const [scope, button] of Object.entries(ui.scopeButtons)) {
      button.setAttribute("aria-pressed", String(ui.scope === scope));
    }

    if (ui.input) {
      ui.input.placeholder = ui.scope === "dom"
        ? "불러온 대화에서 검색"
        : "대화 내용 검색";
    }
  }

  function bindPanelEvents() {
    const input = ui.input;

    input.addEventListener("compositionstart", () => {
      ui.composing = true;
    });

    input.addEventListener("compositionend", () => {
      ui.composing = false;
      scheduleAutoSearch();
    });

    input.addEventListener("input", () => {
      if (!ui.composing) scheduleAutoSearch();
    });

    input.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return;

      if (event.key === "Enter") {
        event.preventDefault();
        onSearchEnter(event.shiftKey);
      } else if (event.key === "ArrowDown") {
        const first = ui.resultList.querySelector(".ccs2-item");
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    ui.root.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return;

      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        closePanel();
      } else if (event.key === "Escape") {
        event.preventDefault();

        if (search.status === "searching") cancelSearch();
        else if (ui.editingBookmarkId) {
          ui.editingBookmarkId = null;
          renderBookmarks();
        } else closePanel();
      }

      // Crack 단축키가 패널 입력에 반응하지 않도록 함
      event.stopPropagation();
    });

    ui.resultList.addEventListener("scroll", () => {
      ui.listScrollTop = ui.resultList.scrollTop;
    }, { passive: true });

    ui.bookmarkList.addEventListener("scroll", () => {
      ui.bookmarkScrollTop = ui.bookmarkList.scrollTop;
    }, { passive: true });
  }

  function scheduleAutoSearch() {
    clearTimeout(ui.debounceTimer);

    const value = ui.input.value.trim();

    if (!value) {
      startSearch("");
      return;
    }

    ui.debounceTimer = setTimeout(() => startSearch(ui.input.value), SEARCH_DEBOUNCE);
  }

  function onSearchEnter(backward) {
    clearTimeout(ui.debounceTimer);

    const query = ui.input.value.replace(/\s+/g, " ").trim();

    const sameQuery =
      query === search.query &&
      search.chatId === currentChatId() &&
      search.scope === ui.scope;

    if (!sameQuery || search.status === "idle") {
      startSearch(query);
      return;
    }

    if (search.status === "error" || search.status === "cancelled") {
      if (!search.results.length) {
        startSearch(query, { force: true });
        return;
      }
    }

    const list = getSortedResults();
    if (!list.length) return;

    let index = list.findIndex((result) => result.id === search.selectedId);
    if (index < 0) index = backward ? list.length - 1 : 0;
    else index = (index + (backward ? -1 : 1) + list.length) % list.length;

    activateResult(list[index]);
  }

  function switchTab(tab) {
    if (ui.tab === "search") ui.listScrollTop = ui.resultList.scrollTop;
    else ui.bookmarkScrollTop = ui.bookmarkList.scrollTop;

    ui.tab = tab;

    for (const [name, button] of Object.entries(ui.tabs)) {
      button.setAttribute("aria-selected", String(name === tab));
    }

    for (const [name, view] of Object.entries(ui.views)) {
      view.hidden = name !== tab;
    }

    if (tab === "bookmarks") {
      renderBookmarks();
      ui.bookmarkList.scrollTop = ui.bookmarkScrollTop;
    } else {
      ui.resultList.scrollTop = ui.listScrollTop;
    }
  }

  function openPanel(tab = ui.tab) {
    if (!ensureUI()) return;

    applyTheme();
    stopLauncherTracking();

    ui.root.hidden = false;
    if (launcherButton) launcherButton.hidden = true;
    if (!nav.running) hideMini();

    switchTab(tab);
    renderSearch();

    if (tab === "search") {
      ui.resultList.scrollTop = ui.listScrollTop;
      ui.input.focus({ preventScroll: true });
      ui.input.select();
    }
  }

  function hidePanel() {
    if (!ui.root || ui.root.hidden) return;

    ui.listScrollTop = ui.resultList.scrollTop;
    ui.bookmarkScrollTop = ui.bookmarkList.scrollTop;
    ui.root.hidden = true;

    if (launcherButton && isEpisodePage()) {
      launcherButton.hidden = false;
      startLauncherTracking();
    }
  }

  function closePanel() {
    // 1.x 처럼 닫을 때 자동 불러오기는 멈춤 (검색 상태는 유지)
    stopCurrentJob({ silent: true });
    hidePanel();

    if (!nav.context && search.scope === "dom") clearHighlights();
  }

  function togglePanel() {
    if (ui.root && !ui.root.hidden) closePanel();
    else openPanel();
  }

  /* =========================================================
   * UI: 검색 결과
   * ======================================================= */

  function scheduleRender() {
    if (ui.renderTimer) return;

    ui.renderTimer = setTimeout(() => {
      ui.renderTimer = null;
      renderSearch();
    }, 120);
  }

  function renderSearch() {
    if (!ui.ready) return;

    clearTimeout(ui.renderTimer);
    ui.renderTimer = null;

    renderStatus();
    renderResults();
  }

  function renderStatus() {
    const status = ui.status;
    const count = search.results.length;

    const main = h("span", { class: "ccs2-status-main" });
    const side = h("span", { class: "ccs2-status-side" });

    const action = (label, handler) =>
      h("button", { type: "button", class: "ccs2-link-btn", text: label, onclick: handler });

    if (search.status === "idle") {
      main.textContent = ui.scope === "dom" ? "불러온 대화 검색" : "전체 대화 검색";
      side.textContent = "Enter로 검색";
    } else {
      main.textContent = `검색 결과 ${formatNumber(count)}개`;

      if (search.status === "searching") {
        side.append(
          h("span", { class: "ccs2-spinner", "aria-hidden": "true" }),
          `메시지 ${formatNumber(search.scanned)}개 확인 중`,
          action("취소", cancelSearch)
        );
      } else if (search.status === "done") {
        side.textContent = search.scope === "dom"
          ? `불러온 메시지 ${formatNumber(search.scanned)}개에서 찾음`
          : `전체 ${formatNumber(search.total ?? search.scanned)}개 메시지 검색 완료`;
      } else if (search.status === "cancelled") {
        side.append(
          `검색 중단 · ${formatNumber(search.scanned)}개까지 확인`,
          action("계속", () => startSearch(search.query, { force: true }))
        );
      } else if (search.status === "error") {
        side.classList.add("is-error");
        side.append(
          `${search.error} · 불러온 대화로 대체`,
          action("다시 시도", () => startSearch(search.query, { force: true }))
        );
      }
    }

    status.replaceChildren(main, side);
  }

  function renderResults() {
    if (!ui.ready) return;

    const list = ui.resultList;
    ui.listObserver.disconnect();

    if (search.status === "idle") {
      list.replaceChildren(
        h(
          "div",
          { class: "ccs2-empty" },
          h("strong", { text: "대화 내용을 검색해 보세요" }),
          ui.scope === "dom"
            ? "화면에 불러온 메시지에서 찾아요."
            : "오래된 대화도 화면에 불러오지 않고 찾을 수 있어요.",
          h("br"),
          "결과를 누르면 채팅창의 그 위치로 이동해요."
        )
      );
      return;
    }

    const items = getSortedResults();

    if (!items.length) {
      const message =
        search.status === "searching"
          ? "검색하는 중…"
          : search.status === "error"
            ? "불러온 대화에서도 결과를 찾지 못했어요."
            : `‘${search.query}’에 대한 결과가 없어요.`;

      list.replaceChildren(h("div", { class: "ccs2-empty", text: message }));
      return;
    }

    const selectedIndex = items.findIndex((item) => item.id === search.selectedId);
    if (selectedIndex >= search.renderLimit) {
      search.renderLimit = selectedIndex + RENDER_STEP;
    }

    const limit = Math.min(items.length, search.renderLimit);
    const saved = new Set(readBookmarks(search.chatId).map((bookmark) => bookmark.messageId));
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < limit; index += 1) {
      fragment.append(renderResultItem(items[index], saved));
    }

    let sentinel = null;

    if (limit < items.length) {
      sentinel = h("div", { class: "ccs2-sentinel" });
      fragment.append(sentinel);
    }

    const scrollTop = list.scrollTop;
    list.replaceChildren(fragment);
    list.scrollTop = scrollTop;

    if (sentinel) ui.listObserver.observe(sentinel);
  }

  function renderResultItem(result, savedIds) {
    const { flat, label, role } = describeResult(result);
    const isSaved = savedIds.has(result.id);

    const meta = h("div", { class: "ccs2-meta" });
    if (label) meta.append(h("span", { class: "ccs2-turn", text: label, title: labelHint(label) }));

    const roleText = roleLabel(role);
    if (roleText) {
      if (label) meta.append(h("span", { text: "·" }));
      meta.append(h("span", { text: roleText }));
    }

    if (result.count > 1) {
      meta.append(h("span", { class: "ccs2-meta-dim", text: `${result.count}회` }));
    }

    if (getOtherVersions({ id: result.id }).length) {
      meta.append(h("span", {
        class: "ccs2-meta-dim",
        text: "리롤 버전",
        title: "같은 턴에 다른 응답 버전이 있어요. Crack 화면에는 그중 하나만 표시돼요."
      }));
    }

    if (result.source === "dom" && search.scope === "api") {
      meta.append(h("span", { class: "ccs2-meta-dim", text: "화면" }));
    }

    const snippetElement = h("div", { class: "ccs2-snippet" });
    const snippet = buildSnippet(flat, search.needle);
    appendHighlighted(snippetElement, snippet, search.needle);

    const star = h("button", {
      type: "button",
      class: `ccs2-star${isSaved ? " is-on" : ""}`,
      "aria-pressed": String(isSaved),
      "aria-label": isSaved ? "북마크 해제" : "북마크",
      title: isSaved ? "북마크 해제" : "북마크",
      icon: "star",
      onclick: (event) => {
        event.stopPropagation();
        const previewText = `${snippet.prefix ? "…" : ""}${snippet.text}${snippet.suffix ? "…" : ""}`;
        toggleBookmark(result.id, { preview: previewText.slice(0, 300) });
      }
    });

    const item = h(
      "div",
      {
        class: `ccs2-item${result.id === search.selectedId ? " is-selected" : ""}`,
        role: "option",
        tabindex: "0",
        "aria-selected": String(result.id === search.selectedId),
        "data-id": result.id,
        onclick: () => activateResult(result)
      },
      h("div", { class: "ccs2-item-main" }, meta, snippetElement),
      star
    );

    item.addEventListener("keydown", (event) => {
      if (event.target !== item) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateResult(result);
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        const sibling = event.key === "ArrowDown"
          ? item.nextElementSibling
          : item.previousElementSibling;

        if (sibling?.classList.contains("ccs2-item")) sibling.focus();
        else if (event.key === "ArrowUp") ui.input.focus();
      }
    });

    return item;
  }

  function markSelectedResult() {
    if (!ui.ready) return;

    for (const item of ui.resultList.querySelectorAll(".ccs2-item")) {
      const selected = item.dataset.id === search.selectedId;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-selected", String(selected));

      if (selected) {
        const list = ui.resultList;
        const top = item.offsetTop;
        const bottom = top + item.offsetHeight;

        if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) {
          list.scrollTop = Math.max(top - list.clientHeight / 3, 0);
          ui.listScrollTop = list.scrollTop;
        }
      }
    }
  }

  function activateResult(result) {
    search.selectedId = result.id;
    markSelectedResult();

    const { label } = describeResult(result);

    navigateTo({
      kind: "search",
      id: result.id,
      label,
      query: search.query,
      landing: "first"
    });
  }

  /* =========================================================
   * UI: 북마크 목록
   * ======================================================= */

  function refreshBookmarkViews() {
    renderBookmarks();
    renderResults();
    updateHoverButtonState();
  }

  function renderBookmarks() {
    if (!ui.ready) return;

    const chatId = currentChatId();
    const bookmarks = readBookmarks(chatId);

    ui.bookmarkTabCount.textContent = bookmarks.length ? String(bookmarks.length) : "";
    ui.bookmarkCount.textContent = `🔖 저장한 메시지 ${formatNumber(bookmarks.length)}개`;

    if (ui.tab !== "bookmarks" && !ui.editingBookmarkId) return;

    const list = ui.bookmarkList;

    if (!bookmarks.length) {
      list.replaceChildren(
        h(
          "div",
          { class: "ccs2-empty" },
          h("strong", { text: "저장한 메시지가 없어요" }),
          "검색 결과의 ☆ 버튼이나, 채팅 메시지에 마우스를 올리면 나타나는 ☆ 버튼으로 저장할 수 있어요."
        )
      );
      return;
    }

    const sorted = [...bookmarks].sort((a, b) =>
      ui.bookmarkSort.value === "chat"
        ? compareIds(a.messageId, b.messageId)
        : b.createdAt - a.createdAt
    );

    // 편집 중인 입력란은 다시 만들지 않아 입력 내용이 사라지지 않게 함
    const liveEditor = list.querySelector(".ccs2-editor");
    const fragment = document.createDocumentFragment();
    let newEditor = null;

    for (const bookmark of sorted) {
      if (
        bookmark.messageId === ui.editingBookmarkId &&
        liveEditor?.dataset.id === bookmark.messageId
      ) {
        fragment.append(liveEditor);
        continue;
      }

      const node = renderBookmarkItem(bookmark);
      if (node.classList.contains("ccs2-editor")) newEditor = node;
      fragment.append(node);
    }

    const scrollTop = list.scrollTop;
    list.replaceChildren(fragment);
    list.scrollTop = scrollTop;

    newEditor?.querySelector(".ccs2-field")?.focus();
  }

  function bookmarkLabel(bookmark) {
    const record = getRecord(bookmark.messageId);
    return (record && labelForRecord(record)) || bookmark.turnLabel || "";
  }

  function renderBookmarkItem(bookmark) {
    if (ui.editingBookmarkId === bookmark.messageId) {
      return renderBookmarkEditor(bookmark);
    }

    const label = bookmarkLabel(bookmark);
    const subText = bookmark.memo || bookmark.preview || "";

    const sub = h("div", { class: "ccs2-bm-sub" });
    if (label) sub.append(h("span", { class: "ccs2-turn", text: label }), " · ");
    sub.append(subText);

    const go = () =>
      navigateTo({
        kind: "bookmark",
        id: bookmark.messageId,
        turnId: bookmark.turnId,
        parentTurnId: bookmark.parentTurnId,
        role: bookmark.role,
        label,
        title: bookmark.title || defaultTitle(bookmark.preview)
      });

    const item = h(
      "div",
      {
        class: "ccs2-item",
        role: "listitem",
        tabindex: "0",
        "data-id": bookmark.messageId,
        onclick: go
      },
      h("button", {
        type: "button",
        class: "ccs2-star is-on",
        "aria-label": "북마크 해제",
        title: "북마크 해제",
        icon: "star",
        onclick: (event) => {
          event.stopPropagation();
          toggleBookmark(bookmark.messageId);
        }
      }),
      h(
        "div",
        { class: "ccs2-item-main" },
        h("div", { class: "ccs2-bm-title", text: bookmark.title || defaultTitle(bookmark.preview) }),
        sub
      ),
      h("button", {
        type: "button",
        class: "ccs2-star",
        "aria-label": "제목·메모 편집",
        title: "제목·메모 편집",
        icon: "edit",
        onclick: (event) => {
          event.stopPropagation();
          ui.editingBookmarkId = bookmark.messageId;
          renderBookmarks();
        }
      })
    );

    item.addEventListener("keydown", (event) => {
      if (event.target !== item) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        go();
      }
    });

    return item;
  }

  function renderBookmarkEditor(bookmark) {
    const titleInput = h("input", {
      type: "text",
      class: "ccs2-field",
      maxlength: "120",
      placeholder: "제목 (선택)",
      "aria-label": "북마크 제목"
    });

    titleInput.value = bookmark.title;

    const memoInput = h("textarea", {
      class: "ccs2-field",
      maxlength: "2000",
      placeholder: "메모 (선택)",
      "aria-label": "북마크 메모"
    });

    memoInput.value = bookmark.memo;

    const save = () => {
      ui.editingBookmarkId = null;
      updateBookmark(bookmark.messageId, {
        title: titleInput.value.trim(),
        memo: memoInput.value.trim()
      });
    };

    const cancel = () => {
      ui.editingBookmarkId = null;
      renderBookmarks();
    };

    titleInput.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.key === "Enter") {
        event.preventDefault();
        save();
      }
    });

    const label = bookmarkLabel(bookmark);

    return h(
      "div",
      { class: "ccs2-editor", role: "listitem", "data-id": bookmark.messageId },
      h("div", {
        class: "ccs2-bm-sub",
        text: `${label ? `${label} · ` : ""}${bookmark.preview || ""}`
      }),
      titleInput,
      memoInput,
      h(
        "div",
        { class: "ccs2-editor-actions" },
        h("button", { type: "button", class: "ccs2-btn", text: "취소", onclick: cancel }),
        h("button", { type: "button", class: "ccs2-btn ccs2-btn-accent", text: "저장", onclick: save })
      )
    );
  }

  /* =========================================================
   * UI: 미니바 · 토스트
   * ======================================================= */

  function createFloatingElements() {
    ui.mini = h("div", { id: "ccs2-mini", role: "status", "aria-live": "polite", hidden: true });
    ui.toast = h("div", { id: "ccs2-toast", role: "status", "aria-live": "polite", hidden: true });
    ui.flash = h("div", { id: "ccs2-flash", hidden: true, "aria-hidden": "true" });

    ui.mini.addEventListener("keydown", (event) => event.stopPropagation());

    document.documentElement.append(ui.mini, ui.toast, ui.flash);
  }

  function showMini(mode, { title = "", sub = "", actions = [] } = {}) {
    if (!ui.mini) return;

    const mini = ui.mini;

    // 진행 상태는 글자만 바꿔 '이동 취소' 버튼이 다시 만들어지지 않게 함
    if (mode === "progress" && mini.dataset.mode === "progress" && !mini.hidden) {
      mini.querySelector(".ccs2-mini-title").textContent = title;
      mini.querySelector(".ccs2-mini-sub").textContent = sub;
      return;
    }

    applyTheme();

    mini.dataset.mode = mode;
    mini.className = mode === "error" ? "is-error" : "";

    const children = [];

    if (mode === "progress") {
      children.push(h("span", { class: "ccs2-spinner ccs2-mini-spin", "aria-hidden": "true" }));
    }

    children.push(
      h(
        "div",
        { class: "ccs2-mini-text" },
        h("span", { class: "ccs2-mini-title", text: title }),
        h("span", { class: "ccs2-mini-sub", text: sub, hidden: !sub && mode !== "progress" })
      )
    );

    if (mode === "progress") {
      children.push(
        h("button", {
          type: "button",
          class: "ccs2-btn",
          text: "이동 취소",
          onclick: () => cancelNavigation()
        })
      );
    } else {
      for (const action of actions) {
        children.push(
          h("button", { type: "button", class: "ccs2-btn ccs2-btn-accent", text: action.label, onclick: action.handler })
        );
      }

      children.push(
        iconButton("list", "목록으로 돌아가기", () => openPanel()),
        iconButton("close", "닫기", () => endNavigation())
      );
    }

    mini.replaceChildren(...children);
    mini.hidden = false;
  }

  function showNavigationMini() {
    const context = nav.context;
    if (!context) return;

    if (context.kind !== "search") {
      showMini("nav", {
        title: context.kind === "bookmark" ? `★ ${context.title || "북마크"}` : context.label || "이동했어요",
        sub: context.kind === "bookmark" && context.label ? context.label : ""
      });
      return;
    }

    const list = getSortedResults();
    const position = list.findIndex((result) => result.id === context.id);
    const occurrence = context.ranges.length > 1
      ? ` · ${context.rangeIndex + 1}/${context.ranges.length}번째`
      : "";

    const mini = ui.mini;
    mini.dataset.mode = "nav";
    mini.className = "";

    mini.replaceChildren(
      iconButton("up", "위쪽(이전) 결과", () => stepOccurrence(-1)),
      h("span", {
        class: "ccs2-mini-count",
        text: position >= 0 ? `${position + 1} / ${list.length}` : `- / ${list.length}`
      }),
      iconButton("down", "아래쪽(다음) 결과", () => stepOccurrence(1)),
      h(
        "div",
        { class: "ccs2-mini-text" },
        h("span", { class: "ccs2-mini-title", text: `“${search.query}”` }),
        h("span", { class: "ccs2-mini-sub", text: `${context.label || "메시지"}${occurrence}` })
      ),
      iconButton("list", "검색 결과로 돌아가기", () => openPanel("search")),
      iconButton("close", "검색 이동 끝내기", () => endNavigation())
    );

    applyTheme();
    mini.hidden = false;
  }

  function hideMini() {
    if (ui.mini) ui.mini.hidden = true;
  }

  function showToast(text, { actionLabel = "", onAction = null, duration = 3500 } = {}) {
    if (!ui.toast) return;

    applyTheme();
    clearTimeout(ui.toastTimer);

    const children = [h("span", { text })];

    if (actionLabel && onAction) {
      children.push(
        h("button", {
          type: "button",
          text: actionLabel,
          onclick: () => {
            ui.toast.hidden = true;
            onAction();
          }
        })
      );
    }

    ui.toast.replaceChildren(...children);
    ui.toast.hidden = false;
    ui.toastTimer = setTimeout(() => {
      ui.toast.hidden = true;
    }, duration);
  }

  /* =========================================================
   * 채팅 메시지 북마크 버튼 (메시지 DOM은 수정하지 않음)
   * ======================================================= */

  let hoverGroup = null;
  let hoverTopInset = null;
  let hoverHideTimer = null;
  let hoverFrame = null;

  // 스크롤 영역이 고정 헤더 뒤까지 이어져 있으므로, 대화가 실제로 보이기 시작하는
  // 높이를 화면 좌표로 한 번 측정함
  function measureChatTopInset(groupRect) {
    const container = findScrollContainer();
    const x = Math.round(groupRect.left + groupRect.width / 2);
    const start = isPageScroller(container)
      ? 0
      : Math.max(Math.round(container.getBoundingClientRect().top), 0);

    for (let y = start; y < Math.min(260, window.innerHeight / 2); y += 6) {
      const element = document.elementFromPoint(x, y);
      if (!element || isOwnElement(element)) continue;
      if (isPageScroller(container) ? element.closest(GROUP_SELECTOR) : container.contains(element)) {
        return y;
      }
    }

    return start;
  }

  function createHoverButton() {
    ui.hoverButton = h("button", {
      id: "ccs2-hover-bm",
      type: "button",
      hidden: true,
      icon: "star"
    });

    ui.hoverButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const id = getGroupId(hoverGroup);
      if (!id) return;

      toggleBookmark(id);
      updateHoverButtonState();
    });

    ui.hoverButton.addEventListener("pointerenter", () => clearTimeout(hoverHideTimer));
    ui.hoverButton.addEventListener("pointerleave", scheduleHoverHide);

    document.documentElement.appendChild(ui.hoverButton);

    document.addEventListener("pointerover", onHoverTarget, { passive: true });
    document.addEventListener("focusin", onHoverTarget);
    document.addEventListener("scroll", onAnyScroll, { capture: true, passive: true });
    window.addEventListener("resize", () => {
      hoverTopInset = null;
      onAnyScroll();
    }, { passive: true });
  }

  function onHoverTarget(event) {
    if (!ui.ready || !isEpisodePage()) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest("#ccs2-hover-bm")) {
      clearTimeout(hoverHideTimer);
      return;
    }

    if (target.closest("#ccs2-root, #ccs2-mini, #ccs2-toast")) return;

    const group = target.closest(GROUP_SELECTOR);

    if (group) {
      clearTimeout(hoverHideTimer);

      if (group !== hoverGroup) {
        hoverGroup = group;
        updateHoverButtonState();
      }

      positionHoverButton();
      ui.hoverButton.hidden = false;
    } else if (hoverGroup) {
      scheduleHoverHide();
    }
  }

  function scheduleHoverHide() {
    clearTimeout(hoverHideTimer);
    hoverHideTimer = setTimeout(hideHoverButton, 450);
  }

  function hideHoverButton() {
    clearTimeout(hoverHideTimer);
    hoverGroup = null;
    if (ui.hoverButton) ui.hoverButton.hidden = true;
  }

  function onAnyScroll() {
    if (!hoverGroup || hoverFrame !== null) return;

    hoverFrame = requestAnimationFrame(() => {
      hoverFrame = null;
      positionHoverButton();
    });
  }

  function positionHoverButton() {
    const button = ui.hoverButton;
    if (!button || !hoverGroup) return;

    if (!hoverGroup.isConnected) {
      hideHoverButton();
      return;
    }

    const rect = hoverGroup.getBoundingClientRect();
    const size = 30;

    if (hoverTopInset === null) hoverTopInset = measureChatTopInset(rect);

    // 채팅 헤더와 겹치지 않도록 대화가 보이는 영역 안쪽에만 표시함
    const minTop = hoverTopInset + 8;
    const maxTop = window.innerHeight - size - 8;

    if (rect.bottom < minTop + size || rect.top > maxTop) {
      button.style.visibility = "hidden";
      return;
    }

    const outside = rect.right + 10 + size <= window.innerWidth - 6;
    const left = outside ? rect.right + 10 : rect.right - size - 6;
    const top = clamp(rect.top + 8, minTop, Math.min(rect.bottom - size - 4, maxTop));

    button.style.visibility = "";
    button.style.left = `${Math.round(left)}px`;
    button.style.top = `${Math.round(top)}px`;
  }

  function updateHoverButtonState() {
    const button = ui.hoverButton;
    if (!button) return;

    const id = getGroupId(hoverGroup);
    const saved = Boolean(id) && bookmarkedIds().has(id);

    button.classList.toggle("is-on", saved);
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", saved ? "이 메시지 북마크 해제" : "이 메시지 북마크");
    button.title = saved ? "북마크 해제" : "이 메시지 북마크";
  }

  /* =========================================================
   * 과거 로그 불러오기 (1.x 기능 유지)
   * ======================================================= */

  let statusLabel;
  let rangeSelect;
  let customTurnInput;
  let loadButton;
  let stopButton;
  let launcherButton;
  let launcherObserver = null;
  let launcherPlacementFrame = null;

  let activeJob = 0;
  let loadingHistory = false;

  function setStatus(text) {
    if (statusLabel) statusLabel.textContent = text;
  }

  function formatLoadStatus({ mode, distance, currentCount, newestTurn, oldestTurn }) {
    if (mode === "full") {
      return `전체 로그 불러오는 중… 현재 ${currentCount}개`;
    }

    if (Number.isFinite(newestTurn) && Number.isFinite(oldestTurn)) {
      const loadedDistance = Math.max(0, newestTurn - oldestTurn);

      return (
        `${distance}T 이전까지 불러오는 중… ` +
        `${Math.min(loadedDistance, distance)} / ${distance}T`
      );
    }

    const loadedDistance = Math.max(0, currentCount - 1);

    return (
      `${distance}T 이전까지 불러오는 중… ` +
      `${Math.min(loadedDistance, distance)} / ${distance}T`
    );
  }

  async function loadHistory(mode, distance = null) {
    if (loadingHistory) return;

    // 메시지 이동과 동시에 스크롤하지 않도록 함
    cancelNavigation({ silent: true });
    if (!nav.context) hideMini();

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

    const targetGroupCount = mode === "range" ? distance + 1 : null;

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
          !Number.isFinite(targetTurn) && countBefore >= targetGroupCount;

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
          !Number.isFinite(targetTurn) && currentCount >= targetGroupCount;

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
      setStatus(`불러오기 중지 · 현재 ${getMessageGroups().length}개`);
      return;
    }

    if (rounds >= 500 && !completed) {
      setStatus(`안전을 위해 중단 · 현재 ${getMessageGroups().length}개`);
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

  function stopCurrentJob({ silent = false } = {}) {
    const wasLoading = loadingHistory;

    activeJob += 1;
    loadingHistory = false;

    if (loadButton) loadButton.disabled = false;
    if (rangeSelect) rangeSelect.disabled = false;
    if (stopButton) stopButton.disabled = true;

    if (wasLoading && !silent) {
      setStatus(`작업 중지 · 현재 ${getMessageGroups().length}개`);
    } else if (wasLoading) {
      setStatus(`불러오기 중지 · 현재 ${getMessageGroups().length}개`);
    }
  }

  function updateCustomTurnInput() {
    if (!rangeSelect || !customTurnInput) return;

    const isCustom = rangeSelect.value === "custom";
    customTurnInput.hidden = !isCustom;

    if (isCustom) {
      setStatus("원하는 턴 수를 입력한 뒤 불러오기를 누르세요");

      requestAnimationFrame(() => {
        customTurnInput.focus();
        customTurnInput.select();
      });
    }
  }

  function getSelectedLoadRequest() {
    const value = rangeSelect.value;

    if (value === "full") {
      return { mode: "full", distance: null };
    }

    if (value === "custom") {
      const distance = Number.parseInt(customTurnInput.value.trim(), 10);

      if (!Number.isFinite(distance) || distance < 1) {
        setStatus("1 이상의 턴 수를 입력하세요");
        customTurnInput.focus();
        customTurnInput.select();
        return null;
      }

      return { mode: "range", distance };
    }

    return { mode: "range", distance: Number(value) };
  }

  function runSelectedLoad() {
    const request = getSelectedLoadRequest();
    if (!request) return;

    loadHistory(request.mode, request.distance);
  }

  /* =========================================================
   * 전송 버튼 옆 돋보기 버튼 (1.x 배치 로직 유지)
   * ======================================================= */

  function isOwnElement(element) {
    return Boolean(
      element?.closest?.("#ccs2-root, #ccs2-mini, #ccs2-toast, #ccs2-hover-bm")
    );
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
      ...document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]')
    ]
      .filter((element) => !isOwnElement(element))
      .filter(isVisibleElement)
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.top > window.innerHeight * 0.42)
      .sort((a, b) => b.rect.bottom - a.rect.bottom);

    return candidates[0]?.element || null;
  }

  function findComposerContainer(editable) {
    if (!editable) return null;

    let element = editable.parentElement;

    for (let depth = 0; element && depth < 7; depth += 1) {
      const rect = element.getBoundingClientRect();

      const buttonCount = element.querySelectorAll(
        'button, [role="button"], input[type="button"], input[type="submit"]'
      ).length;

      if (buttonCount > 0 && rect.width >= 240 && rect.bottom > window.innerHeight * 0.7) {
        return element;
      }

      element = element.parentElement;
    }

    return null;
  }

  function findSendButton() {
    const editable = findComposerEditable();
    const container = findComposerContainer(editable) || document;

    const containerRect =
      container === document ? null : container.getBoundingClientRect();

    if (container !== document) {
      const actionRows = [
        ...container.querySelectorAll(".flex.items-center.justify-between")
      ].filter(isVisibleElement);

      for (const actionRow of actionRows) {
        const hasLeftToolbar = [...actionRow.children].some((child) =>
          child.matches(".flex.items-center.space-x-2")
        );

        if (!hasLeftToolbar) continue;

        const directButtons = [...actionRow.children]
          .filter((child) => child !== launcherButton)
          .filter((child) => child.matches("button"))
          .filter(isVisibleElement);

        const primaryButton = directButtons.find(
          (button) =>
            button.classList.contains("bg-primary") &&
            button.classList.contains("rounded-full")
        );

        if (primaryButton) return primaryButton;

        if (directButtons.length) {
          return directButtons[directButtons.length - 1];
        }
      }
    }

    const candidates = [
      ...container.querySelectorAll(
        'button, [role="button"], input[type="button"], input[type="submit"]'
      )
    ]
      .filter((button) => button !== launcherButton)
      .filter((button) => !isOwnElement(button))
      .filter(isVisibleElement)
      .map((button) => {
        const rect = button.getBoundingClientRect();
        const label = getButtonLabel(button);

        let score = 0;

        if (/전송|보내기|메시지\s*전송|send/.test(label)) score += 100;
        if (button.matches('button[type="submit"], input[type="submit"]')) score += 35;
        if (rect.bottom > window.innerHeight * 0.72) score += 15;
        if (rect.left > window.innerWidth * 0.55) score += 10;

        if (containerRect) {
          const distanceFromRight = containerRect.right - rect.right;
          const distanceFromBottom = containerRect.bottom - rect.bottom;

          if (distanceFromRight >= -8 && distanceFromRight <= 96) score += 30;
          if (distanceFromBottom >= -8 && distanceFromBottom <= 96) score += 30;
        }

        if (editable) {
          const editableRect = editable.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const editableCenterY = editableRect.top + editableRect.height / 2;

          if (Math.abs(centerY - editableCenterY) < 60) score += 20;
        }

        return { button, rect, score };
      })
      .filter(({ rect }) => rect.width <= 96 && rect.height <= 96)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.rect.right - a.rect.right;
      });

    return candidates[0]?.button || null;
  }

  function findLauncherSlot(sendButton) {
    const container = sendButton.parentElement;
    if (!container) return null;

    const siblings = [...container.children].filter(
      (element) => element !== launcherButton
    );

    const sendIndex = siblings.indexOf(sendButton);
    let anchor = sendButton;

    for (let index = sendIndex - 1; index >= 0; index -= 1) {
      const element = siblings[index];
      const rect = element.getBoundingClientRect();

      const isButtonLike =
        element.matches('button, [role="button"], input[type="button"], input[type="submit"]') ||
        Boolean(
          element.querySelector('button, [role="button"], input[type="button"], input[type="submit"]')
        );

      if (!isButtonLike || !isVisibleElement(element) || rect.width > 72 || rect.height > 72) {
        break;
      }

      anchor = element;
    }

    return { container, anchor };
  }

  function placeLauncherBesideSendButton() {
    if (!launcherButton || launcherButton.hidden) return;

    const sendButton = findSendButton();

    if (!sendButton) {
      if (launcherButton.parentElement !== document.documentElement) {
        document.documentElement.appendChild(launcherButton);
      }

      launcherButton.classList.add("ccs2-launcher-fallback");
      return;
    }

    const slot = findLauncherSlot(sendButton);
    if (!slot) return;

    launcherButton.classList.remove("ccs2-launcher-fallback");

    const slotStyle = getComputedStyle(slot.container);
    const slotGap = Number.parseFloat(slotStyle.columnGap || slotStyle.gap) || 0;

    launcherButton.style.marginRight = slotGap > 0 ? "0px" : "8px";

    const alreadyBeforeSend =
      launcherButton.parentElement === slot.container &&
      Boolean(
        launcherButton.compareDocumentPosition(sendButton) &
        Node.DOCUMENT_POSITION_FOLLOWING
      );

    // 이미 전송 버튼 쪽에 붙어 있으면 다시 옮기지 않음 (관찰자 반복 방지)
    if (alreadyBeforeSend && isLauncherSnug()) return;

    launcherButton.style.marginLeft = "";
    slot.container.insertBefore(launcherButton, slot.anchor);
    snugLauncher(sendButton);
  }

  function nextVisibleSibling(element) {
    let next = element.nextElementSibling;

    while (next && next.getBoundingClientRect().width === 0) {
      next = next.nextElementSibling;
    }

    return next;
  }

  function isLauncherSnug() {
    const next = nextVisibleSibling(launcherButton);
    if (!next) return true;

    const gap = next.getBoundingClientRect().left - launcherButton.getBoundingClientRect().right;
    return gap <= 16;
  }

  // 오른쪽 묶음의 첫 요소에도 margin-left: auto가 있으면 돋보기가 빈 공간 가운데에
  // 떠 보이므로, 그 요소 뒤로 옮겨 전송 버튼 묶음에 바로 붙임
  function snugLauncher(sendButton) {
    for (let step = 0; step < 6 && !isLauncherSnug(); step += 1) {
      const next = nextVisibleSibling(launcherButton);
      if (!next || next === sendButton) break;

      launcherButton.style.marginLeft = "0px";
      next.after(launcherButton);
    }
  }

  function startLauncherTracking() {
    stopLauncherTracking();
    placeLauncherBesideSendButton();

    launcherObserver = new MutationObserver((mutations) => {
      if (
        launcherButton?.isConnected &&
        !launcherButton.classList.contains("ccs2-launcher-fallback")
      ) {
        const rowChanged = mutations.some(
          (mutation) => mutation.target === launcherButton.parentElement
        );

        if (!rowChanged) return;
      }

      if (launcherPlacementFrame !== null) return;

      launcherPlacementFrame = window.requestAnimationFrame(() => {
        launcherPlacementFrame = null;
        placeLauncherBesideSendButton();
      });
    });

    launcherObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function stopLauncherTracking() {
    if (launcherObserver) {
      launcherObserver.disconnect();
      launcherObserver = null;
    }

    if (launcherPlacementFrame !== null) {
      window.cancelAnimationFrame(launcherPlacementFrame);
      launcherPlacementFrame = null;
    }
  }

  function createLauncher() {
    if (launcherButton) return;

    launcherButton = h("button", {
      id: "ccs2-launcher",
      type: "button",
      class:
        "relative inline-flex items-center justify-center rounded-full " +
        "border border-border bg-card text-line-gray-1 hover:bg-secondary " +
        "p-0 size-7 transition-colors",
      "aria-label": "대화 탐색 열기",
      title: "대화 탐색 열기 (Alt+Shift+F)",
      icon: "search",
      hidden: true
    });

    launcherButton.addEventListener("click", () => openPanel());
    document.documentElement.appendChild(launcherButton);
  }

  /* =========================================================
   * 설치 · 채팅방 전환
   * ======================================================= */

  let lastChatId = null;
  let routeWaitStartedAt = 0;
  let themeTick = 0;

  function injectStyles() {
    if (typeof GM_addStyle === "function") {
      GM_addStyle(STYLE);
      return;
    }

    const style = document.createElement("style");
    style.id = "ccs2-style";
    style.textContent = STYLE;
    (document.head || document.documentElement).appendChild(style);
  }

  function ensureUI() {
    if (ui.ready) return true;
    if (!isEpisodePage()) return false;

    // 다른 사본이 이미 설치된 경우 중복 생성하지 않음
    if (document.getElementById("ccs2-root")) return false;

    injectStyles();
    createPanel();
    createFloatingElements();
    createHoverButton();
    createLauncher();

    ui.ready = true;
    applyTheme();
    renderSearch();
    renderBookmarks();
    setStatus(`현재 불러온 메시지 묶음 ${getMessageGroups().length}개`);

    return true;
  }

  function resetForChat() {
    cancelNavigation({ silent: true });
    nav.context = null;
    stopCurrentJob({ silent: true });
    detachSearch();
    search.job += 1;
    clearTimeout(ui.debounceTimer);
    clearHighlights();
    hideMini();
    hideHoverButton();
    hoverTopInset = null;

    Object.assign(search, {
      chatId: currentChatId(),
      query: "",
      needle: "",
      status: "idle",
      results: [],
      resultIds: new Set(),
      scanned: 0,
      total: null,
      error: null,
      selectedId: null,
      renderLimit: RENDER_STEP,
      store: null,
      sortedCache: null
    });

    ui.editingBookmarkId = null;
    ui.listScrollTop = 0;
    ui.bookmarkScrollTop = 0;

    if (ui.ready) {
      ui.input.value = "";
      renderSearch();
      renderBookmarks();
      setStatus(`현재 불러온 메시지 묶음 ${getMessageGroups().length}개`);
    }
  }

  function onChatChanged(route) {
    dropOtherStores(route?.chatId || null);
    resetForChat();

    if (!route) {
      if (ui.root) ui.root.hidden = true;
      if (launcherButton) launcherButton.hidden = true;
      stopLauncherTracking();
      return;
    }

    routeWaitStartedAt = Date.now();

    if (ui.ready) {
      hidePanel();
      if (launcherButton) {
        launcherButton.hidden = false;
        startLauncherTracking();
      }
    }
  }

  function checkRoute() {
    const route = getRoute();
    const chatId = route?.chatId || null;

    if (chatId !== lastChatId) {
      lastChatId = chatId;
      onChatChanged(route);
    }

    if (!route) return;

    if (!ui.ready) {
      // 1.x 처럼 메시지가 나타난 뒤 버튼을 배치함 (최대 15초 대기)
      const hasMessages = Boolean(document.querySelector(GROUP_SELECTOR));
      const waited = Date.now() - routeWaitStartedAt > 15000;

      if ((hasMessages || waited) && ensureUI()) {
        launcherButton.hidden = false;
        startLauncherTracking();
      }

      return;
    }

    themeTick += 1;
    if (themeTick % 5 === 0) applyTheme();
  }

  document.addEventListener("keydown", (event) => {
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === "f") {
      if (!isEpisodePage()) return;
      event.preventDefault();
      togglePanel();
      return;
    }

    if (event.key !== "Escape" || isOwnElement(event.target)) return;

    if (nav.running) {
      cancelNavigation();
      return;
    }

    // 패널 밖에 포커스가 있어도 Esc로 닫되, Crack 입력창의 Esc는 건드리지 않음
    const target = event.target;
    const editing =
      target instanceof Element &&
      Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'));

    if (ui.root && !ui.root.hidden && !editing) {
      if (search.status === "searching") cancelSearch();
      else closePanel();
    }
  });

  routeWaitStartedAt = Date.now();
  checkRoute();
  setInterval(checkRoute, 600);
})();
