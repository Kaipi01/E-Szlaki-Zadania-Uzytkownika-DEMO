"use strict";

class UPTApiService {
  // Zmień bazowy adres API np. https://https://e-szlaki.com/api/user-private-tasks
  static UPT_API_BASE_URL = "https://example.com/api";
  // tymaczasowe przechowywanie danych w localStorage
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

  async getAllData() {
    //return this.fetchAPI("/categories-and-tasks");
    return this.getAllData_LocalStorage();
  }

  async getCategories() {
    // return this.fetchAPI("/categories");
    return this.getCategories_LocalStorage();
  }

  /** @param {string} id */
  async getCategoryById(id) {
    // return this.fetchAPI(`/categories/${id}`);
    return this.getCategoryById_LocalStorage(id);
  }

  /** @param {UPT_TaskCategory} category */
  async createCategory(category) {
    // return this.fetchAPI("/categories", "POST", category);
    return this.createCategory_LocalStorage(category);
  }

  /**
   * @param {string} id
   * @param {UPT_TaskCategory} category
   */
  async updateCategory(id, category) {
    //return this.fetchAPI(`/categories/${id}`, "PUT", category);
    return this.updateCategory_LocalStorage(id, category);
  }

  /** @param {string} id */
  async deleteCategory(id) {
    // return this.fetchAPI(`/categories/${id}`, "DELETE");
    return this.deleteCategory_LocalStorage(id);
  }

  async getTasks() {
    // return this.fetchAPI("/tasks");
    return this.getTasks_LocalStorage();
  }

  /** @param {string} id */
  async getTaskById(id) {
    // return this.fetchAPI(`/tasks/${id}`);
    return this.getTaskById_LocalStorage(id);
  }

  /** @param {UPT_Task} task */
  async createTask(task) {
    // return this.fetchAPI("/tasks", "POST", task);
    return this.createTask_LocalStorage(task);
  }

  /**
   * @param {string} id
   * @param {UPT_Task} task
   */
  async updateTask(id, task) {
    // return this.fetchAPI(`/tasks/${id}`, "PUT", task);
    return this.updateTask_LocalStorage(id, task);
  }

  /** @param {string} id */
  async deleteTask(id) {
    // return this.fetchAPI(`/tasks/${id}`, "DELETE");
    return this.deleteTask_LocalStorage(id);
  }

  //-------------------- Obsługa localStorage (odpowiada za przechowywanie stanu aplikacji) --------------------

  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        categories: [],
        tasks: [],
      };

      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  async getAllData_LocalStorage() {
    // const data = localStorage.getItem(this.storageKey);
    // return data ? JSON.parse(data) : { categories: [], tasks: [] };

    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem(this.storageKey);
        resolve(data ? JSON.parse(data) : { categories: [], tasks: [] });
      }, 1000);  
    });
  }

  /** @param {Object} data */
  async saveAllData_LocalStorage(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  async getCategories_LocalStorage() {
    const data = await this.getAllData_LocalStorage();
    return data.categories;
  }

  /** @param {string} id */
  async getCategoryById_LocalStorage(id) {
    const categories = await this.getCategories_LocalStorage();
    return categories.find((category) => category.id === id);
  }

  /** @param {UPT_TaskCategory} category */
  async createCategory_LocalStorage(category) {
    const data = await this.getAllData_LocalStorage();
    const newCategory = { ...category, id: generateId("category") };
    data.categories.push(newCategory);
    this.saveAllData_LocalStorage(data);
    return newCategory;
  }

  /**
   * @param {string} id
   * @param {UPT_TaskCategory} updatedCategory
   */
  async updateCategory_LocalStorage(id, updatedCategory) {
    const data = await this.getAllData_LocalStorage();
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
  async deleteCategory_LocalStorage(id) {
    const data = await this.getAllData_LocalStorage();
    data.categories = data.categories.filter((category) => category.id !== id);
    this.saveAllData_LocalStorage(data);
  }

  async getTasks_LocalStorage() {
    const data = await this.getAllData_LocalStorage();
    return data.tasks;
  }

  /** @param {string} id */
  async getTaskById_LocalStorage(id) {
    const tasks = await this.getTasks_LocalStorage();
    return tasks.find((task) => task.id === id);
  }

  /** @param {UPT_Task} task */
  async createTask_LocalStorage(task) {
    const data = await this.getAllData_LocalStorage();
    const newTask = {
      ...task,
      id: generateId("task"),
      createdAt: new Date().toISOString(),
    };
    data.tasks.push(newTask);
    this.saveAllData_LocalStorage(data);
    return newTask;
  }

  /**
   * @param {string} id
   * @param {UPT_Task} updatedTask
   */
  async updateTask_LocalStorage(id, updatedTask) {
    const data = await this.getAllData_LocalStorage();
    const index = data.tasks.findIndex((task) => task.id === id);
    if (index !== -1) {
      data.tasks[index] = {
        ...data.tasks[index],
        ...updatedTask,
        updatedAt: new Date().toISOString(),
      };
      this.saveAllData_LocalStorage(data); 

      return data.tasks[index];
    }
    return null;
  }

  /** @param {string} id */
  async deleteTask_LocalStorage(id) {
    const data = await this.getAllData_LocalStorage();
    data.tasks = data.tasks.filter((task) => task.id !== id);
    this.saveAllData_LocalStorage(data);
  } 
}
