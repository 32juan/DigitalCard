const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.join(process.cwd(), "test-results", "screenshots");

async function installBrowserDownloadCapture(page) {
  await page.addInitScript(() => {
    window.__qaDownloadClicks = [];
    window.__qaBlobMap = {};

    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = function patchedCreateObjectURL(blob) {
      const url = originalCreateObjectURL(blob);
      Promise.resolve(typeof blob.text === "function" ? blob.text() : "")
        .then((content) => {
          window.__qaBlobMap[url] = {
            content,
            mimeType: blob.type || "",
            size: blob.size || 0
          };
        })
        .catch(() => {
          window.__qaBlobMap[url] = {
            content: "",
            mimeType: blob.type || "",
            size: blob.size || 0
          };
        });
      return url;
    };

    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function patchedAnchorClick() {
      if (this.hasAttribute("download")) {
        window.__qaDownloadClicks.push({
          filename: this.download || "",
          href: this.href || ""
        });
      }
      return originalAnchorClick.apply(this, arguments);
    };
  });
}

async function getCapturedDownloads(page) {
  await page.waitForTimeout(100);
  return page.evaluate(() => {
    const clicks = window.__qaDownloadClicks || [];
    const map = window.__qaBlobMap || {};
    return clicks.map((click) => ({
      filename: click.filename,
      href: click.href,
      content: map[click.href] ? map[click.href].content : "",
      mimeType: map[click.href] ? map[click.href].mimeType : "",
      size: map[click.href] ? map[click.href].size : 0
    }));
  });
}

async function clearCapturedDownloads(page) {
  await page.evaluate(() => {
    window.__qaDownloadClicks = [];
    window.__qaBlobMap = {};
  });
}

async function forceClipboardFailure(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText() {
          return Promise.reject(new Error("Clipboard unavailable in QA"));
        }
      }
    });
  });
}

async function assertNoHorizontalScroll(page, expect) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(
    Math.max(metrics.clientWidth, metrics.innerWidth) + 1
  );
}

async function assertWithinViewport(locator, page, expect) {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
}

async function saveScreenshot(page, fileName) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const target = path.join(SCREENSHOT_DIR, fileName);
  await page.screenshot({ path: target, fullPage: true });
  return target;
}

module.exports = {
  SCREENSHOT_DIR,
  installBrowserDownloadCapture,
  getCapturedDownloads,
  clearCapturedDownloads,
  forceClipboardFailure,
  assertNoHorizontalScroll,
  assertWithinViewport,
  saveScreenshot
};
