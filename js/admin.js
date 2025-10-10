

import { initSpecialties } from './views/specialties.js';

const DEFAULT_SECTION = "dashboard"
const SELECTORS = {
  SIDEBAR: "#sidebar",
  SIDEBAR_COLLAPSE: "#sidebarCollapse",
  NAV_LINKS: ".nav-link",
  CONTENT_SECTIONS: ".content-section"
};
const MOBILE_BREAKPOINT = 768;
const SECTION_HIDDEN_CLASS = "d-none";
const TARGET_SECTION_ID_ATTRIBUTE = "data-section";


function switchSection(sectionId) {
  const contentSections = document.querySelectorAll(SELECTORS.CONTENT_SECTIONS);
  const navLinks = document.querySelectorAll(SELECTORS.NAV_LINKS);

  // ocultar todas las secciones
  contentSections.forEach((section) => {
    section.classList.add(SECTION_HIDDEN_CLASS);
  });
  // mostrar la seccion seleccionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove(SECTION_HIDDEN_CLASS);
  }
  navLinks.forEach((navLink) => {

    const targetSectionId = navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE);
    const isActive = targetSectionId === sectionId
    navLink.classList.toggle("active", isActive);
    if (navLink.parentElement.tagName === "LI") {
      navLink.parentElement.classList.toggle("active", isActive);
    }
  });
}


function navigateToSection(sectionId, updateUrl = true) {
  if (!sectionId) return

  if (updateUrl) {
    const navLink = document.querySelector(`${SELECTORS.NAV_LINKS}[${TARGET_SECTION_ID_ATTRIBUTE}=${sectionId}]`)
    if (navLink) {
      const hash = navLink.getAttribute("href").substring(1);
      history.pushState(null, "", `#${hash}`)
    }
  }
  // cambiar de sección
  switchSection(sectionId);
  // cerrar sidebar en mobile
  const sidebar = document.querySelector(SELECTORS.SIDEBAR);
  if (window.innerWidth < MOBILE_BREAKPOINT && sidebar) {
    sidebar.classList.remove("collapsed");
  }

}


function handleInitialLoad() {
  const hash = window.location.hash.substring(1);
  // si no hay hash, se muestra la seccion dashboard
  const section = hash || DEFAULT_SECTION;
  const targetLink = document.querySelector(`${SELECTORS.NAV_LINKS}[href="#${section}"]`)
  if (targetLink) {
    navigateToSection(targetLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE), false)
  }
}

function handleNavigation(event) {
  const navLink = event.target.closest(SELECTORS.NAV_LINKS);
  if (navLink) {
    event.preventDefault();
    navigateToSection(navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE))
  }
}
function handleSidebarCollapse(sidebar) {
  sidebar.classList.toggle("collapsed");
}

function setupEventListeners(sidebar, sidebarCollapse) {

  // Manejar cambios en la URL (atras y adelante)
  window.addEventListener("popstate", handleInitialLoad);
  // Manejar clics en los enlaces del sidebar
  sidebar.addEventListener("click", handleNavigation)
  // Manejar click en el boton de collapse
  sidebarCollapse.addEventListener("click", ()=>handleSidebarCollapse(sidebar));

}


function initAdmin() {
  const sidebar = document.querySelector(SELECTORS.SIDEBAR);
  const sidebarCollapse = document.querySelector(SELECTORS.SIDEBAR_COLLAPSE);
  if (!sidebar || !sidebarCollapse) {
    return
  }
  handleInitialLoad()

  setupEventListeners(sidebar, sidebarCollapse)

  // Inicializar modulos de las vistas
  initSpecialties();
}

document.addEventListener("DOMContentLoaded", initAdmin);
