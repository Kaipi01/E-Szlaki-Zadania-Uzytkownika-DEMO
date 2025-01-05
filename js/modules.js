"use strict";

class UPTDateTimeStatisics {
  /**
   * @param {string} containerSelector
   */
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);

    if (!this.container) {
      console.error(`Element with selector ${containerSelector} does not exist!`);
      return;
    }

    this.currentTimeEl = this.container.querySelector("[data-statistic-current-time]");
    this.currentDateEl = this.container.querySelector("[data-statistic-current-date]");

    this.init();
  }

  init() {
    this.setCurrentTime();
    this.setCurrentDate();

    setInterval(() => {
      this.setCurrentTime();
      this.setCurrentDate();
    }, 1000);
  }

  setCurrentDate() {
    const now = new Date(); // Pobierz aktualną datę
    const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
    const months = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

    const dayName = daysOfWeek[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const formattedDate = `${dayName}, ${day} ${month} ${year}`;

    if (this.currentDateEl) {
      this.currentDateEl.textContent = formattedDate;
    } else {
      console.error(`this.currentDateEl is null`);
    }
  }

  setCurrentTime() {
    const now = new Date();
    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = now.toLocaleTimeString(); // Ustawienie czasu w DOM
    } else {
      console.error(`this.currentTimeEl is null`);
    }
  }
}

class UPTModuleMainNavigation {
  static UPT_MODULE_CHANGE_PAGE_EVENT = "upt-modul-change-page";
  static ANIMATION_DURATION_TIME = 350;

  /**
   * @param {string} mainContainerSelector
   */
  constructor(mainContainerSelector) {
    this.mainContainer = document.querySelector(mainContainerSelector);

    if (!this.mainContainer) {
      console.error(`this.mainContainer is null`);
      return;
    }
    this.navigation = this.mainContainer.querySelector(
      "[data-main-navigation]"
    );
    this.navigationList = this.mainContainer.querySelector(
      "[data-main-navigation-list]"
    );

    if (!this.navigation) {
      console.error(`this.navigation is null`);
      return;
    }
    if (!this.navigationList) {
      console.error(`this.navigationList is null`);
      return;
    }

    this.pages = this.mainContainer.querySelectorAll("[data-content-page]");
    this.linkPage = "";
    this.prevLink;
    /** @type {number} */
    this.breakpointValue = this.remToPx(76);
    this.windowWidthIsLessThanBreakpoint =
      window.innerWidth < this.breakpointValue;
    this.changeScreenEvent = new CustomEvent(
      UPTModuleMainNavigation.UPT_MODULE_CHANGE_PAGE_EVENT
    );
    /** @type {NodeListOf<HTMLAnchorElement>} */
    this.pageLinks = this.navigation.querySelectorAll(
      "[data-main-navigation-link]"
    );
    /** @type {HTMLAnchorElement[]} */
    this.pageLinksArray = Array.from(this.pageLinks);
    this.init();
  }

  /**
   * @returns {number}
   * @param {number} rem
   */
  remToPx(rem) {
    const htmlElement = document.documentElement;
    const fontSize = window.getComputedStyle(htmlElement).fontSize;
    const baseFontSize = parseFloat(fontSize);
    return baseFontSize * rem;
  }

  showInitPage() {
    const linkWithTheSameHash = this.pageLinksArray.find(
      (a) => a.hash === location.hash
    );

    if (linkWithTheSameHash) {
      this.showPage(linkWithTheSameHash);
    } else if (location.hash === "") {
      this.showPage(this.pageLinksArray.at(0));
    }
  }

  init() {
    this.bindPageLinks();
    this.showInitPage();

    window.addEventListener("hashchange", () => {
      this.showInitPage();
    });

    window.addEventListener("resize", () => {
      this.windowWidthIsLessThanBreakpoint =
        window.innerWidth < this.breakpointValue;
    });
  }

  bindPageLinks() {

    const showPageThrottle = throttle((link) => {
      this.showPage(link);
    }, UPTModuleMainNavigation.ANIMATION_DURATION_TIME);

    this.pageLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        //  if (!this.windowWidthIsLessThanBreakpoint) {}

        showPageThrottle(link);
      });
    });
  }

  /**
   * @param {HTMLAnchorElement} link
   */
  showPage(link) {
    if (this.prevLink != link) {
      const linkHref = link?.href.split("#")[1];
      this.prevLink = link;
      window.dispatchEvent(this.changeScreenEvent);

      history.replaceState(null, null, "#" + linkHref);
    }

    const activeMenuLink = this.navigation.querySelector(
      "[data-main-navigation-link].active"
    );
    const prevActivePage = this.mainContainer.querySelector(
      "[data-content-page].active"
    );

    activeMenuLink?.classList.remove("active");

    link.classList.add("active");
    this.linkPage = link.getAttribute("href");

    this.pages.forEach((page, index) => {
      const linkPage = page.dataset.contentPage;

      if (linkPage === this.linkPage) {
        this.animateNavigation(index);
        this.animateChangePages(prevActivePage, page);
      }
    });
  }

  /**
   * @param {number} pageNumber
   */
  animateNavigation(pageNumber) {
    let stylesForNavigationList = this.mainContainer.querySelector("style");

    if (!stylesForNavigationList) {
      stylesForNavigationList = document.createElement("style");
      this.mainContainer.prepend(stylesForNavigationList);
    }

    stylesForNavigationList.textContent = `#${
      this.mainContainer.id
    } [data-main-navigation-list]::after {left: ${
      pageNumber * (100.0 / this.pageLinksArray.length)
    }%;}`;
  }

  /**
   * @param {HTMLElement | null} prevPage
   * @param {HTMLElement} nextPage
   */
  animateChangePages(prevPage, nextPage) {
    if (prevPage === nextPage) return;

    if (prevPage) prevPage.classList.remove("page-static");
    this.pages.forEach((page) => (page.style.position = "absolute"));

    nextPage.classList.add("active");
    nextPage.style.opacity = "0";
    if (prevPage) prevPage.style.opacity = "0";

    setTimeout(() => {
      nextPage.style.position = "relative";
      nextPage.style.opacity = "1";

      if (prevPage) {
        prevPage.classList.remove("active");
      }
    }, UPTModuleMainNavigation.ANIMATION_DURATION_TIME);
  }
}

class UPTModuleToast {
  static SUCCESS = "success";
  static WARNING = "warning";
  static ERROR = "error";
  static INFO = "info";
  static SUCCESS_ICON = "fa-circle-check";
  static ERROR_ICON = "fa-circle-exclamation";
  static WARNING_ICON = "fa-triangle-exclamation";
  static INFO_ICON = "fa-circle-info";

  /**
   * @param {string} type
   * @param {string} message
   */
  static show(type, message = "") {
    new UPTModuleToast(window.UPT_MODULE_ID_SELECTOR).open(type, message);
  }

  /**
   * @param {string} containerSelector
   */
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);

    if (!this.container) {
      console.warn("this.container is null");
      return;
    }

    this.toastId = generateId("upt-toast");
    this.toast;
    this.countdown;
    this.init();
  }

  init() {
    this.toast = this.generateToast();

    this.toastTimer = this.toast.querySelector(".timer");
    this.closeToastBtn = this.toast.querySelector(".toast-close");
    this.toastIcon = this.toast.querySelector(".icon");
    this.toastTitle = this.toast.querySelector(".toast-message-title");
    this.toastMessage = this.toast.querySelector(".toast-message-text");

    if (this.closeToastBtn)
      this.closeToastBtn.addEventListener("click", () => this.close());
  }

  /**
   * @returns {HTMLDivElement}
   */
  generateToast() {
    const toast = document.createElement("div");
    toast.className = "upt-toast";
    toast.id = String(this.toastId);
    toast.style.display = "none";
    toast.innerHTML = ` 
                  <i class="icon fa-solid"></i>
                  <div class="toast-message">
                      <p class="toast-message-title"></p>
                      <p class="toast-message-text"></p>
                  </div>
                  <button class="toast-close"><span class="sr-only">Zamknij</span></button>
                  <div class="timer"></div>
            `;
    this.container.append(toast);

    return toast;
  }

  close() {
    this.toast.style.animation =
      "close 0.3s cubic-bezier(.87,-1,.57,.97) forwards";
    this.toastTimer.classList.remove("timer-animation");
    clearTimeout(this.countdown);

    setTimeout(() => {
      this.toast.style.display = "none";
      this.toast.remove();
    }, 300);
  }

  /**
   * @param {string} type
   * @param {string} message
   */
  open(type, message = "") {
    if (this.toast.style.display != "none") return;

    let toastTitle;
    let toastIcon;
    this.toast.classList.remove(
      UPTModuleToast.SUCCESS,
      UPTModuleToast.WARNING,
      UPTModuleToast.ERROR,
      UPTModuleToast.INFO
    );
    this.toastIcon.classList.remove(
      UPTModuleToast.SUCCESS_ICON,
      UPTModuleToast.WARNING_ICON,
      UPTModuleToast.ERROR_ICON,
      UPTModuleToast.INFO_ICON
    );
    this.toast.style.display = "flex";

    switch (type) {
      case UPTModuleToast.SUCCESS:
        toastTitle = "Sukces!";
        toastIcon = UPTModuleToast.SUCCESS_ICON;
        break;
      case UPTModuleToast.ERROR:
        toastTitle = "Błąd!";
        toastIcon = UPTModuleToast.ERROR_ICON;
        break;
      case UPTModuleToast.WARNING:
        toastTitle = "Ostrzeżenie";
        toastIcon = UPTModuleToast.WARNING_ICON;
        break;
      default:
        toastTitle = "Informacja";
        toastIcon = UPTModuleToast.INFO_ICON;
    }

    this.toastTitle.textContent = toastTitle;
    this.toastMessage.textContent = message;
    this.toastIcon.classList.add(toastIcon);

    setTimeout(() => {
      this.toast.classList.add(type);
      this.toast.style.animation =
        "open 0.3s cubic-bezier(.47,.02,.44,2) forwards";
      this.toastTimer.classList.add("timer-animation");
      clearTimeout(this.countdown);
      this.countdown = setTimeout(() => {
        this.close();
      }, 5000);
    }, 0);
  }
}

class UPTModuleModal {
  static SHOW_EVENT_NAME = "upt-show-modal";
  static HIDE_EVENT_NAME = "upt-hide-modal";
  static OPEN_EVENT_NAME = "upt-modal-is-open";
  static CLOSE_EVENT_NAME = "upt-modal-is-close";
  static START_LOADING_EVENT_NAME = "upt-start-loading-modal";
  static STOP_LOADING_EVENT_NAME = "upt-stop-loading-modal";

