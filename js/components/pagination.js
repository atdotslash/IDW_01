const PAGINATION_CLASSES = {
	PAGINATION: "pagination justify-content-md-end justify-content-center",
	PAGE_ITEM: "page-item",
	PAGE_LINK: "page-link",
	DISABLED: "disabled",
	ACTIVE: "active",
};
const PREVIOUS_TEXT = "Anterior";
const NEXT_TEXT = "Siguiente";
const LAST_PAGE_TEXT = "Último";
const FIRST_PAGE_TEXT = "Primero";

function createPaginationListItem({
	isDisabled = false,
	text,
	onClick,
	isActive = false,
	iconClasses = "",
  title=""
}) {
	const liElement = document.createElement("li");
	liElement.className = `${PAGINATION_CLASSES.PAGE_ITEM} ${isDisabled ? PAGINATION_CLASSES.DISABLED : ""} ${isActive ? PAGINATION_CLASSES.ACTIVE : ""}`;
	liElement.setAttribute("aria-label", text);
	const buttonElement = document.createElement("button");
	buttonElement.className = PAGINATION_CLASSES.PAGE_LINK;
	if (!iconClasses) {
		buttonElement.textContent = text;
	}
  if (title) {
    buttonElement.title = title;
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
	const createNavItem = ({ text, iconClasses, page, isDisabled, title = "" }) =>
		createPaginationListItem({
			text,
			iconClasses,
			isDisabled,
      title,
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
      iconClasses: "fa fa-angle-double-left",
      title: FIRST_PAGE_TEXT,
			page: 1,
			isDisabled: currentPage === 1,
		}),
	);
	ul.appendChild(
		createNavItem({
			text: PREVIOUS_TEXT,
			iconClasses: "fa-solid fa-angle-left",
			page: currentPage - 1,
			isDisabled: currentPage === 1,
      title: PREVIOUS_TEXT,
		}),
	);

	const createPageLink = (pageNumber) => {
			return createPaginationListItem({
					text: pageNumber.toString(),
					onClick: () => onPageChange(pageNumber),
					isActive: pageNumber === currentPage,
			});
	};

	const addEllipsis = () => {
			const li = createPaginationListItem({
					text: "...",
					isDisabled: true,
			});
			ul.appendChild(li);
	};

	if (currentPage > 3) {
			addEllipsis();
	}

	for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
		ul.appendChild(createPageLink(i));
	}

	ul.appendChild(
		createNavItem({
			text: NEXT_TEXT,
			iconClasses: "fa-solid fa-angle-right",
			page: currentPage + 1,
      title: NEXT_TEXT,
			isDisabled: currentPage === totalPages,
		}),
	);
	ul.appendChild(
		createNavItem({
		  iconClasses: "fa fa-angle-double-right",
			page: totalPages,
			isDisabled: currentPage === totalPages,
      title: LAST_PAGE_TEXT,
		}),
	);


	nav.appendChild(ul);
	return nav;
}
