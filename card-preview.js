(function () {
  "use strict";

  var CARD_WIDTH = 850;
  var CARD_HEIGHT = 550;
  var QR_SIZE = 210;

  function escapeSvg(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function trim(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function displayUrl(url) {
    return trim(url).replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }

  function palette(config, variant) {
    var base = {
      background: config.theme.colors.background,
      panel: "#ffffff",
      text: config.theme.colors.text,
      muted: config.theme.colors.muted,
      line: config.theme.colors.border,
      blue: config.theme.accents.blue,
      green: config.theme.accents.green,
      pink: config.theme.accents.pink,
      yellow: config.theme.accents.yellow,
      qrFill: "#111111",
      qrBackground: "#ffffff"
    };

    if (variant === "dark-reverse") {
      base.background = "#17191c";
      base.panel = "#ffffff";
      base.text = "#f5f3ef";
      base.muted = "#d8d2ca";
      base.line = "#3b4046";
    }

    if (variant === "high-contrast-qr") {
      base.background = "#ffffff";
      base.panel = "#ffffff";
      base.text = "#111111";
      base.muted = "#3d3d3d";
      base.line = "#d6d6d6";
    }

    return base;
  }

  function qrPlaceholder(x, y, size, fill, background) {
    var modules = [];
    var grid = 25;
    var unit = size / grid;

    function finder(col, row) {
      var outer = '<rect x="' + (x + col * unit) + '" y="' + (y + row * unit) + '" width="' + (7 * unit) + '" height="' + (7 * unit) + '" rx="' + unit * 0.7 + '" fill="' + fill + '"/>';
      var mid = '<rect x="' + (x + (col + 1) * unit) + '" y="' + (y + (row + 1) * unit) + '" width="' + (5 * unit) + '" height="' + (5 * unit) + '" rx="' + unit * 0.6 + '" fill="' + background + '"/>';
      var inner = '<rect x="' + (x + (col + 2) * unit) + '" y="' + (y + (row + 2) * unit) + '" width="' + (3 * unit) + '" height="' + (3 * unit) + '" rx="' + unit * 0.5 + '" fill="' + fill + '"/>';
      return outer + mid + inner;
    }

    function inFinder(col, row) {
      return (
        (col < 7 && row < 7) ||
        (col > 17 && row < 7) ||
        (col < 7 && row > 17)
      );
    }

    modules.push(
      '<rect x="' +
        (x - unit * 1.2) +
        '" y="' +
        (y - unit * 1.2) +
        '" width="' +
        (size + unit * 2.4) +
        '" height="' +
        (size + unit * 2.4) +
        '" rx="' +
        unit * 1.8 +
        '" fill="' +
        background +
        '"/>'
    );
    modules.push(finder(0, 0));
    modules.push(finder(18, 0));
    modules.push(finder(0, 18));

    for (var row = 0; row < grid; row += 1) {
      for (var col = 0; col < grid; col += 1) {
        if (inFinder(col, row)) {
          continue;
        }
        var active = (row * 7 + col * 11 + row * col) % 5 < 2;
        if (active) {
          modules.push(
            '<rect x="' +
              (x + col * unit) +
              '" y="' +
              (y + row * unit) +
              '" width="' +
              unit * 0.86 +
              '" height="' +
              unit * 0.86 +
              '" rx="' +
              unit * 0.2 +
              '" fill="' +
              fill +
              '"/>'
          );
        }
      }
    }

    return '<g aria-hidden="true" data-qa="qr-placeholder">' + modules.join("") + "</g>";
  }

  function guideLayer(show, qrX, qrY) {
    var parts = [];

    if (show.bleed) {
      parts.push(
        '<g data-guide="bleed"><rect x="15" y="15" width="820" height="520" rx="18" fill="none" stroke="#d55c55" stroke-width="2" stroke-dasharray="10 8"/></g>'
      );
    }
    if (show.safe) {
      parts.push(
        '<g data-guide="safe"><rect x="45" y="45" width="760" height="460" rx="12" fill="none" stroke="#5185ff" stroke-width="2" stroke-dasharray="8 8"/></g>'
      );
    }
    if (show.centre) {
      parts.push(
        '<g data-guide="centre"><line x1="425" y1="0" x2="425" y2="550" stroke="#6e6e6e" stroke-width="1.5" stroke-dasharray="7 7"/></g>'
      );
      parts.push(
        '<g data-guide="centre"><line x1="0" y1="275" x2="850" y2="275" stroke="#6e6e6e" stroke-width="1.5" stroke-dasharray="7 7"/></g>'
      );
    }
    if (show.qr) {
      parts.push(
        '<g data-guide="qr"><rect x="' +
          (qrX - 14) +
          '" y="' +
          (qrY - 14) +
          '" width="' +
          (QR_SIZE + 28) +
          '" height="' +
          (QR_SIZE + 28) +
          '" rx="18" fill="none" stroke="#2f2f2f" stroke-width="2" stroke-dasharray="8 6"/></g>'
      );
    }

    return parts.join("");
  }

  function frontSvg(config, variant, guides) {
    var colors = palette(config, variant);
    var email = trim(config.contact.email);
    var nameX = variant === "centred-premium" ? 425 : 68;
    var anchor = variant === "centred-premium" ? "middle" : "start";
    var motifX = variant === "minimal-left" ? 640 : 600;

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      CARD_WIDTH +
      " " +
      CARD_HEIGHT +
      '" role="img" aria-label="Front of Jack Tinsley business card">' +
      "<defs>" +
      '<linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' +
      colors.blue +
      '" stop-opacity="0.22"/>' +
      '<stop offset="50%" stop-color="' +
      colors.green +
      '" stop-opacity="0.16"/>' +
      '<stop offset="100%" stop-color="' +
      colors.pink +
      '" stop-opacity="0.18"/>' +
      "</linearGradient>" +
      "</defs>" +
      '<rect width="850" height="550" rx="28" fill="' +
      colors.background +
      '"/>' +
      '<circle cx="' +
      motifX +
      '" cy="118" r="84" fill="url(#cardGlow)"/>' +
      '<circle cx="' +
      (motifX + 108) +
      '" cy="220" r="12" fill="' +
      colors.blue +
      '" fill-opacity="0.82"/>' +
      '<circle cx="' +
      (motifX + 42) +
      '" cy="302" r="9" fill="' +
      colors.green +
      '" fill-opacity="0.78"/>' +
      '<circle cx="' +
      (motifX - 60) +
      '" cy="188" r="8" fill="' +
      colors.pink +
      '" fill-opacity="0.82"/>' +
      '<circle cx="' +
      (motifX + 18) +
      '" cy="386" r="7" fill="' +
      colors.yellow +
      '" fill-opacity="0.86"/>' +
      '<line x1="' +
      (motifX - 42) +
      '" y1="190" x2="' +
      (motifX + 104) +
      '" y2="220" stroke="' +
      colors.line +
      '" stroke-width="2"/>' +
      '<line x1="' +
      motifX +
      '" y1="118" x2="' +
      (motifX + 42) +
      '" y2="302" stroke="' +
      colors.line +
      '" stroke-width="2"/>' +
      '<circle cx="' +
      (variant === "centred-premium" ? 425 : 86) +
      '" cy="92" r="34" fill="#ffffff" fill-opacity="0.66" stroke="' +
      colors.line +
      '"/>' +
      '<text x="' +
      (variant === "centred-premium" ? 425 : 86) +
      '" y="102" text-anchor="middle" font-family="Avenir Next, Segoe UI, sans-serif" font-size="24" font-weight="700" letter-spacing="6" fill="' +
      colors.text +
      '">' +
      escapeSvg(config.profile.initials) +
      "</text>" +
      '<text x="' +
      nameX +
      '" y="190" text-anchor="' +
      anchor +
      '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="56" font-weight="700" letter-spacing="-1.2" fill="' +
      colors.text +
      '">' +
      escapeSvg(config.profile.name) +
      "</text>" +
      '<text x="' +
      nameX +
      '" y="240" text-anchor="' +
      anchor +
      '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="24" font-weight="600" fill="' +
      colors.text +
      '">' +
      escapeSvg(config.profile.title) +
      "</text>" +
      '<text x="' +
      nameX +
      '" y="284" text-anchor="' +
      anchor +
      '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="17" letter-spacing="2.5" fill="' +
      colors.muted +
      '">' +
      escapeSvg(config.profile.keywords.join(" \u00b7 ")) +
      "</text>" +
      '<text x="' +
      nameX +
      '" y="334" text-anchor="' +
      anchor +
      '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="20" fill="' +
      colors.muted +
      '">' +
      escapeSvg(config.profile.institution) +
      "</text>" +
      (email
        ? '<text x="' +
          nameX +
          '" y="412" text-anchor="' +
          anchor +
          '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="18" fill="' +
          colors.muted +
          '">' +
          escapeSvg(email) +
          "</text>"
        : "") +
      guideLayer(guides, 0, 0) +
      "</svg>"
    );
  }

  function backSvg(config, variant, guides) {
    var colors = palette(config, variant);
    var qrX = variant === "centred-premium" ? 320 : 560;
    var qrY = variant === "centred-premium" ? 145 : 142;
    var textX = variant === "centred-premium" ? 425 : 68;
    var textAnchor = variant === "centred-premium" ? "middle" : "start";
    var website = displayUrl(trim(config.contact.website) || trim(config.links.publicUrl));
    var email = trim(config.contact.email);

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      CARD_WIDTH +
      " " +
      CARD_HEIGHT +
      '" role="img" aria-label="Back of Jack Tinsley business card">' +
      '<rect width="850" height="550" rx="28" fill="' +
      colors.background +
      '"/>' +
      '<circle cx="164" cy="116" r="78" fill="' +
      colors.blue +
      '" fill-opacity="0.16"/>' +
      '<circle cx="232" cy="410" r="10" fill="' +
      colors.green +
      '" fill-opacity="0.82"/>' +
      '<circle cx="674" cy="94" r="9" fill="' +
      colors.pink +
      '" fill-opacity="0.86"/>' +
      '<line x1="118" y1="154" x2="284" y2="208" stroke="' +
      colors.line +
      '" stroke-width="2"/>' +
      '<line x1="196" y1="334" x2="282" y2="420" stroke="' +
      colors.line +
      '" stroke-width="2"/>' +
      qrPlaceholder(qrX, qrY, QR_SIZE, colors.qrFill, colors.qrBackground) +
      '<text x="' +
      textX +
      '" y="' +
      (variant === "centred-premium" ? 84 : 176) +
      '" text-anchor="' +
      textAnchor +
      '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="' +
      (variant === "centred-premium" ? 18 : 22) +
      '" letter-spacing="3.4" fill="' +
      colors.muted +
      '">' +
      escapeSvg(config.profile.name.toUpperCase()) +
      "</text>" +
      '<text x="' +
      textX +
      '" y="' +
      (variant === "centred-premium" ? 118 : 214) +
      '" text-anchor="' +
      textAnchor +
      '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="' +
      (variant === "centred-premium" ? 36 : 40) +
      '" font-weight="700" fill="' +
      colors.text +
      '">Scan to open digital card</text>' +
      '<text x="' +
      textX +
      '" y="' +
      (variant === "centred-premium" ? 432 : 264) +
      '" text-anchor="' +
      textAnchor +
      '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="22" fill="' +
      colors.text +
      '">Save contact \u00b7 View CV \u00b7 Connect</text>' +
      (website
        ? '<text x="' +
          textX +
          '" y="' +
          (variant === "centred-premium" ? 470 : 422) +
          '" text-anchor="' +
          textAnchor +
          '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="19" fill="' +
          colors.muted +
          '">' +
          escapeSvg(website) +
          "</text>"
        : "") +
      (email
        ? '<text x="' +
          textX +
          '" y="' +
          (variant === "centred-premium" ? 500 : 454) +
          '" text-anchor="' +
          textAnchor +
          '" font-family="Avenir Next, Segoe UI, sans-serif" font-size="17" fill="' +
          colors.muted +
          '">' +
          escapeSvg(email) +
          "</text>"
        : "") +
      guideLayer(guides, qrX, qrY) +
      "</svg>"
    );
  }

  function renderCard(root, markup) {
    root.innerHTML = markup;
  }

  function exportSvg(filename, markup) {
    window.CardSystem.downloadText(filename, markup, "image/svg+xml;charset=utf-8");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.getAttribute("data-page") !== "card-preview") {
      return;
    }

    var sourceConfig = window.CardSystem.hasDraft()
      ? window.CardSystem.getDraftConfig()
      : window.CardSystem.getBaseConfig();
    var config = window.CardSystem.deepClone(sourceConfig);
    var frontRoot = document.getElementById("front-card-preview");
    var backRoot = document.getElementById("back-card-preview");
    var layoutSelect = document.getElementById("preview-layout");
    var status = document.getElementById("preview-status");

    layoutSelect.value = config.layout.physicalCardVariant;

    function guides() {
      return {
        bleed: document.getElementById("guide-bleed").checked,
        safe: document.getElementById("guide-safe").checked,
        centre: document.getElementById("guide-centre").checked,
        qr: document.getElementById("guide-qr").checked
      };
    }

    function redraw() {
      config.layout.physicalCardVariant = layoutSelect.value;
      renderCard(frontRoot, frontSvg(config, config.layout.physicalCardVariant, guides()));
      renderCard(backRoot, backSvg(config, config.layout.physicalCardVariant, guides()));
      status.textContent =
        "Previewing " + config.layout.physicalCardVariant + " with current guide settings.";
    }

    document
      .querySelectorAll("#preview-layout, #guide-bleed, #guide-safe, #guide-centre, #guide-qr")
      .forEach(function (control) {
        control.addEventListener("change", redraw);
      });

    document.getElementById("export-front").addEventListener("click", function () {
      exportSvg(
        "jack-tinsley-card-front.svg",
        frontSvg(config, layoutSelect.value, {
          bleed: false,
          safe: false,
          centre: false,
          qr: false
        })
      );
      status.textContent = "Front card SVG exported.";
    });

    document.getElementById("export-back").addEventListener("click", function () {
      exportSvg(
        "jack-tinsley-card-back.svg",
        backSvg(config, layoutSelect.value, {
          bleed: false,
          safe: false,
          centre: false,
          qr: false
        })
      );
      status.textContent = "Back card SVG exported.";
    });

    redraw();
  });
})();
