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
    const now = new Date();
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
      this.currentTimeEl.textContent = now.toLocaleTimeString();
    } else {
      console.error(`this.currentTimeEl is null`);
    }
  }
}

class UPTMainNavigation {
  static UPT_MODULE_CHANGE_PAGE_EVENT = "upt-modul-change-page";

  ANIMATION_DURATION_TIME = 350;

  linkPage = "";
  prevLink = null;
  breakpointValue = remToPx(76);
  changeScreenEvent = new CustomEvent(UPTMainNavigation.UPT_MODULE_CHANGE_PAGE_EVENT);

  /** @param {string} mainContainerSelector */
  constructor(mainContainerSelector) {
    this.mainContainer = document.querySelector(mainContainerSelector);

    if (!this.mainContainer) {
      console.error(`this.mainContainer is null`);
      return;
    }
    this.navigation = this.mainContainer.querySelector("[data-main-navigation]");
    this.navigationList = this.mainContainer.querySelector("[data-main-navigation-list]");
    this.pages = this.mainContainer.querySelectorAll("[data-content-page]");
    this.windowWidthIsLessThanBreakpoint = window.innerWidth < this.breakpointValue;
    /** @type {NodeListOf<HTMLAnchorElement>} */
    this.pageLinks = this.navigation.querySelectorAll("[data-main-navigation-link]");
    /** @type {HTMLAnchorElement[]} */
    this.pageLinksArray = Array.from(this.pageLinks);
    this.init();
  }

  showInitPage() {
    const linkWithTheSameHash = this.pageLinksArray.find((a) => a.hash === location.hash);

    if (linkWithTheSameHash) {
      this.showPage(linkWithTheSameHash);
    } else if (location.hash === "") {
      this.showPage(this.pageLinksArray.at(0));
    }
  }

  init() {
    this.bindPageLinks();
    this.showInitPage();

    window.addEventListener("hashchange", () => this.showInitPage());

    window.addEventListener("resize", () => {
      this.windowWidthIsLessThanBreakpoint = window.innerWidth < this.breakpointValue;
    });
  }

  bindPageLinks() {
    const showPageThrottle = throttle((link) => this.showPage(link), this.ANIMATION_DURATION_TIME);

    this.pageLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        //  if (!this.windowWidthIsLessThanBreakpoint) {}

        showPageThrottle(link);
      });
    });
  }

  /** @param {HTMLAnchorElement} link */
  showPage(link) {
    const activeMenuLink = this.navigation.querySelector("[data-main-navigation-link].active");
    const prevActivePage = this.mainContainer.querySelector("[data-content-page].active");

    if (this.prevLink != link) {
      const linkHref = link?.href.split("#")[1];
      this.prevLink = link;

      window.dispatchEvent(this.changeScreenEvent);
      history.replaceState(null, null, "#" + linkHref);
    }

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

  /**  @param {number} pageNumber */
  animateNavigation(pageNumber) {
    let stylesForNavigationList = this.mainContainer.querySelector("style");

    if (!stylesForNavigationList) {
      stylesForNavigationList = document.createElement("style");
      this.mainContainer.prepend(stylesForNavigationList);
    }

    stylesForNavigationList.textContent = `#${this.mainContainer.id} [data-main-navigation-list]::after {
      left: ${pageNumber * (100.0 / this.pageLinksArray.length)}%;
    }`;
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
    }, this.ANIMATION_DURATION_TIME);
  }
}

class UPTToast {
  static SUCCESS = "success";
  static WARNING = "warning";
  static ERROR = "error";
  static INFO = "info";
  static SUCCESS_ICON = "fa-circle-check";
  static ERROR_ICON = "fa-circle-exclamation";
  static WARNING_ICON = "fa-triangle-exclamation";
  static INFO_ICON = "fa-circle-info";

  TIMER_DURATION = 6000
  TIMER_ANIMATION_DURATION = 300

  toastId = '';
  toast;
  countdown;

  /**
   * @param {string} type
   * @param {string} message
   */
  static show(type, message = "") {
    new UPTToast(`#${UPT_TOASTS_CONTAINER_ID}`).open(type, message);
  }

  /** @param {string} containerSelector */
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);

    if (!this.container) {
      console.warn("this.container is null");
      return;
    }
    this.toastId = generateId("upt-toast");
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

  /** @returns {HTMLDivElement} */
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
    this.toast.style.animation = `close ${this.TIMER_ANIMATION_DURATION / 1000.0}s cubic-bezier(.87,-1,.57,.97) forwards`;
    this.toastTimer.classList.remove("timer-animation");

    clearTimeout(this.countdown);

    setTimeout(() => {
      this.toast.style.display = "none";
      this.toast.remove();

    }, this.TIMER_ANIMATION_DURATION);
  }

  /**
   * @param {string} type
   * @param {string} message
   */
  open(type, message = "") {
    if (this.toast.style.display != "none") return;

    let toastTitle;
    let toastIcon;
    this.toast.classList.remove(UPTToast.SUCCESS, UPTToast.WARNING, UPTToast.ERROR, UPTToast.INFO);
    this.toastIcon.classList.remove(UPTToast.SUCCESS_ICON, UPTToast.WARNING_ICON, UPTToast.ERROR_ICON, UPTToast.INFO_ICON);
    this.toast.style.display = "flex";

    switch (type) {
      case UPTToast.SUCCESS:
        toastTitle = "Sukces!";
        toastIcon = UPTToast.SUCCESS_ICON;
        break;
      case UPTToast.ERROR:
        toastTitle = "Błąd!";
        toastIcon = UPTToast.ERROR_ICON;
        break;
      case UPTToast.WARNING:
        toastTitle = "Ostrzeżenie";
        toastIcon = UPTToast.WARNING_ICON;
        break;
      default:
        toastTitle = "Informacja";
        toastIcon = UPTToast.INFO_ICON;
    }

    this.toastTitle.textContent = toastTitle;
    this.toastMessage.textContent = message;
    this.toastIcon.classList.add(toastIcon);
    this.toast.classList.add(type);
    this.toast.style.animation = `open ${this.TIMER_ANIMATION_DURATION / 1000.0}s cubic-bezier(.47,.02,.44,2) forwards`;
    this.toastTimer.classList.add("timer-animation");

    clearTimeout(this.countdown);

    this.countdown = setTimeout(() => this.close(), this.TIMER_DURATION);
  }
}

class UPTModal {
  static SHOW_EVENT_NAME = "upt-show-modal";
  static HIDE_EVENT_NAME = "upt-hide-modal";
  static OPEN_EVENT_NAME = "upt-modal-is-open";
  static CLOSE_EVENT_NAME = "upt-modal-is-close";
  static START_LOADING_EVENT_NAME = "upt-start-loading-modal";
  static STOP_LOADING_EVENT_NAME = "upt-stop-loading-modal";

  /** @param {string} selector */
  constructor(selector) {
    this.selector = selector;
    this.element = document.querySelector(this.selector);
    this.triggers = document.querySelectorAll('[aria-controls="' + this.element.getAttribute("id") + '"]');
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
    document.addEventListener(UPTModal.SHOW_EVENT_NAME, (event) =>
      catchModalEvent(event, () => {
        this.showModal();
        this.initModalEvents();
      })
    );
    // hide modal when hide modal event occurs
    document.addEventListener(UPTModal.HIDE_EVENT_NAME, (event) =>
      catchModalEvent(event, () => this.closeModal())
    );

    // show loading state modal
    document.addEventListener(
      UPTModal.START_LOADING_EVENT_NAME,
      (event) =>
      catchModalEvent(event, () =>
        this.element.classList.add("modal--loading")
      )
    );

    // hide loading state modal
    document.addEventListener(UPTModal.STOP_LOADING_EVENT_NAME, (event) =>
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
    this.emitModalEvents(UPTModal.OPEN_EVENT_NAME);
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
    this.emitModalEvents(UPTModal.CLOSE_EVENT_NAME);
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
      item.setAttribute("data-pie-index", id.index || globalObj.index || idx + 1);
    });

