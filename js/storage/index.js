import { DB_KEY, INITIAL_DATA, SESSION_KEY } from "./constants.js";
import {
  appointments,
  checkIfDuplicateAppointment,
  createDoctor,
  createInsuranceCompany,
  createSpecialty,
  deleteDoctor,
  deleteSpecialty,
  doctors,
  getAppointmentsByDoctorId,
  insuranceCompanies,
  bookings,
  specialties,
  updateInsuranceCompany,
  updateSpecialty,
  markAsReserved,
} from "./entities.js";
import { session } from "./session.js";
import { getData, removeData, saveData } from "./utils.js";

const initializeData = () => {
  if (localStorage.getItem(DB_KEY)) {
    return;
  }
  saveData({ key: DB_KEY, data: INITIAL_DATA });
};

// --- Funciones de Utilidad ---
const utils = {
  clearAllData: () => {
    removeData({ key: DB_KEY });
    removeData({ key: SESSION_KEY });
  },
  exportData: () => {
    return getData({ key: DB_KEY }) || {};
  },
  importData: (data) => {
    saveData({ key: DB_KEY, data });
  },
};

const storageService = {
  initialize: initializeData,
  specialties: {
    ...specialties,
    remove: deleteSpecialty,
    add: createSpecialty,
    update: updateSpecialty,
  },
  insuranceCompanies: {
    ...insuranceCompanies,
    add: createInsuranceCompany,
    update: updateInsuranceCompany,
  },
  doctors: {
    ...doctors,
    remove: deleteDoctor,
    add: createDoctor,
  },
  appointments: {
    ...appointments,
    getByDoctorId: getAppointmentsByDoctorId,
    checkIfDuplicated: checkIfDuplicateAppointment,
    markAsReserved: markAsReserved,
  },
  bookings,
  session,
  utils,
};

export default Object.freeze(storageService);
