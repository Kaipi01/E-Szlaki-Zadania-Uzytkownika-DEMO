class UPTDateTimeStatisics {

  /**  @param {string} containerSelector */
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
  }

  bindPageLinks() {
    const showPageThrottle = UPT_Utils.throttle((link) => this.showPage(link), this.ANIMATION_DURATION_TIME);

    this.pageLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
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
    this.toastId = UPT_Utils.generateId("upt-toast");
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
    // this.toast.style.display = "flex";
    this.toast.style.removeProperty('display')

    switch (type) {
      case UPTToast.SUCCESS:
        toastTitle = "Sukces!";
        toastIcon = UPTToast.SUCCESS_ICON;
        break;
      case UPTToast.ERROR:
        toastTitle = "Niepowodzenie!";
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
    document.addEventListener(UPTModal.START_LOADING_EVENT_NAME, (event) =>
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
          self.UPT_Utils.showModal();
          self.initModalEvents();
        });
      }
    }

    // listen to the openModal event -> open modal without a trigger button
    this.element.addEventListener("upt-open-modal", function (event) {
      if (event.detail) self.selectedTrigger = event.detail;
      self.UPT_Utils.showModal();
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
  /** @param {Event} event */
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
  /** @param {Event} event */
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
  /**  @param {Event} event */
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
  /** @param {NodeListOf<Element>} elements */
  getFirstVisible(elements) {
    //get first visible focusable element inside the modal
    for (var i = 0; i < elements.length; i++) {
      if (this.isVisible(elements[i])) {
        this.firstFocusable = elements[i];
        break;
      }
    }
  }
  /** @param {NodeListOf<Element>} elements */
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
    this.animationTo({ ...options, element: progressCircle, }, true);

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

  _createNSElement = (type) => document.createElementNS("http://www.w3.org/2000/svg", type);

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

    // create tspan element with number and insert to svg text element
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
  static ID = "user-private-tasks-module-custom-pie-chart"

  /** @param {string}pieChartContainerSelector */
  constructor(pieChartContainerSelector) {
    this.pieChartContainerSelector = pieChartContainerSelector;
    this.container = document.querySelector(this.pieChartContainerSelector);

    if (!this.container) {
      console.warn(`${pieChartContainerSelector} element not found!`);
    } else {
      this.pieChart = this.container.querySelector("[data-pie-chart-appearance]");
      this.pieData = JSON.parse(this.pieChart.getAttribute("data-pie"));
      this.pieChartTitle = this.container.getAttribute("data-title")
      this.legendFigcaption = null
      this.init();
    }
  }

  getAppearance() {
    return this.pieChart
  }

  reRender(callback = () => {}) {
    callback()
    const stylesPieChart = document.head.querySelector(`style#${CustomPieChart.ID}`)
    stylesPieChart?.remove()
    this.legendFigcaption?.remove()
    this.pieData = JSON.parse(this.pieChart.getAttribute("data-pie"));
    this.renderStylesForPieChart()
    this.generateLegendForPieChart();
    this.pieChart.style.animation = 'none';
    this.pieChart.offsetHeight
    this.pieChart.style.removeProperty('animation')
  }

  init() {
    this.renderStylesForPieChart()
    this.generateLegendForPieChart();
  }

  renderStylesForPieChart() {

    const stylesPieChart = document.createElement("style");

    stylesPieChart.id = CustomPieChart.ID
    stylesPieChart.textContent = this.generateCSSForPieChart();

    document.head.append(stylesPieChart);
  }

  generateLegendForPieChart() {
    this.legendFigcaption = document.createElement("figcaption");
    this.legendFigcaption.className = "legends";

    this.pieData.data.forEach((data) => {
      const {
        percent,
        label
      } = data;
      const item = document.createElement("span");
      item.className = "legend-item";
      item.textContent = `${label} ${percent}%`;
      this.legendFigcaption.append(item);
    });

    if (this.pieChartTitle) {
      const titleSpan = document.createElement('span')
      titleSpan.textContent = this.pieChartTitle
      titleSpan.className = "legend-title"
      this.legendFigcaption.append(titleSpan)
    }

    this.container.append(this.legendFigcaption);
  }

  generateCSSForPieChart() {
    const pieChartData = this.pieData.data;
    const {
      animate,
      animationSpeed
    } = this.pieData;
    const showAnimation = animate && "registerProperty" in CSS;
    const sumOfPercents = this.pieData.data.reduce((value, obj) => obj.percent + value, 0)

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

    let pieChartConicGradientBg = sumOfPercents === 0 ? '' : `background-image: conic-gradient(from 30deg, ${pieCharConicGradientValues});`

    return `
              ${pieCharCSSOpacityProperties}
  
              ${this.pieChartContainerSelector} {
                  ${pieCharColors} 
              } 
              ${this.pieChartContainerSelector} .pie-chart {
                  ${pieChartConicGradientBg}  
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
      <div data-custom-popover class="custom-popover ${this.dataClass}">
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
  static NULL_VALUE = "null"
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
  dataDisabled

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
    this.dataDisabled = this.getAttribute("data-disabled")
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

    if (this.dataDisabled) {
      wrapper.setAttribute("data-disabled", this.dataDisabled)
    }

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
  display(days, hours, minutes, seconds) {
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

class CustomSearchForm extends HTMLElement {
  static SEARCH_EVENT = "custom-search-form-search-event"

  constructor() {
    super();
    this.dataId = null
    this.forPanel = null
    this.form = document.createElement('form')
    this.button = document.createElement('button')
    this.input = document.createElement('input')
  }

  connectedCallback() {
    this.dataId = this.getAttribute("data-id") ?? UPT_Utils.generateId('input-search-');
    this.forPanel = this.getAttribute("data-for-panel")
    this.render();
    this.init()
  }

  init() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault()
      UPT_Utils.dispatchCustomEvent(CustomSearchForm.SEARCH_EVENT, {
        value: this.input.value,
        panel: this.forPanel
      })
    })

    this.input.addEventListener('search', (e) => {
      UPT_Utils.dispatchCustomEvent(CustomSearchForm.SEARCH_EVENT, {
        value: this.input.value,
        panel: this.forPanel
      })
    })
  }

  render() {
    const inputBox = document.createElement('div')
    const inputLabel = document.createElement('label')

    inputLabel.className = "floating-label"
    inputLabel.setAttribute('for', this.dataId)
    inputLabel.textContent = "Szukaj"
    inputBox.className = "upt-search-box"

    this.form.className = "upt-search-form"

    this.button.className = "upt-search-btn link variant2"
    this.button.type = "submit"
    this.button.innerHTML = `
      <i class="upt-icon fa-solid fa-magnifying-glass"></i>
      <span class="sr-only">Szukaj</span>
    `
    this.input.id = this.dataId
    this.input.type = "search"
    this.input.name = "input-search"
    this.input.placeholder = "Szukaj"
    this.input.className = "floating-label-control upt-form-control"

    inputBox.append(this.input)
    inputBox.append(inputLabel)
    this.form.append(this.button)
    this.form.append(inputBox)
    this.append(this.form)
  }
}

customElements.define("custom-search-form", CustomSearchForm);

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
  static ATTR_DESC_CONTAINER = "data-task-details-desc-container"; 
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
  static ATTR_REMOVE_TASK_BTN = "data-task-details-remove-btn"

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
    this.nameElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_NAME, this.modal)
    this.descElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_DESC, this.modal)
    this.descContainerElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_DESC_CONTAINER, this.modal)
    this.priorityElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_PRIORITY, this.modal)
    this.typeElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_TYPE, this.modal)
    this.statusElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_STATUS, this.modal)
    this.createdAtElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_CREATED_AT, this.modal)
    this.categoryElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_CATEGORY, this.modal)
    this.dateEndElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_DATE_END, this.modal)
    this.categoryIconElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_CATEGORY_ICON, this.modal)
    this.subTasksListElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_SUBTASKS_LIST, this.modal)
    this.subTasksWrapperElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_SUBTASKS_WRAPPER, this.modal)
    this.endTaskButton = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_END_TASK_BTN, this.modal)
    this.editTaskButton = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_EDIT_TASK_BTN, this.modal)
    this.restoreTaskButton = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_RESTORE_TASK_BTN, this.modal)
    this.archiveTaskButton = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_ARCHIVE_TASK_BTN, this.modal)
    this.deadlineTimerElement = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_DEADLINE_TIMER, this.modal)
    this.removeTaskButton = UPT_Utils.getElementByAttr(UPTTaskDetails.ATTR_REMOVE_TASK_BTN, this.modal)
    this.subTaskModule = new UPTSubTasksList(this.subTasksListElement)
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
      UPT_Utils.hideModal(this.modalId)
      this.editForm.open(UPTTaskForm.MODE_EDIT, this.currentTaskId)
    })

    this.endTaskButton.addEventListener('click', async (e) => {
      UPT_Utils.showLoading(this.endTaskButton) 
      UPTPanel.markTaskAsComplete(this.currentTask) 
      UPT_Utils.hideLoading(this.endTaskButton)
      UPT_Utils.hideModal(this.modalId)
    })

    this.removeTaskButton.addEventListener('click', (e) => {
      UPTPanel.deleteTask(this.currentTask.id, () => {
        UPT_Utils.hideModal(this.modalId)
      })
    })

    this.restoreTaskButton.addEventListener('click', (e) => {
      UPTPanel.restoreTask(this.currentTask.id, this.restoreTaskButton, () => {
        UPT_Utils.hideModal(this.modalId)
        UPTToast.show(UPTToast.SUCCESS, "Pomyślnie przywrócono zadanie");
      })
    })

    this.archiveTaskButton.addEventListener('click', (e) => {
      UPTPanel.archiveTask(this.currentTask.id, this.archiveTaskButton, () => {
        UPT_Utils.hideModal(this.modalId)
        UPTToast.show(UPTToast.SUCCESS, "Pomyślnie archiwizowano zadanie");
      })
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
    const isTaskCompleted = task.status === UPT_TaskStatus.COMPLETED
    const isTaskAbandoned = task.status === UPT_TaskStatus.ABANDONED
    const renderSubTasksMode = (task.isArchived || isTaskCompleted || isTaskAbandoned) ? UPTSubTasksList.MODE_SHOW_DISABLED : UPTSubTasksList.MODE_SHOW

    this.displayCountDown(task)
    this.displayActionButtons(task)
    this.displayDescription(task)

    this.nameElement.textContent = `Zadanie: "${task.name}"`
    this.categoryElement.textContent = category ? category.name : "Brak"
    this.categoryIconElement.className = category ? UPT_Utils.getCategoryIconClass(category) : "fa-solid fa-layer-group"
    this.typeElement.textContent = task.type
    this.createdAtElement.textContent = UPT_Utils.getFriendlyDateFormat(task.createdAt, {
      day: "numeric",
      month: "long",
      year: "numeric"
    })

    this.displayStatus(task)
    this.displayPriority(task)

    this.subTaskModule.clearSubTasksList()
    this.subTaskModule.renderSubTasksList(task.subTasks, renderSubTasksMode, task.type)
    this.subTaskModule.list.addEventListener(UPTSubTasksList.SUBTASK_STATE_CHANGE_EVENT, (e) => this.updateSubTasksList(e))

    if (isTaskMain) {
      this.dateEndElement.classList.add("tooltip")
    } else {
      this.dateEndElement.classList.remove("tooltip")
    }

    this.dateEndElement.innerHTML = isTaskMain ?
      `
      <i class="fa-regular fa-calendar"></i> ${UPT_Utils.getFriendlyDateFormat(task.endDate, { day: "numeric", month: "short" })} 
      <i class="fa-regular fa-clock"></i> ${UPT_Utils.getHoursAndMinutes(task.endDate)}
      <span class="tooltip-content">
        ${UPT_Utils.getFriendlyDateFormat(task.endDate, { weekday: "long" })} <br>
        ${UPT_Utils.getFriendlyDateFormat(task.endDate, { day: "numeric", month: "long", year: "numeric" })} rok
        <hr class="upt-hr">
        Godzina: ${UPT_Utils.getHoursAndMinutes(task.endDate)}
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
    UPT_Utils.showModalLoading(this.modalId)
    UPT_Utils.showModal(this.modalId)

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
      UPT_Utils.hideModal(this.modalId)
      console.error(e)
      UPTToast.show(UPTToast.ERROR, e.message)
    } finally {
      UPT_Utils.hideModalLoading(this.modalId)
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

    if (task.isArchived || task.status === UPT_TaskStatus.COMPLETED || task.status === UPT_TaskStatus.ABANDONED) {
      timeToEndDayCountdown.setAttribute("data-stop", "true");
      timeToEndDayCountdown.setAttribute("data-disabled", "true")
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

    if (task.type === UPT_TaskType.DAILY) {
      this.archiveTaskButton.style.display = "none"
    }

    if (task.status === UPT_TaskStatus.COMPLETED) {
      this.endTaskButton.style.display = "none"
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

    if (!task.description || task.description.trim() === "") {
      this.descContainerElement.style.display = "none"
    } else {
      this.descContainerElement.style.removeProperty("display")
      this.descElement.textContent = task.description
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


class UPTSubTasksList {
  static SUBTASK_STATE_CHANGE_EVENT = "upt-subtask-state-change"
  static MODE_EDIT = "edit"
  static MODE_SHOW = "show"
  static MODE_SHOW_DISABLED = "show-disabled"

  subTasksArray = []
  list = null

  /** @param {HTMLElement} container */
  constructor(container) {
    this.container = container
    this.setEventListeners()
  }

  setEventListeners() {
    this.container.addEventListener('input', (e) => {
      const input = e.target

      if (input.hasAttribute('data-subtask-input-date')) {

        if (input.type === "time") {
          input.setAttribute('data-daily-value', input.value)
        } else {
          input.setAttribute('data-main-value', input.value)
        }
      }
    })
  }

  /** 
   * @param {UPT_SubTask[]} subTasks 
   * @param {string} mode
   * @param {string} taskType
   */
  renderSubTasksList(subTasks, mode = UPTSubTasksList.MODE_SHOW, taskType) {
    const subTasksNumber = subTasks.length
    const subTasksListFragment = document.createDocumentFragment()

    this.list = document.createElement('ul');
    this.list.className = "upt-task-subtasks-list subtasks-list"

    for (let i = 0; i < subTasksNumber; i++) {
      const subTask = subTasks[i]
      const subTaskCard = this.renderSubTaskCard(subTask, mode, taskType)

      subTasksListFragment.append(subTaskCard)
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

      this.list.dispatchEvent(new CustomEvent(UPTSubTasksList.SUBTASK_STATE_CHANGE_EVENT, {
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

  getAllSubTaskDateInputs() {
    return this.container.querySelectorAll('[data-subtask-input-date]')
  }

  getAllSubTaskCards() {
    return this.container.querySelectorAll("[data-subtask-card]")
  }

  getAllSubTasks() {
    return this.subTasksArray
  }

  /** 
   * @param {UPT_SubTask} subTask 
   * @param {string} mode
   */
  renderSubTaskCard(subTask, mode = UPTSubTasksList.MODE_SHOW, taskType = UPT_TaskType.MAIN) {

    this.subTasksArray.push(subTask)

    const isTaskMain = taskType === UPT_TaskType.MAIN
    const isEditMode = mode === UPTSubTasksList.MODE_EDIT
    const isDisabledMode = mode === UPTSubTasksList.MODE_SHOW_DISABLED
    const inputDateType = isTaskMain ? "datetime-local" : "time"
    const subTaskDateForInput = UPT_Utils.getDateFormatForInput(subTask.startDate, inputDateType)

    const li = document.createElement("li")
    const subTaskCompleteInput = !isEditMode ? `
      <span class="task-checkbox custom-checkbox-group" ${isDisabledMode ? 'data-disabled' : ''}>
        <input ${isDisabledMode ? 'disabled' : ''} data-mark-subtask-as-done id="mark-subtask-as-done-${subTask.id}" data-subtask-id="${subTask.id}" type="checkbox" ${subTask.isCompleted ? 'checked' : ''}>
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
        <input data-subtask-input-date class="floating-label-control upt-form-control" value="${subTaskDateForInput}" type="${inputDateType}" id="upt-subtask-input-date-${subTask.id}">
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
    this.submitButton = this.form.querySelector("[data-form-submit-btn]")

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
   * @param {string | null} inputName 
   * @param {string} message 
   */
  displayInputError(inputName, message) {

    if (inputName) {
      const inputWrapper = this.form.querySelector(`[name="${inputName}"]`).closest('[data-form-field]')
      inputWrapper.classList.add('error')
    }

    UPTToast.show(UPTToast.WARNING, message)
  }
}

class UPTCategoryForm extends UPTForm {
  static FIELD_NAME = "upt-category-name";
  static FIELD_DESC = "upt-category-desc"
  static FIELD_ICON = "upt-category-icon"
  static FIELD_MODE = "upt-category-form-mode"
  static FIELD_ID = "upt-category-id"

  /** @type {UPTCategoryForm} */
  static instance;

  constructor() {
    super(UPT_CATEGORY_FORM_ID, UPT_CATEGORY_FORM_MODAL_ID)
    this.nameInput = this.form.querySelector(`input[name="${UPTCategoryForm.FIELD_NAME}"]`)
    this.descTextarea = this.form.querySelector(`textarea[name="${UPTCategoryForm.FIELD_DESC}"]`)
    this.iconSelect = this.form.querySelector(`select[name="${UPTCategoryForm.FIELD_ICON}"]`)
    this.modeInput = this.form.querySelector(`[name="${UPTCategoryForm.FIELD_MODE}"]`)
    this.idInput = this.form.querySelector(`[name="${UPTCategoryForm.FIELD_ID}"]`)
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
    this.submitButton.addEventListener("click", (e) => this.handleSubmit(e))
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
  async handleSubmit(e) {
    e.preventDefault()
    const formData = this.getFormData()
    const formIsValid = this.validate(formData)
    const isEditMode = formData[UPTCategoryForm.FIELD_MODE] === UPTCategoryForm.MODE_EDIT
    let categoryId = formData[UPTCategoryForm.FIELD_ID]
    let eventName

    if (formIsValid) {
      UPT_Utils.showLoading(e.target)

      const category = new UPT_TaskCategory(
        '',
        formData[UPTCategoryForm.FIELD_NAME],
        formData[UPTCategoryForm.FIELD_DESC],
        formData[UPTCategoryForm.FIELD_ICON]
      )

      try {
        if (isEditMode) {
          category.id = categoryId
          await this.apiService.updateCategory(categoryId, category)
          eventName = UPTPanel.CATEGORY_UPDATED_EVENT
        } else {
          categoryId = await this.apiService.createCategory(category)
          eventName = UPTPanel.CATEGORY_CREATED_EVENT
        }
        UPT_Utils.dispatchCustomEvent(eventName, {
          ...category,
          id: categoryId
        })

        UPTToast.show(UPTToast.SUCCESS, `Kategoria została ${isEditMode ? 'zaktualizowana' : 'dodana'} pomyślnie!`)
      } catch (e) {
        UPTToast.show(UPTToast.ERROR, e.message)
      } finally {
        UPT_Utils.hideLoading(e.target)

        if (!isEditMode) {
          this.form.reset()
          this.customIconSelect.chooseOption(null)
        }
      }
    }

    console.log(formData)
  }

  /** @param {string} categoryId */
  async loadFormData(categoryId) {
    UPT_Utils.showModalLoading(this.modalId)
    let category = null

    try {
      category = await this.apiService.getCategoryById(categoryId)

      if (!category) {
        throw new Error("Nie istnieje kateogria o id: " + categoryId)
      }

    } catch (e) {
      console.error(e)
      UPTToast.show(UPTToast.ERROR, e.message)
      UPT_Utils.hideModalLoading(this.modalId)
      UPT_Utils.hideModal(this.modalId)
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
      this.idInput.value = category.id
      this.nameInput.value = category.name
      this.descTextarea.value = category.desc ?? ""
    }

    this.customIconSelect.reRender(() => this.renderIconsOptions(currentCategoryIcon))

    UPT_Utils.hideModalLoading(this.modalId)
  }

  /**  
   * @param {string} mode 
   * @param {string | null} categoryId
   */
  open(mode, categoryId = null) {
    const isEditMode = mode === UPTCategoryForm.MODE_EDIT

    this.submitButton.textContent = isEditMode ? "Zapisz zmiany" : "Dodaj"

    UPT_Utils.showModal(this.modalId, isEditMode ? "Edytuj Kategorię" : "Dodaj Kategorię")

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
  static FIELD_ID = "upt-task-form-id"

  /** @type {UPT_Task | null} */
  currentTask = null

  /** @type {UPTTaskForm} */
  static instance;

  constructor() {
    super(UPT_TASK_FORM_ID, UPT_TASK_FORM_MODAL_ID)
    this.subTaskModule = new UPTSubTasksList(this.form.querySelector("[data-subtasks-list]"))
    this.addSubTaskButton = this.form.querySelector("[data-form-add-subtask]")
    this.nameInput = this.form.querySelector(`input[name="${UPTTaskForm.FIELD_NAME}"]`)
    this.descTextarea = this.form.querySelector(`textarea[name="${UPTTaskForm.FIELD_DESC}"]`)
    this.prioritySelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_PRIORITY}"]`)
    this.typeSelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_TYPE}"]`)
    this.categorySelect = this.form.querySelector(`select[name="${UPTTaskForm.FIELD_CATEGORY}"]`)
    this.allDayCheckbox = this.form.querySelector(`[name="${UPTTaskForm.FIELD_ALL_DAY}"]`)
    this.modeInput = this.form.querySelector(`[name="${UPTTaskForm.FIELD_MODE}"]`)
    this.idInput = this.form.querySelector(`[name="${UPTTaskForm.FIELD_ID}"]`)
    this.dateInputsWrappersForMain = this.form.querySelectorAll("[data-form-date-for-main")
    this.dateInputsWrappersForDaily = this.form.querySelectorAll("[data-form-date-for-daily")
    this.dateInputsForMain = this.form.querySelectorAll('input[type="datetime-local"]')
    this.dateInputsForDaily = this.form.querySelectorAll('input[type="time"]')
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
    this.submitButton.addEventListener("click", (e) => this.handleFormSubmit(e))
    this.typeCustomSelect.onChangeSelect(e => this.changeDateTypeInputs(e))

    this.form.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-delete-subtask-btn')) {
        this.deleteFormSubTaskHandler(e)
      }
    })

    this.allDayCheckbox.addEventListener('change', (e) => {

      this.dateInputsForDaily.forEach(input => {
        if (e.target.checked) {
          input.setAttribute("disabled", "")
        } else {
          input.removeAttribute("disabled")
        }
      })
    })
  }

  /** @param {CustomEvent} e */
  changeDateTypeInputs(e) {
    const {
      value,
      prevValue
    } = e.detail

    if (value && value !== prevValue) {
      const allSubTaskDateInputs = this.subTaskModule.getAllSubTaskDateInputs()
      const dateInputsWrappers = [...this.dateInputsWrappersForMain, ...this.dateInputsWrappersForDaily]
      const activeInputsWrappers = (wrappers) => {
        wrappers.forEach(wrapper => {
          wrapper.style.removeProperty("display")

          wrapper.querySelectorAll('input').forEach(input => {
            input.removeAttribute("disabled")

            // dla input-ów z godziną dla zadań dziennych
            if (this.allDayCheckbox.checked && input.type === "time") {
              input.setAttribute("disabled", "true")
            }
          })
        })
      }
      const disableInputsWrappers = (wrappers) => {
        wrappers.forEach(wrapper => {
          wrapper.style.display = "none"
          wrapper.querySelectorAll('input').forEach(input => input.setAttribute("disabled", "true"))
        })
      }

      UPT_Utils.fadeAnimation(() => {
        if (value === UPT_TaskType.MAIN) {
          disableInputsWrappers(this.dateInputsWrappersForDaily)
          activeInputsWrappers(this.dateInputsWrappersForMain)

          allSubTaskDateInputs.forEach(input => {
            input.type = "datetime-local"
            input.value = input.getAttribute('data-main-value')
          })
        } else {
          disableInputsWrappers(this.dateInputsWrappersForMain)
          activeInputsWrappers(this.dateInputsWrappersForDaily)

          allSubTaskDateInputs.forEach(input => {
            input.type = "time"
            input.value = input.getAttribute('data-daily-value')
          })
        }
      }, dateInputsWrappers, 200)
    }
  }

  deleteFormSubTaskHandler(e) {
    e.preventDefault()
    const target = e.target
    const subTaskId = target.dataset.subtaskId
    const subTaskElement = this.subTaskModule.getSubTaskElement(subTaskId)
    subTaskElement?.remove()
  }

  /**
   * @param {UPT_TaskCategory[]} categories
   * @param {UPT_Task | null} task 
   */
  renderCategoryOptions(categories, task = null) {
    this.categorySelect.innerHTML = `
      <option value="${CustomSelect.HIDE_VALUE}">Wybierz Kategorie</option>
      <option value="${CustomSelect.NULL_VALUE}">Brak Kategorii</option>
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
    // this.dateInputsWrappersForDaily.forEach(wrapper => wrapper.querySelector('input[type="time"]').removeAttribute("disabled"))
    this.dateInputsForDaily.forEach(input => input.removeAttribute("disabled"))
  }

  /** 
   * @param {string} mode 
   * @param {string | null} taskId
   */
  async displayFormData(mode, taskId) {
    const isEditMode = mode === UPTTaskForm.MODE_EDIT

    if (isEditMode) UPT_Utils.showModalLoading(this.modalId)

    this.resetForm()

    const {
      task,
      categories
    } = await this.loadFormData(taskId)

    if (isEditMode) {
      const isTaskMain = task.type === UPT_TaskType.MAIN
      const dateInputType = isTaskMain ? "datetime-local" : "time"
      const dateStartInput = this.form.querySelector(`input[name="${UPTTaskForm.FIELD_DATE_START}"][type="${dateInputType}"]`)
      const dateEndInput = this.form.querySelector(`input[name="${UPTTaskForm.FIELD_DATE_END}"][type="${dateInputType}"]`)

      this.currentTask = task
      this.subTaskModule.renderSubTasksList(task.subTasks ?? [], UPTSubTasksList.MODE_EDIT, task.type)
      this.nameInput.value = task.name
      this.idInput.value = task.id
      this.typeSelect.value = task.type
      this.descTextarea.value = task.description ?? ''
      this.prioritySelect = task.priority
      this.priorityCustomSelect.chooseOption(task.priority)
      this.typeCustomSelect.chooseOption(task.type)
      this.categoryCustomSelect.chooseOption(task.categoryId ?? CustomSelect.NULL_VALUE)

      if (!isTaskMain && task.startDate === UPT_Task.ALL_DAY) {
        this.allDayCheckbox.checked = true
        this.dateInputsForDaily.forEach(input => input.setAttribute('disabled', 'true'))
      }

      const allSubTaskDateInputs = this.subTaskModule.getAllSubTaskDateInputs()

      dateStartInput.value = dateInputType === 'time' ? UPT_Utils.getHoursAndMinutes(task.startDate) : UPT_Utils.getDateFormatForInput(task.startDate, dateInputType)
      dateEndInput.value = dateInputType === 'time' ? UPT_Utils.getHoursAndMinutes(task.endDate) : UPT_Utils.getDateFormatForInput(task.endDate, dateInputType)

      allSubTaskDateInputs.forEach(input => {
        input.setAttribute('data-main-value', isTaskMain ? input.value : "")
        input.setAttribute('data-daily-value', isTaskMain ? "" : input.value)

        input.type = dateInputType
      })
    }
    this.modeInput.value = mode
    this.categoryCustomSelect.reRender(() => this.renderCategoryOptions(categories, task))

    if (task && (!task.categoryId || task.categoryId === CustomSelect.NULL_VALUE)) {
      this.categoryCustomSelect.chooseOption(CustomSelect.NULL_VALUE)
    }

    if (isEditMode) {
      UPT_Utils.hideModalLoading(this.modalId)
    }
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
      UPT_Utils.hideModal(this.modalId)
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

    this.submitButton.textContent = isEditMode ? "Zapisz zmiany" : "Dodaj"

    UPT_Utils.showModal(this.modalId, isEditMode ? "Edytuj Zadanie" : "Dodaj Zadanie")

    this.displayFormData(mode, taskId)
  }

  addSubTask(e) {
    e.preventDefault()

    const newSubTask = new UPT_SubTask(UPT_Utils.generateId("subtask-"), "")
    const taskType = this.typeCustomSelect.getCurrentValue()
    const newSubTaskCard = this.subTaskModule.renderSubTaskCard(newSubTask, UPTSubTasksList.MODE_EDIT, taskType)

    if (!this.subTaskModule.list) {
      this.subTaskModule.renderSubTasksList([])
    }
    this.subTaskModule.list.append(newSubTaskCard)
  }

  /** @param {object} data */
  validateForm(data) {
    let isValid = true
    const isTaskMain = data[UPTTaskForm.FIELD_TYPE] === UPT_TaskType.MAIN
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
    checkInputField(UPTTaskForm.FIELD_CATEGORY, "Nie wybrano kategorii")

    if (!data[UPTTaskForm.FIELD_ALL_DAY] && !isTaskMain) {
      checkInputField(UPTTaskForm.FIELD_DATE_START, "Nie podano daty rozpoczęcia")
    }

    if (isTaskMain) {
      checkInputField(UPTTaskForm.FIELD_DATE_END, "Nie podano daty zakończenia")


      if (data[UPTTaskForm.FIELD_DATE_START] !== '' && data[UPTTaskForm.FIELD_DATE_END] !== '') {
        const startDate = new Date(data[UPTTaskForm.FIELD_DATE_START])
        const endDate = new Date(data[UPTTaskForm.FIELD_DATE_END])

        if (startDate.getTime() > endDate.getTime()) {
          this.displayInputError(UPTTaskForm.FIELD_DESC, "Data startu nie może być większa od daty zakończenia!")
          isValid = false
        }
      }
    }

    if (data[UPTTaskForm.FIELD_DESC].length > 500) {
      this.displayInputError(UPTTaskForm.FIELD_DESC, "Opis zadania nie może mieć więcej niz 500 znaków")
      isValid = false
    }

    data[UPTTaskForm.FIELD_SUBTASKS].forEach((subTask, index) => {
      if (subTask.name.trim() === '') {
        this.displayInputError(UPTTaskForm.FIELD_DESC, `Nazwa podzadania #${index + 1} nie może być pusta`)
        isValid = false
      }
    })

    return isValid
  }

  getTaskFromFormData(formData) {
    const taskIsAllDay = formData[UPTTaskForm.FIELD_ALL_DAY]
    const taskCategoryId = formData[UPTTaskForm.FIELD_CATEGORY]
    let startDateValue, endDateValue;

    if (taskIsAllDay) {
      startDateValue = UPT_Task.ALL_DAY
      endDateValue = null
    } else {
      const endDate = UPT_Utils.createTaskDateFromStr(formData[UPTTaskForm.FIELD_DATE_END], formData[UPTTaskForm.FIELD_TYPE])
      const startDate = UPT_Utils.createTaskDateFromStr(formData[UPTTaskForm.FIELD_DATE_START], formData[UPTTaskForm.FIELD_TYPE])
      startDateValue = startDate.toISOString()
      endDateValue = endDate ? endDate.toISOString() : startDate.toISOString()
    }

    const task = new UPT_Task({
      name: formData[UPTTaskForm.FIELD_NAME],
      categoryId: taskCategoryId === CustomSelect.NULL_VALUE ? null : taskCategoryId,
      startDate: startDateValue,
      endDate: endDateValue,
      description: formData[UPTTaskForm.FIELD_DESC].trim(),
      priority: formData[UPTTaskForm.FIELD_PRIORITY],
      status: UPT_TaskStatus.IN_PROGRESS,
      subTasks: formData[UPTTaskForm.FIELD_SUBTASKS],
      type: formData[UPTTaskForm.FIELD_TYPE]
    })

    return task
  }

  collectFormData() {
    const formData = this.getFormData()
    const subTaskCards = this.subTaskModule.getAllSubTaskCards()

    formData[UPTTaskForm.FIELD_SUBTASKS] = []
    formData[UPTTaskForm.FIELD_ALL_DAY] = Boolean(formData[UPTTaskForm.FIELD_ALL_DAY])

    subTaskCards.forEach(card => {
      const subTaskId = card.dataset.subtaskId
      const subTaskName = card.querySelector("[data-subtask-input-name]")
      const subTaskDate = card.querySelector("[data-subtask-input-date]")

      formData[UPTTaskForm.FIELD_SUBTASKS].push(
        new UPT_SubTask(subTaskId, subTaskName.value, subTaskDate.value ?? null)
      )
    })

    return formData
  }

  async handleFormSubmit(e) {
    e.preventDefault()
    const taskBeforeEdit = this.currentTask
    const formData = this.collectFormData()
    const isEditMode = this.modeInput.value === UPTTaskForm.MODE_EDIT
    const isFormValid = this.validateForm(formData)

    if (isFormValid) {
      UPT_Utils.showLoading(e.target)

      const task = this.getTaskFromFormData(formData)

      try {
        if (isEditMode) {
          await this.apiService.updateTask(this.currentTask.id, task)

          UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_UPDATED_EVENT, {
            ...task,
            id: this.currentTask.id
          })
        } else {
          const taskId = await this.apiService.createTask(task)

          UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_CREATED_EVENT, {
            ...task,
            id: taskId
          })
        }

        UPTToast.show(UPTToast.SUCCESS, `Zadanie zostało ${isEditMode ? 'zaktualizowane' : 'dodane'}!`)
      } catch (e) {
        UPTToast.show(UPTToast.ERROR, e.message)
      } finally {
        if (!isEditMode) {
          this.resetForm()
        }

        UPT_Utils.hideLoading(e.target)
      }
    }

    console.log(formData)
  }
}


// ---------------------------------------- ZAKŁADKI ---------------------------------------------

class UPTTaskDeadlineInterval {
  constructor() {
    this.init()
  }

  init() {
    this.checkIsTaskAfterDeadline()
    setInterval(() => this.checkIsTaskAfterDeadline(), 500 * 60) // pół minuty
  }

  checkIsTaskAfterDeadline() {
    const apiSerivce = UPTApiService.getInstance()
    const mainTasks = apiSerivce.getMainTasks_LocalStorage()
    const mainTasksNumber = mainTasks.length

    for (let i = 0; i < mainTasksNumber; i++) {
      const task = mainTasks[i]

      if (task.isArchived || task.status !== UPT_TaskStatus.IN_PROGRESS) continue

      const nowDate = new Date()
      const taskEndDate = new Date(task.endDate)

      if (nowDate.getTime() > taskEndDate.getTime()) {
        UPTPanel.abandondTask(task)
      }
    }
  }
}

class UPTPanel {
  static PANEL_BASE = "base"
  static PANEL_MAIN = "main"
  static PANEL_TASKS = "tasks"
  static PANEL_CATEGORY = "category"
  static PANEL_ARCHIVE = "archive"

  static TASK_STATUS_CHANGE_EVENT = "upt-task-status-change-event"
  static TASK_CREATED_EVENT = "upt-task-created-event"
  static TASK_UPDATED_EVENT = "upt-task-updated-event"
  static TASK_DELETED_EVENT = "upt-task-deleted-event"
  static TASK_ARCHIVE_EVENT = "upt-task-archive-event"
  static TASK_RESTORE_EVENT = "upt-task-restore-event"
  static TASK_UN_ARCHIVE_EVENT = "upt-task-un-archive-event"

  static CATEGORY_CREATED_EVENT = "upt-category-created-event"
  static CATEGORY_UPDATED_EVENT = "upt-category-updated-event"
  static CATEGORY_DELETED_EVENT = "upt-category-deleted-event"
  static CHANGE_VISIBLE_TASKS_EVENT = "upt-toggle-tasks-event"

  static SORT_DEADLINE_ASC = "deadline-asc"
  static SORT_DEADLINE_DESC = "deadline-desc"
  static SORT_PRIORITY_ASC = "priority-asc"
  static SORT_PRIORITY_DESC = "priority-desc"
  static SORT_NAME_ASC = "name-asc"
  static SORT_NAME_DESC = "name-desc"
  static SORT_CREATED_ASC = "created-date-asc"
  static SORT_CREATED_DESC = "created-date-desc"

  static FILTER_ONLY_IMPORTANT = "only-important"
  static FILTER_ONLY_UNIMPORTANT = "only-unimportant"
  static FILTER_ONLY_COMPLETED = "only-completed"
  static FILTER_ONLY_UNCOMPLETED = "only-uncompleted"


  /**
   * @param {string} selector
   * @param {{ tasks: UPT_Task[], categories: UPT_TaskCategory[] }}
   */
  constructor(selector, {
    tasks,
    categories
  }) {
    this.panelName = UPTPanel.PANEL_BASE
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
    this.checkboxOnlyImportant = this.panel.querySelector(`input[name="${UPTPanel.FILTER_ONLY_IMPORTANT}"]`)
    this.checkboxOnlyUnImportant = this.panel.querySelector(`input[name="${UPTPanel.FILTER_ONLY_UNIMPORTANT}"]`)
    this.checkboxOnlyCompleted = this.panel.querySelector(`input[name="${UPTPanel.FILTER_ONLY_COMPLETED}"]`)
    this.checkboxOnlyInProgress = this.panel.querySelector(`input[name="${UPTPanel.FILTER_ONLY_UNCOMPLETED}"]`)
    this.setClickEventListeners()
    this.setFilterCheckboxEventListeners()
  }

  setFilterCheckboxEventListeners() {
    const filterMethods = [UPTPanel.FILTER_ONLY_IMPORTANT, UPTPanel.FILTER_ONLY_UNIMPORTANT, UPTPanel.FILTER_ONLY_COMPLETED, UPTPanel.FILTER_ONLY_UNCOMPLETED]
    const checkboxFilterPairs = new Map([
      [this.checkboxOnlyImportant, this.checkboxOnlyUnImportant],
      [this.checkboxOnlyUnImportant, this.checkboxOnlyImportant],
      [this.checkboxOnlyCompleted, this.checkboxOnlyInProgress],
      [this.checkboxOnlyInProgress, this.checkboxOnlyCompleted],
    ]);

    this.panel.addEventListener('change', (e) => {
      const checkbox = e.target
      const nameAttribute = checkbox.getAttribute('name')

      if (filterMethods.includes(nameAttribute)) {

        if (checkbox.checked) {
          const oppositeCheckbox = checkboxFilterPairs.get(checkbox);

          if (oppositeCheckbox) {
            oppositeCheckbox.checked = false;
          }
        }

        const checkedFilterCheckboxes = this.panel.querySelectorAll(`[data-filter-tasks] input[type="checkbox"]:checked`)
        const checkedFilterMethods = [...checkedFilterCheckboxes].map(checkbox => checkbox.getAttribute('name'))

        this.filterTasks(...checkedFilterMethods)
      }

    })
  }

  getTasksForPanel() {
    const allTasks = this.apiService.getTasks_LocalStorage()
    const tasks = allTasks.filter(task => {
      if (this.panelName === UPTPanel.PANEL_TASKS) {
        return task.isArchived == false
      } else {
        return task.isArchived == true
      }
    })

    return tasks
  }

  /** @param {string} searchTerm */
  searchTasks(searchTerm) {
    const tasks = this.getTasksForPanel()
    const allTasksCards = this.getAllTasksCards()
    const searchedTasks = UPT_Utils.searchByName(searchTerm, tasks)

    allTasksCards.forEach(taskCard => UPT_Utils.hideElement(taskCard))
    searchedTasks.forEach((task) => UPT_Utils.showElement(this.panel.querySelector(`[data-task-id="${task.id}"]`)))
  }

  /** 
   * @param {string} filterValue 
   * @param {string | null} prevFilterValue
   */
  filterTasks(filterValue, prevFilterValue = null) {
    const allTasksCards = this.getAllTasksCards()
    const tasks = this.getTasksForPanel()
    const prevFilteredTasks = prevFilterValue ? UPT_Utils.getFilteredDataBy(prevFilterValue, tasks) : tasks
    const filteredTasks = UPT_Utils.getFilteredDataBy(filterValue, prevFilteredTasks)

    allTasksCards.forEach(taskCard => {
      taskCard.classList.add('hidden-animation')
      taskCard.setAttribute('aria-hidden', 'true')
    })

    filteredTasks.forEach((task) => {
      const taskCard = this.panel.querySelector(`[data-task-id="${task.id}"]`)
      taskCard.classList.remove('hidden-animation')
      taskCard.removeAttribute('aria-hidden')
    })
  }

  /** @param {CustomEvent} e */
  sortTasks(e) {
    const value = e.detail.value
    const tasks = this.getTasksForPanel()
    const sortedTasks = UPT_Utils.getSortedDataBy(value, tasks)

    UPT_Utils.fadeAnimation(() => {
      sortedTasks.forEach((task, index) => {
        const taskCard = this.panel.querySelector(`[data-task-id="${task.id}"]`)
        taskCard.style.order = index
      })
    }, this.tasksList, 300)
  }

  getAllTasksCards() {
    return this.panel.querySelectorAll('[data-task-card][data-task-id]')
  }

  /** @param {UPT_Task} task */
  static isTaskAfterDeadline(task) {
    if (!task.endDate || task.endDate === '') return false

    const dateToCheck = new Date(task.endDate);
    const currentDate = new Date();
    const isTaskAfterDeadline = dateToCheck < currentDate

    if (isTaskAfterDeadline) {
      task.isArchived = true
      task.status = UPT_TaskStatus.ABANDONED
      UPTApiService.getInstance().updateTask(task.id, task)
    }

    return isTaskAfterDeadline;
  }

  /** @param {UPT_Task} task */
  static async abandondTask(task) {
    const apiSerivce = UPTApiService.getInstance()
    const archivedTask = {
      ...task,
      isArchived: true,
      archivedAt: (new Date()).toISOString(),
      status: UPT_TaskStatus.ABANDONED
    }

    await apiSerivce.updateTask(task.id, archivedTask)

    UPTPanel.removeAllTasksCards(task.id, "lightblue")
    UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_ARCHIVE_EVENT, archivedTask)
    UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_STATUS_CHANGE_EVENT, {
      status: UPT_TaskStatus.ABANDONED,
      type: task.type
    })
    UPTToast.show(UPTToast.ERROR, `Upłynął czas do wykonania zadania "${task.name}"`)
  }

  /** @param {UPT_Task} task */
  static async unmarkTaskAsComplete(task) {
    const apiService = UPTApiService.getInstance()
    task.status = UPT_TaskStatus.IN_PROGRESS

    await apiService.updateTask(task.id, task)

    UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_UPDATED_EVENT, task)
    UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_STATUS_CHANGE_EVENT, {
      status: task.status,
      type: task.type
    })

    UPTToast.show(UPTToast.SUCCESS, `Cofnięto stan zadania: ${task.name}!`)
  }

  /** @param {UPT_Task} task */
  static async markTaskAsComplete(task) {
    const apiService = UPTApiService.getInstance()
    task.status = UPT_TaskStatus.COMPLETED

    await apiService.updateTask(task.id, task)

    UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_UPDATED_EVENT, task)
    UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_STATUS_CHANGE_EVENT, {
      status: task.status,
      type: task.type
    })

    UPTToast.show(UPTToast.SUCCESS, `Zakończono zadanie: ${task.name}!`)
  }

  /** @param {UPT_Task} task */
  getCategoryByTask = (task) => this.categories.find((cat) => cat.id === task.categoryId)

  setClickEventListeners() {
    const actionsMap = {
      "data-add-task-button": (e) => this.taskForm.open(UPTTaskForm.MODE_CREATE),
      "data-add-category-button": (e) => this.categoryForm.open(UPTCategoryForm.MODE_CREATE),
      "data-edit-task-btn": (e) => this.taskForm.open(UPTTaskForm.MODE_EDIT, e.target.dataset.taskId),
      "data-details-task-btn": (e) => this.taskDetails.show(e.target.dataset.taskId),
      "data-details-task-link": (e) => this.taskDetails.show(e.target.getAttribute("href").substring(1)),
      "data-archive-task-btn": (e) => this.handleArchiveTaskButton(e.target),
      "data-restore-task-btn": (e) => this.handleRestoreTaskButton(e.target),
      "data-delete-task-btn": (e) => this.handleDeleteTaskButton(e.target),
      "data-edit-category-btn": (e) => this.categoryForm.open(UPTCategoryForm.MODE_EDIT, e.target.dataset.categoryId),
      "data-delete-category-btn": (e) => this.handleDeleteCategoryButton(e.target),
      "data-show-main-tasks": (e) => UPT_Utils.dispatchCustomEvent(UPTPanel.CHANGE_VISIBLE_TASKS_EVENT, {
        type: UPT_TaskType.MAIN
      }),
      "data-show-daily-tasks": (e) => UPT_Utils.dispatchCustomEvent(UPTPanel.CHANGE_VISIBLE_TASKS_EVENT, {
        type: UPT_TaskType.DAILY
      }),
    };

    this.panel.addEventListener("click", (e) => {
      for (const [attr, action] of Object.entries(actionsMap)) {
        if (e.target.hasAttribute(attr)) {
          e.preventDefault()
          action(e);
          break;
        }
      }
    });
  }

  /** 
   * @param {string} taskId 
   * @param {string} removeAnimationColor 
   */
  static removeAllTasksCards(taskId, removeAnimationColor = "red") {
    const taskCards = document.querySelectorAll(`[data-task-card][data-task-id="${taskId}"]`);

    taskCards.forEach(card => UPT_Utils.removeDataCard(card, removeAnimationColor))
  }

  /** 
   * @param {string} taskId 
   * @param {HTMLElement | null} target
   * @param {() => void} successCallback
   */
  static async archiveTask(taskId, target = null, successCallback = () => {}) {
    if (target) UPT_Utils.showLoading(target);

    const apiService = UPTApiService.getInstance()
    const archivedTask = await apiService.archiveTask(taskId)

    UPTPanel.removeAllTasksCards(taskId, "lightblue")
    UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_ARCHIVE_EVENT, archivedTask)
    if (target) UPT_Utils.hideLoading(target);
    successCallback()
  }

  /** 
   * @param {string} taskId 
   * @param {HTMLElement | null} target
   * @param {() => void} successCallback
   */
  static async restoreTask(taskId, target = null, successCallback = () => {}) {
    if (target) UPT_Utils.showLoading(target);

    const apiService = UPTApiService.getInstance()
    const task = await apiService.restoreTask(taskId)

    UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_RESTORE_EVENT, task)
    if (target) UPT_Utils.hideLoading(target);
    successCallback()
  }

  /** 
   * @param {string} taskId 
   * @param {() => void} successCallback
   */
  static deleteTask(taskId, successCallback = () => {}) {
    const confirmButton = document.querySelector(`#${UPT_CONFIRM_MODAL_ID} [data-modal-confirm-button]`);
    const taskName = document.querySelector(`[data-task-card][data-task-id="${taskId}"] [data-task-name]`).textContent;

    UPT_Utils.showModal(UPT_CONFIRM_MODAL_ID, `Czy napewno chcesz usunąć zadanie "${taskName}"?`);

    confirmButton.onclick = async (e) => {
      UPT_Utils.showLoading(e.target);

      const apiService = UPTApiService.getInstance()
      const deletedTask = await apiService.deleteTask(taskId)

      UPTPanel.removeAllTasksCards(taskId)
      UPTToast.show(UPTToast.SUCCESS, "Pomyślnie usunięto zadanie");
      UPT_Utils.dispatchCustomEvent(UPTPanel.TASK_DELETED_EVENT, deletedTask)
      UPT_Utils.hideLoading(e.target);
      UPT_Utils.hideModal(UPT_CONFIRM_MODAL_ID);
      successCallback()
    };
  }

  /** @param {HTMLButtonElement} button */
  async handleRestoreTaskButton(button) {
    const taskId = button.dataset.taskId;
    await UPTPanel.restoreTask(taskId, button)
    UPTToast.show(UPTToast.SUCCESS, "Pomyślnie przywrócono zadanie");
  }

  /** @param {HTMLButtonElement} button */
  async handleArchiveTaskButton(button) {
    const taskId = button.dataset.taskId;
    await UPTPanel.archiveTask(taskId, button)
    UPTToast.show(UPTToast.SUCCESS, "Pomyślnie archiwizowano zadanie");
  }

  /** @param {HTMLButtonElement} button */
  handleDeleteTaskButton(button) {
    const taskId = button.dataset.taskId;
    UPTPanel.deleteTask(taskId)
  }

  /** @param {HTMLButtonElement} button */
  handleDeleteCategoryButton(button) {
    const categoryId = button.dataset.categoryId;
    const confirmButton = document.querySelector(`#${UPT_CONFIRM_MODAL_ID} [data-modal-confirm-button]`);
    const categoryCard = this.panel.querySelector(`[data-category-card][data-category-id="${categoryId}"]`);
    const categoryName = categoryCard.querySelector("[data-category-name]").textContent;

    UPT_Utils.showModal(UPT_CONFIRM_MODAL_ID, `Czy napewno chcesz usunąć kategorię "${categoryName}"?`);

    confirmButton.onclick = (e) => {
      UPT_Utils.showLoading(e.target);

      this.apiService.deleteCategory(categoryId).then(() => {
        const categoryCards = document.querySelectorAll(`[data-category-card][data-category-id="${categoryId}"]`);
        const categoryTaskCards = document.querySelectorAll(`[data-task-card][data-category-id="${categoryId}"]`);
        categoryCards.forEach(card => UPT_Utils.removeDataCard(card))
        categoryTaskCards.forEach(card => {
          const icon = card.querySelector('[data-task-icon]')
          icon?.remove()
        })

        UPT_Utils.dispatchCustomEvent(UPTPanel.CATEGORY_DELETED_EVENT, {
          categoryId
        })
        UPT_Utils.hideModal(UPT_CONFIRM_MODAL_ID);
        UPTToast.show(UPTToast.SUCCESS, "Pomyślnie usunięto kategorię");
        UPT_Utils.hideLoading(e.target);
      })
    };
  }
}

