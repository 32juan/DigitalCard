const { test: base, expect } = require("@playwright/test");

const test = base.extend({
  qa: [
    async ({ page }, use) => {
      const consoleErrors = [];
      const pageErrors = [];
      const requestFailures = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });
      page.on("pageerror", (error) => {
        pageErrors.push(error.message);
      });
      page.on("requestfailed", (request) => {
        const failure = request.failure();
        requestFailures.push(
          `${request.method()} ${request.url()} :: ${failure ? failure.errorText : "unknown"}`
        );
      });

      await use({ consoleErrors, pageErrors, requestFailures });

      expect(
        consoleErrors,
        consoleErrors.length
          ? `Console errors:\n${consoleErrors.join("\n")}`
          : "No console errors"
      ).toEqual([]);
      expect(
        pageErrors,
        pageErrors.length
          ? `Uncaught page errors:\n${pageErrors.join("\n")}`
          : "No uncaught page errors"
      ).toEqual([]);
      expect(
        requestFailures,
        requestFailures.length
          ? `Failed requests:\n${requestFailures.join("\n")}`
          : "No failed requests"
      ).toEqual([]);
    },
    { auto: true }
  ]
});

module.exports = { test, expect };
