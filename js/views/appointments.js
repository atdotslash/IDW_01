import storageService from "../storage/index.js";
import { createReusableModal, MODAL_SIZES } from "../components/modal.js";

import * as ui from "../core/ui.js";
import * as tpl from "../core/templates.js";
import { getFormData } from "../components/form.js";
import { MESSAGES } from "../shared/constants.js";
import notifications from "../components/notifications.js";

const SELECTORS = {
	DOCTOR_SELECT: "doctor-select",
	ADD_APPOINTMENT_BUTTON: "btn-add-appointment",
	BULK_GENERATE_BUTTON: "btn-bulk-generate",
	APPOINTMENTS_TABLE_CONTAINER: "turnos-table-container",
	APPOINTMENTS_TABLE: "appointments-table",
	APPOINTMENTS_TABLE_BODY: "appointments-table-body",
	APPOINTMENTS_CARD: "appointments-card",
};

dayjs.extend(window.dayjs_plugin_isSameOrBefore);
export function init() {
	const breadcrumbHTML = tpl.createBreadcrumb([
		{ text: "Dashboard", href: "#dashboard", active: false },
		{ text: "Turnos", href: "#turnos", active: true },
	]);
	let pageHtml = `
    ${breadcrumbHTML}
        <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-body mb-3 mb-md-0">Gestión de Turnos</h1>
            <div class="btn-toolbar  d-flex flex-column flex-sm-row flex-wrap align-items-sm-center gap-2">
                <button type="button" disabled class="btn btn-secondary" id="${SELECTORS.BULK_GENERATE_BUTTON}">
                    <i class="fa fa-calendar-plus me-1"></i>
                    Generar Masiva
                </button>
                <button type="button" disabled class="btn btn-primary" id="${SELECTORS.ADD_APPOINTMENT_BUTTON}">
                    <i class="fa fa-plus-circle me-1"></i>
                    Agregar Turno
                </button>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                Seleccione un médico para ver y gestionar sus turnos disponibles
            </div>
            <div class="card-body">
                <select class="form-select" id="${SELECTORS.DOCTOR_SELECT}">
                    <option selected disabled value="">Cargando doctores...</option>
                </select>
            </div>
        </div>

        <div class="card d-none" id="${SELECTORS.APPOINTMENTS_CARD}">
            <div class="card-header">
                Turnos Disponibles
            </div>
            <div class="card-body">
                <div id="${SELECTORS.APPOINTMENTS_TABLE_CONTAINER}">
                    <p class="text-muted">Por favor, seleccione un doctor para ver sus turnos.</p>
                </div>
            </div>
        </div>
    `;
	pageHtml = tpl.createSectionWrapper("turnos-section", pageHtml);
	ui.renderContent(pageHtml);

	loadDoctors();

	attachListeners();
}

function setButtonsDisabled(isDisabled) {
	const addAppointmentBtn = document.getElementById(
		SELECTORS.ADD_APPOINTMENT_BUTTON,
	);
	const bulkGenerateBtn = document.getElementById(
		SELECTORS.BULK_GENERATE_BUTTON,
	);
	if (addAppointmentBtn) addAppointmentBtn.disabled = isDisabled;
	if (bulkGenerateBtn) bulkGenerateBtn.disabled = isDisabled;
}

function loadDoctors() {
	const select = document.getElementById(SELECTORS.DOCTOR_SELECT);
	try {
		const doctors = storageService.doctors.getAll();
		const options = doctors.map(
			({ id, nombre, apellido, matriculaProfesional }) => ({
				text: `Dr ${nombre} ${apellido} - Mat: ${matriculaProfesional}`,
				value: id,
			}),
		);
		ui.populateSelect({
			selectElement: select,
			options,
			defaultOptionText: "Seleccione un doctor",
		});
	} catch {
		select.innerHTML = '<option value="">Error al cargar doctores</option>';
	}
}

function showAppointmentsCard(show) {
	document
		.getElementById(SELECTORS.APPOINTMENTS_CARD)
		?.classList.toggle("d-none", !show);
}

