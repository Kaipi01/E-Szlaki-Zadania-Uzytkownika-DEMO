const UPT_MODULE_PREFIX = "user-private-tasks-module",
UPT_MODULE_ID_SELECTOR = `#${UPT_MODULE_PREFIX}`,
UPT_ADD_TASK_MODAL_ID_SELECTOR = `#${UPT_MODULE_PREFIX}-add-task-modal`,
UPT_TASK_DETAILS_MODAL_ID_SELECTOR = `#${UPT_MODULE_PREFIX}-task-details-modal`;

document.addEventListener("DOMContentLoaded", function () {

  // Główna nawigacja
  new UPTModuleMainNavigation(UPT_MODULE_ID_SELECTOR);

  // Wykres kołowy na głównym panelu
  new CustomPieChart(UPT_MODULE_ID_SELECTOR + " .custom-pie-chart");

  // Statystyki związane z datą i godziną na głównym panelu
  new UPTDateTimeStatisics(UPT_MODULE_ID_SELECTOR + " [data-date-time-statisics]");

  //(new UPTModuleToast(UPT_MODULE_ID_SELECTOR)).open(UPTModuleToast.TYPE_SUCCESS, 'Lorem ipsum dolor sit amet.');

  // Inicjalizacja wszystkich customowych select-ów
  CustomSelect.initAll();

  // Modal z formularzem "Dodaj Zadanie"
  new UPTModuleModal(UPT_ADD_TASK_MODAL_ID_SELECTOR);

  // Modal "Szczegóły Zadania"
  // new UPTModuleModal(UPT_TASK_DETAILS_MODAL_ID_SELECTOR);

  // TODO: ?????
  // Inicjacja wszystkich animowantych kołowych progress barów z klasą "circular-progress-bar"
  CircularProgressBar.initAll();
});
