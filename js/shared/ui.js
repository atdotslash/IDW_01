export const buttonState = {

  disable(button, loadingText = 'Procesando...') {
    if (!button) return {};

    const state = {
      button,
      originalText: button.innerHTML,
      originalDisabled: button.disabled
    };

    button.disabled = true;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm ${loadingText ? 'me-1' : ''}" role="status" aria-hidden="true"></span>
        ${loadingText}
      `;

    return {
      restore: (newText) => {
        if (!button) return;
        button.disabled = state.originalDisabled;
        button.innerHTML = newText !== undefined ? newText : state.originalText;
      }
    };
  }
};

export const formState = {
  disableForm(form) {
    if (!form) return { restore: () => { } };

    const inputs = form.querySelectorAll('input, select, textarea');
    const states = Array.from(inputs).map(input => ({
      element: input,
      disabled: input.disabled
    }));

    // Deshabilitar todos los inputs
    inputs.forEach(input => {
      input.disabled = true;
    });

    // Agregar clase de carga
    // form.classList.add('form-loading');

    return {
      restore: () => {
        states.forEach(state => {
          if (state.element) {
            state.element.disabled = state.disabled;
          }
        });
        // form.classList.remove('form-loading');
      }
    };
  }
};