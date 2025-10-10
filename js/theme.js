class ThemeUI {
  static TOGGLE_BUTTON_ID = "themeToggle";
  static ICON_ELEMENT_ID = "themeIcon";
  static LIGHT_ICON_CLASS = "fa fs-5 fa-moon";
  static DARK_ICON_CLASS = "fa fs-5 fa-sun";
  static EVENT_CLICK = "click";
  static ELEMENT_BUTTON = "button";
  static ELEMENT_ICON = "i";
  static ELEMENT_SPAN = "span";
  static ELEMENT_LIST_ITEM = "li";
  static TOGGLE_BUTTON_CLASSES =
    "btn theme-toggle btn-link py-lg-2 py-3 bg-transparent border-0 text-muted d-flex align-items-center text-decoration-none p-2";
  static ATTRIBUTE_ARIA_LABEL = "aria-label";
  static ATTRIBUTE_TITLE = "title";
  static ATTRIBUTE_TYPE = "type";
  static LABEL_CHANGE_THEME = "Cambiar Tema";
  static TITLE_CHANGE_THEME = "Cambiar tema claro/oscuro";
  static SPAN_CLASSES = "ms-2 d-lg-none";

  constructor({ containerSelector, wrapper, onClick }) {
    this.createToggle(containerSelector, wrapper);
    this.bindEvents(onClick);
  }

  createToggle(containerSelector, wrapper) {
    if (document.getElementById(ThemeUI.TOGGLE_BUTTON_ID)) {
      return;
    }

    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error(`ThemeUI: Container "${containerSelector}" no encontrado.`);
      return;
    }

    const buttonHTML = `
      <button id="${ThemeUI.TOGGLE_BUTTON_ID}" class="${ThemeUI.TOGGLE_BUTTON_CLASSES}"
              type="${ThemeUI.ELEMENT_BUTTON}"
              aria-label="${ThemeUI.LABEL_CHANGE_THEME}"
              title="${ThemeUI.TITLE_CHANGE_THEME}">
        <i id="${ThemeUI.ICON_ELEMENT_ID}"></i>
        <span class="${ThemeUI.SPAN_CLASSES}">${ThemeUI.LABEL_CHANGE_THEME}</span>
      </button>
    `;

    if (wrapper?.tag) {
      const wrapperElement = document.createElement(wrapper.tag);
      if (wrapper?.classes) {
        wrapperElement.className = wrapper.classes;
      }
      wrapperElement.innerHTML = buttonHTML;
      container.appendChild(wrapperElement);
    } else {
      container.innerHTML += buttonHTML;
    }

    this.themeToggleElement = document.getElementById(ThemeUI.TOGGLE_BUTTON_ID);
    this.themeIconElement = document.getElementById(ThemeUI.ICON_ELEMENT_ID);
  }

  bindEvents(callback) {
    if (this.themeToggleElement) {
      this.themeToggleElement.addEventListener(ThemeUI.EVENT_CLICK, callback);
    }
  }

  updateIcon(theme) {
    if (this.themeIconElement) {
      this.themeIconElement.className =
        theme === ThemeManager.DEFAULT_THEME
          ? ThemeUI.LIGHT_ICON_CLASS
          : ThemeUI.DARK_ICON_CLASS;
    }
  }
}

class ThemeManager {
  static KEY_THEME = "bsTheme";
  static DEFAULT_THEME = "light";
  static DARK_THEME = "dark";
  static DATA_THEME_ATTRIBUTE = "data-bs-theme";

  constructor() {
    this.currentTheme = this.getStoredTheme() || ThemeManager.DEFAULT_THEME;
    this.ui = new ThemeUI({
      containerSelector: ".navbar-nav",
      wrapper: {
        tag: "li",
        classes: "ms-lg-3",
      },
      onClick: this.toggleTheme.bind(this),
    });
    this.applyTheme(this.currentTheme);
  }

  getStoredTheme() {
    return localStorage.getItem(ThemeManager.KEY_THEME);
  }

  toggleTheme() {
    const newTheme =
      this.currentTheme === ThemeManager.DEFAULT_THEME
        ? ThemeManager.DARK_THEME
        : ThemeManager.DEFAULT_THEME;
    this.applyTheme(newTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute(
      ThemeManager.DATA_THEME_ATTRIBUTE,
      theme
    );
    localStorage.setItem(ThemeManager.KEY_THEME, theme);
    this.currentTheme = theme;
    this.ui.updateIcon(theme);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
});
