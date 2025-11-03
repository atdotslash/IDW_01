import { getFormData } from '../components/form.js';
import { createReusableModal } from '../components/modal.js';
import notifications from '../components/notifications.js';
import { createPagination } from '../components/pagination.js';
import * as tpl from '../core/templates.js';
import * as ui from '../core/ui.js';
import { MESSAGES } from '../shared/constants.js';
import storageService from '../storage/index.js';

const config = {
  ENTITY_NAME: 'Obra Social',
  ENTITY_NAME_PLURAL: 'Obra Sociales',
  SECTION: 'obras-sociales-section',
  TABLE: 'obra-sociales-table',
  ADD_BUTTON: 'btn-add-obra-social',
  TABLE_BODY: 'obra-sociales-table-body',
  PAGINATION_CONTAINER: 'pagination-container',
  ITEMS_PER_PAGE: 3,
  HEADERS: ['#', 'Nombre', 'Descripcion', 'Acciones'],
};

const SELECTORS = {
  ADD_BUTTON_ID: `#${config.ADD_BUTTON}`,
  TABLE_CONTAINER: `#${config.TABLE}`,
  PAGINATION_CONTAINER_ID: `#${config.PAGINATION_CONTAINER}`,
};

function renderInsuranceCompaniesPage() {
  const { ENTITY_NAME, ENTITY_NAME_PLURAL, SECTION } = config;

  const breadcrumbHTML = tpl.createBreadcrumb([
    { text: 'Dashboard', href: '#dashboard', active: false },
    { text: ENTITY_NAME_PLURAL, href: `#${SECTION}`, active: true },
  ]);
  let pageHtml = `
        ${breadcrumbHTML}
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-body mb-3 mb-md-0">Gestión de ${ENTITY_NAME_PLURAL}</h1>
            <div class="btn-toolbar">
                <button type="button" class="btn btn-primary" id="${config.ADD_BUTTON}">
                    <i class="fa fa-plus-circle me-1"></i>
                    Agregar ${ENTITY_NAME}
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                ${ENTITY_NAME_PLURAL}
            </div>
            <div class="card-body">
                <div id="${config.TABLE}">
                    <p class="text-muted">Cargando ${ENTITY_NAME_PLURAL.toLowerCase()}...</p>
                </div>
            </div>
        </div>
    `;

  pageHtml = tpl.createSectionWrapper(SECTION, pageHtml);
  ui.renderContent(pageHtml);
}

function setupInsuranceCompaniesEventListeners() {
  document
    .querySelector(SELECTORS.ADD_BUTTON_ID)
    ?.addEventListener('click', openInsuranceCompanyModal);
  const tableContainer = document.querySelector(SELECTORS.TABLE_CONTAINER);
  attachTableListeners(tableContainer);
}

function renderInsuranceCompaniesTable(paginatedInsuranceCompanies) {
  const tableContainer = document.querySelector(SELECTORS.TABLE_CONTAINER);
  const rowsHtml = paginatedInsuranceCompanies.map(tpl.createInsuranceCompanyRow).join('');
  const tableHtml = ui.renderTable(config.HEADERS, rowsHtml);
  tableContainer.innerHTML = tableHtml;
}

function renderPagination(total, page) {
  const { ITEMS_PER_PAGE, PAGINATION_CONTAINER } = config;
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const pagination = createPagination(
    { total, skip, limit: ITEMS_PER_PAGE },
    loadInsuranceCompanies,
  );
  let paginationContainer = document.getElementById(PAGINATION_CONTAINER);

  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.className = 'mt-3 mt-md-2';
    paginationContainer.id = PAGINATION_CONTAINER;
    document
      .querySelector(SELECTORS.TABLE_CONTAINER)
      .insertAdjacentElement('afterend', paginationContainer);
  }
  paginationContainer.innerHTML = '';
  paginationContainer.append(pagination);
}

function handleNoInsuranceCompanies(tableContainer) {
  tableContainer.innerHTML = `<p class="text-muted">No hay ${config.ENTITY_NAME_PLURAL.toLowerCase()} registrados.</p>`;
}

function handleLoadInsuranceCompaniesError(tableContainer, entityNamePlural, error) {
  console.error(`Error cargando ${entityNamePlural.toLowerCase()}`, error);
  tableContainer.innerHTML = `<p class="text-danger">Error al cargar los ${entityNamePlural.toLowerCase()}.</p>`;
}

