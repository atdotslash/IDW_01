import { PAGES } from "./shared/constants.js";

const BUTTON_TEMPLATE_ID = "theme-toggle-button-template";

class ThemeUI {
	static TOGGLE_BUTTON_ID = "themeToggle";
	static ICON_ELEMENT_ID = "themeIcon";
	static LIGHT_ICON_CLASS = "fa fs-5  fa-moon";
	static DARK_ICON_CLASS = "fa  fs-5  fa-sun";
	static SPAN_CLASSES = "";

	constructor({ containerSelector, wrapper, onClick, showSpan = true }) {
		this.createToggle(containerSelector, wrapper);
		this.bindEvents(onClick);
		this.showSpan = showSpan;
	}

	createToggle(containerSelector, wrapper) {
		const template = document.getElementById(BUTTON_TEMPLATE_ID);
		if (!template) {
			console.error(
				`ThemeUI: Template con ID "${BUTTON_TEMPLATE_ID}" no encontrado.`,
			);
			return;
		}

		const buttonElement = template.content.firstElementChild.cloneNode(true);
		buttonElement.id = ThemeUI.TOGGLE_BUTTON_ID;
		const iconElement = buttonElement.querySelector("i");
		iconElement.id = ThemeUI.ICON_ELEMENT_ID;

		const container = document.querySelector(containerSelector);
		if (!container) {
			console.error(`ThemeUI: Container "${containerSelector}" no encontrado.`);
			return;
		}

		if (wrapper?.tag) {
			const wrapperElement = document.createElement(wrapper.tag);
			if (wrapper?.classes) {
				wrapperElement.className = wrapper.classes;
			}
			wrapperElement.appendChild(buttonElement);
			container.appendChild(wrapperElement);
		} else {
			container.insertAdjacentElement("beforeend", buttonElement);
		}

		this.themeToggleElement = buttonElement;
		this.themeIconElement = iconElement;
	}

	bindEvents(callback) {
		if (this.themeToggleElement) {
			this.themeToggleElement.addEventListener("click", callback);
		}
	}

	updateIcon(isLightTheme) {
		if (this.themeIconElement) {
			this.themeIconElement.className = isLightTheme
				? ThemeUI.LIGHT_ICON_CLASS
				: ThemeUI.DARK_ICON_CLASS;
		}
	}

	updateLabel(isLightTheme) {
		if (this.themeToggleElement) {
			const span = this.themeToggleElement.querySelector("span");
			if (span) {
				span.textContent = isLightTheme ? "Modo Oscuro" : "Modo Claro";
				span.classList.toggle("d-lg-none", !this.showSpan);
			}
		}
	}
}

class ThemeManager {
	static KEY_THEME = "bsTheme";
	static DEFAULT_THEME = "light";
	static DARK_THEME = "dark";
	static DATA_THEME_ATTRIBUTE = "data-bs-theme";

	constructor({
		selector = ".navbar-nav",
		classes = "ms-lg-3",
		showText = true,
	}) {
		this.currentTheme = this.getStoredTheme() || ThemeManager.DEFAULT_THEME;
		this.ui = new ThemeUI({
			containerSelector: selector,
			wrapper: {
				tag: "li",
				classes,
			},
			showSpan: showText,
			onClick: this.toggleTheme.bind(this),
		});
		this.applyTheme(this.currentTheme);
	}

	getStoredTheme() {
		try {
			return localStorage.getItem(ThemeManager.KEY_THEME);
		} catch (error) {
			console.error("Error al obtener el tema almacenado:", error);
			return null;
		}
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
			theme,
		);
		try {
			localStorage.setItem(ThemeManager.KEY_THEME, theme);
		} catch (error) {
			console.error("Error al guardar el tema:", error);
		}
		this.currentTheme = theme;
		const isLightTheme = theme === ThemeManager.DEFAULT_THEME;
		this.ui.updateIcon(isLightTheme);
		this.ui.updateLabel(isLightTheme);
	}
}

const themeConfig = {
	default: { classes: "mt-1", showText: false },
	admin: {
		selector: ".sidebar-footer",
		classes: "w-100 order-0",
		showText: true,
	},
};

const isAdminPage = window.location.pathname.includes(PAGES.ADMIN);
new ThemeManager(isAdminPage ? themeConfig.admin : themeConfig.default);
