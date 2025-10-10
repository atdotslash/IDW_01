

import { api } from './api.js';
import { buttonState } from './utils/ui.js'
const ERROR_MESSAGES = {
  EMPTY_FIELDS: 'Por favor, complete todos los campos',
};
const ERROR_CONTAINER_CLASS = 'alert alert-danger d-none mb-3';
const ADMIN_PAGE = "admin-index.html";

const domElements = {
  form: null,
  inputs: {
    user: null,
    pass: null
  },
  errorContainer: null
}

function setupErrorContainer() {
  const errorContainer = document.createElement('div');
  errorContainer.className = ERROR_CONTAINER_CLASS;
  return errorContainer;
}

const showError = (message) => {
  if (domElements.errorContainer) {
    domElements.errorContainer.textContent = message;
    domElements.errorContainer.classList.remove('d-none');
  }
};

const clearError = () => {
  domElements.errorContainer?.classList.add('d-none');
};

const handleLogin = async (e) => {
  e.preventDefault();
  clearError();

  const username = domElements.inputs.user.value.trim()
  const password = domElements.inputs.pass.value

  const hasEmptyValues = !username || !password
  if (hasEmptyValues) {
    return showError(ERROR_MESSAGES.EMPTY_FIELDS)
  }

  const submitButton = buttonState.disable(domElements.form.querySelector("button[type='submit']"), "Ingresando...");
  try {
    await api.login(username, password);
    domElements.form.reset();
    window.location.replace(ADMIN_PAGE);
  } catch (error) {
    showError(error.message);
    domElements.inputs.user.focus({ preventScroll: true });
  } finally{
    submitButton.restore();
  }
};


function initLogin() {
  domElements.form = document.getElementById("formLogin");
  domElements.inputs.user = document.getElementById("user");
  domElements.inputs.pass = document.getElementById("pass");
  if (!domElements.form || !domElements.inputs.user || !domElements.inputs.pass) {
    console.error('Error: No se encontraron todos los elementos del formulario');
    return;
  }
  domElements.errorContainer = setupErrorContainer();
  domElements.form.prepend(domElements.errorContainer);
  Object.values(domElements.inputs).forEach(input => input.addEventListener("input", clearError))
  domElements.form.addEventListener("submit", handleLogin);
}

document.addEventListener("DOMContentLoaded", initLogin)