    this._elements = elements;
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

    const progressCircle = this._querySelector(`.${pieName}-circle-${options.index}`);

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
    target.setAttribute("style", `width:${options.size}px;height:${options.size}px;`);
  }

  animationTo(options, initial = false) {
    const pieName = this._className;
    const previousConfigObj = JSON.parse(
      this._querySelector(`[data-pie-index="${options.index}"]`).getAttribute(
        "data-pie"
      )
    );

    const circleElement = this._querySelector(`.${pieName}-circle-${options.index}`);

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

  /** @param {string}pieChartContainerSelector */
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
        pieCharConicGradientValues += showAnimation ? `var(--color-${nr}) var(--opacity-${nr}),` : `${color} ${percentValue}%,`;
      } else if (index === pieChartData.length - 1) {
        pieCharConicGradientValues += showAnimation ? `var(--color-${nr}) 0 var(--opacity-${nr})` : `${color} 0 ${percentValue}%`;
      } else {
        pieCharAnimationEndOpacity += `--opacity-${nr}: ${percentValue}%;`;
        pieCharConicGradientValues += showAnimation ? `var(--color-${nr}) 0 var(--opacity-${nr}),` : `${color} 0 ${percentValue}%,`;
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

class CustomPopover extends HTMLElement {

  dataClass
  dataButtonClass
  dataContentClass
  content
  button
  isOpen = false

  constructor() {
    super()
  }

  connectedCallback() {
    const buttonTextTemplate = this.querySelector(`[slot="button-text"]`)
    const contentTemplate = this.querySelector(`[slot="content"]`)

    this.dataClass = this.getAttribute("data-class") ?? "";
    this.contentVal = contentTemplate?.innerHTML || "";
    this.buttonTextVal = buttonTextTemplate?.innerHTML || "";
    this.dataButtonClass = buttonTextTemplate.getAttribute("data-class") ?? "";
    this.dataContentClass = contentTemplate.getAttribute("data-class") ?? "";
    this.render();
    this.init();
  }

  init() {
    this.content = this.querySelector('[data-popover-content]')
    this.button = this.querySelector('[data-popover-button]')

    this.content.style.display = "none"

    this.button.addEventListener('click', (e) => {
      if (!this.isOpen) {
        this.show()
      } else {
        this.hide()
      }
    })

    document.addEventListener('click', (e) => {
      const isNotThisContent = !e.target.closest('[data-popover-content]')

      if (this.isOpen && e.target !== this.button && isNotThisContent) {
        this.hide()
      }
    })
  }

  show() {
    this.content.style.removeProperty("display")
    this.button.classList.add('active')
    this.isOpen = true
  }
  hide() {
    this.content.style.display = "none"
    this.button.classList.remove('active')
    this.isOpen = false
  }

  render() {
    this.innerHTML = `
      <div class="custom-popover ${this.dataClass}">
        <button data-popover-button class="custom-popover-button ${this.dataButtonClass}">
          ${this.buttonTextVal}
        </button>

        <div data-popover-content class="custom-popover-content ${this.dataContentClass}" role="dialog">
          ${this.contentVal}
        </div>
      </div>
    `
  }
}
customElements.define("custom-popover", CustomPopover);


class CustomSelect {
  static HIDE_VALUE = "hide"
  static CHANGE_OPTION_EVENT = "upt-custom-select-change-option"

  selectElement
  wrapper = null
  isInitialized = true
  numberOfOptions
  className

  /** @param {HTMLSelectElement} selectElement */
  constructor(selectElement) {
    this.selectElement = selectElement;
    this.numberOfOptions = selectElement.children.length;
    this.className = selectElement.dataset.className ?
      selectElement.dataset.className :
      "custom-select";
    this.createCustomElements();
    this.attachEventListeners();
    this.isInitialized = false
  }

  /** @param {() => void} callback */
  reRender(callback) {
    this.destroy()
    callback()
    this.numberOfOptions = this.selectElement.children.length;
    this.createCustomElements();
    this.attachEventListeners();
  }

  createCustomElements() {
    this.selectElement.classList.add(`${this.className}-hidden`);
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add(this.className);
    this.selectElement.parentNode.insertBefore(this.wrapper, this.selectElement);
    this.wrapper.appendChild(this.selectElement);
    this.styledSelect = document.createElement("div");
    this.styledSelect.classList.add(`${this.className}-styled`);
    const firstOption = this.selectElement.options[0]
    const firstOptionIcon = firstOption.dataset.icon

    this.styledSelect.innerHTML = `
      ${firstOptionIcon ? `<i class="fa-solid ${firstOptionIcon}"></i>` : ''}
      ${firstOption.textContent}
    `;
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

  getOptionsListElement() {
    return this.optionList
  }

  getCurrentValue() {
    const currentSelectedOption = this.optionList.querySelector("li.is-selected")

    return currentSelectedOption.getAttribute("rel")
  }

  /** @param {string | null} value */
  chooseOption(value) {
    const prevSelected = this.optionList.querySelector("li.is-selected")
    let listItem = this.optionList.querySelector(`[rel="${value}"]`)

    if (!listItem) {
      listItem = this.optionList.querySelector(`[rel="${CustomSelect.HIDE_VALUE}"]`)
    }

    this.styledSelect.innerHTML = listItem.innerHTML;
    this.styledSelect.classList.remove("active");
    this.selectElement.value = listItem.getAttribute("rel");

    prevSelected.classList.remove("is-selected");
    listItem.classList.add("is-selected");
    this.optionList.style.display = "none";

    if (!this.isInitialized) {

      this.wrapper.dispatchEvent(new CustomEvent(CustomSelect.CHANGE_OPTION_EVENT, {
        detail: {
          value: value,
          prevValue: prevSelected.getAttribute("rel")
        }
      }))
    }
  };

  /** @param {(e: CustomEvent)=> {}} callback */
  onChangeSelect(callback) {
    this.wrapper.addEventListener(CustomSelect.CHANGE_OPTION_EVENT, e => callback(e))
  }

  openSelect(e) {
    e.stopPropagation()

    document
      .querySelectorAll(`div.${this.className}-styled.active`)
      .forEach((activeStyledSelect) => {
        if (activeStyledSelect !== this.styledSelect) {
          activeStyledSelect.classList.remove("active");
          activeStyledSelect.nextElementSibling.style.display = "none";
        }
      });
    this.styledSelect.classList.toggle("active");
    this.optionList.style.display = this.styledSelect.classList.contains("active") ? "block" : "none";
  };

  attachEventListeners() {
    this.styledSelect.addEventListener("click", (e) => this.openSelect(e));
    this.styledSelect.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.openSelect(e);
      }
    });

    this.listItems.forEach((listItem) => {
      listItem.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.chooseOption(listItem.getAttribute('rel'));
        }
      });
      listItem.addEventListener("click", () => this.chooseOption(listItem.getAttribute('rel')));
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

  dataPie
  percentValue
  labelText
  size
  circle
  circle
  pieElement
  isInitialized = false;

  static get observedAttributes() {
    return ["data-percent"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.dataPie = this.getAttribute("data-pie");
    this.percent = Number(this.getAttribute("data-percent"));
    this.labelText = this.getAttribute("data-label") ?? "";
    this.size = this.getAttribute("data-size") ?? 150;
    this.render();
    this.init();
    this.isInitialized = true;
  }

  init() {
    this.pieElement = this.querySelector(".pie")
    this.circle = new CircularProgressBar("pie", {
      size: this.size,
    });
    this.circle.initial(this.pieElement);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.isInitialized && name === "data-percent" && oldValue !== newValue) {
      this.reanimateComponent(newValue);
    }
  }

  /** @param {string} percentStr */
  reanimateComponent(percentStr) {
    const index = this.pieElement.getAttribute('data-pie-index')

    this.circle.animationTo({
      index,
      percent: percentStr
    });
  }

  render() {
    this.innerHTML = `
      <div class="upt-task-details-chart circular-progress-bar">
        <div class="upt-task-details-chart pie" data-percent="${this.percent}" data-pie='${this.dataPie}' data-pie-index="0">
          <meter class="visually-hidden" id="upt-task-details-chart-label" value="${this.percent / 100.0}">${this.percent}%</meter>
        </div> 
        <label class="progress-desc" for="upt-task-details-chart-label">${this.labelText}</label>
      </div>
    `
  }
}