function loadInsuranceCompanies(page = 1) {
  const { ENTITY_NAME_PLURAL, ITEMS_PER_PAGE } = config;
  const tableContainer = document.querySelector(SELECTORS.TABLE_CONTAINER);
  tableContainer.innerHTML = `<p>Cargando ${ENTITY_NAME_PLURAL.toLowerCase()}...</p>`;

  try {
    const insuranceCompanies = storageService.insuranceCompanies.getAll();

    if (insuranceCompanies.length === 0) {
      return handleNoInsuranceCompanies(tableContainer);
    }

    const skip = (page - 1) * ITEMS_PER_PAGE;
    const paginatedInsuranceCompanies = insuranceCompanies.slice(skip, skip + ITEMS_PER_PAGE);

    renderInsuranceCompaniesTable(paginatedInsuranceCompanies);
    renderPagination(insuranceCompanies.length, page);
  } catch (error) {
    handleLoadInsuranceCompaniesError(tableContainer, ENTITY_NAME_PLURAL, error);
  }
}

function validateForm(form, nameInput) {
  nameInput?.setCustomValidity('');
  form?.classList.add('was-validated');
  return form.checkValidity();
}
function handleSaveError(error, nameInput, isEditing) {
  if (nameInput && error.message.toLowerCase().includes('nombre')) {
    nameInput.setCustomValidity(error.message);
    const feedbackDiv = nameInput.parentElement.querySelector('.invalid-feedback');
    if (feedbackDiv) {
      feedbackDiv.textContent = error.message;
    }
    return;
  }

  notifications.error(
    error.message ||
      `Error al ${isEditing ? 'actualizar' : 'crear'} la ${config.ENTITY_NAME.toLowerCase()}.`,
  );
}

function persistInsuranceCompany(isEditing, insuranceCompanyId, formData) {
  if (isEditing) {
    storageService.insuranceCompanies.update(insuranceCompanyId, formData);
  } else {
    storageService.insuranceCompanies.add(formData);
  }
  notifications.success(
    MESSAGES.ENTITY_OPERATION_SUCCESS(config.ENTITY_NAME, isEditing ? 'actualizada' : 'creada'),
  );
}

function handleSaveInsuranceCompany({ form, insuranceCompany = {}, modal }) {
  const nameInput = form.querySelector(`[name='nombre']`);
  if (!validateForm(form, nameInput)) return;
  const formData = getFormData(form);
  const isEditing = Boolean(insuranceCompany.id);
  try {
    persistInsuranceCompany(isEditing, insuranceCompany.id, formData);
    loadInsuranceCompanies();
    modal.hide();
  } catch (error) {
    handleSaveError(error, nameInput, isEditing);
  }
}

function openInsuranceCompanyModal(insuranceCompany = {}) {
  const { ENTITY_NAME } = config;
  const isEditing = Boolean(insuranceCompany.id);
  let initialData = {};

  if (isEditing) {
    initialData = storageService.insuranceCompanies.getById(insuranceCompany.id);
  }

  const form = tpl.createInsuranceCompanyForm(initialData);

  createReusableModal({
    title: `${isEditing ? 'Editar' : 'Agregar'} ${ENTITY_NAME}`,
    id: isEditing ? `edit-${ENTITY_NAME}-modal-${insuranceCompany.id}` : `add-${ENTITY_NAME}-modal`,
    body: form,
    footerButtons: [
      {
        text: 'Cerrar',
        className: 'btn btn-secondary',
        onClick: (_, modal) => modal.hide(),
      },
      {
        text: 'Guardar',
        className: 'btn btn-primary',
        onClick: (_, modal) => {
          handleSaveInsuranceCompany({ form, insuranceCompany, modal });
        },
      },
    ],
  });
}

/**
 *
 * @param {HTMLTableElement} tableElement
 */
function attachTableListeners(tableElement) {
  tableElement.addEventListener('click', (event) => {
    const editButton = event.target.closest('.edit-btn');
    const deleteButton = event.target.closest('.delete-btn');

    if (editButton) {
      const insuranceCompanyId = Number(editButton.dataset.id);
      openInsuranceCompanyModal({ id: insuranceCompanyId });
      return;
    }

    if (deleteButton) {
      const insuranceCompanyId = Number(deleteButton.dataset.id);
      handleDeleteInsuranceCompany(insuranceCompanyId);
    }
  });
}

function handleDeleteInsuranceCompany(insuranceCompanyId) {
  ui.showConfirmModal({
    message: MESSAGES.CONFIRM_DELETE(config.ENTITY_NAME),
    onConfirm: () => {
      try {
        storageService.insuranceCompanies.remove(insuranceCompanyId);
        notifications.success(MESSAGES.ENTITY_DELETE_SUCCESS(config.ENTITY_NAME));
        loadInsuranceCompanies();
      } catch (error) {
        console.error(error);
        notifications.error(error.message || MESSAGES.ENTITY_DELETE_ERROR(config.ENTITY_NAME));
      }
    },
  });
}
export default function init() {
  renderInsuranceCompaniesPage();
  loadInsuranceCompanies();
  setupInsuranceCompaniesEventListeners();
}
