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
