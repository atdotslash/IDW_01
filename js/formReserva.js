import notifications, {
  createAndRenderAlertWithLink,
} from './components/notifications.js';
import {
  formatCurrency,
  formatDateTime,
  fullName,
} from './shared/formatters.js';
import storageService from './storage/index.js';
import { validateForm } from './core/ui.js';

const ui = {
  formReserva: document.getElementById('formReserva'),
  detalleCita: document.getElementById('detalleCita'),
  inputDocumento: document.getElementById('documento'),
  inputNombre: document.getElementById('nombre'),
  inputApellido: document.getElementById('apellido'),
  inputEmail: document.getElementById('email'),
  inputTelefono: document.getElementById('telefono'),
  selectObraSocial: document.getElementById('obraSocial'),
  detalleValor: document.getElementById('detalleValor'),
  card: document.querySelector('.card'),
};

const state = {
  doctor: null,
  turno: null,
};


/**
 * Calcula el valor final aplicando el descuento de la obra social.
 * @param {number} valorBase - Precio base de la consulta del médico.
 * @param {number} porcentajeDescuento - Porcentaje de descuento (0 a 100).
 * @returns {number} Valor final de la consulta.
 */
function calcularValorFinal(valorBase, porcentajeDescuento) {
  const descuento = valorBase * (porcentajeDescuento / 100);
  return valorBase - descuento;
}

/**
 * Actualiza el texto de valor de consulta en el formulario.
 */
function updateValorDisplay() {
  if (!state.doctor) return;

  const { valorFinal, valorBase, porcentaje } = getFinalCost(
    state.doctor,
    ui.selectObraSocial.value,
  );

  // Formatear a moneda (ej: AR$)
  const valorBaseFormatted = formatCurrency(valorBase);
  const valorFinalFormatted = formatCurrency(valorFinal);

  let html;
  if (porcentaje > 0) {
    html = `Precio: <span class="text-danger text-decoration-line-through">${valorBaseFormatted}</span> `;
    html += `| Descuento (${porcentaje}%): ${valorFinalFormatted}`;
  } else {
    html = `Valor Consulta: ${valorFinalFormatted} (Precio Particular)`;
  }

  ui.detalleValor.innerHTML = html;
}

/**
 * Carga las opciones de obra social al select.
 */
function loadInsuranceCompanies() {
  // Obtener todas las obras sociales disponibles
  const allInsuranceCompanies = storageService.insuranceCompanies.getAll();

  // Filtrar solo las obras sociales que atiende el médico
  const availableInsuranceCompanies = allInsuranceCompanies.filter((os) =>
    state.doctor.obraSocialIds.includes(os.id),
  );

  let optionsHtml = '';
  let particularId = null;

  availableInsuranceCompanies.forEach((os) => {
    if (os.nombre === 'Particular') {
      particularId = os.id;
    }
    optionsHtml += `<option value="${os.id}">${os.nombre}</option>`;
  });

  ui.selectObraSocial.insertAdjacentHTML('beforeend', optionsHtml);

  // Establecer 'Particular' como opción seleccionada (si el médico la atiende)
  if (particularId !== null) {
    ui.selectObraSocial.value = particularId;
  } else if (availableInsuranceCompanies.length > 0) {
    // Fallback: si no atiende 'Particular', seleccionar la primera disponible
    ui.selectObraSocial.value = availableInsuranceCompanies[0].id;
  }

  updateValorDisplay();
}

function loadReservationDetails() {
  const doctorSeleccionado = state.doctor;
  const turnoSeleccionado = state.turno;

  // Obtener nombre de la especialidad (asumiendo que doctor.especialidadId existe)
  const especialidad = storageService.specialties.getById(
    doctorSeleccionado.especialidadId,
  );
  const especialidadNombre = especialidad
    ? especialidad.nombre
    : 'Especialidad Desconocida';

  // Mostrar el resumen de la cita
  ui.detalleCita.innerHTML = `
    <h5 class="fw-bold text-primary">Turno Seleccionado</h5>
    <p class="mb-1"><strong>Especialidad:</strong> ${especialidadNombre}</p>
    <p class="mb-1"><strong>Profesional:</strong> Dr/a. ${
      doctorSeleccionado.nombre
    } ${doctorSeleccionado.apellido}</p>
    <p class="mb-0"><strong>Fecha y Hora:</strong> ${formatDateTime(
      turnoSeleccionado.fechaHora,
    )}</p>
  `;
}

