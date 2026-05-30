const fs = require("fs");
const { test, expect } = require("./fixtures");
const { saveScreenshot } = require("./helpers");

test.describe("manual screenshot capture", () => {
  test("capture index screenshots at review sizes", async ({ page }, testInfo) => {
    const project = testInfo.project.name;
    const fileNames = {
      "mobile-360": "index-mobile-360.png",
      "mobile-390": "index-mobile-390.png",
      "mobile-430": "index-mobile-430.png",
      "desktop-1280": "index-desktop-1280.png"
    };

    test.skip(!fileNames[project], "This capture only runs on the requested index review widths.");

    await page.goto("/index.html");
    await expect(page.getByRole("img", { name: "Jack Tinsley business card" })).toBeVisible();

    const screenshotPath = await saveScreenshot(page, fileNames[project]);
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });

  test("capture editor desktop screenshot", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "Editor screenshot only needs one desktop capture."
    );

    await page.goto("/editor.html");
    await expect(page.getByRole("heading", { name: "Digital business card controls" })).toBeVisible();

    const screenshotPath = await saveScreenshot(page, "editor-desktop-1280.png");
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });

  test("capture card preview screenshots for desktop and one mobile pass", async ({
    page
  }, testInfo) => {
    const project = testInfo.project.name;
    const fileName =
      project === "desktop-1280"
        ? "card-preview-desktop-1280.png"
        : project === "mobile-390"
          ? "card-preview-mobile-390.png"
          : null;

    test.skip(!fileName, "Card preview capture only runs on one desktop and one mobile width.");

    await page.goto("/card-preview.html");
    await expect(page.getByRole("heading", { name: "Physical business card preview" })).toBeVisible();

    const screenshotPath = await saveScreenshot(page, fileName);
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });
});
