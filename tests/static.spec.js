const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

test("static project files and references are present", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1280", "Static sanity only needs one pass.");

  const root = process.cwd();
  const requiredFiles = [
    "index.html",
    "config.js",
    "script.js",
    "styles.css",
    "editor.html",
    "editor.js",
    "card-preview.html",
    "card-preview.js",
    "README.md",
    "assets/jack-tinsley-cv.pdf",
    "assets/jack-tinsley.vcf",
    "assets/qr-code.svg",
    "assets/placeholder-avatar.svg"
  ];

  requiredFiles.forEach((file) => {
    expect(fs.existsSync(path.join(root, file)), `${file} should exist`).toBe(true);
  });

  const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const editorHtml = fs.readFileSync(path.join(root, "editor.html"), "utf8");
  const previewHtml = fs.readFileSync(path.join(root, "card-preview.html"), "utf8");
  const configText = fs.readFileSync(path.join(root, "config.js"), "utf8");
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const vcard = fs.readFileSync(path.join(root, "assets/jack-tinsley.vcf"), "utf8");

  expect(indexHtml).toContain("config.js");
  expect(indexHtml).toContain("script.js");
  expect(indexHtml).toContain("styles.css");
  expect(editorHtml).toContain("editor.js");
  expect(previewHtml).toContain("card-preview.js");

  expect(configText).toContain("window.CARD_CONFIG");
  expect(configText).toContain("profile");
  expect(configText).toContain("contact");
  expect(configText).toContain("links");
  expect(configText).toContain("theme");
  expect(configText).toContain("layout");
  expect(configText).toContain("meta");

  expect(vcard).toContain("BEGIN:VCARD");
  expect(vcard).toContain("VERSION:3.0");
  expect(vcard).toContain("FN:Jack Tinsley");
  expect(readme).toContain("Testing and QA");
});
