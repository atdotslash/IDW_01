const TOAST_CONTAINER_ID = 'toast-container';

const TOAST_VARIANTS = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'danger',
    get: function(variant, defaultValue = "success")   {
        return this[variant] || defaultValue;
    }
}


function createToastContainer() {
    if (document.getElementById(TOAST_CONTAINER_ID)) {
        return;
    }
    const container = document.createElement("div")
    container.innerHTML = `
    <div class="position-fixed top-0 end-0 p-3 toast-container" id="${TOAST_CONTAINER_ID}" style="z-index: 11">
    </div>`
    document.body.appendChild(container);
}




 function createNotification() {

    createToastContainer();
    const toastContainer = document.getElementById(TOAST_CONTAINER_ID);

    function showNotification(message, type = 'success') {
        const toastId = `toast-${Date.now()}`;
        const toastType = TOAST_VARIANTS.get(type)

        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-white bg-${toastType} border-0 show`;
        toast.role = 'alert';
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
          <div class="d-flex">
            <div class="toast-body">
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        `;

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, {autohide: true, delay: 5000});
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', toast.remove);

        return toast
    }

    return {
        showNotification,
        success: (message) => showNotification(message, 'success'),
        error: (message) => showNotification(message, 'danger'),
        info: (message) => showNotification(message, 'info'),
        warning: (message) => showNotification(message, 'warning')
    }
}

const notification = createNotification();
export default notification;