(function () {
  "use strict";

  var STORAGE_KEY = "jack-tinsley-card-draft-v1";

  var TEMPLATE = {
    profile: {
      name: "",
      initials: "",
      title: "",
      institution: "",
      keywords: [],
      positioning: {
        primary: "",
        alternative: "",
        active: "primary"
      }
    },
    contact: {
      email: "",
      phone: "",
      website: "",
      linkedIn: ""
    },
    links: {
      publicUrl: "",
      cvUrl: "",
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
      portfolio: true,
      research: true,
      capstone: true,
      copyEmail: true,
      copyPhone: true,
      copyWebsite: true,
      copyAll: true
    },
    sections: {
      cards: {
        cvProfile: {
          title: "CV / Risk & Operations Profile",
          description: "",
          url: "",
          visible: true
        },
        capstone: {
          title: "Capstone",
          description: "",
          url: "",
          visible: false
        },
        research: {
          title: "Research / Writing",
          description: "",
          url: "",
          visible: false
        },
        portfolio: {
          title: "Portfolio / Selected Work",
          description: "",
          url: "",
          visible: false
        }
      }
    },
    theme: {
      colors: {
        background: "#f5f1e9",
      surface: "rgba(255, 253, 248, 0.82)",
      surfaceStrong: "#fffdf9",
      text: "#171615",
      muted: "#5c5751",
      border: "#dad1c5",
      shadow: "rgba(20, 20, 20, 0.12)"
      },
      accents: {
        blue: "#6692ff",
        green: "#7cd1a2",
        pink: "#f09fc6",
        yellow: "#f2cb72"
      },
      typographyScale: {
        display: "clamp(2.4rem, 7vw, 4rem)",
        title: "clamp(1.1rem, 3vw, 1.45rem)",
        body: "1rem",
        label: "0.82rem"
      }
    },
    layout: {
      digitalCardVariant: "stacked-premium",
      backgroundMotif: "nodes-soft",
      animationIntensity: "low",
      physicalCardVariant: "centred-premium"
    },
    meta: {
      lastUpdated: "",
      privacyNote: "No tracking. No cookies. Static page only."
    }
  };

  var CARD_LINK_MAP = {
    cvProfile: "cvUrl",
    capstone: "capstoneUrl",
    research: "researchUrl",
    portfolio: "portfolioUrl"
  };

  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeDeep(base, override) {
    if (Array.isArray(base) || Array.isArray(override)) {
      return override === undefined ? deepClone(base) : deepClone(override);
    }

    if (isObject(base) || isObject(override)) {
      var result = {};
      var keys = {};
      Object.keys(base || {}).forEach(function (key) {
        keys[key] = true;
      });
      Object.keys(override || {}).forEach(function (key) {
        keys[key] = true;
      });

      Object.keys(keys).forEach(function (key) {
        var baseValue = base ? base[key] : undefined;
        var overrideValue = override ? override[key] : undefined;
        if (overrideValue === undefined) {
          result[key] = deepClone(baseValue);
        } else if (baseValue === undefined) {
          result[key] = deepClone(overrideValue);
        } else {
          result[key] = mergeDeep(baseValue, overrideValue);
        }
      });

      return result;
    }

    return override === undefined ? base : override;
  }

  function trimString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function parseKeywords(value) {
    if (Array.isArray(value)) {
      return value
        .map(function (item) {
          return trimString(item);
        })
        .filter(Boolean);
    }

    return trimString(value)
      .split(/[,\n]/)
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function deriveInitials(name) {
    var parts = trimString(name).split(/\s+/).filter(Boolean);
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

  function normaliseUrl(url) {
    var value = trimString(url);
    if (!value) {
      return "";
    }
    if (
      /^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i.test(value) ||
      value.indexOf("assets/") === 0
    ) {
      return value;
    }
    return "https://" + value.replace(/^\/+/, "");
  }

  function syncCardUrls(config) {
    Object.keys(CARD_LINK_MAP).forEach(function (cardKey) {
      var linkKey = CARD_LINK_MAP[cardKey];
      var card = config.sections.cards[cardKey];
      var linkValue = trimString(config.links[linkKey]);
      var cardValue = trimString(card.url);
      var synced = linkValue || cardValue;
      config.links[linkKey] = synced;
      card.url = synced;
    });
  }

  function normaliseConfig(input) {
    var merged = mergeDeep(TEMPLATE, mergeDeep(window.CARD_CONFIG || {}, input || {}));

    merged.profile.name = trimString(merged.profile.name);
    merged.profile.initials = trimString(merged.profile.initials) || deriveInitials(merged.profile.name);
    merged.profile.title = trimString(merged.profile.title);
    merged.profile.institution = trimString(merged.profile.institution);
    merged.profile.keywords = parseKeywords(merged.profile.keywords);
    merged.profile.positioning.primary = trimString(merged.profile.positioning.primary);
    merged.profile.positioning.alternative = trimString(merged.profile.positioning.alternative);
    merged.profile.positioning.active =
      merged.profile.positioning.active === "alternative" ? "alternative" : "primary";

    Object.keys(merged.contact).forEach(function (key) {
      merged.contact[key] = trimString(merged.contact[key]);
    });
    Object.keys(merged.links).forEach(function (key) {
      merged.links[key] = trimString(merged.links[key]);
    });

    syncCardUrls(merged);

    Object.keys(merged.sections.cards).forEach(function (key) {
      merged.sections.cards[key].title = trimString(merged.sections.cards[key].title);
      merged.sections.cards[key].description = trimString(merged.sections.cards[key].description);
      merged.sections.cards[key].url = trimString(merged.sections.cards[key].url);
      merged.sections.cards[key].visible = Boolean(merged.sections.cards[key].visible);
    });

    merged.theme.colors.background = trimString(merged.theme.colors.background);
    merged.theme.colors.surface = trimString(merged.theme.colors.surface);
    merged.theme.colors.surfaceStrong = trimString(merged.theme.colors.surfaceStrong);
    merged.theme.colors.text = trimString(merged.theme.colors.text);
    merged.theme.colors.muted = trimString(merged.theme.colors.muted);
    merged.theme.colors.border = trimString(merged.theme.colors.border);
    merged.theme.colors.shadow = trimString(merged.theme.colors.shadow);
    merged.theme.accents.blue = trimString(merged.theme.accents.blue);
    merged.theme.accents.green = trimString(merged.theme.accents.green);
    merged.theme.accents.pink = trimString(merged.theme.accents.pink);
    merged.theme.accents.yellow = trimString(merged.theme.accents.yellow);

    merged.meta.lastUpdated = trimString(merged.meta.lastUpdated);
    merged.meta.privacyNote = trimString(merged.meta.privacyNote) || TEMPLATE.meta.privacyNote;

    return merged;
  }

  function getBaseConfig() {
    return normaliseConfig();
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normaliseConfig(config)));
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

  function getByPath(object, path) {
    return path.split(".").reduce(function (current, key) {
      return current ? current[key] : undefined;
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/\n/g, "&#10;");
  }

  function escapeVCard(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function formatDate(value) {
    var input = trimString(value);
    if (!input) {
      return "Not set";
    }

    var date = new Date(input + "T00:00:00");
    if (Number.isNaN(date.getTime())) {
      return input;
    }

    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function activePositioning(config) {
    return config.profile.positioning.active === "alternative" &&
      config.profile.positioning.alternative
      ? config.profile.positioning.alternative
      : config.profile.positioning.primary;
  }

  function splitNameLines(value) {
    var parts = trimString(value).split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return ["Jack", "Tinsley"];
    }
    if (parts.length === 1) {
      return [parts[0]];
    }
    return [parts.slice(0, parts.length - 1).join(" "), parts[parts.length - 1]];
  }

  function splitTitleLines(value) {
    var parts = trimString(value).split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return [];
    }
    if (parts.length === 1) {
      return [parts[0]];
    }
    if (parts.length === 2) {
      return [parts[0], parts[1]];
    }

    var midpoint = Math.ceil(parts.length / 2);
    return [parts.slice(0, midpoint).join(" "), parts.slice(midpoint).join(" ")];
  }

  function renderLineSpans(lines, className) {
    return lines
      .filter(Boolean)
      .map(function (line) {
        return '<span class="' + className + '">' + escapeHtml(line) + "</span>";
      })
      .join(" ");
  }

  function renderActionIcon(key) {
    var icons = {
      addToContacts:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path><path d="M4.8 19.5a7.2 7.2 0 0 1 14.4 0"></path><path d="M19 7v6"></path><path d="M16 10h6"></path></svg>',
      viewCv:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h6l4 4v13H7z"></path><path d="M13 3.5v4h4"></path><path d="M9.8 13h4.4"></path><path d="M9.8 16h4.4"></path></svg>',
      email:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4z"></path><path d="m4.8 7.2 7.2 5 7.2-5"></path></svg>',
      linkedIn:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 9.5v8"></path><path d="M6.5 6.5v.1"></path><path d="M11 17.5v-8"></path><path d="M11 13.1c0-2.2 1.3-3.8 3.4-3.8 2 0 3.1 1.3 3.1 3.7v4.5"></path></svg>',
      portfolio:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7.5h15v11h-15z"></path><path d="M9 7.5v-2h6v2"></path><path d="M4.5 12.5h15"></path></svg>',
      research:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 4.5h8a3 3 0 0 1 3 3v12h-8a3 3 0 0 0-3 3z"></path><path d="M16.5 7.5h2a2 2 0 0 1 2 2v10h-4"></path></svg>',
      capstone:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 8 4-8 4-8-4z"></path><path d="m6 10.5 6 3 6-3"></path><path d="m6 14 6 3 6-3"></path></svg>',
      copyEmail:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h10v12H8z"></path><path d="M6 16H4V4h12v2"></path></svg>',
      copyPhone:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.5 11 8l-2 2c.8 1.8 2.4 3.4 4.2 4.2l2-2 2.6 2.6c.4.4.5 1 .2 1.5-.8 1.6-2.4 2.6-4.2 2.2-4.6-.9-8.5-4.8-9.3-9.4-.3-1.7.7-3.3 2.2-4 .6-.3 1.2-.2 1.8.4Z"></path></svg>',
      copyWebsite:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 13.5a4 4 0 0 0 5.7 0l2-2a4 4 0 0 0-5.7-5.7l-1.1 1.1"></path><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2 2a4 4 0 0 0 5.7 5.7l1.1-1.1"></path></svg>',
      copyAll:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h10v12H8z"></path><path d="M5 16V5h11"></path><path d="M11 12h4"></path><path d="M11 15h4"></path></svg>'
    };

    return (
      '<span class="button__icon">' +
      (icons[key] || icons.copyAll) +
      "</span>"
    );
  }

  function renderButtonContent(action) {
    return (
      renderActionIcon(action.key) +
      '<span class="button__label">' +
      escapeHtml(action.label) +
      "</span>"
    );
  }

  function revealStyle(index, offset) {
    var delay = offset + index * 0.055;
    return ' style="--reveal-delay: ' + delay.toFixed(3) + '"';
  }

  function buildVCard(config) {
    var nameParts = trimString(config.profile.name).split(/\s+/).filter(Boolean);
    var family = "";
    var given = "";
    if (nameParts.length) {
      family = nameParts.pop();
      given = nameParts.join(" ");
    }

    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:" + escapeVCard(family) + ";" + escapeVCard(given) + ";;;",
      "FN:" + escapeVCard(config.profile.name)
    ];

    if (trimString(config.profile.title)) {
      lines.push("TITLE:" + escapeVCard(config.profile.title));
    }
    if (trimString(config.profile.institution)) {
      lines.push("ORG:" + escapeVCard(config.profile.institution));
    }
    if (trimString(activePositioning(config))) {
      lines.push("NOTE:" + escapeVCard(activePositioning(config)));
    }
    if (trimString(config.contact.email)) {
      lines.push("EMAIL;TYPE=INTERNET:" + escapeVCard(config.contact.email));
    }
    if (trimString(config.contact.phone)) {
      lines.push("TEL;TYPE=CELL:" + escapeVCard(config.contact.phone));
    }

    var primaryUrl = trimString(config.contact.website) || trimString(config.links.publicUrl);
    if (primaryUrl) {
      lines.push("URL:" + escapeVCard(normaliseUrl(primaryUrl)));
    }
    if (trimString(config.contact.linkedIn)) {
      lines.push(
        "X-SOCIALPROFILE;TYPE=linkedin:" +
          escapeVCard(normaliseUrl(config.contact.linkedIn))
      );
    }

    lines.push("END:VCARD");
    return lines.join("\r\n");
  }

  function serializeConfig(config) {
    return "window.CARD_CONFIG = " + JSON.stringify(normaliseConfig(config), null, 2) + ";\n";
  }

  function downloadText(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
    var url = window.URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 1200);
  }

  function applyTheme(config, element) {
    var target = element || document.documentElement;
    var colors = config.theme.colors;
    var accents = config.theme.accents;
    var scale = config.theme.typographyScale;

    target.style.setProperty("--color-bg", colors.background);
    target.style.setProperty("--color-surface", colors.surface);
    target.style.setProperty("--color-surface-strong", colors.surfaceStrong);
    target.style.setProperty("--color-text", colors.text);
    target.style.setProperty("--color-muted", colors.muted);
    target.style.setProperty("--color-border", colors.border);
    target.style.setProperty("--color-shadow", colors.shadow);
    target.style.setProperty("--accent-blue", accents.blue);
    target.style.setProperty("--accent-green", accents.green);
    target.style.setProperty("--accent-pink", accents.pink);
    target.style.setProperty("--accent-yellow", accents.yellow);
    target.style.setProperty("--scale-display", scale.display);
    target.style.setProperty("--scale-title", scale.title);
    target.style.setProperty("--scale-body", scale.body);
    target.style.setProperty("--scale-label", scale.label);
  }

  function resolveLink(config, key) {
    return trimString(config.links[key]);
  }

  function shouldShowButton(config, key) {
    if (config.buttons[key] === false) {
      return false;
    }

    switch (key) {
      case "addToContacts":
        return Boolean(trimString(config.profile.name));
      case "viewCv":
        return Boolean(resolveLink(config, "cvUrl"));
      case "email":
        return Boolean(trimString(config.contact.email));
      case "linkedIn":
        return Boolean(trimString(config.contact.linkedIn));
      case "portfolio":
        return Boolean(resolveLink(config, "portfolioUrl"));
      case "research":
        return Boolean(resolveLink(config, "researchUrl"));
      case "capstone":
        return Boolean(resolveLink(config, "capstoneUrl"));
      case "copyEmail":
        return Boolean(trimString(config.contact.email));
      case "copyPhone":
        return Boolean(trimString(config.contact.phone));
      case "copyWebsite":
        return Boolean(trimString(config.contact.website) || trimString(config.links.publicUrl));
      case "copyAll":
        return Boolean(buildCopyAll(config));
      default:
        return true;
    }
  }

  function buildCopyAll(config) {
    var lines = [
      config.profile.name,
      config.profile.title,
      config.profile.institution,
      activePositioning(config),
      config.contact.email,
      config.contact.phone,
      config.contact.website,
      config.contact.linkedIn,
      config.links.publicUrl
    ]
      .map(trimString)
      .filter(Boolean);

    return lines.join("\n");
  }

  function primaryActions(config) {
    return [
      {
        key: "addToContacts",
        label: "Add to Contacts",
        action: "download-vcard",
        variant: "ghost"
      },
      {
        key: "viewCv",
        label: "View / Download CV",
        href: normaliseUrl(resolveLink(config, "cvUrl")),
        variant: "primary"
      },
      {
        key: "email",
        label: "Email Jack",
        href: "mailto:" + trimString(config.contact.email),
        variant: "ghost"
      },
      {
        key: "linkedIn",
        label: "LinkedIn",
        href: normaliseUrl(trimString(config.contact.linkedIn)),
        variant: "ghost"
      },
      {
        key: "portfolio",
        label: "Portfolio",
        href: normaliseUrl(resolveLink(config, "portfolioUrl")),
        variant: "ghost"
      },
      {
        key: "research",
        label: "Research / Writing",
        href: normaliseUrl(resolveLink(config, "researchUrl")),
        variant: "ghost"
      },
      {
        key: "capstone",
        label: "Capstone / Project",
        href: normaliseUrl(resolveLink(config, "capstoneUrl")),
        variant: "ghost"
      }
    ].filter(function (item) {
      return shouldShowButton(config, item.key);
    });
  }

  function copyActions(config) {
    return [
      {
        key: "copyEmail",
        label: "Copy Email",
        value: trimString(config.contact.email)
      },
      {
        key: "copyPhone",
        label: "Copy Phone",
        value: trimString(config.contact.phone)
      },
      {
        key: "copyWebsite",
        label: "Copy Website",
        value: trimString(config.contact.website) || trimString(config.links.publicUrl)
      },
      {
        key: "copyAll",
        label: "Copy All Details",
        value: buildCopyAll(config)
      }
    ].filter(function (item) {
      return shouldShowButton(config, item.key);
    });
  }

  function resourceCards(config, previewMode) {
    return [
      {
        key: "cvProfile",
        eyebrow: "CV",
        cta: "Open CV",
        title: config.sections.cards.cvProfile.title,
        description: config.sections.cards.cvProfile.description,
        url: config.sections.cards.cvProfile.url,
        visible: config.sections.cards.cvProfile.visible
      },
      {
        key: "capstone",
        eyebrow: "Research",
        cta: "Open capstone",
        title: config.sections.cards.capstone.title,
        description: config.sections.cards.capstone.description,
        url: config.sections.cards.capstone.url,
        visible: config.sections.cards.capstone.visible
      },
      {
        key: "research",
        eyebrow: "Writing",
        cta: "Open research",
        title: config.sections.cards.research.title,
        description: config.sections.cards.research.description,
        url: config.sections.cards.research.url,
        visible: config.sections.cards.research.visible
      },
      {
        key: "portfolio",
        eyebrow: "Selected work",
        cta: "Open portfolio",
        title: config.sections.cards.portfolio.title,
        description: config.sections.cards.portfolio.description,
        url: config.sections.cards.portfolio.url,
        visible: config.sections.cards.portfolio.visible
      }
    ].filter(function (card) {
      if (!card.visible) {
        return previewMode;
      }
      return previewMode || Boolean(trimString(card.url));
    });
  }

  function renderButtons(actions, interactive) {
    return actions
      .map(function (action, index) {
        var reveal = revealStyle(index, 0.14);
        if (!interactive) {
          return (
            '<span class="button reveal-item" aria-hidden="true" data-variant="' +
            escapeHtml(action.variant || "ghost") +
            '" data-action-key="' +
            escapeHtml(action.key) +
            '"' +
            reveal +
            ">" +
            renderButtonContent(action) +
            "</span>"
          );
        }

        if (action.href) {
          var isExternal = /^https?:/i.test(action.href);
          var attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
          return (
            '<a class="button reveal-item" data-variant="' +
            escapeHtml(action.variant || "ghost") +
            '" data-action-key="' +
            escapeHtml(action.key) +
            '" href="' +
            escapeHtml(action.href) +
            '"' +
            attrs +
            reveal +
            ">" +
            renderButtonContent(action) +
            "</a>"
          );
        }

        return (
          '<button type="button" class="button reveal-item" data-variant="' +
          escapeHtml(action.variant || "ghost") +
          '" data-action-key="' +
          escapeHtml(action.key) +
          '" data-card-action="' +
          escapeHtml(action.action) +
          '"' +
          reveal +
          ">" +
          renderButtonContent(action) +
          "</button>"
        );
      })
      .join("");
  }

  function renderCopyButtons(actions, interactive) {
    return actions
      .map(function (action, index) {
        var reveal = revealStyle(index, 0.36);
        if (!interactive) {
          return (
            '<span class="button reveal-item" data-action-key="' +
            escapeHtml(action.key) +
            '"' +
            reveal +
            ">" +
            renderButtonContent(action) +
            "</span>"
          );
        }
        return (
          '<button type="button" class="button reveal-item" data-action-key="' +
          escapeHtml(action.key) +
          '" data-card-action="copy" data-copy-label="' +
          escapeAttribute(action.label) +
          '" data-copy-value="' +
          escapeAttribute(action.value) +
          '"' +
          reveal +
          ">" +
          renderButtonContent(action) +
          "</button>"
        );
      })
      .join("");
  }

  function renderResources(config, previewMode) {
    var cards = resourceCards(config, previewMode);
    if (!cards.length) {
      return (
        '<article class="resource-card"><p class="eyebrow">Selected pathways</p>' +
        '<h3 class="resource-card__title">Add links in config.js or editor.html</h3>' +
        '<p class="resource-card__description">Portfolio, research and capstone cards stay hidden on the live page until public URLs are added.</p></article>'
      );
    }

    return cards
      .map(function (card, index) {
        var link = trimString(card.url);
        var reveal = revealStyle(index, 0.58);
        var content =
          '<p class="eyebrow">' +
          escapeHtml(card.eyebrow) +
          "</p>" +
          '<h3 class="resource-card__title">' +
          escapeHtml(card.title || card.key) +
          "</h3>" +
          '<p class="resource-card__description">' +
          escapeHtml(card.description || "") +
          "</p>";

        if (!link) {
          return (
            '<article class="resource-card reveal-item"' +
            reveal +
            ">" +
            content +
            "</article>"
          );
        }

        return (
          '<article class="resource-card reveal-item"' +
          reveal +
          ">" +
          content +
          '<a class="resource-card__link" href="' +
          escapeHtml(normaliseUrl(link)) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(card.cta) +
          "</a></article>"
        );
      })
      .join("");
  }

  function renderMesh(variant) {
    return (
      '<div class="hero-card__mesh" data-motif="' +
      escapeHtml(variant) +
      '" aria-hidden="true">' +
      '<span class="mesh-line mesh-line--1"></span>' +
      '<span class="mesh-line mesh-line--2"></span>' +
      '<span class="mesh-line mesh-line--3"></span>' +
      '<span class="mesh-line mesh-line--4"></span>' +
      '<span class="mesh-line mesh-line--5"></span>' +
      '<span class="mesh-node mesh-node--1 mesh-node--blue"></span>' +
      '<span class="mesh-node mesh-node--2 mesh-node--green"></span>' +
      '<span class="mesh-node mesh-node--3 mesh-node--pink"></span>' +
      '<span class="mesh-node mesh-node--4 mesh-node--yellow"></span>' +
      '<span class="mesh-node mesh-node--5 mesh-node--blue"></span>' +
      '<span class="mesh-node mesh-node--6 mesh-node--green"></span>' +
      '<span class="mesh-node mesh-node--7 mesh-node--pink"></span>' +
      '<span class="mesh-node mesh-node--8 mesh-node--yellow"></span>' +
      "</div>"
    );
  }

  function renderHome(root, config, options) {
    var settings = options || {};
    var interactive = settings.interactive !== false;
    var nameLines = splitNameLines(config.profile.name);
    var titleLines = splitTitleLines(config.profile.title);

    applyTheme(config, root);

    root.innerHTML =
      '<div class="page-shell-card">' +
      '<section class="hero-card" data-layout="' +
      escapeHtml(config.layout.digitalCardVariant) +
      '" data-motif="' +
      escapeHtml(config.layout.backgroundMotif) +
      '" data-motion="' +
      escapeHtml(config.layout.animationIntensity) +
      '">' +
      '<article class="reference-hero" aria-label="Canva-inspired digital business card composition">' +
      '<div class="reference-hero__name-block">' +
      '<h1 class="reference-hero__name">' +
      renderLineSpans(nameLines, "reference-hero__name-line") +
      "</h1>" +
      "</div>" +
      '<div class="reference-orbit" aria-hidden="true">' +
      '<div class="reference-orbit__system">' +
      '<span class="reference-orbit__line"></span>' +
      '<span class="reference-orbit__circle reference-orbit__circle--rear"></span>' +
      '<span class="reference-orbit__circle reference-orbit__circle--front"></span>' +
      "</div>" +
      "</div>" +
      '<p class="reference-hero__title">' +
      renderLineSpans(titleLines, "reference-hero__title-line") +
      "</p>" +
      "</article>" +
      "</section>" +
      '<section class="content-flow">' +
      '<div class="content-flow__inner">' +
      '<section class="action-panel">' +
      '<div class="scroll-transition-line" aria-hidden="true"></div>' +
      '<div class="action-panel__intro reveal-item" style="--reveal-delay: 0.04">' +
      '<p class="eyebrow">Next steps</p>' +
      "<h2>Save the details or go deeper</h2>" +
      "</div>" +
      '<div class="action-group reveal-group">' +
      '<div class="action-grid action-grid--primary">' +
      renderButtons(primaryActions(config), interactive) +
      "</div>" +
      (copyActions(config).length
        ? '<div class="action-grid action-grid--utility">' +
          renderCopyButtons(copyActions(config), interactive) +
          "</div>"
        : "") +
      (interactive
        ? '<p class="fallback-note reveal-item" style="--reveal-delay: 0.54">Fallback contact file: <a class="text-link" href="' +
          escapeHtml(config.links.staticVCardUrl || "assets/jack-tinsley.vcf") +
          '" download="jack-tinsley.vcf">Open static .vcf</a></p>' +
          '<div class="manual-copy-panel" id="manual-copy-panel" hidden>' +
          '<p class="micro-note" id="manual-copy-label">Copy this value manually.</p>' +
          '<textarea class="manual-copy-panel__value" id="manual-copy-value" aria-labelledby="manual-copy-label" readonly></textarea>' +
          '<button type="button" class="button" data-card-action="close-manual-copy">Close</button>' +
          "</div>"
        : "") +
      "</div>" +
      "</section>" +
      '<section class="resource-panel">' +
      '<div class="resource-panel__intro reveal-item" style="--reveal-delay: 0.50">' +
      '<p class="eyebrow">Selected pathways</p>' +
      "<h2>Work, writing and context</h2>" +
      "</div>" +
      '<div class="resource-grid">' +
      renderResources(config, Boolean(settings.previewMode)) +
      "</div>" +
      "</section>" +
      '<footer class="site-footer">' +
      "<p><strong>" +
      escapeHtml(config.profile.name) +
      "</strong></p>" +
      "<p>Digital card last updated: " +
      escapeHtml(formatDate(config.meta.lastUpdated)) +
      "</p>" +
      "<p>" +
      escapeHtml(config.meta.privacyNote) +
      "</p>" +
      "</footer>" +
      (interactive
        ? '<div class="status-pill" id="page-status" role="status" aria-live="polite">Ready to share.</div>'
        : "") +
      "</div>" +
      "</section>" +
      "</div>";

    if (interactive) {
      attachInteractiveActions(root, config);
      bindOrbitMotion(root);
    }
  }

  function showStatus(root, message) {
    var status = root.querySelector("#page-status");
    if (status) {
      status.textContent = message;
    }
  }

  function revealManualCopy(root, label, value) {
    var panel = root.querySelector("#manual-copy-panel");
    var note = root.querySelector("#manual-copy-label");
    var field = root.querySelector("#manual-copy-value");

    if (!panel || !note || !field) {
      return;
    }

    note.textContent = label + " is shown below for manual copy.";
    field.value = value;
    panel.hidden = false;
    field.focus();
    field.select();
  }

  function hideManualCopy(root) {
    var panel = root.querySelector("#manual-copy-panel");
    if (panel) {
      panel.hidden = true;
    }
  }

  function attachInteractiveActions(root, config) {
    root.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-card-action]");
      if (!trigger) {
        return;
      }

      var action = trigger.getAttribute("data-card-action");
      if (action === "download-vcard") {
        event.preventDefault();
        showStatus(root, "Opening contact card...");
        downloadText("jack-tinsley.vcf", buildVCard(config), "text/vcard;charset=utf-8");
        window.setTimeout(function () {
          showStatus(root, "Contact file opened. Choose save/import if prompted.");
        }, 240);
        return;
      }

      if (action === "copy") {
        event.preventDefault();
        var value = trigger.getAttribute("data-copy-value") || "";
        var label = trigger.getAttribute("data-copy-label") || "Copied value";

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard
            .writeText(value)
            .then(function () {
              hideManualCopy(root);
              showStatus(root, label + " copied.");
            })
            .catch(function () {
              revealManualCopy(root, label, value);
              showStatus(root, "Clipboard access failed. Copy the selected text manually.");
            });
        } else {
          revealManualCopy(root, label, value);
          showStatus(root, "Clipboard access unavailable here. Copy the selected text manually.");
        }
        return;
      }

      if (action === "close-manual-copy") {
        event.preventDefault();
        hideManualCopy(root);
      }
    });
  }

  function bindOrbitMotion(root) {
    var pageShell = root.querySelector(".page-shell-card");
    var heroCard = root.querySelector(".hero-card");
    var actionPanel = root.querySelector(".action-panel");

    if (!pageShell || !heroCard || !actionPanel || !window.requestAnimationFrame) {
      return;
    }

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pageShell.style.setProperty("--orbit-progress", "1");
      pageShell.style.setProperty("--reveal-progress", "1");
      pageShell.style.setProperty("--zoom-progress", "1");
      pageShell.setAttribute("data-orbit", "engaged");
      return;
    }

    var ticking = false;
    pageShell.setAttribute("data-scroll-bound", "true");

    function clamp(value) {
      return Math.max(0, Math.min(1, value));
    }

    function smoothstep(value) {
      var clamped = clamp(value);
      return clamped * clamped * (3 - 2 * clamped);
    }

    function updateProgress() {
      var heroRect = heroCard.getBoundingClientRect();
      var actionRect = actionPanel.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      var heroTravel = Math.max(1, heroCard.offsetHeight * 0.82);
      var rawOrbit = -heroRect.top / heroTravel;
      var rawReveal =
        (viewportHeight * 0.82 - actionRect.top) / Math.max(1, viewportHeight * 0.44);
      var orbitProgress = smoothstep(rawOrbit);
      var revealProgress = smoothstep(rawReveal);
      var zoomProgress = smoothstep((rawOrbit - 0.08) / 0.82);

      pageShell.style.setProperty("--orbit-progress", orbitProgress.toFixed(4));
      pageShell.style.setProperty("--reveal-progress", revealProgress.toFixed(4));
      pageShell.style.setProperty("--zoom-progress", zoomProgress.toFixed(4));
      pageShell.setAttribute("data-orbit", orbitProgress > 0.08 ? "engaged" : "rest");
      ticking = false;
    }

    function queueUpdate() {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }

    queueUpdate();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
  }

  function initPublicPage() {
    var root = document.getElementById("app-root");
    if (!root) {
      return;
    }
    document.documentElement.classList.add("public-scroll-snap");
    applyTheme(getBaseConfig(), document.documentElement);
    renderHome(root, getBaseConfig(), {
      interactive: true,
      showAlternative: false,
      previewMode: false
    });
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
