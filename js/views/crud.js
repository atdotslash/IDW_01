import { replaceContentWithSpinner } from "../components/spinner.js";
import { MESSAGES } from "../shared/constants.js";



export function createCrudView(config) {
  const {
    entityName,
    entityNamePlural,
    sectionId,
    tableId,
    addButtonId,
    tableBodyId,
    fetchData,
    createTableRow,
    handleTableClick,
    onAddButtonClick,
  } = config;


  function renderEmptyState(container) {
    container.innerHTML = `<div class="py-5 text-center"><p class="text-muted">No hay ${entityNamePlural.toLowerCase()} registrados.</p></div>`;
  }
  function checkAndUpdateEmptyState(container) {
    const tableBody = container.querySelector(`#${tableBodyId}`);
    if (tableBody?.querySelectorAll('tr').length === 0) {
      renderEmptyState(container);
    }
  }
  /**
   * Renderiza la tabla de datos.
   * @param {any[]} data - Los datos a renderizar.
   * @param {HTMLElement} container - El contenedor de la tabla.
   */
  function renderTable(data, container) {
    if (data.length === 0) {
      renderEmptyState(container);
      return;
    }

    const tableHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            ${createTableRow(null, true)}
          </thead>
          <tbody id="${tableBodyId}">
            ${data.map((item) => createTableRow(item, false)).join("")}
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = tableHTML;
    container
      .querySelector(`#${tableBodyId}`)
      ?.addEventListener("click", handleTableClick);
  }

  /**
   * Renderiza la vista completa en el contenedor proporcionado.
   * @param {HTMLElement} container - El contenedor principal.
   */
  return function render(container) {
    container.innerHTML = `
      <section id="${sectionId}" class="content-section">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#dashboard">Dashboard</a></li>
            <li class="breadcrumb-item active" aria-current="page">${entityNamePlural}</li>
          </ol>
        </nav>
        <div class="d-flex flex-column flex-lg-row gap-2 gap-lg-0 justify-content-between align-items-center my-4">
          <h2 class="m-0 text-body">Gestión de ${entityNamePlural}</h2>
          <button id="${addButtonId}" class="btn align-self-stretch btn-primary">
            <i class="fa-solid fa-plus me-2"></i>Agregar ${entityName}
          </button>
        </div>
        <div class="card bg-light">
          <div class="card-header">
            <h5 class="card-title m-0">Todos los ${entityNamePlural}</h5>
          </div>
          <div class="card-body">
            <div id="${tableId}"></div>
          </div>
        </div>
      </section>
    `;

    container
      .querySelector(`#${addButtonId}`)
      ?.addEventListener("click", onAddButtonClick);

    const tableContainer = container.querySelector(`#${tableId}`);
    const { hide: removeSpinner } = replaceContentWithSpinner(
					tableContainer,
					{
						text: `Cargando ${entityNamePlural.toLowerCase()}...`,
					},
				);

				fetchData()
					.then((data) => {
						renderTable(data, tableContainer);
					})
					.catch((error) => {
						const message = MESSAGES.ENTITY_LOAD_ERROR(entityNamePlural);
						console.error(`Error: ${message}:`, error);
						tableContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
					})
					.finally(removeSpinner);
    return {
      checkEmptyState: () => checkAndUpdateEmptyState(tableContainer)
    };


  };
}
