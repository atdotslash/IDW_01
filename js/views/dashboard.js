import storageService from "../storage/index.js";
import * as ui from "../core/ui.js";
import * as tpl from "../core/templates.js";
const SELECTORS = {
	DOCTORS: "totalMedicos",
	SPECIALTIES: "totalEspecialidades",
	INSURANCE_COMPANIES: "totalObrasSociales",
	RESERVATIONS: "totalReservas",
	CARDS: "dashboard-cards",
};

const calculateDashboardStats = () => {
	return {
		totalDoctors: storageService.doctors.getAll().length,
		totalSpecialties: storageService.specialties.getAll().length,
		totalInsuranceCompanies: storageService.insuranceCompanies.getAll().length,
		totalReservations: storageService.reservations.getAll().length,
	};
};

function attachListeners() {
	const cardsContainer = document.getElementById(SELECTORS.CARDS);
	cardsContainer?.addEventListener("click", (event) => {
		const card = event.target.closest(".card.stat");
		if (card?.dataset?.href) {
			window.location.href = card.dataset.href;
		}
	});
}

export function init() {
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

	const breadcrumb = tpl.createBreadcrumb([
		{ text: "Dashboard", href: "#dashboard", active: false },
	]);

	const pageHTML = `
            ${breadcrumb}
            <div class="mb-4 text-primary-emphasis">
              <p>Bienvenido al panel administrativo.</p>
    <p>Utilice la barra lateral para navegar a través de las diferentes secciones de gestión.</p>
            </div>
            <div class="row g-4 mb-4" id="${SELECTORS.CARDS}">
              ${cardsData.map(tpl.createStatCard).join("")}
              </div>`;

	ui.renderContent(tpl.createSectionWrapper("dashboard-section", pageHTML));

	attachListeners();
}
