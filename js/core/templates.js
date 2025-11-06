import { renderForm } from '../components/form.js';
import { formatCurrency, fullName } from '../shared/formatters.js';
import storageService from '../storage/index.js';

export function createStatCard({ title, iconClass, value, href, selectorId }) {
  return `
           <div class="col-md-6 col-lg-4">
             <div data-href="${href}" class="card h-100 stat shadow h-100 text-center">
               <div class="card-body">
                 <i class="fa-solid ${iconClass} fs-4 text-primary"></i>
                 <h5 class="card-title mt-2">${title}</h5>
                <h3 class="text-primary fw-bold" id="${selectorId}">
                    ${value ?? 0}
                  </h3>
                </div>
              </div>
            </div>
          `;
}

export function createSkeletonStatCard() {
  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100 stat shadow h-100 text-center">
        <div class="card-body">
          <div class="skeleton skeleton-text mx-auto" style="width: 40px; height: 40px; border-radius: 50%;"></div>
          <div class="skeleton skeleton-text mx-auto mt-3" style="height: 1.25rem; width: 70%;"></div>
          <div class="skeleton skeleton-text mx-auto mt-2" style="height: 2rem; width: 40%;"></div>
        </div>
      </div>
    </div>
  `;
}

export function createBreadcrumb(items) {
  const breadcrumbItems = items
    .map((item) => {
      if (item.active) {
        return `<li class="breadcrumb-item active" aria-current="page">${item.text}</li>`;
      }
      return `<li class="breadcrumb-item"><a href="${item.href}">${item.text}</a></li>`;
    })
    .join('');

  return `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        ${breadcrumbItems}
      </ol>
    </nav>
  `;
}

export function createSectionWrapper(id, htmlContent) {
  return `
    <section id="${id}" class="content-section">
      ${htmlContent}
    </section>
    `;
}

export function createDoctorForm(doctor = {}, specialties = [], insuranceCompanies = []) {
  const isEditing = Boolean(doctor.id);
  const form = renderForm(
    [
      [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, col: 'col-md-6' },
        { name: 'apellido', label: 'Apellido', type: 'text', required: true, col: 'col-md-6' },
      ],
      [
        {
          name: 'matriculaProfesional',
          label: 'Matrícula',
          type: 'text',
          validationMessage: 'La matrícula es obligatoria',
          pattern: /^\d+$/,
          required: true,
          col: 'col-md-6',
        },
        {
          name: 'especialidadId',
          label: 'Especialidad',
          type: 'select',
          required: true,
          col: 'col-md-6',
          options: specialties.map((s) => ({
            value: s.id,
            text: s.nombre,
          })),
        },
      ],
      [
        {
          name: 'valorConsulta',
          label: 'Valor Consulta ($)',
          type: 'number',
          required: true,
          attributes: { step: '0.01' },
          col: 'col-md-6',
        },
        {
          name: 'foto',
          label: 'Foto',
          type: 'file',
          required: !isEditing,
          attributes: { accept: 'image/*' },
          col: 'col-md-6',
        },
      ],
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      {
        name: 'obraSocialIds',
        label: 'Obras Sociales',
        type: 'select',
        multiple: true,
        options: insuranceCompanies.map((i) => ({
          value: i.id,
          text: i.nombre,
        })),
      },
    ],
    doctor,
  );
  return form;
}

export function createSpecialtyForm(specialty = {}) {
  return renderForm(
    [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'text',
        validationMessage: 'El nombre es obligatorio',
        required: true,
      },
    ],
    specialty,
  );
}

export function createInsuranceCompanyForm(insuranceCompany = {}) {
  return renderForm(
    [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'text',
        validationMessage: 'El nombre es obligatorio',
        required: true,
      },
      {
        name: 'descripcion',
        label: 'Descripcion',
        type: 'text',
      },
      {
        name: 'porcentaje',
        label: 'Porcentaje de cobertura (%)',
        type: 'text',
        required: true,
        validationMessage: 'El porcentaje de cobertura es obligatorio',
        placeholder: '0',
        pattern: /^\d+(\.\d+)?$/,
        patternValidationMessage: 'Ingrese un porcentaje positivo valido (ej. 50 o 50.5)',
        numberValidationMessage: 'Por favor ingrese un numero entre 0 y 100',
      },
    ],
    insuranceCompany,
  );
}

export function createSpecialtyRow(specialty) {
  return `
    <tr data-id="${specialty.id}">
      <td>${specialty.id}</td>
      <td>${specialty.nombre}</td>
      <td class="d-flex gap-2 align-items-center ">
        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${specialty.id}">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${specialty.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
}