class UPTMainPanel extends UPTPanel {
  static TASKS_DISPLAY_NUMBER = 5;
  static CATEGORIES_DISPLAY_NUMBER = 5;

  currentNumberOfTasksDaily = 0
  currentNumberOfTasksMain = 0
  _currentNumberOfCategories = 0
  _statisticNumberOfAllDailyTasks = 0
  _statisticNumberOfAllMainTasks = 0

  constructor(selector, data) {
    super(selector, data);
    this.panelName = UPTPanel.PANEL_MAIN
    this.dailyTasksList = this.panel.querySelector("[data-daily-tasks-list]");
    this.mainTasksList = this.panel.querySelector("[data-main-tasks-list]");
    this.categoriesList = this.panel.querySelector("[data-category-list]");
    this.noDailyTasksCard = this.panel.querySelector("[data-no-daily-tasks-card]");
    this.noMainTasksCard = this.panel.querySelector("[data-no-main-tasks-card]");
    this.noCategoriesCard = this.panel.querySelector("[data-no-categories]");
    this.statisticDailyTasksNumberEl = this.panel.querySelector("[data-statistic-daily-tasks-number]");
    this.statisticMainTasksNumberEl = this.panel.querySelector("[data-statistic-main-tasks-number]");
    this.customPieChart = null
    this.pieChartSelector = UPT_MODULE_ID_SELECTOR + " [data-pie-chart]";
    this.currentNumberOfCategories = 0
    this.init();
  }

