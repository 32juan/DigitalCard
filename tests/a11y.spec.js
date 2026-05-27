const AxeBuilder = require("@axe-core/playwright").default;
const { test, expect } = require("./fixtures");

function seriousViolations(violations) {
  return violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact || "")
  );
}

test.describe("accessibility basics", () => {
  test("public page has named primary actions, keyboard focus, and no serious axe issues", async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-390",
      "Accessibility basics on the public page only need one representative mobile pass."
    );

    await page.goto("/index.html");

    await expect(page.getByRole("button", { name: "Add to Contacts" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View CV" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy All Details" })).toBeVisible();

    await page.keyboard.press("Tab");
    const addToContacts = page.getByRole("button", { name: "Add to Contacts" });
    await expect(addToContacts).toBeFocused();

    const outline = await addToContacts.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth
      };
    });
    expect(outline.outlineStyle).not.toBe("none");
    expect(outline.outlineWidth).not.toBe("0px");

    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results.violations)).toEqual([]);
  });

  test("editor and card preview controls pass basic serious axe checks", async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1280",
      "Desktop is the clearest place to assess editor and preview controls."
    );

    await page.goto("/editor.html");
    await expect(page.getByRole("button", { name: "Export config.js" })).toBeVisible();
    let results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results.violations)).toEqual([]);

    await page.goto("/card-preview.html");
    await expect(page.getByRole("button", { name: "Export front SVG" })).toBeVisible();
    results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results.violations)).toEqual([]);
  });
});
