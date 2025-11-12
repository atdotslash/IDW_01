import {  apiService } from "../api.js";
import storageService from "../storage/index.js";
import { PAGES } from "./constants.js";

const hasSession = () => !!storageService.session.get();



export const auth = {
	redirectTo: (page) => {
		window.location.replace(page);
	},
	redirectToLogin: () => auth.redirectTo(PAGES.LOGIN),
	redirectToAdmin: () => auth.redirectTo(PAGES.ADMIN),
	hasSession,

	/**
	 * Protege una ruta, asegurándose de que existe una sesión.
	 * Si no existe una sesión, redirige a la página especificada (por defecto, al Login).
	 * @param {string} [redirectUrl=PAGES.LOGIN] - La URL a la que redirigir si no está autenticado.
	 * @returns {boolean} True si el usuario está autenticado, false de lo contrario.
	 */
	gatekeep: async (redirectUrl = PAGES.LOGIN) => {
			const session = storageService.session.get();
			const token = session?.accessToken;
			const isUserAuthenticated  = await apiService.validateAdminToken(token);
			if (!isUserAuthenticated) {
        storageService.session.clear()
				auth.redirectTo(redirectUrl);
			}
			return isUserAuthenticated;
	},

	/**
	 * Para rutas solo accesibles para invitados (como login/registro).
	 * Si existe una sesión, redirige a la página especificada (por defecto, al Admin).
	 * @param {string} [redirectUrl=PAGES.ADMIN] - La URL a la que redirigir si está autenticado.
	 * @returns {boolean} True si el usuario es invitado (no hay sesión), false de lo contrario.
	 */
	guestOnly: async (redirectUrl = PAGES.ADMIN) => {
			const session = storageService.session.get();
			const hasToken = session?.accessToken;
			if (hasToken) {
				auth.redirectTo(redirectUrl);
			}
			return !hasToken;
	},
};
