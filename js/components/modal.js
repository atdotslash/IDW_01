


export function createReusableModal({ id = "modal-app", title, body, footerButtons = [], onHide = null }) {


  const footerHTML = footerButtons.length
    ? `<div class="modal-footer">${footerButtons
      .map(
        (btn, index) =>
          `<button type="button" ${btn.disabled ? 'disabled' : ''} class="${btn.className}" id="${id}-btn-${index}">${btn.text}</button>`
      )
      .join('')}</div>`
    : '';

  const modalElement = document.createElement('div');
  modalElement.id = id;
  modalElement.className = "modal fade";
  modalElement.tabIndex = -1;
  modalElement.ariaLabelledby = `${id}Label`;
  modalElement.ariaHidden = true;
  modalElement.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${id}Label">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
          </div>
          ${footerHTML}
        </div>
     </div>
  `;

  const modalBody = modalElement.querySelector('.modal-body');
  if (typeof body === 'string') {
    modalBody.innerHTML = body;
  } else {
    modalBody.appendChild(body);
  }

  const modalInstance = new bootstrap.Modal(modalElement, {
    backdrop: 'static',
  });
  footerButtons.forEach((btn, index) => {
    const buttonElement = modalElement.querySelector(`#${id}-btn-${index}`);
      buttonElement?.addEventListener('click', (event) => btn?.onClick && btn.onClick(event, modalInstance));
  });

  document.body.appendChild(modalElement);

 

  const destroy = () => {
    if (typeof onHide === "function") {
      onHide()
    }
    modalElement.removeEventListener("shown.bs.modal", handleShown)
    modalInstance.dispose();
    modalElement.remove();
  };


  function handleShown() {
    // enfocar el primer input cuando se muestre el modal
    const firstInput = modalElement.querySelector('input, select, textarea');
    firstInput?.focus({ preventScroll: true });
  }

  modalElement.addEventListener('shown.bs.modal', handleShown);
  modalElement.addEventListener('hidden.bs.modal', destroy);
  modalInstance.show()
  return {
    show: () => modalInstance.show(),
    hide: () => modalInstance.hide(),
    destroy,
    getElement: () => modalElement,
  };
}
