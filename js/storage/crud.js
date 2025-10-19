import { getEntity, saveEntity, parseNumericId } from "./utils.js";

const nextId = (collection) => {
	if (!collection || collection.length === 0) return 1;
	const maxId = Math.max(...collection.map((item) => item.id));
	return maxId + 1;
};

export const createCrudFunctions = (entityKey) => {
	const getAll = () => getEntity(entityKey);
    const replaceAll = (newCollection) => {
      saveEntity(entityKey, newCollection);
    };

	const getById = (id) => {
		const numericId = parseNumericId(id);
		if (!numericId) return null;
		return getAll().find((item) => item.id === numericId);
	};

	const add = (newItemData) => {
		const items = getAll();
		const newItem = { ...newItemData, id: nextId(items) };
		saveEntity(entityKey, [...items, newItem]);
		return newItem;
	};

	const update = (id, updatedData) => {
		const numericId = parseNumericId(id);
		if (!numericId) return null;
		const items = getAll();
		let updatedItem = null;
		const updatedItems = items.map((item) => {
			if (item.id === numericId) {
				updatedItem = { ...item, ...updatedData };
				return updatedItem;
			}
			return item;
		});
		if (!updatedItem) return null;
		saveEntity(entityKey, updatedItems);
		return updatedItem;
	};

	const remove = (id) => {
		const numericId = parseNumericId(id);
		if (!numericId) return false;
		const items = getAll();
		const filteredItems = items.filter((item) => item.id !== numericId);
		saveEntity(entityKey, filteredItems);
		return true;
	};

	return { getAll, getById, add, update, remove , replaceAll };
};
