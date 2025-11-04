const SPINNER_CLASSES = {
	CONTAINER: "d-flex align-items-center justify-content-center m-4",
	SPINNER: "spinner-border",
	SR_ONLY: "visually-hidden",
	TEXT: "ms-2",
};

function createSpinner({
	text = "Cargando...",
	className
} = {}) {
	const container = document.createElement("div");
	container.className = `${className} ${SPINNER_CLASSES.CONTAINER}`;

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

const FULLSCREEN_SPINNER_ID = 'fullscreen-spinner';
const OVERLAY_CLASSES =   "d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100"
function createOverlay({id, className = OVERLAY_CLASSES} = {}) {
  const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = className
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    overlay.style.zIndex = '9999';
    return overlay;
}


function createFullScreenSpinner() {
    const existingSpinner = document.getElementById(FULLSCREEN_SPINNER_ID);
    if (existingSpinner) {
        return existingSpinner;
    }

    const overlay = createOverlay({id: FULLSCREEN_SPINNER_ID})

    const spinner = createSpinner({ text: 'Verificando...', className: 'text-primary' });

    overlay.appendChild(spinner);
    return overlay;
}

export function showFullScreenSpinner() {
    const spinner = createFullScreenSpinner();
    document.body.appendChild(spinner);
}

export function hideFullScreenSpinner() {
    const spinner = document.getElementById(FULLSCREEN_SPINNER_ID);
    if (spinner) {
        spinner.remove();
    }
}
