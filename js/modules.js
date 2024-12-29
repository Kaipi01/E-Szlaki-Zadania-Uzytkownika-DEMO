class UPTDateTimeStatisics {
  /**
   * @param {string} containerSelector
   */
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.currentTimeEl = this.container.querySelector(
      "[data-statistic-current-time]"
    );
    this.currentDateEl = this.container.querySelector(
      "[data-statistic-current-date]"
    );
    this.timeToEndDayEl = this.container.querySelector(
      "[data-statistic-time-to-end-day]"
    );

    this.init();
  }

  init() {
    this.setCurrentTime();
    this.setCurrentDate();

    this.setTimeToEndDay();
    setInterval(() => this.setCurrentTime(), 1000);
  }

  setCurrentDate() {
    const daysOfWeek = [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ];

    const months = [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ];

    const now = new Date();
    const dayName = daysOfWeek[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const formattedDate = `${dayName}, ${day} ${month} ${year}`;

    this.currentDateEl.textContent = formattedDate;
  }

  setTimeToEndDay() {
    const updateTime = () => {
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );

      if (now > endOfDay) {
        const nextDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          23,
          59,
          59,
          999
        );
        endOfDay.setTime(nextDay.getTime());
      }
      const diff = endOfDay - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      this.timeToEndDayEl.textContent = formattedTime;
    };

    setInterval(updateTime, 1000);
    updateTime();
  }

  setCurrentTime() {
    const date = new Date();
    this.currentTimeEl.textContent = date.toLocaleTimeString();
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
    this.navigation = this.mainContainer.querySelector(
      "[data-main-navigation]"
    );
    this.navigationList = this.mainContainer.querySelector(
      "[data-main-navigation-list]"
    );
    this.pages = this.mainContainer.querySelectorAll("[data-content-page]");
    this.pageLinks = [];
    this.linkPage = "";
    this.prevLink;
    this.breakpointValue = this.remToPx(76);
    this.windowWidthIsLessThanBreakpoint =
      window.innerWidth < this.breakpointValue;
    this.changeScreenEvent = new CustomEvent(
      UPTModuleMainNavigation.UPT_MODULE_CHANGE_PAGE_EVENT
    );
    this.pageLinksArray;
    this.init();
  }

  /**
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
    this.pageLinks = this.navigation.querySelectorAll(
      "[data-main-navigation-link]"
    );
    this.pageLinksArray = Array.from(this.pageLinks);
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
    // Mechanizm throttle do zabezpieczenia animacji
    const throttle = (
      callback,
      delay = UPTModuleMainNavigation.ANIMATION_DURATION_TIME
    ) => {
      let shouldWait = false;

      return (...args) => {
        if (shouldWait) return;

        callback(...args);
        shouldWait = true;

        setTimeout(() => {
          shouldWait = false;
        }, delay);
      };
    };

    const showPageThrottle = throttle((link) => {
      this.showPage(link);
    });

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

    prevPage.classList.remove("page-static");
    this.pages.forEach((page) => (page.style.position = "absolute"));

    nextPage.classList.add("active");
    nextPage.style.opacity = 0;
    prevPage.style.opacity = 0;

    setTimeout(() => {
      nextPage.style.position = "relative";
      nextPage.style.opacity = 1;

      if (prevPage) {
        prevPage.classList.remove("active");
      }
    }, UPTModuleMainNavigation.ANIMATION_DURATION_TIME);
  }
}

class UPTModuleToast {
  static TYPE_SUCCESS = "success";
  static TYPE_WARNING = "warning";
  static TYPE_ERROR = "error";
  static TYPE_INFO = "info";
  static SUCCESS_ICON = "fa-circle-check";
  static ERROR_ICON = "fa-circle-exclamation";
  static WARNING_ICON = "fa-triangle-exclamation";
  static INFO_ICON = "fa-circle-info";

  /**
   * @param {string} containerSelector
   */
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.toastId = this.generateToastId();
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
    this.closeToastBtn.addEventListener("click", () => this.close());
  }

  generateToastId() {
    return "upt-toast-" + Date.now().toString(36) + Math.random().toString(36);
  }

  generateToast() {
    const toast = document.createElement("div");
    toast.className = "upt-toast";
    toast.id = this.toastId;
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
      UPTModuleToast.TYPE_SUCCESS,
      UPTModuleToast.TYPE_WARNING,
      UPTModuleToast.TYPE_ERROR,
      UPTModuleToast.TYPE_INFO
    );
    this.toastIcon.classList.remove(
      UPTModuleToast.SUCCESS_ICON,
      UPTModuleToast.WARNING_ICON,
      UPTModuleToast.ERROR_ICON,
      UPTModuleToast.INFO_ICON
    );
    this.toast.style.display = "flex";

    switch (type) {
      case UPTModuleToast.TYPE_SUCCESS:
        toastTitle = "Sukces!";
        toastIcon = UPTModuleToast.SUCCESS_ICON;
        break;
      case UPTModuleToast.TYPE_ERROR:
        toastTitle = "Błąd!";
        toastIcon = UPTModuleToast.ERROR_ICON;
        break;
      case UPTModuleToast.TYPE_WARNING:
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
    this.modalFocus = this.element.getAttribute("data-modal-first-focus")
      ? this.element.querySelector(
          this.element.getAttribute("data-modal-first-focus")
        )
      : null;
    this.selectedTrigger = null;
    this.preventScrollEl = this.getPreventScrollEl();
    this.showClass = "modal--is-visible";
    this.initModal();
    this.focusableElString =
      '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
  }

  isVisible(element) {
    return (
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }
  getPreventScrollEl() {
    var scrollEl = document.body;
    return scrollEl;
  }
  initModal() {
    var self = this;
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
        self.moveFocusEl.focus();
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
  handleEvent(event) {
    switch (event.type) {
      case "click": {
        this.initClick(event);
      }
      case "keydown": {
        this.initKeyDown(event);
      }
    }
  }
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
  getFirstVisible(elements) {
    //get first visible focusable element inside the modal
    for (var i = 0; i < elements.length; i++) {
      if (this.isVisible(elements[i])) {
        this.firstFocusable = elements[i];
        break;
      }
    }
  }
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
  emitModalEvents(eventName) {
    var event = new CustomEvent(eventName, { detail: this.selectedTrigger });
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
    Array.isArray(triggeredOutside)
      ? triggeredOutside.map((element) => this._createSVG(element))
      : this._createSVG(triggeredOutside);
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
    this.animationTo({ ...options, element: progressCircle }, true);

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
    const commonConfiguration = initial
      ? options
      : {
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
      where === "top"
        ? { class: `${this._className}-circle-${options.index}` }
        : objCircle;

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

  _styleTransform = ({ rotation, animationSmooth }) => {
    const smoothAnimation = animationSmooth
      ? `transition: stroke-dashoffset ${animationSmooth}`
      : "";

    return `transform:rotate(${rotation}deg);transform-origin: 50% 50%;${smoothAnimation}`;
  };
  _strokeDasharray = (type) => {
    return {
      "stroke-dasharray": type || "264",
    };
  };
  _strokeLinecap = ({ round }) => {
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

  _setColor = (element, { lineargradient, index, colorSlice }) => {
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

  _gradient = ({ index, lineargradient }) => {
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
      const { percent, label } = data;
      const item = document.createElement("span");
      item.className = "legend-item";
      item.textContent = `${label} ${percent}%`;
      legendFigcaption.append(item);
    });

    this.container.append(legendFigcaption);
  }

  generateCSSForPieChart() {
    const pieChartData = this.pieData.data;
    const { animate, animationSpeed } = this.pieData;
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
      const { color, percent } = data;
      const percentValue = percent + lastProcentValue;

      pieCharColors += `--color-${nr}: ${color};`;
      pieCharAnimationStartOpacity += `--opacity-${nr}: 0%;`;

      if (index === 0) {
        pieCharAnimationEndOpacity += `--opacity-${nr}: ${percentValue}%;`;
        pieCharConicGradientValues += showAnimation
          ? `var(--color-${nr}) var(--opacity-${nr}),`
          : `${color} ${percentValue}%,`;
      } else if (index === pieChartData.length - 1) {
        pieCharConicGradientValues += showAnimation
          ? `var(--color-${nr}) 0 var(--opacity-${nr})`
          : `${color} 0 ${percentValue}%`;
      } else {
        pieCharAnimationEndOpacity += `--opacity-${nr}: ${percentValue}%;`;
        pieCharConicGradientValues += showAnimation
          ? `var(--color-${nr}) 0 var(--opacity-${nr}),`
          : `${color} 0 ${percentValue}%,`;
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
  constructor(selectElement) {
    this.selectElement = selectElement;
    this.numberOfOptions = selectElement.children.length;
    this.className = selectElement.dataset.className
      ? selectElement.dataset.className
      : "custom-select";
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
      )
        ? "block"
        : "none";
    };

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

  static initAll() {
    document
      .querySelectorAll("select[data-custom-select]")
      .forEach((selectElement) => {
        new CustomSelect(selectElement);
      });
  }
}

class CustomCountdown extends HTMLElement {
  static ANIMATE_ATTRIBUTE_NAME = "data-animate-now";

  constructor() {
    super();
    this.dateEnd = this.getAttribute("data-date-end");
    this.timer;
    this.days;
    this.hours;
    this.minutes;
    this.seconds;
  }

  connectedCallback() {
    this.render();
    this.daysElement = this.querySelector("[data-days]");
    this.hoursElement = this.querySelector("[data-hours]");
    this.minutesElement = this.querySelector("[data-minutes]");
    this.secondsElement = this.querySelector("[data-seconds]");

    this.init();
  }

  init() {
    this.dateEnd = new Date(this.dateEnd);
    this.dateEnd = this.dateEnd.getTime();

    if (isNaN(this.dateEnd)) {
      return;
    }

    this.timer = setInterval(() => {
      this.calculate();
    }, 1000);
  }

  render() {
    this.innerHTML = `
      <div class="custom-countdown">
        <p class="timer">
          <span class="timer-data" data-days></span>
          <span class="timer-data" data-hours></span>
          <span class="timer-data" data-minutes></span>
          <span class="timer-data" data-seconds></span>
        </p>
      </div>
    `;
  }

  /**
   * @param {number} days
   * @param {number} hours
   * @param {number} minutes
   * @param {number} seconds
   */
  animate(days, hours, minutes, seconds) {
    const attrName = CustomCountdown.ANIMATE_ATTRIBUTE_NAME;

    const animateTimeData = (value, thisValue, thisValueEl) => {
      if (value != thisValue) {
        thisValueEl.setAttribute(attrName, "");

        setTimeout(() => {
          thisValueEl.removeAttribute(attrName);
        }, 2000);
      }
    };
    animateTimeData(days, this.days, this.daysElement);
    animateTimeData(hours, this.hours, this.hoursElement);
    animateTimeData(minutes, this.minutes, this.minutesElement);
    animateTimeData(seconds, this.seconds, this.secondsElement);
  }

  /**
   * @param {number} days
   * @param {number} hours
   * @param {number} minutes
   * @param {number} seconds
   */
  display(days, hours, minutes, seconds) {
    this.animate(days, hours, minutes, seconds);

    this.daysElement.innerHTML = parseInt(days, 10);
    this.hoursElement.innerHTML = ("0" + hours).slice(-2);
    this.minutesElement.innerHTML = ("0" + minutes).slice(-2);
    this.secondsElement.innerHTML = ("0" + seconds).slice(-2);
  }

  calculate() {
    let dateStart = new Date();
    dateStart = new Date(
      dateStart.getUTCFullYear(),
      dateStart.getUTCMonth(),
      dateStart.getUTCDate(),
      dateStart.getUTCHours(),
      dateStart.getUTCMinutes(),
      dateStart.getUTCSeconds()
    );
    let timeRemaining = parseInt((this.dateEnd - dateStart.getTime()) / 1000);
    let days, hours, minutes, seconds;

    if (timeRemaining >= 0) {
      days = parseInt(timeRemaining / 86400);
      timeRemaining = timeRemaining % 86400;
      hours = parseInt(timeRemaining / 3600);
      timeRemaining = timeRemaining % 3600;
      minutes = parseInt(timeRemaining / 60);
      timeRemaining = timeRemaining % 60;
      seconds = parseInt(timeRemaining);

      this.display(days, hours, minutes, seconds);

      this.days = days;
      this.hours = hours;
      this.minutes = minutes;
      this.seconds = seconds;
    } else {
      return;
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
    this.modalTitle = this.querySelector(
      `[slot="${UserPrivateTasksModuleModal.SLOT_TITLE}"]`
    );
    this.modalTitleVal = this.modalTitle?.innerHTML || "";
    this.modalContentVal =
      this.querySelector(`[slot="${UserPrivateTasksModuleModal.SLOT_CONTENT}"]`)
        ?.innerHTML || "";
    this.modalFirstFocus = this.getAttribute(
      UserPrivateTasksModuleModal.ATTR_FIRST_FOCUS
    );
    this.modalFirstFocusVal = this.modalFirstFocus
      ? `${UserPrivateTasksModuleModal.ATTR_FIRST_FOCUS}="${this.modalFirstFocus}"`
      : "";
    this.modalContentClass = this.getAttribute(
      UserPrivateTasksModuleModal.ATTR_CONTENT_CLASS
    );
    this.modalContentClassVal = this.modalContentClass ?? "";
    this.render();
    new UPTModuleModal(`#${this.modalId}`);
  }

  render() {
    this.innerHTML = `
        <div id="${this.modalId}" ${this.modalFirstFocusVal} class="modal modal--animate js-modal">
            <div class="modal__content modern-card ${this.modalContentClassVal}" role="alertdialog" aria-labelledby="${this.modalId}-title">
                <div class="modal__header pb-2">
                    <p ${UserPrivateTasksModuleModal.ATTR_TITLE} id="${this.modalId}-title" class="upt-small-header">
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

customElements.define(
  UserPrivateTasksModuleModal.NAME,
  UserPrivateTasksModuleModal
);
