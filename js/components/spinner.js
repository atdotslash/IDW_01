const SPINNER_CONTAINER_CLASS = 'd-flex align-items-center justify-content-center m-4';
export function createSpinner({  text = 'Cargando...', className = SPINNER_CONTAINER_CLASS } = {}) {
  const container = document.createElement('div');
  container.className = className;
  
  const spinner = document.createElement('div');
  spinner.className = `spinner-border`.trim();
  spinner.role = 'status';
  
  const srOnly = document.createElement('span');
  srOnly.className = 'visually-hidden';
  srOnly.textContent = text;
  
  spinner.appendChild(srOnly);
  container.appendChild(spinner);
  
  if (text) {
    const textNode = document.createElement('span');
    textNode.className = 'ms-2';
    textNode.textContent = text;
    container.appendChild(textNode);
  }
  
  return container;
}


export function showSpinner(container, options) {
  const spinner = createSpinner(options);
  container.innerHTML = '';
  container.appendChild(spinner);
  
  return () => {
    if (container.contains(spinner)) {
      container.removeChild(spinner);
    }
  };
}
