import { STORAGE_KEYS } from './constants.js';
import { createCrudFunctions } from './crud.js';
import { parseNumericId } from './utils.js';

export const specialties = createCrudFunctions(STORAGE_KEYS.specialties);
export const insuranceCompanies = createCrudFunctions(STORAGE_KEYS.insuranceCompanies);
export const doctors = createCrudFunctions(STORAGE_KEYS.doctors);
export const appointments = createCrudFunctions(STORAGE_KEYS.appointments);
export const reservations = createCrudFunctions(STORAGE_KEYS.reservations);

export const createDoctor = (newData) => {
  const allDoctors = doctors.getAll();
  const isLicenseNumberTaken = allDoctors.some(
    (d) => d.matriculaProfesional === newData.matriculaProfesional && d.id !== newData.id,
  );
  if (isLicenseNumberTaken) {
    throw new Error(
      `La matriculaProfesional ${newData.matriculaProfesional} ya esta registrada.`,
    );
  }
  return doctors.add(newData);
};
const isNameTaken = (entityList, newName, currentId = null) => {
  return entityList.some(
    (s) => s.nombre.toLowerCase() === newName.toLowerCase() && s.id !== currentId,
  );
};
export const createSpecialty = (newData) => {
  if (isNameTaken(specialties.getAll(), newData.nombre)) {
    throw new Error(`El nombre de la especialidad ya existe`);
  }
  return specialties.add(newData);
};

export const updateSpecialty = (id, newData) => {
  const currentSpecialty = specialties.getById(id);
  if (newData?.nombre && newData.nombre !== currentSpecialty.nombre) {
    if (isNameTaken(specialties.getAll(), newData.nombre, id)) {
      throw new Error(`El nombre de la especialidad ya existe`);
    }
  }
  return specialties.update(id, newData);
};

export const createInsuranceCompany = (newData) => {
  if (isNameTaken(insuranceCompanies.getAll(), newData.nombre)) {
    throw new Error(`El nombre de la obra social ya existe`);
  }
  return insuranceCompanies.add(newData);
};

export const updateInsuranceCompany = (id, newData) => {
  const currentInsuranceCompany = insuranceCompanies.getById(id);
  if (newData?.nombre && newData.nombre !== currentInsuranceCompany.nombre) {
    if (isNameTaken(insuranceCompanies.getAll(), newData.nombre, id)) {
      throw new Error(`El nombre de la obra social ya existe`);
    }
  }
  return insuranceCompanies.update(id, newData);
};

export const deleteSpecialty = (id) => {
  const allDoctors = doctors.getAll();
  const isInUse = allDoctors.some((doctor) => doctor.especialidadId === id);
  if (isInUse) {
    throw new Error(
      'No se puede eliminar la especialidad porque está asignada a uno o más médicos.',
    );
  }
  return specialties.remove(id);
};

export const deleteDoctor = (id) => {
  const numericId = parseNumericId(id);
  if (!numericId) return false;
  const allAppointments = appointments.getAll();
  const appointmentsIdsToDelete = allAppointments
    .filter((a) => a.medicoId === numericId)
    .map((a) => a.id);

  // Eliminar reservas asociadas a esos turnos
  if (appointmentsIdsToDelete.length > 0) {
    const reservationsToKeep = reservations
      .getAll()
      .filter((r) => !r.turnoId.includes(appointmentsIdsToDelete));
    reservations.replaceAll(reservationsToKeep);
    // Eliminar los turnos del medico
    const appointmentsToKeep = allAppointments.filter((a) => a.medicoId !== numericId);
    appointments.replaceAll(appointmentsToKeep);
  }
  //  eliminar al médico
  return doctors.remove(numericId);
};
export const getAppointmentsByDoctorId = (doctorId) => {
  return appointments.getAll().filter((a) => Number(a.medicoId) === Number(doctorId));
};
export const checkIfDuplicateAppointment = ({ doctorId, date, appointmentId }) => {
  return appointments.getAll().some((ap) => {
    const existingAppointmentDateTime = dayjs(ap.fechaHora);
    return (
      ap.medicoId === Number(doctorId) &&
      existingAppointmentDateTime.isSame(date) &&
      ap.id !== appointmentId
    );
  });
};
