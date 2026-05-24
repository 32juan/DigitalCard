const { test, expect } = require("./fixtures");
const {
  installBrowserDownloadCapture,
  getCapturedDownloads,
  clearCapturedDownloads
} = require("./helpers");

test.describe("local editor", () => {
  test("editor loads config values and updates the live preview", async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "Editor interaction is easiest to verify at desktop width."
    );

    await page.goto("/editor.html");

    await expect(page.locator('input[data-path="profile.name"]')).toHaveValue("Jack Tinsley");
    await expect(page.locator('input[data-path="profile.title"]')).toHaveValue(
      "Interdisciplinary Practitioner"
    );

    const titleField = page.locator('input[data-path="profile.title"]');
    await titleField.fill("Systems & Operations Practitioner");

    await expect(page.locator("#editor-preview-root")).toContainText(
      "Systems & Operations Practitioner"
    );
    await expect(page.locator("#editor-status")).toContainText("Draft saved locally");
  });

  test("editor exports an updated config.js and fallback vCard", async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "Editor export only needs one representative browser pass."
    );

    await installBrowserDownloadCapture(page);
    await page.goto("/editor.html");

    await page.locator('input[data-path="profile.title"]').fill("Systems & Operations Practitioner");
    await page.getByRole("button", { name: "Export config.js" }).click();

    let downloads = await getCapturedDownloads(page);
    expect(downloads).toHaveLength(1);
    expect(downloads[0].filename).toBe("config.js");
    expect(downloads[0].mimeType).toContain("application/javascript");
    expect(downloads[0].content).toContain("Systems & Operations Practitioner");

    await clearCapturedDownloads(page);
    await page.getByRole("button", { name: "Export .vcf" }).click();

    downloads = await getCapturedDownloads(page);
    expect(downloads).toHaveLength(1);
    expect(downloads[0].filename).toBe("jack-tinsley.vcf");
    expect(downloads[0].content).toContain("FN:Jack Tinsley");
    expect(downloads[0].content).toContain("TITLE:Systems & Operations Practitioner");
  });
});
