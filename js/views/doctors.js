import { api } from "../api.js";
import { getFormData, renderForm } from "../components/form.js";
import { createReusableModal, MODAL_SIZES } from "../components/modal.js";
import notification from "../components/notifications.js";
import { showSpinner } from "../components/spinner.js";
import { MESSAGES } from "../shared/constants.js";
import { formatCurrency } from "../shared/currency.js";
import { readFileAsDataURL } from "../shared/file-reader.js";
import { buttonState } from "../shared/ui.js";
import { createCrudView } from "./crud.js";

const SELECTORS = {
  TABLE_BODY: "#doctors-table-body",
  ADD_BUTTON: "#add-doctor-btn",
};

let state = {
  doctors: [],
  specialties: [],
  insuranceCompanies: [],
};

function fullName(doctor) {
  return `${doctor.apellido}, ${doctor.nombre}`
} 


async function handleShowDoctor(doctorId) {
  const modal = createReusableModal({
    id: `show-doctor-modal-${doctorId}`,
    title: "Perfil del Profesional",
    size: MODAL_SIZES.LARGE,
    body: "",
    footerButtons: [
      {
        text: "Cerrar",
        className: "btn btn-secondary",
        onClick: (_, modal) => modal.hide(),
      },
    ],
  });

  const removeSpinner = showSpinner(
    modal.getElement().querySelector(".modal-body"),
    {
      text: "Cargando informacion...",
    }
  );

  try {

    const doctor = await api.getDoctorById(doctorId);
    const {specialties, insuranceCompanies}  = state
    const specialty = specialties.find(
      (s) => s.id === doctor.especialidadId
    );
    const insuranceIds = doctor.obraSocialIds;
    const acceptedInsuranceCompanies = insuranceCompanies
      .filter((ic) => insuranceIds.includes(ic.id))
      .map((ic) => ic.nombre);

    modal.getElement().querySelector(".modal-body").innerHTML = `
        <div class="row">
                            <div class="col-md-4 text-center">
                                <img src="${doctor.foto}" alt="${fullName(doctor)
      }" class="img-fluid object-fit-cover rounded-circle mb-3" style="width: 150px; height: 150px;  border: 3px solid var(--color-accent);" >
                                <h4 class="text-primary">${fullName(doctor)
      }</h4>
                                <p class="text-accent fw-semibold">${specialty.nombre
      }</p>
                            </div>
                            <div class="col-md-8">
                                <div class="mb-4">
                                    <h6 class="text-primary fw-bold">Información Profesional</h6>
                                    <p class="mb-2"><strong>Matrícula:</strong> ${doctor.matriculaProfesional
      }</p>
                                    <p class="mb-2"><strong>Valor de Consulta:</strong> <span class="text-accent fw-bold">${formatCurrency(
        doctor.valorConsulta
      )}</span></p>
                                </div>


                                    <div class="mb-4">
                                        <h6 class="text-primary fw-bold">Descripción</h6>
                                        <p class="text-muted">${doctor.descripcion
      }</p>
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
    modal.getElement().querySelector(".modal-body").innerHTML =
      `<div class="alert alert-danger">${MESSAGES.ENTITY_LOAD_ERROR("información del profesional")}</div>`;
  } finally {
    removeSpinner();
  }
}

const removeDoctorTableRow = (doctorId) => {
  const row = document.querySelector(
    `${SELECTORS.TABLE_BODY} tr[data-id="${doctorId}"]`
  );
  row?.remove();
  window.checkEmptyState?.();

};

const addDoctorTableRow = (doctor) => {
  const tableBody = document.querySelector(SELECTORS.TABLE_BODY);
  const newRowHTML = createDoctorTableRow(doctor);
  tableBody?.insertAdjacentHTML("beforeend", newRowHTML);
};

const updateDoctorTableRow = (doctor) => {
  const row = document.querySelector(
    `${SELECTORS.TABLE_BODY} tr[data-id="${doctor.id}"]`
  );
  if (row) {
    const newRowHTML = createDoctorTableRow(doctor);
    row.outerHTML = newRowHTML;
  }
};

async function handleDoctorFormSubmit({
  event,
  form,
  modal,
  action,
  doctorId,
}) {
  form.classList.add("was-validated");
  if (!form.checkValidity()) {
    return;
  }

  const formData = getFormData(form);
  formData.especialidadId = Number(formData.especialidadId);
  formData.valorConsulta = Number(formData.valorConsulta);
  // Asegurarse de que insuranceIds sea un array de números
  formData.obraSocialIds = Array.isArray(formData.obraSocialIds)
    ? formData.obraSocialIds.map(Number)
    : [Number(formData.obraSocialIds)].filter(Boolean);

  // Manejar la carga de la imagen
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
  const { restore } = buttonState.disable(event.target, "Guardando...");

  action({ id: doctorId, data: formData })
    .then((data) => {
      const isUpdate = !!doctorId
      notification.success(MESSAGES.ENTITY_OPERATION_SUCCESS("El médico", isUpdate ? "actualizado": "creado"));
      doctorId ?
        updateDoctorTableRow(data) :
        addDoctorTableRow(data);
      modal.hide();
    })
    .catch((error) => {
      console.error(error);
      notification.error(MESSAGES.ENTITY_OPERATION_ERROR("médico", "guardar"));
    })
    .finally(() => {
      restore?.();
    });
}

async function openDoctorModal(doctor) {
  const isEditing = Boolean(doctor?.id);
  const modalId = isEditing
    ? `edit-doctor-modal-${doctor.id}`
    : "add-doctor-modal";
  const title = isEditing ? "Editar Médico" : "Agregar Médico";
  const action = isEditing ? api.updateDoctor : api.createDoctor;

  const modal = createReusableModal({
    id: modalId,
    title,
    size: MODAL_SIZES.LARGE,
    body: renderForm([]), 
    footerButtons: [
      {
        text: "Cerrar",
        className: "btn btn-secondary",
        onClick: (_, modal) => modal.hide(),
      },
      { text: "Guardar", className: "btn btn-primary", disabled: true },
    ],
  });

  const modalBody = modal.getElement().querySelector(".modal-body");
  const removeSpinner = showSpinner(modalBody, {
    text: "Cargando formulario...",
  });

  try {
   
    const doctorData = isEditing ? await api.getDoctorById(doctor.id) : {};
    removeSpinner();

    const form = renderForm(
      [
        { name: "nombre", label: "Nombre", type: "text", required: true },
        { name: "apellido", label: "Apellido", type: "text", required: true },
        {
          name: "matriculaProfesional",
          label: "Matrícula",
          type: "number",
          required: true,
        },
        {
          name: "especialidadId",
          label: "Especialidad",
          type: "select",
          required: true,
          options: state.specialties.map((s) => ({
            value: s.id,
            text: s.nombre,
          })),
        },
        {
          name: "valorConsulta",
          label: "Valor Consulta ($)",
          type: "number",
          required: true,
          attributes: { step: "0.01" },
        },
        {
          name: "foto",
          label: "Foto",
          type: "file",
          required: !isEditing,
          attributes: { accept: "image/*" },
        },
        { name: "descripcion", label: "Descripción", type: "textarea" },
        {
          name: "obraSocialIds",
          label: "Obras Sociales",
          type: "select",
          multiple: true,
          options: state.insuranceCompanies.map((i) => ({
            value: i.id,
            text: i.nombre,
          })),
        },
      ],
      doctorData
    );

    modalBody.innerHTML = "";
    modalBody.appendChild(form);

    const saveButton = modal
      .getElement()
      .querySelector(".modal-footer .btn-primary");
    saveButton.disabled = false;
    saveButton.onclick = (event) => {
      handleDoctorFormSubmit({
        event,
        form,
        modal,
        action,
        doctorId: doctor?.id,
      });
    };
  } catch (error) {
    console.error("Error al abrir el modal de médico:", error);
    notification.error("No se pudo cargar la información para el formulario.");
    modal.hide();
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
          const {restore:buttonRestore} = buttonState.disable(event.target, "Eliminando...");
          api
            .deleteDoctor({ id: doctorId })
            .then(() => {
              removeDoctorTableRow(doctorId);
              notification.success(MESSAGES.ENTITY_DELETE_SUCCESS("médico"));
              modal.hide();
            })
            .catch((error) => {
              console.error(error);
              notification.error(
                MESSAGES.ENTITY_DELETE_ERROR("médico")
              );
              buttonRestore?.();
            });
        },
      },
    ],
  });
}

function handleTableClick(event) {
  const editButton = event.target.closest(".edit-btn");
  const deleteButton = event.target.closest(".delete-btn");
  const showButton = event.target.closest(".show-btn");
  if (showButton) {
    return handleShowDoctor(+showButton.dataset.id);
  }
  if (editButton) {
    return openDoctorModal({ id: Number(editButton.dataset.id) });
  }
  if (deleteButton) {
    return handleDeleteDoctor(Number(deleteButton.dataset.id));
  }
}

function createDoctorTableRow(doctor, isHeader = false) {
  if (isHeader) {
    return `
            <tr>
                <th scope="col">#</th>
                <th scope="col">Foto</th>
                <th scope="col">Nombre</th>
                <th scope="col">Especialidad</th>
                <th>Acciones</th>
            </tr>
        `;
  }
  const specialtyName =
    state.specialties.find((s) => s.id === doctor.especialidadId)?.nombre || "N/A";
  return `
      <tr data-id="${doctor.id}">
        <td>${doctor.id}</td>
        <td>
          <img src="${doctor.foto}" alt="${doctor.nombre}" class="img-thumbnail object-fit-cover rounded-circle" width="64">
        </td>
        <td>${fullName(doctor)}</td>
        <td>${specialtyName}</td>
        <td>
          <div class="d-flex flex-column flex-md-row gap-2">
            <button class="btn btn-sm btn-outline-secondary show-btn" data-id="${doctor.id}">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${doctor.id}">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${doctor.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
}


async function loadData() {
    const [doctors, specialties, insuranceCompanies] = await Promise.all([
    api.getDoctors(),
    api.getSpecialties(),
    api.getInsuranceCompanies(),
  ]);
  state = { ...state, doctors, specialties, insuranceCompanies };
  return {doctors, specialties, insuranceCompanies}
}

async function fetchData() {
  const {doctors} = await loadData();
  return doctors;
}

export const renderDoctors = createCrudView({
  entityName: "Medico",
  entityNamePlural: "Medicos",
  sectionId: "medicos-section",
  tableId: "doctors-table",
  addButtonId: "add-doctor-btn",
  tableBodyId: "doctors-table-body",
  fetchData,
  createTableRow: createDoctorTableRow,
  handleTableClick,
  onAddButtonClick: () => openDoctorModal(),
});