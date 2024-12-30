// ------------------------ KLASY POMOCNICZE ------------------------

class UPT_TaskStatus {
  static COMPLETED = 1;
  static IN_PROGRESS = 2;
  static DELETED = 3;
  static COMPLETED_DISPLAY_NAME = "Zrealizowano";
  static IN_PROGRESS_DISPLAY_NAME = "W trakcie";
  static DELETED_DISPLAY_NAME = "Usunięto";

  static GET_COMPLETED() {
    return new UPT_TaskStatus(UPT_TaskStatus.COMPLETED);
  }
  static GET_IN_PROGRESS() {
    return new UPT_TaskStatus(UPT_TaskStatus.IN_PROGRESS);
  }
  static GET_DELETED() {
    return new UPT_TaskStatus(UPT_TaskStatus.DELETED);
  }

  /** @param {number} statusNumber */
  constructor(statusNumber) {
    this.statusNumber = statusNumber;
    this.statusName = "";
    this.setName(statusNumber);
  }

  /** @param {number} statusNumber */
  setNumber(statusNumber) {
    this.statusNumber = statusNumber;
    this.setName(statusNumber);
  }

  /** @param {number} statusNumber */
  setName(statusNumber) {
    switch (statusNumber) {
      case UPT_TaskStatus.COMPLETED:
        this.statusName = UPT_TaskStatus.COMPLETED_DISPLAY_NAME;
        break;
      case UPT_TaskStatus.IN_PROGRESS:
        this.statusName = UPT_TaskStatus.IN_PROGRESS_DISPLAY_NAME;
        break;
      case UPT_TaskStatus.DELETED:
        this.statusName = UPT_TaskStatus.DELETED_DISPLAY_NAME;
        break;
    }
  }

  getNumber() {
    return this.statusNumber;
  }

  getDisplayName() {
    return this.statusName;
  }

  toString() {
    return this.getDisplayName();
  }
}

class UPT_TaskPriority {
  static LOW = 1;
  static MEDIUM = 2;
  static HIGH = 3;
  static VERY_HIGH = 4;
  static LOW_DISPLAY_NAME = "Niski piorytet";
  static MEDIUM_DISPLAY_NAME = "Średni piorytet";
  static HIGH_DISPLAY_NAME = "Wysoki piorytet";
  static VERY_HIGH_DISPLAY_NAME = "Bardzo Wysoki piorytet";

  static GET_LOW() {
    return new UPT_TaskPriority(UPT_TaskPriority.LOW);
  }
  static GET_MEDIUM() {
    return new UPT_TaskPriority(UPT_TaskPriority.MEDIUM);
  }
  static GET_HIGH() {
    return new UPT_TaskPriority(UPT_TaskPriority.HIGH);
  }
  static GET_VERY_HIGH() {
    return new UPT_TaskPriority(UPT_TaskPriority.VERY_HIGH);
  }

  /** @param {number} degree */
  constructor(degree) {
    this.degree = degree;
    this.name = "";
    this.setNameOfDegree(degree);
  }

  /** @param {number} degree */
  setDegree(degree) {
    this.degree = degree;
    this.setNameOfDegree(degree);
  }

  /** @param {number} degree */
  setNameOfDegree(degree) {
    switch (degree) {
      case UPT_TaskPriority.LOW:
        this.name = UPT_TaskPriority.LOW_DISPLAY_NAME;
        break;
      case UPT_TaskPriority.MEDIUM:
        this.name = UPT_TaskPriority.MEDIUM_DISPLAY_NAME;
        break;
      case UPT_TaskPriority.HIGH:
        this.name = UPT_TaskPriority.HIGH_DISPLAY_NAME;
        break;
      case UPT_TaskPriority.VERY_HIGH:
        this.name = UPT_TaskPriority.VERY_HIGH_DISPLAY_NAME;
        break;
    }
  }

  getDegree() {
    return this.degree;
  }

  getDisplayName() {
    return this.name;
  }

  toString() {
    return this.getDisplayName();
  }
}

class UPT_TaskCategory {
  /**
   * @param {string} name
   * @param {string} icon
   */
  constructor(name, icon) {
    this.name = name;
    this.icon = icon;
    this.createdAt = new Date();
  }

  /** @param {string} icon */
  setIcon(icon) {
    this.icon = icon;
  }
  /** @param {string} name */
  setName(name) {
    this.name = name;
  }
  getIcon() {
    return this.icon;
  }
  getCreatedAt() {
    return this.createdAt;
  }
  getName() {
    return this.name;
  }
  toString() {
    return this.getName();
  }
}

