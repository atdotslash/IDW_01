export class HttpError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

export class AuthError extends HttpError {
  constructor(message, status, data = {}) {
    super(message || 'Fallo de autenticación', status, data);
    this.name = 'AuthError';
  }
}
/**
 * Crea un cliente HTTP configurado para interactuar con una API.
 * @param {string} baseURL - La URL base de la API
 * @returns {object} - Métodos para realizar solicitudes HTTP (GET, POST, etc.).
 */
export const createHttpClient = (baseURL) => {
  /**
   * Genera los encabezados HTTP para una solicitud.
   * @param {string} [token] - Token de autenticación para incluir en el encabezado 'Authorization'.
   * @param {string} [contentType='application/json'] - Tipo de contenido para el encabezado 'Content-Type'.
   * @returns {object} Un objeto con los encabezados HTTP.
   */
  const getHeaders = (token, contentType = 'application/json') => {
    const headers = { 'Content-Type': contentType };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  /**
   * Realiza una solicitud HTTP.
   * @private
   * @param {string} endpoint - El endpoint de la API.
   * @param {RequestInit} [options={}] - Opciones de la solicitud fetch.
   * @returns {Promise<any>} La respuesta de la solicitud.
   * @throws {AuthError|HttpError} Si la solicitud no es exitosa.
   */
  const _request = async (endpoint, options = {}) => {
    const url = `${baseURL}${endpoint}`;
    const response = await fetch(url, options);

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const status = response.status;
      const message = data.message || `Error HTTP: ${status}`;

      if (status === 401 || status === 403) {
        throw new AuthError(message, status, data);
      }
      throw new HttpError(message, status, data);
    }

    return data;
  };

  return {
    /**
     * Realiza una solicitud GET.
     * @param {string} endpoint - El endpoint de la API.
     * @param {string} [token] - Token de autenticación.
     * @returns {Promise<any>} La respuesta de la solicitud.
     */
    get: (endpoint, token) =>
      _request(endpoint, {
        method: 'GET',
        headers: getHeaders(token, 'application/json'),
      }),

    /**
     * Realiza una solicitud POST.
     * @param {string} endpoint - El endpoint de la API.
     * @param {object} body - El cuerpo de la solicitud.
     * @returns {Promise<any>} La respuesta de la solicitud.
     */
    post: (endpoint, body) =>
      _request(endpoint, {
        method: 'POST',
        headers: getHeaders(null, 'application/json'),
        body: JSON.stringify(body),
      }),
  };
};