customElements.define("custom-circular-progress-bar", CustomCircularProgressBar);

class CustomCountdown extends HTMLElement {
  ANIMATE_ATTRIBUTE_NAME = "data-animate-now";
  ANIMATION_DURATION = 2000;

  dateEnd;
  timeUnitsToShow;
  timer;
  days;
  hours;
  minutes;
  seconds;
  elements = {};
  defaultTimeUnits = ["days", "hours", "minutes", "seconds"]
  stop

  static get observedAttributes() {
    return ["data-stop"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    const timeUnitsToShowAttr = this.getAttribute("data-time-units-to-show");
    this.dateEnd = this.getAttribute("data-date-end");
    this.stop = this.getAttribute("data-stop")
    this.timeUnitsToShow = timeUnitsToShowAttr ? JSON.parse(timeUnitsToShowAttr.replace(/'/g, '"')) : this.defaultTimeUnits;
    this.render();
    this.init();
  }

  init() {
    if (!this.dateEnd) {
      console.warn("data-date-end attribute is missing!");
      return;
    }

    this.dateEnd = new Date(this.dateEnd).getTime();

    this.calculate()

    if (!this.stop || this.stop === "false") {
      this.startCountDown()
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-stop" && oldValue !== newValue) {
      newValue === "true" ? this.stopCountDown() : this.startCountDown()
    }
  }

  stopCountDown() {
    clearInterval(this.timer)
  }

  startCountDown() {
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
      unitElement.setAttribute(this.ANIMATE_ATTRIBUTE_NAME, "");

      setTimeout(() => {
        unitElement.removeAttribute(this.ANIMATE_ATTRIBUTE_NAME);
      }, this.ANIMATION_DURATION);
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

class CustomModal extends HTMLElement {
  static NAME = "custom-modal";
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
    this.modalId = this.getAttribute(CustomModal.ATTR_ID);
    this.modalTitle = this.querySelector(`[slot="${CustomModal.SLOT_TITLE}"]`);
    this.modalTitleVal = this.modalTitle?.innerHTML || "";

    this.modalContentVal =
      this.querySelector(`[slot="${CustomModal.SLOT_CONTENT}"]`)
      ?.innerHTML || "";

    this.modalFirstFocus = this.getAttribute(CustomModal.ATTR_FIRST_FOCUS);

    this.modalFirstFocusVal = this.modalFirstFocus ?
      `${CustomModal.ATTR_FIRST_FOCUS}="${this.modalFirstFocus}"` :
      "";

    this.modalContentClass = this.getAttribute(CustomModal.ATTR_CONTENT_CLASS);
    this.modalContentClassVal = this.modalContentClass ?? "";
    this.render();
    new UPTModal(`#${this.modalId}`);
  }

  render() {
    this.innerHTML = `
        <div id="${this.modalId}" ${this.modalFirstFocusVal} class="modal modal--animate js-modal">
            <div class="modal__content modern-card ${this.modalContentClassVal}" role="alertdialog" aria-labelledby="${this.modalId}-title">
                <div class="modal__header pb-2">
                    <p ${CustomModal.ATTR_TITLE} id="${this.modalId}-title" class="upt-header">
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

customElements.define(CustomModal.NAME, CustomModal);


class UPTTaskDetails {
  static ATTR_NAME = "data-task-details-name";
  static ATTR_DESC = "data-task-details-desc";
  // static ATTR_DATE_START = "data-task-details-date-start";
  static ATTR_DATE_END = "data-task-details-date-end";
  static ATTR_TYPE = "data-task-details-type"
  static ATTR_STATUS = "data-task-details-status"
  static ATTR_CATEGORY = "data-task-details-category"
  static ATTR_CATEGORY_ICON = "data-task-details-category-icon"
  static ATTR_PRIORITY = "data-task-details-priority"
  static ATTR_CREATED_AT = "data-task-details-created-at"
  static ATTR_SUBTASKS_LIST = "data-task-details-subtasks-list"
  static ATTR_SUBTASKS_WRAPPER = "data-task-details-subtasks-wrapper"
  static ATTR_DEADLINE_TIMER = "data-task-details-deadline-timer"
  static ATTR_END_TASK_BTN = "data-task-details-end-btn"
  static ATTR_ARCHIVE_TASK_BTN = "data-task-details-archive-btn"
  static ATTR_EDIT_TASK_BTN = "data-task-details-edit-btn"
  static ATTR_RESTORE_TASK_BTN = "data-task-details-restore-btn"

  /** @type {UPTTaskDetails} */
  static instance;

  circularProgressBar = null
  currentTaskId = null
  currentTask = null

  constructor() {
    this.modalId = UPT_DETAILS_TASK_MODAL_ID
    this.modal = document.querySelector(`#${this.modalId}`)
    this.apiService = UPTApiService.getInstance()

    if (!this.modal) {
      console.error("this.modal is null");
      return;
    }
    this.editForm = UPTTaskForm.getInstance()
    this.nameElement = getElementByAttr(UPTTaskDetails.ATTR_NAME, this.modal)
    this.descElement = getElementByAttr(UPTTaskDetails.ATTR_DESC, this.modal)
    this.priorityElement = getElementByAttr(UPTTaskDetails.ATTR_PRIORITY, this.modal)
    this.typeElement = getElementByAttr(UPTTaskDetails.ATTR_TYPE, this.modal)
    this.statusElement = getElementByAttr(UPTTaskDetails.ATTR_STATUS, this.modal)
    this.createdAtElement = getElementByAttr(UPTTaskDetails.ATTR_CREATED_AT, this.modal)
    this.categoryElement = getElementByAttr(UPTTaskDetails.ATTR_CATEGORY, this.modal)
    this.dateEndElement = getElementByAttr(UPTTaskDetails.ATTR_DATE_END, this.modal)
    this.categoryIconElement = getElementByAttr(UPTTaskDetails.ATTR_CATEGORY_ICON, this.modal)
    this.subTasksListElement = getElementByAttr(UPTTaskDetails.ATTR_SUBTASKS_LIST, this.modal)
    this.subTasksWrapperElement = getElementByAttr(UPTTaskDetails.ATTR_SUBTASKS_WRAPPER, this.modal)
    this.endTaskButton = getElementByAttr(UPTTaskDetails.ATTR_END_TASK_BTN, this.modal)
    this.editTaskButton = getElementByAttr(UPTTaskDetails.ATTR_EDIT_TASK_BTN, this.modal)
    this.restoreTaskButton = getElementByAttr(UPTTaskDetails.ATTR_RESTORE_TASK_BTN, this.modal)
    this.archiveTaskButton = getElementByAttr(UPTTaskDetails.ATTR_ARCHIVE_TASK_BTN, this.modal)
    this.deadlineTimerElement = getElementByAttr(UPTTaskDetails.ATTR_DEADLINE_TIMER, this.modal)
    this.subTaskModule = new UPTSubTask(this.subTasksListElement)
    this.init()
  }

  static getInstance() {
    if (!UPTTaskDetails.instance) {
      UPTTaskDetails.instance = new UPTTaskDetails();
    }
    return UPTTaskDetails.instance;
  }

  init() {
    this.editTaskButton.addEventListener('click', (e) => {
      hideModal(this.modalId)
      this.editForm.open(UPTTaskForm.MODE_EDIT, this.currentTaskId)
    })
  }

  updateSubTasksList(e) {
    const task = this.currentTask
    const {
      id,
      isCompleted
    } = e.detail
    const updatedSubTask = task.subTasks.find(subTask => subTask.id === id)

    updatedSubTask.isCompleted = isCompleted

    this.apiService.updateTask(task.id, task)

    const completedSubTasksPercent = UPT_Utils.getPercentOfCompletedSubTasks(task)
    const everySubTaskIsCompleted = task.subTasks.every(subtask => subtask.isCompleted)

    this.circularProgressBar.setAttribute("data-percent", completedSubTasksPercent)

    // if (isCompleted) {
    //   UPTToast.show(UPTToast.SUCCESS, "Podzadanie zostało oznaczone jako wykonane!")
    // }

    if (everySubTaskIsCompleted) {
      UPTToast.show(UPTToast.SUCCESS, "Wszystkie podzadania zostały wykonane!")
    }
  }

  /** 
   * @param {UPT_Task} task
   * @param {UPT_TaskCategory | null} category
   */
  displayData(task, category = null) {
    const isTaskMain = task.type === UPT_TaskType.MAIN

    this.displayCountDown(task)
    this.displayActionButtons(task)
    this.displayDescription(task)

    this.nameElement.textContent = `Zadanie: "${task.name}"`
    this.categoryElement.textContent = category ? category.name : "Brak"
    this.categoryIconElement.className = category ? UPT_Utils.getCategoryIconClass(category) : "fa-solid fa-layer-group"
    this.typeElement.textContent = task.type
    this.createdAtElement.textContent = getFriendlyDateFormat(task.createdAt, {
      day: "numeric",
      month: "long",
      year: "numeric"
    })

    this.displayStatus(task)
    this.displayPriority(task)

    this.subTaskModule.clearSubTasksList()
    this.subTaskModule.renderSubTasksList(task.subTasks, UPTSubTask.MODE_SHOW)
    this.subTaskModule.list.addEventListener(UPTSubTask.SUBTASK_STATE_CHANGE_EVENT, (e) => this.updateSubTasksList(e))

    if (isTaskMain) {
      this.dateEndElement.classList.add("tooltip")
    } else {
      this.dateEndElement.classList.remove("tooltip")
    }

    this.dateEndElement.innerHTML = isTaskMain ?
      `
      <i class="fa-regular fa-calendar"></i> ${getFriendlyDateFormat(task.endDate, { day: "numeric", month: "short" })} 
      <i class="fa-regular fa-clock"></i> ${getHoursAndMinutes(task.endDate)}
      <span class="tooltip-content">
        ${getFriendlyDateFormat(task.endDate, { weekday: "long" })} <br>
        ${getFriendlyDateFormat(task.endDate, { day: "numeric", month: "long", year: "numeric" })} rok
        <hr class="upt-hr">
        Godzina: ${getHoursAndMinutes(task.endDate)}
      </span>
    ` :
      `
      <i class="fa-regular fa-clock"></i> ${UPT_Utils.getHoursForDailyTask(task)}
    `

    if (task.subTasks.length === 0) {
      this.subTasksWrapperElement.style.display = "none"
    } else {
      this.subTasksWrapperElement.style.removeProperty("display")
      this.displaySubTasksProgress(task)
    }
  }

  /** @param {string} taskId */
  async show(taskId) {
    showModalLoading(this.modalId)
    showModal(this.modalId)

    try {
      const task = await this.apiService.getTaskById(taskId)

      if (!task) {
        throw new Error("Nie istnieje zadanie o id: " + taskId);
      }

      const category = task.categoryId ?
        await this.apiService.getCategoryById(task.categoryId) :
        null

      this.currentTask = task
      this.currentTaskId = task.id

      this.displayData(task, category)
    } catch (e) {
      hideModal(this.modalId)
      console.error(e)
      UPTToast.show(UPTToast.ERROR, e.message)
    } finally {
      hideModalLoading(this.modalId)
    }
  }

  /**  @param {UPT_Task} task */
  displayCountDown(task) {
    const taskIsMain = task.type === UPT_TaskType.MAIN
    const timeToEndDayCountdown = document.createElement("custom-countdown");
    const now = new Date();
    const deadlineTimeUnitsToShow = taskIsMain ? "['days', 'hours', 'minutes', 'seconds']" : "['hours', 'minutes', 'seconds']"
    const deadlineDate = taskIsMain ?
      new Date(task.endDate) :
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

    this.deadlineTimerElement.querySelector("custom-countdown")?.remove()
    timeToEndDayCountdown.setAttribute("data-date-end", deadlineDate.toISOString());
    timeToEndDayCountdown.setAttribute("data-time-units-to-show", deadlineTimeUnitsToShow);

    if (task.isArchived) {
      timeToEndDayCountdown.setAttribute("data-stop", "true");
    }

    this.deadlineTimerElement.append(timeToEndDayCountdown);
  }

  /**  @param {UPT_Task} task */
  displayActionButtons(task) {
    this.endTaskButton.style.removeProperty("display")
    this.editTaskButton.style.removeProperty("display")
    this.restoreTaskButton.style.removeProperty("display")
    this.archiveTaskButton.style.removeProperty("display")

    if (task.isArchived) {
      this.endTaskButton.style.display = "none"
      this.editTaskButton.style.display = "none"
      this.archiveTaskButton.style.display = "none"
    } else {
      this.restoreTaskButton.style.display = "none"
    }
  }

  /**  @param {UPT_Task} task */
  displaySubTasksProgress(task) {
    const circularProgressBar = document.createElement("custom-circular-progress-bar");
    const completedSubTasksPercent = UPT_Utils.getPercentOfCompletedSubTasks(task)

    circularProgressBar.setAttribute("data-label", "Procent ukończonych podzadań")
    circularProgressBar.setAttribute("data-percent", completedSubTasksPercent)
    circularProgressBar.setAttribute("data-pie", JSON.stringify({
      lineargradient: ["#14a5ff", "#008be2"],
      round: true,
      percent: completedSubTasksPercent,
      colorCircle: "rgba(63, 98, 74, 0.25)"
    }))

    this.subTasksWrapperElement.querySelector("custom-circular-progress-bar")?.remove()
    this.subTasksWrapperElement.append(circularProgressBar)
    this.circularProgressBar = circularProgressBar
  }

  /**  @param {UPT_Task} task */
  displayDescription(task) {
    if (task.description !== "") {
      this.descElement.style.removeProperty("display")
      this.descElement.textContent = task.description
    } else {
      this.descElement.style.display = "none"
    }
  }

  /**  @param {UPT_Task} task */
  displayStatus(task) {
    this.statusElement.textContent = task.status
    this.statusElement.classList.remove(...UPT_Utils.getAllTaskStatusSubClasses().values())
    this.statusElement.classList.add(UPT_Utils.getTaskStatusSubClass(task))
  }

  /**  @param {UPT_Task} task */
  displayPriority(task) {
    this.priorityElement.textContent = `${task.priority} piorytet`
    this.priorityElement.classList.remove(...UPT_Utils.getAllTaskPrioritySubClasses().values())
    this.priorityElement.classList.add(UPT_Utils.getTaskPrioritySubClass(task))
  }
}


class UPTSubTask {
  static SUBTASK_STATE_CHANGE_EVENT = "upt-subtask-state-change"
  static MODE_EDIT = "edit"
  static MODE_SHOW = "show"

  subTasksArray = []
  list = null

  /** @param {HTMLElement} container */
  constructor(container) {
    this.container = container
  }

  /** 
   * @param {UPT_SubTask[]} subTasks 
   * @param {string} mode
   */
  renderSubTasksList(subTasks, mode = UPTSubTask.MODE_SHOW) {
    const subTasksNumber = subTasks.length
    const subTasksListFragment = document.createDocumentFragment()

    this.list = document.createElement('ul');
    this.list.className = "upt-task-subtasks-list subtasks-list"

    for (let i = 0; i < subTasksNumber; i++) {
      const subTask = subTasks[i]

      subTasksListFragment.append(this.renderSubTaskCard(subTask, mode))
    }
    this.list.append(subTasksListFragment)
    this.container.append(this.list)

    this.list.addEventListener('change', (event) => {
      const subTaskCheckbox = event.target
      const subTaskCard = subTaskCheckbox.closest('[data-subtask-card]')
      const subTaskData = {
        id: subTaskCheckbox.getAttribute('data-subtask-id'),
        isCompleted: subTaskCheckbox.checked
      }

      subTaskCard.classList.toggle('subtask--completed')

      this.list.dispatchEvent(new CustomEvent(UPTSubTask.SUBTASK_STATE_CHANGE_EVENT, {
        detail: subTaskData
      }))
    })
  }

  clearSubTasksList() {
    this.container.innerHTML = ""
    this.subTasksArray = []
  }

  /** @param {string} subTaskId */
  getSubTaskElement(subTaskId) {
    return this.container.querySelector(`[data-subtask-id="${subTaskId}"]`)
  }

  getAllSubTasks() {
    return this.subTasksArray
  }

  /** 
   * @param {UPT_SubTask} subTask 
   * @param {string} mode
   */
  renderSubTaskCard(subTask, mode = UPTSubTask.MODE_SHOW) {

    this.subTasksArray.push(subTask)

    const isEditMode = mode === UPTSubTask.MODE_EDIT
    const li = document.createElement("li")
    const subTaskCompleteInput = !isEditMode ? `
      <span class="task-checkbox custom-checkbox-group">
        <input data-mark-subtask-as-done id="mark-subtask-as-done-${subTask.id}" data-subtask-id="${subTask.id}" type="checkbox" ${subTask.isCompleted ? 'checked' : ''}>
        <label class="custom-checkbox-label" for="mark-subtask-as-done-${subTask.id}">
          <span class="sr-only">Oznacz jako wykonane</span>
          <span class="custom-checkbox-icon" aria-hidden="true"></span>
        </label>
      </span>
    ` : ''
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
        <input data-subtask-input-name class="floating-label-control upt-form-control" type="text" id="upt-subtask-input-name-${subTask.id}" placeholder="Nazwa Podzadania" value="${subTask.name}">
          <label class="floating-label" for="upt-subtask-input-name-${subTask.id}">Nazwa Podzadania</label> 
          <i class="upt-icon fa-solid fa-pen"></i>
      </span>
      <span class="upt-form-field">
        <input data-subtask-input-date class="floating-label-control upt-form-control" type="datetime-local" id="upt-subtask-input-date-${subTask.id}">
        <label class="floating-label" for="upt-subtask-input-date-${subTask.id}">Od kiedy</label>
      </span>
    ` :
      `
        <span data-subtask-name class="subtask-name">${subTask.name}</span>
        <span data-subtask-date class="subtask-date">${subTask.endDate ?? ''}</span>
      `

    li.className = `subtask ${subTask.isCompleted ? 'subtask--completed' : ''} task modern-card`
    li.setAttribute("data-subtask-card", "")
    li.setAttribute("data-subtask-id", subTask.id)
    li.innerHTML = `
        ${subTaskCompleteInput}
        <span class="task-content">
          <span class="task-header subtask-header">${subTaskHeaderContent}</span>
        </span>
        ${deleteSubTaskButton}                        
    `

    return li;
  }
}


// ---------------------------------------- FORMULARZE ---------------------------------------------

class UPTForm {
  static MODE_EDIT = "edit"
  static MODE_CREATE = "create"

  constructor(formId, modalId) {
    this.modalId = modalId
    /** @type {HTMLFormElement} */
    this.form = document.querySelector(`#${formId}`)
    this.apiService = UPTApiService.getInstance()

    if (!this.form) {
      console.error("form is null");
      return;
    }

    this.form.addEventListener('focusout', (e) => {
      const inputWrapper = e.target.closest('[data-form-field]')

      if (inputWrapper) {
        inputWrapper.classList.remove('error')
      }
    })
  }

  getFormData() {
    const formData = new FormData(this.form)
    const formDataObject = {};

    formData.forEach((value, key) => formDataObject[key] = value);

    return formDataObject
  }

  /** 
   * @param {string} inputName 
   * @param {string} message 
   */
  displayInputError(inputName, message) {
    const inputWrapper = this.form.querySelector(`[name="${inputName}"]`).closest('[data-form-field]')
    inputWrapper.classList.add('error')

    UPTToast.show(UPTToast.WARNING, message)
  }
}

class UPTCategoryForm extends UPTForm {
  static FIELD_NAME = "upt-category-name";
  static FIELD_DESC = "upt-category-desc"
  static FIELD_ICON = "upt-category-icon"
  static FIELD_MODE = "upt-category-form-mode"

  /** @type {UPTCategoryForm} */
  static instance;

  constructor() {
    super(UPT_CATEGORY_FORM_ID, UPT_CATEGORY_FORM_MODAL_ID)
    this.nameInput = this.form.querySelector(`input[name="${UPTCategoryForm.FIELD_NAME}"]`)
    this.descTextarea = this.form.querySelector(`textarea[name="${UPTCategoryForm.FIELD_DESC}"]`)
    this.iconSelect = this.form.querySelector(`select[name="${UPTCategoryForm.FIELD_ICON}"]`)
    this.modeInput = this.form.querySelector(`[name="${UPTCategoryForm.FIELD_MODE}"]`)
    this.renderIconsOptions()
    this.customIconSelect = new CustomSelect(this.iconSelect)

    this.init()
  }

  static getInstance() {
    if (!UPTCategoryForm.instance) {
      UPTCategoryForm.instance = new UPTCategoryForm();
    }
    return UPTCategoryForm.instance;
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e))
  }

  /** @param {object} data */
  validate(data) {
    let isValid = true

    if (data[UPTCategoryForm.FIELD_NAME] === "") {
      this.displayInputError(UPTCategoryForm.FIELD_NAME, "Nazwa nie może być pusta")
      isValid = false
    }
    if (data[UPTCategoryForm.FIELD_ICON] === CustomSelect.HIDE_VALUE) {
      this.displayInputError(UPTCategoryForm.FIELD_ICON, "Nie wybrano żadnej ikony")
      isValid = false
    }
    if (data[UPTCategoryForm.FIELD_DESC].length > 500) {
      this.displayInputError(UPTCategoryForm.FIELD_DESC, "Opis zadania nie może mieć więcej niz 500 znaków")
      isValid = false
    }

    return isValid
  }

  /** @param {SubmitEvent} e */
  handleSubmit(e) {
    e.preventDefault()
    const formData = this.getFormData()

    if (this.validate(formData)) {
      const isEditMode = formData[UPTCategoryForm.FIELD_MODE] === UPTCategoryForm.MODE_EDIT
      UPTToast.show(UPTToast.SUCCESS, `Kategoria została ${isEditMode ? 'zaktualizowana' : 'dodana'} pomyślnie!`)
      console.log(formData)
    }
  }

  /** @param {string} categoryId */
  async loadFormData(categoryId) {
    showModalLoading(this.modalId)
    let category = null

    try {
      category = await this.apiService.getCategoryById(categoryId)

      if (!category) {
        throw new Error("Nie istnieje kateogria o id: " + categoryId)
      }

    } catch (e) {
      console.error(e)
      UPTToast.show(UPTToast.ERROR, e.message)
      hideModalLoading(this.modalId)
      hideModal(this.modalId)
    } finally {
      return category
    }
  }

  /**  
   * @param {string} mode 
   * @param {string | null} categoryId
   */
  async displayData(mode, categoryId = null) {
    const isEditMode = mode === UPTCategoryForm.MODE_EDIT
    let currentCategoryIcon = null

    this.form.reset()
    this.modeInput.value = mode

    if (isEditMode) {
      const category = await this.loadFormData(categoryId)
      currentCategoryIcon = category.icon
      this.nameInput.value = category.name
      this.descTextarea.value = category.desc ?? ""
    }

    this.customIconSelect.reRender(() => this.renderIconsOptions(currentCategoryIcon))

    hideModalLoading(this.modalId)
  }

  /**  
   * @param {string} mode 
   * @param {string | null} categoryId
   */
  open(mode, categoryId = null) {
    const isEditMode = mode === UPTCategoryForm.MODE_EDIT
    const submitButton = this.form.querySelector("[data-form-submit-btn]")

    submitButton.textContent = isEditMode ? "Zapisz zmiany" : "Dodaj"

    showModal(this.modalId, isEditMode ? "Edytuj Kategorię" : "Dodaj Kategorię")

    this.displayData(mode, categoryId)
  }

  /** @param {string | null} currentIcon */
  renderIconsOptions(currentIcon = null) {
    const allCategoryIcons = UPT_Utils.getAllCategoryIcons()
    const icons = [...allCategoryIcons.keys()]
    this.iconSelect.innerHTML = `<option value="${CustomSelect.HIDE_VALUE}">Wybierz Ikonę</option>`

    icons.forEach(icon => {
      const option = document.createElement("option")
      option.value = icon
      option.setAttribute('data-icon', icon)
      option.textContent = allCategoryIcons.get(icon)

      if (currentIcon && currentIcon === icon) {
        this.iconSelect.prepend(option)
        this.iconSelect.value = icon
      } else {
        this.iconSelect.append(option)
      }
    })
  }
}

class UPTTaskForm extends UPTForm {
  static FIELD_NAME = "upt-task-name";
  static FIELD_DESC = "upt-task-desc";
  static FIELD_DATE_START = "upt-task-date-start";
  static FIELD_DATE_END = "upt-task-date-end";
  static FIELD_TYPE = "upt-task-type"
  static FIELD_CATEGORY = "upt-task-category"
  static FIELD_ALL_DAY = "upt-task-all-day"
  static FIELD_PRIORITY = "upt-task-priority"
  static FIELD_SUBTASKS = "upt-task-subtasks"
  static FIELD_MODE = "upt-task-form-mode"

  /** @type {UPTTaskForm} */
  static instance;

  constructor() {
    super(UPT_TASK_FORM_ID, UPT_TASK_FORM_MODAL_ID)
    this.subTaskModule = new UPTSubTask(this.form.querySelector("[data-subtasks-list]"))
    this.addSubTaskButton = this.form.querySelector("[data-form-add-subtask]")
    this.nameInput = this.form.querySelector(`input[name="${UPTTaskForm.FIELD_NAME}"]`)
    this.descTextarea = this.form.querySelector(`textarea[name="${UPTTaskForm.FIELD_DESC}"]`)
    this.prioritySelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_PRIORITY}"]`)
    this.typeSelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_TYPE}"]`)
    this.categorySelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_CATEGORY}"]`)
    this.modeInput = this.form.querySelector(`[name="${UPTTaskForm.FIELD_MODE}"]`)
    this.dateInputsWrappersForMain = this.form.querySelectorAll("[data-form-date-for-main")
    this.dateInputsWrappersForDaily = this.form.querySelectorAll("[data-form-date-for-daily")
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

