class UPT_TaskType {
  static DAILY = "Dzienne";
  static MAIN = "Główne";
}

class UPT_TaskStatus {
  static COMPLETED = "Zrealizowano";
  static IN_PROGRESS = "W trakcie";
  static ABANDONED = "Porzucone";
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
  constructor(id, name, desc, icon) {
    this.id = id;
    this.name = name;
    this.desc = desc;
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
   * @param {string | null} startDate
   * @param {bool} isCompleted
   */
  constructor(id, name, startDate = null, isCompleted = false) {
    this.id = id;
    this.name = name;
    this.startDate = startDate;
    this.isCompleted = isCompleted;
  }

  /** @param {bool} isCompleted */
  setIsCompleted(isCompleted) {
    this.isCompleted = isCompleted;
  }
  /** @param {string | null} startDate */
  setStartDate(startDate) {
    this.startDate = startDate;
  }
  /** @param {string} name */
  setName(name) {
    this.name = name;
  }

  getIsCompleted() {
    return this.isCompleted;
  }

  getStartDate() {
    return this.startDate;
  }

  getName() {
    return this.name;
  }
}


class UPT_Task {
  static ALL_DAY = "Cały dzień"

  /** @type {string} id - ID zadania. */
  id
  /** @type {string} name - Nazwa zadania. */
  name;
  /** @type {string} type - typ zadania. */
  type;
  /** @type {string} startDate - data startu. */
  startDate;
  /** @type {string} endDate - data końca. */
  endDate;
  /** @type {string} categoryId - Kategoria zadania. */
  categoryId;
  /** @type {string} priority - Priorytet zadania. */
  priority;
  /** @type {string} status - Status zadania. */
  status;
  /** @type {string} description - Opis zadania. */
  description;
  /** @type {UPT_SubTask[]} subTasks - Lista podzadań. */
  subTasks;
  /** @type {boolean} isArchived - Czy zadanie zostało zarchiwizowane. */
  isArchived;
  /** @type {string} createdAt - Data utworzenia.  */
  createdAt
  /** @type {string} createdAt */
  updatedAt;
  /** @type {string | null} archivedAt - Kiedy zostało zarchiwizowane. */
  archivedAt

  /** @param {UPT_TaskInterface} taskProps */
  constructor(taskProps) {
    this.id = String(taskProps.id);
    this.createdAt = (new Date()).toISOString();
    this.validateTaskProps(taskProps);
  }

  /** @param {UPT_TaskInterface} taskProps */
  validateTaskProps(taskProps) {
    this.setName(taskProps.name);
    this.setUpdatedAt(this.createdAt);
    this.setStartDate(taskProps.startDate)
    this.setEndDate(taskProps.endDate)
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
    this.updatedAt = (new Date(value)).toISOString();
  }

  /** @param {string | null} value */
  setArchivedAt(value) {
    if (value) {
      this.archivedAt = value
    }
  }

