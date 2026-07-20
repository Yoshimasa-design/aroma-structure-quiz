const FAVORITES_KEY = "aromaFavoritesV22";
const STATS_KEY = "aromaStatsV23";
const LEGACY_STATS_KEY = "aromaStatsV21";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`保存データを読み込めませんでした: ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFavorites() {
  const values = readJson(FAVORITES_KEY, []);
  return Array.isArray(values) ? values.filter(id => typeof id === "string") : [];
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function setFavorite(id, enabled) {
  const favorites = new Set(getFavorites());
  enabled ? favorites.add(id) : favorites.delete(id);
  const next = [...favorites];
  writeJson(FAVORITES_KEY, next);
  window.dispatchEvent(new CustomEvent("aroma:favorites-changed", { detail: { id, enabled, favorites: next } }));
  return enabled;
}

export function toggleFavorite(id) {
  return setFavorite(id, !isFavorite(id));
}

export function favoriteButtonLabel(enabled) {
  return enabled ? "お気に入りから外す" : "お気に入りに追加";
}

export function favoriteButtonMarkup(id, className = "favorite-button") {
  const enabled = isFavorite(id);
  return `<button type="button" class="${className}${enabled ? " active" : ""}" data-favorite-id="${id}" aria-pressed="${enabled}" aria-label="${favoriteButtonLabel(enabled)}" title="${favoriteButtonLabel(enabled)}"><span aria-hidden="true">${enabled ? "★" : "☆"}</span><span class="favorite-text">${enabled ? "お気に入り登録済み" : "お気に入りに追加"}</span></button>`;
}

export function bindFavoriteButtons(root = document, onChange = null) {
  root.querySelectorAll("[data-favorite-id]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const id = button.dataset.favoriteId;
      const enabled = toggleFavorite(id);
      updateFavoriteButtons(id, enabled);
      if (onChange) onChange(id, enabled);
    });
  });
}

export function updateFavoriteButtons(id, enabled = isFavorite(id), root = document) {
  root.querySelectorAll(`[data-favorite-id="${CSS.escape(id)}"]`).forEach(button => {
    button.classList.toggle("active", enabled);
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", favoriteButtonLabel(enabled));
    button.title = favoriteButtonLabel(enabled);
    const icon = button.querySelector("span[aria-hidden='true']");
    if (icon) icon.textContent = enabled ? "★" : "☆";
    const text = button.querySelector(".favorite-text");
    if (text) text.textContent = enabled ? "お気に入り登録済み" : "お気に入りに追加";
  });
}

function normalizeRecord(record = {}) {
  return {
    correct: Number(record.correct) || 0,
    wrong: Number(record.wrong) || 0,
    learned: Number(record.learned) || 0,
    lastStudied: typeof record.lastStudied === "string" ? record.lastStudied : null,
    modes: record.modes && typeof record.modes === "object" ? record.modes : {}
  };
}

export function getLearningStats() {
  let stats = readJson(STATS_KEY, null);
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) {
    const legacy = readJson(LEGACY_STATS_KEY, {});
    stats = Object.fromEntries(Object.entries(legacy).map(([id, record]) => [id, normalizeRecord(record)]));
    writeJson(STATS_KEY, stats);
  }
  return Object.fromEntries(Object.entries(stats).map(([id, record]) => [id, normalizeRecord(record)]));
}

export function saveLearningStats(stats) {
  writeJson(STATS_KEY, stats);
}

export function recordAnswer(id, correct, mode = "quiz") {
  const stats = getLearningStats();
  const record = normalizeRecord(stats[id]);
  correct ? record.correct++ : record.wrong++;
  if (mode === "learn" && correct) record.learned++;
  record.lastStudied = new Date().toISOString();
  const modeRecord = record.modes[mode] || { correct: 0, wrong: 0 };
  correct ? modeRecord.correct++ : modeRecord.wrong++;
  record.modes[mode] = modeRecord;
  stats[id] = record;
  saveLearningStats(stats);
  return record;
}

export function getCompoundStats(id) {
  return normalizeRecord(getLearningStats()[id]);
}

export function getWeakCompoundIds({ minimumAttempts = 1, maximumAccuracy = 69 } = {}) {
  const stats = getLearningStats();
  return Object.entries(stats)
    .filter(([, record]) => {
      const attempts = record.correct + record.wrong;
      const accuracy = attempts ? record.correct / attempts * 100 : 100;
      return attempts >= minimumAttempts && accuracy <= maximumAccuracy;
    })
    .sort((a, b) => {
      const aa = a[1].correct / Math.max(1, a[1].correct + a[1].wrong);
      const ba = b[1].correct / Math.max(1, b[1].correct + b[1].wrong);
      return aa - ba || b[1].wrong - a[1].wrong;
    })
    .map(([id]) => id);
}

export function getIncorrectCompoundIds() {
  return Object.entries(getLearningStats())
    .filter(([, record]) => record.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .map(([id]) => id);
}

export function clearLearningData() {
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(LEGACY_STATS_KEY);
  localStorage.removeItem("aromaSessionsV21");
}
