/**
 * @file Módulo principal de almacenamiento (Facade).
 * @description Expone una API funcional y cohesiva para la gestión de datos de la aplicación.
 */
import { removeData, saveData, getData } from "./utils.js";
import {
  DB_KEY,
  INITIAL_DATA,
  SESSION_KEY,
} from "./constants.js";
import {
  specialties,
  deleteSpecialty,
  deleteDoctor,
  insuranceCompanies,
  doctors,
  appointments,
  reservations,
  createDoctor,
  createSpecialty,
} from "./entities.js";

const initializeData = () => {
  if (localStorage.getItem(DB_KEY)) {
    return;
  }
  saveData(DB_KEY, INITIAL_DATA);
};

// --- Funciones de Sesión ---
const session = {
  setAdmin: (user) =>
    saveData(SESSION_KEY, { user, timestamp: Date.now() }),
  getAdmin: () => getData(SESSION_KEY),
  clearAdmin: () => removeData(SESSION_KEY),
};

// --- Funciones de Utilidad ---
const utils = {
  clearAllData: () => {
    removeData(DB_KEY);
    removeData(SESSION_KEY);
  },
  exportData: () => {
    return getData(DB_KEY) || {};
  },
  importData: (data) => {
    saveData(DB_KEY, data);
  },
};

const storageService = {
  initialize: initializeData,
  specialties: {
    ...specialties,
    remove: deleteSpecialty,
    create: createSpecialty,
  },
  insuranceCompanies,
  doctors: {
    ...doctors,
    remove: deleteDoctor,
    create: createDoctor,
  },
  appointments,
  reservations,
  session,
  utils,
};

export default Object.freeze(storageService);
