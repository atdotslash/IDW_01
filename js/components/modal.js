const MODAL_CONTAINER_ID = 'modal-container';

function createModalContainer() {
  if (document.getElementById(MODAL_CONTAINER_ID)) {
    return;
  }
  const container = document.createElement('div');
  container.id = MODAL_CONTAINER_ID;
  document.body.appendChild(container);
}


export function createReusableModal({ id, title, body, footerButtons = [], onHide = null }) {
  createModalContainer();

  const container = document.getElementById(MODAL_CONTAINER_ID);

  const footerHTML = footerButtons.length
    ? `<div class="modal-footer">${footerButtons
        .map(
          (btn, index) =>
            `<button type="button" class="${btn.className}" id="${id}-btn-${index}">${btn.text}</button>`
        )
        .join('')}</div>`
    : '';

  const modalHTML = `
    <div class="modal fade" id="${id}" tabindex="-1"   aria-labelledby="${id}Label" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${id}Label">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${body}
          </div>
          ${footerHTML}
        </div>
      </div>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHTML;
  const modalElement = tempDiv.firstElementChild;
  const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (typeof onHide === 'function') {
        onHide();
      }
    });
  }
  footerButtons.forEach((btn, index) => {
    const buttonElement = modalElement.querySelector(`#${id}-btn-${index}`);
    if (buttonElement) {
      buttonElement.addEventListener('click', btn.onClick);
    }
  });
  
  container.appendChild(modalElement);

  const modalInstance = new bootstrap.Modal(modalElement, {
    backdrop: 'static',
  });

  const destroy = () => {
    if (typeof onHide === "function") {
      onHide()
    }
    modalElement.removeEventListener("shown.bs.modal", handleShown)
    modalInstance.dispose();
    modalElement.remove();
  };


  function handleShown()  {
    // enfocar el primer input cuando se muestre el modal
    const firstInput = modalElement.querySelector('input, select, textarea');
    if (firstInput) {
        firstInput.focus({ preventScroll: true });
    }
  }

  modalElement.addEventListener('shown.bs.modal', handleShown);
  modalElement.addEventListener('hidden.bs.modal', () => {
    destroy();
  });

  return {
    show: () => modalInstance.show(),
    hide: () => modalInstance.hide(),
    destroy,
    getElement: () => modalElement,
  };
}
