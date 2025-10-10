

export function renderDashboard(container) {
  container.innerHTML =  `  <section id="dashboard-section" class="content-section">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item active" aria-current="page">
                  <a href="#dashboard">Dashboard</a>
                </li>
              </ol>
            </nav>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2 class="m-0 text-body">Dashboard</h2>
            </div>
            <div class="row g-4 mb-4">
              <div class="col-md-6 col-xl-3">
                <div class="card shadow h-100 text-center">
                  <div class="card-body">
                    <i class="fa-solid fa-user-doctor fs-4 text-primary"></i>
                    <h5 class="mt-2 flex-grow-1">Médicos</h5>
                    <h3 class="text-primary fw-bold" id="totalMedicos">0</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-6 col-xl-3">
                <div class="card shadow h-100 text-center">
                  <div class="card-body">
                    <i class="fa-solid fa-stethoscope fs-4 text-primary"></i>

                    <h5 class="card-title mt-2">Especialidades</h5>
                    <h3 class="text-primary fw-bold" id="totalEspecialidades">
                      0
                    </h3>
                  </div>
                </div>
              </div>
              <div class="col-md-6 col-xl-3">
                <div class="card shadow h-100 text-center">
                  <div class="card-body">
                    <i class="fa-solid fa-hand-holding-medical fs-4 text-primary"></i>
                    <h5 class="card-title mt-2">Obras Sociales</h5>
                    <h3 class="text-primary fw-bold" id="totalObrasSociales">
                      0
                    </h3>
                  </div>
                </div>
              </div>
              <div class="col-md-6 col-xl-3">
                <div class="card shadow h-100 text-center">
                  <div class="card-body">
                    <i class="fa-solid fa-clipboard-list fs-4 text-primary"></i>

                    <h5 class="card-title mt-2">Reservas</h5>
                    <h3 class="text-primary fw-bold" id="totalReservas">0</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>`
}