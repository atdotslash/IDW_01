const PAGINATION_CLASSES = {
	PAGINATION: "pagination d-flex flex-wrap row-gap-2",
	PAGE_ITEM: "page-item",
	PAGE_LINK: "page-link",
	DISABLED: "disabled",
	ACTIVE: "active",
};
const PREVIOUS_TEXT = "Anterior";
const NEXT_TEXT = "Siguiente";

function createPaginationListItem({
	isDisabled = false,
	text,
	onClick,
	isActive = false,
	iconClasses = "",
}) {
	const liElement = document.createElement("li");
	liElement.className = `${PAGINATION_CLASSES.PAGE_ITEM} ${isDisabled ? PAGINATION_CLASSES.DISABLED : ""} ${isActive ? PAGINATION_CLASSES.ACTIVE : ""}`;
	liElement.setAttribute("aria-label", text);
	const buttonElement = document.createElement("button");
	buttonElement.className = PAGINATION_CLASSES.PAGE_LINK;
	if (!iconClasses) {
		buttonElement.textContent = text;
	}
	buttonElement.disabled = isDisabled;
	if (!isActive) {
		buttonElement.addEventListener("click", onClick);
	}
	if (iconClasses) {
		const iElement = document.createElement("i");
		iElement.setAttribute("aria-hidden", "true");
		iElement.classList.add(...iconClasses.split(" "));
		buttonElement.appendChild(iElement);
	}
	liElement.appendChild(buttonElement);
	return liElement;
}

export function createPagination({ total, skip, limit }, onPageChange) {
	const createNavItem = ({ text, iconClasses, page, isDisabled }) =>
		createPaginationListItem({
			text,
			iconClasses,
			isDisabled,
			onClick: () => onPageChange(page),
		});

	const totalPages = Math.ceil(total / limit);
	const currentPage = Math.floor(skip / limit) + 1;

	const nav = document.createElement("nav");
	nav.setAttribute("aria-label", "Page navigation");

	const ul = document.createElement("ul");
	ul.className = PAGINATION_CLASSES.PAGINATION;
	ul.appendChild(
		createNavItem({
			text: PREVIOUS_TEXT,
			iconClasses: "fa-solid fa-angle-left",
			page: currentPage - 1,
			isDisabled: currentPage === 1,
		}),
	);

	for (let i = 1; i <= totalPages; i++) {
		const li = createPaginationListItem({
			text: i.toString(),
			onClick: () => onPageChange(i),
			isActive: i === currentPage,
		});
		ul.appendChild(li);
	}

	ul.appendChild(
		createNavItem({
			text: NEXT_TEXT,
			iconClasses: "fa-solid fa-angle-right",
			page: currentPage + 1,
			isDisabled: currentPage === totalPages,
		}),
	);

	nav.appendChild(ul);
	return nav;
}
