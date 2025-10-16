export const renderForm = (fields, initialData = {}) => {

  const form = document.createElement("form");
  form.id = "entity-form";
  form.noValidate = true;

  fields.forEach((field) => {
    const value = initialData?.[field.name] ?? field.value ?? "";
    const formGroup = document.createElement("div");
    formGroup.className = "mb-3";

    const label = document.createElement("label");
    label.htmlFor = field.name;
    label.className = "form-label";
    label.textContent = field.label;
    formGroup.appendChild(label);

    let input;

    if (field.type === "textarea") {
      const textarea = document.createElement("textarea");
      textarea.rows = 3;
      textarea.textContent = value;
      input = textarea;
    } else if (field.type === "select") {
      const select = document.createElement("select");
      if (field.multiple) {
        select.multiple = true;
        select.size = Math.min(field.options?.length || 5, 5);
      }
      if (field.options) {
        field.options.forEach((opt) => {
          const option = document.createElement("option");
          option.value = String(opt.value);
          option.textContent = opt.text;
          if (field.multiple && Array.isArray(value)) {
            if (value.map(String).includes(String(opt.value))) {
              option.selected = true;
            }
          } else if (String(opt.value) === String(value)) {
            option.selected = true;
          }
          select.appendChild(option);
        });
      }
      input = select;
    } else {
      const inputEl = document.createElement("input");
      inputEl.type = field.type;
      if (field.type !== "file") {
        inputEl.value = value;
      }
      input = inputEl;
    }
    input.id = field.name;
    input.className = "form-control";
    input.name = field.name;
    if (field.required) input.required = true;
    if (field.disabled) input.disabled = true;

    if (field.attributes) {
      Object.entries(field.attributes).forEach(([key, value]) => {
        input.setAttribute(key, String(value));
      });
    }
    let previewContainer = null
    if (field.type === "file" && value) {
       previewContainer = document.createElement("div");
      previewContainer.className = "mt-2";
      previewContainer.innerHTML = `
        <p class="form-text mb-1">Imagen actual:</p>
        <img src="${value}" alt="Previsualización" class="img-thumbnail" style="max-width: 100px; max-height: 100px; object-fit: cover;">
      `;
    }
    formGroup.appendChild(input);
    if (previewContainer) {
      formGroup.appendChild(previewContainer);
    }

    const invalidFeedback = document.createElement("div");
    invalidFeedback.className = "invalid-feedback";
    invalidFeedback.textContent =
      field.validationMessage || "Este campo es requerido.";
    formGroup.appendChild(invalidFeedback);

    form.appendChild(formGroup);
  });

  return form;
};

export const getFormData = (form) => {
  const formData = new FormData(form);
  const data = {};
  const keys = new Set();
  formData.forEach((_, key) => keys.add(key));

  keys.forEach((key) => {
    // para campos como checkboxes múltiples o selects múltiples
    const values = formData.getAll(key);
    // Si hay más de un valor, es un multiselect, guardamos el array.
    // Si no, guardamos el único valor.
    data[key] = values.length > 1 ? values : values[0];
  });

  return data;
};
