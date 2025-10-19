import storageService from "../storage/index.js";
import { PAGES } from "./constants.js";

const hasSession = () => !!storageService.session.getAdmin();

export const auth = {
	redirectTo: (page) => {
		window.location.replace(page);
	},
	hasSession,

	/**
	 * Protege una ruta, asegurándose de que existe una sesión.
	 * Si no existe una sesión, redirige a la página especificada (por defecto, al Login).
	 * @param {string} [redirectUrl=PAGES.LOGIN] - La URL a la que redirigir si no está autenticado.
	 * @returns {boolean} True si el usuario está autenticado, false de lo contrario.
	 */
	gatekeep: (redirectUrl = PAGES.LOGIN) => {
		const sessionExists = hasSession();
		if (!sessionExists) {
			auth.redirectTo(redirectUrl);
		}
		return sessionExists;
	},

	/**
	 * Para rutas solo accesibles para invitados (como login/registro).
	 * Si existe una sesión, redirige a la página especificada (por defecto, al Admin).
	 * @param {string} [redirectUrl=PAGES.ADMIN] - La URL a la que redirigir si está autenticado.
	 * @returns {boolean} True si el usuario es invitado (no hay sesión), false de lo contrario.
	 */
	guestOnly: (redirectUrl = PAGES.ADMIN) => {
		const sessionExists = hasSession();
		if (sessionExists) {
			auth.redirectTo(redirectUrl);
		}
		return !sessionExists;
	},
};
