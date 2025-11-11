import { createAndRenderAlertWithLink } from "./components/notifications.js";
import { fullName } from "./shared/formatters.js";
import storageService from "./storage/index.js";
import { loadAppointments } from "./views/bookings.js";

const UI = {
	APPOINTMENTS_CONTAINER: "#turnosDisponibles",
};

const MESSAGES = {
	NO_DOCTOR_SELECTED:
		"Debe seleccionar primero un médico en el catalogo para ver sus turnos disponibles.",
};

function renderPage() {
	const appointmentsContainerElement = document.querySelector(
		UI.APPOINTMENTS_CONTAINER,
	);
	if (!appointmentsContainerElement) return;
	const doctorId = storageService.session.getAppointmentData();

	if (!doctorId) {
		appointmentsContainerElement.innerHTML = "";
		appointmentsContainerElement.appendChild(
			createAndRenderAlertWithLink({
				render: false,
				message: MESSAGES.NO_DOCTOR_SELECTED,
			}),
		);
		return;
	}
	const medico = storageService.doctors.getById(doctorId);
	appointmentsContainerElement.innerHTML = `
    <h4>Profesional: <strong>${fullName(medico)}</strong></h4>
  `;
	loadAppointments(doctorId);
}

function main() {
	storageService.initialize();
	renderPage();
}
main();
