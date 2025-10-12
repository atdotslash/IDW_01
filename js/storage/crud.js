import { getEntity, saveEntity } from "./utils.js";

export const nextId = (collection) => {
  if (!collection || collection.length === 0) return 1;
  const maxId = Math.max(...collection.map((item) => item.id));
  return maxId + 1;
};
export const createCrudFunctions = (entityKey) => {
  const getAll = () => getEntity(entityKey);

  const getById = (id) => getAll().find((item) => item.id === id);

  const add = (newItemData) => {
    const items = getAll();
    const newItem = { ...newItemData, id: nextId(items) };
    saveEntity(entityKey, [...items, newItem]);
    return newItem;
  };

  const update = (id, updatedData) => {
    const items = getAll();
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updatedData } : item
    );
    saveEntity(entityKey, updatedItems);
    return getById(id);
  };

  const remove = (id) => {
    const items = getAll();
    const filteredItems = items.filter((item) => item.id !== id);
    saveEntity(entityKey, filteredItems);
    return true;
  };

  return { getAll, getById, add, update, remove };
};
