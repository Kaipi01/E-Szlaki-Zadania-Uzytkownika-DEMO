"use strict";

class UPT_TaskType {
  static DAILY = "Dzienne";
  static MAIN = "Główne";
}

class UPT_TaskStatus {
  static COMPLETED = "Zrealizowano";
  static IN_PROGRESS = "W trakcie";
  static DELETED = "Usunięto";
}

class UPT_TaskPriority {
  static LOW = "Niski";
  static MEDIUM = "Średni";
  static HIGH = "Wysoki";
  static VERY_HIGH = "Bardzo Wysoki";
}

class UPT_TaskCategory {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} icon
   */
  constructor(name, icon) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.createdAt = (new Date()).toISOString();
  }

  /** @param {string} icon */
  setIcon(icon) {
    this.icon = icon;
  }
  /** @param {string} name */
  setName(name) {
    this.name = name;
  }
  toString() {
    return this.name;
  }
}

class UPT_SubTask {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string | null} deadline
   * @param {bool} isCompleted
   */
  constructor(id, name, deadline = null, isCompleted = false) {
    this.id = id;
    this.name = name;
    this.deadline = deadline;
    this.isCompleted = isCompleted;
  }

  /** @param {bool} isCompleted */
  setIsCompleted(isCompleted) {
    this.isCompleted = isCompleted;
  }
  /** @param {string | null} deadline */
  setDeadline(deadline) {
    this.deadline = deadline;
  }
  /** @param {string} name */
  setName(name) {
    this.name = name;
  }

  getIsCompleted() {
    return this.isCompleted;
  }

  getDeadline() {
    return this.deadline;
  }

  getName() {
    return this.name;
  }
}

/**
 * @typedef {Object} UPT_TaskInterface
 * @property {string} id - ID zadania.
 * @property {string} name - Nazwa zadania.
 * @property {string} createdAt - Data utworzenia.
 * @property {string} deadline - Termin wykonania.
 * @property {string} categoryId - Kategoria zadania.
 * @property {UPT_SubTask[]} subTasks - Lista podzadań.
 * @property {string} status - Status zadania.
 * @property {string} priority - Priorytet zadania.
 * @property {string} description - Opis zadania.
 * @property {number} type - typ zadania.
 * @property {boolean} isArchived - Czy zadanie zostało zarchiwizowane.
 * @property {string | null} archivedAt - Kiedy zostało zarchiwizowane.
 */
class UPT_Task {
  /**
   * @param {UPT_TaskInterface} taskProps
   */
  constructor(taskProps) {
    this.id = String(taskProps.id);
    this.name;
    this.type;
    this.deadline;
    this.categoryId;
    this.priority;
    this.status;
    this.description;
    this.subTasks;
    this.isArchived;
    this.createdAt = new Date().toISOString();
    this.updatedAt;
    this.archivedAt
    this.validateTaskProps(taskProps);
  }

  /**
   * @param {UPT_TaskInterface} taskProps
   */
  validateTaskProps(taskProps) {
    this.setName(taskProps.name);
    this.setUpdatedAt(this.createdAt);
    this.setDeadline(taskProps.deadline);
    this.setCategoryId(taskProps.categoryId);
    this.setSubTasks(taskProps.subTasks || []);
    this.setStatus(taskProps.status || UPT_TaskStatus.IN_PROGRESS);
    this.setPriority(taskProps.priority);
    this.setType(taskProps.type);
    this.setDescription(taskProps.description || "");
    this.setIsArchived(taskProps.isArchived || false);
    this.setArchivedAt(taskProps.archivedAt)
  }

  /** @param {string} value */
  setName(value) {
    this.name = String(value);
  }

  /** @param {string} value */
  setType(value) {
    if (value !== UPT_TaskType.DAILY && value !== UPT_TaskType.MAIN) {
      console.error("type must be a UPT_TaskType");
    }
    this.type = value;
  }

  /** @param {string} value */
  setUpdatedAt(value) {
    this.updatedAt = new Date(value).toISOString();
  }

  /** @param {string | null} value */
  setArchivedAt(value) {
    if (value) {
      this.archivedAt = new Date(value).toISOString();
    }
  }

  /** @param {string} value */
  setDeadline(value) {
    this.deadline = new Date(value).toISOString();
  }

  /** @param {string} value */
  setCategoryId(value) {
    this.categoryId = String(value);
  }

  /** @param {UPT_SubTask[]} value */
  setSubTasks(value) {
    if (!Array.isArray(value)) {
      console.error("subTasks must be an array.");
    } else {
      value.forEach((subTask) => {
        if (!(subTask instanceof UPT_SubTask)) {
          console.error("subTasks must be array of UPT_SubTask");
        }
      });
    }

    this.subTasks = value;
  }