  get currentNumberOfCategories() {
    return this._currentNumberOfCategories;
  }
  set currentNumberOfCategories(value) {
    this._currentNumberOfCategories = value;

    if (value > 0) {
      this.noCategoriesCard.style.display = "none"
      this.categoriesList.style.removeProperty('display')
    } else {
      this.categoriesList.style.display = "none"
      this.noCategoriesCard.style.removeProperty('display')
    }
  }
  get statisticNumberOfAllDailyTasks() {
    return this._statisticNumberOfAllDailyTasks;
  }
  set statisticNumberOfAllDailyTasks(value) {
    this._statisticNumberOfAllDailyTasks = value;
    this.statisticDailyTasksNumberEl.textContent = value;
  }
  get statisticNumberOfAllMainTasks() {
    return this._statisticNumberOfAllMainTasks;
  }
  set statisticNumberOfAllMainTasks(value) {
    this._statisticNumberOfAllMainTasks = value;
    this.statisticMainTasksNumberEl.textContent = value;
  }

  showNoMainTasksCard = () => this.noMainTasksCard.style.removeProperty('display')
  showNoDailyTasksCard = () => this.noDailyTasksCard.style.removeProperty('display')
  hideNoMainTasksCard = () => this.noMainTasksCard.style.display = "none"
  hideNoDailyTasksCard = () => this.noDailyTasksCard.style.display = "none"

