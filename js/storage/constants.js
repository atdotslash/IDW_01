export const DB_KEY = 'idwData';
export const SESSION_KEY = 'idwSession';

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
    },
    { id: 2, nombre: "Swiss Medical", descripcion: "Swiss Medical Group" },
    { id: 3, nombre: "Galeno", descripcion: "Galeno Argentina" },
    {
      id: 4,
      nombre: "IOMA",
      descripcion: "Instituto de Obra Médico Asistencial",
    },
    {
      id: 5,
      nombre: "Particular",
      descripcion: "Sin obra social - Pago particular",
    },
  ],
  medicos: [
    {
      id: 1,
      nombre: "Dr. Carlos",
      apellido: "Rodríguez",
      matriculaProfesional: 12345,
      descripcion:
        "Especialista en cardiología con más de 15 años de experiencia...",
      foto: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      valorConsulta: 8500,
      especialidadId: 1,
      obraSocialIds: [1, 2, 5],
    },
  ],
  reservas: [],
  turnos: []
};
