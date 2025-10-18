import { api } from "../api.js";
import { getFormData, renderForm } from "../components/form.js";
import { createReusableModal } from "../components/modal.js";
import notification from "../components/notifications.js";
import { showSpinner } from "../components/spinner.js";
import { disableButton } from "../shared/ui.js";
import { createCrudView } from "./crud.js";
import { MESSAGES } from "../shared/constants.js";

const SELECTORS = {
  TABLE_BODY: "#specialties-table-body",
  TABLE: "#specialties-table",
};

const removeTableRow = (specialtyId) => {
  const row = document.querySelector(
    `${SELECTORS.TABLE} tr[data-id="${specialtyId}"]`
  );
  row?.remove();
  window.checkEmptyState?.();
};

const addTableRow = (specialty) => {
  const tableBody = document.querySelector(SELECTORS.TABLE_BODY);
  const newRowHTML = createSpecialtyTableRow(specialty);
  tableBody?.insertAdjacentHTML("beforeend", newRowHTML);
};

const updateTableRow = (specialty) => {
  const row = document.querySelector(
    `${SELECTORS.TABLE} tr[data-id="${specialty.id}"]`
  );
  if (row) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = createSpecialtyTableRow(specialty);
    row.replaceWith(newRow);
  }
};

function handleFormSubmit({ event, form, modal, action, specialtyId }) {
  form.classList.add("was-validated");
  if (!form.checkValidity()) {
    return;
  }

  const formData = getFormData(form);
  const {restore: saveButtonRestore} = disableButton(event.currentTarget, "Guardando...");

  action({ id: specialtyId, data: formData })
    .then((data) => {
      const isUpdate = Boolean(specialtyId);
      notification.success(MESSAGES.ENTITY_OPERATION_SUCCESS("Especialidad", isUpdate ?  "actualizada" : "creada"));
      isUpdate ?
        updateTableRow(data) :
        addTableRow(data);
    })
    .catch((error) => {
      console.error(error);
      const modalTitle = modal
        .getElement()
        .querySelector(".modal-title")
        .innerText.toLowerCase();
      notification.error(`Error al ${modalTitle}`);
    })
    .finally(() => {
      saveButtonRestore();
      modal.hide();
    });
}

async function openSpecialtyModal(specialty) {
  const isEditing = Boolean(specialty?.id);
  const modalId = isEditing
    ? `edit-specialty-modal-${specialty.id}`
    : "add-specialty-modal";
  const title = isEditing ? "Editar Especialidad" : "Agregar Especialidad";
  const action = isEditing ? api.updateSpecialty : api.createSpecialty;
  const modal = createReusableModal({
    id: modalId,
    title,
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
        disabled: true,
      },
    ],
  });
  const removeSpinner = showSpinner(
    modal.getElement().querySelector(".modal-body"),
    { text: "Cargando..." }
  );
  try {
    const specialtyData = isEditing ? await api.getSpecialtiesById(specialty.id) : {};
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
      specialtyData
    );
    const modalBody = modal.getElement().querySelector(".modal-body");
    if (modalBody) {
      removeSpinner();
      modalBody.appendChild(form);
      const button = modal
        .getElement()
        .querySelector(".modal-footer .btn-primary");
      if (button) {
        button.disabled = false;
        button.onclick = (event) => {
          handleFormSubmit({
            event,
            form,
            modal,
            action,
            specialtyId: specialty?.id,
          });
        };
      }
    }
  } catch (error) {
    console.error(error);
    notification.error(MESSAGES.ENTITY_OPERATION_ERROR("especialidad", "cargar"));
    modal.hide();
  }
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
        onClick: (event, modal) => {
          const { restore: restoreButton } = disableButton(event.target, "Eliminando...");
          api
            .deleteSpecialty(specialtyId)
            .then(() => {
              removeTableRow(specialtyId);
              notification.success(MESSAGES.ENTITY_DELETE_SUCCESS("especialidad"));
            })
            .catch((error) => {
              console.error(error);
              notification.error(
                MESSAGES.ENTITY_DELETE_ERROR("especialidad")
              );
            })
            .finally(() => {
              restoreButton();
              modal.hide();
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
    try {
      if (specialtyId) {
        openSpecialtyModal({ id: specialtyId });
      }
    } catch (error) {
      console.error("Error al obtener datos para editar:", error);
      notification.error(
        MESSAGES.ENTITY_OPERATION_ERROR("especialidad", "cargar")
      );
    }
    return;
  }

  if (deleteButton) {
    const specialtyId = Number(deleteButton.dataset.id);
    handleDeleteSpecialty(specialtyId);
  }
}

function createSpecialtyTableRow(specialty, isHeader = false) {
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

export const renderSpecialties = createCrudView({
  entityName: "Especialidad",
  entityNamePlural: "Especialidades",
  sectionId: "especialidades-section",
  tableId: "specialties-table",
  addButtonId: "add-specialty-btn",
  tableBodyId: "specialties-table-body",
  fetchData: () => api.getSpecialties(),
  createTableRow: createSpecialtyTableRow,
  handleTableClick,
  onAddButtonClick: () => openSpecialtyModal(),
});
