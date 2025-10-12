import { createCrudFunctions, nextId } from "./crud.js";
import { STORAGE_KEYS } from "./constants.js";

export const specialties = createCrudFunctions(STORAGE_KEYS.specialties);
export const insuranceCompanies = createCrudFunctions(
  STORAGE_KEYS.insuranceCompanies
);
export const doctors = createCrudFunctions(STORAGE_KEYS.doctors);
export const appointments = createCrudFunctions(STORAGE_KEYS.appointments);
export const reservations = createCrudFunctions(STORAGE_KEYS.reservations);

export const createDoctor = (newData) => {
  const allDoctors = doctors.getAll();
  const isLicenseNumberTaken = allDoctors.some((d) => d.matriculaProfesional === newData.matriculaProfesional);
  if (isLicenseNumberTaken) {
    throw new Error(`El doctor con el número de matricula ${newData.matriculaProfesional} ya existe`);
  }
  const newDoctor = {
    id: nextId(allDoctors),
    ...newData,
  };
  return doctors.add(newDoctor)
}

export const createSpecialty = (newData) => {
  const allSpecialties = specialties.getAll();
  const isNameTaken = allSpecialties.some((s) => s.nombre.toLowerCase() === newData.nombre.toLowerCase());
  if (isNameTaken) {
    throw new Error(`El nombre de la especialidad ya existe`);
  }
  const newSpecialty = {
    id: nextId(allSpecialties),
    ...newData,
  };
  return specialties.add(newSpecialty);
}


export const deleteSpecialty = (id) => {
  const allDoctors = doctors.getAll();
  const isInUse = allDoctors.some((doctor) => doctor.especialidadId === id);
  if (isInUse) {
    throw new Error(
      "No se puede eliminar la especialidad porque está asignada a uno o más médicos."
    );
  }
  return specialties.remove(id);
};

export const deleteDoctor = (id) => {
  const doctorAppointments = appointments
    .getAll()
    .filter((a) => a.medicoId === id);
  const doctorAppointmentsIds = doctorAppointments.map((t) => t.id);

  // Eliminar reservas asociadas a esos turnos
  const currentReservations = reservations.getAll();
  const filteredReservations = currentReservations.filter(
    (r) => !doctorAppointmentsIds.includes(r.turnoId)
  );
  filteredReservations.forEach((r) => reservations.remove(r.id));

  // Eliminar turnos del médico
  const currentAppointments = appointments.getAll();
  const filteredAppointments = currentAppointments.filter((a) => a.medicoId !== id);
  filteredAppointments.forEach((a) => appointments.remove(a.id));
  //  eliminar al médico
  return doctors.remove(id);
};
