import { CURRENCY_CONFIG } from "./constants";

export function formatCurrency(amount) {
    return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
        style: 'currency',
        currency: CURRENCY_CONFIG.CURRENCY,
    }).format(isNaN(amount) ? 0 : amount);
}

export function fullName(doctor) {
  if (!doctor || typeof doctor?.nombre !== 'string' || typeof doctor?.apellido !== 'string') return '';
  return `${doctor.apellido}, ${doctor.nombre}`
}
