const MODAL_TEMPLATE_ID = 'app-modal-template';

export const MODAL_SIZES = {
	SMALL: "modal-sm",
	LARGE: "modal-lg",
	EXTRA_LARGE: "modal-xl",
};

function createFooterButton({ className, id, disabled, text }) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = className;
	button.id = id;
	button.disabled = disabled;
	button.textContent = text;
	return button;
}

export function createReusableModal({
	id = "modal-app",
	size = "",
	title,
	body,
	footerButtons = [

  ],
	onHide = null,
}) {
	const template = document.getElementById(MODAL_TEMPLATE_ID);
	const modalElement = template.content.firstElementChild.cloneNode(true);

	modalElement.id = id;
	modalElement.querySelector(".modal-title").textContent = title;
	if (size) {
		modalElement.querySelector(".modal-dialog").classList.add(size);
	}

	const modalBody = modalElement.querySelector(".modal-body");
	if (typeof body === "string") {
		modalBody.innerHTML = body;
	} else if (body instanceof Node) {
		modalBody.appendChild(body);
	}

	if (!window.bootstrap || !window.bootstrap.Modal) {
		throw new Error(
			"Bootstrap Modal no esta disponible. Asegúrese de cargar Bootstrap JS.",
		);
	}

	const modalInstance =  window.bootstrap.Modal.getOrCreateInstance(modalElement, {
		backdrop: "static",
	});
	const buttonHandlers = [];
	if (footerButtons.length > 0) {
		const modalFooter = modalElement.querySelector(".modal-footer");
		footerButtons.forEach((props, index) => {
			props.id = props.id || `${id}-footer-button-${index}`;
			const buttonElement = createFooterButton(props);
			const handler = (event) => props?.onClick?.(event, modalInstance);
			buttonHandlers.push({ element: buttonElement, handler });
			buttonElement.addEventListener("click", handler);
			modalFooter.appendChild(buttonElement);
		});
	}

	document.body.appendChild(modalElement);

	const destroy = () => {
		if (typeof onHide === "function") {
			onHide();
		}
		buttonHandlers.forEach(({ handler, element }) => {
			element?.removeEventListener("click", handler);
		});
		modalElement.removeEventListener("shown.bs.modal", handleShown);
		modalElement.remove();
		modalInstance.dispose();
	};

	function handleShown() {
		const firstInput = modalElement.querySelector("input, select, textarea");
		firstInput?.focus({ preventScroll: true });
	}

	modalElement.addEventListener("shown.bs.modal", handleShown);
	modalElement.addEventListener("hidden.bs.modal", destroy);
	modalInstance.show();
	return {
		show: () => modalInstance.show(),
		hide: () => modalInstance.hide(),
		destroy,
		getElement: () => modalElement,
	};
}
