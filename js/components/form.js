const getCommonAttributes = (props) => {
	const attributes = {
		name: props.name,
		id: props.name,
		className: props.className || "form-control",
	}
	if (props.required) {
		attributes.required = true;
	}
	if (props.disabled) {
		attributes.disabled = true;
	}
	return attributes;
}


const applyAttributes = (element, attributes = {}) => {
	Object.assign(element, attributes);
};

export const createTextArea = (props, value) => {
	const textarea = document.createElement("textarea");
	applyAttributes(textarea, getCommonAttributes(props));
	textarea.rows = props?.rows || 3;
	textarea.textContent = value;
	return textarea;
};

export const createSelect = (props, value) => {
	const select = document.createElement("select");
	applyAttributes(select, getCommonAttributes({className: "form-select", ...props, }));
	if (props.multiple) {
		select.multiple = true;
		select.size = Math.min(props.options?.length || 5, 5);
	}
	props.options?.forEach((opt) => {
		const option = document.createElement("option");
		option.value = String(opt.value);
		option.textContent = opt.text;
		const isSelected = props.multiple
			? Array.isArray(value) && value.map(String).includes(String(opt.value))
			: String(opt.value) === String(value);
		if (isSelected) {
			option.selected = true;
		}
		select.appendChild(option);
	});
	return select;
};
const createDefaultInput = (props, value) => {
	const input = document.createElement("input");
	applyAttributes(input, getCommonAttributes(props));
	input.type = props.type;
	if (props.type !== "file") {
		input.value = value;
	}
	if (props.min) {
		input.min = props.min;
	}
	if (props.max) {
		input.max = props.max;
	}
	if (props.step) {
		input.step = props.step;
	}
	return input;
};

const inputFactory = {
	textarea: createTextArea,
	default: createDefaultInput,
	select: createSelect,
};

const createInputElement = (props, value) => {
	const createFunction = inputFactory[props.type] ?? inputFactory.default;
	return createFunction(props, value);
};

const createPreview = (value) => {
	const previewContainer = document.createElement("div");
	previewContainer.className = "mt-2";
	previewContainer.innerHTML = `
       <p class="form-text mb-1">Imagen actual:</p>
       <img src="${value}" alt="Previsualización" class="img-thumbnail object-fit-cover" style="max-width: 100px;
 max-height: 100px;">
     `;
	return previewContainer;
};

const createInvalidFeedback = (validationMessage) => {
	const invalidFeedback = document.createElement("div");
	invalidFeedback.className = "invalid-feedback";
	invalidFeedback.textContent = validationMessage || "Este campo es requerido.";
	return invalidFeedback;
};

const createLabel = ({ name, label }) => {
	const labelEl = document.createElement("label");
	labelEl.htmlFor = name;
	labelEl.className = "form-label";
	labelEl.textContent = label;
	return labelEl;
};

const createFormGroup = (props, initialData) => {
	const { name, type, validationMessage, col } = props;
	const value = initialData?.[name] ?? props.value ?? "";

	const fieldWrapper = document.createElement("div");
	fieldWrapper.className = "mb-3";

	fieldWrapper.appendChild(createLabel(props));
	fieldWrapper.appendChild(createInputElement(props, value));
	if (type === "file" && value) {
		fieldWrapper.appendChild(createPreview(value));
	}
	fieldWrapper.appendChild(createInvalidFeedback(validationMessage));

	if (col) {
		const colWrapper = document.createElement("div");
		colWrapper.className = col;
		colWrapper.appendChild(fieldWrapper);
		return colWrapper;
	}
	return fieldWrapper;
};

export const renderForm = (fields, initialData = {}) => {
	const form = document.createElement("form");
	form.id = "entity-form";
	form.noValidate = true;

	fields.forEach((fieldOrRow) => {
		// Si el elemento es un array, lo tratamos como una fila.
		if (Array.isArray(fieldOrRow)) {
			const row = document.createElement("div");
			row.className = "row";
			fieldOrRow.forEach((fieldProps) => {
				const propsWithDefaultCol = { col: "col", ...fieldProps };
				const formGroup = createFormGroup(propsWithDefaultCol, initialData);
				row.appendChild(formGroup);
			});
			form.appendChild(row);
		} else {
			const formGroup = createFormGroup(fieldOrRow, initialData);
			form.appendChild(formGroup);
		}
	});
	return form;
};

export const getFormData = (form) => {
	const formData = new FormData(form);
	return Object.fromEntries(
		[...new Set(formData.keys())].map((key) => {
			const values = formData.getAll(key);
			return [key, values.length > 1 ? values : values[0]];
		}),
	);
};
