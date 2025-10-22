import { STORAGE_KEYS } from "./constants.js";
import { createCrudFunctions } from "./crud.js";
import { parseNumericId } from "./utils.js";

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
  return doctors.add(newData)
}

export const createSpecialty = (newData) => {
  const allSpecialties = specialties.getAll();
  const isNameTaken = allSpecialties.some((s) => s.nombre.toLowerCase() === newData.nombre.toLowerCase());
  if (isNameTaken) {
    throw new Error(`El nombre de la especialidad ya existe`);
  }
  return specialties.add(newData);
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
  const numericId = parseNumericId(id)
  if (!numericId) return false
  const allAppointments = appointments.getAll()
  const appointmentsIdsToDelete = allAppointments.filter( a => a.medicoId === numericId).map(a => a.id)

  // Eliminar reservas asociadas a esos turnos
  if (appointmentsIdsToDelete.length > 0) {
    const reservationsToKeep = reservations.getAll().filter(r => !r.turnoId.includes(appointmentsIdsToDelete))
    reservations.replaceAll(reservationsToKeep)
    // Eliminar los turnos del medico
    const appointmentsToKeep = allAppointments.filter(a => a.medicoId !== numericId)
    appointments.replaceAll(appointmentsToKeep)

  }
  //  eliminar al médico
  return doctors.remove(numericId);
};
export const getAppointmentsByDoctorId = (doctorId) => {
  return appointments.getAll().filter(a => Number(a.medicoId) === Number(doctorId))
}
export const checkIfDuplicateAppointment = ( {doctorId, date, appointmentId}) => {
  return appointments.getAll().some((ap) => {
		const existingAppointmentDateTime = dayjs(ap.fechaHora);
		return (
			ap.medicoId === Number(doctorId) &&
			existingAppointmentDateTime.isSame(date) &&
			ap.id !== appointmentId
		);
	});
}
