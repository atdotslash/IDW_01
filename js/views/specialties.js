import { getFormData } from "../components/form.js";
import { createReusableModal } from "../components/modal.js";
import notifications from "../components/notifications.js";
import * as tpl from "../core/templates.js";
import * as ui from "../core/ui.js";
import { MESSAGES } from "../shared/constants.js";
import storageService from "../storage/index.js";

const SELECTORS = {
	ADD_SPECIALTY_BUTTON: "btn-add-specialty",
	SPECIALTIES_TABLE_CONTAINER: "specialties-table-container",
};

export function init() {
	const breadcrumbHTML = tpl.createBreadcrumb([
		{ text: "Dashboard", href: "#dashboard", active: false },
		{ text: "Especialidades", href: "#especialidades", active: true },
	]);

	let pageHtml = `
        ${breadcrumbHTML}
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-body mb-3 mb-md-0">Gestión de Especialidades</h1>
            <div class="btn-toolbar">
                <button type="button" class="btn btn-primary" id="${SELECTORS.ADD_SPECIALTY_BUTTON}">
                    <i class="fa fa-plus-circle me-1"></i>
                    Agregar Especialidad
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                Especialidades Médicas
            </div>
            <div class="card-body">
                <div id="${SELECTORS.SPECIALTIES_TABLE_CONTAINER}">
                    <p class="text-muted">Cargando especialidades...</p>
                </div>
            </div>
        </div>
    `;

	pageHtml = tpl.createSectionWrapper("especialidades-section", pageHtml);
	ui.renderContent(pageHtml);

	loadSpecialties();
	attachListeners();
}

function loadSpecialties() {
	const tableContainer = document.getElementById(
		SELECTORS.SPECIALTIES_TABLE_CONTAINER,
	);
	tableContainer.innerHTML = "<p>Cargando especialidades...</p>";

	try {
		const specialties = storageService.specialties.getAll();

		if (specialties.length === 0) {
			tableContainer.innerHTML =
				'<p class="text-muted">No hay especialidades registradas.</p>';
			return;
		}

		const headers = ["#", "Nombre", "Acciones"];
		const rowsHtml = specialties.map(tpl.createSpecialtyRow).join("");
		const tableHtml = ui.renderTable(headers, rowsHtml);
		tableContainer.innerHTML = tableHtml;

		attachTableListeners(tableContainer);
	} catch (error) {
		console.error("Error loading specialties:", error);
		tableContainer.innerHTML =
			'<p class="text-danger">Error al cargar las especialidades.</p>';
	}
}



function handleSaveSpecialty({ form, specialty = {}, modal }) {
  if (!ui.validateForm(form))return;

	const formData = getFormData(form);
	const isEditing = Boolean(specialty.id);

	try {
		if (isEditing) {
			storageService.specialties.update(specialty.id, formData);
			notifications.success(
				MESSAGES.ENTITY_OPERATION_SUCCESS("Especialidad", "actualizada"),
			);
		} else {
			storageService.specialties.add(formData);
			notifications.success(
				MESSAGES.ENTITY_OPERATION_SUCCESS("Especialidad", "creada"),
			);
		}
		modal.hide();
		loadSpecialties();
	} catch (error) {
		ui.handleSaveError({
      error,
      form,
      isEditing,
      entityName: 'Especialidad',
    });
	}
}

function openSpecialtyModal(specialty = {}) {
	const isEditing = Boolean(specialty.id);
	let initialData = {};

	if (isEditing) {
		initialData = storageService.specialties.getById(specialty.id);
	}

	const form = tpl.createSpecialtyForm(initialData);

	createReusableModal({
		title: isEditing ? "Editar Especialidad" : "Agregar Especialidad",
		id: isEditing
			? `edit-specialty-modal-${specialty.id}`
			: "add-specialty-modal",
		body: form,
		footerButtons: [
			{
				text: "Cerrar",
				className: "btn btn-secondary",
				onClick: (_, modal) => modal.hide(),
			},
			{
				text: "Guardar",
				className: "btn btn-primary",
				onClick: (_, modal) => {
					handleSaveSpecialty({ form, specialty, modal });
				},
			},
		],
	});
}

function handleDeleteSpecialty(specialtyId) {
	ui.showConfirmModal({
		message: MESSAGES.CONFIRM_DELETE("la especialidad"),
		onConfirm: () => {
			try {
				storageService.specialties.remove(specialtyId);
				notifications.success(
					MESSAGES.ENTITY_DELETE_SUCCESS("La especialidad"),
				);
				loadSpecialties();
			} catch (error) {
				console.error(error);
				notifications.error(
					error.message || MESSAGES.ENTITY_DELETE_ERROR("la especialidad"),
				);
			}
		},
	});
}

function attachTableListeners(tableContainer) {
	tableContainer.addEventListener("click", (event) => {
		const editButton = event.target.closest(".edit-btn");
		const deleteButton = event.target.closest(".delete-btn");

		if (editButton) {
			const specialtyId = Number(editButton.dataset.id);
			openSpecialtyModal({ id: specialtyId });
			return;
		}

		if (deleteButton) {
			const specialtyId = Number(deleteButton.dataset.id);
			handleDeleteSpecialty(specialtyId);
		}
	});
}

function attachListeners() {
	document
		.getElementById(SELECTORS.ADD_SPECIALTY_BUTTON)
		.addEventListener("click", openSpecialtyModal);
}
