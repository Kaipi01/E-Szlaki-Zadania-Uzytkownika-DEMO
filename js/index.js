const UPT_MODULE_ID_SELECTOR = "#user-private-tasks-module";
const UPT_CONFIRM_MODAL_ID = "user-private-tasks-module-confirm-modal";

document.addEventListener("DOMContentLoaded", function () {
  // Główna nawigacja
  new UPTModuleMainNavigation(UPT_MODULE_ID_SELECTOR);

  // Wykres kołowy na głównym panelu
  new CustomPieChart(UPT_MODULE_ID_SELECTOR + " .custom-pie-chart");

  // Statystyki związane z datą i godziną na głównym panelu
  new UPTDateTimeStatisics(
    UPT_MODULE_ID_SELECTOR + " [data-date-time-statisics]"
  );

  //(new UPTModuleToast(UPT_MODULE_ID_SELECTOR)).open(UPTModuleToast.TYPE_SUCCESS, 'Lorem ipsum dolor sit amet.');

  // Inicjalizacja wszystkich customowych select-ów
  CustomSelect.initAll();

  // Inicjacja wszystkich animowantych kołowych progress barów z klasą "circular-progress-bar"
  CircularProgressBar.initAll("pie", { size: 150 });

  document.querySelector("#testuj").addEventListener("click", () => {
    showModal("Czy napewno chcesz usunąć to zadanie?", UPT_CONFIRM_MODAL_ID);

    dispatchEvent(UPTModuleModal.START_LOADING_EVENT_NAME, {
      modalId: UPT_CONFIRM_MODAL_ID,
    });

    setTimeout(() => {
      dispatchEvent(UPTModuleModal.STOP_LOADING_EVENT_NAME, {
        modalId: UPT_CONFIRM_MODAL_ID,
      });
    }, 3000);
  });
});

/**
 * @param {string} title
 * @param {string} modalId
 */
function showModal(title, modalId) {
  const confirmModal = document.querySelector(`#${modalId}`);
  confirmModal.querySelector(
    `[${UserPrivateTasksModuleModal.ATTR_TITLE}]`
  ).textContent = title;

  dispatchEvent(UPTModuleModal.SHOW_EVENT_NAME, { modalId });
}

/**
 * @param {string} eventName
 * @param {Object} eventData
 */
function dispatchEvent(eventName, eventData = {}) {
  document.dispatchEvent(
    new CustomEvent(eventName, {
      detail: eventData,
    })
  );
}