  /** @param {CustomEvent} e */
  changeDateTypeInputs(e) {
    const {
      value,
      prevValue
    } = e.detail

    if (value && value !== prevValue) {
      const dateInputsWrappers = [...this.dateInputsWrappersForMain, ...this.dateInputsWrappersForDaily]
      const activeInputsWrappers = (wrappers) => {
        wrappers.forEach(wrapper => {
          wrapper.style.removeProperty("display")
          wrapper.querySelectorAll('input').forEach(input => input.removeAttribute("disabled"))
        })
      }
      const disableInputsWrappers = (wrappers) => {
        wrappers.forEach(wrapper => {
          wrapper.style.display = "none"
          wrapper.querySelectorAll('input').forEach(input => input.setAttribute("disabled", "true"))
        })
      }

      fadeAnimation(() => {
        if (value === UPT_TaskType.MAIN) {
          disableInputsWrappers(this.dateInputsWrappersForDaily)
          activeInputsWrappers(this.dateInputsWrappersForMain)
        } else {
          disableInputsWrappers(this.dateInputsWrappersForMain)
          activeInputsWrappers(this.dateInputsWrappersForDaily)
        }
      }, dateInputsWrappers, 200)
    }
  }

  init() {
    this.addSubTaskButton.addEventListener('click', (e) => this.addSubTask(e))
    this.form.addEventListener("submit", (e) => this.handleFormSubmit(e))
    this.typeCustomSelect.onChangeSelect(e => this.changeDateTypeInputs(e))
  }