  /**
   * @param {string} selector
   */
  constructor(selector) {
    this.selector = selector;
    this.element = document.querySelector(this.selector);
    this.triggers = document.querySelectorAll(
      '[aria-controls="' + this.element.getAttribute("id") + '"]'
    );
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.moveFocusEl = null; // focus will be moved to this element when modal is open
    this.modalFocus = this.element.getAttribute("data-modal-first-focus") ?
      this.element.querySelector(
        this.element.getAttribute("data-modal-first-focus")
      ) :
      null;
    this.selectedTrigger = null;
    this.preventScrollEl = this.getPreventScrollEl();
    this.showClass = "modal--is-visible";
    this.initModal();
    this.focusableElString =
      '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
  }

  /**
   * @returns {bool}
   * @param {Element} element
   */
  isVisible(element) {
    return (
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }
  /**
   * @returns {HTMLElement}
   */
  getPreventScrollEl() {
    var scrollEl = document.body;
    return scrollEl;
  }

  initModal() {
    var self = this;

    /**
     * @param {Event} event
     * @param {Funtion} callback
     */
    const catchModalEvent = (event, callback) => {
      const modalId = event.detail?.modalId;
      if (this.element.id && modalId && modalId === this.element.id) {
        callback();
      }
    };

    // show modal when show modal event occurs
    document.addEventListener(UPTModuleModal.SHOW_EVENT_NAME, (event) =>
      catchModalEvent(event, () => {
        this.showModal();
        this.initModalEvents();
      })
    );
    // hide modal when hide modal event occurs
    document.addEventListener(UPTModuleModal.HIDE_EVENT_NAME, (event) =>
      catchModalEvent(event, () => this.closeModal())
    );

    // show loading state modal
    document.addEventListener(
      UPTModuleModal.START_LOADING_EVENT_NAME,
      (event) =>
      catchModalEvent(event, () =>
        this.element.classList.add("modal--loading")
      )
    );

    // hide loading state modal
    document.addEventListener(UPTModuleModal.STOP_LOADING_EVENT_NAME, (event) =>
      catchModalEvent(event, () =>
        this.element.classList.remove("modal--loading")
      )
    );

    // open modal when clicking on trigger buttons
    if (this.triggers) {
      for (var i = 0; i < this.triggers.length; i++) {
        this.triggers[i].addEventListener("click", function (event) {
          event.preventDefault();
          if (self.element.classList.contains(self.showClass)) {
            self.closeModal();
            return;
          }
          self.selectedTrigger = event.currentTarget;
          self.showModal();
          self.initModalEvents();
        });
      }
    }

    // listen to the openModal event -> open modal without a trigger button
    this.element.addEventListener("upt-open-modal", function (event) {
      if (event.detail) self.selectedTrigger = event.detail;
      self.showModal();
      self.initModalEvents();
    });

    // listen to the closeModal event -> close modal without a trigger button
    this.element.addEventListener("upt-close-modal", function (event) {
      if (event.detail) self.selectedTrigger = event.detail;
      self.closeModal();
    });

    // if modal is open by default -> initialise modal events
    if (this.element.classList.contains(this.showClass)) this.initModalEvents();

    window.addEventListener("keydown", (event) => {
      if (event.key && event.key.toLowerCase() == "escape") {
        this.closeModal();
      }
    });
  }

  showModal() {
    var self = this;
    this.element.classList.add(this.showClass);
    this.getFocusableElements();

    if (this.moveFocusEl) {
      this.moveFocusEl.focus();
      // wait for the end of transitions before moving focus
      this.element.addEventListener("transitionend", function cb(event) {
        if (self.moveFocusEl) self.moveFocusEl.focus();
        self.element.removeEventListener("transitionend", cb);
      });
    }
    this.emitModalEvents(UPTModuleModal.OPEN_EVENT_NAME);
    // change the overflow of the preventScrollEl
    if (this.preventScrollEl) this.preventScrollEl.style.overflow = "hidden";
  }

  closeModal() {
    if (!this.element.classList.contains(this.showClass)) return;
    this.element.classList.remove(this.showClass);
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.moveFocusEl = null;
    if (this.selectedTrigger) this.selectedTrigger.focus();
    //remove listeners
    this.cancelModalEvents();
    this.emitModalEvents(UPTModuleModal.CLOSE_EVENT_NAME);
    // change the overflow of the preventScrollEl
    if (this.preventScrollEl) this.preventScrollEl.style.overflow = "";
  }

  initModalEvents() {
    //add event listeners
    this.element.addEventListener("keydown", this);
    this.element.addEventListener("click", this);
  }

  cancelModalEvents() {
    //remove event listeners
    this.element.removeEventListener("keydown", this);
    this.element.removeEventListener("click", this);
  }

  /**
   * @param {Event} event
   */
  handleEvent(event) {
    switch (event.type) {
      case "click": {
        this.initClick(event);
        break;
      }
      case "keydown": {
        this.initKeyDown(event);
      }
    }
  }
  /**
   * @param {Event} event
   */
  initKeyDown(event) {
    if (
      (event.keyCode && event.keyCode == 9) ||
      (event.key && event.key == "Tab")
    ) {
      //trap focus inside modal
      this.trapFocus(event);
    } else if (
      ((event.keyCode && event.keyCode == 13) ||
        (event.key && event.key == "Enter")) &&
      event.target.closest(".js-modal__close")
    ) {
      event.preventDefault();
      this.closeModal(); // close modal when pressing Enter on close button
    }
  }
  /**
   * @param {Event} event
   */
  initClick(event) {
    //close modal when clicking on close button or modal bg layer
    if (
      !event.target.closest(".js-modal__close") &&
      !event.target.classList.contains("js-modal")
    )
      return;
    event.preventDefault();
    this.closeModal();
  }
  /**
   * @param {Event} event
   */
  trapFocus(event) {
    if (this.firstFocusable == document.activeElement && event.shiftKey) {
      //on Shift+Tab -> focus last focusable element when focus moves out of modal
      event.preventDefault();
      this.lastFocusable.focus();
    }
    if (this.lastFocusable == document.activeElement && !event.shiftKey) {
      //on Tab -> focus first focusable element when focus moves out of modal
      event.preventDefault();
      this.firstFocusable.focus();
    }
  }

  getFocusableElements() {
    //get all focusable elements inside the modal
    var allFocusable = this.element.querySelectorAll(this.focusableElString);
    this.getFirstVisible(allFocusable);
    this.getLastVisible(allFocusable);
    this.getFirstFocusable();
  }
  /**
   * @param {NodeListOf<Element>} elements
   */
  getFirstVisible(elements) {
    //get first visible focusable element inside the modal
    for (var i = 0; i < elements.length; i++) {
      if (this.isVisible(elements[i])) {
        this.firstFocusable = elements[i];
        break;
      }
    }
  }
  /**
   * @param {NodeListOf<Element>} elements
   */
  getLastVisible(elements) {
    //get last visible focusable element inside the modal
    for (var i = elements.length - 1; i >= 0; i--) {
      if (this.isVisible(elements[i])) {
        this.lastFocusable = elements[i];
        break;
      }
    }
  }
  getFirstFocusable() {
    if (!this.modalFocus || !Element.prototype.matches) {
      this.moveFocusEl = this.firstFocusable;
      return;
    }
    var containerIsFocusable = this.modalFocus.matches(this.focusableElString);
    if (containerIsFocusable) {
      this.moveFocusEl = this.modalFocus;
    } else {
      this.moveFocusEl = false;
      var elements = this.modalFocus.querySelectorAll(this.focusableElString);
      for (var i = 0; i < elements.length; i++) {
        if (this.isVisible(elements[i])) {
          this.moveFocusEl = elements[i];
          break;
        }
      }
      if (!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
    }
  }
  /**
   * @param {string} eventName
   */
  emitModalEvents(eventName) {
    var event = new CustomEvent(eventName, {
      detail: this.selectedTrigger,
    });
    this.element.dispatchEvent(event);
  }
}

class CircularProgressBar {
  static DEFAULT_OPTIONS = {
    colorSlice: "#00a1ff",
    fontColor: "#000",
    fontSize: "1.6rem",
    fontWeight: 400,
    lineargradient: false,
    number: true,
    round: false,
    fill: "none",
    unit: "%",
    rotation: -90,
    size: 200,
    stroke: 10,
  };

  /**
   * @param {string} pieName
   * @param {object} globalObj
   */
  constructor(pieName, globalObj = {}) {
    this._className = pieName;
    this._globalObj = globalObj;

    const pieElements = document.querySelectorAll(`.${pieName}`);
    const elements = [].slice.call(pieElements);
    // add index to all progressbar
    elements.map((item, idx) => {
      const id = JSON.parse(item.getAttribute("data-pie"));
      item.setAttribute(
        "data-pie-index",
        id.index || globalObj.index || idx + 1
      );
    });

    this._elements = elements;
  }

  /**
   * @param {string} pieName
   * @param {object} globalObj
   */
  static initAll(pieName, globalObj = {}) {
    const pie = document.querySelectorAll(".pie");
    const elements = [].slice.call(pie);
    const circle = new CircularProgressBar(pieName, globalObj);

    if ("IntersectionObserver" in window) {
      const config = {
        root: null,
        rootMargin: "0px",
        threshold: 0.75,
      };

      const ovserver = new IntersectionObserver((entries, observer) => {
        entries.map((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.75) {
            circle.initial(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, config);

      elements.map((item) => {
        ovserver.observe(item);
      });
    } else {
      elements.map((element) => {
        circle.initial(element);
      });
    }
  }

  initial(outside) {
    const triggeredOutside = outside || this._elements;
    Array.isArray(triggeredOutside) ?
      triggeredOutside.map((element) => this._createSVG(element)) :
      this._createSVG(triggeredOutside);
  }

  _progress(svg, target, options) {
    const pieName = this._className;
    if (options.number) {
      this._insertAdElement(svg, this._percent(options, pieName));
    }

    const progressCircle = this._querySelector(
      `.${pieName}-circle-${options.index}`
    );

    const configCircle = {
      fill: "none",
      "stroke-width": options.stroke,
      "stroke-dashoffset": "264",
      ...this._strokeDasharray(),
      ...this._strokeLinecap(options),
    };
    this._setAttribute(progressCircle, configCircle);

    // animation progress
    this.animationTo({
        ...options,
        element: progressCircle,
      },
      true
    );

    // set style and rotation
    progressCircle.setAttribute("style", this._styleTransform(options));

    // set color
    this._setColor(progressCircle, options);

    // set width and height on div
    target.setAttribute(
      "style",
      `width:${options.size}px;height:${options.size}px;`
    );
  }

  animationTo(options, initial = false) {
    const pieName = this._className;
    const previousConfigObj = JSON.parse(
      this._querySelector(`[data-pie-index="${options.index}"]`).getAttribute(
        "data-pie"
      )
    );

    const circleElement = this._querySelector(
      `.${pieName}-circle-${options.index}`
    );

    if (!circleElement) return;

    // merging all configuration objects
    const commonConfiguration = initial ?
      options : {
        ...CircularProgressBar.DEFAULT_OPTIONS,
        ...previousConfigObj,
        ...options,
        ...this._globalObj,
      };

    // update color circle
    if (!initial) {
      this._setColor(circleElement, commonConfiguration);
    }

    // font color update
    if (!initial && commonConfiguration.number) {
      const fontconfig = {
        fill: commonConfiguration.fontColor,
        ...this._fontSettings(commonConfiguration),
      };
      const textElement = this._querySelector(
        `.${pieName}-text-${commonConfiguration.index}`
      );
      this._setAttribute(textElement, fontconfig);
    }

    const centerNumber = this._querySelector(
      `.${pieName}-percent-${options.index}`
    );

    if (commonConfiguration.animationOff) {
      if (commonConfiguration.number)
        centerNumber.textContent = `${commonConfiguration.percent}`;
      circleElement.setAttribute(
        "stroke-dashoffset",
        this._dashOffset(
          commonConfiguration.percent *
          ((100 - (commonConfiguration.cut || 0)) / 100),
          commonConfiguration.inverse
        )
      );
      return;
    }

    // get numer percent from data-angel
    let angle = JSON.parse(circleElement.getAttribute("data-angel"));

    // round if number is decimal
    const percent = Math.round(options.percent);

    // if percent 0 then set at start 0%
    if (percent === 0) {
      if (commonConfiguration.number) centerNumber.textContent = "0";
      circleElement.setAttribute("stroke-dashoffset", "264");
    }

    if (percent > 100 || percent < 0 || angle === percent) return;

    let request;
    let i = initial ? 0 : angle;

    const fps = commonConfiguration.speed || 1000;
    const interval = 1000 / fps;
    const tolerance = 0.1;
    let then = performance.now();

    const performAnimation = (now) => {
      request = requestAnimationFrame(performAnimation);
      const delta = now - then;

      if (delta >= interval - tolerance) {
        then = now - (delta % interval);

        // angle >= commonConfiguration.percent ? i-- : i++;
        i = i < commonConfiguration.percent ? i + 1 : i - 1;
      }

      circleElement.setAttribute(
        "stroke-dashoffset",
        this._dashOffset(
          i,
          commonConfiguration.inverse,
          commonConfiguration.cut
        )
      );
      if (centerNumber && commonConfiguration.number) {
        centerNumber.textContent = `${i}`;
      }

      circleElement.setAttribute("data-angel", i);
      circleElement.parentNode.setAttribute("aria-valuenow", i);

      if (i === percent) {
        cancelAnimationFrame(request);
      }

      // return;
    };

    requestAnimationFrame(performAnimation);
  }

  _createSVG(element) {
    const index = element.getAttribute("data-pie-index");
    const json = JSON.parse(element.getAttribute("data-pie"));

    const options = {
      ...CircularProgressBar.DEFAULT_OPTIONS,
      ...json,
      index,
      ...this._globalObj,
    };

    const svg = this._createNSElement("svg");

    const configSVG = {
      role: "progressbar",
      width: options.size,
      height: options.size,
      viewBox: "0 0 100 100",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
    };

    this._setAttribute(svg, configSVG);

    // colorCircle
    if (options.colorCircle) {
      svg.appendChild(this._circle(options));
    }

    // gradient
    if (options.lineargradient) {
      svg.appendChild(this._gradient(options));
    }

    svg.appendChild(this._circle(options, "top"));

    element.appendChild(svg);

    this._progress(svg, element, options);
  }

  _circle(options, where = "bottom") {
    const circle = this._createNSElement("circle");

    let configCircle = {};
    if (options.cut) {
      const dashoffset = 264 - (100 - options.cut) * 2.64;
      configCircle = {
        "stroke-dashoffset": options.inverse ? -dashoffset : dashoffset,
        style: this._styleTransform(options),
        ...this._strokeDasharray(),
        ...this._strokeLinecap(options),
      };
    }

    const objCircle = {
      fill: options.fill,
      stroke: options.colorCircle,
      "stroke-width": options.strokeBottom || options.stroke,
      ...configCircle,
    };

    if (options.strokeDasharray) {
      Object.assign(objCircle, {
        ...this._strokeDasharray(options.strokeDasharray),
      });
    }

    const typeCircle =
      where === "top" ? {
        class: `${this._className}-circle-${options.index}`,
      } :
      objCircle;

    const objConfig = {
      cx: "50%",
      cy: "50%",
      r: 42,
      "shape-rendering": "geometricPrecision",
      ...typeCircle,
    };

    this._setAttribute(circle, objConfig);

    return circle;
  }

  _styleTransform = ({
    rotation,
    animationSmooth
  }) => {
    const smoothAnimation = animationSmooth ?
      `transition: stroke-dashoffset ${animationSmooth}` :
      "";

    return `transform:rotate(${rotation}deg);transform-origin: 50% 50%;${smoothAnimation}`;
  };

  _strokeDasharray = (type) => {
    return {
      "stroke-dasharray": type || "264",
    };
  };

  _strokeLinecap = ({
    round
  }) => {
    return {
      "stroke-linecap": round ? "round" : "",
    };
  };

  _fontSettings = (options) => {
    return {
      "font-size": options.fontSize,
      "font-weight": options.fontWeight,
    };
  };

  _querySelector = (element) => document.querySelector(element);

  _setColor = (element, {
    lineargradient,
    index,
    colorSlice
  }) => {
    element.setAttribute(
      "stroke",
      lineargradient ? `url(#linear-${index})` : colorSlice
    );
  };

  _setAttribute = (element, object) => {
    for (const key in object) {
      element?.setAttribute(key, object[key]);
    }
  };

  _createNSElement = (type) =>
    document.createElementNS("http://www.w3.org/2000/svg", type);

  _tspan = (className, unit) => {
    const element = this._createNSElement("tspan");

    element.classList.add(className);
    if (unit) element.textContent = unit;
    return element;
  };

  _dashOffset = (count, inverse, cut) => {
    const cutChar = cut ? (264 / 100) * (100 - cut) : 264;
    const angle = 264 - (count / 100) * cutChar;

    return inverse ? -angle : angle;
  };

  _insertAdElement = (element, el, type = "beforeend") =>
    element.insertAdjacentElement(type, el);

  _gradient = ({
    index,
    lineargradient
  }) => {
    const defsElement = this._createNSElement("defs");
    const linearGradient = this._createNSElement("linearGradient");
    linearGradient.id = `linear-${index}`;

    const countGradient = [].slice.call(lineargradient);

    defsElement.appendChild(linearGradient);

    let number = 0;
    countGradient.map((item) => {
      const stopElements = this._createNSElement("stop");

      const stopObj = {
        offset: `${number}%`,
        "stop-color": `${item}`,
      };
      this._setAttribute(stopElements, stopObj);

      linearGradient.appendChild(stopElements);
      number += 100 / (countGradient.length - 1);
    });

    return defsElement;
  };

  _percent = (options, className) => {
    const creatTextElementSVG = this._createNSElement("text");

    creatTextElementSVG.classList.add(`${className}-text-${options.index}`);

    // create tspan element with number
    // and insert to svg text element
    this._insertAdElement(
      creatTextElementSVG,
      this._tspan(`${className}-percent-${options.index}`)
    );

    // create and insert unit to text element
    this._insertAdElement(
      creatTextElementSVG,
      this._tspan(`${className}-unit-${options.index}`, options.unit)
    );

    // config to svg text
    const obj = {
      x: "50%",
      y: "50%",
      fill: options.fontColor,
      "text-anchor": "middle",
      dy: options.textPosition || "0.35em",
      ...this._fontSettings(options),
    };

    this._setAttribute(creatTextElementSVG, obj);
    return creatTextElementSVG;
  };
}

class CustomPieChart {
  /**
   * @param {string}pieChartContainerSelector
   */
  constructor(pieChartContainerSelector) {
    this.pieChartContainerSelector = pieChartContainerSelector;
    this.container = document.querySelector(this.pieChartContainerSelector);

    if (!this.container) {
      console.warn(`${pieChartContainerSelector} element not found!`);
    } else {
      this.pieChart = this.container.querySelector(".pie-chart");
      this.pieData = JSON.parse(this.pieChart.getAttribute("data-pie"));

      this.init();
    }
  }

  init() {
    const stylesPieChart = document.createElement("style");

    stylesPieChart.textContent = this.generateCSSForPieChart();

    document.head.append(stylesPieChart);
    this.generateLegendForPieChart();
  }

  generateLegendForPieChart() {
    const legendFigcaption = document.createElement("figcaption");
    legendFigcaption.className = "legends";

    this.pieData.data.forEach((data) => {
      const {
        percent,
        label
      } = data;
      const item = document.createElement("span");
      item.className = "legend-item";
      item.textContent = `${label} ${percent}%`;
      legendFigcaption.append(item);
    });

    this.container.append(legendFigcaption);
  }

  generateCSSForPieChart() {
    const pieChartData = this.pieData.data;
    const {
      animate,
      animationSpeed
    } = this.pieData;
    const showAnimation = animate && "registerProperty" in CSS;

    let pieCharLegendItems = "";
    let pieCharColors = "";
    let pieCharCSSOpacityProperties = "";
    let pieCharAnimationProperty = "";
    let pieCharAnimationKeyframes = "";
    let pieCharAnimationStartOpacity = "";
    let pieCharAnimationEndOpacity = "";
    let pieCharConicGradientValues = "";
    let lastProcentValue = 0;

    pieChartData.forEach((data, index) => {
      const nr = index + 1;
      const {
        color,
        percent
      } = data;
      const percentValue = percent + lastProcentValue;

      pieCharColors += `--color-${nr}: ${color};`;
      pieCharAnimationStartOpacity += `--opacity-${nr}: 0%;`;

      if (index === 0) {
        pieCharAnimationEndOpacity += `--opacity-${nr}: ${percentValue}%;`;
        pieCharConicGradientValues += showAnimation ?
          `var(--color-${nr}) var(--opacity-${nr}),` :
          `${color} ${percentValue}%,`;
      } else if (index === pieChartData.length - 1) {
        pieCharConicGradientValues += showAnimation ?
          `var(--color-${nr}) 0 var(--opacity-${nr})` :
          `${color} 0 ${percentValue}%`;
      } else {
        pieCharAnimationEndOpacity += `--opacity-${nr}: ${percentValue}%;`;
        pieCharConicGradientValues += showAnimation ?
          `var(--color-${nr}) 0 var(--opacity-${nr}),` :
          `${color} 0 ${percentValue}%,`;
      }

      pieCharLegendItems += `${this.pieChartContainerSelector} .legends .legend-item:nth-child(${nr})::before {background-color: var(--color-${nr});}`;

      if (showAnimation) {
        pieCharCSSOpacityProperties += `@property --opacity-${nr} {syntax: "<percentage>";initial-value: 100%;inherits: false;}`;
      }
      lastProcentValue = percentValue;
    });

    if (showAnimation) {
      pieCharAnimationProperty = `animation: piechart-conic-gradient-animation ${
        animationSpeed / 1000
      }s ease-in-out forwards;`;
      pieCharAnimationKeyframes = `
          @keyframes piechart-conic-gradient-animation {
            0% { ${pieCharAnimationStartOpacity} } 
            100% { ${pieCharAnimationEndOpacity} }
          }
        `;
    }

    return `
              ${pieCharCSSOpacityProperties}
  
              ${this.pieChartContainerSelector} {
                  ${pieCharColors} 
              } 
              ${this.pieChartContainerSelector} .pie-chart {
                  background-image: conic-gradient(from 30deg, ${pieCharConicGradientValues});  
                  ${pieCharAnimationProperty} 
              } 
              ${pieCharAnimationKeyframes}
              ${pieCharLegendItems}
          `;
  }
}

class CustomSelect {
  /**
   * @param {HTMLSelectElement} selectElement
   */
  constructor(selectElement) {
    this.selectElement = selectElement;
    this.numberOfOptions = selectElement.children.length;
    this.className = selectElement.dataset.className ?
      selectElement.dataset.className :
      "custom-select";
    this.createCustomElements();
    this.attachEventListeners();
  }

  createCustomElements() {
    this.selectElement.classList.add(`${this.className}-hidden`);
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add(this.className);
    this.selectElement.parentNode.insertBefore(
      this.wrapper,
      this.selectElement
    );
    this.wrapper.appendChild(this.selectElement);
    this.styledSelect = document.createElement("div");
    this.styledSelect.classList.add(`${this.className}-styled`);
    this.styledSelect.textContent = this.selectElement.options[0].textContent;
    this.wrapper.appendChild(this.styledSelect);
    this.optionList = document.createElement("ul");
    this.optionList.classList.add(`${this.className}-options`);
    this.wrapper.appendChild(this.optionList);
    this.styledSelect.setAttribute("tabindex", "0");

    for (let i = 0; i < this.numberOfOptions; i++) {
      let listItem = document.createElement("li");
      let icon = this.selectElement.options[i].dataset.icon;
      let listItemIcon = icon ? document.createElement("i") : "";
      listItem.textContent = this.selectElement.options[i].textContent;
      listItem.setAttribute("rel", this.selectElement.options[i].value);
      listItem.setAttribute("tabindex", "0");

      if (listItemIcon != "") {
        listItemIcon.classList.add("fa-solid", icon);
      }

      listItem.prepend(listItemIcon);
      this.optionList.appendChild(listItem);

      if (this.selectElement.options[i].selected) {
        listItem.classList.add("is-selected");
      }
    }

    this.listItems = this.optionList.querySelectorAll("li");
  }

  attachEventListeners() {
    /**
     * @param {Event} e
     */
    const openSelect = (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(`div.${this.className}-styled.active`)
        .forEach((activeStyledSelect) => {
          if (activeStyledSelect !== this.styledSelect) {
            activeStyledSelect.classList.remove("active");
            activeStyledSelect.nextElementSibling.style.display = "none";
          }
        });
      this.styledSelect.classList.toggle("active");
      this.optionList.style.display = this.styledSelect.classList.contains(
          "active"
        ) ?
        "block" :
        "none";
    };

    /**
     * @param {Event} e
     * @param {HTMLElement} listItem
     */
    const chooseOption = (e, listItem) => {
      e.stopPropagation();
      this.styledSelect.innerHTML = listItem.innerHTML;
      this.styledSelect.classList.remove("active");
      this.selectElement.value = listItem.getAttribute("rel");
      this.optionList
        .querySelector("li.is-selected")
        .classList.remove("is-selected");
      listItem.classList.add("is-selected");
      this.optionList.style.display = "none";
    };

    this.styledSelect.addEventListener("click", (e) => openSelect(e));
    this.styledSelect.addEventListener("keydown", (e) => {
      if (e.key === "Enter") openSelect(e);
    });

    this.listItems.forEach((listItem) => {
      listItem.addEventListener("keydown", (e) => {
        if (e.key === "Enter") chooseOption(e, listItem);
      });
      listItem.addEventListener("click", (e) => {
        chooseOption(e, listItem);
      });
    });

    document.addEventListener("click", () => {
      this.styledSelect.classList.remove("active");
      this.optionList.style.display = "none";
    });
  }

  destroy() {
    const wrapperParent = this.wrapper.parentElement

    this.selectElement.classList.remove(`${this.className}-hidden`);

    wrapperParent.append(this.selectElement)
    this.wrapper.remove()
  }

  /** @param {string} selector */
  static initAll(selector) {
    document
      .querySelectorAll(selector)
      .forEach((selectElement) => {
        new CustomSelect(selectElement);
      });
  }
}

class CustomCircularProgressBar extends HTMLElement {

  constructor() {
    super();
    this.dataPie
    this.percentValue
    this.labelText
    this.size
  }

  connectedCallback() {
    this.dataPie = this.getAttribute("data-pie");
    this.percent = Number(this.getAttribute("data-percent"));
    this.labelText = this.getAttribute("data-label") ?? "";
    this.size = this.getAttribute("data-size") ?? 150;
    this.render();
    this.init();
  }

  init() { 
    const circle = new CircularProgressBar("pie", {
      size: this.size
    });
    circle.initial(this.querySelector(".pie"));
  }

  render() {
    this.innerHTML = `
      <div class="upt-task-details-chart circular-progress-bar">
        <div class="upt-task-details-chart pie" data-pie='${this.dataPie}' data-pie-index="0">
          <meter class="visually-hidden" id="upt-task-details-chart-label" value="${this.percent / 100.0}">${this.percent}%</meter>
        </div> 
        <label class="progress-desc" for="upt-task-details-chart-label">${this.labelText}</label>
      </div>
    `
  }
}

customElements.define("custom-circular-progress-bar", CustomCircularProgressBar);

class CustomCountdown extends HTMLElement {
  static ANIMATE_ATTRIBUTE_NAME = "data-animate-now";

  constructor() {
    super();
    this.dateEnd;
    this.timeUnitsToShow;
    this.timer;
    this.days;
    this.hours;
    this.minutes;
    this.seconds;
    this.elements = {};
  }

  connectedCallback() {
    const timeUnitsToShowAttr = this.getAttribute("data-time-units-to-show");
    this.dateEnd = this.getAttribute("data-date-end");
    this.timeUnitsToShow = timeUnitsToShowAttr ? JSON.parse(timeUnitsToShowAttr.replace(/'/g, '"')) : ["days", "hours", "minutes", "seconds"];

    this.render();
    this.init();
  }

  init() {
    if (!this.dateEnd) {
      console.warn("data-date-end attribute is missing!");
      return;
    }

    this.dateEnd = new Date(this.dateEnd).getTime();

    this.timer = setInterval(() => this.calculate(), 1000);
  }

  render() {
    const wrapper = document.createElement("span");
    wrapper.className = "custom-countdown";

    const timer = document.createElement("p");
    timer.className = "timer";

    this.timeUnitsToShow.forEach((unit) => {
      const unitElement = document.createElement("span");
      unitElement.className = "timer-data";
      unitElement.setAttribute(`data-${unit}`, "");
      timer.append(unitElement);
      this.elements[unit] = unitElement;
    });

    wrapper.append(timer);
    this.append(wrapper);
  }

  animate(unit, newValue) {
    const unitElement = this.elements[unit];

    if (unitElement && this[unit] !== newValue) {
      unitElement.setAttribute(CustomCountdown.ANIMATE_ATTRIBUTE_NAME, "");

      setTimeout(() => {
        unitElement.removeAttribute(CustomCountdown.ANIMATE_ATTRIBUTE_NAME);
      }, 2000);
    }
  }

  display(days, hours, minutes, seconds) {
    this.animate("days", days);
    this.animate("hours", hours);
    this.animate("minutes", minutes);
    this.animate("seconds", seconds);

    if (this.elements.days) this.elements.days.textContent = days;
    if (this.elements.hours) this.elements.hours.textContent = ("0" + hours).slice(-2);
    if (this.elements.minutes) this.elements.minutes.textContent = ("0" + minutes).slice(-2);
    if (this.elements.seconds) this.elements.seconds.textContent = ("0" + seconds).slice(-2);
  }

  calculate() {
    const dateStart = new Date();
    let timeRemaining = Math.max(0, (this.dateEnd - dateStart.getTime()) / 1000);

    const days = Math.floor(timeRemaining / 86400);
    timeRemaining %= 86400;
    const hours = Math.floor(timeRemaining / 3600);
    timeRemaining %= 3600;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);

    this.display(days, hours, minutes, seconds);

    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;

    if (timeRemaining <= 0) {
      clearInterval(this.timer);
    }
  }
}

customElements.define("custom-countdown", CustomCountdown);

class UserPrivateTasksModuleModal extends HTMLElement {
  static NAME = "user-private-tasks-module-modal";
  static SLOT_TITLE = "modal-title";
  static SLOT_CONTENT = "modal-content";
  static ATTR_ID = "data-modal-id";
  static ATTR_FIRST_FOCUS = "data-modal-first-focus";
  static ATTR_CONTENT_CLASS = "data-modal-content-class";
  static ATTR_TITLE = "data-modal-title";

  constructor() {
    super();
  }

  connectedCallback() {
    this.modalId = this.getAttribute(UserPrivateTasksModuleModal.ATTR_ID);
    this.modalTitle = this.querySelector(`[slot="${UserPrivateTasksModuleModal.SLOT_TITLE}"]`);
    this.modalTitleVal = this.modalTitle?.innerHTML || "";

    this.modalContentVal =
      this.querySelector(`[slot="${UserPrivateTasksModuleModal.SLOT_CONTENT}"]`)
      ?.innerHTML || "";

    this.modalFirstFocus = this.getAttribute(UserPrivateTasksModuleModal.ATTR_FIRST_FOCUS);

    this.modalFirstFocusVal = this.modalFirstFocus ?
      `${UserPrivateTasksModuleModal.ATTR_FIRST_FOCUS}="${this.modalFirstFocus}"` :
      "";

    this.modalContentClass = this.getAttribute(UserPrivateTasksModuleModal.ATTR_CONTENT_CLASS);
    this.modalContentClassVal = this.modalContentClass ?? "";
    this.render();
    new UPTModuleModal(`#${this.modalId}`);
  }

  render() {
    this.innerHTML = `
        <div id="${this.modalId}" ${this.modalFirstFocusVal} class="modal modal--animate js-modal">
            <div class="modal__content modern-card ${this.modalContentClassVal}" role="alertdialog" aria-labelledby="${this.modalId}-title">
                <div class="modal__header pb-2">
                    <p ${UserPrivateTasksModuleModal.ATTR_TITLE} id="${this.modalId}-title" class="upt-header">
                        ${this.modalTitleVal}
                    </p>
                    <button class="modal__close-btn modal__close-btn--inner js-modal__close js-tab-focus">
                        <span class="sr-only">Zamknij</span>
                        <img class="modal__close-btn-icon" src="./images/close-icon.svg" alt="x" aria-hidden="true">
                    </button>
                </div>
                ${this.modalContentVal}
            </div>
        </div>
      `;
  }
}

customElements.define(UserPrivateTasksModuleModal.NAME, UserPrivateTasksModuleModal);


class UPTModuleTaskDetails {
  static ATTR_NAME = "data-task-details-name";
  static ATTR_DESC = "data-task-details-desc";
  // static ATTR_DATE_START = "data-task-details-date-start";
  // static ATTR_DATE_END = "data-task-details-date-end";
  static ATTR_TYPE = "data-task-details-type"
  static ATTR_STATUS = "data-task-details-status"
  static ATTR_CATEGORY = "data-task-details-category"
  static ATTR_PRIORITY = "data-task-details-priority"
  static ATTR_SUBTASKS_LIST = "data-task-details-subtasks-list"
  static ATTR_SUBTASKS_WRAPPER = "data-task-details-subtasks-wrapper"
  static ATTR_DEADLINE_TIMER = "data-task-details-deadline-timer"
  static ATTR_END_TASK_BTN = "data-task-details-end-btn"
  static ATTR_ARCHIVE_TASK_BTN = "data-task-details-archive-btn"
  static ATTR_EDIT_TASK_BTN = "data-task-details-edit-btn"


  /** @type {UPTModuleTaskDetails} */
  static instance;

  constructor() {
    /** @type {HTMLElement} */
    this.modalId = UPT_DETAILS_TASK_MODAL_ID
    this.modal = document.querySelector(`#${this.modalId}`)
    this.apiService = UPTApiService.getInstance()

    if (!this.modal) {
      console.error("this.modal is null");
      return;
    }
    this.currentTaskId = null
    this.editForm = UPTTaskForm.getInstance()
    this.nameElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_NAME)
    this.descElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_DESC)
    this.priorityElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_PRIORITY)
    this.typeElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_TYPE)
    this.statusElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_STATUS)
    this.categoryElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_CATEGORY)
    this.subTasksListElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_SUBTASKS_LIST)
    this.subTasksWrapperElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_SUBTASKS_WRAPPER)
    this.endTaskButton = this.getElementByAttr(UPTModuleTaskDetails.ATTR_END_TASK_BTN)
    this.editTaskButton = this.getElementByAttr(UPTModuleTaskDetails.ATTR_EDIT_TASK_BTN)
    this.archiveTaskButton = this.getElementByAttr(UPTModuleTaskDetails.ATTR_ARCHIVE_TASK_BTN)
    this.deadlineTimerElement = this.getElementByAttr(UPTModuleTaskDetails.ATTR_DEADLINE_TIMER)
    this.subTaskModule = new UPTModuleSubTask(this.subTasksListElement)
    this.init()
  }

  static getInstance() {
    if (!UPTModuleTaskDetails.instance) {
      UPTModuleTaskDetails.instance = new UPTModuleTaskDetails();
    }
    return UPTModuleTaskDetails.instance;
  }

  init() {
    this.editTaskButton.addEventListener('click', (e) => {
      hideModal(this.modalId)
      this.editForm.open(UPTTaskForm.MODE_EDIT, this.currentTaskId)
    })
  }

  /** 
   * @param {UPT_Task} task
   * @param {UPT_TaskCategory | null} category
   */
  displayData(task, category = null) {
    const taskIsMain = task.type === UPT_TaskType.MAIN
    const timeToEndDayCountdown = document.createElement("custom-countdown");
    const now = new Date();
    const deadlineTimeUnitsToShow = taskIsMain ? "['days', 'hours', 'minutes', 'seconds']" : "['hours', 'minutes', 'seconds']"
    const deadlineDate = taskIsMain ?
      new Date(task.deadline) :
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

    this.deadlineTimerElement.querySelector("custom-countdown")?.remove()
    timeToEndDayCountdown.setAttribute("data-date-end", deadlineDate.toISOString());
    timeToEndDayCountdown.setAttribute("data-time-units-to-show", deadlineTimeUnitsToShow);
    this.deadlineTimerElement.append(timeToEndDayCountdown);

    this.nameElement.textContent = task.name
    this.categoryElement.textContent = category ? category.name : "Brak"
    this.typeElement.textContent = task.type
    this.statusElement.textContent = task.status
    this.statusElement.classList.remove(...UPTModulePanel.getAllTaskStatusSubClasses().values())
    this.statusElement.classList.add(UPTModulePanel.getTaskStatusSubClass(task))
    this.priorityElement.textContent = task.priority
    this.priorityElement.classList.remove(...UPTModulePanel.getAllTaskPrioritySubClasses().values())
    this.priorityElement.classList.add(UPTModulePanel.getTaskPrioritySubClass(task))

    if (task.description !== "") {
      this.descElement.style.removeProperty("display")
      this.descElement.textContent = task.description
    } else {
      this.descElement.style.display = "none"
    }

    this.subTaskModule.clearSubTasksList()
    this.subTasksWrapperElement.querySelector("custom-circular-progress-bar")?.remove()

    if (task.subTasks.length === 0) {
      this.subTasksWrapperElement.style.display = "none"
    } else {
      const circularProgressBar = document.createElement("custom-circular-progress-bar");
      // const completedSubTasksPercent = TODO:
      this.subTasksWrapperElement.style.removeProperty("display")
      this.subTaskModule.renderSubTasksList(task.subTasks)
      
      

      circularProgressBar.setAttribute("data-label", "Procent ukończonych podzadań")
      circularProgressBar.setAttribute("data-percent", "41")
      circularProgressBar.setAttribute("data-pie", JSON.stringify({
        lineargradient: ["#14a5ff","#008be2"], 
        round: true, 
        percent: 41, 
        colorCircle: "rgba(63, 98, 74, 0.25)" 
      }))
 
      this.subTasksWrapperElement.append(circularProgressBar)

      // circle.animationTo()
    }
  }

  /** @param {string} taskId */
  async show(taskId) {
    showModalLoading(this.modalId)
    showModal(this.modalId, `Edytuj Zadanie`)

    try {
      const task = await this.apiService.getTaskById(taskId)

      if (!task) {
        throw new Error("Nie istnieje zadanie o id: " + taskId);
      }

      const category = task.categoryId ?
        await this.apiService.getCategoryById(task.categoryId) :
        null

      this.currentTaskId = task.id

      this.displayData(task, category)

      UPTModuleToast.show(UPTModuleToast.INFO, "Pobrano i załadowano informacje o zadaniu")
    } catch (e) {
      hideModal(this.modalId)
      console.error(e)
      UPTModuleToast.show(UPTModuleToast.ERROR, e.message)
    } finally {
      hideModalLoading(this.modalId)
    }
  }

  /** @param {string} attributeName */
  getElementByAttr(attributeName) {
    const element = this.modal.querySelector(`[${attributeName}]`)

    if (!element) {
      console.error(`element[${attributeName}] is null`);
      return null;
    }
    return element
  }
}


