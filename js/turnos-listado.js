import storageService from "./storage/index.js";
import { loadAppointments } from "./views/bookings.js";

storageService.initialize();

const doctorId = storageService.session.getAppointmentData();
const medicos = storageService.doctors.getAll();

const contenedor = document.getElementById("turnosDisponibles");

if (!doctorId) {
  contenedor.innerHTML = `<p class="text-danger">No se encontró el médico. Volvé al catálogo.</p>`;
} else {
  const medico = medicos.find((el) => el.id === Number(doctorId));
  contenedor.innerHTML = `
    <h4>El profesional ${medico.nombre} ${medico.apellido}</h4>
    <h5>Tiene los siguientes turnos disponibles</h5>
  `;
  loadAppointments(doctorId);
}
