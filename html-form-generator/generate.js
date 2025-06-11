const fs = require("fs");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateField(name, config, path = "") {
  const fullName = path ? `${path}[${name}]` : name;
  const id = fullName;
  const label = config.label || capitalize(name);
  const hint = config.hint ? `<div>${config.hint}</div>` : "";

  const attributes = Object.entries(config)
    .filter(([key]) => !["type", "label", "hint", "options", "placeholder", "schema"].includes(key))
    .map(([key, val]) => `${key}="${val}"`)
    .join(" ");

  let html = "";

  switch (config.type) {
    case "text":
    case "date":
    case "email":
    case "number":
    case "password":
      html = `<div>
  <label for="${id}">${label}</label>
  <input type="${config.type}" name="${fullName}" id="${id}" ${attributes}>
  ${hint}
</div>`;
      break;

    case "textarea":
      html = `<div>
  <label for="${id}">${label}</label>
  <textarea name="${fullName}" id="${id}" ${attributes}></textarea>
  ${hint}
</div>`;
      break;

    case "select":
      html = `<div>
  <label for="${id}">${label}</label>
  <select name="${fullName}" id="${id}">
    ${config.placeholder ? `<option value="">${config.placeholder}</option>` : ""}
    ${config.options.map(([val, text]) => `<option value="${val}">${text}</option>`).join("\n")}
  </select>
  ${hint}
</div>`;
      break;

    case "schema":
      html = `<fieldset>
  <legend>${capitalize(name)}</legend>
  ${Object.entries(config.schema).map(([childName, childConfig]) =>
    generateField(childName, childConfig, fullName)).join("\n")}
</fieldset>`;
      break;

    default:
      html = `<!-- Unknown type: ${config.type} -->`;
  }

  return html;
}

function generateForm(schema) {
  return Object.entries(schema)
    .map(([name, config]) => generateField(name, config))
    .join("\n\n");
}

const schema = JSON.parse(fs.readFileSync("schema.json", "utf-8"));
const formHtml = generateForm(schema);
fs.writeFileSync("output.html", formHtml);

console.log("HTML form generated: output.html");
