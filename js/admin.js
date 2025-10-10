import { renderDashboard } from "./views/dashboard.js";
import { renderSpecialties } from "./views/specialties.js";

const SELECTORS = {
  SIDEBAR: "#sidebar",
  SIDEBAR_COLLAPSE: "#sidebarCollapse",
  NAV_LINKS: ".nav-link",
  NAV_ITEMS: ".nav-link",
  DEFAULT_SECTION_NAME: "dashboard",
};
const MOBILE_BREAKPOINT = 768;
const TARGET_SECTION_ID_ATTRIBUTE = "data-section";

export const sections = [
  {
    id: "especialidades-section",
    name: "specialties",
    component: renderSpecialties,
  },
  { id: "dashboard-section", name: "dashboard", component: renderDashboard },
];

function toggleNavLinkActiveClass(navLink, isActive) {
  navLink.classList.toggle("active", isActive);
  navLink.parentElement.classList.toggle("active", isActive);
}

function updateActiveNavLinks(sectionId) {
  const navLinks = document.querySelectorAll(SELECTORS.NAV_LINKS);
  navLinks.forEach((navLink) => {
    const targetSectionId = navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE);
    const isActive = targetSectionId === sectionId;
    toggleNavLinkActiveClass(navLink, isActive);
  });
}

function renderSection(sectionId) {
  const content = document.getElementById("content");
  const section = sections.find((section) => section.id === sectionId);
  if (section) {
    return section.component(content);
  }
  content.innerHTML = "<p>Sección no encontrada</p>";
}

function navigateToSection(
  sectionId,
  { replace, updateUrl } = { updateUrl: false, replace: false }
) {
  console.log("SectionID", sectionId)
  if (!sectionId) return;

  if (updateUrl) {
    const navLink = document.querySelector(
      `${SELECTORS.NAV_LINKS}[${TARGET_SECTION_ID_ATTRIBUTE}=${sectionId}]`
    );
    if (navLink) {
      const hash = navLink.getAttribute("href").substring(1);
      if (replace) {
        history.replaceState(null, "", `#${hash}`);
      } else {
        history.pushState(null, "", `#${hash}`);
      }
    }
  }
  renderSection(sectionId);
  updateActiveNavLinks(sectionId);

  // cerrar sidebar en mobile
  const sidebar = document.querySelector(SELECTORS.SIDEBAR);
  if (window.innerWidth < MOBILE_BREAKPOINT && sidebar) {
    sidebar.classList.remove("collapsed");
  }
}

function getSectionIdFromHash(hash) {
  const sectionName = hash.substring(1) || SELECTORS.DEFAULT_SECTION_NAME;
  const navLink = document.querySelector(
    `${SELECTORS.NAV_ITEMS}[href="#${sectionName}"]`
  );
  return navLink ? navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE) : null;
}

function handleInitialLoad() {
  const sectionId = getSectionIdFromHash(window.location.hash);
  navigateToSection(sectionId, { replace: true, updateUrl: false });
}

function handleNavigation(event) {
  const navLink = event.target.closest(SELECTORS.NAV_LINKS);
  if (navLink) {
    event.preventDefault();
    navigateToSection(navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE), {
      updateUrl: true,
    });
  }
}
function handleSidebarCollapse(sidebar) {
  sidebar.classList.toggle("collapsed");
}

function setupEventListeners(sidebar, sidebarCollapse) {
  // Manejar cambios en la URL (atras y adelante)
  window.addEventListener("popstate", () => {
    const sectionId = getSectionIdFromHash(window.location.hash);
    navigateToSection(sectionId);
  });
  // Manejar clics en los enlaces del sidebar
  sidebar.addEventListener("click", handleNavigation);
  // Manejar click en el boton de collapse
  sidebarCollapse.addEventListener("click", () =>
    handleSidebarCollapse(sidebar)
  );
}

function initAdmin() {
  const sidebar = document.querySelector(SELECTORS.SIDEBAR);
  const sidebarCollapse = document.querySelector(SELECTORS.SIDEBAR_COLLAPSE);
  if (!sidebar || !sidebarCollapse) {
    return;
  }
  handleInitialLoad();

  setupEventListeners(sidebar, sidebarCollapse);

  // Inicializar modulos de las vistas
  // initSpecialties();
}

document.addEventListener("DOMContentLoaded", initAdmin);
