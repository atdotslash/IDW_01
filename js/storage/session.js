import { SESSION_KEY } from "./constants.js";
import { getData, removeData, saveData } from "./utils.js";

// --- Funciones de Sesión ---
export const session = {
  set: ({ accessToken, firstName, lastName, image }) =>
    saveData({
      key: SESSION_KEY,
      data: { user: {accessToken, firstName, lastName, image} },
      storageType: "sessionStorage",
    }),
  get: () => getData({ key: SESSION_KEY, storageType: "sessionStorage" }),
  clear: () => removeData({key: SESSION_KEY, storageType: "sessionStorage" }),
};
