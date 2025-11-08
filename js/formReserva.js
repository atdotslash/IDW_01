import storageService from "./storage/index.js";
storageService.initialize();

const formReserva = document.getElementById("formReserva"),
  detalleCita = document.getElementById("detalleCita"),
  inputDocumento = document.getElementById("documento"),
  inputNombre = document.getElementById("nombre"),
  inputApellido = document.getElementById("apellido"),
  inputEmail = document.getElementById("email"),
  inputTelefono = document.getElementById("telefono"),
  selectObraSocial = document.getElementById("obraSocial"),
  detalleValor = document.getElementById("detalleValor");

// Variables para la selección de turno (se llenarán al inicio)
let doctorSeleccionado = null;
let turnoSeleccionado = null;
let turnoId = null;
let doctorId = null;

/**
 * @param {string} dateString - Cadena ISO de fecha y hora.
 * @returns {string} Fecha y hora legible en AR.
 */

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date
    .toLocaleString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
}

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
  if (!doctorSeleccionado) return;

  const selectedOsId = Number(selectObraSocial.value);
  const obraSocial = storageService.insuranceCompanies.getById(selectedOsId);

  const valorBase = doctorSeleccionado.valorConsulta;
  const porcentaje = obraSocial ? obraSocial.porcentaje : 0;
  const valorFinal = calcularValorFinal(valorBase, porcentaje);

  // Formatear a moneda (ej: AR$)
  const valorBaseFormatted = valorBase.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });
  const valorFinalFormatted = valorFinal.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

  let html;
  if (porcentaje > 0) {
    html = `Precio: <span class="text-danger text-decoration-line-through">${valorBaseFormatted}</span> `;
    html += `| Descuento (${porcentaje}%): ${valorFinalFormatted}`;
  } else {
    html = `Valor Consulta: ${valorFinalFormatted} (Precio Particular)`;
  }

  detalleValor.innerHTML = html;
}

/**
 * Carga las opciones de obra social al select.
 */
function loadInsuranceCompanies() {
  // Obtener todas las obras sociales disponibles
  const allInsuranceCompanies = storageService.insuranceCompanies.getAll();

  // Filtrar solo las obras sociales que atiende el médico
  const availableInsuranceCompanies = allInsuranceCompanies.filter((os) =>
    doctorSeleccionado.obraSocialIds.includes(os.id)
  );

  let optionsHtml = "";
  let particularId = null;

  availableInsuranceCompanies.forEach((os) => {
    if (os.nombre === "Particular") {
      particularId = os.id;
    }
    optionsHtml += `<option value="${os.id}">${os.nombre}</option>`;
  });

  selectObraSocial.insertAdjacentHTML("beforeend", optionsHtml);

  // Asignar el listener para actualizar el valor cuando cambia la selección
  selectObraSocial.addEventListener("change", updateValorDisplay);

  // Establecer 'Particular' como opción seleccionada (si el médico la atiende)
  if (particularId !== null) {
    selectObraSocial.value = particularId;
  } else if (availableInsuranceCompanies.length > 0) {
    // Fallback: si no atiende 'Particular', seleccionar la primera disponible
    selectObraSocial.value = availableInsuranceCompanies[0].id;
  }

  updateValorDisplay();
}

// Carga datos, muestra detalles y si no hay redirige