  /**
   * @param {UPT_TaskCategory[]} categories
   * @param {UPT_Task | null} task 
   */
  renderCategoryOptions(categories, task = null) {
    this.categorySelect.innerHTML = `
      <option value="${CustomSelect.HIDE_VALUE}">Wybierz Kategorie</option>
      <option value="null">Brak Kategorii</option>
    `

    categories.forEach(category => {
      const option = document.createElement("option")
      option.value = category.id
      option.setAttribute('data-icon', category.icon)
      option.textContent = category.name

      if (task && category.id === task.categoryId) {
        this.categorySelect.prepend(option)
        this.categorySelect.value = category.id
      } else {
        this.categorySelect.append(option)
      }
    })
  }

  resetForm() {
    this.form.reset()
    this.subTaskModule.clearSubTasksList()
    this.priorityCustomSelect.chooseOption(null)
    this.typeCustomSelect.chooseOption(UPT_TaskType.DAILY)
    this.categoryCustomSelect.chooseOption(null)
  }

  /** 
   * @param {string} mode 
   * @param {string | null} taskId
   */
  async displayFormData(mode, taskId) {
    const isEditMode = mode === UPTTaskForm.MODE_EDIT

    if (isEditMode) showModalLoading(this.modalId)

    this.resetForm()

    const {
      task,
      categories
    } = await this.loadFormData(taskId)

    if (isEditMode) {
      const dateInputType = task.type === UPT_TaskType.MAIN ? "datetime-local" : "time"
      const dateStartInput = this.form.querySelector(`input[name="${UPTTaskForm.FIELD_DATE_START}"][type="${dateInputType}"]`)
      const dateEndInput = this.form.querySelector(`input[name="${UPTTaskForm.FIELD_DATE_END}"][type="${dateInputType}"]`)
      const getDateFormatForInput = (dateStr) => {
        if (!dateStr) return ''

        const date = new Date(dateStr);
        const fullDate = date.toISOString().slice(0, 16)
        const hoursAndMinutes = getHoursAndMinutes(dateStr)

        return dateInputType === "time" ? hoursAndMinutes : fullDate
      }

      this.subTaskModule.renderSubTasksList(task.subTasks ?? [], UPTSubTask.MODE_EDIT)
      this.nameInput.value = task.name
      this.typeSelect.value = task.type
      this.descTextarea.value = task.description ?? ''
      this.prioritySelect = task.priority
      dateStartInput.value = getDateFormatForInput(task.startDate)
      dateEndInput.value = getDateFormatForInput(task.endDate)
      this.priorityCustomSelect.chooseOption(task.priority)
      this.typeCustomSelect.chooseOption(task.type)
      this.categoryCustomSelect.chooseOption(task.categoryId)
    }
    this.modeInput.value = mode
    this.categoryCustomSelect.reRender(() => this.renderCategoryOptions(categories, task))

    if (isEditMode) hideModalLoading(this.modalId)
  }

