import storageService from './storage/index.js'
const medicos = storageService.doctors.getAll()
const contenedor = document.getElementById("medicosCatalogo");

const crearCard = (medico) => {
    return `
    <div class="col-lg-4 col-sm-6 col-12">
      <div class="card h-100">
        <img src="${medico.foto}" class="card-img-top" alt="${medico.nombre}">
        <div class="card-body d-flex align-content-between flex-column">
        <h5 class="card-title">${medico.nombre} ${medico.apellido}</h5>
        <p class="card-text">${medico.descripcion}</p>
        <a href="reserva.html" class="btn mt-auto btn-primary">Reservar turno</a>
        </div>
    </div>
   </div>
    `
}

const cardsHTML = medicos.map(crearCard).join("");
contenedor.innerHTML = cardsHTML;