function getFinalCost(doctor, osId) {
  const obraSocial = storageService.insuranceCompanies.getById(osId);
  const valorBase = doctor.valorConsulta;
  const porcentaje = obraSocial ? obraSocial.porcentaje : 0;
  const valorFinal = calcularValorFinal(valorBase, porcentaje);
  return {
    valorBase,
    porcentaje,
    valorFinal,
  };
}
function getPatientDataFromForm() {
  return {
    nombrePaciente: ui.inputNombre.value.trim(),
    apellidoPaciente: ui.inputApellido.value.trim(),
    documento: ui.inputDocumento.value.trim(),
    email: ui.inputEmail.value.trim(),
    telefono: ui.inputTelefono.value.trim(),
    obraSocialId: Number(ui.selectObraSocial.value),
  };
}

function createBookingPayload(patientData) {
  const { valorFinal } = getFinalCost(state.doctor, patientData.obraSocialId);

  //  Combina los datos del paciente, los datos del turno/doctor (del estado) y el costo.
  return {
    ...structuredClone(patientData),
    turnoId: Number(state.turno.id),
    especialidadId: state.doctor.especialidadId,
    valorTotal: valorFinal,
  };
}

function handleSuccessfulBooking(booking) {
  const obraSocial = storageService.insuranceCompanies.getById(booking.obraSocialId);
  const successMessage = `<h4 class="alert-heading">✅ ¡Turno Reservado con Éxito!</h4>
  <hr />
  <ul><li>Paciente: ${fullName(
    booking,
    'nombrePaciente',
    'apellidoPaciente',
  )}</li>
 <li>Documento: ${booking.documento}</li>
 <li>Email: ${booking.email}</li>
 <li>Teléfono: ${booking.telefono}</li>
 <li>Obra Social: ${obraSocial.nombre ?? 'No especificada'}</li>
 <li>Cita: ${formatDateTime(state.turno.fechaHora)} con el Dr/a. ${fullName(
    state.doctor,
  )}</li>
 </ul>`;

  // 2. Limpia el formulario.
  ui.formReserva.reset();

  // 3. Muestra un alert de notificacion.

  createAndRenderAlertWithLink({
    message: successMessage,
    alertType: 'success',
    containerElement: ui.card,
  });

  // 4. Redirige al usuario a la pagina de catalogo después de un  momento.
  setTimeout(() => {
    window.location.href = 'catalogo.html';
  }, 10_000);
}

function handleReservationSubmit(e) {
  e.preventDefault();
  if (!validateForm(ui.formReserva)) return;
  try {
    // 1. Recorte de datos ingresados y calculo de valor con descuento
    const patientInputData = getPatientDataFromForm();

    // 2. Construcción del objeto de reserva
    const newBookingData = createBookingPayload(patientInputData);

    // 3. Guardar la nueva reserva en localStorage
    storageService.bookings.add(newBookingData);

    // 4. Actualizar el estado del turno (Marcarlo como no disponible)
    storageService.appointments.markAsReserved(Number(state.turno.id));

    // 5. Limpiar la sesión (ya no se necesita la selección temporal)
    storageService.session.clearAppointmentSelection();

    // 6. Mensaje de éxito y limpieza
    handleSuccessfulBooking(newBookingData);
  } catch (error) {
    console.log('🚀 ~ efectuarReserva ~ error:', error);
    notifications.error('❌ Error al guardar la reserva: ' + error.message);
  }
}

function handleNoSelectionError(message) {
  if (ui.card) {
    createAndRenderAlertWithLink({
      containerElement: ui.card,
      message,
    });
  }
  // Opcional: redirigir después de un tiempo
  // setTimeout(() => window.location.href = "catalogo.html", 3500);
}

function initFormReservaPage() {
  storageService.initialize();
  const { doctorId = null, appointmentId = null } =
    storageService.session.getAppointmentSelection() ?? {};
  // verifica que haya datos en la sesion
  if (!doctorId || !appointmentId) {
    handleNoSelectionError('Debe seleccionar un médico y un turno');
    return;
  }

  state.doctor = storageService.doctors.getById(doctorId);
  state.turno = storageService.appointments.getById(appointmentId);
  // verifica que sean IDs validos
  if (!state.doctor || !state.turno) {
    handleNoSelectionError(
      'No se pudo cargar la información completa del médico o turno',
    );
    return;
  }

  loadReservationDetails();
  loadInsuranceCompanies();
  // Asignar el listener para actualizar el valor cuando cambia la selección
  ui.selectObraSocial.addEventListener('change', updateValorDisplay);
  ui.formReserva.addEventListener('submit', handleReservationSubmit);
}

// --- Ejecución ---
document.addEventListener('DOMContentLoaded', initFormReservaPage);
