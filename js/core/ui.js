import { createReusableModal } from "../components/modal.js";
import {
	hideFullScreenSpinner,
	showFullScreenSpinner,
} from "../components/spinner.js";
import notifications from '../components/notifications.js';

const CONFIRM_MODAL_DEFAULTS = {
	TITLE: "Confirmar eliminación",
	CONFIRM_BUTTON_TEXT: "Aceptar",
	CANCEL_BUTTON_TEXT: "Cancelar",
	CONFIRM_BUTTON_CLASS: "btn btn-danger",
	CANCEL_BUTTON_CLASS: "btn btn-secondary",
};
const CONTENT_AREA_SELECTOR = "#content";

export function renderTable(headers, dataRowsHTML) {
	const tableHTML = `
      <div class="table-responsive">
        <table class="table table-hover  align-middle">
          <thead class="table-active">
            <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
          </thead>
          <tbody>${dataRowsHTML}</tbody>
        </table>
      </div>
    `;
	return tableHTML;
}


/**
 * Rellena un elemento `<select>` con una lista de opciones.
 *
 * @param {object} params - Los parámetros para rellenar el elemento select.
 * @param {HTMLSelectElement} params.selectElement - El elemento HTML `<select>` a rellenar.
 * @param {Array<object>} [params.options=[]] - Un array de objetos de opción. Cada objeto debe tener propiedades `value` y `text`, y opcionalmente una propiedad booleana `isSelected`.
 * @param {string} [params.defaultOptionText] - Texto opcional para una opción predeterminada y deshabilitada (por ejemplo, "Seleccione un elemento"). Si se proporciona, su valor será una cadena vacía.
 */
export function populateSelect({
	selectElement,
	options = [],
	defaultOptionText,
}) {

	const defaultOption = defaultOptionText
		? [createOptionHTML({ value: "", text: defaultOptionText })]
		: [];
	const htmlOptions = [
		...defaultOption,
		...options.map(createOptionHTML),
	].join("");
  selectElement.innerHTML = htmlOptions;
}

function createOptionHTML({ value, text, isSelected = false}) {
	const selectedAttribute = isSelected ? 'selected' : '';
	return `<option value="${value}" ${selectedAttribute}>${text}</option>`;
}






export function renderContent(html, containerSelector = CONTENT_AREA_SELECTOR) {
	const contentArea = document.querySelector(containerSelector);
	if (!contentArea)
		throw new Error(`El contenedor con ${containerSelector} no existe`);
	contentArea.innerHTML = html;
}

export async function showLoadingOverlay({ asyncAction }) {
	try {
		showFullScreenSpinner();
		await asyncAction;
	} catch (error) {
		console.error(error);
	} finally {
		hideFullScreenSpinner();
	}
}

/**
 * @typedef {object} ConfirmModalOptions
 * @property {string} [title=CONFIRM_MODAL_DEFAULTS.TITLE] - El título del modal de confirmación.
 * @property {string} message - El mensaje a mostrar en el cuerpo del modal.
 * @property {function(): void} onConfirm - La función a ejecutar cuando se confirma la acción.
 * @property {function(): void} [onCancel=() => {}] - La función a ejecutar cuando se cancela la acción.
 * @property {string} [confirmButtonText=CONFIRM_MODAL_DEFAULTS.CONFIRM_BUTTON_TEXT] - El texto del botón de confirmación.
 * @property {string} [cancelButtonText=CONFIRM_MODAL_DEFAULTS.CANCEL_BUTTON_TEXT] - El texto del botón de cancelar.
 * Muestra un modal de confirmación con opciones personalizables.
 *
 * @param {ConfirmModalOptions} options - Las opciones para configurar el modal de confirmación.
 * @returns {object} Un objeto con métodos para controlar el modal (show, hide, destroy).
 */
export function showConfirmModal({
	title = CONFIRM_MODAL_DEFAULTS.TITLE,
	message,
	onConfirm,
	onCancel = () => {},
	confirmButtonText = CONFIRM_MODAL_DEFAULTS.CONFIRM_BUTTON_TEXT,
	cancelButtonText = CONFIRM_MODAL_DEFAULTS.CANCEL_BUTTON_TEXT,
}) {
	createReusableModal({
		title: title,
		body: `<p>${message}</p>`,
		footerButtons: [
			{
				text: cancelButtonText,
				className: CONFIRM_MODAL_DEFAULTS.CANCEL_BUTTON_CLASS,
				onClick: (_, modal) => {
          try {
            onCancel();
          } finally {
            modal.hide();
          }
				},
			},
			{
				text: confirmButtonText,
				className: CONFIRM_MODAL_DEFAULTS.CONFIRM_BUTTON_CLASS,
				onClick: (_, modal) => {
           try {
            onConfirm();
          } finally {
            modal.hide();
          }
				},
			},
		],
	});
}

export function handleSaveError({ error, form, isEditing, entityName, fieldName = 'nombre' }) {
  const fieldInput = form.querySelector(`[name='${fieldName}']`);

  if (fieldInput && error.message.toLowerCase().includes(fieldName.toLowerCase())) {
    fieldInput.setCustomValidity(error.message);
    const feedbackDiv = fieldInput.parentElement.querySelector('.invalid-feedback');
    if (feedbackDiv) {
      feedbackDiv.textContent = error.message;
    }
    return;
  }

  notifications.error(
    error.message ||
      `Error al ${isEditing ? 'actualizar' : 'crear'} ${entityName.toLowerCase()}`,
  );
}

export function validateForm(form) {
  form.classList.add('was-validated');

  form.querySelectorAll('input, textarea, select').forEach((input) => {
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  });

  return form.checkValidity();
}