  init() {
    this.initPieChart();
    this.initStatisticTasks();
    this.renderTasksList();
    this.renderCategoriesList();
    this.initTimeToEndDayCountdown();
    this.initDateTimeStatisics();
    this.setEventListeners();
  }

  setEventListeners() {
    document.addEventListener(UPTPanel.TASK_CREATED_EVENT, (e) => {
      this.createTaskEventHandler(e)
      this.updateStatistics(e.detail, true)
    })
    document.addEventListener(UPTPanel.TASK_RESTORE_EVENT, (e) => {
      this.createTaskEventHandler(e)
      this.updateStatistics(e.detail, true)
    })
    document.addEventListener(UPTPanel.TASK_DELETED_EVENT, (e) => {
      this.deleteTaskEventHandler(e)
      this.updateStatistics(e.detail, false)
    })
    document.addEventListener(UPTPanel.TASK_ARCHIVE_EVENT, (e) => {
      this.deleteTaskEventHandler(e)
      this.updateStatistics(e.detail, false)
    })
    document.addEventListener(UPTPanel.TASK_UPDATED_EVENT, (e) => this.updateTaskEventHandler(e)) 
    document.addEventListener(UPTPanel.TASK_STATUS_CHANGE_EVENT, (e) => this.taskStatusChangeEventHandler(e)) 

    document.addEventListener(UPTPanel.CATEGORY_CREATED_EVENT, (e) => this.createCategoryEventHandler(e))
    document.addEventListener(UPTPanel.CATEGORY_DELETED_EVENT, (e) => this.deleteCategoryEventHandler(e))
    document.addEventListener(UPTPanel.CATEGORY_UPDATED_EVENT, (e) => this.updateCategoryEventHandler(e))

    this.panel.addEventListener('change', (e) => this.markTaskAsDoneCheckBoxHandler(e))
  }

