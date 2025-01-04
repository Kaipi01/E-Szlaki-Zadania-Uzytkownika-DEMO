"use strict";

// ------------------------ MODELE ------------------------

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
  static LOW = "Niski piorytet";
  static MEDIUM = "Średni piorytet";
  static HIGH = "Wysoki piorytet";
  static VERY_HIGH = "Bardzo Wysoki piorytet";
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