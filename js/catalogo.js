let medicos = window.localStorage.getItem("idwData")
medicos = JSON.parse(medicos).medicos
const contenedor = document.getElementById("medicosCatalogo");

const crearCard = (medico) => {
    return `
    <div class="card" style="width: 18rem;">
    <img src="${medico.foto}" class="card-img-top" alt="${medico.nombre}">
    <div class="card-body">
     <h5 class="card-title">${medico.nombre} ${medico.apellido}</h5>
     <p class="card-text">${medico.descripcion}</p>
     <a href="reserva.html" class="btn btn-primary">Reservar turno</a>
    </div>
   </div>
    `
}

const cardsHTML = medicos.map(crearCard).join("");
contenedor.innerHTML = cardsHTML;