function loadAppointments(doctorId) {
	const tableContainer = document.getElementById(
		SELECTORS.APPOINTMENTS_TABLE_CONTAINER,
	);

	setButtonsDisabled(!doctorId);
	showAppointmentsCard(true);
	tableContainer.innerHTML = "<p>Cargando turnos...</p>";
	try {
		const appointments = storageService.appointments.getByDoctorId(doctorId)
			.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

		if (appointments.length === 0) {
			tableContainer.innerHTML =
				'<p class="text-muted">No hay turnos configurados para este doctor.</p>';
			return;
		}

		const headers = ["Fecha", "Hora", "Estado", "Acciones"];
		const rowsHtml = appointments.map(tpl.createAppointmentRow).join("");

		const tableHtml = ui.renderTable(headers, rowsHtml);
		tableContainer.innerHTML = tableHtml;

		attachTableListeners(tableContainer);
	} catch  {
		tableContainer.innerHTML =
			'<p class="text-danger">Error al cargar los turnos.</p>';
	}
}

function onDoctorChange(event) {
	const doctorId = event.target.value;

	if (!doctorId) {
		const tableContainer = document.getElementById(
			SELECTORS.APPOINTMENTS_TABLE_CONTAINER,
		);
		showAppointmentsCard(false);
		if (tableContainer) {
			tableContainer.innerHTML =
				'<p class="text-muted">Por favor, seleccione un doctor.</p>';
		}
		return;
	}
	loadAppointments(doctorId);
}

function handleDeleteAppointment({ appointmentId, doctorId }) {
	ui.showConfirmModal({
		message: MESSAGES.CONFIRM_DELETE("turno"),
		onConfirm: () => {
			storageService.appointments.remove(appointmentId);
			loadAppointments(doctorId);
		},
	});
}

function attachTableListeners(tableContainer) {
	tableContainer.addEventListener("click", (event) => {
		const editButton = event.target.closest(".edit-btn");
		const deleteButton = event.target.closest(".delete-btn");

		if (editButton) {
			openModalAppointment({
				id: Number(editButton.dataset.id),
				medicoId: Number(editButton.dataset.medico),
			});
			return;
		}

		if (deleteButton) {
			handleDeleteAppointment({
				appointmentId: Number(deleteButton.dataset.id),
				doctorId: Number(deleteButton.dataset.medico),
			});
		}
	});
}

function handleCreateSingleAppointment({ form, appointment, modal }) {
	form.classList.add("was-validated");
	if (!form.checkValidity()) {
		return;
	}
	const { fecha, hora, ...rest } = getFormData(form);
	const appointmentData = {
		...rest,
		fechaHora: dayjs(`${fecha} ${hora}`).toISOString(),
	};
	if (!appointmentData.medicoId) {
		notifications.error("Por favor, seleccione un médico.");
		return;
	}
	// Validar que el médico no tenga un turno a la misma hora
	const isDuplicate = storageService.appointments.checkIfDuplicated({
    doctorId: appointmentData.medicoId,
    date: dayjs(appointmentData.fechaHora),
    appointmentId: appointment?.id
  })
	if (isDuplicate) {
		notifications.error(
			"El médico ya tiene un turno asignado en esa fecha y hora.",
		);
		return;
	}

	// validar que no sea una fecha en el pasado
	const appointmentDateTime = dayjs(appointmentData.fechaHora);
	if (appointmentDateTime.isBefore(dayjs(), "minute")) {
		notifications.error("No se puede crear un turno en el pasado.");
		return;
	}

	const isEditing = Boolean(appointment?.id);
	const data = {
		...appointmentData,
		medicoId: Number(appointmentData.medicoId),
	};
	if (!isEditing) {
		data.disponible = true;
	}
	if (isEditing) {
		storageService.appointments.update(appointment.id, data);
	} else {
		storageService.appointments.add(data);
	}
  modal.hide()
	loadAppointments(appointmentData.medicoId);
}

function openModalAppointment(appointment = {}) {
	const isEditing = Boolean(appointment?.id);
	const medicoId =
		appointment?.medicoId || document.getElementById("doctor-select").value;
	let initialData;
	if (isEditing) {
		const oldAppointment = storageService.appointments.getById(appointment.id);
		initialData = {
			...oldAppointment,
			fecha: dayjs(oldAppointment.fechaHora).format("YYYY-MM-DD"),
			hora: dayjs(oldAppointment.fechaHora).format("HH:mm"),
		};
	} else {
		initialData = { medicoId };
	}

	const form = tpl.createAppointmentForm(initialData);
	createReusableModal({
		title: isEditing ? "Editar Turno" : "Agregar Turno",
		id: isEditing ? "edit-appointment-modal" : "add-appointment-modal",
		body: form,
		footerButtons: [
			{
				text: "Cerrar",
				className: "btn btn-secondary",
				onClick: (_, modal) => modal.hide(),
			},
			{
				text: "Guardar",
				className: "btn btn-primary",
				onClick: (_, modal) => {
					handleCreateSingleAppointment({ form, appointment, modal });
				},
			},
		],
	});
}