  /** @param {string} value */
  setStatus(value) {
    if (
      value !== UPT_TaskStatus.COMPLETED &&
      value !== UPT_TaskStatus.DELETED &&
      value !== UPT_TaskStatus.IN_PROGRESS
    ) {
      console.error("status must be a UPT_TaskStatus");
    }
    this.status = value;
  }

  /** @param {string} value */
  setPriority(value) {
    if (
      value !== UPT_TaskPriority.LOW &&
      value !== UPT_TaskPriority.MEDIUM &&
      value !== UPT_TaskPriority.HIGH &&
      value !== UPT_TaskPriority.VERY_HIGH
    ) {
      console.error("priority must be a UPT_TaskPriority");
    }
    this.priority = value;
  }

  /** @param {string} value */
  setDescription(value) {
    this.description = String(value);
  }

  /** @param {boolean} value */
  setIsArchived(value) {
    this.isArchived = Boolean(value);
  }
}

class UPT_Utils {

  /** @param {UPT_Task} task */
  static getPercentOfCompletedSubTasks(task) {
    const subTasksLength = task.subTasks.length
    const completedSubTasksNumber = task.subTasks.reduce(
      (value, subTask) => (subTask.isCompleted ? value + 1 : value), 0
    );

    return Math.round((completedSubTasksNumber * 100) / subTasksLength);
  }

  static getCategoryIconClass(category) {
    if (!category) return '' 

    return `fa-solid ${category.icon }`
  }

  /** @returns {Map<string, string>} */
  static getAllCategoryIcons() {
    const categoryIcons = new Map()

    categoryIcons.set("fa-briefcase", "Teczka")
    categoryIcons.set("fa-house", "Dom")
    categoryIcons.set("fa-notes-medical", "Notatki Medyczne")
    categoryIcons.set("fa-palette", "Paleta z Kolorami")
    categoryIcons.set("fa-heart", "Serce")
    categoryIcons.set("fa-plane", "Samolot")
    categoryIcons.set("fa-book", "Książka")
    categoryIcons.set("fa-medal", "Medal")
    categoryIcons.set("fa-image", "Obraz")
    categoryIcons.set("fa-user", "Osoba")
    categoryIcons.set("fa-volleyball", "Piłka do siatkówki")
    categoryIcons.set("fa-gamepad", "Gamepad")
    categoryIcons.set("fa-wand-magic-sparkles", "Różczka")
    categoryIcons.set("fa-music", "Nuta")
    categoryIcons.set("fa-truck", "Ciężarówka")
    categoryIcons.set("fa-shield-halved", "Tarcza")
    categoryIcons.set("fa-film", "Taśma Filmowa")
    categoryIcons.set("fa-fire", "Ogień")
    categoryIcons.set("fa-tree", "Drzewo")
    categoryIcons.set("fa-spa", "Spa")
    categoryIcons.set("fa-flask", "Szklana Kolba")

    return categoryIcons
  }

  /** @param {UPT_Task[]} tasks */
  static sortTasksByPriority(tasks) {
    return tasks.sort((a, b) => UPT_Utils.getTaskPriorityValue(a) < UPT_Utils.getTaskPriorityValue(b))
  }

  /** @param {UPT_Task} task */
  static getTaskPriorityValue(task) {
    const priorityValues = new Map();

    priorityValues.set(UPT_TaskPriority.VERY_HIGH, 4)
    priorityValues.set(UPT_TaskPriority.HIGH, 3)
    priorityValues.set(UPT_TaskPriority.MEDIUM, 2)
    priorityValues.set(UPT_TaskPriority.LOW, 1)

    return priorityValues.get(task.priority)
  }

  static getAllTaskStatusSubClasses() {
    const statusSubClasses = new Map();

    statusSubClasses.set(UPT_TaskStatus.COMPLETED, "task-status--completed")
    statusSubClasses.set(UPT_TaskStatus.DELETED, "task-status--deleted")
    statusSubClasses.set(UPT_TaskStatus.IN_PROGRESS, "task-status--in-progress")

    return statusSubClasses
  }

  static getAllTaskPrioritySubClasses() {
    const prioritySubClasses = new Map();

    prioritySubClasses.set(UPT_TaskPriority.VERY_HIGH, "task-priority--very-high")
    prioritySubClasses.set(UPT_TaskPriority.HIGH, "task-priority--high")
    prioritySubClasses.set(UPT_TaskPriority.MEDIUM, "task-priority--medium")
    prioritySubClasses.set(UPT_TaskPriority.LOW, "task-priority--low")

    return prioritySubClasses
  }

  /** @param {UPT_Task} task */
  static getTaskStatusSubClass(task) {
    return UPT_Utils.getAllTaskStatusSubClasses().get(task.status)
  }

