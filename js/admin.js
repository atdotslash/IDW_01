import { init as initDashboard } from "./views/dashboard.js";
import storageService from "./storage/index.js";
import { init as initAppointments } from "./views/appointments.js";
import { init as initSpecialties } from "./views/specialties.js";
import { init as initDoctors } from "./views/doctors.js";
import * as ui from "./core/ui.js";
import { fullName } from "./shared/formatters.js";
import { auth } from "./shared/auth.js";

const UI_SELECTORS = {
	SIDEBAR: "#sidebar",
	SIDEBAR_COLLAPSE: "#sidebarCollapse",
	NAV_LINK: ".nav-link",
	NAV_ITEMS: ".nav-item",
	CONTENT: "#content",
	LOGOUT_BUTTON: "#logout-btn",
	SIDEBAR_OVERLAY: "#sidebar-overlay",
};

const CLASSNAME_ACTIVE = "active";
const DEFAULT_SECTION_NAME = "dashboard";
const TARGET_SECTION_ID_ATTRIBUTE = "data-section";

const adminState = {
	currentSection: DEFAULT_SECTION_NAME,
	ui: {
		sidebar: null,
		navLinks: null,
		content: null,
		overlay: null,
	},
	navigation: {
		sections: new Map([
			[
				"dashboard",
				{
					id: "dashboard-section",
					name: "dashboard",
					component: initDashboard,
				},
			],
			[
				"specialties",
				{
					id: "especialidades-section",
					name: "especialidades",
					component: initSpecialties,
				},
			],
			[
				"doctors",
				{ id: "medicos-section", name: "medicos", component: initDoctors },
			],
			[
				"appointments",
				{ id: "turnos-section", name: "turnos", component: initAppointments },
			],
		]),
	},
};

function toggleNavLinkActiveClass(navLink, isActive) {
	navLink.classList.toggle(CLASSNAME_ACTIVE, isActive);
	navLink.parentElement.classList.toggle(CLASSNAME_ACTIVE, isActive);
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

function renderSection(section) {
	if (!section) {
		ui.renderContent("<p>Sección no encontrada</p>");
		return;
	}
	section.component();
}

function getSectionByNameOrId(sectionId) {
	return Array.from(adminState.navigation.sections.values()).find(
		(section) => section.id === sectionId || section.name === sectionId,
	);
}

function navigateToSection(
	sectionId,
	options = { replace: false, updateUrl: true },
) {
	let section = getSectionByNameOrId(sectionId);
	if (!section) {
		section = getSectionByNameOrId(DEFAULT_SECTION_NAME);
		options.replace = true;
		options.updateUrl = true;
	}
	const { id, name } = section;
	adminState.currentSection = section;

	updateActiveNavLinks(id);
	renderSection(section);

	if (options.updateUrl) {
		const url = new URL(window.location);
		url.hash = name;
		const state = { sectionId: id };
		const title = "";

		history[options.replace ? "replaceState" : "pushState"](state, title, url);
	}
}

function getSectionIdFromHash() {
	const hash = window.location.hash;
	if (!hash) {
		return null;
	}
	const navLink = document.querySelector(
		`${UI_SELECTORS.NAV_LINK}[href="${hash}"]`,
	);
	return navLink?.getAttribute(TARGET_SECTION_ID_ATTRIBUTE) || null;
}

function handleInitialLoad() {
	storageService.initialize();
	adminState.ui.sidebar = document.querySelector(UI_SELECTORS.SIDEBAR);
	adminState.ui.overlay = document.querySelector(UI_SELECTORS.SIDEBAR_OVERLAY);
	updateNavbar();
	const sectionId = getSectionIdFromHash() || DEFAULT_SECTION_NAME;
	navigateToSection(sectionId, { replace: true, updateUrl: false });
}

function handleNavigation(event) {
	const navLink = event.target.closest(UI_SELECTORS.NAV_LINK);
	if (navLink) {
		event.preventDefault();
		const sectionId = navLink.getAttribute(TARGET_SECTION_ID_ATTRIBUTE);
		navigateToSection(sectionId);
	}
}

function handleLogout(event) {
	if (event.target.closest(UI_SELECTORS.LOGOUT_BUTTON)) {
		event.preventDefault();
		storageService.session.clear();
		auth.redirectToLogin();
	}
}

function handlePopState(event) {
	const sectionId = event.state?.sectionId || getSectionIdFromHash();
	navigateToSection(sectionId, { updateUrl: false });
}

function closeSidebar() {
	const sidebarToggle = document.querySelector(UI_SELECTORS.SIDEBAR_COLLAPSE);
	// Si el botón del menú es visible (mobile), ocultamos el sidebar.
	if (sidebarToggle && sidebarToggle.offsetParent !== null) {
		const bsCollapse = bootstrap.Collapse.getInstance(adminState.ui.sidebar);
		bsCollapse?.hide();
	}
}

function toggleOverlay(show) {
	adminState.ui?.overlay?.classList.toggle("show", show);
}

function setupEventListeners() {
	// Manejar clics en los enlaces del sidebar
	adminState.ui.sidebar.addEventListener("click", (event) => {
		handleNavigation(event);
		closeSidebar(event);
	});
	document.body.addEventListener("click", handleLogout);
	// Manejar cambios en la URL (atras y adelante)
	window.addEventListener("popstate", handlePopState);

	adminState.ui.sidebar.addEventListener("show.bs.collapse", () => {
		toggleOverlay(true);
	});
	adminState.ui.sidebar.addEventListener("hide.bs.collapse", () => {
		toggleOverlay(false);
	});

	// Cerrar sidebar al hacer clic en el overlay
	adminState.ui.overlay.addEventListener("click", () => {
		const bsCollapse = bootstrap.Collapse.getInstance(adminState.ui.sidebar);
		bsCollapse?.hide();
	});
}

function updateNavbar() {
	const session = storageService.session.get();
	const divUserInfo = document.getElementById("user-info");
	if (divUserInfo && session?.user) {
		const { firstName, lastName, image } = session.user;
		const formattedName = fullName({ nombre: firstName, apellido: lastName });
		divUserInfo.innerHTML = `<div><img class="rounded-circle me-1" src="${image}" alt="${formattedName}" width="30" height="30"/>
      <span>${formattedName}</span>
    </div>`;
	}
}

function initAdminApp() {
	handleInitialLoad();
	setupEventListeners();
}

initAdminApp();
