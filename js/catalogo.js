import storageService from "./storage/index.js";
storageService.initialize();
const medicos = storageService.doctors.getAll();
const especialidades = storageService.specialties.getAll();
const contenedor = document.getElementById("medicosCatalogo");

const crearCard = (medico) => {
  const especialidad = especialidades.find((e) => e.id === medico.especialidadId);
  // const especialidad = medico.especialidadIds
  //   .map((id) => especialidades.find((e) => e.id === id)?.nombre)
  //   .filter(Boolean)
  //   .join(", ");

  return `
    <div class="col-lg-4 col-sm-6 col-12">
      <div class="card h-100">
        <img src="${medico.foto}" class="card-img-top" alt="${medico.nombre}">
        <div class="card-body d-flex align-content-between flex-column">
        <h5 class="card-title">${medico.nombre} ${medico.apellido}</h5>
        <span class="badge text-bg-info mt-2 p-2 d-block mx-auto" style="padding: 10px 10px; font-size: 13px; width: 100px; cursor: default;">${
          especialidad?.nombre || "Sin especialidad"
        }</span>
        <p class="card-text">${medico.descripcion}</p>
        <span class="btn btn-warning mt-0 mb-3 p-2 d-block mx-auto" style="padding: 10px 10px; font-size: 13px; width: 100px; cursor: default; pointer-events: none; user-select: none;" >Consulta $${
          medico.valorConsulta
        }</span>
        <a href="turnos-listado.html"
        class="btn mt-auto btn-primary reservar-btn"
        data-doctor-id="${medico.id}">
        Reservar turno</a>
        </div>
    </div>
   </div>
    `;
};

const cardsHTML = medicos.map(crearCard).join("");
contenedor.innerHTML = cardsHTML;

contenedor.addEventListener("click", (e) => {
  if (e.target.classList.contains("reservar-btn")) {
    const doctorId = e.target.dataset.doctorId;
    storageService.session.saveAppointmentData(Number(doctorId));
  }
});