class UPT_SubTask {
  /**
   * @param {string} name
   * @param {string | null} deadline
   * @param {bool} isCompleted
   */
  constructor(name, deadline = null, isCompleted = false) {
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

class UPT_TaskType {
  static DAILY = 1;
  static DAILY_DISPLAY_NAME = "Dzienne";
  static MAIN = 2;
  static MAIN_DISPLAY_NAME = "Główne";

  static GET_DAILY() {
    return new UPT_TaskType(UPT_TaskType.DAILY);
  }
  static GET_MAIN() {
    return new UPT_TaskType(UPT_TaskType.MAIN);
  }

  /** @param {number} typeNumber */
  constructor(typeNumber) {
    this.typeNumber = typeNumber;
    this.typeName = "";
    this.setName(typeNumber);
  }

  /** @param {number} typeNumber */
  setNumber(typeNumber) {
    this.typeNumber = typeNumber;
    this.setName(typeNumber);
  }

  /** @param {number} typeNumber */
  setName(typeNumber) {
    switch (typeNumber) {
      case UPT_TaskType.MAIN:
        this.typeName = UPT_TaskType.MAIN_DISPLAY_NAME;
        break;
      case UPT_TaskType.DAILY:
        this.typeName = UPT_TaskType.DAILY_DISPLAY_NAME;
        break;
    }
  }

  getNumber() {
    return this.typeNumber;
  }

  getDisplayName() {
    return this.typeName;
  }

  toString() {
    return this.getDisplayName();
  }
}

// ------------------------ KLASA UPT_TASK ------------------------

/**
 * @typedef {Object} UPT_TaskInterface
 * @property {string} name - Nazwa zadania.
 * @property {Date} createdAt - Data utworzenia.
 * @property {Date} deadline - Termin wykonania.
 * @property {UPT_TaskCategory} category - Kategoria zadania.
 * @property {UPT_SubTask[]} subTasks - Lista podzadań.
 * @property {UPT_TaskStatus} status - Status zadania.
 * @property {UPT_TaskPriority} priority - Priorytet zadania.
 * @property {string} description - Opis zadania.
 * @property {number} type - typ zadania.
 * @property {boolean} isArchived - Czy zadanie zostało zarchiwizowane.
 */
class UPT_Task {
  /**
   * @param {UPT_TaskInterface} taskProps
   */
  constructor(taskProps) {
    this.name;
    this.type;
    this.deadline;
    this.category;
    this.priority;
    this.status;
    this.description;
    this.subTasks;
    this.isArchived;
    this.createdAt = new Date();
    this.updatedAt;
    this.validateTaskProps(taskProps);
  }

  /**
   * @param {UPT_TaskInterface} taskProps
   */
  validateTaskProps(taskProps) {
    this.setName(taskProps.name);
    this.setUpdatedAt(new Date());
    this.setDeadline(taskProps.deadline);
    this.setCategory(taskProps.category);
    this.setSubTasks(taskProps.subTasks || []);
    this.setStatus(taskProps.status || UPT_TaskStatus.GET_IN_PROGRESS());
    this.setPriority(taskProps.priority);
    this.setType(taskProps.type);
    this.setDescription(taskProps.description || "");
    this.setIsArchived(taskProps.isArchived || false);
  }

  /** @param {string} value */
  setName(value) {
    this.name = String(value);
  }

  /** @param {UPT_TaskType} value */
  setType(value) {
    if (!(value instanceof UPT_TaskType)) {
      console.error("type must be a UPT_TaskType object.");
    }
    this.type = value;
  }

  /** @param {Date} value */
  setUpdatedAt(value) {
    if (!(value instanceof Date)) {
      console.error("updatedAt must be a Date object.");
    }
    this.updatedAt = value;
  }

  /** @param {Date} value */
  setDeadline(value) {
    if (!(value instanceof Date)) {
      console.error("deadline must be a Date object.");
    }
    this.deadline = value;
  }

  /** @param {UPT_TaskCategory} value */
  setCategory(value) {
    if (!(value instanceof UPT_TaskCategory)) {
      console.error("category must be a UPT_TaskCategory object.");
    }
    this.category = value;
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

  /** @param {UPT_TaskStatus} value */
  setStatus(value) {
    if (!(value instanceof UPT_TaskStatus)) {
      console.error("status must be a UPT_TaskStatus object.");
    }
    this.status = value;
  }

  /** @param {UPT_TaskPriority} value */
  setPriority(value) {
    if (!(value instanceof UPT_TaskPriority)) {
      console.error("priority must be a UPT_TaskPriority object.");
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
