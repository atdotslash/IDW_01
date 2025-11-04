import { apiService } from '../api.js';
import * as tpl from '../core/templates.js';
import * as ui from '../core/ui.js';
import { createPagination } from '../components/pagination.js';

const config = {
  ENTITY_NAME: 'Usuario',
  ENTITY_NAME_PLURAL: 'Usuarios',
  USERS_TABLE_CONTAINER: 'users-table-container',
  PAGINATION_CONTAINER: 'pagination-container',
  ITEM_PER_PAGE: 10,
  TABLE_HEADERS: ['Id', 'Nombre', 'Apellido', 'Correo', 'Usuario'],
};
const SELECTORS = {
  PAGINATION_CONTAINER_ID: `#${config.PAGINATION_CONTAINER}`,
  USERS_TABLE_CONTAINER_ID: `#${config.USERS_TABLE_CONTAINER}`,
};

function renderUsersPage() {
  const { ENTITY_NAME, ENTITY_NAME_PLURAL, USERS_TABLE_CONTAINER } = config;
  const breadcrumbHTML = tpl.createBreadcrumb([
    { text: 'Dashboard', href: '#dashboard', active: false },
    {
      text: ENTITY_NAME,
      href: `#${ENTITY_NAME_PLURAL.toLowerCase()}`,
      active: true,
    },
  ]);
  let pageHtml = `
        ${breadcrumbHTML}
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-body mb-3 mb-md-0">Listado de ${ENTITY_NAME_PLURAL}</h1>
        </div>

        <div class="card">
            <div class="card-header">
                ${ENTITY_NAME}
            </div>
            <div class="card-body">
                <div id="${USERS_TABLE_CONTAINER}">
                </div>
            </div>
        </div>
    `;

  pageHtml = tpl.createSectionWrapper(`${ENTITY_NAME}-section`, pageHtml);
  ui.renderContent(pageHtml);
}

function renderUsersTable(users, tableContainerElement, headers) {
  const rowsHtml = users.map(tpl.createUserRow).join('');
  const tableHtml = ui.renderTable(headers, rowsHtml);
  tableContainerElement.innerHTML = tableHtml;
}

function renderPagination(total, page) {
  const { ITEM_PER_PAGE } = config;
  const skip = (page - 1) * ITEM_PER_PAGE;
  const pagination = createPagination({ total, skip, limit: ITEM_PER_PAGE }, loadUsers);

  let paginationContainer = document.getElementById(config.PAGINATION_CONTAINER);

  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.className = 'mt-3 mt-md-2';
    paginationContainer.id = config.PAGINATION_CONTAINER;
    document
      .querySelector(SELECTORS.USERS_TABLE_CONTAINER_ID)
      ?.insertAdjacentElement('afterend', paginationContainer);
  }
  paginationContainer.innerHTML = '';
  paginationContainer.append(pagination);
}

function renderSkeletonTable(tableContainer) {
  const { ITEM_PER_PAGE, TABLE_HEADERS } = config;
  const rowsHtml = Array.from({ length: ITEM_PER_PAGE })
    .fill(null)
    .map(tpl.createUserSkeletonRow)
    .join('');
  const tableHtml = ui.renderTable(TABLE_HEADERS, rowsHtml);
  tableContainer.innerHTML = tableHtml;
}

function handleNoUsers(tableContainer, entityNamePlural) {
  tableContainer.innerHTML = `<p class="text-muted">No hay ${entityNamePlural.toLowerCase()} registrados.</p>`;
}

function handleLoadUsersError(tableContainer, entityNamePlural, error) {
  console.error(`Error cargando ${entityNamePlural.toLowerCase()}`, error);
  tableContainer.innerHTML = `<p class="text-danger">Error al cargar los ${entityNamePlural.toLowerCase()}.</p>`;
}

async function loadUsers(page = 1) {
  const { ITEM_PER_PAGE, ENTITY_NAME_PLURAL, TABLE_HEADERS } = config;
  const tableContainer = document.getElementById(config.USERS_TABLE_CONTAINER);

  renderSkeletonTable(tableContainer);

  try {
    const skip = (page - 1) * ITEM_PER_PAGE;
    const { users, total } = await apiService.fetchUsers({
      limit: ITEM_PER_PAGE,
      skip,
    });

    if (users.length === 0) {
      handleNoUsers(tableContainer, ENTITY_NAME_PLURAL);
      return;
    }

    renderUsersTable(users, tableContainer, TABLE_HEADERS);

    renderPagination(total, page);
  } catch (error) {
    handleLoadUsersError(tableContainer, ENTITY_NAME_PLURAL, error);
  }
}

export default function init() {
  renderUsersPage();
  loadUsers(1);
}
