import storageService from "./storage/index.js";

// Configuración global de la API
export const apiConfig = {
  simulateAsync: false,  // Habilitar/deshabilitar simulación asíncrona
  asyncDelay: 1000      // Tiempo de retraso en milisegundos
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

export const api = {
  config: apiConfig,
  login: (username, password) => {
    return simulateAsyncRequest(() => {
      if (
        username === FAKE_CREDENTIALS.username &&
        password === FAKE_CREDENTIALS.password
      ) {
        storageService.session.setAdmin({ username });
        return true
      }
      throw new Error("Usuario y/o Password Inválidos")
    })
  },

  getInsuranceCompanies: () => {
    return simulateAsyncRequest(() => storageService.insuranceCompanies.getAll())
  },

  getDoctors: () => {
    return simulateAsyncRequest(() => storageService.doctors.getAll())
  },

  getDoctorById: (id) => {
    return simulateAsyncRequest(() => storageService.doctors.getById(id))
  },
  createDoctor: ({ data }) => {
    return simulateAsyncRequest(() => storageService.doctors.create(data))
  },
  updateDoctor: ({ id, data }) => {
    return simulateAsyncRequest(() => storageService.doctors.update(id, data))
  },
  deleteDoctor: ({ id }) =>
    simulateAsyncRequest(() => storageService.doctors.remove(id))
  ,
  getSpecialties: () => {
    return simulateAsyncRequest(() => storageService.specialties.getAll())
  },

  getSpecialtiesById: (id) => {
    return simulateAsyncRequest(() => storageService.specialties.getById(id))
  },

  createSpecialty: ({ data }) => {
    return simulateAsyncRequest(() => storageService.specialties.create(data))
  },

  updateSpecialty: ({ id, data }) => {
    return simulateAsyncRequest(() => storageService.specialties.update(id, data))
  },

  deleteSpecialty: (id) => {
    return simulateAsyncRequest(() => storageService.specialties.remove(id))
  },
};
