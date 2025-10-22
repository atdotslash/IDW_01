export const MESSAGES = {
    EMPTY_FIELDS: 'Por favor, complete todos los campos',
    ENTITY_OPERATION_SUCCESS : (entityName, operation) =>`${entityName} fue ${operation} con éxito.`,
    ENTITY_OPERATION_ERROR : (entityName, operation) =>`Error al ${operation} la ${entityName}. Intente nuevamente.`,
    ENTITY_DELETE_ERROR : (entityName) =>`Error al eliminar la ${entityName}. Intente nuevamente.`,
    ENTITY_DELETE_SUCCESS : (entityName) =>`${entityName} fue eliminada con éxito.`,
    CONFIRM_DELETE : (entityName) =>`¿Está seguro de que desea eliminar esta ${entityName}? Esta acción no se puede deshacer.`,
    ENTITY_LOAD_ERROR : (entityName) =>`Error al cargar ${entityName}. Intente nuevamente.`,
    INVALID_CREDENTIALS: "Credenciales inválidas. Usuario y/o Password Inválidos."
};

export const PAGES = {
    ADMIN: "admin-index.html",
    LOGIN: "login.html",
};

export const CURRENCY_CONFIG = {
  LOCALE: 'es-AR',
  CURRENCY: 'ARS'
}
