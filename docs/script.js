const primaryNav = document.querySelector(".primary-nav");
const navToggle = document.querySelector(".mobile-nav-toggle");
const profession = document.getElementById("profession");
const professions = ['A Software Developer', 'A System Administrator', 'A Cybersecurity Analyst', 'An IT Specialist'];
const classNames = ['dev', 'sys', 'sec', 'it'];
let currentIndex = 0;

const navLink = document.querySelectorAll(".nav-link");

function changeProfession() {
  profession.textContent = professions[currentIndex];
  profession.className = classNames[currentIndex];
  // console.log(profession);
  currentIndex = (currentIndex + 1) % professions.length; // Loop through professions array
};

changeProfession();
setInterval(changeProfession, 5000);

navToggle.addEventListener("click", () => {
  const visibility = primaryNav.getAttribute("data-visible");

  if (visibility === "false") {
    primaryNav.setAttribute("data-visible", true);
    navToggle.setAttribute("aria-expanded", true);
  }

  if (visibility === "true") {
    primaryNav.setAttribute("data-visible", false);
    navToggle.setAttribute("aria-expanded", false);
  }
});

[...navLink].forEach((nav) => {
  nav.addEventListener("click", () => {
    if (primaryNav.getAttribute("data-visible") === "true") {
      primaryNav.setAttribute("data-visible", false);
      navToggle.setAttribute("aria-expanded", false);
    }
  });
});