  /** @param {string} taskId */
  async loadFormData(taskId) {
    let task = null 
    let categories = null

    try {
      if (taskId) {
        task = await this.apiService.getTaskById(taskId)
      }
      categories = await this.apiService.getCategories()

      if (!task && taskId) {
        throw new Error("Nie istnieje zadanie o id: " + taskId);
      }
    } catch (e) {
      hideModal(this.modalId)
      console.error(e)
      UPTToast.show(UPTToast.ERROR, e.message)
    } finally {
      return {
        task,
        categories
      }
    }
  }

  /** 
   * @param {string} mode 
   * @param {string | null} taskId
   */
  async open(mode, taskId = null) {
    const isEditMode = mode === UPTTaskForm.MODE_EDIT
    const submitButton = this.form.querySelector("[data-form-submit-btn]")

    submitButton.textContent = isEditMode ? "Zapisz zmiany" : "Dodaj"

    showModal(this.modalId, isEditMode ? "Edytuj Zadanie" : "Dodaj Zadanie")

    this.displayFormData(mode, taskId)
  }

  addSubTask(e) {
    e.preventDefault()

    const newSubTask = new UPT_SubTask(generateId("subtask-"), "")
    const newSubTaskCard = this.subTaskModule.renderSubTaskCard(newSubTask, UPTSubTask.MODE_EDIT)

    if (!this.subTaskModule.list) {
      this.subTaskModule.renderSubTasksList([])
    }
    this.subTaskModule.list.append(newSubTaskCard)
  }