function loadReservationDetails() {
  const selection = storageService.session.getAppointmentSelection();

  if (!selection || !selection.doctorId || !selection.appointmentId) {
    detalleCita.innerHTML = `<p class="text-danger mb-0">⚠️ Error: No se encontró la cita seleccionada. Volvé al <a href="catalogo.html">catálogo</a>.</p>`;
    // Opcional: redirigir después de un tiempo
    // setTimeout(() => window.location.href = "catalogo.html", 3500);
    return;
  }

  doctorId = selection.doctorId;
  turnoId = selection.appointmentId;

  doctorSeleccionado = storageService.doctors.getById(Number(doctorId));
  turnoSeleccionado = storageService.appointments.getById(Number(turnoId));

  if (!doctorSeleccionado || !turnoSeleccionado) {
    detalleCita.innerHTML = `<p class="text-danger mb-0">⚠️ Error: No se pudo cargar la información completa del médico o turno.</p>`;
    return;
  }
  // Obtener nombre de la especialidad (asumiendo que doctor.especialidadId existe)
  const especialidad = storageService.specialties.getById(doctorSeleccionado.especialidadId);
  const especialidadNombre = especialidad ? especialidad.nombre : "Especialidad Desconocida";

  // Mostrar el resumen de la cita
  detalleCita.innerHTML = `
    <h5 class="alert-heading text-primary">Turno Seleccionado</h5>
    <p class="mb-1"><strong>Especialidad:</strong> ${especialidadNombre}</p>
    <p class="mb-1"><strong>Profesional:</strong> Dr/a. ${doctorSeleccionado.nombre} ${doctorSeleccionado.apellido}</p>
    <p class="mb-0"><strong>Fecha y Hora:</strong> ${formatDateTime(turnoSeleccionado.fechaHora)}</p>
  `;

  loadInsuranceCompanies();
}

function efectuarReserva(e) {
  e.preventDefault();

  if (!doctorId || !turnoId) {
    alert(" - - Error al cargar los datos del turno desde sessionStorage. Problemas en el navegador del cliente. - -");
    console.error(
      " - - Error al cargar los datos del turno desde sessionStorage. Problemas en el navegador del cliente. - -"
    );
    return;
  }

  // 1. Recorte de datos ingresados y calculo de valor con descuento
  const nombrePaciente = inputNombre.value.trim();
  const apellidoPaciente = inputApellido.value.trim();
  const documento = inputDocumento.value.trim();
  const email = inputEmail.value.trim();
  const telefono = inputTelefono.value.trim();
  const obraSocialId = Number(selectObraSocial.value);

  const obraSocial = storageService.insuranceCompanies.getById(obraSocialId);
  const valorBase = doctorSeleccionado.valorConsulta;
  const porcentaje = obraSocial ? obraSocial.porcentaje : 0;
  const valorTotal = calcularValorFinal(valorBase, porcentaje);

  // 2. Construcción del objeto de reserva
  const nuevaReserva = {
    documento: documento,
    nombrePaciente: nombrePaciente,
    apellidoPaciente: apellidoPaciente,
    email: email,
    telefono: telefono,
    turnoId: Number(turnoId),
    especialidadId: doctorSeleccionado.especialidadId,

    obraSocialId: obraSocialId,
    valorTotal: valorTotal,
  };

  try {
    // 3. Guardar la nueva reserva en localStorage
    const reservaGuardada = storageService.bookings.add(nuevaReserva);

    // 4. Actualizar el estado del turno (Marcarlo como no disponible)
    storageService.appointments.markAsReserved(Number(turnoId));

    // 5. Limpiar la sesión (ya no se necesita la selección temporal)
    storageService.session.clearAppointmentSelection();

    // 6. Mensaje de éxito y limpieza
    alert(
      `✅ ¡Turno Reservado con Éxito!\n\n` +
        `Paciente: ${nombrePaciente} ${apellidoPaciente}\n` +
        `Documento: ${documento}\n` +
        `Cita: ${formatDateTime(turnoSeleccionado.fechaHora)} con el Dr/a. ${doctorSeleccionado.apellido}`
    );

    formReserva.reset();

    // 7. Opcional: Redirigir a una página de confirmación o volver al inicio
    window.location.href = "catalogo.html";
  } catch (error) {
    alert("❌ Error al guardar la reserva: " + error.message);
  }
}

// --- Ejecución ---
document.addEventListener("DOMContentLoaded", loadReservationDetails);
formReserva.addEventListener("submit", efectuarReserva);
