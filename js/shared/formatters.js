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
