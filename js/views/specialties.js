import { getFormData, renderForm } from "../components/form.js";
import { createReusableModal } from "../components/modal.js";
import notification from "../components/notifications.js";
import { createCrudView } from "./crud.js";
import { MESSAGES } from "../shared/constants.js";
import storageService from "../storage/index.js";



let specialtiesView;

function handleStorageAction({ action, onSuccess, onError }) {
	try {
		const result = action();
		if (!result) {
			throw new Error("La operación no se pudo completar");
		}
		onSuccess(result);
	} catch (error) {
		console.error(error);
		onError(error);
	}
}

function handleFormSubmit({ form, modal, action, specialtyId }) {
	form.classList.add("was-validated");
	if (!form.checkValidity()) {
		return;
	}
	const isUpdate = Boolean(specialtyId);
	const formData = getFormData(form);
	handleStorageAction({
		action: isUpdate
			? () => action(specialtyId, formData)
			: () => action(formData),
		onSuccess: (data) => {
			if (isUpdate) {
				specialtiesView.updateRow(data);
			} else {
				specialtiesView.addRow(data);
			}
			notification.success(
				MESSAGES.ENTITY_OPERATION_SUCCESS(
					"Especialidad",
					isUpdate ? "actualizada" : "creada",
				),
			);
			modal.hide();
		},
		onError: (error) => {
			console.error(error);
			notification.error(
				error.message || `Error al ${isUpdate ? "actualizar" : "crear"}`,
			);
			modal.hide();
		},
	});
}

function populateModalWithForm(modal, specialty) {
	try {
		const isEditing = Boolean(specialty?.id);
		const specialtyData = isEditing
			? storageService.specialties.getById(specialty.id)
			: {};
		const form = renderForm(
			[
				{
					name: "nombre",
					label: "Nombre",
					type: "text",
					validationMessage: "El nombre es obligatorio",
					required: true,
				},
			],
			specialtyData,
		);
		const modalBody = modal.getElement().querySelector(".modal-body");
		modalBody.appendChild(form);

		const action = isEditing
			? storageService.specialties.update
			: storageService.specialties.add;
		const handleSubmit = (event) => {
			if (event) event.preventDefault();
			handleFormSubmit({
				form,
				modal,
				action,
				specialtyId: specialty?.id,
			});
		};
		form.addEventListener("submit", handleSubmit);
		const saveButton = modal
			.getElement()
			.querySelector(".modal-footer .btn-primary");
		saveButton.onclick = handleSubmit;
	} catch (error) {
		console.error(error);
		notification.error(
			MESSAGES.ENTITY_OPERATION_ERROR("especialidad", "cargar"),
		);
		modal.hide();
	}
}
function openSpecialtyModal(specialty) {
	const isEditing = Boolean(specialty?.id);
	const modal = createReusableModal({
		id: isEditing
			? `edit-specialty-modal-${specialty.id}`
			: "add-specialty-modal",
		title: isEditing ? "Editar Especialidad" : "Agregar Especialidad",
		body: "",
		footerButtons: [
			{
				text: "Cerrar",
				className: "btn btn-secondary",
				onClick: (_, modal) => modal.hide(),
			},
			{
				text: "Guardar",
				className: "btn btn-primary",
			},
		],
	});
	populateModalWithForm(modal, specialty);
}

function handleDeleteSpecialty(specialtyId) {
	createReusableModal({
		id: `delete-specialty-modal-${specialtyId}`,
		title: "Confirmar Eliminación",
		body: `<p>${MESSAGES.CONFIRM_DELETE("especialidad")}</p>`,
		footerButtons: [
			{
				text: "Cancelar",
				className: "btn btn-secondary",
				onClick: (_, modal) => modal.hide(),
			},
			{
				text: "Eliminar",
				className: "btn btn-danger",
				onClick: (_, modal) => {
					handleStorageAction({
						action: () => storageService.specialties.remove(specialtyId),
						onSuccess: () => {
							specialtiesView?.removeRow(specialtyId);
							notification.success(
								MESSAGES.ENTITY_DELETE_SUCCESS("La especialidad"),
							);
							modal.hide();
						},
						onError: (error) => {
							console.error(error);
							notification.error(error.message || MESSAGES.ENTITY_DELETE_ERROR("especialidad"));
							modal.hide();
						},
					});
				},
			},
		],
	});
}

function handleTableClick(event) {
	const editButton = event.target.closest(".edit-btn");
	const deleteButton = event.target.closest(".delete-btn");
	if (editButton) {
		const specialtyId = Number(editButton.dataset.id);
		if (specialtyId) {
			openSpecialtyModal({ id: specialtyId });
		}
		return;
	}

	if (deleteButton) {
		handleDeleteSpecialty(Number(deleteButton.dataset.id));
	}
}

function createSpecialtyTableRow(specialty, { isHeader = false } = {}) {
	if (isHeader) {
		return `
      <tr>
        <th scope="col">#</th>
        <th scope="col">Nombre</th>
        <th scope="col">Acciones</th>
      </tr>
    `;
	}

	return `
    <tr data-id="${specialty.id}">
      <td>${specialty.id}</td>
      <td>${specialty.nombre}</td>
      <td class="d-flex gap-2 align-items-center ">
        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${specialty.id}">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${specialty.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
}
export const renderSpecialties = (container) => {
	const view = createCrudView({
		entityName: "Especialidad",
		entityNamePlural: "Especialidades",
		sectionId: "especialidades-section",
		tableId: "specialties-table",
		addButtonId: "add-specialty-btn",
		tableBodyId: "specialties-table-body",
		fetchData: storageService.specialties.getAll,
		createTableRow: createSpecialtyTableRow,
		handleTableClick,
		onAddButtonClick: () => openSpecialtyModal(),
	});
	specialtiesView = view(container);
};
