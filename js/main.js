import SmoothScroll from "smooth-scroll";

var scroll = new SmoothScroll('a[href*="#"]', {
  speed: 500,
  speedAsDuration: true,
});

// navigation menu
const hamburgerMenu = document.querySelector(".hamburger-menu");
const navMenu = document.querySelector(".nav-menu");
const navClose = document.querySelector(".nav-menu__text");

const navClickHandler = () => {
  navMenu.classList.toggle("slide-in");
};

hamburgerMenu.addEventListener("click", () => {
  navClickHandler();
});

navClose.addEventListener("click", () => {
  navClickHandler();
});
