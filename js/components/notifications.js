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

export default createNotification();
