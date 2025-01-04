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