class UPTModuleSubTask {
  static MODE_EDIT = "edit"
  static MODE_SHOW = "show"

  /** @param {HTMLElement} container */
  constructor(container) { 
    this.container = container
  }

  /** @param {UPT_SubTask[]} subTasks */
  renderSubTasksList(subTasks) {
    const subTasksNumber = subTasks.length
    const subTasksListFragment = document.createDocumentFragment()

    for (let i = 0; i < subTasksNumber; i++) {
      const subTask = subTasks[i]

      subTasksListFragment.append(
        this.renderSubTaskCard(subTask, UPTModuleSubTask.MODE_SHOW)
      )
    }
    this.container.append(subTasksListFragment)
  }

  clearSubTasksList() {
    this.container.innerHTML = ""
  }

  /** @param {string} subTaskId */
  getSubTaskElement(subTaskId) {
    return this.container.querySelector(`[data-subtask-id="${subTaskId}"]`)
  }

  /** 
   * @param {UPT_SubTask} subTask 
   * @param {string} mode
   */
  renderSubTaskCard(subTask, mode = UPTModuleSubTask.MODE_SHOW) {
    const isEditMode = mode === UPTModuleSubTask.MODE_EDIT
    const li = document.createElement("li")
    const deleteSubTaskButton = isEditMode ? `
      <span class="category-card-actions subtask-actions">
          <button data-delete-subtask-btn data-subtask-id="${subTask.id}" class="category-card-action-btn category-card-delete-btn subtask-action-btn tooltip">
            <span class="tooltip-content">Usuń Podzadanie</span>
            <i class="fa-solid fa-trash-can"></i>
          </button>
      </span>  
    ` : ''

    const subTaskHeaderContent = isEditMode ?
      `<span class="upt-form-field">
        <input class="floating-label-control upt-form-control" type="text" name="upt-subtast-name-${subTask.id}" id="upt-subtast-input-name-${subTask.id}" placeholder="Nazwa Podzadania" value="${subTask.name}">
          <label class="floating-label" for="upt-subtast-input-name-${subTask.id}">Nazwa Podzadania</label> 
          <i class="upt-icon fa-solid fa-pen"></i>
      </span>
      <span class="upt-form-field">
        <input class="floating-label-control upt-form-control" type="datetime-local" name="upt-subtast-date-${subTask.id}" id="upt-subtast-input-date-${subTask.id}">
        <label class="floating-label" for="upt-subtast-input-date-${subTask.id}">Od kiedy</label>
      </span>
    ` :
      `
        <span data-subtask-name class="subtask-name">${subTask.name}</span>
        <span data-subtask-date class="subtask-date">${subTask.deadline ?? ''}</span>
      `

    li.className = "subtask task modern-card"
    li.setAttribute("data-subtask-card", "")
    li.setAttribute("data-subtask-id", subTask.id)
    li.innerHTML = `
        <span class="task-checkbox custom-checkbox-group">
          <input data-mark-subtask-as-done id="mark-subtask-as-done-${subTask.id}" type="checkbox">
          <label class="custom-checkbox-label" for="mark-subtask-as-done-${subTask.id}">
            <span class="sr-only">Oznacz jako wykonane</span>
            <span class="custom-checkbox-icon" aria-hidden="true"></span>
          </label>
        </span>
        <span class="task-content">
          <span class="task-header subtask-header">${subTaskHeaderContent}</span>
        </span>
        ${deleteSubTaskButton}                        
    `

    return li;
  }
}


