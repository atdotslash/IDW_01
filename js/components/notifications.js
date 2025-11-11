const TOAST_CONTAINER_ID = "toast-container";
const TEMPLATE_IDS = {
	CONTAINER: "toast-container-template",
	NOTIFICATION: "toast-notification-template",
};
const TOAST_VARIANTS = {
	success: "success",
	info: "info",
	warning: "warning",
	danger: "danger",
};

function createToastContainer(id) {
	const template = document.getElementById(TEMPLATE_IDS.CONTAINER);
	const container = template.content.firstElementChild.cloneNode(true);
	container.id = id;
	return container;
}

function createNotification() {
	let toastContainer = null;

	function getOrCreateContainer() {
		if (!toastContainer) {
			toastContainer = createToastContainer(TOAST_CONTAINER_ID);
			document.body.appendChild(toastContainer);
		}
		return toastContainer;
	}

	function showNotification(message, type = "success") {
		const toastId = `toast-${Date.now()}`;
		const toastType = TOAST_VARIANTS[type] ?? TOAST_VARIANTS.success;
		const template = document.getElementById(TEMPLATE_IDS.NOTIFICATION);
		const toast = template.content.firstElementChild.cloneNode(true);
		toast.id = toastId;
		toast.classList.add(`bg-${toastType}`);
		toast.querySelector(".toast-body").textContent = message;
		getOrCreateContainer().appendChild(toast);
		if (!window.bootstrap || !window.bootstrap.Toast) {
			console.error(
				"Bootstrap Toast no esta disponible. Asegúrese de cargar Bootstrap JS.",
			);
			return;
		}
		const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 5000 });
		bsToast.show();

		toast.addEventListener("hidden.bs.toast", toast.remove);

		return toast;
	}

	return {
		showNotification,
		success: (message) => showNotification(message, "success"),
		error: (message) => showNotification(message, "danger"),
		info: (message) => showNotification(message, "info"),
		warning: (message) => showNotification(message, "warning"),
	};
}


/**
 * Crea una cadena HTML para un mensaje de alerta con un enlace.
 * @param {string} message - El mensaje principal de la alerta.
 * @param {string} [alertType='danger'] - El tipo de alerta (ej. 'danger', 'success', 'warning').
 * @param {string} [linkUrl='catalogo.html'] - La URL a la que apunta el enlace.
 * @param {string} [linkText='catálogo'] - El texto visible del enlace.
 * @returns {string} La cadena HTML de la alerta.
 */
function createAlertHTML(message, alertType = 'danger', linkUrl = 'catalogo.html', linkText = 'catálogo') {
  return `
    <div class="alert alert-${alertType}" role="alert">
      <p>${message}</p>
      <p>Volver al <a class="alert-link" href="${linkUrl}">${linkText}</a></p>
    </div>
  `;
}

/**
 * Renderiza una cadena HTML dentro de un elemento contenedor.
 * @param {HTMLElement} containerElement - El elemento HTML donde se mostrará el mensaje.
 * @param {string} html - La cadena HTML a renderizar.
 */
function renderHTML(containerElement, html) {
  containerElement.innerHTML = html;
  containerElement.className = '';
}

/**
 * Crea y renderiza o devuelve un elemento de alerta con un enlace.
 * @param {object} options - Un objeto que contiene las opciones.
 * @param {HTMLElement} options.containerElement - El elemento HTML donde se mostrará el mensaje (si render es true).
 * @param {string} options.message - El mensaje a mostrar.
 * @param {string} options.alertType - El tipo de alerta (ej. 'danger', 'success', 'warning').
 * @param {string} options.linkUrl - La URL para el enlace.
 * @param {string} options.linkText - El texto para el enlace.
 * @param {boolean} options.render - Si es true, renderiza la alerta en el contenedor. Si es false, devuelve el elemento HTML.
 * @returns {HTMLElement|undefined} - El elemento HTML si render es false, de lo contrario undefined.
 */
export function createAndRenderAlertWithLink({ containerElement, message, alertType = 'danger', linkUrl = 'catalogo.html', linkText = 'catálogo', render = true }) {
  const html = createAlertHTML(message, alertType, linkUrl, linkText);

  if (render) {
    renderHTML(containerElement, html);
    return;
  }
    const alertElement = document.createElement('div');
    alertElement.innerHTML = html;
    return alertElement;
}






export default createNotification();