  /** @param {string | null} value */
  setStartDate(value) {
    this.startDate = value
  }
  /** @param {string | null} value */
  setEndDate(value) {
    this.endDate = value
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
      value !== UPT_TaskStatus.ABANDONED &&
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

  /** 
   * @param {string} searchTerm 
   * @param {object[]} data
   * @returns {object[]} 
   */
  static searchTasksByName(searchTerm, data) { 
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return data.filter(obj =>
      obj.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }

  /** 
   * @param {string} value 
   * @param {Array<object>} data
   */
  static getFilteredDataBy(value, data) {
    let filteredData

    switch (value) {
      case UPTPanel.FILTER_ONLY_IMPORTANT:
        filteredData = data.filter(a => UPT_Utils.getTaskPriorityValue(a) >= 3);
        break;
      case UPTPanel.FILTER_ONLY_UNIMPORTANT:
        filteredData = data.filter(a => UPT_Utils.getTaskPriorityValue(a) < 3);
        break;
      case UPTPanel.FILTER_ONLY_COMPLETED:
        filteredData = data.filter(a => a.status === UPT_TaskStatus.COMPLETED);
        break;
      case UPTPanel.FILTER_ONLY_UNCOMPLETED:
        filteredData = data.filter(a => a.status !== UPT_TaskStatus.COMPLETED)
        break;
      default:
        filteredData = data
    }

    return filteredData
  }

  /** 
   * @param {string} value 
   * @param {Array<object>} data
   */
  static getSortedDataBy(value, data) {
    let sortedData

    switch (value) {
      case UPTPanel.SORT_NAME_ASC:
        sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case UPTPanel.SORT_NAME_DESC:
        sortedData = data.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case UPTPanel.SORT_CREATED_ASC:
        sortedData = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case UPTPanel.SORT_CREATED_DESC:
        sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case UPTPanel.SORT_DEADLINE_ASC:
        sortedData = data.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        break;
      case UPTPanel.SORT_DEADLINE_DESC:
        sortedData = data.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
        break;
      case UPTPanel.SORT_PRIORITY_ASC:
        sortedData = UPT_Utils.sortTasksByPriorityASC(data);
        break;
      default:
        sortedData = UPT_Utils.sortTasksByPriority(data)
    }

    return sortedData
  }

  /** 
   * @param {string | null} timeStr 
   * @param {string} taskType 
   * @returns {Date | null}
   */
  static createTaskDateFromStr(timeStr, taskType) {
    if (!timeStr) return null

    let dateFromTimeStr = new Date();

    if (taskType === UPT_TaskType.DAILY) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      dateFromTimeStr.setHours(hours, minutes, 0, 0);
    } else {
      dateFromTimeStr = new Date(timeStr);
    }
    return dateFromTimeStr
  }

  /** 
   * @param {string | null} dateStr 
   * @param {string} dateInputType
   */
  static getDateFormatForInput(dateStr, dateInputType) {
    if (!dateStr || dateStr === UPT_Task.ALL_DAY) return ''
    let dateFormatForInput

    if (dateInputType === "time") {
      dateFormatForInput = dateStr
    } else {
      const date = new Date(dateStr);
      dateFormatForInput = date.toISOString().slice(0, 16)
    }

    return dateFormatForInput
  }

  static getHoursForDailyTask(task) {
    if (task.startDate === UPT_Task.ALL_DAY) {
      return UPT_Task.ALL_DAY
    }
    if (!task.endDate || task.endDate === task.startDate) {
      return getHoursAndMinutes(task.startDate)
    }
    return getHoursAndMinutes(task.startDate) + " - " + getHoursAndMinutes(task.endDate)
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

  /**  @param {UPT_Task[]} tasks */
  static sortTasksByPriority(tasks) {
    return tasks.sort((a, b) => UPT_Utils.getTaskPriorityValue(b) - UPT_Utils.getTaskPriorityValue(a))
  }

  /**  @param {UPT_Task[]} tasks */
  static sortTasksByPriorityASC(tasks) {
    return UPT_Utils.sortTasksByPriority(tasks).reverse()
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
    statusSubClasses.set(UPT_TaskStatus.ABANDONED, "task-status--deleted")
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

/** 
 * @param {string} attributeName 
 * @param {HTMLElement | null} context
 */
function getElementByAttr(attributeName, context = null) {
  if (!context || !(context instanceof HTMLElement)) {
    context = document
  }
  const element = context.querySelector(`[${attributeName}]`)

  if (!element) {
    console.error(`element[${attributeName}] is null`);
    return null;
  }
  return element
}

/** 
 * @param {HTMLElement | string} card 
 * @param {string} color
 */
function removeDataCard(card, color = "red") {
  manipulateDOMElement(card, (card) => {
    card.style.transition = "all 0.3s ease";
    card.style.backgroundColor = color;

    setTimeout(() => card.remove(), 400);
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
  dispatchCustomEvent(UPTModal.START_LOADING_EVENT_NAME, {
    modalId: modalId,
  });
}

/**  @param {string} modalId */
function hideModalLoading(modalId) {
  dispatchCustomEvent(UPTModal.STOP_LOADING_EVENT_NAME, {
    modalId: modalId
  });
}

/**  @param {string} modalId */
function hideModal(modalId) {
  dispatchCustomEvent(UPTModal.HIDE_EVENT_NAME, {
    modalId: modalId,
  });
}

/**
 * @param {string} modalId
 * @param {string | null} title
 */
function showModal(modalId, title = null) {
  const modal = document.querySelector(`#${modalId}`);
  const modalTitleAttr = modal?.querySelector(`[${CustomModal.ATTR_TITLE}]`);

  if (modalTitleAttr && title) {
    modalTitleAttr.textContent = title;
  }

  dispatchCustomEvent(UPTModal.SHOW_EVENT_NAME, {
    modalId
  });
}

/**
 * @param {string} eventName
 * @param {object} eventData
 */
function dispatchCustomEvent(eventName, eventData = {}) {
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

/** @param {string | null} dateString */
function getHoursAndMinutes(dateStr) {
  if (!dateStr || dateStr === '' || dateStr === UPT_Task.ALL_DAY) return ''

  const date = new Date(dateStr)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

/** 
 * @param {string} dateString 
 * @param {object} options 
 */
function getFriendlyDateFormat(dateString, options = null) {
  const date = new Date(dateString);
  const formattedDate = new Intl.DateTimeFormat("pl-PL", options ? options : {
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
 * @param {HTMLElement | NodeListOf<HTMLElement>} elementsToAnimate
 * @param {number} durationInMiliseconds
 */
function fadeAnimation(callback, elementsToAnimate, durationInMiliseconds) {
  const elements = elementsToAnimate instanceof HTMLElement ? [elementsToAnimate] : [...elementsToAnimate];

  elements.forEach(el => {
    el.style.transition = `all ${durationInMiliseconds / 1000.0}s ease`
    el.style.opacity = "0"
  })

  setTimeout(() => {
    callback()
    elements.forEach(el => {
      el.style.opacity = "1"
    })
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