import { removeData, saveData, getData } from "./utils.js";
import {
	DB_KEY,
	FAKE_AUTH_CREDENTIALS,
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
  getAppointmentsByDoctorId,
  checkIfDuplicateAppointment,
} from "./entities.js";

const initializeData = () => {
	if (localStorage.getItem(DB_KEY)) {
		return;
	}
	saveData(DB_KEY, INITIAL_DATA);
};

// --- Funciones de Sesión ---
const session = {
	setAdmin: (user) => saveData(SESSION_KEY, { user, timestamp: Date.now() }),
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

const login = (username, password) => {
	if (
		username === FAKE_AUTH_CREDENTIALS.username &&
		password === FAKE_AUTH_CREDENTIALS.password
	) {
		session.setAdmin({ username });
		return true;
	}
  return false
};

const logout = () => {
	session.clearAdmin();
};

const storageService = {
	initialize: initializeData,
	specialties: {
		...specialties,
		remove: deleteSpecialty,
		add: createSpecialty,
	},
	insuranceCompanies,
	doctors: {
		...doctors,
		remove: deleteDoctor,
		add: createDoctor,
	},
	appointments : {
    ...appointments,
    getByDoctorId: getAppointmentsByDoctorId,
    checkIfDuplicated: checkIfDuplicateAppointment
  },
	reservations,
	session,
	utils,
	auth: {
		login,
		logout,
	},
};

export default Object.freeze(storageService);
