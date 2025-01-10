/**
 * @typedef {Object} UPT_TaskInterface
 * @property {string} id - ID zadania.
 * @property {string} name - Nazwa zadania.
 * @property {string} createdAt - Data utworzenia. 
 * @property {string} startDate - data startu.
 * @property {string} endDate - data końca.
 * @property {string} categoryId - Kategoria zadania.
 * @property {UPT_SubTask[]} subTasks - Lista podzadań.
 * @property {string} status - Status zadania.
 * @property {string} priority - Priorytet zadania.
 * @property {string} description - Opis zadania.
 * @property {number} type - typ zadania.
 * @property {boolean} isArchived - Czy zadanie zostało zarchiwizowane.
 * @property {string | null} archivedAt - Kiedy zostało zarchiwizowane.
 */