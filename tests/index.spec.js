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

const MOBILE_PROJECTS = new Set(["mobile-360", "mobile-390", "mobile-430"]);

test.describe("public digital card", () => {
  test("index page loads with core identity and prominent CV action", async ({
    page,
    qa
  }) => {
    await page.goto("/index.html");

    await expect(page.getByRole("heading", { name: "Jack Tinsley" })).toBeVisible();
    await expect(page.getByText("Interdisciplinary Practitioner")).toBeVisible();
    await expect(page.getByText("Problem Solving · Adaptability · Efficiency")).toHaveCount(0);

    const cvButton = page.locator('[data-action-key="viewCv"]');
    await expect(cvButton).toBeVisible();
    await expect(cvButton).toHaveAttribute("data-variant", "primary");
  });

  test("blank public fields are hidden when config values are empty", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-390",
      "Blank-field visibility only needs one representative browser pass."
    );

    await page.goto("/index.html");

    await expect(page.getByRole("link", { name: "Email Jack" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveCount(1);
    await expect(page.locator('[data-action-key="copyEmail"]')).toHaveCount(0);
    await expect(page.locator('[data-action-key="copyPhone"]')).toHaveCount(0);
    await expect(page.locator('[data-action-key="copyWebsite"]')).toHaveCount(1);
    await expect(page.locator(".manual-copy-panel")).toBeHidden();
  });

  test("CV button points to the bundled PDF and the file is reachable", async ({
    page,
    request
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "CV path and file fetch only need one representative pass."
    );

    await page.goto("/index.html");

    const cvButton = page.locator('[data-action-key="viewCv"]');
    const href = await cvButton.getAttribute("href");

    expect(href).toBe("assets/jack-tinsley-cv.pdf");
    expect(fs.existsSync(path.join(process.cwd(), href))).toBe(true);

    const response = await request.get(`http://127.0.0.1:4173/${href}`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/pdf");
  });

  test("Add to Contacts generates a vCard without blank email or phone fields", async ({
    page
  }, testInfo) => {
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
    expect(downloads[0].content).toContain("FN:Jack Tinsley");
    expect(downloads[0].content).toContain("TITLE:Interdisciplinary Practitioner");
    expect(downloads[0].content).toContain("ORG:London Interdisciplinary School");
    expect(downloads[0].content).not.toContain("EMAIL;TYPE=INTERNET:");
    expect(downloads[0].content).not.toContain("TEL;TYPE=CELL:");
  });

  test("copy action falls back gracefully when clipboard access is unavailable", async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-390",
      "Clipboard fallback only needs one representative browser pass."
    );

    await forceClipboardFailure(page);
    await page.goto("/index.html");

    await page.locator('[data-action-key="copyAll"]').click();

    await expect(page.locator("#manual-copy-panel")).toBeVisible();
    await expect(page.locator("#manual-copy-value")).toHaveValue(/Jack Tinsley/);
    await expect(page.locator("#page-status")).toContainText(
      /Clipboard access unavailable here|Clipboard access failed/
    );
  });

  test("mobile layouts avoid horizontal scrolling and clipped primary actions", async ({
    page
  }, testInfo) => {
    test.skip(!MOBILE_PROJECTS.has(testInfo.project.name), "Mobile assertions only run on mobile projects.");

    await page.goto("/index.html");

    await assertNoHorizontalScroll(page, expect);
    await assertWithinViewport(page.locator(".hero-card"), page, expect);

    const primaryActions = page.locator(".action-grid--primary .button");
    const actionCount = await primaryActions.count();
    expect(actionCount).toBeGreaterThan(1);

    for (let index = 0; index < actionCount; index += 1) {
      await assertWithinViewport(primaryActions.nth(index), page, expect);
      await expect(primaryActions.nth(index)).toBeVisible();
    }
  });

  test("desktop layout uses the immersive shell without horizontal scroll", async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "Desktop layout only needs one representative browser pass."
    );

    await page.goto("/index.html");

    await assertNoHorizontalScroll(page, expect);
    const shellBox = await page.locator(".page-shell-card").boundingBox();
    const viewport = page.viewportSize();
    expect(shellBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(shellBox.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(shellBox.width).toBeLessThanOrEqual(viewport.width + 1);

    await expect(page.locator(".resource-grid")).toBeVisible();
    await expect(page.locator(".site-footer")).toContainText("No tracking. No cookies. Static page only.");
  });
});
