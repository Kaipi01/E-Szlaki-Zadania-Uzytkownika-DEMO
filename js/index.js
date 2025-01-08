"use strict";

const UPT_LOCAL_STORAGE_ITEM_NAME = "user-private-tasks-data",
  UPT_MODULE_ID_SELECTOR = "#user-private-tasks-module",
  UPT_CONFIRM_MODAL_ID = "user-private-tasks-module-confirm-modal",
  UPT_TASK_FORM_ID = "user-private-tasks-module-task-form",
  UPT_CATEGORY_FORM_ID = "user-private-tasks-module-category-form",
  UPT_TASK_FORM_MODAL_ID = "user-private-tasks-module-task-form-modal",
  UPT_DETAILS_TASK_MODAL_ID = "user-private-tasks-module-task-details-modal",
  UPT_CATEGORY_FORM_MODAL_ID = "user-private-tasks-module-category-form-modal",
  UPT_TOASTS_CONTAINER_ID = "user-private-tasks-module-toasts-container";

// window.UPT_MODULE_ID_SELECTOR = UPT_MODULE_ID_SELECTOR;

document.addEventListener("DOMContentLoaded", async function () {
  const mainContent = document.querySelector(`${UPT_MODULE_ID_SELECTOR} [data-main-content]`)

  showLoading(mainContent)

  // Główna nawigacja
  new UPTModuleMainNavigation(UPT_MODULE_ID_SELECTOR);

  // Załaduj przykładowe dane
  await loadTasksDataFromJSONFile();

  const apiService = UPTApiService.getInstance();

  apiService.getAllData().then(data => {

    // Zakładka Główny Panel
    new UPTModuleMainPanel('#panel-glowny', data);

    // Zakładka Zadania
    new UPTModuleTasksPanel('#zadania', data)

    // Zakładka Kategorie
    new UPTModuleCategoryPanel('#kategorie', data)

    // Zakładka Archiwum
    new UPTModuleArchivePanel('#archiwum', data)

    hideLoading(mainContent)
  }) 
});