import storageService from "../storage/index.js";

const SELECTORS = {
	DOCTORS: "totalMedicos",
	SPECIALTIES: "totalEspecialidades",
	INSURANCE_COMPANIES: "totalObrasSociales",
	RESERVATIONS: "totalReservas",
};

const calculateDashboardStats = () => {
	return {
		totalDoctors: storageService.doctors.getAll().length,
		totalSpecialties: storageService.specialties.getAll().length,
		totalInsuranceCompanies: storageService.insuranceCompanies.getAll().length,
		totalReservations: storageService.reservations.getAll().length,
	};
};

function createStatCard({ title, iconClass, value, href, selectorId }) {
	return `
           <div class="col-md-6 col-xl-3">
             <div data-href="${href}" class="card stat shadow h-100 text-center">
               <div class="card-body">
                 <i class="fa-solid ${iconClass} fs-4 text-primary"></i>
                 <h5 class="card-title mt-2">${title}</h5>
                 <h3 class="text-primary fw-bold" id="${selectorId}">
                    ${value}
                  </h3>
                </div>
              </div>
            </div>
          `;
}

export function renderDashboard(container) {
	const stats = calculateDashboardStats();
	const cardsData = [
		{
			title: "Médicos",
			iconClass: "fa-user-doctor",
			value: stats.totalDoctors,
			href: "#medicos",
			selectorId: SELECTORS.DOCTORS,
		},
		{
			title: "Especialidades",
			iconClass: "fa-stethoscope",
			value: stats.totalSpecialties,
			href: "#especialidades",
			selectorId: SELECTORS.SPECIALTIES,
		},
		{
			title: "Obras Sociales",
			iconClass: "fa-hand-holding-medical",
			value: stats.totalInsuranceCompanies,
			href: "#obrassociales",
			selectorId: SELECTORS.INSURANCE_COMPANIES,
		},
		{
			title: "Reservas",
			iconClass: "fa-clipboard-list",
			value: stats.totalReservations,
			href: "#reservas",
			selectorId: SELECTORS.RESERVATIONS,
		},
	];

	container.innerHTML = `  <section id="dashboard-section" class="content-section">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item active" aria-current="page">
                  <a href="#dashboard">Dashboard</a>
                </li>
              </ol>
            </nav>
            <div class="mb-4 text-primary-emphasis">
              <p>Bienvenido al panel administrativo.</p>
    <p>Utilice la barra lateral para navegar a través de las diferentes secciones de gestión.</p>
            </div>
            <div class="row g-4 mb-4" id="dashboard-cards">
              ${cardsData.map(createStatCard).join("")}
              </div>
          </section>`;

	const cardsContainer = document.getElementById("dashboard-cards");
	cardsContainer.addEventListener("click", (event) => {
		const card = event.target.closest(".card.stat");
		if (card?.dataset.href) {
			window.location.href = card.dataset.href;
		}
	});
}