  /** @param {object} data */
  validateForm(data) {
    let isValid = true 
    const formSubTasks = this.subTaskModule.getAllSubTasks() 
    const checkInputField = (inputName, message) => {
      const value = data[inputName]

      if (value.trim() === "" || value === CustomSelect.HIDE_VALUE) {
        this.displayInputError(inputName, message)
        isValid = false
      }
    }
    checkInputField(UPTTaskForm.FIELD_NAME, "Nazwa nie może być pusta")
    checkInputField(UPTTaskForm.FIELD_TYPE, "Nie wybrano typu zadania")
    checkInputField(UPTTaskForm.FIELD_PRIORITY, "Nie wybrano piorytetu zadania")
    // checkInputField(UPTTaskForm.FIELD_CATEGORY, "Nie wybrano kategorii")
    checkInputField(UPTTaskForm.FIELD_DATE_START, "Nie podano daty rozpoczęcia")
    checkInputField(UPTTaskForm.FIELD_DATE_END, "Nie podano daty zakończenia")

    if (data[UPTTaskForm.FIELD_DESC].length > 500) {
      this.displayInputError(UPTTaskForm.FIELD_DESC, "Opis zadania nie może mieć więcej niz 500 znaków")
      isValid = false
    }

    formSubTasks.forEach((subTask, index) => {
      checkInputField(subTask.name, `Nazwa podzadania #${index + 1} nie może być pusta`)
    })

    return isValid
  }

  handleFormSubmit(e) {
    e.preventDefault()
    const formData = this.getFormData()
    const subTaskCards = this.subTaskModule.container.querySelectorAll("[data-subtask-card]")
    const isEditMode = this.modeInput.value === UPTTaskForm.MODE_EDIT

    formData[UPTTaskForm.FIELD_SUBTASKS] = []

    subTaskCards.forEach(card => {
      const subTaskId = card.dataset.subtaskId
      const subTaskName = card.querySelector("[data-subtask-input-name]")
      const subTaskDate = card.querySelector("[data-subtask-input-date]")

      formData[UPTTaskForm.FIELD_SUBTASKS].push({
        id: subTaskId,
        name: subTaskName.value,
        startDate: subTaskDate.value ?? null
      })
    })

    if (this.validateForm(formData)) {

      UPTToast.show(UPTToast.SUCCESS, `Zadanie zostało ${isEditMode ? 'zaktualizowane' : 'dodane'}!`)
    }

    console.log(formData)
  }
}


// ---------------------------------------- ZAKŁADKI ---------------------------------------------


class UPTPanel {

  /**
   * @param {string} selector
   * @param {{ tasks: UPT_Task[], categories: UPT_TaskCategory[] }}
   */
  constructor(selector, {
    tasks,
    categories
  }) {
    this.panel = document.querySelector(selector);
    this.tasks = UPT_Utils.sortTasksByPriority(tasks);
    this.categories = categories;
    this.apiService = UPTApiService.getInstance();
    this.taskForm = UPTTaskForm.getInstance()
    this.categoryForm = UPTCategoryForm.getInstance()
    this.taskDetails = UPTTaskDetails.getInstance()

    if (!this.panel) {
      console.error("this.panel is null");
      return;
    }
    CustomSelect.initAll(selector + " select[data-custom-select]");
    this.setClickEventListeners()

    hideLoading(this.panel);
  }

  /** @param {UPT_Task} task */
  getCategoryByTask = (task) => this.categories.find((cat) => cat.id === task.categoryId)

  setClickEventListeners() { 
    const actionsMap = {
      "data-add-task-button": () => this.taskForm.open(UPTTaskForm.MODE_CREATE),
      "data-add-category-button": () => this.categoryForm.open(UPTCategoryForm.MODE_CREATE),
      "data-edit-task-btn": (target) => this.taskForm.open(UPTTaskForm.MODE_EDIT, target.dataset.taskId),
      "data-details-task-btn": (target) => this.taskDetails.show(target.dataset.taskId),
      "data-details-task-link": (target) => this.taskDetails.show(target.getAttribute("href").substring(1)),
      "data-delete-task-btn": (target) => this.handleDeleteTaskButton(target),
      "data-edit-category-btn": (target) => this.categoryForm.open(UPTCategoryForm.MODE_EDIT, target.dataset.categoryId),
      "data-delete-category-btn": (target) => this.handleDeleteCategoryButton(target),
    };

    this.panel.addEventListener("click", (e) => {
      e.preventDefault()

      const target = e.target;

      for (const [attr, action] of Object.entries(actionsMap)) {
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

        UPTToast.show(UPTToast.SUCCESS, "Pomyślnie usunięto zadanie");

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
      //   UPTToast.show(UPTToast.SUCCESS, "Pomyślnie usunięto kategorię"); 
      //   hideLoading(e.target);
      // })

      setTimeout(() => {
        removeDataCard(categoryCard);
        hideModal(UPT_CONFIRM_MODAL_ID);
        UPTToast.show(UPTToast.SUCCESS, "Pomyślnie usunięto zadanie");
        hideLoading(e.target);

      }, 2000);
    };
  }
}

class UPTMainPanel extends UPTPanel {
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

      if (i >= UPTMainPanel.CATEGORIES_DISPLAY_NUMBER - 1) break;

      const li = document.createElement("li"); 

      li.innerHTML = `
        <a href="#kategorie" class="task-category-link link variant4"> 
          <i class="task-category-link-icon ${UPT_Utils.getCategoryIconClass(category)}" aria-hidden="true"></i>
          <span>${category.name}</span>
        </a>
      `;

      categoriesListFragment.append(li);
    }

    categoriesList.append(categoriesListFragment);
  }

