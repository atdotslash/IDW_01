import { api } from '../api.js';
import { createReusableModal } from '../components/modal.js';
import notification from '../components/notifications.js';
import { buttonState, formState } from '../utils/ui.js';

const SELECTORS = {
  TABLE_BODY: '#specialties-table-body',
  ADD_BUTTON: '#add-specialty-btn',
};

function getSpecialtyFormHTML(specialty = {}) {
  const { name = '', loading = false } = specialty;
  return `
    <form id="specialty-form" novalidate>
      <div class="mb-3">
        <label for="specialty-name" class="form-label">Nombre</label>
        <input type="text" class="form-control" id="specialty-name" value="${name}" ${loading ? 'disabled' : ''} required>
        <div class="invalid-feedback">El nombre es obligatorio.</div>
      </div>
    </form>
  `;
}

async function renderSpecialtiesTable() {
  const tableBody = document.querySelector(SELECTORS.TABLE_BODY);
  if (!tableBody) return;

  try {
    const specialties = await api.getSpecialties();
    tableBody.innerHTML = specialties.map((specialty, index) => `
      <tr data-id="${specialty.id}">
        <td>${index + 1}</td>
        <td>${specialty.name}</td>
        <td class="d-flex gap-2 align-items-center ">
          <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${specialty.id}">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${specialty.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error al cargar las especialidades:', error);
    tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No se pudieron cargar las especialidades.</td></tr>';
  }
}

function handleFormSubmit({ event, form, modal, action, specialtyId }) {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  const nameInput = form.querySelector('#specialty-name');
  const data = { name: nameInput.value };

  const saveButton = buttonState.disable(event.currentTarget, 'Guardando...') 
  const myForm = formState.disableForm(form)

  action({ "id": specialtyId, data })
    .then(({ message }) => {
      renderSpecialtiesTable();
      console.log(message)
      notification.success(message);
    })
    .catch(error => {
      console.error(error);
      const modalTitle = modal.getElement().querySelector(".modal-title").innerText.toLowerCase()
      notification.error(`Error al ${modalTitle}`);
    })
    .finally(() => {
      myForm.restore()
      // Habilitar botón y restaurar texto original
      saveButton.restore()
      modal.hide();
    });
}

function openSpecialtyModal(specialty = {}, button = null) {
  const isEditing = Boolean(specialty.id);
  const modalId = isEditing ? `edit-specialty-modal-${specialty.id}` : 'add-specialty-modal';
  const title = isEditing ? 'Editar Especialidad' : 'Agregar Especialidad';
  const action = isEditing ? api.updateSpecialty : api.createSpecialty;

  const triggerButton = button || null

  const modal = createReusableModal({
    id: modalId,
    title,
    body: getSpecialtyFormHTML(specialty),
    footerButtons: [
      { text: 'Cerrar', className: 'btn btn-secondary', onClick: () => modal.hide() },
      {
        text: 'Guardar',
        className: 'btn btn-primary',
        onClick: (event) => {
          const form = modal.getElement().querySelector('#specialty-form');
          handleFormSubmit({ event, form, modal, action, specialtyId: specialty.id });
        }
      },
    ], onHide: () => {
      if (triggerButton) {
        triggerButton.restore()
      }
    }
  });
  modal.show();
}

function handleDeleteSpecialty(specialtyId) {
  const modal = createReusableModal({
    id: `delete-specialty-modal-${specialtyId}`,
    title: 'Confirmar Eliminación',
    body: '¿Está seguro de que desea eliminar esta especialidad?',
    footerButtons: [
      { text: 'Cancelar', className: 'btn btn-secondary', onClick: () => modal.hide() },
      {
        text: 'Eliminar',
        className: 'btn btn-danger',
        onClick: (event) => {
          const button = buttonState.disable(event.currentTarget)
          api.deleteSpecialty(specialtyId)
            .then(() => {
              renderSpecialtiesTable();
              notification.success('Especialidad eliminada correctamente');
            })
            .catch(error => {
              console.error(error)
              notification.error('Error al eliminar la especialidad');
            }).finally( () => {
              button.restore()
              modal.hide()
            }
            );
        }
      }
    ]
  });
  modal.show();
}

async function handleTableClick(event) {
  const editButton = event.target.closest('.edit-btn');
  const deleteButton = event.target.closest('.delete-btn');
  if (editButton) {
    const button = buttonState.disable(editButton, '')
    const specialtyId = Number(editButton.dataset.id);
    try {
      const specialty = await api.getSpecialtiesById(specialtyId);
      if (specialty) {
        openSpecialtyModal(specialty, button);
      }
    } catch (error) {
      console.error('Error al obtener datos para editar:', error);
      notification.error('Error al cargar la especialidad');
    } 
    return;
  }

  if (deleteButton) {
    const specialtyId = Number(deleteButton.dataset.id);
    handleDeleteSpecialty(specialtyId);
  }
}

export function initSpecialties() {
  renderSpecialtiesTable();

  const addButton = document.querySelector(SELECTORS.ADD_BUTTON);
  addButton?.addEventListener('click', () => 
    openSpecialtyModal({}, buttonState.disable(addButton))
  )

  const tableBody = document.querySelector(SELECTORS.TABLE_BODY);
  tableBody?.addEventListener('click', handleTableClick);
}
