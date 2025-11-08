import storageService from "../storage/index.js";
import * as ui from "../core/ui.js";
import { formatDateTime } from "../shared/formatters.js";
import { createAndRenderAlertWithLink } from "../components/notifications.js";

const SELECTORS = {
  DOCTOR_SELECT: "doctor-select",
  APPOINTMENTS_TABLE_CONTAINER: "turnos-table-container",
  APPOINTMENTS_CARD: "appointments-card",
};

/**
 * Guarda el ID del médico y el ID del turno en sessionStorage
 * y redirige a la página de reserva.
 * @param {number} doctorId - ID del médico.
 * @param {number} appointmentId - ID del turno seleccionado.
 */
function selectAppointment(doctorId, appointmentId) {
  storageService.session.setAppointmentSelection({ doctorId, appointmentId });
  window.location.href = "reserva.html";
}


function attachTableListener(tableContainer, doctorId) {
  tableContainer.addEventListener("click", (event) => {
    const selectedRow = event.target.closest("[data-id-turno]");
    if (!selectedRow) return;
    const appointmentId = selectedRow.dataset.idTurno;
    selectAppointment(doctorId, appointmentId);
  })
}


export function loadAppointments(doctorId) {
  const container = document.getElementById(SELECTORS.APPOINTMENTS_TABLE_CONTAINER);

  if (!doctorId) {
    createAndRenderAlertWithLink({
      containerElement: container,
      message: 'Seleccione un profesional en Catálogo.'
    })
    return;
  }

  const allAppointments = storageService.appointments.getByDoctorId(Number(doctorId));
  const availableAppointments = allAppointments
    .filter((a) => a.disponible)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  if (availableAppointments.length === 0) {
    createAndRenderAlertWithLink({
      message: 'No tiene turnos disponible en este momento.',
      containerElement: container,
      alertType: 'warning'
    })
    return;
  }

  const headers = ["Fecha y Hora"];

  const rows = availableAppointments.map((a) => {
    return `<tr
        class="cursor-pointer"
        data-id-turno="${a.id}">
      <td>${formatDateTime(a.fechaHora)}</td>
    </tr>`;
  });

  const table = ui.renderTable(headers, rows.join(""));
  attachTableListener(container, doctorId);
  container.innerHTML = table;
}