// ---------------------------------------- FORMULARZE ---------------------------------------------


class UPTCategoryForm {
  static MODE_EDIT = "edit"
  static MODE_CREATE = "create"

  static FIELD_NAME = "upt-category-name";
  static FIELD_DESC = "upt-category-desc"
  static FIELD_ICON = "upt-category-icon"

  /** @type {UPTCategoryForm} */
  static instance;

  constructor() {
    /** @type {HTMLFormElement} */
    this.form = document.querySelector(`#${UPT_CATEGORY_FORM_ID}`)
    this.apiService = UPTApiService.getInstance()

    if (!this.form) {
      console.error("form is null");
      return;
    }
    this.nameInput = this.form.querySelector(`input[name="${UPTCategoryForm.FIELD_NAME}"]`)
    this.descTextarea = this.form.querySelector(`textarea[name="${UPTCategoryForm.FIELD_DESC}"]`)
    this.iconSelect = this.form.querySelector(`select[name="${UPTCategoryForm.FIELD_ICON}"]`)

    this.init()
  }

  static getInstance() {
    if (!UPTCategoryForm.instance) {
      UPTCategoryForm.instance = new UPTCategoryForm();
    }
    return UPTCategoryForm.instance;
  }

  /** @param {string} categoryId */
  async loadFormData(categoryId) {
    showModalLoading(UPT_CATEGORY_FORM_MODAL_ID)

    const category = await this.apiService.getCategoryById(categoryId)

    if (!category) {
      UPTModuleToast.show(UPTModuleToast.ERROR, "Nie istnieje kateogria o id: " + categoryId)
    } else {
      UPTModuleToast.show(UPTModuleToast.INFO, "Pobrano informacje o kategorii")
    }

    hideModalLoading(UPT_CATEGORY_FORM_MODAL_ID)

    return category
  }

