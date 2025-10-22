
import { DB_KEY } from './constants.js'


const getDatabase = () => {
  try {
    const dbString = localStorage.getItem(DB_KEY);
    return dbString ? JSON.parse(dbString) : {};
  } catch (error) {
    console.error('Error al leer la base de datos de localStorage:', error);
    return {};
  }
};
const saveDatabase = (db) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    console.error('Error al guardar la base de datos en localStorage:', error);
    return false;
  }
};

export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error al leer desde localStorage (${key}):`, error);
    return null;
  }
};
export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error al guardar en localStorage (${key}):`, error);
    return false;
  }
};

export const getEntity = (entityKey) => {
  const db = getDatabase();
  return db[entityKey] || [];
};

export const saveEntity = (entityKey, data) => {
  const db = getDatabase();
  const updatedDb = {
    ...db,
    [entityKey]: data
  };
  return saveDatabase(updatedDb);
};


export const removeData = (key) => {
  localStorage.removeItem(key);
};

export const parseNumericId = (id) => {
	const numericId = Number(id);
	if (Number.isNaN(numericId)) return null;
	return numericId;
};
