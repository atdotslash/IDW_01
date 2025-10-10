import { api } from '../api.js';
import { getFormData, renderForm } from '../components/form.js';
import { createReusableModal } from '../components/modal.js';
import notification from '../components/notifications.js';
import { showSpinner } from '../components/spinner.js';
import { buttonState } from '../utils/ui.js';

const SELECTORS = {
  TABLE_BODY: '#specialties-table-body',
  ADD_BUTTON: '#add-specialty-btn',
  TABLE: '#specialties-table',
};


function createTableRow(specialty) {
  const tr = document.createElement("tr")
  tr.dataset.id = specialty.id.toString()
  tr.innerHTML = `
    <td>${specialty.id}</td>
    <td>${specialty.name}</td>
    <td class="d-flex gap-2 align-items-center ">
      <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${specialty.id}">
        <i class="fa-solid fa-pencil"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${specialty.id}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </td>
    `
  return tr
}


function renderSpecialtiesTable(specialties, container) {
  if (specialties.length === 0) {
    container.innerHTML =
      '<p class="text-center">No hay especialidades registradas.</p>';
    return;
  }

  container.innerHTML = `
   <div class="table-responsive">
                  <table class="table  table-hover align-middle">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Acciones</th>
                      </tr>
                    </thead>
                    <tbody id="specialties-table-body">
                    ${specialties.map((specialty) =>
    createTableRow(specialty).outerHTML
  ).join('')}
                    </tbody>
                  </table>`;
  const tableBody = document.querySelector(SELECTORS.TABLE_BODY);
  tableBody?.addEventListener('click', handleTableClick);


}

const removeTableRow = (specialtyId) => {
  const row = document.querySelector(
    `${SELECTORS.TABLE} tr[data-id="${specialtyId}"]`
  );
  row?.remove();
};

const addTableRow = (specialty) => {
  const tableBody = document.querySelector(SELECTORS.TABLE_BODY);
  if (tableBody) {
    const newRow = createTableRow(specialty);
    tableBody.appendChild(newRow);
  } else {
    const mainContent = document.getElementById("content");
    if (mainContent) renderSpecialties(mainContent);
  }
};

const updateTableRow = (specialty) => {
  const row = document.querySelector(
    `${SELECTORS.TABLE} tr[data-id="${specialty.id}"]`
  );
  if (row) {
    const newRow = createTableRow(specialty);
    row.replaceWith(newRow);
  }
};

function handleFormSubmit({ event, form, modal, action, specialtyId }) {
  form.classList.add('was-validated');
  if (!form.checkValidity()) {
    return;
  }

  const formData = getFormData(form)
  const saveButton = buttonState.disable(event.currentTarget, 'Guardando...')

  action({ "id": specialtyId, data: formData })
    .then(({ message, data }) => {
      notification.success(message);
      if (specialtyId) {
        updateTableRow(data);
        return
      }
      addTableRow(data);
    })
    .catch(error => {
      console.error(error);
      const modalTitle = modal.getElement().querySelector(".modal-title").innerText.toLowerCase()
      notification.error(`Error al ${modalTitle}`);
    })
    .finally(() => {
      // Habilitar botón y restaurar texto original
      saveButton.restore()
      modal.hide();
    });
}