  /**  
   * @param {string} mode 
   * @param {string | null} categoryId
   */
  async open(mode, categoryId = null) {
    const isEditMode = mode === UPTCategoryForm.MODE_EDIT
    const submitButton = this.form.querySelector("[data-form-submit-btn]")

    submitButton.textContent = isEditMode ? "Zapisz zmiany" : "Dodaj"

    this.form.reset()

    showModal(UPT_CATEGORY_FORM_MODAL_ID, isEditMode ? "Edytuj Kategorię" : "Dodaj Kategorię")

    if (isEditMode) {
      const category = await this.loadFormData(categoryId)

      this.nameInput.value = category.name
      this.descTextarea.textContent = category.desc

    } else {
      this.nameInput.value = ""
    }
  }

  init() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault()


      const formData = new FormData(this.form)

      console.log(formData)
    })
  }
}

class UPTTaskForm {
  static MODE_EDIT = "edit"
  static MODE_CREATE = "create"

  static FIELD_NAME = "upt-tast-name";
  static FIELD_DESC = "upt-tast-desc";
  static FIELD_DATE_START = "upt-tast-date-start";
  static FIELD_DATE_END = "upt-tast-date-end";
  static FIELD_TYPE = "upt-tast-type"
  static FIELD_CATEGORY = "upt-tast-category"
  static FIELD_ALL_DAY = "upt-task-all-day"
  static FIELD_PRIORITY = "upt-tast-priority"
  static FIELD_SUBTASKS = "upt-tast-subtasks"

