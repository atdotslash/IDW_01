import {  apiService } from "./api.js";
import { showLoadingOverlay } from "./core/ui.js";
import { auth } from "./shared/auth.js";
import { MESSAGES } from "./shared/constants.js";
import {disableButton} from './shared/ui.js'
import storageService from './storage/index.js'
const ERROR_CONTAINER_CLASS = "alert alert-danger d-none mb-3";
const UI_SELECTORS = {
	form: "#formLogin",
	userInput: "#user",
	passInput: "#pass",
	submitButton: `button[type='submit']`,
};
const domElements = {
	form: null,
	inputs: {
		user: null,
		pass: null,
	},
	errorContainer: null,
};

const ui = {
	init: () => {
		domElements.form = document.querySelector(UI_SELECTORS.form);
		if (!domElements.form) return false;
		domElements.inputs.user = domElements.form.querySelector(
			UI_SELECTORS.userInput,
		);
		domElements.inputs.pass = domElements.form.querySelector(
			UI_SELECTORS.passInput,
		);
		domElements.errorContainer = ui.setupErrorContainer();
		domElements.form.prepend(domElements.errorContainer);
		domElements.form.querySelectorAll("input").forEach((input) => {
			input.addEventListener("input", ui.hideError);
		});
		return true;
	},
	setupErrorContainer: () => {
		const errorContainer = document.createElement("div");
		errorContainer.className = ERROR_CONTAINER_CLASS;
		return errorContainer;
	},
	showError: (message) => {
		if (domElements.errorContainer) {
			domElements.errorContainer.textContent = message;
			domElements.errorContainer.classList.remove("d-none");
		}
	},
	hideError: () => {
		domElements.errorContainer?.classList.add("d-none");
	},
	getCredentials: () => {
		const username = domElements.inputs.user.value.trim();
		const password = domElements.inputs.pass.value;
		return { username, password };
	},
  getSubmitButton: () => domElements.form.querySelector(UI_SELECTORS.submitButton),
};

const handleLogin = async (event) => {
	event.preventDefault();
	ui.hideError();

	const { username, password } = ui.getCredentials();

	if (!username || !password) {
    return ui.showError(MESSAGES.EMPTY_FIELDS);
	}
  const {restore: restoreButton} = disableButton(ui.getSubmitButton(), "Ingresando...")
  try {
    const {user,success} = await apiService.login({username, password})
    if (success){
      const isAdministrator = await apiService.validateAdminToken(user.accessToken)
      if (!isAdministrator){
        throw new Error(MESSAGES.INVALID_ROLE)
      }
      storageService.session.set(user)
      auth.redirectToAdmin()
    }
  } catch (error) {
    ui.showError(error.message)
  } finally {
    restoreButton()
  }
};

async function initLogin() {
   await showLoadingOverlay({asyncAction:
      auth.guestOnly()
    })
	if (!ui.init()) return;
	domElements.form.addEventListener("submit", handleLogin);
}

initLogin();
