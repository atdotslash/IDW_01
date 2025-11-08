import { CURRENCY_CONFIG } from "./constants.js";

export function formatCurrency(amount) {
    return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
        style: 'currency',
        currency: CURRENCY_CONFIG.CURRENCY,
    }).format(Number.isNaN(amount) ? 0 : amount);
}

/**
 * Genera el nombre completo de una persona en formato "Apellido, Nombre".
 * @param {object} obj - El objeto que contiene el nombre y el apellido.
 * @param {string} [firstNameKey='nombre'] - La clave para acceder al nombre en el objeto.
 * @param {string} [lastNameKey='apellido'] - La clave para acceder al apellido en el objeto.
 * @returns {string} El nombre completo formateado o una cadena vacía si los datos no son válidos.
 */
export function fullName(obj, firstNameKey = 'nombre', lastNameKey = 'apellido') {
  if (!obj || typeof obj?.[firstNameKey] !== 'string' || typeof obj?.[lastNameKey] !== 'string') return '';
  return `${obj[lastNameKey]}, ${obj[firstNameKey]}`;
}

/**
 * @param {string} dateString - Cadena ISO de fecha y hora.
 * @returns {string} Fecha y hora legible en AR.
 */

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  // Capitalizar la primera letra del día de la semana
  const formattedDate = date.toLocaleString("es-AR", options).replaceAll(",", "");
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

}
