import storageService from '../storage/index.js';
import * as ui from '../core/ui.js';
import * as tpl from '../core/templates.js';
import { apiService } from '../api.js';

const SELECTORS = {
  DOCTORS: 'totalMedicos',
  SPECIALTIES: 'totalEspecialidades',
  INSURANCE_COMPANIES: 'totalObrasSociales',
  RESERVATIONS: 'totalReservas',
  APPOINTMENTS: 'totalTurnos',
  USERS: 'totalUsuarios',
  CARDS: 'dashboard-cards',
};

async function fetchAndCacheTotalUsers() {
  const CACHE_KEY = 'dashboard_user_stats';
  let totalUsers = 0;
  const cachedData = sessionStorage.getItem(CACHE_KEY);
  if (cachedData) {
    totalUsers = JSON.parse(cachedData);
  } else {
    try {
      const data = await apiService.fetchUsers();
      totalUsers = data.total;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(totalUsers));
    } catch {
      totalUsers = 0;
    }
  }
  return totalUsers;
}

const calculateDashboardStats = async () => {
  const totalUsers = await fetchAndCacheTotalUsers();

  return {
    totalDoctors: storageService.doctors.getAll().length,
    totalSpecialties: storageService.specialties.getAll().length,
    totalInsuranceCompanies: storageService.insuranceCompanies.getAll().length,
    totalBookings: storageService.bookings.getAll().length,
    totalAppointments: storageService.appointments.getAll().length,
    totalUsers,
  };
};

function attachListeners() {
  const cardsContainer = document.getElementById(SELECTORS.CARDS);
  cardsContainer?.addEventListener('click', (event) => {
    const card = event.target.closest('.card.stat');
    if (card?.dataset?.href) {
      window.location.href = card.dataset.href;
    }
  });
}

function renderDashboardPage(cardsData, isSkeleton = false) {
  const breadcrumb = tpl.createBreadcrumb([
    { text: 'Dashboard', href: '#dashboard', active: false },
  ]);

  const cardRenderer = isSkeleton ? tpl.createSkeletonStatCard : tpl.createStatCard;

  const pageHTML = `
            ${breadcrumb}
            <div class="mb-4 text-primary-emphasis">
              <p>Bienvenido al panel administrativo.</p>
    <p>Utilice la barra lateral para navegar a través de las diferentes secciones de gestión.</p>
            </div>
            <div class="row g-4 mb-4" id="${SELECTORS.CARDS}">
              ${cardsData.map(cardRenderer).join('')}
              </div>`;

  ui.renderContent(tpl.createSectionWrapper('dashboard-section', pageHTML));
}

function renderInitialDashboard() {
  const skeletonCards = Array(6).fill({});
  renderDashboardPage(skeletonCards, true);
}

async function generateDashboardItems() {
  const stats = await calculateDashboardStats();
  return [
    {
      title: 'Médicos',
      iconClass: 'fa-user-doctor',
      value: stats.totalDoctors,
      href: '#medicos',
      selectorId: SELECTORS.DOCTORS,
    },
    {
      title: 'Especialidades',
      iconClass: 'fa-stethoscope',
      value: stats.totalSpecialties,
      href: '#especialidades',
      selectorId: SELECTORS.SPECIALTIES,
    },
    {
      title: 'Obras Sociales',
      iconClass: 'fa-hand-holding-medical',
      value: stats.totalInsuranceCompanies,
      href: '#obras-sociales',
      selectorId: SELECTORS.INSURANCE_COMPANIES,
    },
    {
      title: 'Usuarios',
      iconClass: 'fa-users',
      href: '#usuarios',
      selectorId: SELECTORS.USERS,
      value: stats.totalUsers,
    },
    {
      title: 'Turnos',
      iconClass: 'fa-calendar-check',
      value: stats.totalAppointments,
      href: '#turnos',
      selectorId: SELECTORS.APPOINTMENTS,
    },
    {
      title: 'Reservas',
      iconClass: 'fa-clipboard-list',
      value: stats.totalBookings,
      href: '#reservas',
      selectorId: SELECTORS.RESERVATIONS,
    },
  ];
}

export function init() {
  renderInitialDashboard();

  generateDashboardItems().then((data) => {
    renderDashboardPage(data, false);
    attachListeners();
  });
}
