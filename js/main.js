import SmoothScroll from "smooth-scroll";

var scroll = new SmoothScroll('a[href*="#"]', {
  speed: 500,
  speedAsDuration: true,
});

// navigation menu
const hamburgerMenu = document.querySelector(".hamburger-menu");
const navMenu = document.querySelector(".nav-menu");
const navClose = document.querySelector(".nav-menu__text--close");

hamburgerMenu.addEventListener("click", () => {
  if (navMenu.classList.contains("slide-in") !== true) {
    navMenu.classList.add("slide-in");
  }
  navMenu.classList.replace("slide-out", "slide-in");
});

navClose.addEventListener("click", () => {
  navMenu.classList.replace("slide-in", "slide-out");
});
