

const ERROR_MESSAGES = {
  EMPTY_FIELDS: 'Por favor, complete todos los campos',
  INVALID_CREDENTIALS: 'Usuario y/o Password Incorrectos'
};
const ERROR_CONTAINER_CLASS = 'alert alert-danger d-none mb-3';
const ADMIN_PAGE = "admin-index.html";

const FAKE_CREDENTIALS = {
  username: "admin",
  password: "1234"
}

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

const validateCredentials = (username, password) => {
  return username.trim() === FAKE_CREDENTIALS.username && password === FAKE_CREDENTIALS.password
}

const handleLogin = (e) => {
  e.preventDefault();
  clearError();

  const username = domElements.inputs.user.value.trim()
  const password = domElements.inputs.pass.value

  const hasEmptyValues = !username || !password
  if (hasEmptyValues) {
    return showError(ERROR_MESSAGES.EMPTY_FIELDS)
  }

  const isValid = validateCredentials(username, password)

  if (!isValid) {
    return showError(ERROR_MESSAGES.INVALID_CREDENTIALS)
  }
  domElements.form.reset()
  window.location.replace(ADMIN_PAGE);
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
  formLogin.addEventListener("submit", handleLogin);
}

document.addEventListener("DOMContentLoaded", initLogin)