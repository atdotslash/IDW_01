const FAKE_CREDENTIALS = {
  username: "admin",
  password: "1234"
}

const STORAGE_KEY = 'idw_admin_data';

const DEFAULT_DATA = {
  specialties: [
    { id: 1, name: "Cardiología" },
    { id: 2, name: "Dermatología" },
    { id: 3, name: "Pediatría" },
    { id: 4, name: "Ginecología" }
  ]
};

function loadData() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : { ...DEFAULT_DATA };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getNextId(items) {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
}


const delay = (callback) => {
  setTimeout(callback, 2500);
};


export const api = {
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      delay(() => {
        if (username === FAKE_CREDENTIALS.username && password === FAKE_CREDENTIALS.password) {
          resolve({ success: true });
        } else {
          reject({ success: false, message: "Usuario y/o Password Incorrectos" });
        }
      });
    });
  },

  getSpecialties: () => {
    return new Promise((resolve) => {
      delay(() => {
        resolve([...loadData().specialties]);
      });
    });
  },

  getSpecialtiesById: (id) => {
    return new Promise((resolve, reject) => {
      const specialty = loadData().specialties.find(s => s.id === id) 
      delay(() => {
        specialty ? resolve(specialty) : reject(null);
      });
    });
  },

  createSpecialty: ({data}) => {
    return new Promise((resolve) => {
      delay(() => {
        const loadedData = loadData()
        const newSpecialty = {
          id: getNextId(loadedData.specialties),
          ...data,
        };
        loadedData.specialties.push(newSpecialty);
        saveData(loadedData);
        resolve({data: newSpecialty, message: "Especialidad guardada correctamente"});
      });
    });
  },

  updateSpecialty: ({id, data: specialtyData}) => {

    return new Promise((resolve, reject) => {
      
      delay(() => {
        const loadedData = loadData()
        const index = loadedData.specialties.findIndex(s => s.id === id);
        if (index !== -1) {
          loadedData.specialties[index] = { ...loadedData.specialties[index], ...specialtyData };
          saveData(loadedData)
          resolve({data: loadedData.specialties[index], message: "Especialidad actualizada correctamente"});
        } else {
          reject({ message: "Especialidad no encontrada" });
        }
      });
    });
  },

  deleteSpecialty: (id) => {
    return new Promise((resolve, reject) => {
      delay(() => {
        const data = loadData()
        const isBeingUsed = false; 
        
        if (isBeingUsed) {
          return reject({ message: "No se puede eliminar la especialidad porque está en uso." });
        }

        const index = data.specialties.findIndex(s => s.id === id);
        if (index !== -1) {
          data.specialties.splice(index, 1);
          saveData(data)
          resolve({  success: true });
        } else {
          reject({ message: "Especialidad no encontrada" });
        }
      });
    });
  },
};
