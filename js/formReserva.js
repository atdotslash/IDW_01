const formReserva = document.getElementById("formReserva"),
  inputNombre = document.getElementById("nombre"),
  inputEmail = document.getElementById("email"),
  inputTelefono = document.getElementById("telefono");
// faltan cargar los demás, esta a solo prueba

const efectuarReserva = (e) => {
  e.preventDefault();
  let nombre = inputNombre.value.trim();
  let email = inputEmail.value.trim();
  let telefono = inputTelefono.value.trim();

  if (!nombre || !email || !telefono) {
    alert("Necesita completar Nombre, email y telefono");
    return;
  }
  alert(`Reserva a nombre de ${nombre}\n\n` + `Email: ${email}\n` + `Tel: ${telefono}\n`);

  formReserva.reset();
};

formReserva.addEventListener("submit", efectuarReserva);
