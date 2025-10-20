export function readFileAsDataURL(file) {
    if (!(file instanceof Blob)) {
        return Promise.reject(new Error('El argumento proporcionado no es un archivo válido.'));
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = (error) => {
            const errorMessage = `Error al leer el archivo: ${error.message || 'Error desconocido'}`;
            reject(new Error(errorMessage, { cause: reader.error }));
        };
        reader.readAsDataURL(file);
    });
}