  /** @param {CustomEvent} e */
  taskStatusChangeEventHandler(e) {
    const task = e.detail;
    const isStatusReducing = task.status === UPT_TaskStatus.ABANDONED || task.status === UPT_TaskStatus.COMPLETED;

    if (task.type === UPT_TaskType.MAIN) {
      this.statisticNumberOfAllMainTasks += isStatusReducing ? -1 : 1;
      this.updatePieChart()
    } else {
      this.statisticNumberOfAllDailyTasks += isStatusReducing ? -1 : 1;
    } 
  }

  async markTaskAsDoneCheckBoxHandler(e) {
    const checkbox = e.target

    if (checkbox.hasAttribute('data-mark-task-as-done')) {
      UPT_Utils.showLoading(checkbox.parentElement)

      const taskId = checkbox.dataset.taskId
      const task = await this.apiService.getTaskById(taskId)

      if (checkbox.checked) {
        await UPTPanel.markTaskAsComplete(task)
      } else {
        await UPTPanel.unmarkTaskAsComplete(task)
      }
      UPT_Utils.hideLoading(checkbox.parentElement)
    }
  }

  /** @param {CustomEvent} e */
  updateTaskEventHandler(e) {
    const updatedTask = e.detail
    const updatedTaskIsMain = updatedTask.type === UPT_TaskType.MAIN
    const prevTaskCard = this.panel.querySelector(`[data-task-card][data-task-id="${updatedTask.id}"]`)

    if (prevTaskCard) {
      const newTaskCard = this.renderTask(updatedTask)

      prevTaskCard.remove()

      if (updatedTaskIsMain) {
        this.mainTasksList.append(newTaskCard)
      } else {
        this.dailyTasksList.append(newTaskCard)
      }
    }
  }

