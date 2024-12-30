const UPT_MODULE_ID_SELECTOR = "#user-private-tasks-module"; 
const UPT_CONFIRM_MODAL_ID = "user-private-tasks-module-confirm-modal";

window.UPT_MODULE_ID_SELECTOR = UPT_MODULE_ID_SELECTOR; 

document.addEventListener("DOMContentLoaded", function () {
  // Główna nawigacja
  new UPTModuleMainNavigation(UPT_MODULE_ID_SELECTOR);

  // Wykres kołowy na głównym panelu
  new CustomPieChart(UPT_MODULE_ID_SELECTOR + " .custom-pie-chart");

  // Statystyki związane z datą i godziną na głównym panelu
  new UPTDateTimeStatisics(
    UPT_MODULE_ID_SELECTOR + " [data-date-time-statisics]"
  );

  // Inicjalizacja wszystkich customowych select-ów
  CustomSelect.initAll();

  // Inicjacja wszystkich animowantych kołowych progress barów z klasą "circular-progress-bar"
  CircularProgressBar.initAll("pie", { size: 150 });




  // new UPTModuleMainPanel(`#panel-glowny`)
  // new UPTModuleTasksPanel(`#zadania`)
  // new UPTModuleCategoryPanel(`#kategorie`)
  // new UPTModuleArchivePanel(`#archiwum`)




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

  const task = new UPT_Task({
    name: "Zadanie główne",
    description: "Lorem ipsum dolor sit amet",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    category: new UPT_TaskCategory("Dzienne", "📅"),
    priority: UPT_TaskPriority.GET_MEDIUM(),
    type: UPT_TaskType.GET_MAIN(),
    subTasks: [new UPT_SubTask("nowe pod zadanie")],
  });

  console.log(task);
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
