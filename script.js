(function () {
  "use strict";

  var STORAGE_KEY = "jack-tinsley-card-draft-v1";

  var DEFAULT_CONFIG = {
    name: "Jack Tinsley",
    descriptor: "interdisciplinary practitioner",
    email: "jacktinsley0@outlook.com",
    website: "https://32juan.github.io/DigitalCard/",
    linkedInUrl: "https://www.linkedin.com/in/jacktinsley0",
    cvPath: "assets/jack-tinsley-cv.pdf",
    phone: "+44 7404 607171",
    vCard: {
      firstName: "Jack",
      lastName: "Tinsley",
      organization: "London Interdisciplinary School",
      title: "interdisciplinary practitioner",
      note: "interdisciplinary practitioner"
    }
  };

  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeDeep(base, override) {
    var output = deepClone(base || {});
    Object.keys(override || {}).forEach(function (key) {
      if (isObject(output[key]) && isObject(override[key])) {
        output[key] = mergeDeep(output[key], override[key]);
      } else {
        output[key] = deepClone(override[key]);
      }
    });
    return output;
  }

  function trim(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function getByPath(object, path) {
    return path.split(".").reduce(function (current, key) {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, object);
  }

  function setByPath(object, path, value) {
    var keys = path.split(".");
    var current = object;

    keys.forEach(function (key, index) {
      if (index === keys.length - 1) {
        current[key] = value;
        return;
      }

      if (!isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    });
  }

  function normaliseUrl(value) {
    var url = trim(value);

    if (!url) {
      return "";
    }

    if (/^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i.test(url) || url.indexOf("assets/") === 0) {
      return url;
    }

    return "https://" + url.replace(/^\/+/, "");
  }

  function deriveInitials(name) {
    var parts = trim(name).split(/\s+/).filter(Boolean);

    if (!parts.length) {
      return "JT";
    }

    return parts
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .join("");
  }

  function simpleConfig(input) {
    var source = input || window.CARD_CONFIG || {};
    var profile = source.profile || {};
    var contact = source.contact || {};
    var links = source.links || {};
    var vCard = mergeDeep(DEFAULT_CONFIG.vCard, source.vCard || {});
    var name = trim(profile.name) || trim(source.name) || DEFAULT_CONFIG.name;
    var descriptor = trim(profile.title) || trim(source.descriptor) || DEFAULT_CONFIG.descriptor;
    var website =
      trim(contact.website) ||
      trim(links.publicUrl) ||
      trim(source.website) ||
      DEFAULT_CONFIG.website;
    var email = trim(contact.email) || trim(source.email) || DEFAULT_CONFIG.email;
    var linkedInUrl =
      trim(contact.linkedIn) ||
      trim(source.linkedInUrl) ||
      trim(source.linkedinUrl) ||
      DEFAULT_CONFIG.linkedInUrl;
    var cvPath = trim(links.cvUrl) || trim(source.cvPath) || DEFAULT_CONFIG.cvPath;
    var phone = trim(contact.phone) || trim(source.phone);

    vCard.firstName = trim(vCard.firstName) || name.split(/\s+/)[0] || "Jack";
    vCard.lastName = trim(vCard.lastName) || name.split(/\s+/).slice(1).join(" ") || "Tinsley";
    vCard.organization = trim(profile.institution) || trim(vCard.organization);
    vCard.title = trim(profile.title) || trim(vCard.title) || descriptor;
    vCard.note = trim(getByPath(profile, "positioning.primary")) || trim(vCard.note) || descriptor;

    return {
      name: name,
      descriptor: descriptor,
      email: email,
      website: normaliseUrl(website),
      linkedInUrl: normaliseUrl(linkedInUrl),
      cvPath: cvPath,
      phone: phone,
      vCard: vCard
    };
  }

  function normaliseConfig(input) {
    var simple = simpleConfig(input);

    return {
      name: simple.name,
      descriptor: simple.descriptor,
      email: simple.email,
      website: simple.website,
      linkedInUrl: simple.linkedInUrl,
      cvPath: simple.cvPath,
      phone: simple.phone,
      vCard: simple.vCard,
      profile: {
        name: simple.name,
        initials: deriveInitials(simple.name),
        title: simple.descriptor,
        institution: simple.vCard.organization,
        keywords: [],
        positioning: {
          primary: simple.vCard.note,
          alternative: "",
          active: "primary"
        }
      },
      contact: {
        email: simple.email,
        phone: simple.phone,
        website: simple.website,
        linkedIn: simple.linkedInUrl
      },
      links: {
        publicUrl: simple.website,
        cvUrl: simple.cvPath,
        portfolioUrl: "",
        researchUrl: "",
        capstoneUrl: "",
        staticVCardUrl: "assets/jack-tinsley.vcf",
        qrCodeUrl: "assets/qr-code.svg",
        avatarUrl: "assets/placeholder-avatar.svg"
      },
      buttons: {
        addToContacts: true,
        viewCv: true,
        email: true,
        linkedIn: true,
        portfolio: false,
        research: false,
        capstone: false,
        copyEmail: true,
        copyPhone: false,
        copyWebsite: true,
        copyAll: true
      },
      sections: {
        cards: {
          cvProfile: {
            title: "CV",
            description: "",
            url: simple.cvPath,
            visible: Boolean(simple.cvPath)
          },
          capstone: { title: "", description: "", url: "", visible: false },
          research: { title: "", description: "", url: "", visible: false },
          portfolio: { title: "", description: "", url: "", visible: false }
        }
      },
      theme: {
        colors: {
          background: "#fffbf7",
          surface: "#fffdfb",
          surfaceStrong: "#fffdfb",
          text: "#643a11",
          muted: "#7a5838",
          border: "#d8c5b4",
          shadow: "rgba(100, 58, 17, 0.12)"
        },
        accents: {
          blue: "#643a11",
          green: "#7a5838",
          pink: "#9a6f47",
          yellow: "#d8c5b4"
        },
        typographyScale: {
          display: "2rem",
          title: "1rem",
          body: "1rem",
          label: "0.875rem"
        }
      },
      layout: {
        digitalCardVariant: "compact-column",
        backgroundMotif: "grid-fade",
        animationIntensity: "off",
        physicalCardVariant: "centred-premium"
      },
      meta: {
        lastUpdated: "",
        privacyNote: "No tracking. No cookies."
      }
    };
  }

  function getBaseConfig() {
    return normaliseConfig(window.CARD_CONFIG || {});
  }

  function readDraftRaw() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function hasDraft() {
    return Boolean(readDraftRaw());
  }

  function getDraftConfig() {
    var raw = readDraftRaw();

    if (!raw) {
      return getBaseConfig();
    }

    try {
      return normaliseConfig(JSON.parse(raw));
    } catch (error) {
      return getBaseConfig();
    }
  }

  function saveDraft(config) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(simpleConfig(config)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeVCard(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function ensureTrailingSlash(value) {
    return value && value.charAt(value.length - 1) === "/" ? value : value + "/";
  }

  function absoluteUrl(path, base) {
    var value = trim(path);

    if (!value) {
      return "";
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    try {
      return new URL(value, ensureTrailingSlash(base || window.location.href)).href;
    } catch (error) {
      return value;
    }
  }

  function cleanDisplayUrl(value) {
    return trim(value).replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }

  function copyDetails(config) {
    var lines = [
      config.name,
      config.descriptor,
      "Website: " + config.website
    ];
    var cvUrl = absoluteUrl(config.cvPath, config.website);

    if (config.email) {
      lines.push("Email: " + config.email);
    }

    if (config.phone) {
      lines.push("Phone: " + config.phone);
    }

    if (config.linkedInUrl) {
      lines.push("LinkedIn: " + config.linkedInUrl);
    }

    if (cvUrl) {
      lines.push("CV: " + cvUrl);
    }

    return lines.join("\n");
  }

  function buildVCard(configInput) {
    var config = normaliseConfig(configInput);
    var simple = simpleConfig(config);
    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:" +
        escapeVCard(simple.vCard.lastName) +
        ";" +
        escapeVCard(simple.vCard.firstName) +
        ";;;",
      "FN:" + escapeVCard(simple.name),
      "TITLE:" + escapeVCard(simple.vCard.title || simple.descriptor)
    ];

    if (simple.vCard.organization) {
      lines.push("ORG:" + escapeVCard(simple.vCard.organization));
    }

    if (simple.email) {
      lines.push("EMAIL;TYPE=INTERNET:" + escapeVCard(simple.email));
    }

    if (simple.phone) {
      lines.push("TEL;TYPE=CELL:" + escapeVCard(simple.phone));
    }

    if (simple.website) {
      lines.push("URL:" + escapeVCard(simple.website));
    }

    if (simple.linkedInUrl) {
      lines.push("X-SOCIALPROFILE;TYPE=linkedin:" + escapeVCard(simple.linkedInUrl));
    }

    if (simple.vCard.note) {
      lines.push("NOTE:" + escapeVCard(simple.vCard.note));
    }

    lines.push("END:VCARD");

    return lines.join("\r\n") + "\r\n";
  }

  function downloadText(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
    var url = window.URL.createObjectURL(blob);
    var anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }

  function serializeConfig(config) {
    return "window.CARD_CONFIG = " + JSON.stringify(simpleConfig(config), null, 2) + ";\n";
  }

  function formatDate(value) {
    return trim(value) || "Not set";
  }

  function applyTheme(config, target) {
    var root = target || document.documentElement;
    var normalised = normaliseConfig(config);

    root.style.setProperty("--page-bg", normalised.theme.colors.background);
    root.style.setProperty("--text-color", normalised.theme.colors.text);
  }

  function setLink(selector, href) {
    var link = document.querySelector(selector);

    if (!link) {
      return;
    }

    if (!href) {
      link.hidden = true;
      return;
    }

    link.href = href;
    link.hidden = false;
  }

  function showStatus(root, message, tone) {
    var status = root.querySelector("#page-status");

    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.tone = tone || "neutral";
    status.hidden = false;
  }

  function hideManualCopy(root) {
    var panel = root.querySelector("#manual-copy-panel");

    if (panel) {
      panel.hidden = true;
    }
  }

  function revealManualCopy(root, value) {
    var panel = root.querySelector("#manual-copy-panel");
    var textarea = root.querySelector("#manual-copy-value");

    if (!panel || !textarea) {
      return;
    }

    textarea.value = value;
    panel.hidden = false;
    textarea.focus();
    textarea.select();
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    var copied = false;

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      copied = Boolean(document.execCommand && document.execCommand("copy"));
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  }

  function copyText(root, text, successMessage) {
    function copied() {
      hideManualCopy(root);
      showStatus(root, successMessage, "success");
    }

    function fallback() {
      if (fallbackCopy(text)) {
        copied();
        return;
      }

      revealManualCopy(root, text);
      showStatus(root, "Copy failed. Select the text shown below.", "error");
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(copied).catch(fallback);
      return;
    }

    fallback();
  }

  function attachInteractiveActions(root, configInput) {
    var config = normaliseConfig(configInput);

    root.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-card-action]");

      if (!trigger) {
        return;
      }

      var action = trigger.getAttribute("data-card-action");

      if (action === "download-vcard") {
        event.preventDefault();
        downloadText("jack-tinsley.vcf", buildVCard(config), "text/vcard;charset=utf-8");
        showStatus(root, "Contact file downloaded.", "success");
        return;
      }

      if (action === "copy-website") {
        event.preventDefault();
        copyText(root, config.website, "Website copied.");
        return;
      }

      if (action === "copy-email") {
        event.preventDefault();
        copyText(root, config.email, "Email copied.");
        return;
      }

      if (action === "copy-all") {
        event.preventDefault();
        copyText(root, copyDetails(config), "Details copied.");
        return;
      }

      if (action === "close-manual-copy") {
        event.preventDefault();
        hideManualCopy(root);
        showStatus(root, "Manual copy closed.", "neutral");
      }
    });
  }

  function applyConfigToStaticPage(configInput) {
    var config = normaliseConfig(configInput);
    var image = document.getElementById("business-card-image");
    var footerName = document.getElementById("footer-name");
    var heading = document.getElementById("page-title");
    var descriptor = document.getElementById("page-descriptor");

    document.title = config.name + " | Digital Card";
    setLink('[data-config-link="cv"]', config.cvPath);
    setLink('[data-config-link="linkedin"]', config.linkedInUrl);
    setLink('[data-config-link="email"]', config.email ? "mailto:" + config.email : "");

    if (image) {
      image.alt = config.name + " business card";
    }

    if (footerName) {
      footerName.textContent = config.name;
    }

    if (heading) {
      heading.textContent = config.name;
    }

    if (descriptor) {
      descriptor.textContent = config.descriptor || "Descriptor to be updated";
    }
  }

  function renderActions(config, interactive) {
    var emailHref = config.email ? "mailto:" + escapeHtml(config.email) : "";
    var copyEmailAction = config.email
      ? '<button class="button button--utility" type="button" data-card-action="copy-email" data-action-key="copyEmail">Copy Email</button>'
      : "";
    var primaryActions =
      (emailHref
        ? '<a class="button button--primary" href="' +
          emailHref +
          '" data-action-key="email">Email</a>'
        : "") +
      '<a class="button button--primary" href="' +
      escapeHtml(config.cvPath) +
      '" target="_blank" rel="noopener" data-action-key="viewCv">View / Download CV</a>';

    return (
      '<div class="actions" aria-label="Contact actions">' +
      '<div class="action-group action-group--primary" aria-label="Primary contact actions">' +
      primaryActions +
      "</div>" +
      '<div class="action-group action-group--secondary" aria-label="Secondary contact actions">' +
      '<a class="button button--secondary" href="' +
      escapeHtml(config.linkedInUrl) +
      '" target="_blank" rel="noopener" data-action-key="linkedIn">LinkedIn</a>' +
      '<button class="button button--secondary" type="button" data-card-action="download-vcard" data-action-key="addToContacts">Add to Contacts</button>' +
      "</div>" +
      (interactive
        ? '<div class="action-group action-group--utility" aria-label="Copy actions">' +
          copyEmailAction +
          '<button class="button button--utility" type="button" data-card-action="copy-website" data-action-key="copyWebsite">Copy Website</button>' +
          '<button class="button button--utility" type="button" data-card-action="copy-all" data-action-key="copyAll">Copy All Details</button>' +
          "</div>"
        : "") +
      "</div>"
    );
  }

  function renderHome(root, configInput, options) {
    var settings = options || {};
    var interactive = settings.interactive !== false;
    var config = normaliseConfig(configInput);

    root.innerHTML =
      '<section class="digital-card digital-card--rendered">' +
      '<figure class="business-card-box">' +
      '<img src="assets/business-card.png" alt="' +
      escapeHtml(config.name) +
      ' business card" width="1050" height="600" />' +
      "</figure>" +
      '<header class="identity-block"><h1>' +
      escapeHtml(config.name) +
      "</h1><p>" +
      escapeHtml(config.descriptor || "Descriptor to be updated") +
      "</p></header>" +
      renderActions(config, interactive) +
      (interactive
        ? '<div class="manual-copy" id="manual-copy-panel" hidden><label class="manual-copy__label" for="manual-copy-value">Copy this text manually</label><textarea id="manual-copy-value" readonly></textarea><button class="button button--small" type="button" data-card-action="close-manual-copy">Close</button></div><p class="status" id="page-status" role="status" aria-live="polite" hidden></p>'
        : "") +
      '<footer class="site-footer"><p><strong>' +
      escapeHtml(config.name) +
      "</strong></p><p>Static digital card. No tracking. No cookies.</p></footer>" +
      "</section>";

    if (interactive) {
      attachInteractiveActions(root, config);
    }
  }

  function initPublicPage() {
    var config = getBaseConfig();
    var root = document.getElementById("app-root");

    applyTheme(config, document.documentElement);

    if (root) {
      renderHome(root, config, { interactive: true });
      return;
    }

    applyConfigToStaticPage(config);
    attachInteractiveActions(document, config);
  }

  window.CardSystem = {
    STORAGE_KEY: STORAGE_KEY,
    deepClone: deepClone,
    normaliseConfig: normaliseConfig,
    getBaseConfig: getBaseConfig,
    getDraftConfig: getDraftConfig,
    hasDraft: hasDraft,
    saveDraft: saveDraft,
    clearDraft: clearDraft,
    getByPath: getByPath,
    setByPath: setByPath,
    serializeConfig: serializeConfig,
    buildVCard: buildVCard,
    downloadText: downloadText,
    applyTheme: applyTheme,
    renderHome: renderHome,
    formatDate: formatDate
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body && document.body.getAttribute("data-page") === "public") {
      initPublicPage();
    }
  });
})();