  /** @param {CustomEvent} e */
  updateCategoryEventHandler(e) {
    const category = e.detail
    const prevCategoryCard = this.categoriesList.querySelector(`[data-category-card][data-category-id="${category.id}"]`)

    if (prevCategoryCard) {
      const newCategoryCard = this.renderCategoryCard(category)

      prevCategoryCard.remove()
      this.categoriesList.append(newCategoryCard)
    }
  }

  /** @param {CustomEvent} e */
  async deleteTaskEventHandler(e) {
    const task = e.detail
    const taskType = task.type

    if (taskType === UPT_TaskType.DAILY) {
      this.currentNumberOfTasksDaily--
    } else {
      this.currentNumberOfTasksMain--
      this.updatePieChart()
    }

    if (this.currentNumberOfTasksMain > 0) {
      this.hideNoMainTasksCard()
    } else {
      this.showNoMainTasksCard()
    }

    if (this.currentNumberOfTasksDaily > 0) {
      this.hideNoDailyTasksCard()
    } else {
      this.showNoDailyTasksCard() 
    }
  }

  /** @param {CustomEvent} e */
  deleteCategoryEventHandler(e) {
    this.currentNumberOfCategories--
  }

  /** @param {CustomEvent} e */
  createCategoryEventHandler(e) {
    const category = e.detail

    if (this.currentNumberOfCategories < UPTMainPanel.CATEGORIES_DISPLAY_NUMBER) {
      const categoryElement = this.renderCategoryCard(category)

      this.categoriesList.append(categoryElement);
      this.currentNumberOfCategories++
    }
  }

  /** @param {CustomEvent} e */
  createTaskEventHandler(e) {
    const task = e.detail
    const isTypeDaily = task.type === UPT_TaskType.DAILY
    const taskElement = this.renderTask(task)

    if (isTypeDaily && this.currentNumberOfTasksDaily < UPTMainPanel.TASKS_DISPLAY_NUMBER) {
      this.dailyTasksList.append(taskElement);
      this.currentNumberOfTasksDaily++
    } else if (this.currentNumberOfTasksMain < UPTMainPanel.TASKS_DISPLAY_NUMBER) {
      this.mainTasksList.append(taskElement);
      this.currentNumberOfTasksMain++
    }

    if (isTypeDaily) {
      this.hideNoDailyTasksCard()
    } else {
      this.hideNoMainTasksCard()
      this.updatePieChart()
    }
  }

  /** @param {UPT_TaskCategory} category */
  renderCategoryCard(category) {
    const li = document.createElement("li");

    li.setAttribute("data-category-id", category.id);
    li.setAttribute("data-category-card", "");
    li.innerHTML = `
      <a data-edit-category-btn data-category-id="${category.id}" href="#${category.name}" class="task-category-link link variant4"> 
        <i class="task-category-link-icon ${UPT_Utils.getCategoryIconClass(category)}" aria-hidden="true"></i>
        <span>${category.name}</span>
      </a>
    `;

    return li
  }

  renderCategoriesList() {
    const categoriesNumber = this.categories.length;
    const categoriesListFragment = document.createDocumentFragment();

    for (let i = 0; i < categoriesNumber; i++) {
      const category = this.categories[i];

      if (this.currentNumberOfCategories >= UPTMainPanel.CATEGORIES_DISPLAY_NUMBER) break;

      categoriesListFragment.append(this.renderCategoryCard(category));

      this.currentNumberOfCategories++
    }

    this.categoriesList.append(categoriesListFragment);
  }

  renderTasksList() {
    const tasksNumber = this.tasks.length;
    const dailyTasksFragment = document.createDocumentFragment();
    const mainTasksFragment = document.createDocumentFragment();

    for (let i = 0; i < tasksNumber; i++) {
      const task = this.tasks[i];
      const taskIsMain = task.type === UPT_TaskType.MAIN;

      if (
        task.isArchived ||
        (taskIsMain && this.currentNumberOfTasksMain >= UPTMainPanel.TASKS_DISPLAY_NUMBER) ||
        (!taskIsMain && this.currentNumberOfTasksDaily >= UPTMainPanel.TASKS_DISPLAY_NUMBER)
      ) {
        continue;
      }

      const li = this.renderTask(task)

      if (taskIsMain) {
        this.currentNumberOfTasksMain++;
        mainTasksFragment.append(li);
      } else {
        this.currentNumberOfTasksDaily++;
        dailyTasksFragment.append(li);
      }
    }

    this.mainTasksList.append(mainTasksFragment);
    this.dailyTasksList.append(dailyTasksFragment);

    if (this.currentNumberOfTasksMain > 0) {
      this.hideNoMainTasksCard()
    } else {
      this.showNoMainTasksCard()
    }

    if (this.currentNumberOfTasksDaily > 0) {
      this.hideNoDailyTasksCard()
    } else {
      this.showNoDailyTasksCard()
    }
  }