function handleBulkCreate({ form, modal }) {
	form.classList.add("was-validated");
	if (!form.checkValidity()) {
		return;
	}
	const formData = getFormData(form);
	const {
		startDate,
		endDate,
		startTime,
		endTime,
		intervalMinutes,
		daysOfWeek,
		medicoId,
	} = formData;

	const selectedMedicoId = Number(medicoId);
	const selectedDaysOfWeek = Array.isArray(daysOfWeek) ? daysOfWeek.map(Number) : [Number(daysOfWeek)];

	const generatedAppointments = [];
	const existingAppointments = storageService.appointments
		.getByDoctorId(selectedMedicoId)

	let currentDate = dayjs(startDate);
	const endLimitDate = dayjs(endDate);
	const now = dayjs();

	while (currentDate.isSameOrBefore(endLimitDate, "day")) {
		const dayOfWeek = currentDate.day();

		if (selectedDaysOfWeek.includes(dayOfWeek)) {
			let currentTime = dayjs(
				`${currentDate.format("YYYY-MM-DD")}T${startTime}`,
			);
			const endLimitTime = dayjs(
				`${currentDate.format("YYYY-MM-DD")}T${endTime}`,
			);

			while (currentTime.isSameOrBefore(endLimitTime, "minute")) {
				// Verificar si el turno está en el pasado
				if (currentTime.isBefore(now, "minute")) {
					currentTime = currentTime.add(Number(intervalMinutes), "minute");
					continue;
				}



				const fechaHora = currentTime.toISOString();

				// Verificar duplicados
				const isDuplicate = existingAppointments.some((ap) =>
					dayjs(ap.fechaHora).isSame(currentTime),
				);

				if (!isDuplicate) {
					generatedAppointments.push({
						medicoId: selectedMedicoId,
						fechaHora: fechaHora,
						disponible: true,
					});
				}
				currentTime = currentTime.add(Number(intervalMinutes), "minute");
			}
		}
		currentDate = currentDate.add(1, "day");
	}

	if (generatedAppointments.length === 0) {
		notifications.info(
			"No se generaron nuevos turnos. Verifique las fechas, horas, días de la semana o si ya existen turnos para esos horarios.",
		);
    modal.hide()
		return;
	}

	try {
		generatedAppointments.forEach((appointment) => {
			storageService.appointments.add(appointment);
		});
		notifications.success(
			`Se generaron ${generatedAppointments.length} turnos masivos exitosamente.`,
		);
		loadAppointments(selectedMedicoId);
	} catch (error) {
		console.error("Error al generar turnos masivos:", error);
		notifications.error("Hubo un error al guardar los turnos masivos.");
	} finally{
    modal.hide()
  }
}

function openModalBulkGenerate() {
	const medicoId = Number(document.getElementById("doctor-select")?.value);

	const form = tpl.createMassiveAppointmentForm({
		medicoId,
	});
	createReusableModal({
		title: "Creación Masiva de Turnos",
		id: "bulk-generate-modal",
		size: MODAL_SIZES.LARGE,
		body: form,
		footerButtons: [
			{
				text: "Cancelar",
				className: "btn btn-secondary",
				onClick: (_, modal) => modal.hide(),
			},
			{
				text: "Generar Turnos",
				className: "btn btn-primary",
				onClick: (_, modal) => {
					handleBulkCreate({ form, modal })
				},
			},
		],
	});
}

function attachListeners() {
	document
		.getElementById(SELECTORS.ADD_APPOINTMENT_BUTTON)
		.addEventListener("click", () => {
			openModalAppointment();
		});

	// Listener para "Generar Masiva"
	document
		.getElementById(SELECTORS.BULK_GENERATE_BUTTON)
		.addEventListener("click", () => {
			openModalBulkGenerate();
		});

	// Listener para el Select de Doctor
	document
		.getElementById("doctor-select")
		.addEventListener("change", onDoctorChange);
}
