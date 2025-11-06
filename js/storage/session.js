import { SESSION_KEY, SESSION_APPOINTMENT_DATA_KEY } from "./constants.js";
import { getData, removeData, saveData } from "./utils.js";

// --- Funciones de Sesión ---
export const session = {
  set: ({ accessToken, firstName, lastName, image, id }) =>
    saveData({
      key: SESSION_KEY,
      data: { accessToken, firstName, lastName, id, image },
      storageType: "sessionStorage",
    }),
  get: () => getData({ key: SESSION_KEY, storageType: "sessionStorage" }),
  clear: () => removeData({ key: SESSION_KEY, storageType: "sessionStorage" }),

  // Guardar doctor seleccionado
  saveAppointmentData: (doctorId) => {
    console.log(doctorId);

    saveData({
      key: SESSION_APPOINTMENT_DATA_KEY,
      data: { doctorId },
      storageType: "sessionStorage",
    });
  },

  // Obtener doctor seleccionado
  getAppointmentData: () => {
    const data = getData({
      key: SESSION_APPOINTMENT_DATA_KEY,
      storageType: "sessionStorage",
    });
    return data?.doctorId || null;
  },

  // Limpiar doctor seleccionado
  clearAppointmentData: () =>
    removeData({
      key: SESSION_APPOINTMENT_DATA_KEY,
      storageType: "sessionStorage",
    }),
};