export function createInsuranceCompanyRow(insuranceCompany) {
  return `
    <tr data-id="${insuranceCompany.id}">
      <td>${insuranceCompany.id}</td>
      <td>${insuranceCompany.nombre}</td>
      <td>${insuranceCompany.descripcion}</td>
      <td class="text-center">${insuranceCompany.porcentaje}%</td>
      <td>
        <div class="d-flex gap-2 align-items-center h-100 align-middle">
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${insuranceCompany.id}">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${insuranceCompany.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

export function createUserRow(user) {
  return `
    <tr>
      <td>${user.id}</td>
      <td>${user.firstName}</td>
      <td>${user.lastName}</td>
      <td>${user.email}</td>
      <td>${user.username}</td>
    </tr>
  `;
}

export function createBookingRow(booking) {
  const appointment = storageService.appointments.getById(booking.turnoId);
  const doctor = storageService.doctors.getById(appointment.medicoId);
  const insuranceCompany = storageService.insuranceCompanies.getById(booking.obraSocialId);
  const specialty = storageService.specialties.getById(doctor.especialidadId);
  return `
    <tr>
      <td>${booking.id}</td>
      <td>${booking.documento}</td>
      <td>${booking.paciente}</td>
      <td>${insuranceCompany.nombre}</td>
      <td>${dayjs(appointment.fechaHora).format('DD/MM/YYYY HH:mm [hs]')}</td>
      <td>${fullName(doctor)}</td>
      <td>${specialty.nombre}</td>
      <td>${formatCurrency(booking.valorTotal)}</td>
    </tr>
  `;
}

export function createUserSkeletonRow() {
  return `
    <tr>
      ${Array.from({ length: 5 })
        .fill(null)
        .map(() => '<td class="placeholder-glow"><span class="placeholder col-12"></span></td>')
        .join('')}
    </tr>
  `;
}

export function createAppointmentForm(appointment = {}) {
  const today = dayjs().format('YYYY-MM-DD');
  const startTime = '08:00';
  const endTime = '20:00';

  const form = renderForm(
    [
      {
        label: 'Fecha',
        name: 'fecha',
        type: 'date',
        min: today,
        required: true,
        validationMessage: 'Por favor, seleccione una fecha válida a partir de hoy.',
      },
      {
        label: 'Hora',
        name: 'hora',
        type: 'time',
        min: startTime,
        max: endTime,
        required: true,
        validationMessage: 'Por favor, seleccione un horario entre las 08:00 y las 20:00.',
      },
      {
        type: 'hidden',
        name: 'medicoId',
      },
    ],
    appointment,
  );
  return form;
}

export function createMassiveAppointmentForm(initialData = {}) {
  const now = dayjs();
  const today = now.format('YYYY-MM-DD');

  const form = renderForm(
    [
      [
        {
          label: 'Fecha Inicio',
          name: 'startDate',
          type: 'date',
          col: 'col-md-6',
          min: today,
        },
        {
          label: 'Fecha Fin',
          name: 'endDate',
          type: 'date',
          col: 'col-md-6',
          min: today,
        },
      ],
      [
        {
          label: 'Días de la Semana',
          name: 'daysOfWeek',
          type: 'select',
          multiple: true,
          options: [
            { value: '1', text: 'Lunes' },
            { value: '2', text: 'Martes' },
            { value: '3', text: 'Miercoles' },
            { value: '4', text: 'Jueves' },
            { value: '5', text: 'Viernes' },
            { value: '6', text: 'Sabado' },
          ],
        },
      ],
      [
        {
          label: 'Hora Inicio (24 hs)',
          name: 'startTime',
          type: 'number',
          step: '1',
          min: '0',
          max: '23',
          col: 'col-md-4',
        },
        {
          label: 'Hora Fin (24 hs)',
          name: 'endTime',
          type: 'number',
          step: '1',
          min: '0',
          max: '23',
          col: 'col-md-4',
        },
        {
          label: 'Duración (min)',
          name: 'intervalMinutes',
          type: 'select',
          col: 'col-md-4',
          options: [
            {
              value: '30',
              text: '30 minutos',
            },
            {
              value: '45',
              text: '45 minutos',
            },
            {
              value: '60',
              text: '60 minutos',
            },
          ],
        },
      ],
      {
        type: 'hidden',
        name: 'medicoId',
      },
    ],
    initialData,
  );
  return form;
}

export function createAppointmentRow(appointment) {
  const statusClasses = `badge text-bg-${appointment.disponible ? 'primary' : 'success'}`;
  const fecha = dayjs(appointment.fechaHora).format('DD/MM/YYYY');
  const hora = dayjs(appointment.fechaHora).format('HH:mm');
  const status = appointment.disponible ? 'Disponible' : 'Reservado';
  return `<tr>
      <td>${fecha}</td>
      <td>${hora}</td>
      <td>
      <span class="${statusClasses}">${status}</span>
      </td>
      <td class="d-flex gap-2 align-items-center ">
        <button class="btn btn-sm btn-outline-primary edit-btn" data-medico="${appointment.medicoId}" data-id="${appointment.id}">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-medico="${appointment.medicoId}" data-id="${appointment.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>`;
}

export function createDoctorTableRow(doctor) {
  return `
      <tr data-id="${doctor.id}">
        <td>${doctor.id}</td>
        <td>
          <img src="${doctor.foto}" alt="${doctor.nombre}" class="img-thumbnail object-fit-cover rounded-circle" width="64">
        </td>
        <td>${doctor.fullName}</td>
        <td>${doctor.specialtyName}</td>
        <td>
          <div class="d-flex flex-column flex-md-row gap-2">
            <button class="btn btn-sm btn-outline-secondary show-btn" data-id="${doctor.id}">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${doctor.id}">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${doctor.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
}