async function openSpecialtyModal(specialty) {
  const isEditing = Boolean(specialty?.id);
  const modalId = isEditing ? `edit-specialty-modal-${specialty.id}` : 'add-specialty-modal';
  const title = isEditing ? 'Editar Especialidad' : 'Agregar Especialidad';
  const action = isEditing ? api.updateSpecialty : api.createSpecialty;
  const modal = createReusableModal({
    id: modalId,
    title,
    body: '',
    footerButtons: [
      { text: 'Cerrar', className: 'btn btn-secondary', onClick: (_, modal) => modal.hide() },
      {
        text: 'Guardar',
        className: 'btn btn-primary',
        disabled: true

      },
    ]
  });
  const removeSpinner = showSpinner(modal.getElement().querySelector(".modal-body"), { text: 'Cargando...' });
  try {
    let specialtyData;
    if (isEditing) {
      specialtyData = await api.getSpecialtiesById(specialty.id);
    } else {
      specialtyData = {};
    }
    const form = renderForm([
      { name: "name", label: "Nombre", type: "text", validationMessage: "El nombre es obligatorio", required: true },
    ], specialtyData)
    const modalBody = modal.getElement().querySelector(".modal-body");
    if (modalBody) {
      removeSpinner();
      modalBody.appendChild(form);
      const button = modal.getElement().querySelector(".modal-footer .btn-primary");
      if (button) {
        button.disabled = false;
        button.onclick = (event) => {
          handleFormSubmit({ event, form, modal, action, specialtyId: specialty?.id });
        }
      }

    }
  } catch (error) {
    console.error(error);
    notification.error('Error al cargar la especialidad. Intente nuevamente.');
    modal.hide();
  }
}

function handleDeleteSpecialty(specialtyId) {
  createReusableModal({
    id: `delete-specialty-modal-${specialtyId}`,
    title: 'Confirmar Eliminación',
    body: '<p>¿Está seguro de que desea eliminar esta especialidad? Esta acción no se puede deshacer.</p>',
    footerButtons: [
      { text: 'Cancelar', className: 'btn btn-secondary', onClick: (_, modal) => modal.hide() },
      {
        text: 'Eliminar',
        className: 'btn btn-danger',
        onClick: (event, modal) => {
          const button = buttonState.disable(event.target, 'Eliminando...')
          api.deleteSpecialty(specialtyId)
            .then(() => {
              removeTableRow(specialtyId)
              notification.success('Especialidad eliminada correctamente');
            })
            .catch(error => {
              console.error(error)
              notification.error('Error al eliminar la especialidad. Intente nuevamente.');
            }).finally(() => {
              button.restore()
              modal.hide()
            }
            );
        }
      }
    ]
  });
}

function handleTableClick(event) {
  const editButton = event.target.closest('.edit-btn');
  const deleteButton = event.target.closest('.delete-btn');
  if (editButton) {
    const specialtyId = Number(editButton.dataset.id);
    try {
      if (specialtyId) {
        openSpecialtyModal({ id: specialtyId });
      }
    } catch (error) {
      console.error('Error al obtener datos para editar:', error);
      notification.error('Error al cargar la especialidad. Intente nuevamente.');
    }
    return
  }

  if (deleteButton) {
    const specialtyId = Number(deleteButton.dataset.id);
    handleDeleteSpecialty(specialtyId);
  }
}

export async function renderSpecialties(container) {
  container.innerHTML = `
          <section id="especialidades-section" class="content-section">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="#dashboard">Dashboard</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  Especialidades
                </li>
              </ol>
            </nav>
            <div class=" d-flex flex-column flex-lg-row gap-2 gap-lg-0 justify-content-between align-items-center my-4">
              <h2 class="m-0 text-body">Gestión de Especialidades</h2>
              <button id="add-specialty-btn" class="btn align-self-stretch btn-primary">
                <i class="fa-solid fa-plus me-2"></i>Agregar Especialidad
              </button>
            </div>
            <div class="card bg-light">
              <div class="card-header">
                <h5 class="card-title m-0">Todas las especialidades</h5>
              </div>
              <div class="card-body">
                  <div id=${SELECTORS.TABLE.substring(1)}></div>
               </div>
            </div>
          </section>
  `;

  container
    .querySelector(SELECTORS.ADD_BUTTON)
    ?.addEventListener("click", () => openSpecialtyModal());


  const tableContainer = container.querySelector(SELECTORS.TABLE);

  const removeSpinner = showSpinner(tableContainer, {
    text: 'Cargando especialidades...',
  });

  try {
    const specialties = await api.getSpecialties();

    renderSpecialtiesTable(specialties, tableContainer);
  } catch (error) {
    console.error('Error al cargar las especialidades:', error);

    tableContainer.innerHTML =
      '<div class="alert alert-danger">No se pudieron cargar las especialidades.</div>';
  } finally {
    removeSpinner();
  }
}



