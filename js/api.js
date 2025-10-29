import storageService from "./storage/index.js";

const BASE_URL = "https://dummyjson.com";

// Configuración global de la API
export const apiConfig = {
	simulateAsync: false, // Habilitar/deshabilitar simulación asíncrona
	asyncDelay: 1000, // Tiempo de retraso en milisegundos
};

const FAKE_CREDENTIALS = {
	username: "admin",
	password: "1234",
};

const simulateAsyncRequest = (operation, delay) => {
	const executeOperation = () => {
		try {
			const result = operation();
			return Promise.resolve(result);
		} catch (error) {
			console.error(error);
			return Promise.reject(error);
		}
	};

	if (!apiConfig.simulateAsync) {
		return executeOperation();
	}

	return new Promise((resolve, reject) => {
		setTimeout(() => {
			executeOperation().then(resolve).catch(reject);
		}, delay || apiConfig.asyncDelay);
	});
};

const createSimulatedCrud = (storageEntity) => ({
	getAll: () => simulateAsyncRequest(() => storageEntity.getAll()),
	getById: (id) => simulateAsyncRequest(() => storageEntity.getById(id)),
	create: ({ data }) => simulateAsyncRequest(() => storageEntity.add(data)),
	update: ({ id, data }) =>
		simulateAsyncRequest(() => storageEntity.update(id, data)),
	delete: ({ id }) => simulateAsyncRequest(() => storageEntity.remove(id)),
});

const http = {
	login: async ({ username, password }) => {
		const response = await fetch(`${BASE_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});
		return response.ok ? response.json() : Promise.reject(response);
	},

	fetchUsers: async ({ limit = 10, skip = 0 } = {}) => {
		const response = await fetch(
			`${BASE_URL}/users?limit=${limit}&skip=${skip}`,
		);
		return response.ok ? response.json() : Promise.reject(response);
	},

	validateToken: async (token) => {
		if (!token) return false;
		try {
			const response = await fetch(`${BASE_URL}/auth/me`, {
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			});
			return response.ok;
		} catch {
			return false;
		}
	},
};

// --- Service simulado (Local Storage) ---
const simulated = {
	fakeLogin: (username, password) => {
		return simulateAsyncRequest(() => {
			if (
				username === FAKE_CREDENTIALS.username &&
				password === FAKE_CREDENTIALS.password
			) {
				storageService.session.set({ username });
				return true;
			}
			throw new Error("Usuario y/o Password Inválidos");
		});
	},

	insuranceCompanies: createSimulatedCrud(storageService.insuranceCompanies),
	doctors: createSimulatedCrud(storageService.doctors),
	specialties: createSimulatedCrud(storageService.specialties),
};

export const api = {
	config: apiConfig,
	...http,
	...simulated,
};
