const SPINNER_CLASSES = {
	CONTAINER: "d-flex align-items-center justify-content-center m-4",
	SPINNER: "spinner-border",
	SR_ONLY: "visually-hidden",
	TEXT: "ms-2",
};

function createSpinner({
	text = "Cargando...",
	className = SPINNER_CLASSES.CONTAINER,
} = {}) {
	const container = document.createElement("div");
	container.className = className;

	const spinner = document.createElement("div");
	spinner.className = SPINNER_CLASSES.SPINNER;
	spinner.role = "status";

	const srOnly = document.createElement("span");
	srOnly.className = SPINNER_CLASSES.SR_ONLY;
	srOnly.textContent = text;

	spinner.appendChild(srOnly);
	container.appendChild(spinner);

	if (text) {
		const textNode = document.createElement("span");
		textNode.className = SPINNER_CLASSES.TEXT;
		textNode.textContent = text;
		container.appendChild(textNode);
	}

	return container;
}

export function replaceContentWithSpinner(container, options) {
	const spinnerElement = createSpinner(options);
	container.innerHTML = "";
	container.appendChild(spinnerElement);

	return {
		spinnerElement,
		hide: () => {
			if (container.contains(spinnerElement)) {
				container.removeChild(spinnerElement);
			}
		},
	};
}