  /** @param {UPT_Task} task */
  static getTaskPrioritySubClass(task) {
    return UPT_Utils.getAllTaskPrioritySubClasses().get(task.priority)
  }
}

// ---------------------------- FUNCTIONS ----------------------------


/**
 * @param {HTMLElement | string} element
 * @param {(element: HTMLElement) => void} callback
 */
function manipulateDOMElement(element, callback) {
  if (typeof element === "string") {
    let selector = element;
    element = document.querySelector(selector);
  }

  if (element && element instanceof HTMLElement) {
    callback(element);
  } else {
    console.error("element don't exist !")
  }
}

/** @param {HTMLElement | string} card */
function removeDataCard(card) {
  manipulateDOMElement(card, (card) => {
    card.style.transition = "all 0.3s ease";
    card.style.backgroundColor = "red";

    setTimeout(() => card.remove(), 500);
  });
}

/** @param {HTMLElement | string} element */
function showLoading(element) {
  manipulateDOMElement(element, element => element.classList.add("loading"));
}

/** @param {HTMLElement | string} element */
function hideLoading(element) {
  manipulateDOMElement(element, (element) => element.classList.remove("loading"));
}

/**  @param {string} modalId */
function showModalLoading(modalId) {
  dispatchEvent(UPTModuleModal.START_LOADING_EVENT_NAME, {
    modalId: modalId,
  });
}

/**  @param {string} modalId */
function hideModalLoading(modalId) {
  dispatchEvent(UPTModuleModal.STOP_LOADING_EVENT_NAME, {
    modalId: modalId
  });
}

/**  @param {string} modalId */
function hideModal(modalId) {
  dispatchEvent(UPTModuleModal.HIDE_EVENT_NAME, {
    modalId: modalId,
  });
}

/**
 * @param {string} modalId
 * @param {string | null} title
 */
function showModal(modalId, title = null) {
  const modal = document.querySelector(`#${modalId}`);
  const modalTitleAttr = modal?.querySelector(`[${UserPrivateTasksModuleModal.ATTR_TITLE}]`);

  if (modalTitleAttr && title) {
    modalTitleAttr.textContent = title;
  }

  dispatchEvent(UPTModuleModal.SHOW_EVENT_NAME, {
    modalId
  });
}

/**
 * @param {string} eventName
 * @param {object} eventData
 */
function dispatchEvent(eventName, eventData = {}) {
  document.dispatchEvent(
    new CustomEvent(eventName, {
      detail: eventData,
    })
  );
}

/** @param {string} dateString */
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

/** @param {string} dateString */
function getUserFriendlyDateFormat(dateString) {
  const date = new Date(dateString);
  const formattedDate = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return capitalizeWords(formattedDate);
}

/** 
 * @param {string} prefix
 * @returns {string} Unikalny identyfikator. 
 */
function generateId(prefix = "") {
  return prefix + Math.random().toString(36);
}

/**
 * Przekształca każde pierwsze słowo w zdaniu na wielką literę
 * @param {string} text
 * @returns {string}
 */
function capitalizeWords(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * @param {() => void} callback
 * @param {HTMLElement} elementToAnimate
 * @param {number} durationInMiliseconds
 */
function fadeAnimation(callback, elementToAnimate, durationInMiliseconds) {
  elementToAnimate.style.transition = `all ${durationInMiliseconds / 1000.0}s ease`
  elementToAnimate.style.opacity = "0"

  setTimeout(() => {
    callback()
    elementToAnimate.style.opacity = "1"
  }, durationInMiliseconds)
}

/**
 * Mechanizm throttle do zabezpieczenia animacji
 * @returns {(...args: any[]) => void}
 * @param {Function} callback
 * @param {number} delay
 */
function throttle(callback, delay) {
  let shouldWait = false;

  return (...args) => {
    if (shouldWait) return;

    callback(...args);
    shouldWait = true;

    setTimeout(() => {
      shouldWait = false;
    }, delay);
  };
};

/**
 * Ładuje dane z pliku example-data.json do pamięcie LocalStorage przeglądarki
 */
async function loadTasksDataFromJSONFile() {
  if (localStorage.getItem(UPTApiService.UPT_LOCAL_STORAGE_ITEM_NAME) !== null)
    return;

  try {
    const res = await fetch("./example-data.json");
    if (!res.ok) {
      throw new Error(
        `HTTP error! Status: ${res.status}. Message: ${res.statusText}`
      );
    }
    const data = await res.json();

    return localStorage.setItem(
      UPTApiService.UPT_LOCAL_STORAGE_ITEM_NAME,
      JSON.stringify(data)
    );
  } catch (error) {
    return console.error("Unable to fetch data:", error);
  }
}