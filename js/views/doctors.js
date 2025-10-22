import storageService from "../storage/index.js";
import { getFormData } from "../components/form.js";
import { createReusableModal, MODAL_SIZES } from "../components/modal.js";
import notification from "../components/notifications.js";
import { replaceContentWithSpinner } from "../components/spinner.js";
import * as ui from "../core/ui.js";
import * as tpl from "../core/templates.js";
import { MESSAGES } from "../shared/constants.js";
import { formatCurrency, fullName } from "../shared/formatters.js";
import { readFileAsDataURL } from "../shared/file-reader.js";
import { disableButton } from "../shared/ui.js";

const SELECTORS = {
    ADD_DOCTOR_BUTTON: "add-doctor-btn",
    DOCTORS_TABLE_CONTAINER: "doctors-table-container",
};

let state = {
  doctors: [],
  specialties: [],
  insuranceCompanies: [],
};

export function init() {
    const breadcrumbHTML = tpl.createBreadcrumb([
        { text: "Dashboard", href: "#dashboard", active: false },
        { text: "Médicos", href: "#medicos", active: true },
    ]);

    let pageHtml = `
        ${breadcrumbHTML}
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-body mb-3 mb-md-0">Gestión de Médicos</h1>
            <div class="btn-toolbar">
                <button type="button" class="btn btn-primary" id="${SELECTORS.ADD_DOCTOR_BUTTON}">
                    <i class="fa fa-plus-circle me-1"></i>
                    Agregar Médico
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                Listado de Médicos
            </div>
            <div class="card-body">
                <div id="${SELECTORS.DOCTORS_TABLE_CONTAINER}">
                </div>
            </div>
        </div>
    `;

    pageHtml = tpl.createSectionWrapper("medicos-section", pageHtml);
    ui.renderContent(pageHtml);

    loadDoctors();
    attachListeners();
}

function loadDoctors() {
    const tableContainer = document.getElementById(SELECTORS.DOCTORS_TABLE_CONTAINER);
    const { hide: removeSpinner } = replaceContentWithSpinner(tableContainer);

    try {
        const doctors = storageService.doctors.getAll();
        const specialties = storageService.specialties.getAll();
        const insuranceCompanies = storageService.insuranceCompanies.getAll();

        state = { doctors, specialties, insuranceCompanies };

        if (doctors.length === 0) {
            tableContainer.innerHTML = '<p class="text-muted">No hay médicos registrados.</p>';
            return;
        }

        const headers = ["#", "Foto", "Nombre", "Especialidad", "Acciones"];
        const rowsHtml = doctors.map(doctor => {
            const doctorForTable = {
                ...doctor,
                fullName: fullName(doctor),
                specialtyName: state.specialties.find(s => s.id === doctor.especialidadId)?.nombre || "N/A"
            };
            return tpl.createDoctorTableRow(doctorForTable);
        }).join("");

        const tableHtml = ui.renderTable(headers, rowsHtml);
        tableContainer.innerHTML = tableHtml;

        attachTableListeners(tableContainer);
    } catch (error) {
        console.error("Error loading doctors:", error);
        tableContainer.innerHTML = '<p class="text-danger">Error al cargar los médicos.</p>';
    } finally {
        removeSpinner();
    }
}

async function handleSaveDoctor({ form, doctor = {}, modal }) {
    form.classList.add("was-validated");
    if (!form.checkValidity()) {
        return;
    }

    const isEditing = Boolean(doctor.id);
    const formData = getFormData(form);
    formData.especialidadId = Number(formData.especialidadId);
    formData.valorConsulta = Number(formData.valorConsulta);
    formData.obraSocialIds = Array.isArray(formData.obraSocialIds)
        ? formData.obraSocialIds.map(Number)
        : [Number(formData.obraSocialIds)].filter(Boolean);

    const photoInput = form.querySelector('input[name="foto"]');
    if (photoInput.files[0]) {
        try {
            formData.foto = await readFileAsDataURL(photoInput.files[0]);
        } catch {
            notification.error("Hubo un error al procesar la imagen.");
            return;
        }
    } else {
        delete formData.foto;
    }


    try {
        if (isEditing) {
            storageService.doctors.update(doctor.id, formData);
        } else {
            storageService.doctors.add(formData);
        }
        notification.success(MESSAGES.ENTITY_OPERATION_SUCCESS("El médico", isEditing ? "actualizado" : "creado"));
        loadDoctors();
    } catch (error) {
        console.error(error);
        notification.error(MESSAGES.ENTITY_OPERATION_ERROR("médico", "guardar"));
    } finally {
      modal.hide()
    }
}

