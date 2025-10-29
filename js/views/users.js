import { api } from '../api.js';
import * as tpl from '../core/templates.js'
import * as ui from '../core/ui.js'
import { createPagination } from '../components/pagination.js';

const ENTITY_NAME = "Usuarios"
const SELECTORS = {
    USERS_TABLE_CONTAINER: "users-table-container",
    PAGINATION_CONTAINER: "pagination-container",
};
const PAGE_LIMIT = 10;

export function init() {
    const breadcrumbHTML = tpl.createBreadcrumb([
        { text: "Dashboard", href: "#dashboard", active: false },
        { text: ENTITY_NAME, href: "#usuarios", active: true },
    ]);

    let pageHtml = `
        ${breadcrumbHTML}
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-body mb-3 mb-md-0">Listado de ${ENTITY_NAME}</h1>
        </div>

        <div class="card">
            <div class="card-header">
                ${ENTITY_NAME}
            </div>
            <div class="card-body">
                <div id="${SELECTORS.USERS_TABLE_CONTAINER}">
                </div>
            </div>
        </div>
    `;

    pageHtml = tpl.createSectionWrapper(`${ENTITY_NAME}-section`, pageHtml);
    ui.renderContent(pageHtml);

    loadUsers(1); // Load the first page initially
}

async function loadUsers(page = 1) {
    const tableContainer = document.getElementById(SELECTORS.USERS_TABLE_CONTAINER);
    let paginationContainer =document.getElementById(SELECTORS.PAGINATION_CONTAINER);

    if (!paginationContainer) {
      paginationContainer = document.createElement("div")
      paginationContainer.id = SELECTORS.PAGINATION_CONTAINER;

    }
     const headers = ["Id", "Nombre", "Apellido", "Correo", "Usuario"];
        let rowsHtml = Array.from({ length: 10 }).fill(null).map(tpl.createUserSkeletonRow).join("");
        let tableHtml = ui.renderTable(headers, rowsHtml);
        tableContainer.innerHTML = tableHtml;

    // tableContainer.innerHTML = `<p>Cargando ${ENTITY_NAME.toLowerCase()}...</p>`;

    try {
        const skip = (page - 1) * PAGE_LIMIT;
        const { users, total, limit } = await api.fetchUsers({ limit: PAGE_LIMIT, skip });

        if (users.length === 0) {
            tableContainer.innerHTML = `<p class="text-muted">No hay ${ENTITY_NAME.toLowerCase()} registradas.</p>`;
            return;
        }

         rowsHtml = users.map(tpl.createUserRow).join("");
         tableHtml = ui.renderTable(headers, rowsHtml);
        tableContainer.innerHTML = tableHtml;

        const pagination = createPagination({ total, skip, limit }, (newPage) => {
            loadUsers(newPage);
        });
        paginationContainer.innerHTML = '';
        paginationContainer.appendChild(pagination);
        tableContainer.insertAdjacentElement("afterend", paginationContainer);

    } catch (error) {
        console.error(`Error cargando ${ENTITY_NAME.toLowerCase()}`, error);
        tableContainer.innerHTML = `<p class="text-danger">Error al cargar los ${ENTITY_NAME.toLowerCase()}.</p>`;
    }
}
