import storageService from "../storage/index.js";
import * as ui from "../core/ui.js";
import * as tpl from "../core/templates.js";
import { MESSAGES } from "../shared/constants.js";

const SELECTORS = {
  DOCTOR_SELECT: "doctor-select",
  APPOINTMENTS_TABLE_CONTAINER: "turnos-table-container",
  APPOINTMENTS_CARD: "appointments-card",
};

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
    container.innerHTML = '<p class="text-muted">Seleccione un doctor.</p>';
    card.classList.add("d-none");
    return;
  }

  container.innerHTML = "<p>Cargando turnos...</p>";

  const appointments = storageService.appointments
    .getByDoctorId(Number(doctorId))
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  if (appointments.length === 0) {
    container.innerHTML = '<p class="text-muted">Sin turnos disponibles.</p>';
    return;
  }

  const headers = ["Fecha-Hora", "Estado"];
  const rows = appointments.map(
    (a) =>
      `<tr>
      <td>${formatDateTime(a.fechaHora)}</td>
      <td>${a.disponible ? "Disponible ✅" : "Res. ❌"}</td>
    </tr>`
  );

  const table = ui.renderTable(headers, rows.join(""));
  container.innerHTML = table;
}
