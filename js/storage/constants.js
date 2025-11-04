export const DB_KEY = 'idwData';
export const SESSION_KEY = 'idwSession';

export const FAKE_AUTH_CREDENTIALS = {
  username: "admin",
  password: "1234",
};

export const STORAGE_KEYS = Object.freeze({
  specialties: "especialidades",
  insuranceCompanies: "obrasSociales",
  doctors: "medicos",
  appointments: "turnos",
  reservations: "reservas",
});

export const INITIAL_DATA = {
  especialidades: [
    { id: 1, nombre: "Cardiología" },
    { id: 2, nombre: "Dermatología" },
    { id: 3, nombre: "Neurología" },
    { id: 4, nombre: "Pediatría" },
    { id: 5, nombre: "Traumatología" },
  ],
  obrasSociales: [
    {
      id: 1,
      nombre: "OSDE",
      descripcion: "Organización de Servicios Directos Empresarios",
      porcentaje: 10
    },
    { id: 2, nombre: "Swiss Medical", descripcion: "Swiss Medical Group",
      porcentaje: 10
     },
    { id: 3, nombre: "Galeno", descripcion: "Galeno Argentina",
      porcentaje: 10
     },
    {
      id: 4,
      nombre: "IOMA",
      descripcion: "Instituto de Obra Médico Asistencial",
      porcentaje: 10
    },
    {
      id: 5,
      nombre: "Particular",
      descripcion: "Sin obra social - Pago particular",
      porcentaje: 10
    },
  ],
  medicos: [
    {
      id: 1,
      nombre: "Carlos",
      apellido: "Rodríguez",
      matriculaProfesional: 12345,
      descripcion:
        "Especialista en cardiología con más de 15 años de experiencia...",
      foto: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      valorConsulta: 8500,
      especialidadId: 1,
      obraSocialIds: [1, 2, 5],
    },    {
      id: 2,
      nombre: "Laura",
      apellido: "Gómez",
      matriculaProfesional: 67890,
      descripcion:
        "Dermatóloga con enfoque en tratamientos estéticos y enfermedades de la piel.",
      foto: "https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      valorConsulta: 7000,
      especialidadId: 2,
      obraSocialIds: [1, 3, 5],
    },
    {
      id: 3,
      nombre: "Roberto",
      apellido: "Fernández",
      matriculaProfesional: 11223,
      descripcion:
        "Neurólogo dedicado al estudio y tratamiento de trastornos del sistema nervioso.",
      foto: "https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      valorConsulta: 9000,
      especialidadId: 3,
      obraSocialIds: [2, 4, 5],
    },

  ],
  reservas: [],
  turnos: []
};
