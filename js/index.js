"use strict";

const UPT_LOCAL_STORAGE_ITEM_NAME = "user-private-tasks-data";
const UPT_MODULE_ID_SELECTOR = "#user-private-tasks-module";
const UPT_CONFIRM_MODAL_ID = "user-private-tasks-module-confirm-modal";

window.UPT_MODULE_ID_SELECTOR = UPT_MODULE_ID_SELECTOR;

document.addEventListener("DOMContentLoaded", function () {
  const apiService = UPTApiService.getInstance();

  apiService.getAllData().then((data) => {
    // Zakładka Główny Panel
    new UPTModuleMainPanel(`#panel-glowny`, data);

    // Zakładka Zadania
    // new UPTModuleTasksPanel(`#zadania`, data)

    // Zakładka Kategorie
    // new UPTModuleCategoryPanel(`#kategorie`, data)

    // Zakładka Archiwum
    // new UPTModuleArchivePanel(`#archiwum`, data)
  });

  // Główna nawigacja
  new UPTModuleMainNavigation(UPT_MODULE_ID_SELECTOR);

  // Inicjalizacja wszystkich customowych select-ów
  CustomSelect.initAll();

  // Inicjacja wszystkich animowantych kołowych progress barów z klasą "circular-progress-bar"
  CircularProgressBar.initAll("pie", { size: 150 });

  document.querySelector("#testuj").addEventListener("click", () => {
    const confirmButton = document.querySelector(
      `#${UPT_CONFIRM_MODAL_ID} [data-modal-confirm-button]`
    );
    showModal("Czy napewno chcesz usunąć to zadanie?", UPT_CONFIRM_MODAL_ID);

    // dispatchEvent(UPTModuleModal.START_LOADING_EVENT_NAME, {
    //   modalId: UPT_CONFIRM_MODAL_ID,
    // });

    // setTimeout(() => {
    //   dispatchEvent(UPTModuleModal.STOP_LOADING_EVENT_NAME, {
    //     modalId: UPT_CONFIRM_MODAL_ID,
    //   });
    // }, 3000);

    confirmButton.addEventListener("click", (e) => {
      const taskId = "task12345";
      /** @type {HTMLElement} */
      const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);

      taskCard.style.transition = "all 0.4s ease";
      taskCard.style.backgroundColor = "red";

      setTimeout(() => taskCard.remove(), 420);

      dispatchEvent(UPTModuleModal.HIDE_EVENT_NAME, {
        modalId: UPT_CONFIRM_MODAL_ID,
      });
      UPTModuleToast.show(UPTModuleToast.SUCCESS, "Pomyślnie usunięto");
    });
  });

  new UPTApiService();
});

/**
 * @param {string} title
 * @param {string} modalId
 */
function showModal(title, modalId) {
  const confirmModal = document.querySelector(`#${modalId}`);
  const confirmModalTitleAttr = confirmModal?.querySelector(
    `[${UserPrivateTasksModuleModal.ATTR_TITLE}]`
  );

  if (confirmModalTitleAttr) {
    confirmModalTitleAttr.textContent = title;
  }

  dispatchEvent(UPTModuleModal.SHOW_EVENT_NAME, { modalId });
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
