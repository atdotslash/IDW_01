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

export function renderDashboard(container) {
  const stats = calculateDashboardStats();

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
            <div class="row g-4 mb-4">
              <div class="col-md-6 col-xl-3">
                <div 
                 onclick="window.location.href='#medicos'"
                class="card stat shadow h-100 text-center">
                  <div class="card-body">
                    <i class="fa-solid fa-user-doctor fs-4 text-primary"></i>
                    <h5 class="mt-2 flex-grow-1">Médicos</h5>
                    <h3 class="text-primary fw-bold" id="${SELECTORS.DOCTORS}">
                    ${stats.totalDoctors}
                    </h3>
                  </div>
                </div>
              </div>
              <div class="col-md-6 col-xl-3">
                <div 
                 onclick="window.location.href='#especialidades'"
                class="card stat shadow h-100 text-center">
                  <div class="card-body">
                    <i class="fa-solid fa-stethoscope fs-4 text-primary"></i>

                    <h5 class="card-title mt-2">Especialidades</h5>
                    <h3 class="text-primary fw-bold" id="${SELECTORS.SPECIALTIES}">
                      ${stats.totalSpecialties}
                    </h3>
                  </div>
                </div>
              </div>
              <div class="col-md-6 col-xl-3">
                <div 
                 onclick="window.location.href='#obras-sociales'"
                class="card stat shadow h-100 text-center">
                  <div class="card-body">
                    <i class="fa-solid fa-hand-holding-medical fs-4 text-primary"></i>
                    <h5 class="card-title mt-2">Obras Sociales</h5>
                    <h3 class="text-primary fw-bold" id="${SELECTORS.INSURANCE_COMPANIES}">
                      ${stats.totalInsuranceCompanies}
                    </h3>
                  </div>
                </div>
              </div>
              <div class="col-md-6 col-xl-3">
                <div 
                 onclick="window.location.href='#reservas'"
                class="card stat shadow h-100 text-center">
                  <div class="card-body">
                    <i class="fa-solid fa-clipboard-list fs-4 text-primary"></i>

                    <h5 class="card-title mt-2">Reservas</h5>
                    <h3 class="text-primary fw-bold" id="${SELECTORS.RESERVATIONS}">
                    ${stats.totalReservations}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>`;
}
