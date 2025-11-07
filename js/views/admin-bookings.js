import { createPagination } from "../components/pagination.js";
import * as tpl from "../core/templates.js";
import * as ui from "../core/ui.js";
import storageService from "../storage/index.js";



const config = {
	ENTITY_NAME: "Reserva",
	ENTITY_NAME_PLURAL: "Reservas",
	BOOKING_TABLE_CONTAINER: "bookings-table-container",
	PAGINATION_CONTAINER: "pagination-container",
	TABLE_HEADERS: [
		"ID",
		"Documento",
		"Paciente",
		"Obra Social",
		"Fecha Turno",
		"Médico",
		"Especialidad",
		"Monto Total",
	],
};

const paginationConfig = {
  itemsPerPage: 5
}

function renderAdminBookingPage() {
	const {
		ENTITY_NAME,
		ENTITY_NAME_PLURAL,
		BOOKING_TABLE_CONTAINER,
		PAGINATION_CONTAINER,
	} = config;
	const breadcrumbHTML = tpl.createBreadcrumb([
		{ text: "Dashboard", href: "#dashboard", active: false },
		{
			text: ENTITY_NAME_PLURAL,
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
            <div class="card-body">
                <div id="${BOOKING_TABLE_CONTAINER}">
                </div>
                <div id="${PAGINATION_CONTAINER}"></div>
            </div>
        </div>
    `;

	pageHtml = tpl.createSectionWrapper(`${ENTITY_NAME}-section`, pageHtml);
	ui.renderContent(pageHtml);
}

function handleNoBookings(tableContainer, entityNamePlural) {
	tableContainer.innerHTML = `<p class="text-muted">No hay ${entityNamePlural.toLowerCase()} registradas.</p>`;
}

function renderBookingsTable(bookings, tableContainerElement, headers) {
	const rowsHtml = bookings.map(tpl.createBookingRow).join("");
	const tableHtml = ui.renderTable(headers, rowsHtml);
	tableContainerElement.innerHTML = tableHtml;
}

function renderPagination(containerElement,total, page) {
	const { itemsPerPage } = paginationConfig;
	if (total <= itemsPerPage) return;
	containerElement.innerHTML = "";
	const skip = (page - 1) * itemsPerPage;
	const pagination = createPagination(
		{ total, skip, limit: itemsPerPage },
		refreshBookingsView,
	);
	containerElement.append(pagination);
}

function getPaginatedBookings(bookings, page, limit) {
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	return bookings.slice(startIndex, endIndex);
}

function renderCurrentPageBookings(containerElement, bookings, page) {
	const paginatedBookings = getPaginatedBookings(bookings, page, paginationConfig.itemsPerPage);
	renderBookingsTable(paginatedBookings, containerElement, config.TABLE_HEADERS);
}

function renderPage(bookings,elements,page) {
	const total = bookings.length;
	if (total === 0) {
		handleNoBookings(elements.table, config.ENTITY_NAME_PLURAL);
		return;
	}
	renderCurrentPageBookings(elements.table, bookings, page);
	renderPagination(elements.pagination, total, page);
}

function refreshBookingsView(page = 1) {
  const elements = {
    table: document.getElementById(config.BOOKING_TABLE_CONTAINER),
    pagination: document.getElementById(config.PAGINATION_CONTAINER),
  }
  const allBookings = storageService.bookings.getAll();
  renderPage(allBookings, elements, page);

}
export default function init() {
	renderAdminBookingPage();
	refreshBookingsView();
}
