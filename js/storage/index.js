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
	getAppointmentsByDoctorId,
	checkIfDuplicateAppointment,
} from "./entities.js";
import { session } from "./session.js";

const initializeData = () => {
	if (localStorage.getItem(DB_KEY)) {
		return;
	}
	saveData(DB_KEY, INITIAL_DATA);
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
		add: createSpecialty,
	},
	insuranceCompanies,
	doctors: {
		...doctors,
		remove: deleteDoctor,
		add: createDoctor,
	},
	appointments: {
		...appointments,
		getByDoctorId: getAppointmentsByDoctorId,
		checkIfDuplicated: checkIfDuplicateAppointment,
	},
	reservations,
	session,
	utils,
};

export default Object.freeze(storageService);