  renderTask(task) {
    const taskIsMain = task.type === UPT_TaskType.MAIN;
    const taskIsCompleted = task.status === UPT_TaskStatus.COMPLETED
    const li = document.createElement("li");
    const category = this.getCategoryByTask(task);
    const taskPrioritySubClass = UPT_Utils.getTaskPrioritySubClass(task);
    const taskRepeatIcon = !taskIsMain ? '<i class="fa-solid fa-rotate"></i>' : "";

    const taskDateInfo = taskIsMain ? `
      <span class="task-date tooltip">
        <i class="fa-regular fa-calendar"></i> ${UPT_Utils.getFriendlyDateFormat(task.endDate, { day: "numeric", month: "short" })} 
        <i class="fa-regular fa-clock"></i> ${UPT_Utils.getHoursAndMinutes(task.endDate)}
        <span class="tooltip-content">
          ${UPT_Utils.getFriendlyDateFormat(task.endDate, { weekday: "long" })} <br>
          ${UPT_Utils.getFriendlyDateFormat(task.endDate, { day: "numeric", month: "long", year: "numeric" })} rok
          <hr class="upt-hr">
          Godzina: ${UPT_Utils.getHoursAndMinutes(task.endDate)}
        </span>                                                                                                                             
      </span>
    ` : `
      <span class="task-date">
        <span class="task-date-hours"><i class="fa-regular fa-clock"></i> ${UPT_Utils.getHoursForDailyTask(task)}</span>                                                                                                                                           
      </span>
    `

    li.className = `task ${taskIsCompleted ? 'task--completed' : ''} modern-card modern-card--opacity`;
    li.setAttribute("data-task-id", task.id);
    li.setAttribute("data-category-id", task.categoryId);
    li.setAttribute("data-task-card", "");

    li.innerHTML = `
        <span class="task-checkbox tooltip custom-checkbox-group custom-checkbox-group--big">
          <input data-mark-task-as-done id="mark-as-done-task-${task.id}" data-task-id="${task.id}" ${taskIsCompleted ? 'checked' : ''} type="checkbox">
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
                <i data-task-icon class="${UPT_Utils.getCategoryIconClass(category)}"></i> 
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
    const statisticTasks = this.tasks.filter(task => {
      return !task.isArchived && task.status === UPT_TaskStatus.IN_PROGRESS
    })
    const countTasksByType = (tasks, type) => {
      return tasks.reduce((value, task) => (task.type === type ? value + 1 : value), 0);
    }
    this.statisticNumberOfAllDailyTasks = countTasksByType(statisticTasks, UPT_TaskType.DAILY)
    this.statisticNumberOfAllMainTasks = countTasksByType(statisticTasks, UPT_TaskType.MAIN)  
  }

  updateStatistics(task, increment) {
    const { type, status } = task;

    if (type === UPT_TaskType.MAIN) {
      if (status === UPT_TaskStatus.IN_PROGRESS || increment) {
        this.statisticNumberOfAllMainTasks += increment ? 1 : -1;
      }
    } else {
      if (status === UPT_TaskStatus.IN_PROGRESS || increment) {
        this.statisticNumberOfAllDailyTasks += increment ? 1 : -1;
      }
    }
  }

  updatePieChart() {
    const update = () => {
      const mainTasks = this.apiService.getMainTasks_LocalStorage()

      this.customPieChart.reRender(() => this.showPieChart(mainTasks))
    }
    const triggerUpdateThrottle = UPT_Utils.throttle(update, 1000)

    triggerUpdateThrottle()
  }

  /** @param {UPT_Task[]} mainTasks */
  showPieChart(mainTasks) {
    const tasksNumber = mainTasks.length === 0 ? 1 : mainTasks.length;
    const pieChartAppearance = this.panel.querySelector(this.pieChartSelector + " [data-pie-chart-appearance]");
    const getPercentOfTasksNumber = (number) => Math.round((number * 100) / tasksNumber);

    let completedCount = 0,
      inProgressCount = 0,
      deletedCount = 0;

    mainTasks.forEach((task) => {
      switch (task.status) {
        case UPT_TaskStatus.COMPLETED:
          completedCount++;
          break;
        case UPT_TaskStatus.IN_PROGRESS:
          inProgressCount++;
          break;
        case UPT_TaskStatus.ABANDONED:
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
  }

  initPieChart() {
    const mainTasks = this.tasks.filter(task => task.type === UPT_TaskType.MAIN)

    this.showPieChart(mainTasks)
    this.customPieChart = new CustomPieChart(this.pieChartSelector);
  }

  initDateTimeStatisics() {
    new UPTDateTimeStatisics(UPT_MODULE_ID_SELECTOR + " [data-date-time-statisics]");
  }
}

class UPTCategoryPanel extends UPTPanel {
  static TOGGLE_ANIMATION_DURATION = 300

  _currentCategoriesNumber = 0

  constructor(selector, data) {
    super(selector, data);
    this.panelName = UPTPanel.PANEL_CATEGORY
    this.categoriesList = this.panel.querySelector("[data-category-list]");
    this.sortCategorySelect = new CustomSelect(this.panel.querySelector('[data-sort-category][data-custom-select]'))
    this.noCategoriesMessage = this.panel.querySelector('[data-no-categories]')
    this.init();
  }

  get currentCategoriesNumber() {
    return this._currentCategoriesNumber;
  }

  set currentCategoriesNumber(value) {
    this._currentCategoriesNumber = value;

    if (value > 0) {
      this.noCategoriesMessage.style.display = "none"
    } else {
      this.noCategoriesMessage.style.removeProperty('display')
    }
  }

  init() {
    this.renderCategoriesList();
    this.sortCategorySelect.onChangeSelect((e) => this.sortCategories(e))

    document.addEventListener(UPTPanel.CATEGORY_CREATED_EVENT, (e) => this.categoryCreatedEventHandler(e))
    document.addEventListener(UPTPanel.CATEGORY_DELETED_EVENT, (e) => this.categoryDeleteEventHanlder(e))
    document.addEventListener(UPTPanel.CATEGORY_UPDATED_EVENT, (e) => this.categoryUpdatedEventHandler(e))

    document.addEventListener(CustomSearchForm.SEARCH_EVENT, (e) => {
      if (e.detail.panel === UPTPanel.PANEL_CATEGORY) {
        this.searchCategory(e.detail.value)
      }
    })
  }

  /**  @param {CustomEvent} e */
  categoryDeleteEventHanlder(e) {
    this.currentCategoriesNumber--
  }

  /**  @param {CustomEvent} e */
  categoryCreatedEventHandler(e) {
    const newCategory = e.detail
    const newCategoryCard = this.renderCategory(newCategory)

    this.categoriesList.append(newCategoryCard);
    this.currentCategoriesNumber++
  }

  /**  @param {CustomEvent} e */
  categoryUpdatedEventHandler(e) {
    const category = e.detail
    const prevCategoryCard = this.categoriesList.querySelector(`[data-category-card][data-category-id="${category.id}"]`)
    const newCategoryCard = this.renderCategory(category)

    prevCategoryCard.remove()
    this.categoriesList.append(newCategoryCard);
  }

  /** @param {string} searchTerm */
  searchCategory(searchTerm) {
    const allCategories = this.apiService.getCategories_LocalStorage()
    const allCategoriesCards = this.getAllCategoriesCards()
    const searchedCategories = UPT_Utils.searchByName(searchTerm, allCategories)

    allCategoriesCards.forEach(card => UPT_Utils.hideElement(card))
    searchedCategories.forEach((category) => UPT_Utils.showElement(this.panel.querySelector(`[data-category-id="${category.id}"]`)))
  }

  /** @param {CustomEvent} e  */
  sortCategories(e) {
    const allCategories = this.apiService.getCategories_LocalStorage()
    const sortedCategories = UPT_Utils.getSortedDataBy(e.detail.value, allCategories)

    UPT_Utils.fadeAnimation(() => {
      sortedCategories.forEach((category, index) => {
        const categoryCard = this.categoriesList.querySelector(`[data-category-id="${category.id}"]`)
        categoryCard.style.order = index
      })
    }, this.categoriesList, 300)
  }

  getAllCategoriesCards() {
    return this.categoriesList.querySelectorAll('[data-category-card][data-category-id]')
  }

  renderCategoriesList() {
    const categoriesNumber = this.categories.length;
    const categoriesListFragment = document.createDocumentFragment();

    for (let i = 0; i < categoriesNumber; i++) {
      const category = this.categories[i];
      categoriesListFragment.append(this.renderCategory(category));

      this.currentCategoriesNumber++
    }

    this.categoriesList.append(categoriesListFragment);
  }

  /** @param {UPT_TaskCategory} category */
  renderCategory(category) {
    const li = document.createElement("li");
    const categoryDesc = category.desc ? `<span class="category-card-desc"><b>Opis: </b>${category.desc}</span>` : ''

    li.setAttribute("data-category-id", category.id);
    li.setAttribute("data-category-card", "");
    li.className = "category-card modern-card";
    li.innerHTML = `
      <span class="category-card-content">
        <span class="category-card-header">
          <span class="category-card-name">
              <i class="category-card-icon ${UPT_Utils.getCategoryIconClass(category)}"></i>
              <span data-category-name>${category.name}</span>
          </span>
          <span class="category-card-createAt">Utworzono: ${UPT_Utils.formatDate(category.createdAt)}</span>
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
      </span>
      ${categoryDesc}
    `;

    return li
  }
}

class UPTTasksPanel extends UPTPanel {

  _currentMainTasksNumber = 0
  _currentDailyTasksNumber = 0

  constructor(selector, data) {
    super(selector, data);
    this.panelName = UPTPanel.PANEL_TASKS
    this.tasksList = this.panel.querySelector("[data-tasks-list]");
    this.currentTypeTitleEl = this.panel.querySelector("[data-current-type-title]")
    this.typeToggleButton = this.panel.querySelector("[data-tasks-type-toggle-btn]")
    this.noMainTasksMessage = this.panel.querySelector("[data-no-main-tasks-message]")
    this.noDailyTasksMessage = this.panel.querySelector("[data-no-daily-tasks-message]")
    this.sortTasksSelect = new CustomSelect(this.panel.querySelector("[data-sort-tasks][data-custom-select]"))
    this.init();
  }

  get currentMainTasksNumber() {
    return this._currentMainTasksNumber;
  }

  set currentMainTasksNumber(value) {
    this._currentMainTasksNumber = value;
    this.handleMainTasksNumberChange(value);
  }

  get currentDailyTasksNumber() {
    return this._currentDailyTasksNumber;
  }

  set currentDailyTasksNumber(value) {
    this._currentDailyTasksNumber = value;
    this.handleDailyTasksNumberChange(value);
  }

  handleMainTasksNumberChange(newValue) {

    if (newValue > 0) {
      this.hideMessage(this.noMainTasksMessage)
    } else {
      this.showMessage(this.noMainTasksMessage)
    }
  }

  handleDailyTasksNumberChange(newValue) {

    if (newValue > 0) {
      this.hideMessage(this.noDailyTasksMessage)
    } else {
      this.showMessage(this.noDailyTasksMessage)
    }
  }

  /**  @param {HTMLElement} messageElement */
  hideMessage(messageElement) {
    messageElement.style.visibility = "hidden"
    messageElement.classList.add("sr-only")
  }

  /**  @param {HTMLElement} messageElement */
  showMessage(messageElement) {
    messageElement.style.removeProperty("visibility")
    messageElement.classList.remove("sr-only")
  }

  init() {
    this.renderTasksList();
    this.noMainTasksMessage.style.display = "none"
    this.noMainTasksMessage.setAttribute('data-task-type', UPT_TaskType.MAIN)
    this.noDailyTasksMessage.setAttribute('data-task-type', UPT_TaskType.DAILY)
    this.typeToggleButton.addEventListener('click', () => this.toggleVisibleTasks())
    this.sortTasksSelect.onChangeSelect((e) => this.sortTasks(e))
    this.panel.addEventListener('click', (e) => this.endTaskHandler(e))

    document.addEventListener(UPTPanel.TASK_CREATED_EVENT, (e) => this.taskCreatedEventHandler(e))

    document.addEventListener(UPTPanel.CHANGE_VISIBLE_TASKS_EVENT, (e) => {
      window.location.hash = "zadania"
      this.changeVisibleTasks(e.detail.type)
    })

    document.addEventListener(UPTPanel.TASK_UPDATED_EVENT, (e) => this.taskUpdateEventHandler(e))
    document.addEventListener(UPTPanel.TASK_RESTORE_EVENT, (e) => this.taskUpdateEventHandler(e))
    document.addEventListener(UPTPanel.TASK_DELETED_EVENT, (e) => this.taskDeletedEventHandler(e))
    document.addEventListener(UPTPanel.TASK_ARCHIVE_EVENT, (e) => this.currentMainTasksNumber--)

    document.addEventListener(CustomSearchForm.SEARCH_EVENT, (e) => {
      const {
        panel,
        value
      } = e.detail

      if (panel === this.panelName) {
        this.searchTasks(value)
      }
    })
  }

  taskCreatedEventHandler(e) {
    const task = e.detail
    const taskCard = this.renderTask(task)

    if (task.type === UPT_TaskType.MAIN) {
      this.currentMainTasksNumber++
    } else {
      this.currentDailyTasksNumber++
    }

    this.tasksList.append(taskCard);
  }

  taskDeletedEventHandler(e) {
    const task = e.detail

    if (task.type === UPT_TaskType.MAIN) {
      this.currentMainTasksNumber--
    } else {
      this.currentDailyTasksNumber--
    }
  }

  taskUpdateEventHandler(e) {
    const updatedTask = e.detail
    const prevTaskCard = this.panel.querySelector(`[data-task-card][data-task-id="${updatedTask.id}"]`)
    const newTaskCard = this.renderTask(updatedTask)

    prevTaskCard?.remove()
    this.tasksList.append(newTaskCard)
  }

  async endTaskHandler(e) {
    const button = e.target

    if (button.hasAttribute('data-end-task-btn')) {
      UPT_Utils.showLoading(button)

      const taskId = button.dataset.taskId
      const task = await this.apiService.getTaskById(taskId)

      if (button.hasAttribute('data-task-completed')) {
        UPTPanel.unmarkTaskAsComplete(task)

        button.removeAttribute('data-task-completed')
        button.innerHTML = `
          <i class="fa-solid fa-check"></i> 
          Zakończ Zadanie
        `
      } else {
        UPTPanel.markTaskAsComplete(task)

        button.setAttribute('data-task-completed', '')
        button.innerHTML = `
          <i class="fa-solid fa-rotate-right"></i> 
          Przywróć Zadanie
        `
      }

      UPT_Utils.hideLoading(button)
    }
  }

  /** @param {string} toType */
  changeVisibleTasks(toType) {
    const isChangeToMain = toType === UPT_TaskType.MAIN
    const taskCards = this.panel.querySelectorAll(`[data-task-card]`)

    this.typeToggleButton.setAttribute("data-current-type", isChangeToMain ? UPT_TaskType.MAIN : UPT_TaskType.DAILY)
    this.typeToggleButton.textContent = isChangeToMain ? "Pokaż zadania dzienne" : "Pokaż zadania główne"

    UPT_Utils.fadeAnimation(() => {
      taskCards.forEach(taskCard => {
        taskCard.style.removeProperty("display")

        if (taskCard.getAttribute("data-task-type") === toType) {
          taskCard.style.removeProperty('display')
        } else {
          taskCard.style.display = "none"
        }
      })

    }, this.tasksList, UPTCategoryPanel.TOGGLE_ANIMATION_DURATION)

    UPT_Utils.fadeAnimation(() => {
      this.currentTypeTitleEl.textContent = isChangeToMain ? "Zadania Główne" : "Zadania Dzienne"

    }, this.currentTypeTitleEl, UPTCategoryPanel.TOGGLE_ANIMATION_DURATION)
  }

  getCurrentTaskType() {
    return this.typeToggleButton.dataset.currentType
  }

  toggleVisibleTasks() {
    const isCurrentTypeMain = this.getCurrentTaskType() === UPT_TaskType.MAIN
    this.changeVisibleTasks(isCurrentTypeMain ? UPT_TaskType.DAILY : UPT_TaskType.MAIN)
  }

  /** @param {UPT_Task} task */
  renderTask(task) {
    const taskIsMain = task.type === UPT_TaskType.MAIN
    const taskIsCompleted = task.status === UPT_TaskStatus.COMPLETED
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
        <i class="fa-regular fa-calendar"></i> ${UPT_Utils.getFriendlyDateFormat(task.endDate, { day: "numeric", month: "short" })} 
        <i class="fa-regular fa-clock"></i> ${UPT_Utils.getHoursAndMinutes(task.endDate)}
        <span class="tooltip-content">
          ${UPT_Utils.getFriendlyDateFormat(task.endDate, { weekday: "long" })} <br>
          ${UPT_Utils.getFriendlyDateFormat(task.endDate, { day: "numeric", month: "long", year: "numeric" })} rok
          <hr class="upt-hr">
          Godzina: ${UPT_Utils.getHoursAndMinutes(task.endDate)}
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
    card.setAttribute("data-category-id", task.categoryId);
    card.className = `task-card ${taskIsCompleted ? 'task-card--completed' : ''} modern-card`;

    card.innerHTML = `
      <div class="task-card-header">
        <span class="task-priority task-card-priority ${taskPrioritySubClass}">${task.priority} piorytet</span>

        <p class="task-name task-card-name">
          <i data-task-icon class="task-icon ${UPT_Utils.getCategoryIconClass(category)}"></i>
          <a href="#${task.id}" data-details-task-link data-task-name>${task.name}</a> ${taskRepeatIcon}
        </p>

        <div class="category-card-actions task-card-actions-top">
          <button data-edit-task-btn data-task-id="${task.id}" class="category-card-action-btn task-card-action-btn tooltip">
            <i class="fa-solid fa-pen-to-square"></i>
            <span class="tooltip-content">Edytuj Zadanie</span>
          </button>
          ${taskIsMain ? `
             <button data-archive-task-btn data-task-id="${task.id}" class="category-card-action-btn task-card-action-btn tooltip">
              <span class="tooltip-content">Archiwizuj Zadanie</span>
              <i class="fa-regular fa-folder"></i>
            </button>
            ` : ''}
         
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
        <button data-end-task-btn ${taskIsCompleted ? 'data-task-completed' : ''} data-task-id="${task.id}" class="task-card-action-btn link small variant2">
          ${taskIsCompleted ? '<i class="fa-solid fa-rotate-right"></i>Przywróć Zadanie' : '<i class="fa-solid fa-check"></i> Zakończ Zadanie'}
        </button>
      </div>                     
    `;

    if (task.type !== this.getCurrentTaskType()) {
      card.style.display = "none";
    }

    return card
  }

  renderTasksList() {
    const tasksListFragment = document.createDocumentFragment();
    const tasksNumber = this.tasks.length;

    for (let i = 0; i < tasksNumber; i++) {
      const task = this.tasks[i];

      if (task.isArchived) {
        continue;
      }
      const taskCard = this.renderTask(task)

      if (task.type === UPT_TaskType.MAIN) {
        this.currentMainTasksNumber++
      } else {
        this.currentDailyTasksNumber++
      }

      tasksListFragment.append(taskCard);
    }

    this.tasksList.append(tasksListFragment);
  }
}

class UPTArchivePanel extends UPTPanel {

  _currentArchivedTasks = 0

  constructor(selector, data) {
    super(selector, data);
    this.panelName = UPTPanel.PANEL_ARCHIVE
    this.noArchiveTasksMessage = this.panel.querySelector('[data-no-tasks-archive]')
    this.tasksList = this.panel.querySelector("[data-tasks-archive-list]");
    this.sortTasksSelect = new CustomSelect(this.panel.querySelector("[data-sort-tasks][data-custom-select]"))
    this.init();
  }

  get currentArchivedTasks() {
    return this._currentArchivedTasks;
  }

  set currentArchivedTasks(value) {
    this._currentArchivedTasks = value;

    if (value > 0) {
      this.noArchiveTasksMessage.style.display = "none"
    } else {
      this.noArchiveTasksMessage.style.removeProperty('display')
    }
  }

  init() {
    this.renderArchivedTasksList();  
    this.sortTasksSelect.onChangeSelect((e) => this.sortTasks(e))

    document.addEventListener(UPTPanel.TASK_ARCHIVE_EVENT, (e) => this.taskArchiveEventHandler(e))
    document.addEventListener(UPTPanel.TASK_UN_ARCHIVE_EVENT, (e) => this.taskRestoreEventHandler(e))
    document.addEventListener(UPTPanel.TASK_RESTORE_EVENT, (e) => this.taskRestoreEventHandler(e))

    document.addEventListener(CustomSearchForm.SEARCH_EVENT, (e) => {
      const { panel, value } = e.detail

      if (panel === this.panelName) {
        this.searchTasks(value)
      }
    })
  }

  /** @param {CustomEvent} e */
  taskArchiveEventHandler(e) {
    const archivedTask = e.detail
    this.tasksList.append(this.renderArchivedTask(archivedTask))
    this.currentArchivedTasks++
  }

  /** @param {CustomEvent} e */
  taskRestoreEventHandler(e) {
    const unArchivedTask = e.detail
    const unArchivedTaskCard = this.tasksList.querySelector(`[data-task-card][data-task-id="${unArchivedTask.id}"]`)

    unArchivedTaskCard?.remove()

    this.currentArchivedTasks--
  }

  /** @param {UPT_Task} task */
  renderArchivedTask(task) {
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
        Zarchiwizowano: ${UPT_Utils.formatDate(task.archivedAt)}
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

    return li
  }

  renderArchivedTasksList() {
    const tasksListFragment = document.createDocumentFragment();
    const tasksNumber = this.tasks.length;

    for (let i = 0; i < tasksNumber; i++) {
      const task = this.tasks[i];

      if (!task.isArchived || task.type === UPT_TaskType.DAILY) {
        continue;
      }
      const archivedTask = this.renderArchivedTask(task)

      this.currentArchivedTasks++

      tasksListFragment.append(archivedTask);
    }

    this.tasksList.append(tasksListFragment);
  }
}