(function () {
  "use strict";

  function syncCardUrls(config) {
    config.sections.cards.cvProfile.url = config.links.cvUrl;
    config.sections.cards.capstone.url = config.links.capstoneUrl;
    config.sections.cards.research.url = config.links.researchUrl;
    config.sections.cards.portfolio.url = config.links.portfolioUrl;
  }

  function formFields(form) {
    return Array.prototype.slice.call(form.querySelectorAll("[data-path]"));
  }

  function valueForField(config, field) {
    var path = field.getAttribute("data-path");
    var value = window.CardSystem.getByPath(config, path);
    if (field.dataset.format === "list") {
      return Array.isArray(value) ? value.join(", ") : value || "";
    }
    return value;
  }

  function populateForm(form, config) {
    formFields(form).forEach(function (field) {
      var value = valueForField(config, field);
      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else {
        field.value = value == null ? "" : value;
      }
    });
  }

  function collectForm(form, baseConfig) {
    var next = window.CardSystem.deepClone(baseConfig);
    formFields(form).forEach(function (field) {
      var path = field.getAttribute("data-path");
      var value;

      if (field.type === "checkbox") {
        value = field.checked;
      } else if (field.dataset.format === "list") {
        value = field.value
          .split(/[,\n]/)
          .map(function (item) {
            return item.trim();
          })
          .filter(Boolean);
      } else {
        value = field.value;
      }

      window.CardSystem.setByPath(next, path, value);
    });

    syncCardUrls(next);
    return window.CardSystem.normaliseConfig(next);
  }

  function updateStatus(message) {
    var status = document.getElementById("editor-status");
    if (status) {
      status.textContent = message;
    }
  }

  function renderPreview(config) {
    var root = document.getElementById("editor-preview-root");
    if (!root) {
      return;
    }
    window.CardSystem.renderHome(root, config, {
      interactive: false,
      showAlternative: true,
      previewMode: true,
      heading: "Live preview"
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.getAttribute("data-page") !== "editor") {
      return;
    }

    var form = document.getElementById("editor-form");
    var baseConfig = window.CardSystem.getBaseConfig();
    var currentConfig = window.CardSystem.hasDraft()
      ? window.CardSystem.getDraftConfig()
      : baseConfig;

    populateForm(form, currentConfig);
    renderPreview(currentConfig);

    function persistAndRender(message) {
      currentConfig = collectForm(form, baseConfig);
      window.CardSystem.saveDraft(currentConfig);
      renderPreview(currentConfig);
      updateStatus(message || "Draft saved locally in this browser.");
    }

    form.addEventListener("input", function () {
      persistAndRender();
    });

    form.addEventListener("change", function () {
      persistAndRender();
    });

    document.getElementById("export-config").addEventListener("click", function () {
      persistAndRender("Exporting config.js...");
      window.CardSystem.downloadText(
        "config.js",
        window.CardSystem.serializeConfig(currentConfig),
        "application/javascript;charset=utf-8"
      );
      updateStatus("config.js exported. Replace the repository file and redeploy.");
    });

    document.getElementById("export-vcard").addEventListener("click", function () {
      persistAndRender("Exporting fallback contact file...");
      window.CardSystem.downloadText(
        "jack-tinsley.vcf",
        window.CardSystem.buildVCard(currentConfig),
        "text/vcard;charset=utf-8"
      );
      updateStatus("Fallback .vcf exported.");
    });

    document.getElementById("reset-draft").addEventListener("click", function () {
      currentConfig = window.CardSystem.getBaseConfig();
      populateForm(form, currentConfig);
      window.CardSystem.saveDraft(currentConfig);
      renderPreview(currentConfig);
      updateStatus("Draft reset to the repository config.");
    });

    document.getElementById("clear-draft").addEventListener("click", function () {
      window.CardSystem.clearDraft();
      currentConfig = window.CardSystem.getBaseConfig();
      populateForm(form, currentConfig);
      renderPreview(currentConfig);
      updateStatus("Browser draft cleared. You are back on the repository config.");
    });
  });
})();