  /** @type {UPTTaskForm} */
  static instance;

  constructor() {
    /** @type {HTMLFormElement} */
    this.form = document.querySelector(`#${UPT_TASK_FORM_ID}`)
    this.apiService = UPTApiService.getInstance()

    if (!this.form) {
      console.error("form is null");
      return;
    }
    this.subTaskModule = new UPTModuleSubTask(this.form.querySelector("[data-subtasks-list]"))
    this.addSubTaskButton = this.form.querySelector("[data-form-add-subtask]")
    this.nameInput = this.form.querySelector(`input[name="${UPTTaskForm.FIELD_NAME}"]`)
    this.descTextarea = this.form.querySelector(`textarea[name="${UPTTaskForm.FIELD_DESC}"]`)
    this.prioritySelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_PRIORITY}"]`)
    this.typeSelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_TYPE}"]`)
    this.categorySelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_CATEGORY}"]`)

    this.categoryCustomSelect = new CustomSelect(this.categorySelect)
    this.priorityCustomSelect = new CustomSelect(this.prioritySelect)
    this.typeCustomSelect = new CustomSelect(this.typeSelect)

    this.init()
  }

  static getInstance() {
    if (!UPTTaskForm.instance) {
      UPTTaskForm.instance = new UPTTaskForm();
    }
    return UPTTaskForm.instance;
  }

  init() {
    this.addSubTaskButton.addEventListener('click', (e) => this.addSubTask(e))
    this.form.addEventListener("submit", (e) => this.handleFormSubmit(e))
  }


  /** 
   * @param {UPT_Task} task 
   * @param {UPT_TaskCategory[]} categories 
   */
  displayFormData(task, categories) {
    this.subTaskModule.renderSubTasksList(task.subTasks ?? [])
    this.categoryCustomSelect.destroy()
    //this.priorityCustomSelect.destroy()
    //this.typeCustomSelect.destroy()

    this.nameInput.value = task.name
    this.typeSelect.value = task.type
    this.prioritySelect = task.priority

    categories.forEach(category => {
      const option = document.createElement("option")
      option.value = category.id
      option.textContent = `${category.icon} ${category.name}`

      if (category.id === task.categoryId) {
        this.categorySelect.prepend(option)
        this.categorySelect.value = category.id
      } else {
        this.categorySelect.append(option)
      }
    })

    this.categoryCustomSelect = new CustomSelect(this.categorySelect)
    //this.priorityCustomSelect = new CustomSelect(this.prioritySelect)
    //this.typeCustomSelect = new CustomSelect(this.typeSelect)
  }

  reset() {
    this.form.reset()
    this.categorySelect.innerHTML = '<option value="hide">Wybierz Kategorie</option>'
    this.subTaskModule.clearSubTasksList()
  }

  /** @param {string} taskId */
  async loadFormData(taskId) {
    showModalLoading(UPT_TASK_FORM_MODAL_ID)

    try {
      const task = await this.apiService.getTaskById(taskId)
      const categories = await this.apiService.getCategories()

      if (!task) {
        throw new Error("Nie istnieje zadanie o id: " + taskId);
      }

      this.displayFormData(task, categories)

      UPTModuleToast.show(UPTModuleToast.INFO, "Pobrano i załadowano informacje o zadaniu")
    } catch (e) {
      hideModal(UPT_TASK_FORM_MODAL_ID)
      console.error(e)
      UPTModuleToast.show(UPTModuleToast.ERROR, e.message)
    } finally {
      hideModalLoading(UPT_TASK_FORM_MODAL_ID)
    }
  }

  /** 
   * @param {string} mode 
   * @param {string | null} taskId
   */
  async open(mode, taskId = null) {
    const isEditMode = mode === UPTTaskForm.MODE_EDIT

    manipulateDOMElement(`#${UPT_TASK_FORM_ID} [data-form-submit-btn]`, (submitButton) => {
      submitButton.textContent = isEditMode ? "Zapisz zmiany" : "Dodaj"
    })

    this.reset()

    showModal(UPT_TASK_FORM_MODAL_ID, isEditMode ? "Edytuj Zadanie" : "Dodaj Zadanie")

    if (isEditMode) {
      this.loadFormData(taskId)
    }
  }

  addSubTask(e) {
    e.preventDefault()

    const newSubTask = new UPT_SubTask(generateId(), "")

    const newSubTaskCard = this.subTaskModule.renderSubTaskCard(newSubTask, UPTModuleSubTask.MODE_EDIT)

    this.subTaskModule.container.append(newSubTaskCard)
  }

  handleFormSubmit(e) {
    e.preventDefault()
    const formData = new FormData(this.form)
    const formDataObject = {};
    const subTaskCards = this.subTaskModule.container.querySelectorAll("[data-subtask-card]")

    formData.forEach((value, key) => formDataObject[key] = value);
    formDataObject[UPTTaskForm.FIELD_SUBTASKS] = []

    subTaskCards.forEach(card => {
      const subTaskName = card.querySelector("[data-subtask-name]").textContent
      const subTaskId = card.dataset.subtaskId

      formDataObject[UPTTaskForm.FIELD_SUBTASKS].push({
        id: subTaskId,
        name: subTaskName
      })
    })
    // console.log(formData)
    console.log(formDataObject)

    UPTModuleToast.show(UPTModuleToast.SUCCESS, "Zadanie zostało zaktualizowane!")

    // const formDataJson = JSON.stringify(formDataObject);
    // console.log(formDataJson)
  }


}


// ---------------------------------------- ZAKŁADKI ---------------------------------------------


class UPTModulePanel {

  /**
   * @param {string} selector
   * @param {{ tasks: UPT_Task[], categories: UPT_TaskCategory[] }}
   */
  constructor(selector, {
    tasks,
    categories
  }) {
    this.panel = document.querySelector(selector);
    this.tasks = tasks;
    this.categories = categories;
    this.apiService = UPTApiService.getInstance();
    this.taskForm = UPTTaskForm.getInstance()
    this.categoryForm = UPTCategoryForm.getInstance()
    this.taskDetails = UPTModuleTaskDetails.getInstance()

    if (!this.panel) {
      console.error("this.panel is null");
      return;
    }
    CustomSelect.initAll(selector + " select[data-custom-select]");
    this.setClickEventListeners()

    hideLoading(this.panel);
  }

  static getAllTaskStatusSubClasses() {
    const statusSubClasses = new Map();

    statusSubClasses.set(UPT_TaskStatus.COMPLETED, "task-status--completed")
    statusSubClasses.set(UPT_TaskStatus.DELETED, "task-status--deleted")
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
    return UPTModulePanel.getAllTaskStatusSubClasses().get(task.status)
  }

