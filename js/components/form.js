
  export const renderForm = (
    fields,
    initialData = {}
  ) => {
/**
 * Render a form based on the given fields
 * @typedef {Object} FormField
 * @property {string} name - The name of the field
 * @property {string} label - The label to display for the field
 * @property {string} type - The type of the form field (e.g. text, password, email, etc.)
 * @property {any} [value] - The initial value of the field
 * @property {boolean} [required] - Whether the field is required
 * @property {string} [validationMessage] - The message to display when the field is invalid
 * @property {{ value: string | number; text: string }} [options] - The options for a select field
 * @property {boolean} [disabled] - Whether the field is disabled
 * @property {Record<string, any>} [attributes] - Additional attributes to add to the field
 * @param {FormField[]} fields - Array of form fields
 * @param {Object} [initialData={}] - Initial data to fill the form with
 * @returns {HTMLFormElement} - Rendered form element
 */
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
  
      let input
  
      if (field.type === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.rows = 3;
        textarea.textContent = value;
        input = textarea;
      } else if (field.type === "select") {
        const select = document.createElement("select");
        if (field.options) {
          field.options.forEach((opt) => {
            const option = document.createElement("option");
            option.value = String(opt.value);
            option.textContent = opt.text;
            if (String(opt.value) === String(value)) {
              option.selected = true;
            }
            select.appendChild(option);
          });
        }
        input = select;
      } else {
        const inputEl = document.createElement("input");
        inputEl.type = field.type;
        inputEl.value = value;
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
  
      formGroup.appendChild(input);
  
      const invalidFeedback = document.createElement("div");
      invalidFeedback.className = "invalid-feedback";
      invalidFeedback.textContent = field.validationMessage || 'Este campo es requerido.';
      formGroup.appendChild(invalidFeedback);
  
      form.appendChild(formGroup);
    });
  
    return form;
  };
  
  export const getFormData = (form) => {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  };
  