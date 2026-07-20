const FAVORITES_KEY = "aromaFavoritesV22";

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