  /** @param {UPT_Task} task */
  static getTaskPrioritySubClass(task) {
    return UPTModulePanel.getAllTaskPrioritySubClasses().get(task.priority)
  }

  /** @param {UPT_Task} task */
  getTaskPrioritySubClass(task) {
    return UPTModulePanel.getTaskPrioritySubClass(task)
  }

  /** @param {UPT_Task} task */
  getCategoryByTask(task) {
    return this.categories.find((cat) => cat.id === task.categoryId);
  }

  setClickEventListeners() {

    const actionMap = {
      "data-add-task-button": () => this.taskForm.open(UPTTaskForm.MODE_CREATE),
      "data-add-category-button": () => this.categoryForm.open(UPTCategoryForm.MODE_CREATE),
      "data-edit-task-btn": (target) => this.taskForm.open(UPTTaskForm.MODE_EDIT, target.dataset.taskId),
      "data-details-task-btn": (target) => this.taskDetails.show(target.dataset.taskId),
      "data-delete-task-btn": (target) => this.handleDeleteTaskButton(target),
      "data-edit-category-btn": (target) => this.categoryForm.open(UPTCategoryForm.MODE_EDIT, target.dataset.categoryId),
      "data-delete-category-btn": (target) => this.handleDeleteCategoryButton(target),
    };

    this.panel.addEventListener("click", (e) => {
      const target = e.target;

      for (const [attr, action] of Object.entries(actionMap)) {
        if (target.hasAttribute(attr)) {
          action(target);
          break;
        }
      }
    });
  }

  /** @param {HTMLButtonElement} button */
  handleDeleteTaskButton(button) {
    const taskId = button.dataset.taskId;
    const confirmButton = document.querySelector(`#${UPT_CONFIRM_MODAL_ID} [data-modal-confirm-button]`);
    const taskName = document.querySelector(`[data-task-card][data-task-id="${taskId}"] [data-task-name]`).textContent;

    showModal(UPT_CONFIRM_MODAL_ID, `Czy napewno chcesz usunąć zadanie "${taskName}"?`);

    confirmButton.onclick = (e) => {
      showLoading(e.target);

      setTimeout(() => {
        const taskCards = document.querySelectorAll(`[data-task-card][data-task-id="${taskId}"]`);

        taskCards.forEach(card => removeDataCard(card))
        //TODO: odkomentuj
        // this.apiService.deleteTask(taskId)
        hideModal(UPT_CONFIRM_MODAL_ID);

        UPTModuleToast.show(UPTModuleToast.SUCCESS, "Pomyślnie usunięto zadanie");

        hideLoading(e.target);

      }, 2000);
    };
  }

  /** @param {HTMLButtonElement} button */
  handleDeleteCategoryButton(button) {
    const categoryId = button.dataset.categoryId;
    const confirmButton = document.querySelector(`#${UPT_CONFIRM_MODAL_ID} [data-modal-confirm-button]`);
    const categoryCard = this.panel.querySelector(`[data-category-card][data-category-id="${categoryId}"]`);
    const categoryName = categoryCard.querySelector("[data-category-name]").textContent;

    showModal(UPT_CONFIRM_MODAL_ID, `Czy napewno chcesz usunąć kategorię "${categoryName}"?`);

    confirmButton.onclick = (e) => {
      showLoading(e.target);

      // this.apiService.deleteCategory(categoryId).then(()=> {
      //   removeDataCard(categoryCard); 
      //   hideModal(UPT_CONFIRM_MODAL_ID); 
      //   UPTModuleToast.show(UPTModuleToast.SUCCESS, "Pomyślnie usunięto kategorię"); 
      //   hideLoading(e.target);
      // })

      setTimeout(() => {
        removeDataCard(categoryCard);
        hideModal(UPT_CONFIRM_MODAL_ID);
        UPTModuleToast.show(UPTModuleToast.SUCCESS, "Pomyślnie usunięto zadanie");
        hideLoading(e.target);
      }, 2000);
    };
  }
}

class UPTModuleMainPanel extends UPTModulePanel {
  static TASKS_DISPLAY_NUMBER = 5;
  static CATEGORIES_DISPLAY_NUMBER = 5;

  constructor(selector, data) {
    super(selector, data);
    this.init();
  }

  init() {
    // Wykres kołowy na głównym panelu
    this.initPieChart();

    // Liczba zadań
    this.initStatisticTasks();

    // Wyświetl liste zadań
    this.renderTasksList();

    // Wyświetl Kategorie
    this.renderCategoriesList();

    // timer odliczający do końca dnia
    this.initTimeToEndDayCountdown();

    // Statystyki związane z datą i godziną na głównym panelu
    this.initDateTimeStatisics();
  }

  renderCategoriesList() {
    const categoriesList = this.panel.querySelector("[data-category-list]");
    const categoriesNumber = this.categories.length;
    const categoriesListFragment = document.createDocumentFragment();

    for (let i = 0; i < categoriesNumber; i++) {
      const category = this.categories[i];

      if (i >= UPTModuleMainPanel.CATEGORIES_DISPLAY_NUMBER - 1) break;

      const li = document.createElement("li");
      //<i class="task-category-link-icon fa-regular fa-circle-question" aria-hidden="true"></i>

      li.innerHTML = `
        <a href="#kategorie" class="task-category-link link variant4"> 
          <i class="task-category-link-icon" aria-hidden="true">${category.icon}</i>
          <span>${category.name}</span>
        </a>
      `;

      categoriesListFragment.append(li);
    }

    categoriesList.append(categoriesListFragment);
  }

  renderTasksList() {
    //TODO: const tasks = this.tasks.sort(task => {})
    const dailyTasksList = this.panel.querySelector("[data-daily-tasks-list]");
    const mainTasksList = this.panel.querySelector("[data-main-tasks-list]");
    const tasksNumber = this.tasks.length;
    const dailyTasksFragment = document.createDocumentFragment();
    const mainTasksFragment = document.createDocumentFragment();
    let mainTasksDisplayedNumber = 0,
      dailyTasksDisplayedNumber = 0;

    for (let i = 0; i < tasksNumber; i++) {
      const task = this.tasks[i];
      const taskIsMain = task.type === UPT_TaskType.MAIN;

      if (
        task.isArchived ||
        (taskIsMain && mainTasksDisplayedNumber >= UPTModuleMainPanel.TASKS_DISPLAY_NUMBER) ||
        (!taskIsMain && dailyTasksDisplayedNumber >= UPTModuleMainPanel.TASKS_DISPLAY_NUMBER)
      ) {
        continue;
      }

      const li = document.createElement("li");
      const category = this.getCategoryByTask(task);
      const categoryIcon = category ? category.icon : "";
      const taskPrioritySubClass = this.getTaskPrioritySubClass(task);
      const taskRepeatIcon = !taskIsMain ? '<i class="fa-solid fa-rotate"></i>' : "";
      const taskDateInfo = taskIsMain ? `
          <span class="task-date-month"><i class="fa-regular fa-calendar"></i> 23 Paź</span>
          <span class="task-date-hours"><i class="fa-regular fa-clock"></i> 10:00 - 12:30</span>
        ` : `
        <span class="task-date-hours"><i class="fa-regular fa-clock"></i> 10:00 - 12:30</span>
      `

      li.className = "task modern-card modern-card--opacity";
      li.setAttribute("data-task-id", task.id);
      li.setAttribute("data-task-card", "");

      //<i class="fa-solid fa-briefcase"></i>

      li.innerHTML = `
        <span class="task-checkbox tooltip custom-checkbox-group custom-checkbox-group--big">
          <input data-mark-task-as-done id="mark-as-done-task-${task.id}" type="checkbox">
          <label class="custom-checkbox-label" for="mark-as-done-task-${task.id}">
            <span class="tooltip-content">Oznacz jako wykonane</span>
            <span class="custom-checkbox-icon" aria-hidden="true"></span>
          </label>
        </span>

        <span class="task-content">

          <span class="task-priority ${taskPrioritySubClass}">
            ${task.priority}
          </span>

          <span class="task-header">
              <span class="task-name">
                <i>${categoryIcon}</i> <span data-task-name>${task.name}</span> ${taskRepeatIcon}
              </span>

              <span class="tooltip">
                ${taskDateInfo}
                <span class="tooltip-content">
                  ${getUserFriendlyDateFormat(task.deadline)}
                  <hr class="upt-hr">
                  Od 10:00 do 12:30
                </span>                                                                                                                                            
              </span>
          </span>
        </span>

        <span class="task-actions">
          <button data-edit-task-btn data-task-id="${task.id}" class="task-action-btn task-edit-btn tooltip">
            <span class="tooltip-content">Edytuj Zadanie</span>
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button data-delete-task-btn data-task-id="${task.id}" class="task-action-btn task-delete-btn tooltip">
            <span class="tooltip-content">Usuń Zadanie</span>
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </span>
      `;

      if (taskIsMain) {
        mainTasksDisplayedNumber++;
        mainTasksFragment.append(li);
      } else {
        dailyTasksDisplayedNumber++;
        dailyTasksFragment.append(li);
      }
    }

    mainTasksList.append(mainTasksFragment);
    dailyTasksList.append(dailyTasksFragment);
  }

  initTimeToEndDayCountdown() {
    const timeToEndDayCard = this.panel.querySelector("[data-time-to-end-day]");
    const timeToEndDayCountdown = document.createElement("custom-countdown");
    const now = new Date();
    const tomorrowDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, 0, 0, 0, 0
    );

