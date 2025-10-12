import storageService from "./storage/index.js";
const FAKE_CREDENTIALS = {
  username: "admin",
  password: "1234",
};

const simulateAsyncRequest = (operation, delay = 1000) => {
  return new Promise((resolve, reject) => {

    setTimeout(() => {
      try {
        const result = operation();
        resolve(result);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    }, delay);
  });
};

export const api = {
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
