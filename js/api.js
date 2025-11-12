import { AuthError, createHttpClient } from './shared/http-client.js';

const BASE_URL = 'https://dummyjson.com';
export const ALLOWED_ROLES = ["admin", "moderator"];

const api = createHttpClient(BASE_URL);

export const apiService = {
  /**
   * Autentifica a un usuario con username y password
   * @param {object} credentials - Las credenciales del usuario.
   * @param {string} credentials.username - El nombre de usuario.
   * @param {string} credentials.password - El password del usuario.
   * @returns {Promise<{success:boolean, user:User}>}
   */
  login: async ({ username, password }) => {
    const data = await api.post('/auth/login', { username, password });
    return { success: true, user: data };
  },

  /**
   * Obtiene una lista de usuarios paginada.
   * @param {object} [options] - Opciones de paginación.
   * @param {number} [options.limit=10] - El número máximo de usuarios a devolver.
   * @param {number} [options.skip=0] - El número de usuarios a omitir.
   * @returns {Promise<{users: Array<object>, total: number, skip: number, limit: number}>}
   */
  fetchUsers: ({ limit = 10, skip = 0 } = {}) => {
    const endpoint = `/users?limit=${limit}&skip=${skip}`;
    return api.get(endpoint);
  },


  /**
   * Valida un accessToken de autenticación y verifica si el usuario tiene un rol permitido.
   * @param {string} accessToken - El accessToken a validar.
   * @param {string[]} [allowed_roles=ALLOWED_ROLES] - Roles permitidos para la validación.
   * @returns {Promise<boolean>} Una promesa que resuelve a `true` si el accessToken es válido y el usuario tiene un rol permitido, `false` de lo contrario.
   */
  validateAdminToken: async (accessToken, allowedRoles = ALLOWED_ROLES) => {
    if (!accessToken) return false;
    try {
      const user = await api.get('/auth/me', accessToken);
      return allowedRoles.includes(user?.role)
    } catch (error) {
      if (error instanceof AuthError) {
        return false;
      }
      throw error;
    }
  },
};