    timeToEndDayCountdown.setAttribute("data-date-end", tomorrowDate.toISOString());
    timeToEndDayCountdown.setAttribute("data-time-units-to-show", "['hours', 'minutes', 'seconds']");
    timeToEndDayCard.append(timeToEndDayCountdown);
  }

  initStatisticTasks() {
    const dailyTasksNumber = this.tasks.reduce((value, task) => (task.type === UPT_TaskType.MAIN ? value + 1 : value), 0);
    const mainTasksNumber = this.tasks.reduce((value, task) => (task.type === UPT_TaskType.DAILY ? value + 1 : value), 0);
    const dailyTasksNumberEl = this.panel.querySelector("[data-statistic-daily-tasks-number]");
    const mainTasksNumberEl = this.panel.querySelector("[data-statistic-main-tasks-number]");
    dailyTasksNumberEl.textContent = dailyTasksNumber;
    mainTasksNumberEl.textContent = mainTasksNumber;
  }

  initPieChart() {
    const pieChartSelector = UPT_MODULE_ID_SELECTOR + " [data-pie-chart]";
    const pieChartAppearance = this.panel.querySelector(pieChartSelector + " [data-pie-chart-appearance]");
    const tasksNumber = this.tasks.length;
    const getPercentOfTasksNumber = (number) => Math.round((number * 100) / tasksNumber);

    let completedCount = 0,
      inProgressCount = 0,
      deletedCount = 0;

    this.tasks.forEach((task) => {
      switch (task.status) {
        case UPT_TaskStatus.COMPLETED:
          completedCount++;
          break;
        case UPT_TaskStatus.IN_PROGRESS:
          inProgressCount++;
          break;
        case UPT_TaskStatus.DELETED:
          deletedCount++;
          break;
      }
    });

    pieChartAppearance.setAttribute(
      "data-pie",
      JSON.stringify({
        data: [{
            color: "#00c821",
            percent: getPercentOfTasksNumber(completedCount),
            label: `Zrealizowane(${completedCount})`,
          },
          {
            color: "#e74f4f",
            percent: getPercentOfTasksNumber(deletedCount),
            label: `Porzucone(${deletedCount})`,
          },
          {
            color: "#fc921f",
            percent: getPercentOfTasksNumber(inProgressCount),
            label: `W trakcie(${inProgressCount})`,
          },
        ],
        animate: true,
        animationSpeed: 1250,
      })
    );

    new CustomPieChart(pieChartSelector);
  }

  initDateTimeStatisics() {
    new UPTDateTimeStatisics(UPT_MODULE_ID_SELECTOR + " [data-date-time-statisics]");
  }
}

class UPTModuleCategoryPanel extends UPTModulePanel {
  static TOGGLE_ANIMATION_DURATION = 300

  constructor(selector, data) {
    super(selector, data);
    this.init();
  }

  init() {
    this.renderCategoriesList();
  }

  renderCategoriesList() {
    const categoriesList = this.panel.querySelector("[data-category-list]");
    const categoriesNumber = this.categories.length;
    const categoriesListFragment = document.createDocumentFragment();

    for (let i = 0; i < categoriesNumber; i++) {
      const category = this.categories[i];
      categoriesListFragment.append(this.renderCategory(category));
    }

    categoriesList.append(categoriesListFragment);
  }

  /** @param {UPT_TaskCategory} category */
  renderCategory(category) {
    const li = document.createElement("li");
    li.setAttribute("data-category-id", category.id);
    li.setAttribute("data-category-card", "");
    li.className = "category-card modern-card";

    //<i class="category-card-icon fa-regular fa-circle-question"></i>

    li.innerHTML = `
      <span class="category-card-header">
        <span class="category-card-name">
            <i class="category-card-icon">${category.icon}</i>
            <span data-category-name>${category.name}</span>
        </span>
        <span class="category-card-createAt">Utworzono: ${formatDate(category.createdAt)}</span>
      </span>
      <span class="category-card-actions">
        <button data-edit-category-btn data-category-id="${category.id}" class="category-card-action-btn tooltip">
          <i class="fa-solid fa-pen-to-square"></i>
          <span class="tooltip-content">Edytuj Zadanie</span>
        </button>
        <button data-delete-category-btn data-category-id="${category.id}" class="category-card-action-btn category-card-delete-btn tooltip">
          <span class="tooltip-content">Usuń Zadanie</span>
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </span>
    `;

    return li
  }
}

class UPTModuleTasksPanel extends UPTModulePanel {
  constructor(selector, data) {
    super(selector, data);
    this.tasksList = this.panel.querySelector("[data-tasks-list]");
    this.currentTypeTitleEl = this.panel.querySelector("[data-current-type-title]")
    this.typeToggleButton = this.panel.querySelector("[data-tasks-type-toggle-btn]")
    this.init();
  }

  init() {
    this.renderTasksList();
    this.typeToggleButton.addEventListener('click', (e) => this.toggleTasks(e))
  }

  toggleTasks(e) {
    const toggleButton = e.target
    const currentType = toggleButton.dataset.currentType
    const isCurrentTypeDaily = currentType === UPT_TaskType.DAILY
    /**@type {NodeListOf<HTMLElement>}  */
    const taskCards = this.panel.querySelectorAll(`[data-task-card]`)

    toggleButton.setAttribute("data-current-type", isCurrentTypeDaily ? UPT_TaskType.MAIN : UPT_TaskType.DAILY)
    toggleButton.textContent = isCurrentTypeDaily ? "Pokaż zadania codzienne" : "Pokaż zadania główne"

    fadeAnimation(() => {
      taskCards.forEach(taskCard => {
        taskCard.style.removeProperty("display")

        if (taskCard.getAttribute("data-task-type") === currentType) {
          taskCard.style.display = "none"
        } else {
          taskCard.style.display = "block"
        }
      })

    }, this.tasksList, UPTModuleCategoryPanel.TOGGLE_ANIMATION_DURATION)

    fadeAnimation(() => {
      this.currentTypeTitleEl.textContent = isCurrentTypeDaily ? "Zadania Główne" : "Zadania Codzienne"

    }, this.currentTypeTitleEl, UPTModuleCategoryPanel.TOGGLE_ANIMATION_DURATION)
  }

  renderTasksList() {
    const tasksListFragment = document.createDocumentFragment();
    const tasksNumber = this.tasks.length;

    for (let i = 0; i < tasksNumber; i++) {
      const task = this.tasks[i];
      const taskIsMain = task.type === UPT_TaskType.MAIN

      if (task.isArchived) {
        continue;
      }

      const card = document.createElement("div");
      const category = this.getCategoryByTask(task);
      const categoryIcon = category ? category.icon : "";
      const taskPrioritySubClass = this.getTaskPrioritySubClass(task);
      const taskRepeatIcon = !taskIsMain ? '<i class="fa-solid fa-rotate"></i>' : "";
      const taskDescription =
        task.description && task.description !== "" ?
        `<p class="task-card-short-desc">${task.description}</p>` :
        "";
      const taskDateInfo = taskIsMain ? `
          <span class="task-date-month"><i class="fa-regular fa-calendar"></i> 23 Paź</span>
          <span class="task-date-hours"><i class="fa-regular fa-clock"></i> 10:00 - 12:30</span>
        ` : `
        <span class="task-date-hours"><i class="fa-regular fa-clock"></i> 10:00 - 12:30</span>
      `

      card.setAttribute("data-task-id", task.id);
      card.setAttribute("data-task-type", task.type);
      card.setAttribute("data-task-card", "");
      card.className = "task-card modern-card";

      if (taskIsMain) {
        card.style.display = "none";
      }

      card.innerHTML = `
        <div class="task-card-header">
          <span class="task-priority task-card-priority ${taskPrioritySubClass}">${task.priority}</span>

          <p class="task-name task-card-name">
            <i class="task-icon">${categoryIcon}</i>
            <span data-task-name>${task.name}</span> ${taskRepeatIcon}
          </p>

          <div class="category-card-actions task-card-actions-top">
            <button data-edit-task-btn data-task-id="${task.id}" class="category-card-action-btn task-card-action-btn tooltip">
              <i class="fa-solid fa-pen-to-square"></i>
              <span class="tooltip-content">Edytuj Zadanie</span>
            </button>
            <button data-archive-task-btn data-task-id="${task.id}" class="category-card-action-btn task-card-action-btn tooltip">
              <span class="tooltip-content">Archiwizuj Zadanie</span>
              <i class="fa-regular fa-folder"></i>
            </button>
            <button data-delete-task-btn data-task-id="${task.id}"  class="category-card-action-btn category-card-delete-btn task-card-action-btn tooltip">
              <span class="tooltip-content">Usuń Zadanie</span>
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>                                                          
        </div>

        <div class="tooltip">
          ${taskDateInfo}
          <span class="tooltip-content"> 
            ${getUserFriendlyDateFormat(task.deadline)}
            <hr class="upt-hr">
            Od 10:00 do 12:30
          </span>
        </div>
 
        ${taskDescription}

        <div class="task-card-actions-bottom">
          <button data-details-task-btn data-task-id="${task.id}" class="task-card-action-btn link small variant3" aria-controls="user-private-tasks-module-task-details-modal">
            <i class="fa-solid fa-info"></i> Pokaż Szczegóły
          </button>
          <button data-end-task-btn data-task-id="${task.id}" class="task-card-action-btn link small variant2">
            <i class="fa-solid fa-check"></i> Zakończ Zadanie
          </button>
        </div>                     
      `;

      tasksListFragment.append(card);
    }

    this.tasksList.append(tasksListFragment);
  }
}

class UPTModuleArchivePanel extends UPTModulePanel {
  constructor(selector, data) {
    super(selector, data);
    this.init();
  }

  init() {
    this.renderTasksList();
  }

  renderTasksList() {
    const tasksList = this.panel.querySelector("[data-tasks-archive-list]");
    const tasksListFragment = document.createDocumentFragment();
    const tasksNumber = this.tasks.length;

    for (let i = 0; i < tasksNumber; i++) {
      const task = this.tasks[i];

      if (!task.isArchived) {
        continue;
      }

      const li = document.createElement("li");
      const category = this.getCategoryByTask(task);
      const categoryIcon = category ? category.icon : "";
      const taskPrioritySubClass = this.getTaskPrioritySubClass(task);
      const taskRepeatIcon =
        task.type === UPT_TaskType.DAILY ?
        '<i class="fa-solid fa-rotate"></i>' :
        "";

      li.setAttribute("data-task-id", task.id);
      li.setAttribute("data-task-card", "");
      li.className = "task-archive category-card modern-card";

      li.innerHTML = ` 
         <span class="task-archive-header">
          <span class="task-priority ${taskPrioritySubClass}">
            ${task.priority}
          </span>
          <span class="task-archive-name category-card-name">
            <i class="category-card-icon">${categoryIcon}</i>
            <span data-task-name>${task.name}</span>
            ${taskRepeatIcon}
          </span>
        </span>                                                 
        <span class="category-card-createAt">
          Zarchiwizowano: ${formatDate(task.archivedAt)}
        </span>
        <span class="task-archive-actions category-card-actions">
          <button class="category-card-action-btn tooltip">
            <i class="fa-solid fa-info"></i>
            <span class="tooltip-content">Szczegóły Zadania</span>
          </button>
          <button class="category-card-action-btn tooltip">
            <i class="fa-solid fa-rotate-right"></i>
            <span class="tooltip-content">Przywróć Zadanie</span>
          </button>
          <button class="category-card-action-btn category-card-delete-btn tooltip">
            <span class="tooltip-content">Usuń Zadanie</span>
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </span>                     
      `;

      tasksListFragment.append(li);
    }

    tasksList.append(tasksListFragment);
  }
}