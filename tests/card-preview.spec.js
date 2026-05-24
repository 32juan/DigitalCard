const { test, expect } = require("./fixtures");
const {
  installBrowserDownloadCapture,
  getCapturedDownloads,
  clearCapturedDownloads
} = require("./helpers");

test.describe("card preview", () => {
  test("front and back previews render with QR placeholder and guide controls", async ({
    page
  }, testInfo) => {
    test.skip(
      !["desktop-1280", "mobile-390"].includes(testInfo.project.name),
      "Preview interaction is only checked on representative desktop and mobile widths."
    );

    await page.goto("/card-preview.html");

    await expect(page.locator("#front-card-preview svg")).toBeVisible();
    await expect(page.locator("#back-card-preview svg")).toBeVisible();
    await expect(page.locator("#front-card-preview")).toContainText("Jack Tinsley");
    await expect(page.locator('#back-card-preview [data-qa="qr-placeholder"]')).toHaveCount(1);

    await expect(page.locator('#front-card-preview [data-guide="safe"]')).toHaveCount(1);
    await page.locator("#guide-safe").uncheck();
    await expect(page.locator('#front-card-preview [data-guide="safe"]')).toHaveCount(0);

    await expect(page.locator('#front-card-preview [data-guide="centre"]')).toHaveCount(0);
    await page.locator("#guide-centre").check();
    await expect(page.locator('#front-card-preview [data-guide="centre"]')).toHaveCount(2);
  });

  test("layout switching updates the preview and SVG exports are generated", async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "Layout switching and SVG export only need one representative desktop pass."
    );

    await installBrowserDownloadCapture(page);
    await page.goto("/card-preview.html");

    const beforeMarkup = await page.locator("#front-card-preview").innerHTML();
    await page.locator("#preview-layout").selectOption("dark-reverse");
    await expect(page.locator("#preview-status")).toContainText("dark-reverse");

    const afterMarkup = await page.locator("#front-card-preview").innerHTML();
    expect(afterMarkup).not.toBe(beforeMarkup);

    await page.getByRole("button", { name: "Export front SVG" }).click();
    let downloads = await getCapturedDownloads(page);
    expect(downloads).toHaveLength(1);
    expect(downloads[0].filename).toBe("jack-tinsley-card-front.svg");
    expect(downloads[0].mimeType).toContain("image/svg+xml");
    expect(downloads[0].content).toContain("<svg");

    await clearCapturedDownloads(page);
    await page.getByRole("button", { name: "Export back SVG" }).click();
    downloads = await getCapturedDownloads(page);
    expect(downloads).toHaveLength(1);
    expect(downloads[0].filename).toBe("jack-tinsley-card-back.svg");
    expect(downloads[0].content).toContain('data-qa="qr-placeholder"');
  });
});