  renderTasksList() {
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
        (taskIsMain && mainTasksDisplayedNumber >= UPTMainPanel.TASKS_DISPLAY_NUMBER) ||
        (!taskIsMain && dailyTasksDisplayedNumber >= UPTMainPanel.TASKS_DISPLAY_NUMBER)
      ) {
        continue;
      }

      const li = this.renderTask(task)

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

  renderTask(task) {
    const taskIsMain = task.type === UPT_TaskType.MAIN;
    const li = document.createElement("li");
    const category = this.getCategoryByTask(task);
    const taskPrioritySubClass = UPT_Utils.getTaskPrioritySubClass(task);
    const taskRepeatIcon = !taskIsMain ? '<i class="fa-solid fa-rotate"></i>' : "";
    const taskDateInfo = taskIsMain ? `
      <span class="task-date tooltip">
        <i class="fa-regular fa-calendar"></i> ${getFriendlyDateFormat(task.endDate, { day: "numeric", month: "short" })} 
        <i class="fa-regular fa-clock"></i> ${getHoursAndMinutes(task.endDate)}
        <span class="tooltip-content">
          ${getFriendlyDateFormat(task.endDate, { weekday: "long" })} <br>
          ${getFriendlyDateFormat(task.endDate, { day: "numeric", month: "long", year: "numeric" })} rok
          <hr class="upt-hr">
          Godzina: ${getHoursAndMinutes(task.endDate)}
        </span>                                                                                                                             
      </span>
    ` : `
      <span class="task-date">
        <span class="task-date-hours"><i class="fa-regular fa-clock"></i> ${UPT_Utils.getHoursForDailyTask(task)}</span>                                                                                                                                           
      </span>
    `

    li.className = "task modern-card modern-card--opacity";
    li.setAttribute("data-task-id", task.id);
    li.setAttribute("data-task-card", "");

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
            ${task.priority} piorytet
          </span>

          <span class="task-header">
              <span class="task-name">
                <i class="${UPT_Utils.getCategoryIconClass(category)}"></i> 
                <a href="#${task.id}" data-details-task-link data-task-name>${task.name}</a> ${taskRepeatIcon}
              </span> 
              ${taskDateInfo}
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

    return li
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

class UPTCategoryPanel extends UPTPanel {
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
    li.innerHTML = `
      <span class="category-card-header">
        <span class="category-card-name">
            <i class="category-card-icon ${UPT_Utils.getCategoryIconClass(category)}"></i>
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

class UPTTasksPanel extends UPTPanel {
  
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
    toggleButton.textContent = isCurrentTypeDaily ? "Pokaż zadania dzienne" : "Pokaż zadania główne"

    fadeAnimation(() => {
      taskCards.forEach(taskCard => {
        taskCard.style.removeProperty("display")

        if (taskCard.getAttribute("data-task-type") === currentType) {
          taskCard.style.display = "none"
        } else {
          taskCard.style.display = "block"
        }
      })

    }, this.tasksList, UPTCategoryPanel.TOGGLE_ANIMATION_DURATION)

    fadeAnimation(() => {
      this.currentTypeTitleEl.textContent = isCurrentTypeDaily ? "Zadania Główne" : "Zadania Dzienne"

    }, this.currentTypeTitleEl, UPTCategoryPanel.TOGGLE_ANIMATION_DURATION)
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
      const taskPrioritySubClass = UPT_Utils.getTaskPrioritySubClass(task);
      const taskRepeatIcon = !taskIsMain ? '<i class="fa-solid fa-rotate"></i>' : "";
      const taskDescription =
        task.description && task.description !== "" ?
        `<p class="task-card-short-desc">${task.description}</p>` :
        "";
      const taskDateInfo = taskIsMain ? `
        <span class="task-date tooltip">
          <i class="fa-regular fa-calendar"></i> ${getFriendlyDateFormat(task.endDate, { day: "numeric", month: "short" })} 
          <i class="fa-regular fa-clock"></i> ${getHoursAndMinutes(task.endDate)}
          <span class="tooltip-content">
            ${getFriendlyDateFormat(task.endDate, { weekday: "long" })} <br>
            ${getFriendlyDateFormat(task.endDate, { day: "numeric", month: "long", year: "numeric" })} rok
            <hr class="upt-hr">
            Godzina: ${getHoursAndMinutes(task.endDate)}
          </span>                                                                                                                                          
       </span>
     ` : `
       <span class="task-date">
         <span class="task-date-hours"><i class="fa-regular fa-clock"></i> ${UPT_Utils.getHoursForDailyTask(task)}</span>                                                                                                                                           
       </span>
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
          <span class="task-priority task-card-priority ${taskPrioritySubClass}">${task.priority} piorytet</span>

          <p class="task-name task-card-name">
            <i class="task-icon ${UPT_Utils.getCategoryIconClass(category)}"></i>
            <a href="#${task.id}" data-details-task-link data-task-name>${task.name}</a> ${taskRepeatIcon}
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
        ${taskDateInfo} 
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

class UPTArchivePanel extends UPTPanel {
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

      if (!task.isArchived || task.type === UPT_TaskType.DAILY) {
        continue;
      }

      const li = document.createElement("li");
      const category = this.getCategoryByTask(task);
      const taskPrioritySubClass = UPT_Utils.getTaskPrioritySubClass(task);

      li.setAttribute("data-task-id", task.id);
      li.setAttribute("data-task-card", "");
      li.className = "task-archive category-card modern-card";

      li.innerHTML = ` 
         <span class="task-archive-header">
          <span class="task-priority ${taskPrioritySubClass}">
            ${task.priority} piorytet
          </span>
          <span class="task-archive-name category-card-name">
            <i class="category-card-icon ${UPT_Utils.getCategoryIconClass(category)}"></i>
            <a href="#${task.id}" data-details-task-link data-task-name>${task.name}</a> 
          </span>
        </span>                                                 
        <span class="category-card-createAt">
          Zarchiwizowano: ${formatDate(task.archivedAt)}
        </span>
        <span class="task-archive-actions category-card-actions">
          <button data-details-task-btn data-task-id="${task.id}" class="category-card-action-btn tooltip">
            <i class="fa-solid fa-info"></i>
            <span class="tooltip-content">Szczegóły Zadania</span>
          </button>
          <button data-restore-task-btn data-task-id="${task.id}" class="category-card-action-btn tooltip">
            <i class="fa-solid fa-rotate-right"></i>
            <span class="tooltip-content">Przywróć Zadanie</span>
          </button>
          <button data-delete-task-btn data-task-id="${task.id}" class="category-card-action-btn category-card-delete-btn tooltip">
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