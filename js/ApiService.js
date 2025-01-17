class UPTApiService {
  // Zmień bazowy adres API np. https://https://e-szlaki.com/api/user-private-tasks
  static UPT_API_BASE_URL = "https://example.com/api";
  static UPT_LOCAL_STORAGE_ITEM_NAME = "user-private-tasks-data";
  /** @type {UPTApiService} */
  static instance;

  constructor() {
    this.baseUrl = UPTApiService.UPT_API_BASE_URL;
    // do obsługi localStorage
    this.storageKey = UPTApiService.UPT_LOCAL_STORAGE_ITEM_NAME;
    this.initializeStorage();
  }

  static getInstance() {
    if (!UPTApiService.instance) {
      UPTApiService.instance = new UPTApiService();
    }
    return UPTApiService.instance;
  }

  /**
   * Uniwersalna funkcja do wysyłania żądań do API.
   * @param {string} endpoint 
   * @param {string} method 
   * @param {Object|null} body 
   * @returns {Promise<Object>} 
   */
  async fetchAPI(endpoint, method = "GET", body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API error:", error);
    }
  }

  // tylko do symulacji. Usuń
  simulateLoadingFromDatabase(value) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(value)
      }, 600);
    });
  }

  getAllData() {
    // return this.fetchAPI("/categories-and-tasks"); 

    // zasymulowanie ładowania danych z bazy, usuń ten kod i odkomentuj ten wyżej
    return this.simulateLoadingFromDatabase(this.getAllData_LocalStorage())
  }

  async getCategories() {
    // return this.fetchAPI("/categories");

    return this.simulateLoadingFromDatabase(this.getCategories_LocalStorage())
  }

  /** @param {string} id */
  async getCategoryById(id) {
    // return this.fetchAPI(`/categories/${id}`);
    return this.simulateLoadingFromDatabase(this.getCategoryById_LocalStorage(id))
  }

  /** 
   * Musi zwrócić id kategorii wygenerowane przez baze danych
   * @param {UPT_TaskCategory} category 
   */
  async createCategory(category) {
    // const { id } = this.fetchAPI("/categories", "POST", category);
    // return id
    return this.simulateLoadingFromDatabase(this.createCategory_LocalStorage(category))
  }

  /**
   * @param {string} id
   * @param {UPT_TaskCategory} category
   */
  async updateCategory(id, category) {
    //return this.fetchAPI(`/categories/${id}`, "PUT", category);
    return this.simulateLoadingFromDatabase(this.updateCategory_LocalStorage(id, category))
  }

  /** @param {string} id */
  async deleteCategory(id) {
    // return this.fetchAPI(`/categories/${id}`, "DELETE");
    return this.simulateLoadingFromDatabase(this.deleteCategory_LocalStorage(id))
  }

  async getTasks() {
    // return this.fetchAPI("/tasks");
    return this.simulateLoadingFromDatabase(this.getTasks_LocalStorage())
  }

  /** @param {string} id */
  async getTaskById(id) {
    // return this.fetchAPI(`/tasks/${id}`);
    return this.simulateLoadingFromDatabase(this.getTaskById_LocalStorage(id))
  }

  /** 
   * Musi zwrócić id zadania wygenerowane przez baze danych
   * @param {UPT_Task} task  
   */
  async createTask(task) {
    // const {id} = this.fetchAPI("/tasks", "POST", task);
    // return id
    return this.simulateLoadingFromDatabase(this.createTask_LocalStorage(task))
  }

  /**
   * @param {string} id
   * @param {UPT_Task} task
   * @return {Promise<UPT_Task | null>}
   */
  async updateTask(id, task) {
    // return this.fetchAPI(`/tasks/${id}`, "PUT", task);
    return this.simulateLoadingFromDatabase(this.updateTask_LocalStorage(id, task))
  }

  /** @param {string} id */
  async deleteTask(id) {
    // return this.fetchAPI(`/tasks/${id}`, "DELETE");
    return this.simulateLoadingFromDatabase(this.deleteTask_LocalStorage(id))
  }

  /** @param {string} id */
  async archiveTask(id) {
    // return this.fetchAPI(`/archive/task/${id}`, "PUT");
    return this.simulateLoadingFromDatabase(this.archiveTask_LocalStorage(id))
  }

  /** @param {string} id */
  async restoreTask(id) {
    // return this.fetchAPI(`/restore/task/${id}`, "PUT");
    return this.simulateLoadingFromDatabase(this.restoreTask_LocalStorage(id))
  }

  //-------------------- Obsługa localStorage (odpowiada za przechowywanie stanu modułu) --------------------

  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        categories: [],
        tasks: [],
      };

      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getAllData_LocalStorage() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {
      categories: [],
      tasks: []
    };
  }

  /** @param {Object} data */
  saveAllData_LocalStorage(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getCategories_LocalStorage() {
    const data = this.getAllData_LocalStorage();
    return data.categories;
  }

  /** @param {string} id */
  getCategoryById_LocalStorage(id) {
    const categories = this.getCategories_LocalStorage();
    return categories.find((category) => category.id === id);
  }

  /** @param {UPT_TaskCategory} category */
  createCategory_LocalStorage(category) {
    const data = this.getAllData_LocalStorage();
    const newCategory = {
      ...category,
      id: UPT_Utils.generateId("category")
    };
    data.categories.push(newCategory);
    this.saveAllData_LocalStorage(data);

    return newCategory.id;
  }

  /**
   * @param {string} id
   * @param {UPT_TaskCategory} updatedCategory
   */
  updateCategory_LocalStorage(id, updatedCategory) {
    const data = this.getAllData_LocalStorage();
    const index = data.categories.findIndex((category) => category.id === id);
    if (index !== -1) {
      data.categories[index] = {
        ...data.categories[index],
        ...updatedCategory,
      };
      this.saveAllData_LocalStorage(data);
      return data.categories[index];
    }
    return null;
  }

  /** @param {string} id */
  deleteCategory_LocalStorage(id) {
    const data = this.getAllData_LocalStorage();
    data.categories = data.categories.filter((category) => category.id !== id);
    this.saveAllData_LocalStorage(data);
  }

  getMainTasks_LocalStorage() {
    const tasks = this.getTasks_LocalStorage()
    return tasks.filter(task => task.type === UPT_TaskType.MAIN);
  }

  getDailyTasks_LocalStorage() {
    const tasks = this.getTasks_LocalStorage()
    return tasks.filter(task => task.type === UPT_TaskType.DAILY);
  }

  getTasks_LocalStorage() {
    const data = this.getAllData_LocalStorage();
    return data.tasks;
  }

  /** @param {string} id */
  getTaskById_LocalStorage(id) {
    const tasks = this.getTasks_LocalStorage();
    return tasks.find((task) => task.id === id);
  }

  /** @param {UPT_Task} task */
  createTask_LocalStorage(task) {
    const data = this.getAllData_LocalStorage();
    const taskId = UPT_Utils.generateId("task")
    const newTask = {
      ...task,
      id: taskId,
      createdAt: UPT_Utils.toLocalISOString(new Date()),
    };
    data.tasks.push(newTask);
    this.saveAllData_LocalStorage(data);

    return taskId;
  }

  /**
   * @param {string} id
   * @param {UPT_Task} updatedTask
   * @return {UPT_Task | null}
   */
  updateTask_LocalStorage(id, updatedTask) {
    const data = this.getAllData_LocalStorage();
    const index = data.tasks.findIndex((task) => task.id === id);

    if (index !== -1) {
      data.tasks[index] = {
        ...data.tasks[index],
        ...updatedTask,
        id,
        updatedAt: UPT_Utils.toLocalISOString(new Date()),
      };
      this.saveAllData_LocalStorage(data);

      return data.tasks[index];
    }
    return null;
  }

  /** @param {string} id */
  archiveTask_LocalStorage(id) {
    const data = this.getAllData_LocalStorage();
    const archivedTaskIndex = data.tasks.findIndex((task) => task.id === id)
    data.tasks[archivedTaskIndex].isArchived = true
    data.tasks[archivedTaskIndex].archivedAt = UPT_Utils.toLocalISOString(new Date())
    this.saveAllData_LocalStorage(data);

    return data.tasks[archivedTaskIndex]
  }

  /** @param {string} id */
  restoreTask_LocalStorage(id) {
    const data = this.getAllData_LocalStorage();
    const restoreTaskIndex = data.tasks.findIndex((task) => task.id === id)
    const task = data.tasks[restoreTaskIndex]
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate); 
    const dayInMiliseconds = 24 * 60 * 60 * 1000
    const dateTimeDifference = Math.abs(endDate - startDate)
    const extraTime = dateTimeDifference < dayInMiliseconds ? dayInMiliseconds : dateTimeDifference
    // aby interwał usuwający zadania nie usunął go od razu po przywróceniu
    // ustawiam mu nowy termin na podstawie poprzedniego czasu potrzebnego na wykonanie zadania
    const newEndDate = new Date(endDate.getTime() + extraTime); 

    task.isArchived = false
    task.archivedAt = null
    task.status = UPT_TaskStatus.IN_PROGRESS
    task.endDate = UPT_Utils.toLocalISOString(newEndDate); 

    this.saveAllData_LocalStorage(data);

    return task
  }

  /** @param {string} id */
  deleteTask_LocalStorage(id) {
    const data = this.getAllData_LocalStorage();
    const deletedTask = data.tasks.find((task) => task.id === id)
    data.tasks = data.tasks.filter((task) => task.id !== id);
    this.saveAllData_LocalStorage(data);

    return deletedTask
  }
}