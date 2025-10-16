import { renderDashboard } from "./views/dashboard.js";
import { renderSpecialties } from "./views/specialties.js";
import { renderDoctors } from "./views/doctors.js";
import storageService from "./storage/index.js";
import { auth } from "./shared/auth.js";
import { PAGES } from "./shared/constants.js";

const UI_SELECTORS = {
  SIDEBAR: "#sidebar",
  SIDEBAR_COLLAPSE: "#sidebarCollapse",
  NAV_LINK: ".nav-link",
  NAV_ITEMS: ".nav-item",
  CONTENT: "#content",
  LOGOUT_BUTTON: "#logout-btn"
};
const DEFAULT_SECTION_NAME = "dashboard"
const TARGET_SECTION_ID_ATTRIBUTE = "data-section";


let adminState = {
  currentSection: DEFAULT_SECTION_NAME,
  ui: {
    sidebar: null,
    navLinks: null,
    content: null
  },
  navigation: {
    sections: new Map([
      ["dashboard", { id: "dashboard-section", name: "dashboard", component: renderDashboard }],
      ["specialties", { id: "especialidades-section", name: "especialidades", component: renderSpecialties }],
      ["doctors", { id: "medicos-section", name: "medicos", component: renderDoctors }],
    ])
  }
};




function toggleNavLinkActiveClass(navLink, isActive) {
  navLink.classList.toggle("active", isActive);
  navLink.parentElement.classList.toggle("active", isActive);
}

function updateActiveNavLinks(sectionId) {
  if (!adminState.ui.navLinks) {
    const links = document.querySelectorAll(UI_SELECTORS.NAV_LINK);
    adminState.ui.navLinks = Array.from(links);
  }
  adminState.ui.navLinks.forEach((navLink) => {
    const targetSectionId = navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE);
    const isActive = targetSectionId === sectionId;
    toggleNavLinkActiveClass(navLink, isActive);
  });
}

function renderSection(sectionId) {
  if (!adminState.ui.content) {
    adminState.ui.content = document.querySelector(UI_SELECTORS.CONTENT);
  }
  const { content } = adminState.ui
  const section = Array.from(adminState.navigation.sections.values()).find((section) => section.id === sectionId || section.name === sectionId);
  content.innerHTML = ""
  if (!section) {
    content.innerHTML = "<p>Sección no encontrada</p>";
    return
  }
  const result = section.component(content);
  const checkEmptyState = result?.checkEmptyState || (() => { });
  window.checkEmptyState = checkEmptyState
}

function navigateToSection(
  sectionId,
  { replace = false, updateUrl = true } = {}
) {
  if (!sectionId) {
    sectionId = DEFAULT_SECTION_NAME;
  }
  const section = Array.from(adminState.navigation.sections.values()).find((section) => section.id === sectionId || section.name === sectionId);

  if (!section) {
    return navigateToSection(DEFAULT_SECTION_NAME, { replace, updateUrl });
  }

  adminState.currentSection = section.name

  updateActiveNavLinks(section.id);
  renderSection(section.id);

  if (updateUrl) {
    const navLink = document.querySelector(
      `${UI_SELECTORS.NAV_LINK}[${TARGET_SECTION_ID_ATTRIBUTE}=${sectionId}]`
    );
    if (navLink) {
      const hash = navLink.getAttribute("href");
      const url = new URL(window.location);
      url.hash = hash;
      history[replace ? "replaceState" : "pushState"]({ sectionId }, "", url);
    }
  }



}


function getSectionIdFromHash() {
  const hash = window.location.hash;
  const navLink = document.querySelector(
    `${UI_SELECTORS.NAV_LINK}[href="${hash}"]`
  );
  return navLink ? navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE) : null;
}

function handleInitialLoad() {
  updateNavbar();
  const sectionId = getSectionIdFromHash() || DEFAULT_SECTION_NAME;
  navigateToSection(sectionId, { replace: true, updateUrl: false });
}

// function handleNavigation(event) {
//   const navLink = event.target.closest(UI_SELECTORS.NAV_LINK);
//   if (navLink) {
//     event.preventDefault();
//     navigateToSection(navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE), {
//       updateUrl: true,
//     });
//   }
// }


function handleLogout(event) {
  if (event.target.closest(UI_SELECTORS.LOGOUT_BUTTON)) {
    event.preventDefault();
    storageService.session.clearAdmin();
    auth.redirectToLogin();
  }
}

function setupEventListeners() {

  // Manejar clics en los enlaces del sidebar
  // adminState.ui.sidebar.addEventListener("click", handleNavigation);
  document.body.addEventListener("click", handleLogout);
  // Manejar cambios en la URL (atras y adelante)
  window.addEventListener("popstate", (event) => {
    navigateToSection(event.state?.sectionId, { updateUrl: false });
  });
  // Manejar cambios en la URL (hashchange)
  window.addEventListener("hashchange", () => {
    const sectionId = getSectionIdFromHash()
    navigateToSection(sectionId, { updateUrl: false });
  });
}

function updateNavbar() {
  const session = storageService.session.getAdmin()
  const { username } = session.user
  const divUserInfo = document.getElementById("user-info");
  if (divUserInfo) {
    divUserInfo.innerHTML = `<i class="fa-solid fa-user me-1"></i>${username}`;
  }
  document.querySelector(UI_SELECTORS.LOGOUT_BUTTON)?.classList.toggle("d-none", false);
}


function initAdminApp() {
  if (!auth.checkAndRedirect({ redirectTo: PAGES.LOGIN, redirectIf: false })) {
    return;
  }
  storageService.initialize();
  adminState.ui.sidebar = document.querySelector(UI_SELECTORS.SIDEBAR);
  if (!adminState.ui.sidebar) {
    return;
  }
  handleInitialLoad();
  setupEventListeners();
}

document.addEventListener("DOMContentLoaded", initAdminApp);
