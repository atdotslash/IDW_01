import { createReusableModal } from "../components/modal.js";
import { hideFullScreenSpinner, showFullScreenSpinner } from "../components/spinner.js";

export function renderTable(headers, dataRows) {
	const tableHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
          <tr>
          ${headers.map((header) => `<th>${header}</th>`).join("")}
          </tr>
          </thead>
          <tbody>
            ${dataRows}
          </tbody>
        </table>
      </div>
    `;
	return tableHTML;
}

function createOption({ value, text, isSelected = false }) {
	const option = document.createElement("option");
	option.value = value;
	option.text = text;
	option.selected = isSelected;
	return option;
}

export function populateSelect({
	selectElement,
	options = [],
	defaultOptionText,
}) {
	const defaultOption = defaultOptionText
		? [createOption({ value: "", text: defaultOptionText }).outerHTML]
		: [];
	selectElement.innerHTML = [
		...defaultOption,
		...options.map((option) => createOption(option).outerHTML),
	].join("");
}

export function renderContent(html) {
	const contentArea = document.getElementById("content");
	contentArea.innerHTML = html;
}

export async function showLoadingOverlay({ asyncAction }) {
      showFullScreenSpinner();
      try {
        await asyncAction();
      } catch (error) {
        console.error(error);
      } finally {
        hideFullScreenSpinner();
      }
}

export function showConfirmModal({
	title = "Confirmar eliminación",
	message,
	onConfirm,
	onCancel = () => {},
	confirmButtonText = "Aceptar",
	cancelButtonText = "Cancelar",
}) {
	const confirmModal = createReusableModal({
		title: title,
		body: `<p>${message}</p>`,
		footerButtons: [
			{
				text: cancelButtonText,
				className: "btn btn-secondary",
				onClick: (_,modal) => {
					onCancel();
					modal.hide();
				},
			},
			{
				text: confirmButtonText,
				className: "btn btn-danger",
				onClick: (_, modal) => {
					onConfirm();
					modal.hide();
				},
			},
		],
	});
	return confirmModal;
}
