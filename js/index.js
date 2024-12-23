const UPT_MODULE_ID_SELECTOR = "#user-private-tasks-module-e-szlaki";
const UPT_CONTACT_MODAL_ID_SELECTOR = "#user-private-tasks-module-e-szlaki-modal";

document.addEventListener("DOMContentLoaded", function () {

  //(new UPTModuleToast(UPT_MODULE_ID_SELECTOR)).open(UPTModuleToast.TYPE_SUCCESS, 'Lorem ipsum dolor sit amet.');
  CustomSelect.initAll();

  new UPTModuleModal(UPT_CONTACT_MODAL_ID_SELECTOR);

  new UPTModuleMainNavigation(UPT_MODULE_ID_SELECTOR);

  new CustomPieChart(UPT_MODULE_ID_SELECTOR + " .custom-pie-chart");

  new UPTDateTimeStatisics(UPT_MODULE_ID_SELECTOR + " [data-date-time-statisics]");

  // Inicjacja wszystkich animowantych kołowych progress barów z klasą "circular-progress-bar"
  CircularProgressBar.initAll();
});
