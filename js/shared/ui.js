export function disableButton(button, loadingText = 'Procesando...') {
  if (!button) return {
    restore: () => { }
  };

  const state = {
    button,
    originalText: button.innerHTML,
    originalDisabled: button.disabled
  };

  button.disabled = true;
  button.innerHTML = ''
  button.appendChild(createButtonSpinner(loadingText));

  return {
    restore: (newText) => {
      if (!button) return;
      button.disabled = state.originalDisabled;
      button.innerHTML = newText !== undefined ? newText : state.originalText;
    }
  };
}


function createButtonSpinner(text) {
  const spinner = document.createElement('span');
  spinner.className = 'spinner-border spinner-border-sm';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-hidden', 'true');

  const textNode = document.createTextNode(text || '');

  if (text) {
    spinner.classList.add('me-1');
  }

  const container = document.createDocumentFragment();
  container.appendChild(spinner);
  container.appendChild(textNode);

  return container;
}


export function disableForm(form) {
  if (!form) return { restore: () => { } };

  const inputs = form.querySelectorAll('input, select, textarea, button');
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
