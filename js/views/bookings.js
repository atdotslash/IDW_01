import storageService from "../storage/index.js";
import * as ui from "../core/ui.js";
import * as tpl from "../core/templates.js";
import { MESSAGES } from "../shared/constants.js";

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
window.selectAppointment = selectAppointment;

function formatDateTime(dateString) {
  const date = new Date(dateString);

  return date
    .toLocaleString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", ""); // Quita la coma fea entre fecha/hora
}

export function loadAppointments(doctorId) {
  const card = document.getElementById(SELECTORS.APPOINTMENTS_CARD);
  const container = document.getElementById(SELECTORS.APPOINTMENTS_TABLE_CONTAINER);

  if (!doctorId) {
    container.innerHTML = '<p class="text-muted">Seleccione un profesional en Catálogo.</p>';
    card.classList.add("d-none");
    return;
  }

  container.innerHTML = '<img src="/assets/loader.svg" class="loader" alt="loading">';

  const allAppointments = storageService.appointments.getByDoctorId(Number(doctorId));
  const availableAppointments = allAppointments
    .filter((a) => a.disponible)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  if (availableAppointments.length === 0) {
    container.innerHTML = '<p class="text-muted">Sin turnos disponibles.</p>';
    return;
  }

  const headers = ["Fecha y Hora"];

  const rows = availableAppointments.map((a) => {
    return `<tr 
        class="clickable-row" 
        data-id-turno="${a.id}" 
        onclick="selectAppointment(${doctorId}, ${a.id})">
      <td>${formatDateTime(a.fechaHora)}</td>
    </tr>`;
  });

  const table = ui.renderTable(headers, rows.join(""));
  container.innerHTML = table;
}
