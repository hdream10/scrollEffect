function scrollEffect(element, options) {
  let checkBodyEnable = document.body.classList.contains(
    "disabled-scroll-effect"
  );
  if (checkBodyEnable) return false;
  function swipeDownHandler(event) {
    event.preventDefault();
    moveUp(el);
  }
  function swipeUpHandler(event) {
    event.preventDefault();
    moveDown(el);
  }
  function mouseWheelHandler(event) {
    event.preventDefault();
    let delta = event.wheelDelta || -event.detail;
    start_scroll(event, delta);
  };

  function disabledForSmallScreen() {
    if (document.body.clientWidth < 770) {
      document.body.classList.add("disabled-scroll-effect");
      document.removeEventListener("swipeDown", swipeDownHandler);
      document.removeEventListener("swipeUp", swipeUpHandler);
      document.removeEventListener("wheel", mouseWheelHandler);
    } else if (!checkBodyEnable) {
      document.body.classList.remove("disabled-scroll-effect");
      document.addEventListener("wheel", mouseWheelHandler, {
        passive: false,
      });
      window.scrollTo(0,0);
    }
  }
  window.addEventListener("resize", disabledForSmallScreen);
  disabledForSmallScreen();
  let defaults = {
      sectionContainer: "section",
      easing: "ease",
      animationTime: 1000,
      scrollMenu: true,
      keyboard: true,
    },
    settings = Object.extend({}, defaults, options),
    el = document.querySelector(element),
    sections = document.querySelectorAll(settings.sectionContainer),
    topPos = 0,
    lastAnimation = 0,
    quietPeriod = 500,
    scrollMenuList = "",
    body = document.body;
  this.start = function () {
    el.classList.add("scroll-effect-wrapper");
    el.style.position = "relative";

    for (let i = 0; i < sections.length; i++) {
      sections[i].classList.add("scroll-effect-section");
      sections[i].dataset.index = i + 1;
      topPos = topPos + 100;

      if (settings.scrollMenu == true) {
        scrollMenuList +=
          "<li><a data-index='" +
          (i + 1) +
          "' href='#" +
          (i + 1) +
          "'></a></li>";
      }
    }

    swipeEvents(el);
    document.addEventListener("swipeDown", swipeDownHandler);
    document.addEventListener("swipeUp", swipeUpHandler);
    if (settings.scrollMenu == true) {
      let scrollMenu = document.createElement("ul");
      scrollMenu.setAttribute("class", "scroll-effect-menu");

      body.appendChild(scrollMenu);
      scrollMenu.innerHTML = scrollMenuList;
      let posTop =
        (document.querySelector(".scroll-effect-menu").offsetHeight / 2) * -1;
      document.querySelector(".scroll-effect-menu").style.marginTop = posTop;
    }
    if (window.location.hash != "" && window.location.hash != "#1") {
      let init_index = window.location.hash.replace("#", ""),
        next = document.querySelector(
          settings.sectionContainer + "[data-index='" + init_index + "']"
        ),
        next_index = next.dataset.index;

      document
        .querySelector(
          settings.sectionContainer + "[data-index='" + init_index + "']"
        )
        .classList.add("active-scroll-effect");

      body.classList.add("current-page-" + init_index);
      if (settings.scrollMenu == true)
        document
          .querySelector(
            ".scroll-effect-menu li a" + "[data-index='" + init_index + "']"
          )
          .classList.add("active-scroll-effect");

      if (next) {
        next.classList.add("active-scroll-effect");
        if (settings.scrollMenu == true)
          document
            .querySelector(
              ".scroll-effect-menu li a" + "[data-index='" + init_index + "']"
            )
            .classList.add("active-scroll-effect");

        body.className = body.className.replace(/\bcurrent-page-\d.*?\b/g, "");
        body.classList.add("current-page-" + next_index);
      }
      let pos = (init_index - 1) * 100 * -1;
      transformPage(el, settings, pos);
    } else {
      document
        .querySelector(settings.sectionContainer + "[data-index='1']")
        .classList.add("active-scroll-effect");
      body.classList.add("current-page-1");
      if (settings.scrollMenu == true)
        document
          .querySelector(".scroll-effect-menu li a[data-index='1']")
          .classList.add("active-scroll-effect");
    }

    scrollMenuHandler = function () {
      let page_index = this.dataset.index;
      moveTo(el, page_index);
    };
    if (settings.scrollMenu == true) {
      let scrollMenuLinks = document.querySelectorAll(
        ".scroll-effect-menu li a"
      );
      let scrollNavigationItem = new Array();
      scrollNavigationItem.push(...scrollMenuLinks);
      scrollNavigationItem.push(
        ...document.querySelectorAll(".scroll-effect-link")
      );

      scrollNavigationItem.forEach((scrollItem) => {
        scrollItem.addEventListener("click", scrollMenuHandler);
      });
    }

    keydownHandler = function (e) {
      let tag = e.target.tagName.toLowerCase();
      if (e.which == 38) if (tag != "input" && tag != "textarea") moveUp(el);
      if (e.which == 40) if (tag != "input" && tag != "textarea") moveDown(el);
      return false;
    };

    document.onkeydown = keydownHandler;
    return false;
  };
  swipeEvents = function (el) {
    let startY;

    document.addEventListener("touchstart", touchstart);

    function touchstart(event) {
      let touches = event.touches;
      if (touches && touches.length) {
        startY = touches[0].pageY;
        document.addEventListener("touchmove", touchmove, { passive: false });
      }
    }
    function touchmove(event) {
      let touches = event.touches;
      if (touches && touches.length) {
        if (event.cancelable) {
          event.preventDefault();
        }
        let deltaY = startY - touches[0].pageY;
        if (deltaY >= 50) {
          let event = new Event("swipeUp");
          document.dispatchEvent(event);
        }
        if (deltaY <= -50) {
          let event = new Event("swipeDown");
          document.dispatchEvent(event);
        }

        if (Math.abs(deltaY) >= 50) {
          document.removeEventListener("touchmove", touchmove, {
            passive: false,
          });
        }
      }
    }
  };
  whichTransitionEventu = function () {
    let el = document.createElement("fakeelement");
    if (el.style.transition !== undefined) {
      return "transitionend";
    }
  };
  scrollInPos = function (element, to, duration) {
    if (duration < 0) return;
    let difference = to - element.scrollTop;
    let perTick = (difference / duration) * 10;

    setTimeout(function () {
      element.scrollTop = element.scrollTop + perTick;
      if (element.scrollTop == to) return;
      scrollInPos(element, to, duration - 10);
    }, 10);
  };
  transformPage = function (el2, settings, pos) {
    let transformCSS =
      "transform: translate3d(0, " +
      pos +
      "%, 0); transition: transform " +
      settings.animationTime +
      "ms " +
      settings.easing +
      ";";

    el2.style.cssText = transformCSS;

    let transitionEnd = whichTransitionEventu();
    el2.addEventListener(transitionEnd, endAnimation, false);

    function endAnimation() {
      el2.removeEventListener(transitionEnd, endAnimation);
    }
  };
  start_scroll = function (event, delta) {
    let deltaOfInterest = delta,
      timeNow = new Date().getTime();

    if (timeNow - lastAnimation < quietPeriod + settings.animationTime) {
      event.preventDefault();
      return;
    }

    if (deltaOfInterest < 0) {
      moveDown(el);
    } else {
      moveUp(el);
    }

    lastAnimation = timeNow;
  };

  this.moveDown = function (el3) {
    if (typeof el3 == "string") el3 = document.querySelector(el3);

    let index = document.querySelector(
        settings.sectionContainer + ".active-scroll-effect"
      ).dataset.index,
      current = document.querySelector(
        settings.sectionContainer + "[data-index='" + index + "']"
      ),
      next = document.querySelector(
        settings.sectionContainer +
          "[data-index='" +
          (parseInt(index) + 1) +
          "']"
      );

    if (next) {
      pos = index * 100 * -1;
    } else {
      return;
    }
    let next_index = next.dataset.index;
    current.classList.remove("active-scroll-effect");
    next.classList.add("active-scroll-effect");

    if (settings.scrollMenu == true) {
      document
        .querySelector(
          ".scroll-effect-menu li a" + "[data-index='" + index + "']"
        )
        .classList.remove("active-scroll-effect");
      document
        .querySelector(
          ".scroll-effect-menu li a" + "[data-index='" + next_index + "']"
        )
        .classList.add("active-scroll-effect");
    }

    body.className = body.className.replace(/\bcurrent-page-\d.*?\b/g, "");
    body.classList.add("current-page-" + next_index);

    transformPage(el3, settings, pos);
  };
  this.moveUp = function (el4) {
    if (typeof el4 == "string") el4 = document.querySelector(el4);

    let index = document.querySelector(
        settings.sectionContainer + ".active-scroll-effect"
      ).dataset.index,
      current = document.querySelector(
        settings.sectionContainer + "[data-index='" + index + "']"
      ),
      next = document.querySelector(
        settings.sectionContainer +
          "[data-index='" +
          (parseInt(index) - 1) +
          "']"
      );

    if (next) {
      pos = (next.dataset.index - 1) * 100 * -1;
    } else {
      return;
    }
    let next_index = next.dataset.index;
    current.classList.remove("active-scroll-effect");
    next.classList.add("active-scroll-effect");

    if (settings.scrollMenu == true) {
      document
        .querySelector(
          ".scroll-effect-menu li a" + "[data-index='" + index + "']"
        )
        .classList.remove("active-scroll-effect");

      document
        .querySelector(
          ".scroll-effect-menu li a" + "[data-index='" + next_index + "']"
        )
        .classList.add("active-scroll-effect");
    }
    body.className = body.className.replace(/\bcurrent-page-\d.*?\b/g, "");
    body.classList.add("current-page-" + next_index);

    transformPage(el4, settings, pos);
  };
  this.moveTo = function (el5, page_index) {
    if (typeof el5 == "string") el5 = documeletnt.querySelector(el5);

    let current = document.querySelector(
        settings.sectionContainer + ".active-scroll-effect"
      ),
      next = document.querySelector(
        settings.sectionContainer + "[data-index='" + page_index + "']"
      );

    if (next) {
      let next_index = next.dataset.index;
      current.classList.remove("active-scroll-effect");
      next.classList.add("active-scroll-effect");

      document
        .querySelector(".scroll-effect-menu li a" + ".active-scroll-effect")
        .classList.remove("active-scroll-effect");

      document
        .querySelector(
          ".scroll-effect-menu li a" + "[data-index='" + page_index + "']"
        )
        .classList.add("active-scroll-effect");

      body.className = body.className.replace(/\bcurrent-page-\d.*?\b/g, "");
      body.classList.add("current-page-" + next_index);

      pos = (page_index - 1) * 100 * -1;

      transformPage(el5, settings, pos);
    }
  };
  this.start();
}
Object.extend = function (orig) {
  if (orig == null) return orig;

  for (let i = 1; i < arguments.length; i++) {
    let obj = arguments[i];
    if (obj != null) {
      for (let prop in obj) {
        let getter = obj.__lookupGetter__(prop),
          setter = obj.__lookupSetter__(prop);

        if (getter || setter) {
          if (getter) orig.__defineGetter__(prop, getter);
          if (setter) orig.__defineSetter__(prop, setter);
        } else {
          orig[prop] = obj[prop];
        }
      }
    }
  }

  return orig;
};