const fs = require("fs");
const path = require("path");
const { test, expect } = require("./fixtures");
const {
  installBrowserDownloadCapture,
  getCapturedDownloads,
  forceClipboardFailure,
  assertNoHorizontalScroll,
  assertWithinViewport
} = require("./helpers");

const RESPONSIVE_PROJECTS = new Set(["mobile-360", "mobile-390", "mobile-430", "tablet-768"]);

test.describe("public digital card", () => {
  test("index page loads as a simple card with only required actions", async ({ page }) => {
    await page.goto("/index.html");

    await expect(page.getByRole("img", { name: "Jack Tinsley business card" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Jack Tinsley" })).toBeVisible();
    await expect(page.getByText("interdisciplinary practitioner")).toBeVisible();
    await expect(page.locator(".action-group--primary .button:visible")).toHaveCount(2);
    await expect(page.locator(".action-group--secondary .button:visible")).toHaveCount(2);
    await expect(page.locator(".action-group--utility .button:visible")).toHaveCount(3);
    await expect(page.locator('[data-action-key="email"]')).toHaveClass(/button--primary/);
    await expect(page.locator('[data-action-key="viewCv"]')).toHaveClass(/button--primary/);
    await expect(page.getByRole("button", { name: "Add to Contacts" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View / Download CV" })).toBeVisible();
    await expect(page.getByRole("link", { name: "LinkedIn" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Email" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Website" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy All Details" })).toBeVisible();
    await expect(page.getByText("Static digital card. No tracking. No cookies.")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Other work" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Selected profile" })).toHaveCount(0);
    await expect(page.getByText("Ready to share")).toHaveCount(0);
    await expect(page.locator(".resource-grid")).toHaveCount(0);
  });

  test("links are populated from config", async ({ page, request }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "Link and file checks only need one representative pass."
    );

    await page.goto("/index.html");

    const cvHref = await page.locator('[data-action-key="viewCv"]').getAttribute("href");
    const linkedInHref = await page.locator('[data-action-key="linkedIn"]').getAttribute("href");
    const emailHref = await page.locator('[data-action-key="email"]').getAttribute("href");

    expect(cvHref).toBe("assets/jack-tinsley-cv.pdf");
    expect(linkedInHref).toBe("https://www.linkedin.com/in/jacktinsley0");
    expect(emailHref).toBe("mailto:jacktinsley0@outlook.com");
    expect(fs.existsSync(path.join(process.cwd(), cvHref))).toBe(true);

    const response = await request.get(`http://127.0.0.1:4173/${cvHref}`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/pdf");
  });

  test("Add to Contacts generates a valid vCard download", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-390",
      "Generated vCard content only needs one representative browser pass."
    );

    await installBrowserDownloadCapture(page);
    await page.goto("/index.html");
    await page.getByRole("button", { name: "Add to Contacts" }).click();

    const downloads = await getCapturedDownloads(page);
    expect(downloads).toHaveLength(1);
    expect(downloads[0].filename).toBe("jack-tinsley.vcf");
    expect(downloads[0].mimeType).toContain("text/vcard");
    expect(downloads[0].content).toContain("BEGIN:VCARD\r\nVERSION:3.0");
    expect(downloads[0].content).toContain("FN:Jack Tinsley");
    expect(downloads[0].content).toContain("TITLE:interdisciplinary practitioner");
    expect(downloads[0].content).toContain("EMAIL;TYPE=INTERNET:jacktinsley0@outlook.com");
    expect(downloads[0].content).toContain("TEL;TYPE=CELL:+44 7404 607171");
    expect(downloads[0].content).toContain(
      "X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/jacktinsley0"
    );
  });

  test("copy buttons provide success feedback", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-390",
      "Clipboard behavior only needs one representative browser pass."
    );

    await page.addInitScript(() => {
      window.__copiedText = [];
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText(value) {
            window.__copiedText.push(value);
            return Promise.resolve();
          }
        }
      });
    });

    await page.goto("/index.html");
    await page.locator('[data-action-key="copyEmail"]').click();
    await expect(page.locator("#page-status")).toContainText("Email copied.");
    expect(await page.evaluate(() => window.__copiedText[window.__copiedText.length - 1])).toBe(
      "jacktinsley0@outlook.com"
    );

    await page.locator('[data-action-key="copyWebsite"]').click();

    await expect(page.locator("#page-status")).toContainText("Website copied.");
  });

  test("copy action falls back gracefully when clipboard and execCommand fail", async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-390",
      "Clipboard fallback only needs one representative browser pass."
    );

    await forceClipboardFailure(page);
    await page.addInitScript(() => {
      document.execCommand = () => false;
    });
    await page.goto("/index.html");

    await page.locator('[data-action-key="copyAll"]').click();

    await expect(page.locator("#manual-copy-panel")).toBeVisible();
    await expect(page.locator("#manual-copy-value")).toHaveValue(/Jack Tinsley/);
    await expect(page.locator("#manual-copy-value")).toHaveValue(/interdisciplinary practitioner/);
    await expect(page.locator("#manual-copy-value")).toHaveValue(/Email: jacktinsley0@outlook.com/);
    await expect(page.locator("#manual-copy-value")).toHaveValue(/Phone: \+44 7404 607171/);
    await expect(page.locator("#manual-copy-value")).toHaveValue(
      /LinkedIn: https:\/\/www\.linkedin\.com\/in\/jacktinsley0/
    );
    await expect(page.locator("#page-status")).toContainText("Copy failed");
  });

  test("responsive layouts avoid horizontal scrolling and clipped actions", async ({
    page
  }, testInfo) => {
    test.skip(
      !RESPONSIVE_PROJECTS.has(testInfo.project.name),
      "Responsive assertions run on mobile and tablet projects."
    );

    await page.goto("/index.html");

    await assertNoHorizontalScroll(page, expect);
    await assertWithinViewport(page.locator(".digital-card"), page, expect);
    await assertWithinViewport(page.locator(".business-card-box"), page, expect);

    const actions = page.locator(".actions .button:visible");
    const actionCount = await actions.count();
    expect(actionCount).toBe(7);

    for (let index = 0; index < actionCount; index += 1) {
      await assertWithinViewport(actions.nth(index), page, expect);
      await expect(actions.nth(index)).toBeVisible();
    }
  });

  test("desktop layout stays centered and controlled", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "Desktop layout only needs one representative browser pass."
    );

    await page.goto("/index.html");

    await assertNoHorizontalScroll(page, expect);

    const shellBox = await page.locator(".site-shell").boundingBox();
    const actionsBox = await page.locator(".actions").boundingBox();
    const imageBox = await page.locator(".business-card-box").boundingBox();

    expect(shellBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect(imageBox).not.toBeNull();
    expect(shellBox.width).toBeLessThanOrEqual(641);
    expect(actionsBox.width).toBeLessThanOrEqual(481);
    expect(imageBox.width).toBeLessThanOrEqual(569);
  });
});