function openDoctorModal(doctor = {}) {
    const isEditing = Boolean(doctor.id);
    const title = isEditing ? "Editar Médico" : "Agregar Médico";

    const modal = createReusableModal({
        id: isEditing ? `edit-doctor-modal-${doctor.id}` : "add-doctor-modal",
        title,
        size: MODAL_SIZES.LARGE,
        body: '',
        footerButtons: [
            { text: "Cerrar", className: "btn btn-secondary", onClick: () => modal.hide() },
            { text: "Guardar", className: "btn btn-primary" },
        ],
    });

    const modalBody = modal.getElement().querySelector(".modal-body");

    try {
        const doctorData = isEditing ? storageService.doctors.getById(doctor.id) : {};

        const form = tpl.createDoctorForm(doctorData, state.specialties, state.insuranceCompanies);
        modalBody.innerHTML = '';
        modalBody.appendChild(form);

        const saveButton = modal.getElement().querySelector(".modal-footer .btn-primary");
        saveButton.onclick = () => {
            handleSaveDoctor({  form, doctor, modal });
        };

    } catch  {
        notification.error("No se pudo cargar la información para el formulario.");
      }
}

function handleDeleteDoctor(doctorId) {
  createReusableModal({
    id: `delete-doctor-modal-${doctorId}`,
    title: "Confirmar Eliminación",
    body: `<p>${MESSAGES.CONFIRM_DELETE("médico")}</p>`,
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
          const {restore:buttonRestore} = disableButton(event.target, "Eliminando...");
          try {
              storageService.doctors.remove(doctorId);
              notification.success(MESSAGES.ENTITY_DELETE_SUCCESS("médico"));
              modal.hide();
              loadDoctors();
          } catch(error) {
              console.error(error);
              notification.error(MESSAGES.ENTITY_DELETE_ERROR("médico"));
              buttonRestore();
          }
        },
      },
    ],
  });
}

function handleShowDoctor(doctorId) {
  const modal = createReusableModal({
    id: `show-doctor-modal-${doctorId}`,
    title: "Perfil del Profesional",
    size: MODAL_SIZES.LARGE,
    body: "",
    footerButtons: [
      {
        text: "Cerrar",
        className: "btn btn-secondary",
        onClick: () => modal.hide(),
      },
    ],
  });

  const modalBody = modal.getElement().querySelector(".modal-body");

  try {
    const doctor = storageService.doctors.getById(doctorId);
    const {specialties, insuranceCompanies}  = state
    const specialty = specialties.find(
      (s) => s.id === doctor.especialidadId
    );
    const insuranceIds = doctor.obraSocialIds;
    const acceptedInsuranceCompanies = insuranceCompanies
      .filter((ic) => insuranceIds.includes(ic.id))
      .map((ic) => ic.nombre);

    modalBody.innerHTML = `
        <div class="row">
                            <div class="col-md-4 text-center">
                                <img src="${doctor.foto}" alt="${fullName(doctor)}" class="img-fluid object-fit-cover rounded-circle mb-3" style="width: 150px; height: 150px;  border: 3px solid var(--color-accent);" >
                                <h4 class="text-primary">${fullName(doctor)}</h4>
                                <p class="text-accent fw-semibold">${specialty.nombre}</p>
                            </div>
                            <div class="col-md-8">
                                <div class="mb-4">
                                    <h6 class="text-primary fw-bold">Información Profesional</h6>
                                    <p class="mb-2"><strong>Matrícula:</strong> ${doctor.matriculaProfesional}</p>
                                    <p class="mb-2"><strong>Valor de Consulta:</strong> <span class="text-accent fw-bold">${formatCurrency(doctor.valorConsulta)}</span></p>
                                </div>


                                    <div class="mb-4">
                                        <h6 class="text-primary fw-bold">Descripción</h6>
                                        <p class="text-muted">${doctor.descripcion}</p>
                                    </div>
                                    <div class="mb-4">
                                        <h6 class="text-primary fw-bold">Obras Sociales Aceptadas</h6>
                                        <div class="d-flex flex-wrap gap-2">

                                          ${acceptedInsuranceCompanies.length
        ? acceptedInsuranceCompanies
          .map((ic) => {
            return `<span class="badge bg-primary text-accent">${ic}</span>`;
          })
          .join("")
        : "N/A"
      }
                                        </div>
                                    </div>
                            </div>
                        </div>
        `;
  } catch (error) {
    console.error(error);
    modalBody.innerHTML =
      `<div class="alert alert-danger">${MESSAGES.ENTITY_LOAD_ERROR("información del profesional")}</div>`;
  }
}


function attachTableListeners(tableContainer) {
    tableContainer.addEventListener("click", (event) => {
        const editButton = event.target.closest(".edit-btn");
        const deleteButton = event.target.closest(".delete-btn");
        const showButton = event.target.closest(".show-btn");

        if (showButton) {
            handleShowDoctor(Number(showButton.dataset.id));
            return;
        }
        if (editButton) {
            openDoctorModal({ id: Number(editButton.dataset.id) });
            return;
        }
        if (deleteButton) {
            handleDeleteDoctor(Number(deleteButton.dataset.id));
        }
    });
}

function attachListeners() {
    document.getElementById(SELECTORS.ADD_DOCTOR_BUTTON).addEventListener("click", () => {
        openDoctorModal();
    });
}
